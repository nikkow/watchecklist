import { z } from 'astro/zod';

/** Season or episode number, zero-padded to two digits so ids sort and never change form. */
const paddedNumber = String.raw`(?:0\d|[1-9]\d+)`;
const tmdbNumber = String.raw`[1-9]\d*`;

const episodeIdPattern = new RegExp(`^tv:${tmdbNumber}:s${paddedNumber}e${paddedNumber}$`);
const movieIdPattern = new RegExp(`^movie:${tmdbNumber}$`);
const coverIdPattern = new RegExp(`^(?:tv|movie):${tmdbNumber}$`);
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Editorial text: one string when both locales read the same (proper names), else one per locale. */
const text = z.union([
  z.string().trim().min(1),
  z.strictObject({ en: z.string().trim().min(1), fr: z.string().trim().min(1) }),
]);

const itemId = z.string().refine((id) => episodeIdPattern.test(id) || movieIdPattern.test(id), {
  message: 'Expected tv:<tmdbId>:sXXeYY or movie:<tmdbId>',
});

const item = z.union([
  itemId,
  z.strictObject({
    id: itemId,
    importance: z.enum(['essential', 'recommended', 'optional']).default('essential'),
    crossover: z.string().regex(slugPattern).optional(),
    note: text.optional(),
  }),
]);

/** GitHub user names, without "@", compared case-insensitively as GitHub does. */
const githubHandles = z
  .array(
    z
      .string()
      .regex(/^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i, 'Expected a GitHub user name without "@"'),
  )
  .refine((handles) => new Set(handles.map((h) => h.toLowerCase())).size === handles.length, {
    message: 'Duplicate GitHub user name',
  });

const section = z.strictObject({
  title: text,
  note: text.optional(),
  items: z.array(item).min(1),
});

/**
 * One hand-curated watch order, as written in `data/lists/<slug>.yaml`.
 *
 * Items are TMDB ids only: titles, dates and images come from TMDB at build time and are
 * never written here. A bare id is an essential item. Items of one crossover must follow
 * each other, and every declared crossover must be used. Authors wrote the list; curators
 * keep it up to date. Both are named by their GitHub user name, for credit.
 */
export const listSchema = z
  .strictObject({
    title: text,
    description: text,
    authors: githubHandles.min(1),
    curators: githubHandles.default([]),
    cover: z.strictObject({
      backdrop: z.string().regex(coverIdPattern, 'Expected tv:<tmdbId> or movie:<tmdbId>'),
      focus: z
        .string()
        .regex(/^\d{1,3}% \d{1,3}%$/, 'Expected "<x>% <y>%"')
        .optional(),
    }),
    crossovers: z.record(z.string().regex(slugPattern), text).default({}),
    sections: z.array(section).min(1),
  })
  .superRefine((list, ctx) => {
    const seen = new Set<string>();
    const used = new Set<string>();
    let previousCrossover: string | undefined;

    list.sections.forEach((section, sectionIndex) => {
      section.items.forEach((entry, itemIndex) => {
        const path = ['sections', sectionIndex, 'items', itemIndex];
        const { id, crossover } = typeof entry === 'string' ? { id: entry } : entry;

        if (seen.has(id)) ctx.addIssue({ code: 'custom', path, message: `Duplicate item ${id}` });
        seen.add(id);

        if (crossover !== undefined) {
          if (!(crossover in list.crossovers)) {
            ctx.addIssue({ code: 'custom', path, message: `Unknown crossover ${crossover}` });
          } else if (used.has(crossover) && previousCrossover !== crossover) {
            ctx.addIssue({
              code: 'custom',
              path,
              message: `Crossover ${crossover} is split: its items must follow each other`,
            });
          }
          used.add(crossover);
        }
        previousCrossover = crossover;
      });
    });

    for (const crossover of Object.keys(list.crossovers)) {
      if (!used.has(crossover)) {
        ctx.addIssue({
          code: 'custom',
          path: ['crossovers', crossover],
          message: `Crossover ${crossover} has no items`,
        });
      }
    }
  });

/** A list after validation, with defaults applied. */
export type List = z.output<typeof listSchema>;

/** Whether a list file name, without its extension, is a valid slug. */
export function isListSlug(slug: string): boolean {
  return slugPattern.test(slug);
}

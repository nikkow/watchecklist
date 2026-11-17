import type { Locale } from './locales';

/** Localized paths of the static pages, one entry per locale. */
export const pages = {
  home: { en: '/en/', fr: '/fr/' },
  about: { en: '/en/about/', fr: '/fr/a-propos/' },
} as const satisfies Record<string, Record<Locale, string>>;

export type PageKey = keyof typeof pages;

/** One page's path in every locale, for its canonical URL, hreflang links and language menu. */
export type Alternates = Readonly<Record<Locale, string>>;

const listSegment: Record<Locale, string> = { en: 'lists', fr: 'listes' };

/**
 * Builds the localized path of a page.
 *
 * @param page - Key of the static page.
 * @param locale - Target locale.
 * @returns Absolute path with a trailing slash.
 */
export function pagePath(page: PageKey, locale: Locale): string {
  return pages[page][locale];
}

/**
 * Builds the localized path of a watch list (`/en/lists/<slug>/`, `/fr/listes/<slug>/`).
 *
 * @param slug - List slug, shared by every locale.
 * @param locale - Target locale.
 * @returns Absolute path with a trailing slash.
 */
export function listPath(slug: string, locale: Locale): string {
  return `/${locale}/${listSegment[locale]}/${slug}/`;
}

/**
 * Builds the paths of a watch list in every locale.
 *
 * @param slug - List slug, shared by every locale.
 * @returns The list path per locale.
 */
export function listAlternates(slug: string): Alternates {
  return { en: listPath(slug, 'en'), fr: listPath(slug, 'fr') };
}

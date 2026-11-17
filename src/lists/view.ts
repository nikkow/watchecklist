import type { Dictionary, Locale } from '../i18n/index.ts';
import type { Catalog, TitleImages } from '../tmdb/catalog.ts';
import { episodeCode, parseId } from './ids.ts';
import type { List, ListText } from './schema.ts';
import type { BlockView, ItemView, ListView, SectionView, SeriesView } from './view-types.ts';

/** One list item once its title is resolved, before it is laid out. */
interface ResolvedItem extends ItemView {
  crossover: string | null;
  /** Show and season, such as `tv:1412` and 3, for the section's seasons line; null for a film. */
  season: { key: string; number: number } | null;
  date: string | null;
}

/**
 * Prepares a list for rendering in one locale.
 *
 * @param slug - List slug.
 * @param list - Validated list.
 * @param catalog - TMDB catalog from `pnpm sync:tmdb`.
 * @param locale - Locale of the page.
 * @param t - Dictionary of that locale.
 * @returns Everything the list page shows.
 * @throws When a title is missing from the catalog, which means the sync is out of date.
 */
export function buildListView(
  slug: string,
  list: List,
  catalog: Catalog,
  locale: Locale,
  t: Dictionary,
): ListView {
  const titles = new Map<string, { name: string; images: TitleImages }>();
  const title = (key: string) => {
    const known = titles.get(key);
    if (known) return known;
    const entry = key.startsWith('tv:') ? catalog.shows[key] : catalog.movies[key];
    if (!entry) throw new Error(`${key} is missing from the TMDB catalog: run pnpm sync:tmdb.`);
    const resolved = { name: entry.name[locale], images: entry };
    titles.set(key, resolved);
    return resolved;
  };

  const sections = list.sections.map((section) =>
    section.items.map((entry): ResolvedItem => {
      const { id, importance, crossover, note } =
        typeof entry === 'string'
          ? { id: entry, importance: 'essential' as const, crossover: undefined, note: undefined }
          : entry;
      const parsed = parseId(id);
      const key = parsed.type === 'movie' ? `movie:${parsed.movieId}` : `tv:${parsed.showId}`;
      const { name, images } = title(key);
      const episode = parsed.type === 'episode' ? episodeCode(parsed.season, parsed.episode) : null;
      const code = episode?.toUpperCase() ?? null;
      return {
        id,
        seriesKey: key,
        label: code ?? name,
        seriesName: code ? name : t.list.movie,
        fullName: code ? `${name} ${code}` : name,
        poster: images.poster,
        importance,
        importanceLabel: t.list.importance[importance],
        note: note === undefined ? null : localize(note, locale),
        inCrossover: crossover !== undefined,
        crossoverHint: null,
        crossover: crossover ?? null,
        season: parsed.type === 'episode' ? { key, number: parsed.season } : null,
        date:
          episode === null
            ? (catalog.movies[key]?.releaseDate ?? null)
            : (catalog.shows[key]?.episodes[episode]?.airDate ?? null),
      };
    }),
  );

  addCrossoverHints(sections.flat(), list, locale, t);

  const items = sections.flat();
  const series: SeriesView[] = [...new Set(items.map((item) => item.seriesKey))].map((key) => ({
    key,
    name: title(key).name,
    poster: title(key).images.poster,
  }));
  const cover = title(list.cover.backdrop);

  return {
    slug,
    title: localize(list.title, locale),
    description: localize(list.description, locale),
    cover: { image: cover.images.backdrop, focus: list.cover.focus ?? '50% 50%' },
    stats: stats(items, list, t),
    series,
    sections: list.sections.map((section, index): SectionView => ({
      title: localize(section.title, locale),
      note: section.note === undefined ? null : localize(section.note, locale),
      seasons: seasonsLine(sections[index] ?? [], (key) => title(key).name),
      blocks: blocks(sections[index] ?? [], list, locale, t),
      itemCount: sections[index]?.length ?? 0,
    })),
    itemCount: items.length,
    authors: list.authors,
    curators: list.curators,
  };
}

/**
 * Picks the text of a locale.
 *
 * @param text - One string for every locale, or one per locale.
 * @param locale - Wanted locale.
 * @returns The text to show.
 */
export function localize(text: ListText, locale: Locale): string {
  return typeof text === 'string' ? text : text[locale];
}

/**
 * Writes, on each crossover item, how it leads to the next part.
 *
 * @param items - Every item of the list, in order.
 * @param list - The list, for crossover names.
 * @param locale - Locale of the page.
 * @param t - Dictionary of that locale.
 */
function addCrossoverHints(items: ResolvedItem[], list: List, locale: Locale, t: Dictionary): void {
  for (const [slug, name] of Object.entries(list.crossovers)) {
    const parts = items.filter((item) => item.crossover === slug);
    const title = localize(name, locale);
    parts.forEach((item, index) => {
      const next = parts[index + 1];
      item.crossoverHint = next
        ? t.list.crossoverNext(index + 1, parts.length, title, next.fullName)
        : t.list.crossoverLast(title);
    });
  }
}

/**
 * Groups consecutive items of one crossover so they render as one block.
 *
 * @param items - Items of a section, in order.
 * @param list - The list, for crossover names.
 * @param locale - Locale of the page.
 * @param t - Dictionary of that locale.
 * @returns The section's blocks.
 */
function blocks(items: ResolvedItem[], list: List, locale: Locale, t: Dictionary): BlockView[] {
  const result: BlockView[] = [];
  for (const resolved of items) {
    const item = toItemView(resolved);
    const last = result.at(-1);
    if (resolved.crossover === null) {
      result.push({ type: 'item', item });
    } else if (last?.type === 'crossover' && last.slug === resolved.crossover) {
      last.items.push(item);
    } else {
      result.push({ type: 'crossover', slug: resolved.crossover, header: '', items: [item] });
    }
  }
  for (const block of result) {
    if (block.type !== 'crossover') continue;
    const name = localize(list.crossovers[block.slug] ?? block.slug, locale);
    block.header = t.list.crossoverHeader(name, block.items.length);
  }
  return result;
}

/**
 * Drops the fields only used while building the view.
 *
 * @param item - A resolved item.
 * @returns The item as the page sees it.
 */
function toItemView(item: ResolvedItem): ItemView {
  return {
    id: item.id,
    seriesKey: item.seriesKey,
    label: item.label,
    seriesName: item.seriesName,
    fullName: item.fullName,
    poster: item.poster,
    importance: item.importance,
    importanceLabel: item.importanceLabel,
    note: item.note,
    inCrossover: item.crossover !== null,
    crossoverHint: item.crossoverHint,
  };
}

/**
 * Names the show seasons a section covers, in order of first appearance.
 *
 * @param items - Items of a section.
 * @param nameOf - Name of a title id.
 * @returns Such as "Arrow 3 · The Flash 1"; films appear by name.
 */
function seasonsLine(items: ResolvedItem[], nameOf: (key: string) => string): string {
  const seasons = new Map<string, Set<number>>();
  for (const item of items) {
    const set = seasons.get(item.seriesKey) ?? new Set<number>();
    if (item.season) set.add(item.season.number);
    seasons.set(item.seriesKey, set);
  }
  return [...seasons]
    .map(([key, numbers]) =>
      [nameOf(key), ...(numbers.size ? [[...numbers].join(', ')] : [])].join(' '),
    )
    .join(' · ');
}

/**
 * Summarizes the list: series, crossovers, episodes, films and the years they span.
 *
 * @param items - Every item of the list.
 * @param list - The list.
 * @param t - Dictionary of the page locale.
 * @returns Summary pieces, empty counts left out.
 */
function stats(items: ResolvedItem[], list: List, t: Dictionary): string[] {
  const shows = new Set(items.filter((item) => item.season).map((item) => item.seriesKey));
  const episodes = items.filter((item) => item.season).length;
  const movies = items.length - episodes;
  const crossovers = Object.keys(list.crossovers).length;
  const years = items
    .map((item) => item.date?.slice(0, 4))
    .filter((year): year is string => Boolean(year))
    .sort();
  return [
    shows.size ? t.list.series(shows.size) : null,
    crossovers ? t.list.crossovers(crossovers) : null,
    episodes ? t.list.episodes(episodes) : null,
    movies ? t.list.movies(movies) : null,
    years.length ? t.list.years(years[0] ?? '', years.at(-1) ?? '') : null,
  ].filter((piece): piece is string => piece !== null);
}

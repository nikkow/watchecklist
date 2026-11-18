import { episodeCode, parseId } from '../lists/ids.ts';
import type { List } from '../lists/schema.ts';
import type { Episode, LocalizedName, Movie, Show, TitleImages } from './catalog.ts';
import { backdropSize, posterSize } from './constants.ts';
import { orNotFound } from './errors.ts';
import type { TmdbImagePaths, TmdbMovie, TmdbSeason, TmdbShow } from './responses.ts';
import type { References, SyncResult, TmdbClient } from './types.ts';

/**
 * Collects the TMDB ids every list references.
 *
 * @param lists - Validated lists.
 * @returns Shows with their referenced episodes, movies, and the cover ids.
 */
export function collectReferences(lists: Iterable<List>): References {
  const references: References = { shows: new Map(), movies: new Set(), covers: new Set() };
  for (const list of lists) {
    references.covers.add(list.cover.backdrop);
    addReference(references, list.cover.backdrop);
    for (const section of list.sections) {
      for (const entry of section.items) {
        addReference(references, typeof entry === 'string' ? entry : entry.id);
      }
    }
  }
  return references;
}

/**
 * Records one item or cover id in the references.
 *
 * @param references - References being collected.
 * @param id - A list item or cover id.
 */
function addReference(references: References, id: string): void {
  const parsed = parseId(id);
  if (parsed.type === 'movie') {
    references.movies.add(parsed.movieId);
    return;
  }
  const seasons = references.shows.get(parsed.showId) ?? new Map<number, Set<number>>();
  references.shows.set(parsed.showId, seasons);
  if (parsed.type === 'show') return;
  const episodes = seasons.get(parsed.season) ?? new Set<number>();
  seasons.set(parsed.season, episodes.add(parsed.episode));
}

/**
 * Fetches the catalog for the referenced titles.
 *
 * @param references - Output of {@link collectReferences}.
 * @param client - TMDB client.
 * @returns The catalog, the images to download and what TMDB does not know.
 * @throws TMDB errors other than a missing title, such as an invalid token.
 */
export async function buildCatalog(
  references: References,
  client: TmdbClient,
): Promise<SyncResult> {
  const result: SyncResult = { catalog: { shows: {}, movies: {} }, images: [], problems: [] };

  const shows = [...references.shows].map(async ([id, referenced]) => {
    const key = `tv:${id}`;
    const details = await getInBothLocales<TmdbShow>(client, `/tv/${id}`);
    if (details === null) {
      result.problems.push(`${key} is not on TMDB`);
      return;
    }
    const [en, fr] = details;
    const show: Show = {
      name: localizedName(en.name, fr.name, en.original_name),
      ...queueImages(result, key, en, references.covers.has(key)),
      episodes: {},
    };
    const seasons = await Promise.all(
      [...referenced.keys()].map((season) =>
        getInBothLocales<TmdbSeason>(client, `/tv/${id}/season/${season}`),
      ),
    );
    const known = new Map<string, Episode>();
    for (const [en, fr] of seasons.filter((season) => season !== null)) {
      const french = new Map(fr.episodes.map((episode) => [episode.episode_number, episode.name]));
      for (const episode of en.episodes) {
        known.set(episodeCode(episode.season_number, episode.episode_number), {
          airDate: episode.air_date || null,
          name: episodeName(episode.name, french.get(episode.episode_number) ?? ''),
          runtime: episode.runtime || null,
        });
      }
    }
    const codes = [...referenced].flatMap(([season, episodes]) =>
      [...episodes].map((episode) => episodeCode(season, episode)),
    );
    for (const code of codes.sort()) {
      const episode = known.get(code);
      if (episode === undefined) result.problems.push(`${key}:${code} is not on TMDB`);
      else show.episodes[code] = episode;
    }
    result.catalog.shows[key] = show;
  });

  const movies = [...references.movies].map(async (id) => {
    const key = `movie:${id}`;
    const details = await getInBothLocales<TmdbMovie>(client, `/movie/${id}`);
    if (details === null) {
      result.problems.push(`${key} is not on TMDB`);
      return;
    }
    const [en, fr] = details;
    const movie: Movie = {
      name: localizedName(en.title, fr.title, en.original_title),
      releaseDate: en.release_date || null,
      runtime: en.runtime || null,
      ...queueImages(result, key, en, references.covers.has(key)),
    };
    result.catalog.movies[key] = movie;
  });

  await Promise.all([...shows, ...movies]);
  result.catalog.shows = sortByKey(result.catalog.shows);
  result.catalog.movies = sortByKey(result.catalog.movies);
  result.images.sort((a, b) => a.fileName.localeCompare(b.fileName));
  result.problems.sort();
  return result;
}

/**
 * Reads one TMDB resource in English and in French.
 *
 * @param client - TMDB client.
 * @param path - Resource path, such as `/tv/1412`.
 * @returns The English and French responses, or null when TMDB does not know the resource.
 */
async function getInBothLocales<T>(client: TmdbClient, path: string): Promise<[T, T] | null> {
  const [en, fr] = await Promise.all([
    orNotFound(client.get<T>(path, { language: 'en-US' })),
    orNotFound(client.get<T>(path, { language: 'fr-FR' })),
  ]);
  return en === null || fr === null ? null : [en, fr];
}

/**
 * Builds a localized name, using the original name where TMDB has no translation.
 *
 * @param en - English name.
 * @param fr - French name.
 * @param original - Name in the original language.
 * @returns The name in both site locales.
 */
function localizedName(en: string, fr: string, original: string): LocalizedName {
  return { en: en || original, fr: fr || original };
}

/**
 * Builds an episode's localized title. TMDB fills untranslated French titles with
 * "Épisode <n>", which says nothing: those fall back to the English title, as missing ones do.
 *
 * @param en - English title.
 * @param fr - French title, possibly empty or generic.
 * @returns The title in both site locales.
 */
export function episodeName(en: string, fr: string): LocalizedName {
  const untranslated = fr.trim() === '' || /^[ÉE]pisode\s+\d+$/i.test(fr.trim());
  return { en, fr: untranslated ? en : fr };
}

/**
 * Queues the poster, and the backdrop of a cover, for download.
 *
 * A cover without a backdrop is reported as a problem, since its list would have no image.
 *
 * @param result - Sync result receiving the downloads and problems.
 * @param key - Title id, such as `tv:1412`.
 * @param paths - TMDB image paths of the title.
 * @param isCover - Whether a list uses the title as its cover.
 * @returns The local file names of the queued images.
 */
function queueImages(
  result: SyncResult,
  key: string,
  paths: TmdbImagePaths,
  isCover: boolean,
): TitleImages {
  if (isCover && paths.backdrop_path === null) {
    result.problems.push(`${key} has no backdrop for its list cover`);
  }
  const queue = (filePath: string | null, kind: string, size: string): string | null => {
    if (filePath === null) return null;
    const extension = filePath.slice(filePath.lastIndexOf('.'));
    const fileName = `${key.replace(':', '-')}-${kind}${extension}`;
    result.images.push({ fileName, filePath, size });
    return fileName;
  };
  return {
    poster: queue(paths.poster_path, 'poster', posterSize),
    backdrop: isCover ? queue(paths.backdrop_path, 'backdrop', backdropSize) : null,
  };
}

/**
 * Sorts a record by key, so the generated catalog is stable from one sync to the next.
 *
 * @param record - Record to sort.
 * @returns A copy with sorted keys.
 */
function sortByKey<T>(record: Record<string, T>): Record<string, T> {
  return Object.fromEntries(Object.entries(record).sort(([a], [b]) => a.localeCompare(b)));
}

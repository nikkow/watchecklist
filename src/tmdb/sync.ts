import { episodeCode, parseId } from '../lists/ids.ts';
import type { List } from '../lists/schema.ts';
import type { Catalog, LocalizedName, Movie, Show } from './catalog.ts';
import type { TmdbClient } from './client.ts';
import { orNotFound } from './errors.ts';
import type { TmdbMovie, TmdbSeason, TmdbShow } from './responses.ts';

export const posterSize = 'w342';
export const backdropSize = 'w1280';

/** What the lists point at on TMDB. */
export interface References {
  /** Episode numbers per season number, per show id. */
  shows: Map<number, Map<number, Set<number>>>;
  movies: Set<number>;
  /** Cover ids (`tv:<id>` or `movie:<id>`), whose backdrops are downloaded. */
  covers: Set<string>;
}

/** An image to download into `src/generated/tmdb/images/`. */
export interface ImageDownload {
  fileName: string;
  filePath: string;
  size: string;
}

export interface SyncResult {
  catalog: Catalog;
  images: ImageDownload[];
  /** Referenced titles or episodes TMDB does not know. */
  problems: string[];
}

/**
 * Collects the TMDB ids every list references.
 *
 * @param lists - Validated lists.
 */
export function collectReferences(lists: Iterable<List>): References {
  const references: References = { shows: new Map(), movies: new Set(), covers: new Set() };
  for (const list of lists) {
    references.covers.add(list.cover.backdrop);
    addTitle(references, list.cover.backdrop);
    for (const section of list.sections) {
      for (const entry of section.items)
        addTitle(references, typeof entry === 'string' ? entry : entry.id);
    }
  }
  return references;
}

function addTitle(references: References, id: string): void {
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
 * @returns The catalog, the images to download and the references TMDB does not know.
 */
export async function buildCatalog(
  references: References,
  client: TmdbClient,
  now: Date = new Date(),
): Promise<SyncResult> {
  const result: SyncResult = {
    catalog: { generatedAt: now.toISOString(), shows: {}, movies: {} },
    images: [],
    problems: [],
  };

  const shows = [...references.shows].map(async ([id, referenced]) => {
    const key = `tv:${id}`;
    const [en, fr] = await Promise.all([
      orNotFound(client.get<TmdbShow>(`/tv/${id}`, { language: 'en-US' })),
      orNotFound(client.get<TmdbShow>(`/tv/${id}`, { language: 'fr-FR' })),
    ]);
    if (en === null || fr === null) {
      result.problems.push(`${key} is not on TMDB`);
      return;
    }
    const show: Show = {
      name: localized(en.name, fr.name, en.original_name),
      ...images(result, key, en, references.covers.has(key)),
      episodes: {},
    };
    const seasons = [...referenced.keys()];
    const aired = await Promise.all(
      seasons.map((season) =>
        orNotFound(client.get<TmdbSeason>(`/tv/${id}/season/${season}`, { language: 'en-US' })),
      ),
    );
    const known = new Map(
      aired.flatMap((season) =>
        (season?.episodes ?? []).map((episode) => [
          episodeCode(episode.season_number, episode.episode_number),
          episode.air_date || null,
        ]),
      ),
    );
    const codes = [...referenced].flatMap(([season, episodes]) =>
      [...episodes].map((episode) => episodeCode(season, episode)),
    );
    for (const code of codes.sort()) {
      if (!known.has(code)) result.problems.push(`${key}:${code} is not on TMDB`);
      else show.episodes[code] = { airDate: known.get(code) ?? null };
    }
    result.catalog.shows[key] = show;
  });

  const movies = [...references.movies].map(async (id) => {
    const key = `movie:${id}`;
    const [en, fr] = await Promise.all([
      orNotFound(client.get<TmdbMovie>(`/movie/${id}`, { language: 'en-US' })),
      orNotFound(client.get<TmdbMovie>(`/movie/${id}`, { language: 'fr-FR' })),
    ]);
    if (en === null || fr === null) {
      result.problems.push(`${key} is not on TMDB`);
      return;
    }
    const movie: Movie = {
      title: localized(en.title, fr.title, en.original_title),
      releaseDate: en.release_date || null,
      ...images(result, key, en, references.covers.has(key)),
    };
    result.catalog.movies[key] = movie;
  });
  await Promise.all([...shows, ...movies]);

  result.catalog.shows = sortKeys(result.catalog.shows);
  result.catalog.movies = sortKeys(result.catalog.movies);
  result.images.sort((a, b) => a.fileName.localeCompare(b.fileName));
  result.problems.sort();
  return result;
}

function localized(en: string, fr: string, original: string): LocalizedName {
  return { en: en || original, fr: fr || original };
}

/** Queues the poster, and the backdrop for a cover, and returns their local file names. */
function images(
  result: SyncResult,
  key: string,
  title: { poster_path: string | null; backdrop_path: string | null },
  isCover: boolean,
): { poster: string | null; backdrop: string | null } {
  if (isCover && title.backdrop_path === null) {
    result.problems.push(`${key} has no backdrop for its list cover`);
  }
  const slug = key.replace(':', '-');
  const queue = (filePath: string | null, kind: string, size: string): string | null => {
    if (filePath === null) return null;
    const fileName = `${slug}-${kind}${filePath.slice(filePath.lastIndexOf('.'))}`;
    result.images.push({ fileName, filePath, size });
    return fileName;
  };
  return {
    poster: queue(title.poster_path, 'poster', posterSize),
    backdrop: isCover ? queue(title.backdrop_path, 'backdrop', backdropSize) : null,
  };
}

function sortKeys<T>(record: Record<string, T>): Record<string, T> {
  return Object.fromEntries(Object.entries(record).sort(([a], [b]) => a.localeCompare(b)));
}

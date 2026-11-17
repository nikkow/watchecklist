import type { Catalog } from './catalog.ts';

export type Fetch = typeof fetch;

export interface TmdbClient {
  /** Reads one API resource, such as `/tv/1412`, as JSON. */
  get: <T>(path: string, params?: Record<string, string>) => Promise<T>;
  /** Downloads one image from its TMDB `file_path` at the given width, such as `w342`. */
  image: (filePath: string, size: string) => Promise<Uint8Array>;
}

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
  /** Referenced titles or episodes TMDB does not know, and covers without a backdrop. */
  problems: string[];
}

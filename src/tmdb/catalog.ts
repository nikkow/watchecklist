/**
 * TMDB metadata for every title the lists reference, written at build time by
 * `pnpm sync:tmdb` into `src/generated/tmdb/` and never committed.
 *
 * Episode titles and overviews are left out on purpose: lists stay spoiler-free and an
 * episode code is enough to find it.
 */
export interface Catalog {
  /** Keyed by `tv:<tmdbId>`. */
  shows: Record<string, Show>;
  /** Keyed by `movie:<tmdbId>`. */
  movies: Record<string, Movie>;
}

/** A name in both site locales; the French one falls back to the original name. */
export interface LocalizedName {
  en: string;
  fr: string;
}

/** Image file names in `src/generated/tmdb/images/`. */
export interface TitleImages {
  poster: string | null;
  /** Downloaded only when a list uses the title as its cover. */
  backdrop: string | null;
}

export interface Show extends TitleImages {
  name: LocalizedName;
  /** Only the episodes the lists reference, keyed by `sXXeYY`. */
  episodes: Record<string, Episode>;
}

export interface Episode {
  /** ISO date, null when TMDB has none yet. */
  airDate: string | null;
}

export interface Movie extends TitleImages {
  name: LocalizedName;
  releaseDate: string | null;
}

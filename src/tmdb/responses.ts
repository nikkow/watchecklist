/** The fields of TMDB API responses the sync reads; TMDB sends many more. */

export interface TmdbImagePaths {
  poster_path: string | null;
  backdrop_path: string | null;
}

export interface TmdbShow extends TmdbImagePaths {
  name: string;
  original_name: string;
}

export interface TmdbSeason {
  episodes: { season_number: number; episode_number: number; air_date: string | null }[];
}

export interface TmdbMovie extends TmdbImagePaths {
  title: string;
  original_title: string;
  release_date: string;
}

import type { ParsedId } from './id-types.ts';

/** Season or episode number, zero-padded to two digits so ids sort and never change form. */
const paddedNumber = String.raw`(0\d|[1-9]\d+)`;
const tmdbNumber = String.raw`([1-9]\d*)`;

export const episodeIdPattern = new RegExp(`^tv:${tmdbNumber}:s${paddedNumber}e${paddedNumber}$`);
export const movieIdPattern = new RegExp(`^movie:${tmdbNumber}$`);
export const showIdPattern = new RegExp(`^tv:${tmdbNumber}$`);

/**
 * Parses an item or cover id.
 *
 * @param id - `tv:<tmdbId>:sXXeYY`, `tv:<tmdbId>` or `movie:<tmdbId>`.
 * @returns Its parts as numbers.
 * @throws When the id has none of these forms; lists are validated first, so this is a bug.
 */
export function parseId(id: string): ParsedId {
  const episode = episodeIdPattern.exec(id);
  if (episode) {
    const [, showId, season, number] = episode.map(Number);
    return {
      type: 'episode',
      showId: showId as number,
      season: season as number,
      episode: number as number,
    };
  }
  const show = showIdPattern.exec(id);
  if (show) return { type: 'show', showId: Number(show[1]) };
  const movie = movieIdPattern.exec(id);
  if (movie) return { type: 'movie', movieId: Number(movie[1]) };
  throw new Error(`Not a list id: ${id}`);
}

/**
 * Formats an episode code the way ids write it.
 *
 * @param season - Season number, 0 for specials.
 * @param episode - Episode number in the season.
 * @returns The code, such as `s03e08` or `s100e01`.
 */
export function episodeCode(season: number, episode: number): string {
  return `s${String(season).padStart(2, '0')}e${String(episode).padStart(2, '0')}`;
}

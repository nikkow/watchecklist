export const apiBase = 'https://api.themoviedb.org/3';
export const imageBase = 'https://image.tmdb.org/t/p';

/** Tries per call, the first one included. */
export const maxAttempts = 4;
/** TMDB calls in flight, well under its documented rate limit. */
export const maxInFlight = 6;
/** Time allowed for one call, body included, before it is retried. */
export const timeoutMs = 15_000;

export const posterSize = 'w342';
export const backdropSize = 'w1280';

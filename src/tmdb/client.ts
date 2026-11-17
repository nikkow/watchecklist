import { TmdbError } from './errors.ts';

const apiBase = 'https://api.themoviedb.org/3';
const imageBase = 'https://image.tmdb.org/t/p';
const maxAttempts = 4;

export type Fetch = typeof fetch;

export interface TmdbClient {
  /** Reads one API resource, such as `/tv/1412`, as JSON. */
  get: <T>(path: string, params?: Record<string, string>) => Promise<T>;
  /** Downloads one image from its TMDB `file_path` at the given width, such as `w342`. */
  image: (filePath: string, size: string) => Promise<Uint8Array>;
}

/**
 * Creates a TMDB client authenticated with a v4 read access token.
 *
 * Rate-limited (429) and server error responses are retried with a growing delay, as TMDB
 * asks; any other error status is thrown.
 *
 * @param token - TMDB API read access token.
 * @param fetchImpl - Fetch implementation, replaced in tests.
 * @param wait - Delay implementation, replaced in tests.
 */
export function createTmdbClient(
  token: string,
  fetchImpl: Fetch = fetch,
  wait: (ms: number) => Promise<void> = (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
): TmdbClient {
  async function request(url: string, headers: Record<string, string>): Promise<Response> {
    for (let attempt = 1; ; attempt += 1) {
      const response = await fetchImpl(url, { headers });
      if (response.ok) return response;
      const retryable = response.status === 429 || response.status >= 500;
      if (!retryable || attempt === maxAttempts) {
        throw new TmdbError(response.status, url.replace(apiBase, ''));
      }
      const retryAfter = Number(response.headers.get('retry-after'));
      await wait(retryAfter > 0 ? retryAfter * 1000 : 500 * attempt);
    }
  }

  return {
    async get<T>(path: string, params: Record<string, string> = {}): Promise<T> {
      const query = new URLSearchParams(params).toString();
      const url = `${apiBase}${path}${query ? `?${query}` : ''}`;
      const response = await request(url, {
        accept: 'application/json',
        authorization: `Bearer ${token}`,
      });
      return (await response.json()) as T;
    },
    async image(filePath: string, size: string): Promise<Uint8Array> {
      const response = await request(`${imageBase}/${size}${filePath}`, {});
      return new Uint8Array(await response.arrayBuffer());
    },
  };
}

/**
 * Maps items with at most `limit` calls in flight, keeping the input order.
 *
 * @param items - Inputs.
 * @param limit - Highest number of pending calls.
 * @param map - Async mapping.
 * @returns The mapped values, in input order.
 */
export async function mapWithLimit<T, R>(
  items: readonly T[],
  limit: number,
  map: (item: T) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let next = 0;
  async function worker(): Promise<void> {
    while (next < items.length) {
      const index = next;
      next += 1;
      results[index] = await map(items[index] as T);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

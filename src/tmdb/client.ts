import { TmdbError } from './errors.ts';
import { createLimiter } from './limiter.ts';

const apiBase = 'https://api.themoviedb.org/3';
const imageBase = 'https://image.tmdb.org/t/p';
const maxAttempts = 4;
/** TMDB calls in flight, well under its documented rate limit. */
const maxInFlight = 6;
/** Time allowed for one call, body included, before it is retried. */
const timeoutMs = 15_000;

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
 * At most six calls are in flight at once. Network failures, timeouts, rate-limited (429) and
 * server error responses are retried with a growing delay, as TMDB asks; any other error
 * status is thrown.
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
  const limit = createLimiter(maxInFlight);

  function request<T>(
    url: string,
    headers: Record<string, string>,
    read: (response: Response) => Promise<T>,
  ): Promise<T> {
    return limit(() => send(url, headers, read));
  }

  async function send<T>(
    url: string,
    headers: Record<string, string>,
    read: (response: Response) => Promise<T>,
  ): Promise<T> {
    for (let attempt = 1; ; attempt += 1) {
      const last = attempt === maxAttempts;
      let response: Response;
      try {
        response = await fetchImpl(url, { headers, signal: AbortSignal.timeout(timeoutMs) });
        if (response.ok) return await read(response);
      } catch (error) {
        if (last) throw error;
        await wait(500 * attempt);
        continue;
      }
      const retryable = response.status === 429 || response.status >= 500;
      if (!retryable || last) throw new TmdbError(response.status, url.replace(apiBase, ''));
      const retryAfter = Number(response.headers.get('retry-after'));
      await wait(retryAfter > 0 ? retryAfter * 1000 : 500 * attempt);
    }
  }

  return {
    async get<T>(path: string, params: Record<string, string> = {}): Promise<T> {
      const query = new URLSearchParams(params).toString();
      const url = `${apiBase}${path}${query ? `?${query}` : ''}`;
      const headers = { accept: 'application/json', authorization: `Bearer ${token}` };
      return request(url, headers, async (response) => (await response.json()) as T);
    },
    async image(filePath: string, size: string): Promise<Uint8Array> {
      return request(
        `${imageBase}/${size}${filePath}`,
        {},
        async (response) => new Uint8Array(await response.arrayBuffer()),
      );
    },
  };
}

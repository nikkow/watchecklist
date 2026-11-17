import { describe, expect, it, vi } from 'vitest';
import { createTmdbClient, mapWithLimit, type Fetch } from './client';

function respond(
  status: number,
  body: unknown = {},
  headers: Record<string, string> = {},
): Response {
  return new Response(JSON.stringify(body), { status, headers });
}

describe('createTmdbClient', () => {
  it('sends the token and the query string', async () => {
    const fetchMock = vi.fn<Fetch>().mockResolvedValue(respond(200, { name: 'Arrow' }));
    const client = createTmdbClient('secret', fetchMock);

    await expect(client.get('/tv/1412', { language: 'fr-FR' })).resolves.toEqual({ name: 'Arrow' });
    const [url, init] = fetchMock.mock.calls[0] ?? [];
    expect(url).toBe('https://api.themoviedb.org/3/tv/1412?language=fr-FR');
    expect(init?.headers).toMatchObject({ authorization: 'Bearer secret' });
  });

  it('retries a rate-limited call after the delay TMDB asks for', async () => {
    const fetchMock = vi
      .fn<Fetch>()
      .mockResolvedValueOnce(respond(429, {}, { 'retry-after': '2' }))
      .mockResolvedValueOnce(respond(200, { ok: true }));
    const wait = vi.fn(() => Promise.resolve());

    await expect(createTmdbClient('t', fetchMock, wait).get('/tv/1')).resolves.toEqual({
      ok: true,
    });
    expect(wait).toHaveBeenCalledWith(2000);
  });

  it('throws on a missing title without retrying', async () => {
    const fetchMock = vi.fn<Fetch>().mockResolvedValue(respond(404));

    await expect(createTmdbClient('t', fetchMock).get('/tv/9')).rejects.toThrow(
      'TMDB 404 for /tv/9',
    );
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('gives up after repeated server errors', async () => {
    const fetchMock = vi.fn<Fetch>().mockImplementation(() => Promise.resolve(respond(503)));

    await expect(
      createTmdbClient('t', fetchMock, () => Promise.resolve()).get('/tv/1'),
    ).rejects.toThrow('TMDB 503');
    expect(fetchMock).toHaveBeenCalledTimes(4);
  });
});

describe('mapWithLimit', () => {
  it('keeps the input order and the concurrency limit', async () => {
    let running = 0;
    let peak = 0;
    const result = await mapWithLimit([30, 10, 20, 0], 2, async (delay) => {
      running += 1;
      peak = Math.max(peak, running);
      await new Promise((resolve) => setTimeout(resolve, delay));
      running -= 1;
      return delay * 2;
    });

    expect(result).toEqual([60, 20, 40, 0]);
    expect(peak).toBe(2);
  });
});

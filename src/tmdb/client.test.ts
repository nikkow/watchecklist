import { describe, expect, it, vi } from 'vitest';
import { createTmdbClient, type Fetch } from './client';

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

describe('createTmdbClient concurrency', () => {
  it('keeps at most six calls in flight', async () => {
    let running = 0;
    let peak = 0;
    const fetchMock = vi.fn<Fetch>().mockImplementation(async () => {
      running += 1;
      peak = Math.max(peak, running);
      await new Promise((resolve) => setTimeout(resolve, 5));
      running -= 1;
      return respond(200);
    });
    const client = createTmdbClient('t', fetchMock);

    await Promise.all(Array.from({ length: 20 }, (_, i) => client.get(`/tv/${i}`)));
    expect(fetchMock).toHaveBeenCalledTimes(20);
    expect(peak).toBe(6);
  });
});

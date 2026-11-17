import { describe, expect, it } from 'vitest';
import { listSchema } from '../lists/schema';
import type { TmdbClient } from './client';
import { TmdbError } from './errors';
import { buildCatalog, collectReferences } from './sync';

const list = listSchema.parse({
  title: 'Test',
  description: 'Test',
  authors: ['nikkow'],
  cover: { backdrop: 'tv:1' },
  sections: [
    {
      title: 'A',
      items: [
        'tv:1:s01e01',
        'tv:1:s01e02',
        'tv:1:s02e01',
        'tv:1:s100e01',
        'tv:2:s01e01',
        'movie:7',
        'movie:8',
      ],
    },
  ],
});

/** Answers like TMDB for one show and one movie, with a 404 for anything else. */
const fakeClient: TmdbClient = {
  get: <T>(path: string, params: Record<string, string> = {}) => {
    const french = params['language'] === 'fr-FR';
    const responses: Record<string, unknown> = {
      '/tv/1': {
        name: french ? '' : 'The Show',
        original_name: 'The Show',
        poster_path: '/poster.jpg',
        backdrop_path: '/backdrop.jpg',
      },
      '/tv/1/season/1': {
        episodes: [
          { season_number: 1, episode_number: 1, air_date: '2012-10-10' },
          { season_number: 1, episode_number: 2, air_date: '' },
        ],
      },
      '/tv/1/season/100': {
        episodes: [{ season_number: 100, episode_number: 1, air_date: '2030-01-01' }],
      },
      '/movie/7': {
        title: french ? 'Le Film' : 'The Movie',
        original_title: 'The Movie',
        release_date: '2020-01-01',
        poster_path: null,
        backdrop_path: '/movie-backdrop.png',
      },
      '/tv/3': {
        name: 'No Backdrop',
        original_name: 'No Backdrop',
        poster_path: null,
        backdrop_path: null,
      },
    };
    const response = responses[path];
    return response === undefined
      ? Promise.reject(new TmdbError(404, path))
      : Promise.resolve(response as T);
  },
  image: () => Promise.resolve(new Uint8Array()),
};

describe('collectReferences', () => {
  it('groups episodes by show and keeps covers apart', () => {
    const references = collectReferences([list]);
    expect(references.shows.get(1)).toEqual(
      new Map([
        [1, new Set([1, 2])],
        [2, new Set([1])],
        [100, new Set([1])],
      ]),
    );
    expect([...references.movies]).toEqual([7, 8]);
    expect([...references.covers]).toEqual(['tv:1']);
  });
});

describe('buildCatalog', () => {
  it('builds the catalog, queues images and reports what TMDB does not know', async () => {
    const result = await buildCatalog(collectReferences([list]), fakeClient);

    expect(result.catalog).toEqual({
      shows: {
        'tv:1': {
          name: { en: 'The Show', fr: 'The Show' },
          poster: 'tv-1-poster.jpg',
          backdrop: 'tv-1-backdrop.jpg',
          episodes: {
            s01e01: { airDate: '2012-10-10' },
            s01e02: { airDate: null },
            s100e01: { airDate: '2030-01-01' },
          },
        },
      },
      movies: {
        'movie:7': {
          title: { en: 'The Movie', fr: 'Le Film' },
          releaseDate: '2020-01-01',
          poster: null,
          backdrop: null,
        },
      },
    });
    expect(result.images).toEqual([
      { fileName: 'tv-1-backdrop.jpg', filePath: '/backdrop.jpg', size: 'w1280' },
      { fileName: 'tv-1-poster.jpg', filePath: '/poster.jpg', size: 'w342' },
    ]);
    expect(result.problems).toEqual([
      'movie:8 is not on TMDB',
      'tv:1:s02e01 is not on TMDB',
      'tv:2 is not on TMDB',
    ]);
  });

  it('reports a list cover without a backdrop', async () => {
    const references = collectReferences([{ ...list, cover: { backdrop: 'tv:3' }, sections: [] }]);
    const result = await buildCatalog(references, fakeClient);
    expect(result.problems).toEqual(['tv:3 has no backdrop for its list cover']);
  });
});

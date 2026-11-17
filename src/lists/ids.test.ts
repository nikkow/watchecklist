import { describe, expect, it } from 'vitest';
import { episodeCode, parseId } from './ids';

describe('parseId', () => {
  it.each([
    ['tv:1412:s03e08', { type: 'episode', showId: 1412, season: 3, episode: 8 }],
    ['tv:1412:s00e01', { type: 'episode', showId: 1412, season: 0, episode: 1 }],
    ['tv:1412:s100e123', { type: 'episode', showId: 1412, season: 100, episode: 123 }],
    ['tv:1412', { type: 'show', showId: 1412 }],
    ['movie:7', { type: 'movie', movieId: 7 }],
  ])('parses %s', (id, parsed) => {
    expect(parseId(id)).toEqual(parsed);
  });

  it('throws on an id lists never hold', () => {
    expect(() => parseId('tv:1412:s3e8')).toThrow('Not a list id');
  });
});

describe('episodeCode', () => {
  it('pads to two digits and keeps longer numbers', () => {
    expect(episodeCode(0, 1)).toBe('s00e01');
    expect(episodeCode(100, 123)).toBe('s100e123');
  });
});

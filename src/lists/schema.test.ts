import { describe, expect, it } from 'vitest';
import { isListSlug, listSchema } from './schema';

const validList = {
  title: { en: 'Crossovers', fr: 'Les crossovers' },
  description: 'Two series, one event.',
  authors: ['nikkow'],
  cover: { backdrop: 'tv:1412', focus: '50% 32%' },
  crossovers: { event: 'The Event' },
  sections: [
    {
      title: 'Part one',
      items: [
        'movie:299534',
        { id: 'tv:1412:s03e08', crossover: 'event' },
        { id: 'tv:60735:s01e08', crossover: 'event', importance: 'recommended' },
      ],
    },
  ],
};

/** Returns the validation messages for a list built from the valid one. */
function problemsOf(change: (list: typeof validList) => unknown): string[] {
  const result = listSchema.safeParse(change(structuredClone(validList)));
  return result.success ? [] : result.error.issues.map((issue) => issue.message);
}

describe('listSchema', () => {
  it('accepts a valid list and defaults importance to essential', () => {
    const list = listSchema.parse(validList);
    expect(list.sections[0]?.items[1]).toEqual({
      id: 'tv:1412:s03e08',
      crossover: 'event',
      importance: 'essential',
    });
  });

  it.each(['tv:1412:s3e08', 'tv:1412:s03e8', 'tv:01412:s03e08', 'movie:abc', 'tv:1412'])(
    'rejects the item id %s',
    (id) => {
      expect(
        problemsOf((list) => ({ ...list, sections: [{ title: 'A', items: [id] }] })),
      ).not.toEqual([]);
    },
  );

  it('rejects a text missing one locale', () => {
    expect(problemsOf((list) => ({ ...list, title: { en: 'Only English' } }))).not.toEqual([]);
  });

  it('rejects an unknown field', () => {
    expect(problemsOf((list) => ({ ...list, poster: 'tv:1412' }))).not.toEqual([]);
  });

  it('rejects a list without authors', () => {
    expect(problemsOf((list) => ({ ...list, authors: [] }))).not.toEqual([]);
  });

  it.each(['@nikkow', 'nik_kow', '-nikkow', 'nik--kow'])(
    'rejects the GitHub user name %s',
    (handle) => {
      expect(problemsOf((list) => ({ ...list, curators: [handle] }))).not.toEqual([]);
    },
  );

  it('rejects a GitHub user name listed twice, whatever its case', () => {
    expect(problemsOf((list) => ({ ...list, authors: ['nikkow', 'Nikkow'] }))).toEqual([
      'Duplicate GitHub user name',
    ]);
  });

  it('rejects a duplicate item', () => {
    expect(
      problemsOf((list) => ({
        ...list,
        sections: [...list.sections, { title: 'Again', items: ['movie:299534'] }],
      })),
    ).toEqual(['Duplicate item movie:299534']);
  });

  it('rejects an unknown crossover', () => {
    expect(problemsOf((list) => ({ ...list, crossovers: { other: 'Other' } }))).toEqual([
      'Unknown crossover event',
      'Unknown crossover event',
      'Crossover other has no items',
    ]);
  });

  it('rejects a crossover whose items do not follow each other', () => {
    expect(
      problemsOf((list) => {
        list.sections[0]?.items.push('tv:1412:s03e09', {
          id: 'tv:1412:s03e10',
          crossover: 'event',
        });
        return list;
      }),
    ).toEqual(['Crossover event is split: its items must follow each other']);
  });
});

describe('isListSlug', () => {
  it('accepts lowercase dash slugs only', () => {
    expect(isListSlug('arrowverse-crossovers')).toBe(true);
    expect(isListSlug('Arrowverse')).toBe(false);
    expect(isListSlug('arrowverse--crossovers')).toBe(false);
  });
});

import { describe, expect, it } from 'vitest';
import { useTranslations } from '../i18n';
import type { Catalog } from '../tmdb/catalog';
import { listSchema } from './schema';
import { buildListView } from './view';

const list = listSchema.parse({
  title: { en: 'Test universe', fr: 'Univers test' },
  description: 'Two shows and a film.',
  authors: ['nikkow'],
  cover: { backdrop: 'tv:1' },
  crossovers: { meet: 'The Meeting' },
  sections: [
    {
      title: 'Part one',
      items: [
        'tv:1:s01e01',
        { id: 'tv:1:s01e02', crossover: 'meet' },
        { id: 'tv:2:s03e01', crossover: 'meet' },
        { id: 'movie:7', importance: 'optional', note: { en: 'A film.', fr: 'Un film.' } },
      ],
    },
  ],
});

const catalog: Catalog = {
  shows: {
    'tv:1': {
      name: { en: 'Alpha', fr: 'Alpha FR' },
      poster: 'tv-1-poster.jpg',
      backdrop: 'tv-1-backdrop.jpg',
      episodes: { s01e01: { airDate: '2012-10-10' }, s01e02: { airDate: '2012-10-17' } },
    },
    'tv:2': {
      name: { en: 'Beta', fr: 'Beta' },
      poster: null,
      backdrop: null,
      episodes: { s03e01: { airDate: '2014-01-01' } },
    },
  },
  movies: {
    'movie:7': {
      name: { en: 'Gamma', fr: 'Gamma' },
      releaseDate: '2016-05-05',
      poster: null,
      backdrop: null,
    },
  },
};

describe('buildListView', () => {
  const view = buildListView('test', list, catalog, 'en', useTranslations('en'));
  const [section] = view.sections;

  it('summarizes the list', () => {
    expect(view.title).toBe('Test universe');
    expect(view.stats).toEqual(['2 series', '1 crossover', '3 episodes', '1 film', '2012 to 2016']);
    expect(view.cover).toEqual({ image: 'tv-1-backdrop.jpg', focus: '50% 50%' });
    expect(view.series.map((series) => series.name)).toEqual(['Alpha', 'Beta', 'Gamma']);
  });

  it('names the seasons a section covers', () => {
    expect(section?.seasons).toBe('Alpha 1 · Beta 3 · Gamma');
  });

  it('groups a crossover and tells what comes next', () => {
    expect(section?.blocks.map((block) => block.type)).toEqual(['item', 'crossover', 'item']);
    const crossover = section?.blocks[1];
    expect(crossover?.type === 'crossover' && crossover.header).toBe(
      'Crossover The Meeting · 2 episodes back to back',
    );
    expect(crossover?.type === 'crossover' && crossover.items.map((i) => i.crossoverHint)).toEqual([
      'Part 1 of 2 of The Meeting: continue with Beta S03E01.',
      'Last part of The Meeting.',
    ]);
  });

  it('labels episodes by code and films by name', () => {
    const film = section?.blocks[2];
    expect(film?.type === 'item' && film.item).toMatchObject({
      label: 'Gamma',
      seriesName: 'Film',
      importanceLabel: 'Optional',
      note: 'A film.',
    });
    const first = section?.blocks[0];
    expect(first?.type === 'item' && first.item).toMatchObject({
      label: 'S01E01',
      fullName: 'Alpha S01E01',
    });
  });

  it('uses the French names and texts', () => {
    const french = buildListView('test', list, catalog, 'fr', useTranslations('fr'));
    expect(french.title).toBe('Univers test');
    expect(french.series[0]?.name).toBe('Alpha FR');
    expect(french.stats[0]).toBe('2 séries');
  });

  it('fails when the catalog lacks a title', () => {
    expect(() =>
      buildListView('test', list, { shows: {}, movies: {} }, 'en', useTranslations('en')),
    ).toThrow('run pnpm sync:tmdb');
  });
});

import { describe, expect, it } from 'vitest';
import { isVisible, nextRow } from './list-logic';
import type { Filters, Row } from './list-types';

const rows: Row[] = [
  { id: 'a', series: 'tv:1', importance: 'essential', crossover: true },
  { id: 'b', series: 'tv:2', importance: 'optional', crossover: false },
  { id: 'c', series: 'tv:1', importance: 'recommended', crossover: false },
];
const noFilter: Filters = {
  importance: 'all',
  hiddenSeries: new Set(),
  hideWatched: false,
  crossoversOnly: false,
};

describe('isVisible', () => {
  it.each([
    ['all', [true, true, true]],
    ['no-optional', [true, false, true]],
    ['essential', [true, false, false]],
  ] as const)('filters importance %s', (importance, expected) => {
    expect(rows.map((row) => isVisible(row, { ...noFilter, importance }, false))).toEqual(expected);
  });

  it('hides switched-off series and, on demand, watched rows', () => {
    const filters = { ...noFilter, hiddenSeries: new Set(['tv:2']) };
    expect(isVisible(rows[1] as Row, filters, false)).toBe(false);
    expect(isVisible(rows[0] as Row, { ...noFilter, hideWatched: true }, true)).toBe(false);
    expect(isVisible(rows[0] as Row, noFilter, true)).toBe(true);
  });
});

it('keeps only crossover rows on demand', () => {
  const filters = { ...noFilter, crossoversOnly: true };
  expect(rows.map((row) => isVisible(row, filters, false))).toEqual([true, false, false]);
});

describe('nextRow', () => {
  it('skips optional items while others are left', () => {
    expect(nextRow(rows, (id) => id === 'a')?.id).toBe('c');
  });

  it('falls back to optional items, then to nothing', () => {
    expect(nextRow(rows, (id) => id !== 'b')?.id).toBe('b');
    expect(nextRow(rows, () => true)).toBeNull();
  });
});

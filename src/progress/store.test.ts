import { describe, expect, it } from 'vitest';
import { storageKey } from './constants';
import {
  loadProgress,
  parseProgress,
  saveProgress,
  setWatched,
  type ProgressStorage,
} from './store';

function memoryStorage(initial: Record<string, string> = {}): ProgressStorage & {
  values: Record<string, string>;
} {
  const values = { ...initial };
  return {
    values,
    getItem: (key) => values[key] ?? null,
    setItem: (key, value) => {
      values[key] = value;
    },
  };
}

const failingStorage: ProgressStorage = {
  getItem: () => {
    throw new Error('SecurityError');
  },
  setItem: () => {
    throw new Error('QuotaExceededError');
  },
};

describe('parseProgress', () => {
  it('reads a version 1 progress', () => {
    const raw = JSON.stringify({ version: 1, watched: { 'tv:1412:s01e01': true } });
    expect(parseProgress(raw)).toEqual({ version: 1, watched: { 'tv:1412:s01e01': true } });
  });

  it.each([
    ['nothing stored', null],
    ['broken JSON', '{'],
    ['an unknown version', JSON.stringify({ version: 99, watched: {} })],
    ['a wrong shape', JSON.stringify({ version: 1, watched: { 'tv:1:s01e01': 'yes' } })],
    ['a plain value', '42'],
  ])('starts empty from %s', (_case, raw) => {
    expect(parseProgress(raw)).toEqual({ version: 1, watched: {} });
  });
});

describe('storage', () => {
  it('saves and loads under one key', () => {
    const storage = memoryStorage();
    const progress = setWatched(parseProgress(null), 'movie:7', true);

    expect(saveProgress(storage, progress)).toBe(true);
    expect(Object.keys(storage.values)).toEqual([storageKey]);
    expect(loadProgress(storage)).toEqual(progress);
  });

  it('keeps working when storage is unavailable', () => {
    expect(loadProgress(failingStorage)).toEqual({ version: 1, watched: {} });
    expect(saveProgress(failingStorage, parseProgress(null))).toBe(false);
  });
});

describe('setWatched', () => {
  it('ticks and unticks without changing the given progress', () => {
    const empty = parseProgress(null);
    const ticked = setWatched(empty, 'tv:1:s01e01', true);

    expect(empty.watched).toEqual({});
    expect(ticked.watched).toEqual({ 'tv:1:s01e01': true });
    expect(setWatched(ticked, 'tv:1:s01e01', false).watched).toEqual({});
  });
});

import { currentVersion, storageKey } from './constants.ts';
import type { Progress } from './types.ts';

/** The storage calls the store needs; `localStorage` in the browser, a fake in tests. */
export type ProgressStorage = Pick<Storage, 'getItem' | 'setItem'>;

/**
 * Starts an empty progress.
 *
 * @returns Progress with nothing watched.
 */
export function emptyProgress(): Progress {
  return { version: currentVersion, watched: {} };
}

/**
 * Reads stored progress, upgrading it to the current version.
 *
 * Anything unreadable (no value, broken JSON, unknown version or shape) gives an empty progress,
 * so a bad value never breaks the page.
 *
 * @param raw - The stored string, or null when nothing is stored.
 * @returns The progress in the current version.
 */
export function parseProgress(raw: string | null): Progress {
  if (raw === null) return emptyProgress();
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return emptyProgress();
  }
  if (!isProgressV1(data)) return emptyProgress();
  return { version: currentVersion, watched: { ...data.watched } };
}

/**
 * Checks the version 1 shape.
 *
 * @param data - Parsed JSON.
 * @returns Whether it is a version 1 progress.
 */
function isProgressV1(data: unknown): data is Progress {
  if (typeof data !== 'object' || data === null) return false;
  const { version, watched } = data as Record<string, unknown>;
  if (version !== 1 || typeof watched !== 'object' || watched === null) return false;
  return Object.values(watched).every((value) => value === true);
}

/**
 * Loads progress from storage.
 *
 * @param storage - Where progress is kept.
 * @returns The stored progress, or an empty one when storage is unavailable.
 */
export function loadProgress(storage: ProgressStorage): Progress {
  try {
    return parseProgress(storage.getItem(storageKey));
  } catch {
    return emptyProgress();
  }
}

/**
 * Saves progress to storage.
 *
 * @param storage - Where progress is kept.
 * @param progress - Progress to save.
 * @returns Whether it was saved; storage can be full or disabled, as in some private modes.
 */
export function saveProgress(storage: ProgressStorage, progress: Progress): boolean {
  try {
    storage.setItem(storageKey, JSON.stringify(progress));
    return true;
  } catch {
    return false;
  }
}

/**
 * Marks one item as watched or not.
 *
 * @param progress - Current progress, left unchanged.
 * @param id - Item id.
 * @param watched - New state.
 * @returns The updated progress.
 */
export function setWatched(progress: Progress, id: string, watched: boolean): Progress {
  const entries = Object.entries(progress.watched).filter(([key]) => key !== id);
  if (watched) entries.push([id, true]);
  return { version: currentVersion, watched: Object.fromEntries(entries) as Progress['watched'] };
}

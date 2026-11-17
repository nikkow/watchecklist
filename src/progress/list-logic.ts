import type { Filters, Row } from './list-types.ts';

/**
 * Tells whether a row passes the filters.
 *
 * @param row - The row.
 * @param filters - Active filters.
 * @param watched - Whether the row's item is watched.
 * @returns Whether to show it.
 */
export function isVisible(row: Row, filters: Filters, watched: boolean): boolean {
  if (filters.hideWatched && watched) return false;
  if (filters.hiddenSeries.has(row.series)) return false;
  if (filters.importance === 'essential') return row.importance === 'essential';
  if (filters.importance === 'no-optional') return row.importance !== 'optional';
  return true;
}

/**
 * Picks what to watch next: the first unwatched item that is not optional, or else the first
 * unwatched optional one. Filters do not change it, so it stays the same while browsing.
 *
 * @param rows - Rows in list order.
 * @param isWatched - Whether an item is watched.
 * @returns The next row, or null when everything is watched.
 */
export function nextRow(rows: readonly Row[], isWatched: (id: string) => boolean): Row | null {
  const unwatched = rows.filter((row) => !isWatched(row.id));
  return unwatched.find((row) => row.importance !== 'optional') ?? unwatched[0] ?? null;
}

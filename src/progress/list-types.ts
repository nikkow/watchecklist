import type { Importance } from '../lists/schema.ts';

/** One row of a list page, as the browser script reads it from the markup. */
export interface Row {
  id: string;
  /** Title id of its show or film, such as `tv:1412`. */
  series: string;
  importance: Importance;
  /** Whether the row is part of a crossover. */
  crossover: boolean;
}

/** Importance segments: everything, everything but optional items, essentials only. */
export type ImportanceFilter = 'all' | 'no-optional' | 'essential';

export interface Filters {
  importance: ImportanceFilter;
  /** Title ids switched off in the series filter. */
  hiddenSeries: ReadonlySet<string>;
  hideWatched: boolean;
  crossoversOnly: boolean;
}

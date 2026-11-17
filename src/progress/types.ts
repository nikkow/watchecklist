/**
 * What is stored in `localStorage`, version 1: the ids of watched items, shared by every list
 * so an episode ticked in one list is ticked everywhere. Ids never change (see the list schema).
 */
export interface ProgressV1 {
  version: 1;
  /** Watched item ids, such as `tv:1412:s03e08`, each mapped to `true`. */
  watched: Record<string, true>;
}

/** The current stored shape; a new version adds a migration from the previous one. */
export type Progress = ProgressV1;

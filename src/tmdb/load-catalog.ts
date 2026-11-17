/// <reference types="node" />

import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { Catalog } from './catalog.ts';

const catalogPath = join(import.meta.dirname, '..', 'generated', 'tmdb', 'catalog.json');

/**
 * Reads the TMDB catalog written by `pnpm sync:tmdb`.
 *
 * @returns The catalog.
 * @throws When the sync has not run yet.
 */
export async function loadCatalog(): Promise<Catalog> {
  try {
    return JSON.parse(await readFile(catalogPath, 'utf8')) as Catalog;
  } catch (error) {
    throw new Error('TMDB catalog missing: run pnpm sync:tmdb first.', { cause: error });
  }
}

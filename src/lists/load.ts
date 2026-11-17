/// <reference types="node" />

import { readdir, readFile } from 'node:fs/promises';
import { basename, join } from 'node:path';
import { parse } from 'yaml';
import { listSchema, type List } from './schema.ts';

const listsDirectory = join(import.meta.dirname, '..', '..', 'data', 'lists');

/**
 * Lists the list files.
 *
 * @returns File names in `data/lists/`, sorted, such as `arrowverse.yaml`.
 */
export async function listFileNames(): Promise<string[]> {
  return (await readdir(listsDirectory)).filter((file) => file.endsWith('.yaml')).sort();
}

/**
 * Parses one list file without validating it.
 *
 * @param fileName - File name in `data/lists/`.
 * @returns The parsed YAML.
 */
export async function readListFile(fileName: string): Promise<unknown> {
  return parse(await readFile(join(listsDirectory, fileName), 'utf8'));
}

/**
 * Loads and validates every list.
 *
 * @returns Lists keyed by slug.
 * @throws When a list is invalid; `pnpm validate:data` explains why.
 */
export async function loadLists(): Promise<Map<string, List>> {
  const lists = new Map<string, List>();
  for (const fileName of await listFileNames()) {
    const result = listSchema.safeParse(await readListFile(fileName));
    if (!result.success) throw new Error(`Invalid list ${fileName}, run pnpm validate:data`);
    lists.set(basename(fileName, '.yaml'), result.data);
  }
  return lists;
}

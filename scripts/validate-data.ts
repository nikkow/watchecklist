/// <reference types="node" />

import { readdir, readFile } from 'node:fs/promises';
import { basename, join } from 'node:path';
import { parse } from 'yaml';
import { z } from 'astro/zod';
import { isListSlug, listSchema } from '../src/lists/schema.ts';

const listsDirectory = join(import.meta.dirname, '..', 'data', 'lists');

/**
 * Validates one list file.
 *
 * @param path - Absolute path to a `.yaml` list.
 * @returns Human-readable problems, empty when the list is valid.
 */
async function validateListFile(path: string): Promise<string[]> {
  const slug = basename(path, '.yaml');
  const problems = isListSlug(slug) ? [] : [`File name "${slug}" is not a lowercase-dash slug`];
  const result = listSchema.safeParse(parse(await readFile(path, 'utf8')));
  if (!result.success) problems.push(z.prettifyError(result.error));
  return problems;
}

const files = (await readdir(listsDirectory)).filter((file) => file.endsWith('.yaml')).sort();
let failures = 0;

for (const file of files) {
  const problems = await validateListFile(join(listsDirectory, file));
  if (problems.length === 0) continue;
  failures += 1;
  console.error(`data/lists/${file}\n${problems.join('\n')}\n`);
}

if (failures > 0) {
  console.error(`Invalid list files: ${failures} of ${files.length}.`);
  process.exit(1);
}
console.log(`Valid list files: ${files.length}.`);

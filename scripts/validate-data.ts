/// <reference types="node" />

import { basename } from 'node:path';
import { z } from 'astro/zod';
import { listFileNames, readListFile } from '../src/lists/load.ts';
import { isListSlug, listSchema } from '../src/lists/schema.ts';

/**
 * Validates one list file.
 *
 * @param fileName - List file name in `data/lists/`.
 * @returns Human-readable problems, empty when the list is valid.
 */
async function validateListFile(fileName: string): Promise<string[]> {
  const slug = basename(fileName, '.yaml');
  const problems = isListSlug(slug) ? [] : [`File name "${slug}" is not a lowercase-dash slug`];
  const result = listSchema.safeParse(await readListFile(fileName));
  if (!result.success) problems.push(z.prettifyError(result.error));
  return problems;
}

const files = await listFileNames();
let failures = 0;

for (const file of files) {
  const problems = await validateListFile(file);
  if (problems.length === 0) continue;
  failures += 1;
  console.error(`data/lists/${file}\n${problems.join('\n')}\n`);
}

if (failures > 0) {
  console.error(`Invalid list files: ${failures} of ${files.length}.`);
  process.exit(1);
}
console.log(`Valid list files: ${files.length}.`);

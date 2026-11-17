/// <reference types="node" />

import { mkdir, rename, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { loadLists } from '../src/lists/load.ts';
import { createTmdbClient } from '../src/tmdb/client.ts';
import { buildCatalog, collectReferences } from '../src/tmdb/sync.ts';

const outputDirectory = join(import.meta.dirname, '..', 'src', 'generated', 'tmdb');
/** Filled first, then swapped in, so a failed sync keeps the previous output whole. */
const stagingDirectory = `${outputDirectory}.staging`;
const imagesDirectory = join(stagingDirectory, 'images');

const token = process.env['TMDB_READ_ACCESS_TOKEN'];
if (!token) {
  console.error('TMDB_READ_ACCESS_TOKEN is not set: add it to .env (see .env.example).');
  process.exit(1);
}

const client = createTmdbClient(token);
const references = collectReferences((await loadLists()).values());
const { catalog, images, problems } = await buildCatalog(references, client);

if (problems.length > 0) {
  console.error(`Unknown on TMDB:\n${problems.join('\n')}`);
  process.exit(1);
}

await rm(stagingDirectory, { recursive: true, force: true });
await mkdir(imagesDirectory, { recursive: true });
await Promise.all(
  images.map(async ({ fileName, filePath, size }) => {
    await writeFile(join(imagesDirectory, fileName), await client.image(filePath, size));
  }),
);
await writeFile(join(stagingDirectory, 'catalog.json'), `${JSON.stringify(catalog, null, 2)}\n`);
await rm(outputDirectory, { recursive: true, force: true });
await rename(stagingDirectory, outputDirectory);

const episodes = Object.values(catalog.shows).reduce(
  (total, show) => total + Object.keys(show.episodes).length,
  0,
);
console.log(
  `TMDB catalog: ${Object.keys(catalog.shows).length} shows, ${episodes} episodes, ` +
    `${Object.keys(catalog.movies).length} movies, ${images.length} images.`,
);

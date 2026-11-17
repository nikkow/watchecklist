import type { ImageMetadata } from 'astro';

const images = import.meta.glob<ImageMetadata>('../generated/tmdb/images/*', {
  eager: true,
  import: 'default',
});

/**
 * Finds an image downloaded by `pnpm sync:tmdb`, for Astro to resize at build time.
 *
 * @param fileName - File name from the TMDB catalog.
 * @returns The image, or null when the title has none.
 */
export function tmdbImage(fileName: string | null): ImageMetadata | null {
  if (fileName === null) return null;
  return images[`../generated/tmdb/images/${fileName}`] ?? null;
}

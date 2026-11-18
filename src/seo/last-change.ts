/// <reference types="node" />

import { execFileSync } from 'node:child_process';

/**
 * Reads the day a file last changed in git, for the sitemap's `lastmod`.
 *
 * The deploy checks out the full history; a shallow clone would date every file to its
 * single commit, which is why a missing history is better than a wrong date.
 *
 * @param path - File path relative to the project root.
 * @returns The commit date as `YYYY-MM-DD`, or null when git cannot tell.
 */
export function lastChange(path: string): string | null {
  try {
    const date = execFileSync('git', ['log', '-1', '--format=%cs', '--', path], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    return /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : null;
  } catch {
    return null;
  }
}

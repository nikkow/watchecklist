/** A TMDB response with an error status, kept so callers can tell a missing title apart. */
export class TmdbError extends Error {
  readonly status: number;

  constructor(status: number, path: string) {
    super(`TMDB ${status} for ${path}`);
    this.name = 'TmdbError';
    this.status = status;
  }
}

/**
 * Resolves to null when TMDB answers 404, so a missing title can be reported with the others.
 *
 * @param request - A pending TMDB call.
 * @returns Its result, or null when TMDB does not know the resource.
 * @throws Any other error of the call.
 */
export async function orNotFound<T>(request: Promise<T>): Promise<T | null> {
  try {
    return await request;
  } catch (error) {
    if (error instanceof TmdbError && error.status === 404) return null;
    throw error;
  }
}

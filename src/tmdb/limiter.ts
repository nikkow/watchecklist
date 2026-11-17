/**
 * Creates a gate that lets at most `limit` tasks run at once; the others wait in call order.
 *
 * @param limit - Highest number of tasks in flight.
 * @returns A function that runs a task when a slot is free and resolves with its result.
 */
export function createLimiter(limit: number): <T>(task: () => Promise<T>) => Promise<T> {
  let running = 0;
  const waiting: (() => void)[] = [];

  return async <T>(task: () => Promise<T>): Promise<T> => {
    if (running >= limit) await new Promise<void>((resolve) => waiting.push(resolve));
    running += 1;
    try {
      return await task();
    } finally {
      running -= 1;
      waiting.shift()?.();
    }
  };
}

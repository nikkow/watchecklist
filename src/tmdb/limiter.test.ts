import { describe, expect, it } from 'vitest';
import { createLimiter } from './limiter';

describe('createLimiter', () => {
  it('runs at most the limit at once and releases a slot when a task fails', async () => {
    const limit = createLimiter(2);
    let running = 0;
    let peak = 0;
    const task = (fail: boolean) => async () => {
      running += 1;
      peak = Math.max(peak, running);
      await new Promise((resolve) => setTimeout(resolve, 5));
      running -= 1;
      if (fail) throw new Error('boom');
      return 'ok';
    };

    const results = await Promise.allSettled(
      [true, false, false, false].map((f) => limit(task(f))),
    );
    expect(results.map((r) => r.status)).toEqual([
      'rejected',
      'fulfilled',
      'fulfilled',
      'fulfilled',
    ]);
    expect(peak).toBe(2);
  });
});

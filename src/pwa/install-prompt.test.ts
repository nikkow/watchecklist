import { describe, expect, it } from 'vitest';
import { isAppleMobile } from './install-prompt';

describe('isAppleMobile', () => {
  it.each([
    ['iPhone', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)', 'iPhone', 5, true],
    ['iPad on iPadOS', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', 'MacIntel', 5, true],
    ['a Mac', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', 'MacIntel', 0, false],
    ['Android', 'Mozilla/5.0 (Linux; Android 15; Pixel 9)', 'Linux armv8l', 5, false],
  ] as const)('recognises %s', (_name, userAgent, platform, touchPoints, expected) => {
    expect(isAppleMobile(userAgent, platform, touchPoints)).toBe(expected);
  });
});

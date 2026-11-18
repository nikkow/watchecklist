import { describe, expect, it } from 'vitest';
import { lastChange } from './last-change';

describe('lastChange', () => {
  it('dates a committed file', () => {
    expect(lastChange('package.json')).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('is null for a file git does not know', () => {
    expect(lastChange('data/lists/does-not-exist.yaml')).toBeNull();
  });
});

import { describe, expect, it } from 'vitest';
import { wrapFocusIndex } from '../src/core/focus';

describe('wrapFocusIndex', () => {
  it('wraps Tab and Shift+Tab around the ends of a dialog', () => {
    expect(wrapFocusIndex(2, 3, false)).toBe(0);
    expect(wrapFocusIndex(0, 3, true)).toBe(2);
    expect(wrapFocusIndex(1, 3, false)).toBe(2);
    expect(wrapFocusIndex(-1, 3, false)).toBe(0);
    expect(wrapFocusIndex(-1, 3, true)).toBe(2);
    expect(wrapFocusIndex(0, 0, false)).toBe(-1);
  });
});

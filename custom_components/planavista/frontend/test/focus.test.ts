import { describe, expect, it } from 'vitest';
import { deepActiveElement, wrapFocusIndex } from '../src/core/focus';

describe('deepActiveElement', () => {
  it('follows focus into shadow roots to the control that has it', () => {
    const button = { focus() {}, shadowRoot: null };
    const sheet = { shadowRoot: { activeElement: button } };
    const card = { shadowRoot: { activeElement: sheet } };
    expect(deepActiveElement({ activeElement: card as unknown as Element })).toBe(button);
  });

  it('says nothing when nothing has focus', () => {
    expect(deepActiveElement({ activeElement: null })).toBeNull();
  });
});

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

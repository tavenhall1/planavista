import { describe, expect, it } from 'vitest';
import { classifyLayout } from '../src/core/layout';

describe('classifyLayout', () => {
  it('sorts the reference sizes', () => {
    expect(classifyLayout({ width: 800, height: 1280 }, null, null, false)).toBe('portrait');
    expect(classifyLayout({ width: 1280, height: 800 }, null, null, false)).toBe('landscape');
    expect(classifyLayout({ width: 390, height: 844 }, null, null, false)).toBe('phone');
  });

  it('calls anything narrower than 600 px a phone', () => {
    expect(classifyLayout({ width: 599, height: 300 }, null, null, false)).toBe('phone');
    expect(classifyLayout({ width: 600, height: 900 }, null, null, false)).toBe('portrait');
  });

  it('keeps the previous shape when the card is nearly square', () => {
    expect(classifyLayout({ width: 1000, height: 1000 }, null, null, false)).toBe('landscape');
    expect(classifyLayout({ width: 1000, height: 1000 }, 'portrait', null, false)).toBe('portrait');
    expect(classifyLayout({ width: 1040, height: 1000 }, 'portrait', null, false)).toBe('portrait');
    expect(classifyLayout({ width: 960, height: 1000 }, 'landscape', null, false)).toBe('landscape');
    expect(classifyLayout({ width: 1060, height: 1000 }, 'portrait', null, false)).toBe('landscape');
    expect(classifyLayout({ width: 1000, height: 1000 }, 'phone', null, false)).toBe('landscape');
  });

  it('ignores the on-screen keyboard while a text field has focus', () => {
    const tablet = { width: 800, height: 1280 };
    const keyboard = { width: 800, height: 700 };
    expect(classifyLayout(keyboard, 'portrait', tablet, true)).toBe('portrait');
    expect(classifyLayout(keyboard, 'portrait', tablet, false)).toBe('landscape');
    expect(classifyLayout({ width: 1280, height: 800 }, 'portrait', tablet, true)).toBe('landscape');
  });

  it('treats a card with no height as landscape', () => {
    expect(classifyLayout({ width: 900, height: 0 }, null, null, false)).toBe('landscape');
  });
});

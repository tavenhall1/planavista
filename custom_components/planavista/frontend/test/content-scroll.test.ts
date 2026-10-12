import { describe, expect, it } from 'vitest';
import { INPUT_WINDOW_MS, compactHeader, shouldReport } from '../src/core/content-scroll';

describe('compactHeader', () => {
  it('shrinks the header once the content is scrolled past 24 px and brings it back under 8 px', () => {
    expect(compactHeader(false, 30)).toBe(true);
    expect(compactHeader(true, 4)).toBe(false);
  });

  it("keeps its shape in between, so a scroll near the top doesn't flicker it", () => {
    expect(compactHeader(false, 16)).toBe(false);
    expect(compactHeader(true, 16)).toBe(true);
  });
});

describe('shouldReport', () => {
  it("tells a person's scroll, and always the way back to the top", () => {
    expect(shouldReport(300, 200)).toBe(true);
    expect(shouldReport(0, Infinity)).toBe(true);
  });

  it("doesn't tell a view scrolling itself (the Day view going to now)", () => {
    expect(shouldReport(300, INPUT_WINDOW_MS + 1)).toBe(false);
    expect(shouldReport(300, Infinity)).toBe(false);
  });
});

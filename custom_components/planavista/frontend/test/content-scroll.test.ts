import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  CONTENT_SCROLL,
  ContentScrollDetail,
  HEADER_CHANGE_PX,
  INPUT_WINDOW_MS,
  ScrollReporter,
  compactHeader,
  headerChange,
  shouldReport,
} from '../src/core/content-scroll';

/** Content with plenty to scroll. */
const ROOMY = 1000;

describe('compactHeader', () => {
  it('shrinks the header once the content is scrolled past 24 px and brings it back under 8 px', () => {
    expect(compactHeader(false, { top: 30, room: ROOMY }, 52)).toBe(true);
    expect(compactHeader(true, { top: 4, room: ROOMY }, 52)).toBe(false);
  });

  it("keeps its shape in between, so a scroll near the top doesn't flicker it", () => {
    expect(compactHeader(false, { top: 16, room: ROOMY }, 52)).toBe(false);
    expect(compactHeader(true, { top: 16, room: ROOMY }, 52)).toBe(true);
  });

  it("doesn't shrink for content the step to one line would leave with too little to scroll", () => {
    // The step gives the content 52 px more height. With 60 px to scroll, 8 px would be left: the browser
    // pulls the content back to its top, the header grows again, and the two take turns.
    expect(compactHeader(false, { top: 30, room: 60 }, 52)).toBe(false);
    expect(compactHeader(false, { top: 30, room: 76 }, 52)).toBe(false);
    expect(compactHeader(false, { top: 30, room: 77 }, 52)).toBe(true);
  });
});

describe('headerChange', () => {
  it("is how far apart the header's two measured heights are", () => {
    expect(headerChange(173, 121)).toBe(52);
    // Chips that wrap make the tall header taller.
    expect(headerChange(229, 121)).toBe(108);
  });

  it('is a safe guess until both heights have been seen', () => {
    expect(headerChange(undefined, undefined)).toBe(HEADER_CHANGE_PX);
    expect(headerChange(173, undefined)).toBe(HEADER_CHANGE_PX);
  });
});

describe('shouldReport', () => {
  it("tells a person's scroll, and always the way back to the top", () => {
    expect(shouldReport(300, 200)).toBe(true);
    expect(shouldReport(0, Infinity)).toBe(true);
  });

  it("doesn't tell a scroll nobody made (the browser keeping a row in place as the list above it changes)", () => {
    expect(shouldReport(300, INPUT_WINDOW_MS + 1)).toBe(false);
    expect(shouldReport(300, Infinity)).toBe(false);
  });
});

describe('ScrollReporter', () => {
  class FakeScroller extends EventTarget {
    scrollTop = 0;
    scrollHeight = 900;
    clientHeight = 600;
  }

  let frames: FrameRequestCallback[] = [];
  const runFrames = (): void => {
    const due = frames;
    frames = [];
    due.forEach(callback => callback(0));
  };
  const heard = (target: EventTarget): ContentScrollDetail[] => {
    const details: ContentScrollDetail[] = [];
    target.addEventListener(CONTENT_SCROLL, e => details.push((e as CustomEvent<ContentScrollDetail>).detail));
    return details;
  };

  beforeEach(() => {
    frames = [];
    // No DOM here: an EventTarget stands in for the scroller.
    vi.stubGlobal('HTMLElement', EventTarget);
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => frames.push(callback));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('tells where a new scroller is when it attaches, so the header matches content that starts at its top', () => {
    const scroller = new FakeScroller();
    const details = heard(scroller);
    new ScrollReporter().attach(scroller as unknown as Element);
    runFrames();
    expect(details).toEqual([{ top: 0, room: 300 }]);
  });

  it('tells how much there is to scroll along with how far down it is', () => {
    const scroller = new FakeScroller();
    new ScrollReporter().attach(scroller as unknown as Element);
    runFrames();
    const details = heard(scroller);
    scroller.dispatchEvent(new Event('wheel'));
    scroller.scrollTop = 120;
    scroller.dispatchEvent(new Event('scroll'));
    runFrames();
    expect(details).toEqual([{ top: 120, room: 300 }]);
  });
});

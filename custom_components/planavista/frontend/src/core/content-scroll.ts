/**
 * Content scrolled under the header (spec 12.2): in portrait the big
 * header shrinks to one line while what's below it is scrolled down, and
 * comes back at the top. Scroll events stop at their shadow root, so each
 * scroller reports how far down it is.
 */
export const CONTENT_SCROLL = 'pv-content-scroll';

export interface ContentScrollDetail {
  top: number;
}

const SHRINK_PX = 24;
const GROW_PX = 8;
/** How long after a person's touch, wheel, or key a scroll still counts as theirs. */
export const INPUT_WINDOW_MS = 1500;

/** Shrink past 24 px and come back under 8 px, so a scroll near the top doesn't flicker it. */
export function compactHeader(compact: boolean, top: number): boolean {
  if (top > SHRINK_PX) return true;
  if (top < GROW_PX) return false;
  return compact;
}

/**
 * Whether a scroll position is worth telling: a person scrolled lately, or
 * it is back at the top. A view scrolling itself (Day to now) doesn't shrink
 * the header.
 */
export function shouldReport(top: number, msSinceInput: number): boolean {
  return top < GROW_PX || msSinceInput < INPUT_WINDOW_MS;
}

/** Tells the card, once a frame, how far down a scroller is while a person scrolls it. Bind `attach` with lit's ref(). */
export class ScrollReporter {
  private _element: HTMLElement | null = null;
  private _inputAt = -Infinity;
  private _frame = 0;

  private readonly _onInput = (): void => {
    this._inputAt = performance.now();
  };

  private readonly _onScroll = (): void => {
    if (this._frame) return;
    this._frame = requestAnimationFrame(() => {
      this._frame = 0;
      const element = this._element;
      if (!element) return;
      const top = element.scrollTop;
      if (!shouldReport(top, performance.now() - this._inputAt)) return;
      element.dispatchEvent(new CustomEvent<ContentScrollDetail>(CONTENT_SCROLL, { detail: { top }, bubbles: true, composed: true }));
    });
  };

  /** For lit's ref(): the scroller, or nothing when it goes. */
  readonly attach = (element?: Element): void => {
    const next = element instanceof HTMLElement ? element : null;
    if (next === this._element) return;
    const prev = this._element;
    if (prev) {
      prev.removeEventListener('scroll', this._onScroll);
      for (const type of ['wheel', 'touchmove', 'pointerdown', 'keydown']) prev.removeEventListener(type, this._onInput);
    }
    this._element = next;
    if (next) {
      next.addEventListener('scroll', this._onScroll, { passive: true });
      for (const type of ['wheel', 'touchmove', 'pointerdown', 'keydown']) next.addEventListener(type, this._onInput, { passive: true });
    }
  };
}

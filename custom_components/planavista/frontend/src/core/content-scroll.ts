/**
 * Content scrolled under the header (spec 12.2): in portrait the big
 * header shrinks to one line while what's below it is scrolled down, and
 * comes back at the top. Scroll events stop at their shadow root, so each
 * scroller reports how far down it is.
 */
export const CONTENT_SCROLL = 'pv-content-scroll';

export interface ContentScrollDetail {
  top: number;
  /** How far it can scroll at all: scrollHeight minus clientHeight. */
  room: number;
}

const SHRINK_PX = 24;
const GROW_PX = 8;
/** How long after a person's touch, wheel, or key a scroll still counts as theirs. */
export const INPUT_WINDOW_MS = 1500;
/**
 * What the header's step to one line gives the content until both of its
 * heights have been seen: more than the step on the widest portrait card
 * with one row of chips.
 */
export const HEADER_CHANGE_PX = 80;

/**
 * Shrink past 24 px and come back under 8 px, so a scroll near the top
 * doesn't flicker it. The step to one line gives the content `change` px
 * more height, so content that would then have 24 px or less to scroll
 * keeps the tall header: the browser would pull it back to its top, the
 * header would grow again, and the two would take turns.
 */
export function compactHeader(compact: boolean, { top, room }: ContentScrollDetail, change: number): boolean {
  if (compact) return top >= GROW_PX;
  return top > SHRINK_PX && room - change > SHRINK_PX;
}

/** How much taller the content gets when the header steps to one line: its two measured heights apart, or a safe guess until both are known. */
export function headerChange(tall: number | undefined, compact: number | undefined): number {
  if (tall === undefined || compact === undefined) return HEADER_CHANGE_PX;
  return Math.max(0, tall - compact);
}

/**
 * Whether a scroll position is worth telling: a person scrolled lately, or
 * it is back at the top. A scroll nobody made (the browser keeping a row in
 * place as the list above it changes) doesn't shrink the header.
 */
export function shouldReport(top: number, msSinceInput: number): boolean {
  return top < GROW_PX || msSinceInput < INPUT_WINDOW_MS;
}

/**
 * Tells the card, once a frame, how far down a scroller is while a person
 * scrolls it, and where a new one starts. Bind `attach` with lit's ref().
 */
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
      const room = Math.max(0, element.scrollHeight - element.clientHeight);
      element.dispatchEvent(new CustomEvent<ContentScrollDetail>(CONTENT_SCROLL, { detail: { top, room }, bubbles: true, composed: true }));
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
      // A new scroller (another list, an empty state) says where it starts, so the header matches it.
      this._onScroll();
    }
  };
}

/**
 * The header's height tall and on one line, measured as drawn (its chips
 * wrap, and its type grows with the card), for compactHeader's change.
 * Bind `attach` to the pv-glance-header with lit's ref().
 */
export class HeaderHeights {
  private _tall?: number;
  private _compact?: number;
  private _element: Element | null = null;
  private _observer: ResizeObserver | null = null;

  /** How much taller the content gets when the header steps to one line. */
  get change(): number {
    return headerChange(this._tall, this._compact);
  }

  /** For lit's ref(): the header, or nothing when it goes. */
  readonly attach = (element?: Element): void => {
    const next = element ?? null;
    if (next === this._element) return;
    this._observer?.disconnect();
    this._element = next;
    if (!next || typeof ResizeObserver === 'undefined') return;
    this._observer ??= new ResizeObserver(() => this._measure());
    this._observer.observe(next);
  };

  private _measure(): void {
    const element = this._element;
    if (!element || element.getAttribute('layout') !== 'portrait') return;
    const height = element.getBoundingClientRect().height;
    const shape = element.getAttribute('shape');
    if (shape === 'portrait') this._tall = height;
    else if (shape === 'phone') this._compact = height;
  }
}

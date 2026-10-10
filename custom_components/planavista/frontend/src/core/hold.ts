/**
 * Hold to complete (spec 11.5): the ring fills at a steady rate over 550 ms
 * while the finger stays down, and rewinds on an early release or a move of
 * more than 12 px, which hands an intended scroll back to the page. A quick
 * press is a tap. Space or Enter completes at once. The element supplies
 * pointer events, animation frames, and pointer capture; this decides.
 */

export const HOLD_MS = 550;
export const MOVE_CANCEL_PX = 12;
export const TAP_MS = 200;

export interface HoldCallbacks {
  /** Fill reached, 0 to 1, each frame while held. */
  progress(fill: number): void;
  /** Held the whole way (or Space or Enter). */
  complete(): void;
  /** Let go early or moved: rewind from the fill reached. */
  rewind(fill: number): void;
  /** A quick press that didn't move. */
  tap(): void;
}

export class HoldGesture {
  private _start: { x: number; y: number; t: number } | null = null;
  private _fill = 0;

  constructor(
    private readonly _callbacks: HoldCallbacks,
    private readonly _holdMs = HOLD_MS,
  ) {}

  /** A finger is down and the hold hasn't finished. */
  get holding(): boolean {
    return this._start !== null;
  }

  down(x: number, y: number, t: number): void {
    this._start = { x, y, t };
    this._fill = 0;
    this._callbacks.progress(0);
  }

  /** An animation frame at time `t` (the same clock as `down`). */
  frame(t: number): void {
    if (!this._start) return;
    this._fill = Math.min(1, Math.max(0, (t - this._start.t) / this._holdMs));
    this._callbacks.progress(this._fill);
    if (this._fill >= 1) {
      this._start = null;
      this._callbacks.complete();
    }
  }

  move(x: number, y: number): void {
    if (!this._start) return;
    if (Math.hypot(x - this._start.x, y - this._start.y) > MOVE_CANCEL_PX) this._stop(false);
  }

  up(t: number): void {
    if (!this._start) return;
    this._stop(t - this._start.t < TAP_MS);
  }

  /** The browser took the pointer (a scroll began, or the page lost focus). */
  cancel(): void {
    if (this._start) this._stop(false);
  }

  /** A key on the focused circle; true when it completed. */
  key(key: string): boolean {
    if (key !== ' ' && key !== 'Enter') return false;
    this._start = null;
    this._fill = 1;
    this._callbacks.progress(1);
    this._callbacks.complete();
    return true;
  }

  private _stop(tap: boolean): void {
    this._start = null;
    this._callbacks.rewind(this._fill);
    if (tap) this._callbacks.tap();
  }
}

import type { ReactiveController, ReactiveControllerHost } from 'lit';

/**
 * A sheet or toast ignores the tap of a finger that went down before it
 * appeared (round 1 of the adversarial review). Safari sends a lifting
 * finger's click to whatever is under it now, ignoring pointer capture, so a
 * hold that opened the PIN sheet picked the face under the finger, a hold at
 * the bottom of a column pressed the new toast's button, and a double tap's
 * second tap closed the options it had just opened.
 *
 * A real tap (a click with `detail` 1 or more) counts only when a pointerdown
 * began inside after it appeared, and not within `PRESS_GRACE_MS` of that.
 * A tap inside that window starts it over, so a burst of taps (a child's
 * triple tap) counts only once it pauses (round 4).
 * Keyboard and programmatic clicks (`detail` 0) always count. The backdrop's
 * own rule (core/backdrop.ts) still decides whether a tap outside closes it.
 */
export const PRESS_GRACE_MS = 300;

type GuardHost = ReactiveControllerHost & EventTarget;

const CAPTURE = { capture: true } as const;

/**
 * The page beneath an overlay that just closed ignores that burst (round 5): a
 * double tap on the reveal's Later pressed Redeem beneath it, and a hold's
 * lifting finger, under a reveal that closed at once, opened the person's day.
 * A page press counts once its pointerdown begins `PRESS_GRACE_MS` after the
 * last one (a tap inside starts it over, as the guard's restart does); then,
 * or after `lifetimeMs`, it goes. Keyboard clicks (`detail` 0) always count.
 */
export function guardPageTaps(
  target: EventTarget = window, now: () => number = () => performance.now(), lifetimeMs = 3000,
): () => void {
  let since = now();
  let pressed = false;
  const down = (): void => {
    const at = now();
    pressed = at - since >= PRESS_GRACE_MS;
    if (!pressed) since = at;
  };
  const click = (event: Event): void => {
    if ((event as MouseEvent).detail === 0) return;
    if (pressed) {
      stop();
      return;
    }
    event.stopImmediatePropagation();
    event.preventDefault();
  };
  const timer = setTimeout(() => stop(), lifetimeMs);
  const stop = (): void => {
    clearTimeout(timer);
    target.removeEventListener('pointerdown', down, CAPTURE);
    target.removeEventListener('click', click, CAPTURE);
  };
  target.addEventListener('pointerdown', down, CAPTURE);
  target.addEventListener('click', click, CAPTURE);
  return stop;
}

export interface PressGuardOptions {
  now?: () => number;
  /**
   * A tap inside the window starts it over (round 4), so a burst counts only after
   * a pause. The PIN keypad turns it off (round 5): digits typed fast are real presses.
   */
  restart?: boolean;
}

export class PressGuard implements ReactiveController {
  private _since = 0;
  private _pressed = false;
  private readonly now: () => number;
  private readonly restart: boolean;

  constructor(private readonly host: GuardHost, options: PressGuardOptions = {}) {
    this.now = options.now ?? (() => performance.now());
    this.restart = options.restart ?? true;
    host.addController(this);
  }

  hostConnected(): void {
    this.arm();
    this.host.addEventListener('pointerdown', this._down, CAPTURE);
    this.host.addEventListener('click', this._click, CAPTURE);
  }

  hostDisconnected(): void {
    this.host.removeEventListener('pointerdown', this._down, CAPTURE);
    this.host.removeEventListener('click', this._click, CAPTURE);
  }

  /** What it guards has just appeared (again): only presses from now on count. */
  arm(): void {
    this._since = this.now();
    this._pressed = false;
  }

  private _down = (): void => {
    const now = this.now();
    this._pressed = now - this._since >= PRESS_GRACE_MS;
    if (!this._pressed && this.restart) this._since = now;
  };

  private _click = (event: Event): void => {
    if ((event as MouseEvent).detail === 0 || this._pressed) return;
    event.stopImmediatePropagation();
    event.preventDefault();
  };
}

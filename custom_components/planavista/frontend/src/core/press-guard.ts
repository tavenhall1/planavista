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
 * Keyboard and programmatic clicks (`detail` 0) always count. The backdrop's
 * own rule (core/backdrop.ts) still decides whether a tap outside closes it.
 */
export const PRESS_GRACE_MS = 300;

type GuardHost = ReactiveControllerHost & EventTarget;

const CAPTURE = { capture: true } as const;

export class PressGuard implements ReactiveController {
  private _since = 0;
  private _pressed = false;

  constructor(private readonly host: GuardHost, private readonly now: () => number = () => performance.now()) {
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
    this._pressed = this.now() - this._since >= PRESS_GRACE_MS;
  };

  private _click = (event: Event): void => {
    if ((event as MouseEvent).detail === 0 || this._pressed) return;
    event.stopImmediatePropagation();
    event.preventDefault();
  };
}

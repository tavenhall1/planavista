import type { AppearanceSettings } from './appearance';

export type AppearanceChange = Partial<AppearanceSettings>;
export type SendAppearance = (changes: AppearanceChange) => Promise<unknown>;

/** Quiet time after the last tap before the changes are saved. */
export const SAVE_DELAY_MS = 400;
/** How long a saved change keeps showing while Home Assistant's copy catches up. */
export const SETTLE_MS = 5000;
/** A tap this recent turns the next light or dark change into a reveal from the finger. */
export const TAP_MS = 3000;

export interface TapPoint {
  x: number;
  y: number;
}

/** Equal values, objects compared key by key whatever their order. */
export function sameValue(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (!a || !b || typeof a !== 'object' || typeof b !== 'object') return false;
  const ka = Object.keys(a as object);
  const kb = Object.keys(b as object);
  return ka.length === kb.length && ka.every(k => sameValue((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k]));
}

/**
 * Appearance changes made in Settings or setup that Home Assistant hasn't
 * shown back yet (spec 14.1: Appearance applies as you tap). The card draws
 * current(saved), so a change shows at once and doesn't flicker back while
 * its save travels; a failed save drops it again. One per card, shared by
 * the Appearance page, Customize, and setup's Look step through the card's
 * drafts.
 */
export class AppearanceEdits {
  private _pending: AppearanceChange = {};
  private _unsent: AppearanceChange = {};
  private _timer: ReturnType<typeof setTimeout> | undefined;
  private _send: SendAppearance | null = null;
  private _onError: ((err: unknown) => void) | null = null;
  private _tap: (TapPoint & { at: number }) | null = null;
  private readonly _listeners = new Set<() => void>();

  /** `changed` runs whenever current() may differ (the card re-renders). */
  constructor(private readonly _changed: () => void = () => {}) {}

  /** Also tell `listener` whenever current() may differ (a page showing the settings); returns a function that stops. */
  subscribe(listener: () => void): () => void {
    this._listeners.add(listener);
    return () => {
      this._listeners.delete(listener);
    };
  }

  private _notify(): void {
    this._changed();
    for (const listener of this._listeners) listener();
  }

  /** The settings to draw: the saved ones with the changes still on their way. */
  current(saved: AppearanceSettings): AppearanceSettings {
    return { ...saved, ...this._pending };
  }

  /** Forget changes the saved settings show now. */
  reconcile(saved: AppearanceSettings): void {
    for (const key of Object.keys(this._pending) as Array<keyof AppearanceSettings>) {
      if (!(key in this._unsent) && sameValue(saved[key], this._pending[key])) delete this._pending[key];
    }
  }

  /** A tap changed these settings; they save after a quiet moment. `point` is where the finger was. */
  set(changes: AppearanceChange, send: SendAppearance, onError: (err: unknown) => void, point?: TapPoint): void {
    Object.assign(this._pending, changes);
    Object.assign(this._unsent, changes);
    this._send = send;
    this._onError = onError;
    if (point) this._tap = { ...point, at: Date.now() };
    clearTimeout(this._timer);
    this._timer = setTimeout(() => this.flush(), SAVE_DELAY_MS);
    this._notify();
  }

  /** The finger's point when a tap happened in the last few seconds, once. */
  takeTap(now = Date.now()): TapPoint | null {
    const tap = this._tap;
    this._tap = null;
    return tap && now - tap.at <= TAP_MS ? { x: tap.x, y: tap.y } : null;
  }

  /** Save what's waiting now (a page closing). */
  flush(): void {
    clearTimeout(this._timer);
    this._timer = undefined;
    const changes = this._unsent;
    const send = this._send;
    if (!send || Object.keys(changes).length === 0) return;
    this._unsent = {};
    const onError = this._onError;
    const drop = () => {
      for (const key of Object.keys(changes) as Array<keyof AppearanceSettings>) {
        // A newer change to the same setting stays.
        if (!(key in this._unsent) && sameValue(this._pending[key], changes[key])) delete this._pending[key];
      }
      this._notify();
    };
    send(changes).then(
      () => setTimeout(drop, SETTLE_MS),
      err => {
        drop();
        onError?.(err);
      },
    );
  }
}

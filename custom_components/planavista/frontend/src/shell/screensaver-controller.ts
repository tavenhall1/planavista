/**
 * The screensaver on shared screens (milestone 11, spec 3.2).
 *
 * Like kiosk mode it belongs to the page, not the card: after the household's
 * wait without a touch (or after the screen's motion sensor goes quiet), it
 * puts a living sky over everything. A touch wakes it and only wakes it; the
 * page ignores that burst. Where the household picked a Screen entity for this
 * screen, it is dimmed by day and turned off at night, and put back on waking.
 */
import type { HouseholdView } from '../core/household';
import { guardPageTaps } from '../core/press-guard';
import {
  EntityState, ServiceCall, isNight, motionReading, screenAction, screenRestore, screensaverHere, showsAt,
} from '../core/screensaver';
import type { HouseholdConnection } from '../core/household-client';
import { followPageConnection, onPageHousehold } from './page-household';

/** What the controller needs from the page; the tests fake it. */
export interface ScreensaverEnv {
  /** Home Assistant's entity states now, or null before it connects. */
  states(): Record<string, EntityState & { last_changed?: string }> | null;
  call(call: ServiceCall): Promise<unknown>;
  /** Puts the screensaver over the page, or takes it away. */
  show(): void;
  hide(): void;
  /** Parent mode ends as it shows: nobody is there. */
  lockParentMode(): void;
  /** Keeps the device awake while the screensaver can run here, where the browser can. */
  wakeLock(hold: boolean): void;
  /** The page ignores the burst that woke it, so the tap presses nothing beneath. */
  guardTaps(): void;
}

export class ScreensaverController {
  private _view: HouseholdView | null = null;
  private _lastTouch: number;
  private _showing = false;
  /** Shown from Settings' Show it now: only a touch closes it, not motion. */
  private _preview = false;
  private _phase: 'day' | 'night' | null = null;
  /** The Screen entity as it was before the screensaver changed it. */
  private _before: EntityState | undefined;
  private readonly _listeners = new Set<() => void>();

  constructor(private readonly _env: ScreensaverEnv, now: number) {
    this._lastTouch = now;
  }

  get showing(): boolean {
    return this._showing;
  }

  /** Whether it may run on this screen (a shared screen with the setting on). */
  get here(): boolean {
    return screensaverHere(this._view) !== null;
  }

  /** It is night here now, by the household's Sleep times or night's own times (spec D3). */
  night(date: Date): boolean {
    const settings = this._view?.security.screensaver;
    return isNight(date, this._view?.members ?? [], settings?.night ?? null);
  }

  /** Hear when it shows or goes (the element, Settings' preview). */
  onChange(listener: () => void): () => void {
    this._listeners.add(listener);
    return () => this._listeners.delete(listener);
  }

  setView(view: HouseholdView | null, now: number): void {
    this._view = view;
    this._env.wakeLock(this.here);
    if (!this.here && this._showing && !this._preview) this.wake(now);
  }

  /** A touch anywhere on the page: it wakes the screensaver, and starts the wait over. */
  touch(now: number): void {
    this._lastTouch = now;
    if (this._showing) this.wake(now);
  }

  tick(now: number, date: Date = new Date(now)): void {
    const here = screensaverHere(this._view);
    if (!here) return;
    const states = this._env.states();
    const motionId = here.mine?.motion;
    const motion = motionId ? motionReading(states?.[motionId]) : null;
    if (this._showing) {
      if (motion?.on && !this._preview && motion.since > this._lastTouch) {
        this.wake(now);
        return;
      }
      // A preview is a look at it: the screen's entity is left alone.
      const phase = this.night(date) ? 'night' : 'day';
      if (!this._preview && phase !== this._phase) this._screen(phase);
      return;
    }
    const at = showsAt(this._lastTouch, motion, here.settings.after_minutes);
    if (at !== null && now >= at) this._show(date, false);
  }

  /** Settings' Show it now: at once, on this screen, until a touch. */
  preview(date: Date): void {
    if (!this._showing) this._show(date, true);
  }

  wake(now: number): void {
    if (!this._showing) return;
    this._showing = false;
    this._preview = false;
    this._lastTouch = now;
    this._env.hide();
    this._env.guardTaps();
    const screen = screensaverHere(this._view)?.mine?.screen;
    const restore = screen && this._phase ? screenRestore(screen, this._before) : null;
    if (restore) this._env.call(restore).catch(() => undefined);
    this._before = undefined;
    this._phase = null;
    this._notify();
  }

  private _show(date: Date, preview: boolean): void {
    this._showing = true;
    this._preview = preview;
    this._env.lockParentMode();
    const screen = screensaverHere(this._view)?.mine?.screen;
    this._before = screen ? this._env.states()?.[screen] : undefined;
    if (!preview) this._screen(this.night(date) ? 'night' : 'day');
    this._env.show();
    this._notify();
  }

  private _screen(phase: 'day' | 'night'): void {
    this._phase = phase;
    const screen = screensaverHere(this._view)?.mine?.screen;
    const call = screen ? screenAction(screen, phase, this._env.states()?.[screen]) : null;
    // An entity that is unavailable, or a refused call, leaves the drawn display to carry on (spec 3.2).
    if (call) this._env.call(call).catch(() => undefined);
  }

  private _notify(): void {
    for (const listener of this._listeners) listener();
  }
}

type HassLike = {
  connection?: unknown;
  states?: Record<string, EntityState & { last_changed?: string }>;
  callService?: (domain: string, service: string, data: Record<string, unknown>) => Promise<unknown>;
};

const hassNow = (): HassLike | undefined => (document.querySelector('home-assistant') as (HTMLElement & { hass?: HassLike }) | null)?.hass;

/** The element shown over the page (pv-screensaver), and the lock it holds. */
let shown: HTMLElement | null = null;
let lock: { release(): Promise<void> } | null = null;
let wantLock = false;

async function holdWakeLock(): Promise<void> {
  const nav = navigator as Navigator & { wakeLock?: { request(type: 'screen'): Promise<{ release(): Promise<void> }> } };
  if (!wantLock || lock || !nav.wakeLock || document.visibilityState !== 'visible') return;
  try {
    lock = await nav.wakeLock.request('screen');
    (lock as unknown as EventTarget).addEventListener?.('release', () => { lock = null; });
  } catch {
    lock = null; // the browser said no (a battery saver, a hidden page): the device's own sleep applies
  }
}

const browserEnv: ScreensaverEnv = {
  states: () => hassNow()?.states ?? null,
  call: ({ domain, service, data }) => hassNow()?.callService?.(domain, service, data) ?? Promise.resolve(),
  show: () => {
    if (shown) return;
    shown = document.createElement('pv-screensaver');
    document.body.appendChild(shown);
  },
  hide: () => {
    shown?.remove();
    shown = null;
  },
  lockParentMode: () => window.dispatchEvent(new CustomEvent('pv-screensaver-shown')),
  wakeLock: hold => {
    wantLock = hold;
    if (hold) void holdWakeLock();
    else if (lock) {
      void lock.release().catch(() => undefined);
      lock = null;
    }
  },
  guardTaps: () => {
    guardPageTaps();
  },
};

/** The page's one controller; Settings' preview uses it. */
export const screensaver = new ScreensaverController(browserEnv, Date.now());

const STARTED = '__planavistaScreensaver';

/** Starts the screensaver for this page, once even if the bundle loads twice. */
export function startScreensaver(): void {
  const w = window as unknown as Record<string, unknown>;
  if (w[STARTED]) return;
  w[STARTED] = true;
  onPageHousehold(view => screensaver.setView(view, Date.now()));
  window.setInterval(() => {
    followPageConnection(hassNow()?.connection as HouseholdConnection | undefined);
    screensaver.tick(Date.now());
  }, 1000);
  const touched = () => screensaver.touch(Date.now());
  document.addEventListener('pointerdown', touched, true);
  document.addEventListener('keydown', touched, true);
  document.addEventListener('wheel', touched, { capture: true, passive: true });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') void holdWakeLock();
  });
}

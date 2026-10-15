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
  EntityState, MotionSeen, ScreenHold, ServiceCall, holdOf, isNight, knownState, readHold, screenAction, screenRestore,
  screensaverHere, seeMotion, showsAt,
} from '../core/screensaver';
import { swallowWakingKey } from '../core/wake-keys';
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
  /** Keeps the device awake (or lets it sleep), where the browser can. */
  wakeLock(hold: boolean): void;
  /** The page ignores the burst that woke it, so the tap presses nothing beneath. */
  guardTaps(): void;
  /** What the screensaver changed on this screen and hasn't put back, kept by the browser across a reload. */
  loadHold(): ScreenHold | null;
  saveHold(hold: ScreenHold | null): void;
}

export class ScreensaverController {
  private _view: HouseholdView | null = null;
  private _lastTouch: number;
  private _showing = false;
  /** Shown from Settings' Show it now: a look, until it has been left up for the wait; then the real thing. */
  private _preview = false;
  private _phase: 'day' | 'night' | null = null;
  private _nightNow = false;
  /** The Screen entity it may change while it shows: the pick as it was (a new pick puts this one back first). */
  private _entity: string | null = null;
  /** What it changed and how that was before, also in the browser's storage, so a reload puts it back. */
  private _hold: ScreenHold | null;
  private _motion: MotionSeen | null = null;
  private _wantLock: boolean | null = null;
  private readonly _listeners = new Set<() => void>();

  constructor(private readonly _env: ScreensaverEnv, now: number) {
    this._lastTouch = now;
    this._hold = _env.loadHold();
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
    if (!this.here && this._showing) this.wake(now);
    this._lock();
  }

  /** A touch anywhere on the page: it wakes the screensaver (true when it did), and starts the wait over. */
  touch(now: number): boolean {
    this._lastTouch = now;
    if (!this._showing) return false;
    this.wake(now);
    return true;
  }

  tick(now: number, date: Date = new Date(now)): void {
    const states = this._env.states();
    // Something it changed and didn't put back: the page was reloaded or closed while it showed.
    if (!this._showing && this._hold && states) this._release();
    const here = screensaverHere(this._view);
    if (!here) return;
    const motionId = here.mine?.motion;
    this._motion = motionId ? seeMotion(this._motion, states?.[motionId], now) : null;
    const motion = this._motion ? { on: this._motion.on, since: this._motion.at } : null;
    if (this._showing) {
      // Show it now, left up for the wait without a touch: nobody is looking any more.
      if (this._preview && now >= this._lastTouch + here.settings.after_minutes * 60_000) {
        this._preview = false;
        this._env.lockParentMode();
      }
      if (motion?.on && !this._preview && motion.since > this._lastTouch) {
        this.wake(now);
        return;
      }
      this._nightNow = this.night(date);
      // A preview is a look at it: the screen's entity is left alone.
      if (!this._preview) this._screen(states, here.mine?.screen ?? null);
      this._lock();
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
    this._release();
    this._entity = null;
    this._phase = null;
    this._lock();
    this._notify();
  }

  private _show(date: Date, preview: boolean): void {
    this._showing = true;
    this._preview = preview;
    // Parent mode ends as it shows, since nobody is there; a preview is someone looking at it.
    if (!preview) this._env.lockParentMode();
    this._nightNow = this.night(date);
    if (!preview) this._screen(this._env.states(), screensaverHere(this._view)?.mine?.screen ?? null);
    this._env.show();
    this._lock();
    this._notify();
  }

  /** The Screen entity for the day or the night, worked out from how it was before the screensaver changed it. */
  private _screen(states: Record<string, EntityState> | null, wanted: string | null): void {
    if (wanted !== this._entity) {
      // A new pick while it shows: the old one goes back, the new one starts from how it is.
      this._release();
      this._entity = wanted;
      this._phase = null;
    }
    const entity = this._entity;
    const current = entity ? states?.[entity] : undefined;
    // Only an entity whose state is known is changed, so there is always something to put back.
    if (!entity || !knownState(current)) return;
    if (!this._hold) {
      this._hold = holdOf(entity, current);
      this._env.saveHold(this._hold);
    }
    const phase = this._nightNow ? 'night' : 'day';
    if (phase === this._phase) return;
    this._phase = phase;
    const call = screenAction(entity, phase, this._hold.before, current);
    // A refused call leaves the drawn display to carry on (spec 3.2).
    if (call) this._env.call(call).catch(() => undefined);
  }

  /** Puts back what it changed, and forgets it. */
  private _release(): void {
    const hold = this._hold;
    if (!hold) return;
    this._hold = null;
    this._env.saveHold(null);
    const call = screenRestore(hold.entity, hold.before);
    if (call) this._env.call(call).catch(() => undefined);
  }

  /**
   * The device's own sleep waits by day, so the screensaver comes on instead;
   * while it shows at night the device may sleep, as an iPad's Auto-Lock does (spec D1).
   */
  private _lock(): void {
    const want = this.here && !(this._showing && this._nightNow && !this._preview);
    if (want === this._wantLock) return;
    this._wantLock = want;
    this._env.wakeLock(want);
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
let shown: (HTMLElement & { dismiss?: () => void }) | null = null;
let lock: { release(): Promise<void> } | null = null;
let wantLock = false;
const HOLD_KEY = 'planavista.screenHold';

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
    // Closing its dialog first gives focus back to what had it.
    shown?.dismiss?.();
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
  loadHold: () => {
    try {
      return readHold(localStorage.getItem(HOLD_KEY));
    } catch {
      return null; // no storage here (a private window): a reload can't put it back
    }
  },
  saveHold: hold => {
    try {
      if (hold) localStorage.setItem(HOLD_KEY, JSON.stringify(hold));
      else localStorage.removeItem(HOLD_KEY);
    } catch {
      // kept in memory only
    }
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
  const touched = () => {
    screensaver.touch(Date.now());
  };
  // The key that wakes it presses nothing beneath: it is stopped before the page hears it.
  const keyed = (event: KeyboardEvent) => {
    if (screensaver.touch(Date.now())) swallowWakingKey(event, window);
  };
  document.addEventListener('pointerdown', touched, true);
  window.addEventListener('keydown', keyed, true);
  document.addEventListener('wheel', touched, { capture: true, passive: true });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') void holdWakeLock();
  });
}

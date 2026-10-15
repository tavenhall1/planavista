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
  EntityState, MotionSeen, ScreenHold, ScreenRecord, ServiceCall, holdOf, isNight, knownState, readRecord, screenAction,
  screenRestore, screensaverHere, seeMotion, showsAt, type Trial,
} from '../core/screensaver';
import { swallowWakingKey, swallowWakingPress } from '../core/wake-keys';
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
  /** The browser's one record for every page of this login, kept across a reload. */
  loadRecord(): ScreenRecord;
  saveRecord(record: ScreenRecord): void;
  /** The last touch on any page of this browser; and telling the others of one here. */
  lastTouchAnywhere(): number;
  shareTouch(now: number): void;
  /** Whether this page is shown: a hidden page never puts the screensaver up. */
  visible(): boolean;
}

/** How often a page that shows the screensaver says so in the record, and when an unsaid one is taken as gone. */
const SHOWING_BEAT_MS = 30_000;
const SHOWING_GONE_MS = 90_000;

/** Whether the record says a page shows the screensaver now (a closed page stops saying so). */
function shows(record: ScreenRecord, now: number): boolean {
  return record.showing && (record.at === undefined || now - record.at < SHOWING_GONE_MS);
}

export class ScreensaverController {
  private _view: HouseholdView | null = null;
  private _lastTouch: number;
  private _showing = false;
  private _shownAt = 0;
  private _beatAt = 0;
  /** Shown from Settings' Show it now: a look, until it has been left up for the wait; then the real thing. */
  private _preview = false;
  /**
   * The page loaded while the record says the screensaver shows: a reload, a
   * crash, nobody touched it. It comes back up once the household says it still
   * runs here, and the Screen stays as it was.
   */
  private _resume: boolean;
  private _phase: 'day' | 'night' | null = null;
  private _nightNow = false;
  /** The Screen entity it changes while it shows: the pick as it was (a new pick puts the others back). */
  private _entity: string | null = null;
  private _motion: MotionSeen | null = null;
  private _wantLock: boolean | null = null;
  private readonly _listeners = new Set<() => void>();

  constructor(private readonly _env: ScreensaverEnv, now: number) {
    this._lastTouch = now;
    this._resume = shows(_env.loadRecord(), now);
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
    this._env.shareTouch(now);
    if (!this._showing) return false;
    this.wake(now);
    return true;
  }

  tick(now: number, date: Date = new Date(now)): void {
    const states = this._env.states();
    const here = screensaverHere(this._view);
    if (!this._showing && states) {
      if (this._resume) {
        if (!this._view) return; // the household hasn't answered yet
        this._resume = false;
        if (here && this._env.visible()) {
          this._show(now, date, false);
          return;
        }
      }
      // What it changed and couldn't put back yet: a Screen that was unavailable, a page closed while it showed.
      if (!shows(this._env.loadRecord(), now)) this._putBack(states, null);
    }
    if (!here) return;
    const touched = Math.max(this._lastTouch, this._env.lastTouchAnywhere());
    const motionId = here.mine?.motion;
    this._motion = motionId ? seeMotion(this._motion, states?.[motionId], now) : null;
    const motion = this._motion ? { on: this._motion.on, since: this._motion.at } : null;
    if (this._showing) {
      // A touch on another page of this screen wakes this one too.
      if (this._env.lastTouchAnywhere() > this._shownAt) {
        this.wake(now);
        return;
      }
      // Show it now, left up for the wait without a touch: nobody is looking any more.
      if (this._preview && now >= touched + here.settings.after_minutes * 60_000) {
        this._preview = false;
        this.trial = null;
        this._env.lockParentMode();
        this._mark(true, now);
      }
      if (motion?.on && !this._preview && motion.since > touched) {
        this.wake(now);
        return;
      }
      if (!this._preview && now - this._beatAt >= SHOWING_BEAT_MS) this._mark(true, now);
      this._nightNow = this.night(date);
      // A preview is a look at it: the screen's entity is left alone.
      if (!this._preview) {
        const wanted = here.mine?.screen ?? null;
        this._putBack(states, wanted);
        this._screen(states, wanted);
      }
      this._lock();
      return;
    }
    if (!this._env.visible()) return;
    const at = showsAt(touched, motion, here.settings.after_minutes);
    if (at !== null && now >= at) this._show(now, date, false);
  }

  /** What Try it asked for, while its preview shows (0.12.0). */
  trial: Trial | null = null;

  /** Settings' Show it now: at once, on this screen, until a touch; Try it's choices with it. */
  preview(date: Date, trial: Trial | null = null): void {
    if (this._showing) return;
    this.trial = trial;
    this._show(date.getTime(), date, true);
  }

  wake(now: number): void {
    if (!this._showing) return;
    this._showing = false;
    this._preview = false;
    this.trial = null;
    this._lastTouch = now;
    this._env.hide();
    this._env.guardTaps();
    this._mark(false, now);
    this._putBack(this._env.states(), null);
    this._entity = null;
    this._phase = null;
    this._lock();
    this._notify();
  }

  private _show(now: number, date: Date, preview: boolean): void {
    this._showing = true;
    this._preview = preview;
    this._shownAt = now;
    // Parent mode ends as it shows, since nobody is there; a preview is someone looking at it.
    if (!preview) {
      this._env.lockParentMode();
      this._mark(true, now);
    }
    this._nightNow = this.night(date);
    if (!preview) this._screen(this._env.states(), screensaverHere(this._view)?.mine?.screen ?? null);
    this._env.show();
    this._lock();
    this._notify();
  }

  /** Says in the record whether this page shows the screensaver. */
  private _mark(showing: boolean, now: number): void {
    const record = this._env.loadRecord();
    this._beatAt = now;
    this._env.saveRecord(showing ? { showing, at: now, holds: record.holds } : { showing, holds: record.holds });
  }

  /** The Screen entity for the day or the night, worked out from how it was before the screensaver changed it. */
  private _screen(states: Record<string, EntityState> | null, wanted: string | null): void {
    if (wanted !== this._entity) {
      this._entity = wanted;
      this._phase = null;
    }
    const entity = this._entity;
    const current = entity ? states?.[entity] : undefined;
    // Only an entity whose state is known is changed, so there is always something to put back.
    if (!entity || !knownState(current)) return;
    const record = this._env.loadRecord();
    let hold = record.holds.find(h => h.entity === entity);
    if (!hold) {
      // Another page of this screen may have changed it already: the record keeps how it was before either.
      hold = holdOf(entity, current);
      this._env.saveRecord({ ...record, holds: [...record.holds, hold] });
    }
    const phase = this._nightNow ? 'night' : 'day';
    if (phase === this._phase) return;
    this._phase = phase;
    const call = screenAction(entity, phase, hold.before, current);
    // A refused call leaves the drawn display to carry on (spec 3.2).
    if (call) this._env.call(call).catch(() => undefined);
  }

  /**
   * Puts back what it changed, but `keep`, and forgets each. A Screen whose
   * state isn't known waits for the next tick: Home Assistant skips a call to
   * an unavailable entity and still answers it as done (0.11.0 re-review).
   */
  private _putBack(states: Record<string, EntityState> | null, keep: string | null): void {
    if (!states) return;
    const record = this._env.loadRecord();
    if (!record.holds.length) return;
    const waiting: ScreenHold[] = [];
    for (const hold of record.holds) {
      if (hold.entity === keep || !knownState(states[hold.entity])) {
        waiting.push(hold);
        continue;
      }
      const call = screenRestore(hold.entity, hold.before);
      if (call) this._env.call(call).catch(() => undefined);
    }
    if (waiting.length !== record.holds.length) this._env.saveRecord({ ...record, holds: waiting });
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
const RECORD_KEY = 'planavista.screensaver';
const TOUCH_KEY = 'planavista.touchedAt';
/** Where the record lives when the browser keeps no storage (a private window). */
let memoryRecord: ScreenRecord = { showing: false, holds: [] };
let touchShared = 0;

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
    const el = shown as (HTMLElement & { dismiss?: () => void; leave?: () => Promise<void> }) | null;
    shown = null;
    if (!el) return;
    // A quick fade back to the card (0.12.0); then closing its dialog gives focus back to what had it.
    const done = () => {
      el.dismiss?.();
      el.remove();
    };
    if (el.leave) void el.leave().then(done, done);
    else done();
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
  loadRecord: () => {
    try {
      return readRecord(localStorage.getItem(RECORD_KEY));
    } catch {
      return memoryRecord;
    }
  },
  saveRecord: record => {
    memoryRecord = record;
    try {
      localStorage.setItem(RECORD_KEY, JSON.stringify(record));
    } catch {
      // kept in memory only: a reload can't put it back
    }
  },
  lastTouchAnywhere: () => {
    try {
      return Number(localStorage.getItem(TOUCH_KEY)) || 0;
    } catch {
      return 0;
    }
  },
  shareTouch: now => {
    // Once a second at most: a drag or a wheel doesn't write on every move.
    if (now - touchShared < 1000) return;
    touchShared = now;
    try {
      localStorage.setItem(TOUCH_KEY, String(now));
    } catch {
      // this page's own touches still count for it
    }
  },
  visible: () => document.visibilityState !== 'hidden',
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
  // The touch or key that wakes it presses nothing beneath: the rest of it is stopped before the page hears it.
  const pressed = (event: PointerEvent) => {
    if (screensaver.touch(Date.now())) swallowWakingPress(event, window);
  };
  const keyed = (event: KeyboardEvent) => {
    if (screensaver.touch(Date.now())) swallowWakingKey(event, window);
  };
  window.addEventListener('pointerdown', pressed, true);
  window.addEventListener('keydown', keyed, true);
  document.addEventListener('wheel', () => {
    screensaver.touch(Date.now());
  }, { capture: true, passive: true });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') void holdWakeLock();
  });
}

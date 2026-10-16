/**
 * The screensaver on shared screens (milestone 11, spec 3.2).
 *
 * Like kiosk mode it belongs to the page, not the card: after the household's
 * wait without a touch (or after the screen's motion sensor goes quiet), it
 * puts a living sky over everything. Since 0.13.0 it wakes like a phone: the
 * sky rests under a shade while nobody is near, lights when the motion sensor
 * sees someone, and goes dark after the Dark wait (the screen's Screen entity
 * off, where one is picked); only a touch opens the board, and the page ignores
 * that burst. What it turned off is put back on waking.
 */
import { lookForRain } from '../core/rain-record';
import type { HouseholdView } from '../core/household';
import { guardPageTaps } from '../core/press-guard';
import {
  DARK_FADE_MS, EntityState, MotionSeen, PANEL_WAKE_MS, PRESENT_MS, ScreenHold, ScreenRecord, ServiceCall, SkyStage, holdOf, isNight, knownState,
  readRecord, screenAction, screenRestore, screensaverHere, seeMotion, showsAt, skyStage, stageEase, type Trial,
} from '../core/screensaver';
import { WAKING_MAX_MS, WAKING_TAIL_MS, swallowWakingKey, swallowWakingPress } from '../core/wake-keys';
import type { HouseholdConnection } from '../core/household-client';
import { followPageConnection, onPageHousehold } from './page-household';

/** What the controller needs from the page; the tests fake it. */
export interface ScreensaverEnv {
  /** Home Assistant's entity states now, or null before it connects. */
  states(): Record<string, EntityState & { last_changed?: string }> | null;
  call(call: ServiceCall): Promise<unknown>;
  /** Puts the screensaver over the page at a stage, or takes it away. */
  show(stage: SkyStage): void;
  hide(): void;
  /** Moves the sky to another stage with this ease (0.13.0). */
  stage(stage: SkyStage, ease: { ms: number; easing: string }): void;
  /** Parent mode ends as it shows: nobody is there. */
  lockParentMode(): void;
  /** A parent looking at a preview, or the touch that ends it: parent mode counts it as a touch (review m12 J). */
  keepParentMode(): void;
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

/** Screens that go black when turned off and take a moment to show a picture again. */
const POWERED = new Set(['light', 'switch', 'input_boolean']);

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
   * runs here, at the stage it had (the quiet it counted from is in the record),
   * and the Screen stays as it was.
   */
  private _resume: boolean;
  /**
   * The record says it was dark (0.13.1): the page comes back dark whatever the old page's last word,
   * since a page in the dark may have its timers slowed, and a reload (the kitchen's nightly one) or a
   * crash at night must not light the room.
   */
  private _resumeDark: boolean;
  private _markedDark = false;
  /** Where the sky is while it shows (0.13.0), when it went dark, and whether the Screen's dark call went out. */
  private _stage: SkyStage | null = null;
  private _darkAt = 0;
  private _darkSent = false;
  /** When the quiet the stages count from began, as this page last worked it out, and as last written. */
  private _quiet = 0;
  private _markedQuiet = 0;
  /** When this showing's sky came on (a resumed page takes the record's), for a walk-by's dark wait. */
  private _skySince = 0;
  private _resumeSince: number | null = null;
  /** The Motion pick its reading belongs to: a new pick starts from its own first reading (review m13 M1). */
  private _motionId: string | null = null;
  /** When it last turned a powered-off Screen back on, and how long the waking touch kept presses away. */
  private _panelOnAt = Number.NEGATIVE_INFINITY;
  private _blind = 0;
  /** When the page last came back into view: someone is there (review m13b I2). */
  private _presentAt = Number.NEGATIVE_INFINITY;
  /** The Screen entity it changes while it shows: the pick as it was (a new pick puts the others back). */
  private _entity: string | null = null;
  private _motion: MotionSeen | null = null;
  private _wantLock: boolean | null = null;
  private readonly _listeners = new Set<() => void>();

  constructor(private readonly _env: ScreensaverEnv, now: number) {
    const record = _env.loadRecord();
    this._resumeDark = record.showing && record.dark === true;
    this._resume = shows(record, now) || this._resumeDark;
    this._lastTouch = this._resume && typeof record.quiet === 'number' ? Math.min(record.quiet, now) : now;
    if (this._resume && typeof record.since === 'number') this._resumeSince = Math.min(record.since, now);
  }

  /**
   * How long the last waking touch keeps the page's presses away (review m13 I1):
   * the panel's own wake when that touch, or someone walking up just before it,
   * turned a powered-off Screen back on, so nothing is pressed on a black screen.
   */
  get blindMs(): number {
    return this._blind;
  }

  get showing(): boolean {
    return this._showing;
  }

  /** Where the sky is while it shows, or null. */
  get stage(): SkyStage | null {
    return this._showing ? this._stage : null;
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

  /**
   * The page came back into view (an iPad unlocked, a tab shown again): someone is there. The board
   * starts its wait over; a sky that shows lights for a while, out of the dark too (review m13b I2).
   */
  present(now: number): void {
    // Nobody can be looking at a panel the screensaver powered off, and a page loading in the dark is
    // no one there either (0.13.1: the kitchen's reload at night lit the room).
    if (this._resume && this._resumeDark) return;
    if (this._showing && this._stage === 'dark' && this._panelOff()) return;
    if (!this._showing) {
      this._lastTouch = now;
      return;
    }
    this._presentAt = now;
  }

  /** A touch anywhere on the page: it wakes the screensaver (true when it did), and starts the wait over. */
  touch(now: number): boolean {
    this._lastTouch = now;
    this._env.shareTouch(now);
    if (!this._showing) return false;
    this.wake(now);
    return true;
  }

  tick(now: number, _date: Date = new Date(now)): void {
    const states = this._env.states();
    const here = screensaverHere(this._view);
    const touched = Math.max(this._lastTouch, this._env.lastTouchAnywhere(), this._presentAt);
    const motionId = here?.mine?.motion ?? null;
    if (here) {
      if (motionId !== this._motionId) {
        this._motionId = motionId;
        this._motion = null;
      }
      const seen = motionId ? seeMotion(this._motion, states?.[motionId], now) : null;
      // A sensor that drops out (Home Assistant restarting, the camera's service) keeps its last reading;
      // someone in front when it dropped counts as having walked away then (review m13 I2).
      const kept = this._motion && motionId ? (this._motion.on ? { ...this._motion, on: false, at: now } : this._motion) : null;
      this._motion = seen ?? kept;
    }
    const motion = this._motion ? { on: this._motion.on, since: this._motion.at } : null;
    const stageNow = (): SkyStage => (here
      ? skyStage(now, touched, motion, here.settings.after_minutes, here.settings.dark_minutes, this._showing ? this._skySince : undefined)
      : 'lit');
    if (here) this._quiet = motion?.on ? now : Math.max(touched, motion?.since ?? 0);
    if (!this._showing && states) {
      if (this._resume) {
        if (!this._view) return; // the household hasn't answered yet
        this._resume = false;
        if (here && this._env.visible()) {
          this._show(now, false, this._resumeDark ? 'dark' : stageNow());
          this._resumeDark = false;
          return;
        }
        this._resumeDark = false;
      }
      // What it changed and couldn't put back yet: a Screen that was unavailable, a page closed while it showed.
      if (!shows(this._env.loadRecord(), now)) this._putBack(states, null);
    }
    if (!here) return;
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
      // Until then a preview is a parent looking at it: lit, and parent mode doesn't time out under it.
      if (this._preview) this._env.keepParentMode();
      // Motion lights the sky; only a touch opens the board (0.13.0). Once dark it stays dark until someone
      // walks up or touches it: a settings change elsewhere never lights a room nobody is in (review m13 M1).
      const present = now - this._presentAt < PRESENT_MS;
      const next = this._preview || present ? 'lit' : stageNow();
      this._setStage(this._stage === 'dark' && !this._preview && !present && !motion?.on ? 'dark' : next, now);
      // The record learns a walk-by at once, so a reload counts from it (review m13 M4).
      if (!this._preview && (now - this._beatAt >= SHOWING_BEAT_MS || this._quiet !== this._markedQuiet
        || (this._stage === 'dark') !== this._markedDark)) this._mark(true, now);
      // A preview is a look at it: the screen's entity is left alone.
      if (!this._preview) {
        const wanted = here.mine?.screen ?? null;
        this._putBack(states, wanted);
        this._screen(states, wanted, now);
      }
      this._lock();
      return;
    }
    if (!this._env.visible()) return;
    const at = showsAt(touched, motion, here.settings.after_minutes);
    if (at !== null && now >= at) this._show(now, false, stageNow());
  }

  /** What Try it asked for, while its preview shows (0.12.0). */
  trial: Trial | null = null;

  /** Settings' Show it now: at once, on this screen, until a touch; Try it's choices with it. */
  preview(date: Date, trial: Trial | null = null): void {
    if (this._showing) return;
    this.trial = trial;
    this._show(date.getTime(), true, 'lit');
  }

  wake(now: number): void {
    if (!this._showing) return;
    // The touch that ends a preview is a parent's touch: back in Settings, parent mode carries on.
    if (this._preview) this._env.keepParentMode();
    // A touch on a panel that is still coming back keeps the page's presses away until it shows a picture.
    this._blind = this._stage === 'dark' && this._panelOff() ? PANEL_WAKE_MS : Math.max(0, PANEL_WAKE_MS - (now - this._panelOnAt));
    this._showing = false;
    this._preview = false;
    this.trial = null;
    this._lastTouch = now;
    this._stage = null;
    this._darkSent = false;
    this._env.hide();
    this._env.guardTaps();
    this._mark(false, now);
    this._putBack(this._env.states(), null);
    this._entity = null;
    this._lock();
    this._notify();
  }

  private _show(now: number, preview: boolean, stage: SkyStage): void {
    this._showing = true;
    this._preview = preview;
    this._shownAt = now;
    this._skySince = this._resumeSince ?? now;
    this._resumeSince = null;
    this._stage = stage;
    this._darkAt = now;
    this._darkSent = false;
    // Parent mode ends as it shows, since nobody is there; a preview is someone looking at it.
    if (!preview) {
      this._env.lockParentMode();
      this._mark(true, now);
    }
    this._env.show(stage);
    if (!preview) this._screen(this._env.states(), screensaverHere(this._view)?.mine?.screen ?? null, now);
    this._lock();
    this._notify();
  }

  /** Moves to a stage, telling the element how to ease there. */
  private _setStage(stage: SkyStage, now: number): void {
    if (stage === this._stage) return;
    const from = this._stage;
    this._stage = stage;
    if (stage === 'dark') {
      this._darkAt = now;
      this._darkSent = false;
    }
    this._env.stage(stage, stageEase(from, stage, this._panelOff()));
  }

  /**
   * Whether the screensaver powered this screen's Screen off and it is still off: a light or a switch
   * (a number at its minimum still shows a picture, and a plug turned back on by hand is on; review m13 M3).
   */
  private _panelOff(): boolean {
    const entity = this._entity;
    if (!entity || !POWERED.has(entity.split('.', 1)[0])) return false;
    if (!this._env.loadRecord().holds.some(h => h.entity === entity)) return false;
    return this._env.states()?.[entity]?.state === 'off';
  }

  /** Says in the record whether this page shows the screensaver, and the quiet its stages count from. */
  private _mark(showing: boolean, now: number): void {
    const record = this._env.loadRecord();
    this._beatAt = now;
    this._markedQuiet = this._quiet;
    this._markedDark = showing && this._stage === 'dark';
    this._env.saveRecord(showing
      ? { showing, at: now, quiet: this._quiet || now, since: this._skySince || now, ...(this._markedDark ? { dark: true } : {}), holds: record.holds }
      : { showing, holds: record.holds });
  }

  /**
   * The Screen entity follows the stage (spec D7): off (or its minimum) once the
   * fade to dark has played, kept with how it was before; back as it was when
   * the sky leaves the dark. Anything else leaves it alone.
   */
  private _screen(states: Record<string, EntityState> | null, wanted: string | null, now: number): void {
    if (wanted !== this._entity) {
      this._entity = wanted;
      this._darkSent = false;
    }
    const entity = this._entity;
    const current = entity ? states?.[entity] : undefined;
    // Only an entity whose state is known is changed, so there is always something to put back.
    if (!entity || !knownState(current)) return;
    const record = this._env.loadRecord();
    const hold = record.holds.find(h => h.entity === entity);
    if (this._stage === 'dark') {
      if (this._darkSent || now < this._darkAt + DARK_FADE_MS) return;
      // Another page of this screen may have turned it off already: the record keeps how it was before either.
      if (!hold) this._env.saveRecord({ ...record, holds: [...record.holds, holdOf(entity, current)] });
      this._darkSent = true;
      const call = screenAction(entity, current);
      // A refused call leaves the drawn dark to carry on (spec 3.2).
      if (call) this._env.call(call).catch(() => undefined);
      return;
    }
    if (!hold) return;
    // Out of the dark (someone walked up): the Screen comes back as it was.
    this._darkSent = false;
    if (POWERED.has(entity.split('.', 1)[0]) && current.state === 'off') this._panelOnAt = now;
    const call = screenRestore(entity, hold.before);
    if (call) this._env.call(call).catch(() => undefined);
    this._env.saveRecord({ ...record, holds: record.holds.filter(h => h.entity !== entity) });
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
   * The device's own sleep waits while the board or the sky shows, so the
   * screensaver comes on instead; in the dark the device may sleep, as an
   * iPad's Auto-Lock does (spec D9).
   */
  private _lock(): void {
    const want = this.here && !(this._showing && this._stage === 'dark' && !this._preview);
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

/** The household's weather entity's condition now, for the rain record. */
function weatherNow(): string | undefined {
  const hass = hassNow() as unknown as { states?: Record<string, { state: string; attributes?: Record<string, unknown> }> } | undefined;
  const display = hass?.states?.['sensor.planavista_config']?.attributes?.display as { weather_entity?: string } | undefined;
  return display?.weather_entity ? hass?.states?.[display.weather_entity]?.state : undefined;
}

const hassNow = (): HassLike | undefined => (document.querySelector('home-assistant') as (HTMLElement & { hass?: HassLike }) | null)?.hass;

/** The element shown over the page (pv-screensaver), and the lock it holds. */
type SkyElement = HTMLElement & {
  dismiss?: () => void;
  leave?: () => Promise<void>;
  stage?: SkyStage;
  setStage?: (stage: SkyStage, ease: { ms: number; easing: string }) => void;
};
let shown: SkyElement | null = null;
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
  show: stage => {
    if (shown) return;
    shown = document.createElement('pv-screensaver') as SkyElement;
    // It opens at its stage, with no ease: a resting sky enters under its shade (0.13.0).
    shown.stage = stage;
    document.body.appendChild(shown);
  },
  stage: (stage, ease) => {
    shown?.setStage?.(stage, ease);
  },
  hide: () => {
    const el = shown;
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
  keepParentMode: () => window.dispatchEvent(new CustomEvent('pv-screensaver-looked')),
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
    // Rain is noted while the page is open, for the rainbow after it (review m12a M2).
    lookForRain(weatherNow(), Date.now());
  }, 1000);
  // The touch or key that wakes it presses nothing beneath: the rest of it is stopped before the page hears it.
  const pressed = (event: PointerEvent) => {
    if (screensaver.touch(Date.now())) swallowWakingPress(event, window, WAKING_TAIL_MS, WAKING_MAX_MS, screensaver.blindMs);
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
    if (document.visibilityState === 'visible') {
      screensaver.present(Date.now());
      void holdWakeLock();
    }
  });
}

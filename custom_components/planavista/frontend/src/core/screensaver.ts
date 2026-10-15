import type { HouseholdView, Member } from './household';

/** One shared screen's entities (spec 3.1): what dims it, and what senses someone in front of it. */
export interface ScreenEntities {
  user_id: string;
  name: string | null;
  screen: string | null;
  motion: string | null;
}

/** The household's screensaver setting, as the view sends it (milestone 11). */
export interface ScreensaverSettings {
  enabled: boolean;
  after_minutes: number;
  night: { from: string; to: string } | null;
  screens: ScreenEntities[];
  /** Brightness by day and at night on shared screens, in whole percents (0.12.0; missing before it). */
  dim?: { day: number; night: number };
}

export const AFTER_CHOICES = [1, 2, 5, 10, 15, 30] as const;
export const SCREEN_DOMAINS = ['light', 'switch', 'input_boolean', 'number', 'input_number'] as const;
export const MOTION_DOMAINS = ['binary_sensor', 'input_boolean'] as const;
const MOTION_CLASSES = new Set(['motion', 'occupancy', 'presence', 'moving']);

/**
 * What Settings offers for a Screen or Motion pick, by name. The stored pick is
 * kept, first, when Home Assistant doesn't list it now or it no longer fits,
 * so the select never says None for something picked (0.11.0 review).
 */
export function entityChoices(
  states: Record<string, { entity_id: string; attributes: Record<string, unknown> }>,
  fits: (state: { entity_id: string; attributes: Record<string, unknown> }) => boolean,
  current: string | null,
): Array<{ id: string; name: string }> {
  const nameOf = (s: { entity_id: string; attributes: Record<string, unknown> }) => String(s.attributes.friendly_name ?? s.entity_id);
  const choices = Object.values(states).filter(fits)
    .map(s => ({ id: s.entity_id, name: nameOf(s) }))
    .sort((a, b) => a.name.localeCompare(b.name));
  if (current && !choices.some(c => c.id === current)) {
    const found = states[current];
    choices.unshift({ id: current, name: found ? nameOf(found) : `${current} (not found)` });
  }
  return choices;
}

/** Whether an entity can be a screen's Motion: a motion, occupancy, or presence sensor, or a helper toggle. */
export function motionCandidate(entityId: string, attributes: Record<string, unknown>): boolean {
  const domain = entityId.split('.', 1)[0];
  if (domain === 'input_boolean') return true;
  return domain === 'binary_sensor' && MOTION_CLASSES.has(String(attributes.device_class ?? ''));
}
/** With no Sleep times anywhere and none set, night runs 10:00 PM to 6:30 AM (spec D3). */
export const DEFAULT_NIGHT = { from: '22:00', to: '06:30' };
/** How bright a light or number is kept while the day's screensaver shows (spec 3.2). */
export const DAY_LEVEL = 0.4;
/** The info moves to another corner this often, so nothing stays in one place for hours (spec 3.3). */
export const CORNER_MS = 10 * 60_000;

/** The setting and this screen's entities, or null where the screensaver doesn't run (spec D5: shared screens only). */
export function screensaverHere(view: HouseholdView | null | undefined): { settings: ScreensaverSettings; mine: ScreenEntities | null } | null {
  const settings = view?.security.screensaver;
  if (!view?.available || !view.account.shared || !settings?.enabled) return null;
  return { settings, mine: settings.screens.find(s => s.user_id === view.account.user_id) ?? null };
}

/** The motion entity as this page saw it change: `at` is on the page's own clock, which Home Assistant's may not match. */
export interface MotionSeen {
  on: boolean;
  changed: string;
  at: number;
}

/**
 * The motion entity's reading, timed by this page (0.11.0 review: a screen
 * whose clock ran ahead of Home Assistant's never woke on motion). A change is
 * timed when the page first sees it, within its one-second tick; the first
 * reading of motion takes Home Assistant's time, never later than now.
 */
export function seeMotion(
  prev: MotionSeen | null, state: { state: string; last_changed?: string } | undefined, now: number,
): MotionSeen | null {
  const reading = motionReading(state);
  if (!reading) return null;
  const changed = state?.last_changed ?? '';
  if (prev && prev.changed === changed && prev.on === reading.on) return prev;
  if (prev) return { on: reading.on, changed, at: now };
  // A first reading (the page loading, or the sensor back after Home Assistant restarts) of no
  // motion starts nothing: only a change to off this page saw starts the wait (the kitchen screen).
  return { on: reading.on, changed, at: reading.on ? Math.min(now, reading.since || now) : 0 };
}

/** The motion entity as the idle clock reads it: on, and since when it last changed (ms). */
export interface MotionReading {
  on: boolean;
  since: number;
}

/**
 * When the screensaver comes on (spec D2): `afterMinutes` after the last touch,
 * or after motion went off if that was later; never while motion reads on.
 */
export function showsAt(lastTouch: number, motion: MotionReading | null, afterMinutes: number): number | null {
  if (motion?.on) return null;
  return Math.max(lastTouch, motion?.since ?? 0) + afterMinutes * 60_000;
}

/** A motion entity's state as a reading, or null when there is none to read (unavailable counts as no sensor). */
export function motionReading(state: { state: string; last_changed?: string } | undefined): MotionReading | null {
  if (!state || (state.state !== 'on' && state.state !== 'off')) return null;
  const since = state.last_changed ? Date.parse(state.last_changed) : 0;
  return { on: state.state === 'on', since: Number.isFinite(since) ? since : 0 };
}

const clock = (text: string): number => {
  const [h, m] = text.split(':').map(Number);
  return h * 60 + m;
};

/** Bedtimes from here to noon are someone sleeping by day. */
const DAY_SLEEP_FROM = 4 * 60;

/** A night as minutes from the midnight that starts its evening's date (so 1:00 AM after it is 1500). */
export interface NightWindow {
  from: number;
  to: number;
  source: 'sleep' | 'set' | 'default';
}

function windowOf(from: string, to: string, source: NightWindow['source']): NightWindow {
  const start = clock(from);
  let end = clock(to);
  if (end <= start) end += 1440;
  return { from: start, to: end, source };
}

/**
 * The night that starts on `evening`'s date (spec D3): from the latest bedtime to
 * the earliest wake-up (a bedtime plus that person's hours of sleep; Friday and
 * Saturday nights use weekend bedtimes). A bedtime before 4:00 AM is after
 * midnight; one from 4:00 AM to noon is left out. Bedtimes count without hours
 * of sleep too; with nobody's hours, night ends at the usual 6:30 AM.
 */
export function nightWindow(members: Member[], night: { from: string; to: string } | null, evening: Date): NightWindow {
  if (night) return windowOf(night.from, night.to, 'set');
  const weekend = evening.getDay() === 5 || evening.getDay() === 6;
  let latest = -1;
  let earliest = Infinity;
  for (const m of members) {
    const time = m.bedtime ? (weekend ? m.bedtime.weekend : m.bedtime.weeknight) : null;
    if (!time) continue;
    let bed = clock(time);
    // A bedtime from 4:00 AM to noon is a day's sleep (a night shift's): the screen's night isn't theirs.
    if (bed >= DAY_SLEEP_FROM && bed < 12 * 60) continue;
    if (bed < DAY_SLEEP_FROM) bed += 1440;
    latest = Math.max(latest, bed);
    if (m.sleep_hours) earliest = Math.min(earliest, bed + Math.round(m.sleep_hours * 60));
  }
  if (latest < 0) return windowOf(DEFAULT_NIGHT.from, DEFAULT_NIGHT.to, 'default');
  // Bedtimes without hours of sleep end at the usual morning.
  if (earliest === Infinity) earliest = 1440 + clock(DEFAULT_NIGHT.to);
  if (earliest <= latest) return windowOf(DEFAULT_NIGHT.from, DEFAULT_NIGHT.to, 'default');
  return { from: latest, to: earliest, source: 'sleep' };
}

/** Whether `now` falls in last night's or tonight's night. */
export function isNight(now: Date, members: Member[], night: { from: string; to: string } | null): boolean {
  const minutes = now.getHours() * 60 + now.getMinutes();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
  const tonight = nightWindow(members, night, today);
  const last = nightWindow(members, night, yesterday);
  return (minutes >= tonight.from && minutes < tonight.to) || (minutes + 1440 >= last.from && minutes + 1440 < last.to);
}

/** "10:30 PM to 6:15 AM", for Settings. */
export function nightText(window: NightWindow, format: '12h' | '24h'): string {
  const words = (minutes: number): string => {
    const m = ((minutes % 1440) + 1440) % 1440;
    const h = Math.floor(m / 60);
    const mm = String(m % 60).padStart(2, '0');
    if (format === '24h') return `${String(h).padStart(2, '0')}:${mm}`;
    return `${h % 12 || 12}:${mm} ${h >= 12 ? 'PM' : 'AM'}`;
  };
  return `${words(window.from)} to ${words(window.to)}`;
}

export interface EntityState {
  state: string;
  attributes: Record<string, unknown>;
}

export interface ServiceCall {
  domain: string;
  service: string;
  data: Record<string, unknown>;
}

const domainOf = (entityId: string): string => entityId.split('.', 1)[0];
const LEVELS = new Set(['number', 'input_number']);
const SWITCHES = new Set(['switch', 'input_boolean']);
/** A light's full brightness, in Home Assistant's 0 to 255. */
const FULL_LIGHT = 255;

/** An entity whose state is known (not unavailable or unknown). */
export const knownState = (state: EntityState | undefined): state is EntityState =>
  !!state && state.state !== 'unavailable' && state.state !== 'unknown';

/** What the screensaver changed on this screen and how it was before, kept across a reload (0.11.0 review). */
export interface ScreenHold {
  entity: string;
  before: EntityState;
}

/**
 * The browser's one record for every page of this login (0.11.0 re-review):
 * whether the screensaver shows (a reload while it shows comes back up), and
 * each Screen entity it changed, kept until that entity can be put back.
 */
export interface ScreenRecord {
  showing: boolean;
  /** When the page that shows it last said so (a closed page stops). */
  at?: number;
  holds: ScreenHold[];
}

/** The part of a state a hold keeps: on, off, or the value, and a light's brightness. */
export function holdOf(entity: string, state: EntityState): ScreenHold {
  const brightness = state.attributes.brightness;
  return { entity, before: { state: state.state, attributes: typeof brightness === 'number' ? { brightness } : {} } };
}

/** The record as the browser stored it; holds that can't be read are left out, and anything else is nothing held. */
export function readRecord(raw: string | null): ScreenRecord {
  const none: ScreenRecord = { showing: false, holds: [] };
  if (!raw) return none;
  try {
    const value = JSON.parse(raw) as { showing?: unknown; holds?: unknown } | null;
    if (!value || typeof value !== 'object' || Array.isArray(value)) return none;
    const holds = (Array.isArray(value.holds) ? value.holds : []).flatMap((hold: { entity?: unknown; before?: { state?: unknown; attributes?: unknown } }) => {
      if (!hold || typeof hold.entity !== 'string' || typeof hold.before?.state !== 'string') return [];
      const attributes = hold.before.attributes;
      return [holdOf(hold.entity, {
        state: hold.before.state,
        attributes: attributes && typeof attributes === 'object' ? (attributes as Record<string, unknown>) : {},
      })];
    });
    const at = (value as { at?: unknown }).at;
    return value.showing === true && typeof at === 'number' ? { showing: true, at, holds } : { showing: value.showing === true, holds };
  } catch {
    return none;
  }
}

/**
 * What the screensaver does to this screen's Screen entity (spec 3.2), from how
 * it was before the screensaver changed it and how it is now: by day a light or
 * number is dimmed to 40% of its range (never brighter than it was) and a switch
 * is as it was; at night a light or switch is off and a number at its minimum.
 * When night ends while it shows, the day's state comes back. Null when there is
 * nothing to do, or nothing known to put back.
 */
export function screenAction(
  entityId: string, phase: 'day' | 'night', before: EntityState | undefined, now: EntityState | undefined,
): ServiceCall | null {
  if (!knownState(before) || !knownState(now)) return null;
  const domain = domainOf(entityId);
  const target = { entity_id: entityId };
  if (domain === 'light') {
    if (phase === 'night' || before.state !== 'on') return now.state === 'on' ? { domain, service: 'turn_off', data: target } : null;
    const was = before.attributes.brightness;
    // A light that only turns on and off stays on by day.
    if (typeof was !== 'number') return now.state === 'on' ? null : { domain, service: 'turn_on', data: target };
    const level = Math.min(was, Math.round(FULL_LIGHT * DAY_LEVEL));
    return now.state === 'on' && now.attributes.brightness === level ? null : { domain, service: 'turn_on', data: { ...target, brightness: level } };
  }
  if (SWITCHES.has(domain)) {
    const want = phase === 'night' ? 'off' : before.state;
    if (want !== 'on' && want !== 'off') return null;
    return now.state === want ? null : { domain, service: want === 'on' ? 'turn_on' : 'turn_off', data: target };
  }
  if (LEVELS.has(domain)) {
    const was = Number(before.state);
    if (!Number.isFinite(was)) return null;
    const min = Number(now.attributes.min ?? 0);
    const max = Number(now.attributes.max ?? 100);
    const step = Number(now.attributes.step ?? 1) || 1;
    const value = phase === 'night' ? min : Math.min(was, Math.round((min + (max - min) * DAY_LEVEL) / step) * step);
    return Number(now.state) === value ? null : { domain, service: 'set_value', data: { ...target, value } };
  }
  return null;
}

/** Back to what it was before the screensaver changed it: on or off, its brightness or its value. */
export function screenRestore(entityId: string, before: EntityState | undefined): ServiceCall | null {
  if (!knownState(before)) return null;
  const domain = domainOf(entityId);
  const target = { entity_id: entityId };
  if (domain === 'light') {
    if (before.state !== 'on') return { domain, service: 'turn_off', data: target };
    const brightness = before.attributes.brightness;
    return { domain, service: 'turn_on', data: typeof brightness === 'number' ? { ...target, brightness } : target };
  }
  if (SWITCHES.has(domain)) return { domain, service: before.state === 'on' ? 'turn_on' : 'turn_off', data: target };
  if (LEVELS.has(domain) && Number.isFinite(Number(before.state))) {
    return { domain, service: 'set_value', data: { ...target, value: Number(before.state) } };
  }
  return null;
}

/** What the sky does (spec 3.3): how much of it is cloud, rain and snow (particles), fog patches, storms, wind. */
export interface WeatherScene {
  cover: number;
  rain: number;
  snow: number;
  fog: number;
  storm: boolean;
  wind: number;
}

const SCENES: Record<string, Omit<WeatherScene, 'wind'> & { wind?: number }> = {
  sunny: { cover: 0.05, rain: 0, snow: 0, fog: 0, storm: false },
  'clear-night': { cover: 0.05, rain: 0, snow: 0, fog: 0, storm: false },
  partlycloudy: { cover: 0.35, rain: 0, snow: 0, fog: 0, storm: false },
  cloudy: { cover: 0.8, rain: 0, snow: 0, fog: 0, storm: false },
  fog: { cover: 0.55, rain: 0, snow: 0, fog: 1, storm: false },
  rainy: { cover: 0.85, rain: 70, snow: 0, fog: 0.4, storm: false },
  pouring: { cover: 0.95, rain: 150, snow: 0, fog: 0.4, storm: false },
  snowy: { cover: 0.8, rain: 0, snow: 90, fog: 0, storm: false },
  'snowy-rainy': { cover: 0.85, rain: 50, snow: 50, fog: 0.4, storm: false },
  hail: { cover: 0.85, rain: 90, snow: 0, fog: 0, storm: false },
  lightning: { cover: 0.85, rain: 0, snow: 0, fog: 0, storm: true },
  'lightning-rainy': { cover: 0.95, rain: 150, snow: 0, fog: 0.4, storm: true },
  windy: { cover: 0.3, rain: 0, snow: 0, fog: 0, storm: false, wind: 2 },
  'windy-variant': { cover: 0.6, rain: 0, snow: 0, fog: 0, storm: false, wind: 2 },
  exceptional: { cover: 0.6, rain: 0, snow: 0, fog: 0, storm: false },
};

/**
 * The sky for a Home Assistant weather condition (spec 3.3). The entity's
 * `cloud_coverage` (0 to 100) sets the cover when it has one, kept at 0.6 or
 * more while it rains, snows, or storms. An unknown condition is a few clouds.
 */
export function weatherScene(condition: string | null | undefined, coverage?: unknown): WeatherScene {
  const base = SCENES[condition ?? ''] ?? { cover: 0.35, rain: 0, snow: 0, fog: 0, storm: false };
  const wet = base.rain > 0 || base.snow > 0 || base.storm;
  const given = typeof coverage === 'number' && Number.isFinite(coverage) ? Math.max(0, Math.min(1, coverage / 100)) : null;
  const cover = given === null ? base.cover : wet ? Math.max(0.6, given) : given;
  return { cover, rain: base.rain, snow: base.snow, fog: base.fog, storm: base.storm, wind: base.wind ?? 1 };
}

/** Lightning: never a strobe, at least 9 seconds apart (spec 3.3). */
export const LIGHTNING_GAP_MS = 9000;

/** When the next flash may come, from the last one and a random draw in [0, 1): 9 to 30 seconds later. */
export function nextLightning(lastAt: number, draw: number): number {
  return lastAt + LIGHTNING_GAP_MS + Math.floor(draw * 21_000);
}

export type Corner = 'bottom-left' | 'top-left' | 'top-right' | 'bottom-right';
const CORNERS: Corner[] = ['bottom-left', 'top-left', 'top-right', 'bottom-right'];

/** Where the info sits now: one corner for 10 minutes, then the next (spec 3.3). */
export function infoCorner(now: number): Corner {
  return CORNERS[Math.floor(now / CORNER_MS) % CORNERS.length];
}

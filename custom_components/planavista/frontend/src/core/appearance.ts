import type { Look, Mode, ThemeColors, ThemePair, ThemeShape } from '../styles/theme-pairs';

/** Light, Dark, or Automatic (spec 12.4); the household's choice. */
export type AppearanceMode = 'light' | 'dark' | 'automatic';
/** When Automatic switches. */
export type AppearanceSwitch = 'sun' | 'schedule' | 'home_assistant';
/** PlanaVista's Motion setting (spec 11.5). */
export type MotionSetting = 'device' | 'full' | 'reduced';

/** Every appearance setting, as the display keys save them. */
export interface AppearanceSettings {
  appearance: AppearanceMode;
  appearance_switch: AppearanceSwitch;
  /** "HH:MM", 24-hour. */
  light_from: string;
  dark_from: string;
  theme_pair: ThemePair;
  colors_light: ThemeColors;
  colors_dark: ThemeColors;
  shape: ThemeShape;
  motion: MotionSetting;
}

export const MODES: AppearanceMode[] = ['light', 'dark', 'automatic'];
export const SWITCHES: AppearanceSwitch[] = ['sun', 'schedule', 'home_assistant'];
export const PAIRS: ThemePair[] = ['planavista', 'minimal', 'vibrant'];
export const MOTIONS: MotionSetting[] = ['device', 'full', 'reduced'];

export const MODE_LABELS: Record<AppearanceMode, string> = { light: 'Light', dark: 'Dark', automatic: 'Automatic' };
export const PAIR_LABELS: Record<ThemePair, string> = { planavista: 'PlanaVista', minimal: 'Minimal', vibrant: 'Vibrant' };
export const SWITCH_LABELS: Record<AppearanceSwitch, string> = {
  sun: 'At sunset and sunrise',
  schedule: 'On a schedule',
  home_assistant: 'Match Home Assistant',
};
export const MOTION_LABELS: Record<MotionSetting, string> = { device: 'Follow the device', full: 'Full', reduced: 'Reduced' };

const CLOCK = /^([01]\d|2[0-3]):([0-5]\d)$/;

/** 1.1.0's theme keys and the theme and mode each becomes (spec 12.4). */
const LEGACY_THEMES: Record<string, [ThemePair, 'light' | 'dark']> = {
  planavista: ['planavista', 'light'],
  light: ['planavista', 'light'],
  dark: ['planavista', 'dark'],
  minimal: ['minimal', 'light'],
  modern: ['vibrant', 'light'],
  vibrant: ['vibrant', 'light'],
};

type Display = Record<string, unknown>;

function pick<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  return allowed.includes(value as T) ? (value as T) : fallback;
}

function clock(value: unknown, fallback: string): string {
  return typeof value === 'string' && CLOCK.test(value) ? value : fallback;
}

function record(value: unknown): Record<string, string> | null {
  return value && typeof value === 'object' && !Array.isArray(value) ? { ...(value as Record<string, string>) } : null;
}

function legacyColors(overrides: Record<string, string>): ThemeColors {
  const colors: ThemeColors = {};
  for (const key of ['accent', 'background', 'now_color'] as const) {
    if (overrides[key]) colors[key] = overrides[key];
  }
  const style = overrides.header_style;
  if (style === 'custom') {
    if (overrides.header_custom) colors.header = overrides.header_custom;
  } else if (style) {
    colors.header = style;
  }
  return colors;
}

function legacyShape(overrides: Record<string, string>): ThemeShape {
  const shape: Record<string, string> = {};
  for (const key of ['corner_style', 'shadow_depth', 'event_style', 'avatar_border']) {
    if (overrides[key]) shape[key] = overrides[key];
  }
  if (shape.avatar_border === 'light') shape.avatar_border = 'white';
  return shape as ThemeShape;
}

/**
 * The appearance settings from a saved display: the new keys, or where one
 * is missing, what 1.1.0's theme and theme_overrides mean. The same rule as
 * appearance_settings in appearance.py (tests/fixtures/appearance_cases.json).
 */
export function appearanceSettings(display: object | undefined | null): AppearanceSettings {
  // Any saved display will do: every key is checked as it's read.
  const d = (display ?? {}) as Display;
  const legacy = typeof d.theme === 'string' && d.theme ? d.theme : 'planavista';
  const [pair, mode] = LEGACY_THEMES[legacy] ?? LEGACY_THEMES.planavista;
  const overrides = record(d.theme_overrides) ?? {};
  const colors = legacyColors(overrides);
  const light = record(d.colors_light);
  const dark = record(d.colors_dark);
  const shape = record(d.shape);
  return {
    appearance: pick(d.appearance, MODES, mode),
    appearance_switch: pick(d.appearance_switch, SWITCHES, 'sun'),
    light_from: clock(d.light_from, '07:00'),
    dark_from: clock(d.dark_from, '21:00'),
    theme_pair: pick(d.theme_pair, PAIRS, pair),
    colors_light: light ?? (legacy === 'dark' ? {} : colors),
    colors_dark: dark ?? (legacy === 'dark' ? colors : {}),
    shape: (shape as ThemeShape | null) ?? legacyShape(overrides),
    motion: pick(d.motion, MOTIONS, 'device'),
  };
}

/**
 * A card's own `theme` option keeps its 1.1.0 meaning: `light` and `dark`
 * fix the card to PlanaVista Light or Dark; a theme name picks the theme
 * and follows the household's Light, Dark, or Automatic.
 */
export function withCardTheme(settings: AppearanceSettings, cardTheme: string | undefined): AppearanceSettings {
  switch (cardTheme) {
    case 'light':
    case 'dark':
      return { ...settings, theme_pair: 'planavista', appearance: cardTheme };
    case 'planavista':
    case 'minimal':
      return { ...settings, theme_pair: cardTheme };
    case 'vibrant':
    case 'modern':
      return { ...settings, theme_pair: 'vibrant' };
    default:
      return settings;
  }
}

/** The theme and colors to draw, apart from the mode. */
export function lookOf(settings: AppearanceSettings): Look {
  return { pair: settings.theme_pair, light: settings.colors_light, dark: settings.colors_dark, shape: settings.shape };
}

/** sun.sun as the card sees it: its state and the next sunrise and sunset. */
export interface SunState {
  state: string;
  next_rising?: string;
  next_setting?: string;
}

export interface ModeContext {
  now: Date;
  /** hass.states['sun.sun'] (state and attributes), or null when Home Assistant has none. */
  sun?: SunState | null;
  /** This screen's Home Assistant dark mode (hass.themes.darkMode). */
  haDark?: boolean;
}

export interface ResolvedMode {
  mode: Mode;
  /** When the mode changes next by itself (a sunrise, sunset, or schedule time); null when it won't. */
  next: Date | null;
  /** Automatic follows the sun, but Home Assistant has no sun.sun, so the schedule decides (spec 15.4). */
  sunMissing: boolean;
}

function minutesOf(value: string): number {
  const match = CLOCK.exec(value);
  return match ? Number(match[1]) * 60 + Number(match[2]) : 0;
}

/** The first moment after `now` that is `minutes` past local midnight (today or tomorrow). */
export function nextAt(now: Date, minutes: number): Date {
  const next = new Date(now);
  next.setHours(Math.floor(minutes / 60), minutes % 60, 0, 0);
  if (next.getTime() <= now.getTime()) {
    next.setDate(next.getDate() + 1);
    next.setHours(Math.floor(minutes / 60), minutes % 60, 0, 0);
  }
  return next;
}

/** On a schedule: light from one time, dark from the other, either way round midnight. */
export function scheduleMode(settings: AppearanceSettings, now: Date): { mode: Mode; next: Date | null } {
  const light = minutesOf(settings.light_from);
  const dark = minutesOf(settings.dark_from);
  if (light === dark) return { mode: 'light', next: null };
  const t = now.getHours() * 60 + now.getMinutes();
  const isLight = light < dark ? t >= light && t < dark : t >= light || t < dark;
  return { mode: isLight ? 'light' : 'dark', next: nextAt(now, isLight ? dark : light) };
}

function sunDate(value: string | undefined, now: Date): Date | null {
  const date = value ? new Date(value) : null;
  return date && !Number.isNaN(date.getTime()) && date.getTime() > now.getTime() ? date : null;
}

function timeOf(value: string | undefined): number | null {
  const time = value ? new Date(value).getTime() : Number.NaN;
  return Number.isNaN(time) ? null : time;
}

/**
 * Light or dark from sun.sun. A screen whose connection slept still holds the
 * state from before, so its own next rising and setting say what has happened
 * since: a sunset that has passed means night, and the sunrise after it, day.
 */
function sunMode(sun: SunState, now: Date): { mode: Mode; next: Date | null } {
  const up = sun.state === 'above_horizon';
  const t = now.getTime();
  // From this state, the next change and the one after it.
  const first = timeOf(up ? sun.next_setting : sun.next_rising);
  const second = timeOf(up ? sun.next_rising : sun.next_setting);
  const [fromState, other]: [Mode, Mode] = up ? ['light', 'dark'] : ['dark', 'light'];
  if (first === null || first > t) return { mode: fromState, next: first === null ? null : new Date(first) };
  if (second === null || second > t) return { mode: other, next: second === null ? null : new Date(second) };
  // A whole day out of date: back where it was, until a new state says when next.
  return { mode: fromState, next: null };
}

/** Light or dark right now, and when that changes next (spec 12.4). */
export function resolveMode(settings: AppearanceSettings, ctx: ModeContext): ResolvedMode {
  if (settings.appearance !== 'automatic') return { mode: settings.appearance, next: null, sunMissing: false };
  if (settings.appearance_switch === 'home_assistant') {
    return { mode: ctx.haDark ? 'dark' : 'light', next: null, sunMissing: false };
  }
  if (settings.appearance_switch === 'sun') {
    const sun = ctx.sun;
    if (sun && (sun.state === 'above_horizon' || sun.state === 'below_horizon')) {
      return { ...sunMode(sun, ctx.now), sunMissing: false };
    }
    return { ...scheduleMode(settings, ctx.now), sunMissing: true };
  }
  return { ...scheduleMode(settings, ctx.now), sunMissing: false };
}

/** "6:31 PM" or "18:31" (spaces only, whatever the browser's ICU does). */
export function clockText(date: Date, format: '12h' | '24h'): string {
  const minutes = String(date.getMinutes()).padStart(2, '0');
  if (format === '24h') return `${String(date.getHours()).padStart(2, '0')}:${minutes}`;
  return `${date.getHours() % 12 || 12}:${minutes} ${date.getHours() >= 12 ? 'PM' : 'AM'}`;
}

function sameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

/**
 * The line under "At sunset and sunrise": "Dark at 6:31 PM tonight, light
 * again at 7:12 AM." (or the other way round after sunset). Null without
 * the sun's times.
 */
export function sunSummary(sun: SunState | null | undefined, now: Date, format: '12h' | '24h'): string | null {
  if (!sun) return null;
  const rising = sunDate(sun.next_rising, now);
  const setting = sunDate(sun.next_setting, now);
  if (!rising || !setting) return null;
  if (sun.state === 'below_horizon') {
    return `Light at ${clockText(rising, format)}, dark again at ${clockText(setting, format)}.`;
  }
  const tonight = sameDay(setting, now) ? ' tonight' : '';
  return `Dark at ${clockText(setting, format)}${tonight}, light again at ${clockText(rising, format)}.`;
}

/** The Appearance row in Settings: "Automatic · PlanaVista". */
export function appearanceSummary(settings: AppearanceSettings): string {
  return `${MODE_LABELS[settings.appearance]} · ${PAIR_LABELS[settings.theme_pair]}`;
}

/** An automatic change waits until nobody has touched the screen for this long (spec 12.4). */
export const QUIET_MS = 10_000;
/** Look again at least this often, so a sunset or a schedule time is never missed. */
export const RECHECK_MS = 60_000;
/**
 * After a screen wakes, changes just switch for this long: Home Assistant
 * reconnects first, and only then says what changed while the screen slept.
 */
export const WAKE_MS = 15_000;

/**
 * When to look again (ms since the epoch): at the next change, when a quiet
 * moment ends, or within a minute. Times already past are ignored, so it
 * never answers "now": a quiet moment under an open sheet has nothing to wait
 * out (closing the sheet draws the card again).
 */
export function nextLookAt(now: number, next: Date | null, quietUntil: number): number {
  const times = [now + RECHECK_MS, next ? next.getTime() + 1000 : Number.NaN, quietUntil + 50];
  return Math.min(...times.filter(time => time > now));
}

/** May an automatic change play now? Not mid-touch, and not while a sheet is open. */
export function mayAutoSwitch(now: number, lastInteraction: number, overlayOpen: boolean): boolean {
  return !overlayOpen && now - lastInteraction >= QUIET_MS;
}

export type TransitionKind = 'none' | 'fade' | 'dusk' | 'dawn' | 'reveal';

export interface TransitionContext {
  /** The mode on screen; null before the first one is drawn. */
  from: Mode | null;
  to: Mode;
  /** Tapped on this screen (a change from anywhere else counts as automatic). */
  byHand: boolean;
  /** The page is hidden (a sleeping tablet). */
  hidden: boolean;
  reducedMotion: boolean;
  /** The browser has View Transitions. */
  supported: boolean;
}

/**
 * How the change between light and dark looks (spec 12.4): night falls
 * from the top, day rises from the bottom, a tap spreads from the finger,
 * reduced motion fades, and a first draw, a hidden page, or a browser
 * without View Transitions just switches.
 */
export function transitionKind(c: TransitionContext): TransitionKind {
  if (c.from === null || c.from === c.to || c.hidden || !c.supported) return 'none';
  if (c.reducedMotion) return 'fade';
  if (c.byHand) return 'reveal';
  return c.to === 'dark' ? 'dusk' : 'dawn';
}

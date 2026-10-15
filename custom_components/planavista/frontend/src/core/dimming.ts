import type { Member } from './household';
import { contrastRatio, fromLinear, parseHex, relativeLuminance, toHex, toLinear } from './color';
import { nightWindow } from './screensaver';

/**
 * Dimming for shared screens (0.12.0, spec D2 to D5). Wall screens mostly
 * can't dim themselves, so PlanaVista draws its own colors darker and warmer:
 * every color is scaled in real (linear) light by the level, so 30% gives off
 * about 30% of the light. Words keep their contrast with what they sit on
 * (4.5:1, 3:1 for muted words, or the theme's own when lower): light words
 * dim less, dark words more. Light surfaces go no darker than a quarter.
 * The evening fade runs 30 minutes and ends as night begins; the morning
 * comes back up over 10 minutes as it ends.
 */

/** The household's levels as whole percents, as the view sends them. */
export interface DimSettings {
  day: number;
  night: number;
}

export const DIM_DAY_CHOICES = [100, 85, 70] as const;
/** 100 at night means no dimming. */
export const DIM_NIGHT_CHOICES = [100, 50, 30, 15, 8] as const;
export const DIM_DEFAULT: DimSettings = { day: 100, night: 30 };
export const EVENING_FADE_MIN = 30;
export const MORNING_FADE_MIN = 10;
/** While fading, the card repaints this often; each step is too small to see. */
export const DIM_STEP_MS = 15_000;
/** How long tapping a level in Settings shows it. */
export const DIM_PREVIEW_MS = 3500;
/** Settings asks its card to show a level for a moment (bubbles and crosses shadow roots). */
export const DIM_PREVIEW_EVENT = 'pv-dim-preview';
export interface DimPreview {
  level: number;
  ms: number;
}

/**
 * Between two levels, `s` from 0 to 1. Brightness is felt roughly as its cube
 * root, so the fade runs evenly in that, eased at both ends.
 */
export function fadeBetween(from: number, to: number, s: number): number {
  const t = Math.min(1, Math.max(0, s));
  const e = t * t * (3 - 2 * t);
  return (Math.cbrt(from) + (Math.cbrt(to) - Math.cbrt(from)) * e) ** 3;
}

/** The level now (a fraction) and whether it is fading, from last night's and tonight's night. */
export function dimLevel(
  now: Date,
  members: Member[],
  night: { from: string; to: string } | null,
  dim: DimSettings,
): { level: number; fading: boolean } {
  const day = dim.day / 100;
  // A night set brighter than the day ("100%, no dimming" with a dimmer day) keeps the day's level (review m12 D).
  const dark = Math.min(day, dim.night / 100);
  if (day === dark) return { level: day, fading: false };
  const minutes = now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;
  const on = (offset: number) => nightWindow(members, night, new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset));
  const last = on(-1);
  const tonight = on(0);
  const next = on(1);
  let level = day;
  let fading = false;
  // Tomorrow's night too: one set to start at or just after midnight fades in before midnight (review m12 C).
  const nights = [
    { from: last.from - 1440, to: last.to - 1440 },
    tonight,
    { from: next.from + 1440, to: next.to + 1440 },
  ];
  for (const { from, to } of nights) {
    if (minutes >= from && minutes < to) return { level: dark, fading: false };
    if (minutes >= from - EVENING_FADE_MIN && minutes < from) {
      level = Math.min(level, fadeBetween(day, dark, (minutes - (from - EVENING_FADE_MIN)) / EVENING_FADE_MIN));
      fading = true;
    } else if (minutes >= to && minutes < to + MORNING_FADE_MIN) {
      level = Math.min(level, fadeBetween(dark, day, (minutes - to) / MORNING_FADE_MIN));
      fading = true;
    }
  }
  return { level, fading };
}

/** Less blue as it dims, like a lamp: nothing at full, the most at the darkest level. */
function warmth(level: number): [number, number, number] {
  const w = Math.min(1, Math.max(0, (1 - level) / 0.92));
  return [1, 1 - 0.13 * w, 1 - 0.42 * w];
}

/** Scale a color's light by `k`, warmed for the screen's `level`. */
function scaled(rgb: [number, number, number], k: number, level: number): [number, number, number] {
  const m = warmth(level);
  return rgb.map((c, i) => fromLinear(toLinear(c) * k * m[i])) as [number, number, number];
}

function dimChannels(rgb: [number, number, number], level: number, text: boolean): [number, number, number] {
  // A small mark with no known background (a star, the sun in the sky) dims by the square root of the level.
  const light = text && relativeLuminance(toHex(...rgb)) > 0.18;
  return scaled(rgb, light ? Math.sqrt(level) : level, level);
}

/**
 * Light surfaces go no darker than this (review m12 A): below it, even black
 * words can't keep 4.5:1 on a dimmed white or a pale tint (the flare in the
 * contrast formula), so a light look at 8% draws at a quarter, and so does a
 * dark look's light toast.
 */
export const LIGHT_FLOOR = 0.25;
/** A surface this light (relative luminance) keeps the floor in a dark look too. */
const LIGHT_SURFACE = 0.4;

/** The level a look's surfaces (and people's colors) are drawn at. */
export function surfaceLevel(level: number, mode: 'light' | 'dark'): number {
  return mode === 'light' && level < 1 ? Math.max(level, LIGHT_FLOOR) : level;
}

/**
 * Words at the level, keeping their contrast with what they sit on (review I1):
 * light words dim less until they reach `target` against their dimmed
 * background, dark words dim more; never more contrast than the theme gave
 * them. `level` is the surfaces' level, `bg` the background as drawn.
 */
export function inkOn(text: string, bg: string, bgFull: string, level: number, target: number): string {
  if (level >= 1) return text;
  const rgb = parseHex(text);
  if (!rgb || !parseHex(bg) || !parseHex(bgFull)) return dimColor(text, level, true);
  const goal = Math.min(target, contrastRatio(text, bgFull));
  // Which side of its background the theme put it on (dimmed, grey words can end up level with a dimmed white).
  const light = relativeLuminance(text) > relativeLuminance(bgFull);
  const at = (k: number) => toHex(...scaled(rgb, k, level));
  // Light words: the least light that reaches the goal, from the level up to full. Dark words: the most.
  let lo = light ? level : 0;
  let hi = light ? 1 : level;
  if (contrastRatio(at(light ? level : hi), bg) >= goal) return at(light ? level : hi);
  for (let i = 0; i < 18; i++) {
    const mid = (lo + hi) / 2;
    const ok = contrastRatio(at(mid), bg) >= goal;
    if (light === ok) hi = mid;
    else lo = mid;
  }
  return at(light ? hi : lo);
}

/** 0 to 255 channels at the level (the screensaver's light model uses these); `text` for small marks. */
export function dimRgb(rgb: [number, number, number], level: number, text = false): [number, number, number] {
  return level >= 1 ? rgb : dimChannels(rgb, level, text);
}

/** A '#RRGGBB' color at the level; `text` for letters and small marks. */
export function dimColor(hex: string, level: number, text = false): string {
  if (level >= 1) return hex;
  const rgb = parseHex(hex);
  return rgb ? toHex(...dimChannels(rgb, level, text)) : hex;
}

const HEX = /#(?:[0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/g;
const RGBA = /rgba?\(\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\s*(?:,\s*([\d.]+)\s*)?\)/g;

/** Every color in a CSS value (hex, rgb, rgba, inside gradients and shadows) at the level. */
export function dimValue(value: string, level: number, text = false): string {
  if (level >= 1) return value;
  return value
    .replace(HEX, hex => dimColor(hex, level, text))
    .replace(RGBA, (_all, r: string, g: string, b: string, a: string | undefined) => {
      const [nr, ng, nb] = dimChannels([+r, +g, +b], level, text).map(v => Math.round(Math.min(255, Math.max(0, v))));
      return a === undefined ? `rgb(${nr}, ${ng}, ${nb})` : `rgba(${nr}, ${ng}, ${nb}, ${a})`;
    });
}

/** Letters and small marks: they keep the text rule. */
const TEXT_TOKEN = /^--pv-text|-ink$|-text$|-muted$|^--pv-star$|^--pv-now-color$|^--pv-toast-action$/;

/**
 * Each word token's background and the contrast it keeps (review I1): 4.5:1
 * for words, 3:1 for muted words and small marks, or the theme's own when lower.
 */
const INK: Record<string, [background: string, target: number]> = {
  '--pv-text': ['--pv-card-bg', 4.5],
  '--pv-text-secondary': ['--pv-card-bg', 4.5],
  '--pv-text-muted': ['--pv-card-bg', 3],
  '--pv-accent-ink': ['--pv-card-bg', 4.5],
  '--pv-danger-ink': ['--pv-card-bg', 4.5],
  '--pv-now-color': ['--pv-card-bg', 3],
  '--pv-star': ['--pv-card-bg', 3],
  '--pv-accent-text': ['--pv-accent', 4.5],
  '--pv-accent-tint-ink': ['--pv-accent-tint', 4.5],
  '--pv-warn-ink': ['--pv-warn-bg', 4.5],
  '--pv-bad-ink': ['--pv-bad-bg', 4.5],
  '--pv-header-text': ['--pv-header-gradient', 4.5],
  '--pv-header-muted': ['--pv-header-gradient', 3],
  '--pv-toast-text': ['--pv-toast-bg', 4.5],
  '--pv-toast-action': ['--pv-toast-bg', 4.5],
};

/** A value's first color, for a background given as a gradient. */
const firstHex = (value: string | undefined): string | undefined => value?.match(HEX)?.[0];

/**
 * The theme's tokens at the level for the look's mode; the same object at full.
 * Surfaces dim by the level (a light look no lower than LIGHT_FLOOR), words keep
 * their contrast with their own background.
 */
export function dimTokens<T extends Record<string, string>>(tokens: T, level: number, mode: 'light' | 'dark' = 'dark'): T {
  if (level >= 1) return tokens;
  const surfaces = surfaceLevel(level, mode);
  const levelOf = (hex: string | undefined) =>
    hex && relativeLuminance(hex) > LIGHT_SURFACE ? Math.max(surfaces, LIGHT_FLOOR) : surfaces;
  const out: Record<string, string> = {};
  for (const [name, value] of Object.entries(tokens)) {
    if (!name.startsWith('--pv-')) {
      out[name] = value;
      continue;
    }
    const ink = INK[name];
    const bgFull = ink ? firstHex(tokens[ink[0]]) : undefined;
    if (ink && bgFull && parseHex(value)) {
      const under = levelOf(bgFull);
      out[name] = inkOn(value, dimColor(bgFull, under), bgFull, under, ink[1]);
      continue;
    }
    const text = TEXT_TOKEN.test(name);
    out[name] = dimValue(value, text ? surfaces : levelOf(firstHex(value)), text);
  }
  return out as T;
}

/**
 * The CSS brightness() that scales a picture's light by the level: CSS filters
 * multiply the color values, which are about light to the power 1/2.2.
 */
export function mediaBrightness(level: number): number {
  return level >= 1 ? 1 : level ** (1 / 2.2);
}

import type { Member } from './household';
import { fromLinear, parseHex, relativeLuminance, toHex, toLinear } from './color';
import { nightWindow } from './screensaver';

/**
 * Dimming for shared screens (0.12.0, spec D2 to D5). Wall screens mostly
 * can't dim themselves, so PlanaVista draws its own colors darker and warmer:
 * every color is scaled in real (linear) light by the level, so 30% gives off
 * about 30% of the light. Light text scales by the square root of the level,
 * so it stays easy to read; dark text dims with its background, which keeps
 * their contrast. The evening fade runs 30 minutes and ends as night begins;
 * the morning comes back up over 10 minutes as it ends.
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
  const dark = dim.night / 100;
  if (day === dark) return { level: day, fading: false };
  const minutes = now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
  const tonight = nightWindow(members, night, today);
  const last = nightWindow(members, night, yesterday);
  let level = day;
  let fading = false;
  for (const { from, to } of [{ from: last.from - 1440, to: last.to - 1440 }, tonight]) {
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

function dimChannels(rgb: [number, number, number], level: number, text: boolean): [number, number, number] {
  // Light text dims less (the square root of the level); dark text dims with what's behind it.
  const light = text && relativeLuminance(toHex(...rgb)) > 0.18;
  const k = light ? Math.sqrt(level) : level;
  const m = warmth(level);
  return rgb.map((c, i) => fromLinear(toLinear(c) * k * m[i])) as [number, number, number];
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

/** The theme's tokens at the level; the same object at full. */
export function dimTokens<T extends Record<string, string>>(tokens: T, level: number): T {
  if (level >= 1) return tokens;
  const out: Record<string, string> = {};
  for (const [name, value] of Object.entries(tokens)) {
    out[name] = name.startsWith('--pv-') ? dimValue(value, level, TEXT_TOKEN.test(name)) : value;
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

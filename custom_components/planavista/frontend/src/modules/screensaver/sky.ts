import type { WeatherScene } from '../../core/screensaver';
import { dimRgb } from '../../core/dimming';

// The living sky's light (spec 3.3), ported from the approved mockup (v4): pure
// rules with no DOM, so the scene only draws what these work out.

/** A color as red, green, and blue from 0 to 255 (fractions allowed while mixing). */
export type Rgb = [number, number, number];

/** How far the sheets, stars, and weather are drawn past each side, so the slow drift never shows an edge (px). */
export const SCENE_MARGIN = 56;

/**
 * Where a bolt of lightning starts: the base of a cloud well on screen, a
 * storm's tall cloud first (the owner, 2026-10-15: "Lightning should always
 * originate from a cloud"). Null with no cloud to come from; the strike waits.
 */
export function boltSource(
  clouds: ReadonlyArray<{ kind: string; x: number; w: number; y: number }>, width: number, horizon: number,
  draw: () => number = Math.random,
): { x: number; top: number } | null {
  const onScreen = clouds.filter(c => c.x + c.w * 0.25 > width * 0.08 && c.x + c.w * 0.75 < width * 0.92 && c.y < horizon);
  const towers = onScreen.filter(c => c.kind === 'tower');
  const pool = towers.length ? towers : onScreen;
  if (!pool.length) return null;
  const c = pool[Math.min(pool.length - 1, Math.floor(draw() * pool.length))];
  return { x: c.x + c.w * (0.3 + draw() * 0.4), top: c.y - 3 };
}

/** Sunrise and sunset when none are known (spec 3.3: without sun.sun, 7:00 AM and 7:00 PM), in minutes of the day. */
export const DEFAULT_RISE = 7 * 60;
export const DEFAULT_SET = 19 * 60;

/** A seeded random source (mulberry32): one seed always gives the same numbers, so the ranges keep their shape. */
export function rng(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * The land's seeds, sheet by sheet back to front (0.13.0): each sheet's shape,
 * and which of its trees are broadleaf. A new set each time the screensaver
 * opens gives new ranges with the same rules.
 */
export interface Landscape {
  shapes: readonly number[];
  trees: readonly number[];
}

/** The approved mockup's land (v15), the one every screensaver drew before 0.13.0. */
export const APPROVED_LANDSCAPE: Landscape = {
  shapes: [211, 242, 273, 304, 335, 366],
  trees: [907, 908, 909, 910, 911, 912],
};

/** The massif with the tallest peak (sheet 1): the shapes the owner picked in the Mountain Picker, today's first. */
export const TOP_SEEDS: readonly number[] = [242, 595380, 557009, 614891, 264828, 39358, 60862];
/** The range in front of it (sheet 2), the same way. */
export const SECOND_SEEDS: readonly number[] = [273, 348899, 712769, 239700, 623634, 300407, 235294, 680635, 145242, 185318];

/**
 * The land for one showing (spec D2): the two snowy ranges from the owner's
 * lists, the other sheets and every sheet's trees at random.
 */
export function pickLandscape(random: () => number = Math.random): Landscape {
  const any = () => Math.floor(random() * 1_000_000);
  const from = (list: readonly number[]) => list[Math.min(list.length - 1, Math.floor(random() * list.length))];
  const top = from(TOP_SEEDS);
  const second = from(SECOND_SEEDS);
  return {
    shapes: [any(), top, second, any(), any(), any()],
    trees: [any(), any(), any(), any(), any(), any()],
  };
}

/** "#rrggbb" as a color. */
export function hex(h: string): Rgb {
  return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
}

/** From `a` toward `b` by `t` (0 is `a`, 1 is `b`). */
export function mixRgb(a: Rgb, b: Rgb, t: number): Rgb {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}

/** A color as CSS, rounded, with its alpha. */
export function rgba(c: Rgb, a = 1): string {
  return `rgba(${Math.round(c[0])},${Math.round(c[1])},${Math.round(c[2])},${a})`;
}

/** Darker toward black (k below 0) or lighter toward white (k above 0), by the fraction k. */
export function shade(c: Rgb, k: number): Rgb {
  const f = (v: number) => (k < 0 ? v * (1 + k) : v + (255 - v) * k);
  return [f(c[0]), f(c[1]), f(c[2])];
}

/** `v` kept within `a` to `b`. */
export function clamp(v: number, a: number, b: number): number {
  return Math.max(a, Math.min(b, v));
}

/** Smoothstep: eases 0 to 1 in and out. */
export function smooth(t: number): number {
  return t * t * (3 - 2 * t);
}

/**
 * Midpoint displacement, a ridge's natural roughness: larger strokes first and
 * finer ones after, scaled so the largest is 1. `n` is a power of two plus one.
 */
export function fractal(r: () => number, n: number, rough: number): Float32Array {
  const v = new Float32Array(n);
  v[0] = r() * 2 - 1;
  v[n - 1] = r() * 2 - 1;
  let step = n - 1;
  let scale = 1;
  while (step > 1) {
    const half = step / 2;
    for (let i = half; i < n; i += step) v[i] = (v[i - half] + v[i + half]) / 2 + (r() * 2 - 1) * scale;
    scale *= rough;
    step = half;
  }
  let max = 0;
  for (const x of v) max = Math.max(max, Math.abs(x));
  for (let i = 0; i < n; i++) v[i] /= max || 1;
  return v;
}

const three = <T>(f: (j: number) => T): [T, T, T] => [f(0), f(1), f(2)];

/** The light at one height of the sun: the sky's three stops, the glow, and each paper's color. */
export interface LightKey {
  /** The sun's height in degrees. */
  e: number;
  sky: [Rgb, Rgb, Rgb];
  /** The glow's color and its strength. */
  glow: [Rgb, number];
  /** The farthest and nearest sheets' paper; those between are mixed. */
  far: Rgb;
  near: Rgb;
  pine: Rgb;
  snow: Rgb;
  cloud: Rgb;
  sun: Rgb;
}

interface RawKey {
  e: number;
  sky: [string, string, string];
  glow: [string, number];
  far: string;
  near: string;
  pine: string;
  snow: string;
  cloud: string;
  sun: string;
}

const keyOf = (k: RawKey): LightKey => ({
  e: k.e,
  sky: three(j => hex(k.sky[j])),
  glow: [hex(k.glow[0]), k.glow[1]],
  far: hex(k.far),
  near: hex(k.near),
  pine: hex(k.pine),
  snow: hex(k.snow),
  cloud: hex(k.cloud),
  sun: hex(k.sun),
});

/** The light keyed by the sun's height, deep night to midday (the hero's palette at midday). */
export const KEYS: LightKey[] = ([
  { e: -18, sky: ['#0a1322', '#122038', '#1b2b48'], glow: ['#3a4673', 0.10], far: '#33435f', near: '#0e1828', pine: '#0b1520', snow: '#3e4d6a', cloud: '#2b3956', sun: '#f2e8d4' },
  { e: -6, sky: ['#25355c', '#5b5f8d', '#c99ba0'], glow: ['#f2a688', 0.42], far: '#8a88ab', near: '#2a395a', pine: '#22304a', snow: '#cac6dc', cloud: '#a096ba', sun: '#ffc39a' },
  { e: 0, sky: ['#6e8ec0', '#c4a7c3', '#f9c49b'], glow: ['#ffae78', 0.85], far: '#cbb9cd', near: '#385d6c', pine: '#2c4a46', snow: '#f6e7e4', cloud: '#f5d3c6', sun: '#ffcd9b' },
  { e: 8, sky: ['#8db5e0', '#cedbee', '#fbe2c4'], glow: ['#ffd8a6', 0.6], far: '#c4d7e1', near: '#30686c', pine: '#2d5446', snow: '#fcf8f3', cloud: '#fffaf2', sun: '#fff0d2' },
  { e: 25, sky: ['#a7cdef', '#d6e8f8', '#fdf6ee'], glow: ['#fff0d4', 0.34], far: '#c9dee8', near: '#2c676b', pine: '#2f5d4a', snow: '#ffffff', cloud: '#ffffff', sun: '#fff7e6' },
] as RawKey[]).map(keyOf);

/** The greys that cloud cover mixes in: an overcast sky, a storm's sky, and clouds by kind of weather. */
export const GREY: { sky: [Rgb, Rgb, Rgb]; storm: [Rgb, Rgb, Rgb]; cloud: Rgb; rain: Rgb; stormCloud: Rgb } = {
  sky: three(j => hex(['#8f9cab', '#b2bbc6', '#d0d6dd'][j])),
  storm: three(j => hex(['#525b69', '#717a87', '#8f96a1'][j])),
  cloud: hex('#e2e6eb'),
  rain: hex('#bcc4ce'),
  stormCloud: hex('#5b6474'),
};

/** Where the sun (or by night the moon) is: up or not, how far through its day or night (0 to 1), and its height in degrees. */
export interface SunState {
  day: boolean;
  p: number;
  e: number;
}

/** The minute of the day for a local time, seconds included (so 6:30:30 AM is 390.5). */
export function minuteOfDay(date: Date): number {
  return date.getHours() * 60 + date.getMinutes() + date.getSeconds() / 60 + date.getMilliseconds() / 60_000;
}

/** Sunrise and sunset as given, or the defaults when they can't make a day (missing, or sunset not after sunrise). */
function dayOf(rise: number, set: number): [number, number] {
  const usable = Number.isFinite(rise) && Number.isFinite(set) && rise >= 0 && set <= 1440 && set > rise && set - rise < 1440;
  return usable ? [rise, set] : [DEFAULT_RISE, DEFAULT_SET];
}

/**
 * The sun at a minute of the day, between sunrise and sunset (minutes of the
 * day): up to 38 degrees at midday. The night, from sunset to the next sunrise,
 * is the mockup's own: the moon's arc, down to 26 degrees below at its middle.
 */
export function sunAt(minute: number, rise: number, set: number): SunState {
  const [r, s] = dayOf(rise, set);
  const m = minute >= 0 && minute < 1440 ? minute : ((minute % 1440) + 1440) % 1440;
  if (m >= r && m <= s) {
    const p = (m - r) / (s - r);
    return { day: true, p, e: 38 * Math.sin(Math.PI * p) };
  }
  const night = 1440 - (s - r);
  const p = ((m - s + 1440) % 1440) / night;
  return { day: false, p, e: -26 * Math.sin(Math.PI * p) };
}

/** The scene's light at one moment: the sky, the glow, every paper's color, how many stars show, and the fog. */
export interface Light {
  sun: SunState;
  /** The sun's height the keys are read at (kept within -18 to 25 degrees). */
  e: number;
  sky: [Rgb, Rgb, Rgb];
  glow: [Rgb, number];
  far: Rgb;
  near: Rgb;
  pine: Rgb;
  snow: Rgb;
  cloud: Rgb;
  sunColor: Rgb;
  /** 0 to 1: none by day, all on a clear night, fewer through cloud. */
  stars: number;
  fog: number;
}

/**
 * The light at a minute of the day for the weather (spec 3.3): the keys mixed
 * by the sun's height, then greyed by the cloud cover (toward the storm's
 * palette in a storm), clouds greyed for rain or storms, the ranges flattened.
 */
export function lightAt(minute: number, scene: WeatherScene, rise: number, set: number): Light {
  const sun = sunAt(minute, rise, set);
  const e = clamp(sun.e, -18, 25);
  let i = 0;
  while (i < KEYS.length - 2 && e > KEYS[i + 1].e) i++;
  const a = KEYS[i];
  const b = KEYS[i + 1];
  const t = smooth(clamp((e - a.e) / (b.e - a.e), 0, 1));
  const cover = clamp(scene.cover, 0, 1);
  const storm = scene.storm;
  const light: Light = {
    sun,
    e,
    sky: three(j => mixRgb(a.sky[j], b.sky[j], t)),
    glow: [mixRgb(a.glow[0], b.glow[0], t), a.glow[1] + (b.glow[1] - a.glow[1]) * t],
    far: mixRgb(a.far, b.far, t),
    near: mixRgb(a.near, b.near, t),
    pine: mixRgb(a.pine, b.pine, t),
    snow: mixRgb(a.snow, b.snow, t),
    cloud: mixRgb(a.cloud, b.cloud, t),
    sunColor: mixRgb(a.sun, b.sun, t),
    stars: clamp((-4 - sun.e) / 10, 0, 1),
    fog: scene.fog || 0,
  };
  const daylight = clamp((sun.e + 8) / 20, 0, 1);
  const grey = storm ? GREY.storm : GREY.sky;
  const k = cover * (storm ? 0.95 : 0.85);
  light.sky = three(j => mixRgb(light.sky[j], shade(grey[j], -0.78 * (1 - daylight)), k));
  light.glow[1] = Math.max(0, light.glow[1] * (1 - cover * 1.05));
  const cloudTo = storm ? GREY.stormCloud : scene.rain > 0 ? GREY.rain : GREY.cloud;
  light.cloud = mixRgb(light.cloud, shade(cloudTo, -0.7 * (1 - daylight)), clamp(Math.pow(cover, 1.5) * (storm ? 1 : 0.7), 0, 1));
  const flat = cover * 0.3 + (storm ? 0.15 : 0);
  const snowy = scene.snow > 0;
  light.far = mixRgb(light.far, shade(light.far, snowy ? 0.15 : -0.1), flat);
  light.near = mixRgb(light.near, shade(light.near, snowy ? 0.12 : -0.12), flat);
  light.stars *= clamp(1 - cover * 1.4, 0, 1);
  return light;
}

/** How far the household's night takes every color toward a warm near-black (spec 3.3, Night). */
export const NIGHT_DIM = 0.45;
const NIGHT_INK = hex('#0b0806');

/** The household's night: the same light, darker overall and a little warmer; the moon dims less, the stars stay. */
export function nightLight(light: Light): Light {
  const dim = (c: Rgb, k = NIGHT_DIM): Rgb => mixRgb(c, NIGHT_INK, k);
  return {
    ...light,
    sky: three(j => dim(light.sky[j])),
    glow: [light.glow[0], light.glow[1] * 0.5],
    far: dim(light.far),
    near: dim(light.near),
    pine: dim(light.pine),
    snow: dim(light.snow),
    cloud: dim(light.cloud),
    sunColor: dim(light.sunColor, 0.15),
  };
}

/** Where the horizon sits: lower on a tall screen, so the sky has room above the info. */
export function horizonAt(width: number, height: number): number {
  return height * (height > width ? 0.58 : 0.47);
}

/**
 * The sun's (or moon's) center in the scene, from the left of the visible
 * width: it rises at a tenth of the way across, below the far range, arcs up
 * to a tenth of the height from the top, and sets at nine tenths across.
 */
export function sunPosition(minute: number, rise: number, set: number, width: number, height: number, horizon: number): { x: number; y: number } {
  const { p } = sunAt(minute, rise, set);
  const band = height - horizon;
  return { x: width * (0.1 + 0.8 * p), y: horizon + band * 0.12 - Math.sin(Math.PI * p) * (horizon - height * 0.1) };
}

/** A new moon to count from (2000-01-06 18:14 UTC) and the mean lunar month in days. */
const NEW_MOON_MS = Date.UTC(2000, 0, 6, 18, 14);
export const LUNAR_MONTH_DAYS = 29.530588853;

/** How far the moon is through its month: 0 new, 0.25 first quarter, 0.5 full, 0.75 last quarter. */
export function moonPhase(date: Date): number {
  const p = ((date.getTime() - NEW_MOON_MS) / 86_400_000 / LUNAR_MONTH_DAYS) % 1;
  return p < 0 ? p + 1 : p;
}

/** At or above this fog, the valleys fill with fog patches; below it, rain still leaves one in the far valley. */
export const FOG_BANK = 0.5;

/** The paper clouds for the weather: the seed of their layout, how many of each, and the fog patches per valley. */
export interface CloudPlan {
  seed: number;
  /** High small clouds, then low ones, then the heavy cover's extra high ones (added in that order). */
  high: number;
  low: number;
  more: number;
  /** A storm's two tall clouds. */
  towers: number;
  /** Fog patches rising from the far, middle, and near valleys. */
  fog: [number, number, number];
}

/** The mockup's weather presets in its order, which its cloud seeds count by. */
function presetOf(scene: WeatherScene): number {
  if (scene.storm) return 5;
  if (scene.fog >= FOG_BANK) return 3;
  if (scene.snow > 0) return 6;
  if (scene.rain > 0) return 4;
  if (scene.cover >= 0.6) return 2;
  return scene.cover >= 0.2 ? 1 : 0;
}

/**
 * The clouds for the weather, as the mockup lays them out: more and thicker as
 * the cover grows, never long thin strips; fog fills the valleys, rain leaves
 * one patch in the far valley. Its presets keep their own seeds, so the sky for
 * "partly cloudy" at 35% is the one the mockup showed.
 */
export function cloudPlan(scene: WeatherScene, life = false): CloudPlan {
  const cover = clamp(scene.cover, 0, 1);
  const fog: [number, number, number] = scene.fog >= FOG_BANK ? [2, 2, 1] : scene.rain > 0 ? [1, 0, 0] : [0, 0, 0];
  return {
    seed: 55 + Math.round(cover * 20) + presetOf(scene) * 7,
    // Calm-day life (0.12.0): even a clear sky keeps three small fair-weather puffs drifting.
    high: Math.max(Math.round(cover * 4), life ? LIFE.puffs : 0),
    low: 1 + Math.round(cover * 5),
    more: cover > 0.55 ? Math.round((cover - 0.55) * 7) : 0,
    towers: scene.storm ? 2 : 0,
    fog,
  };
}

// ---- 0.12.0: the living sky's life, seasons, rainbow, moon, entrance, and dimming (mockup v15) ----

/** Calm-day life, with Motion Full only: what moves, how far, and how often. */
export const LIFE = {
  /** The sun's rays turn once in this many seconds. */
  raysTurnS: 240,
  /** The sun and its glow breathe once in this many seconds. */
  breathS: 7,
  puffs: 3,
  /** High and low clouds drift this much quicker. */
  puffSpeed: 2.4,
  /** The groups sway this far (px, far to near) on these cycles (seconds). */
  swayX: [6, 22] as const,
  swayY: [2, 5] as const,
  swayPeriod: [95, 120] as const,
  /**
   * A flock of paper birds crosses every minute or two by day (0.13.3: every few minutes left the sky
   * empty most of the time), the first soon after the sky comes in; a shooting star now and then at night.
   */
  flockEveryMs: [60_000, 120_000] as const,
  firstFlockMs: [10_000, 30_000] as const,
  /** About one flock in three flies close, in front of the land (0.13.3, the owner). */
  nearShare: 1 / 3,
  meteorEveryMs: [120_000, 300_000] as const,
};

/**
 * Far flocks fly behind the land, small and slow; close ones in front of it,
 * twice the size, lower, fewer, and quicker across, the way something near
 * crosses your view faster than something far away. `size` scales a far
 * bird's 46 by 20 px, `scale` is each bird's own size within its flock, `y`
 * the leader's height as a share of the screen's, `crossS` the seconds to
 * cross its width. Far ones fly where the info sits in a top corner, so a
 * close one flies below it (the kitchen's Today card ends at 0.344 of the
 * height) and above a bottom corner's.
 */
export const FLOCKS = {
  far: { count: [4, 7], size: 1, scale: [0.6, 1.05], y: [0.16, 0.36], crossS: [26, 36] },
  near: { count: [2, 4], size: 2, scale: [0.85, 1.1], y: [0.36, 0.52], crossS: [11, 15] },
} as const;

/** One bird of a flock: where it flies from the leader (px), its own size, and its wing beat's phase. */
export interface FlockBird {
  dx: number;
  dy: number;
  s: number;
  ph: number;
}

/** One flock's crossing: close or far, which way (1 left to right), and its birds, the leader first. */
export interface FlockPlan {
  near: boolean;
  size: number;
  dir: 1 | -1;
  birds: FlockBird[];
  y: number;
  crossS: number;
}

/** The next flock (0.13.3): close about one time in three, with the wind behind it when it blows. */
export function flockPlan(windy: boolean, random: () => number = Math.random): FlockPlan {
  const near = random() < LIFE.nearShare;
  const k = near ? FLOCKS.near : FLOCKS.far;
  const pick = (range: readonly [number, number]) => range[0] + random() * (range[1] - range[0]);
  const dir: 1 | -1 = windy || random() < 0.5 ? 1 : -1;
  const count = k.count[0] + Math.min(k.count[1] - k.count[0], Math.floor(random() * (k.count[1] - k.count[0] + 1)));
  const birds = Array.from({ length: count }, (_, i): FlockBird => {
    // A loose V: the leader in front, the others behind on either side, spaced by the birds' size.
    const rank = Math.ceil(i / 2);
    const side = i % 2 ? -1 : 1;
    return {
      dx: rank ? -rank * 46 * k.size * dir : 0,
      dy: (rank * 16 * side + (random() - 0.5) * 10) * k.size,
      s: pick(k.scale),
      ph: random() * 6.28,
    };
  });
  return { near, size: k.size, dir, birds, y: pick(k.y), crossS: pick(k.crossS) };
}

/** How far the sheets sway at time `t` (seconds), group `gi` of `groups`. */
export function swayAt(t: number, gi: number, groups: number, life: boolean): { x: number; y: number } {
  const k = groups > 1 ? gi / (groups - 1) : 0;
  const ax = life ? LIFE.swayX[0] + LIFE.swayX[1] * k : 3 + 11 * k;
  const ay = life ? LIFE.swayY[0] + LIFE.swayY[1] * k : 1 + 3 * k;
  const px = life ? LIFE.swayPeriod[0] : 150;
  const py = life ? LIFE.swayPeriod[1] : 190;
  return { x: Math.sin((t / px) * 6.283 + gi * 1.7) * ax, y: Math.cos((t / py) * 6.283 + gi) * ay };
}

/** Wind in gusts (0.12.0): a little faster, then a lot, never a steady conveyor belt. 1 without wind. */
export function gustAt(t: number, wind: number): number {
  if (!(wind > 1)) return 1;
  return 1 + (wind - 1) * (0.55 + 0.45 * (0.5 + 0.5 * Math.sin(t / 3.7) * Math.sin(t / 1.9 + 1)));
}

export type Season = 'spring' | 'summer' | 'autumn' | 'winter';
const NORTH_SEASONS: Season[] = ['winter', 'winter', 'spring', 'spring', 'spring', 'summer', 'summer', 'summer', 'autumn', 'autumn', 'autumn', 'winter'];

/** The season by month, six months on south of the equator (Home Assistant's latitude). */
export function seasonAt(date: Date, latitude?: number | null): Season {
  const month = date.getMonth();
  const south = typeof latitude === 'number' && latitude < 0;
  return NORTH_SEASONS[south ? (month + 6) % 12 : month];
}

/** On the two nearer sheets some trees are broadleaf, and they turn with the season; the high tree line stays evergreen. */
export const LEAFY: Readonly<Record<number, number>> = { 4: 0.38, 5: 0.46 };
export const CROWNS: Readonly<Record<Season, readonly string[]>> = {
  spring: ['#9cc97f', '#f2c4d2', '#8fbf73', '#fbe4ec', '#a6cf86'],
  summer: ['#4f8a4a', '#5f9b55', '#467f43', '#58924d'],
  autumn: ['#d9822b', '#c0532f', '#e3a53c', '#a85a2a', '#c9b04a', '#9b8a3e'],
  winter: [],
};

/** Winter lays more snow on the peaks and a dusting on the alpine range below them. */
export function snowFor(snow: number | undefined, d: number, season: Season): number {
  if (season !== 'winter') return snow || 0;
  return snow ? Math.min(0.92, snow * 1.45) : d === 3 ? 0.24 : 0;
}

/** The nearer hills' ground: fresher in spring, deeper in summer, golden in autumn, under snow in winter. */
export function seasonGround(c: Rgb, d: number, light: Light, season: Season): Rgb {
  const near = d >= 4 ? 1 : d === 3 ? 0.5 : 0;
  if (!near) return c;
  if (season === 'winter') return mixRgb(c, light.snow, d === 5 ? 0.62 : d === 4 ? 0.52 : 0.28);
  const day = clamp((light.e + 8) / 20, 0, 1);
  const [tint, k] = ({ spring: ['#86b97a', 0.13], summer: ['#5f9a5c', 0.1], autumn: ['#a8925a', 0.22] } as const)[season];
  return mixRgb(c, hex(tint), k * near * day);
}

/** A rainbow shows by day for about 20 minutes after rain stops: in over the first part, out over the last. */
export const RAINBOW_MS = 20 * 60_000;
/** The Home Assistant conditions that count as rain (kept with the page's rain record). */
export { RAIN_CONDITIONS } from '../../core/rain-record';

/**
 * Fireflies come out on dry summer evenings (review m12b M6: not all night):
 * from a little before sunset until the sky is fully dark, which is about
 * when the sun is 12 degrees down.
 */
export function firefliesOut(elevation: number, minute: number, rise: number, set: number): boolean {
  const evening = minute >= (rise + set) / 2 || minute < rise - 60;
  return evening && elevation < 4 && elevation > -12;
}

/** How strongly the rainbow shows this long after the rain stopped, 0 to 1. */
export function rainbowStrength(sinceRainMs: number): number {
  if (!(sinceRainMs >= 0) || sinceRainMs >= RAINBOW_MS) return 0;
  const s = sinceRainMs / RAINBOW_MS;
  if (s < 0.12) return smooth(s / 0.12);
  if (s > 0.82) return smooth((1 - s) / 0.18);
  return 1;
}

/** Whether the weather now leaves room for a rainbow: no rain, snow, or storm, and some sky. */
export function rainbowWeather(scene: WeatherScene): boolean {
  return scene.rain === 0 && scene.snow === 0 && !scene.storm && scene.cover < 0.75;
}

/**
 * The moon as a lit sphere, pixel by pixel (RGBA, size by size): each point lit
 * from the sun's side for the phase, the terminator a soft band from just
 * before the shadow line to just past it, the rim antialiased (the owner, v11).
 */
export function moonPixels(size: number, phase: number, light: Rgb, dark: Rgb): Uint8ClampedArray {
  const px = new Uint8ClampedArray(size * size * 4);
  const a = 2 * Math.PI * phase;
  const lx = Math.sin(a);
  const lz = -Math.cos(a);
  const rr = size / 2;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const nx = (x + 0.5 - rr) / rr;
      const ny = (y + 0.5 - rr) / rr;
      const q = nx * nx + ny * ny;
      if (q >= 1) continue;
      const nz = Math.sqrt(1 - q);
      const t = smooth(clamp((nx * lx + nz * lz + 0.06) / 0.3, 0, 1));
      const i = (y * size + x) * 4;
      for (let k = 0; k < 3; k++) px[i + k] = dark[k] + (light[k] - dark[k]) * t;
      px[i + 3] = 255 * clamp((1 - Math.sqrt(q)) * rr, 0, 1);
    }
  }
  return px;
}

/**
 * The entrance (the owner, v5 to v14), in milliseconds before ENTRANCE_PACE: the
 * sky fades over the card, the sheets rise far to near with their mist, the sun
 * or moon swings up, clouds slide in, the clock drops with a bounce and the
 * day's words follow, the card swings on its pegs, and a rainbow already out
 * comes last.
 */
export const ENTRANCE_PACE = 1.6;
export const ENTRANCE = {
  sky: { delay: 0, duration: 700 },
  glow: { delay: 350, duration: 900 },
  stars: { delay: 400, duration: 1200 },
  sheets: { delay: 250, step: 160, duration: 1100 },
  mist: { delay: 410, step: 160, duration: 1100 },
  sun: { delay: 550, duration: 1400 },
  clouds: { delay: 600, step: 80, duration: 1600 },
  clock: { delay: 1200, duration: 1000 },
  line: { delay: 1550, duration: 600 },
  card: { delay: 1350, duration: 1700 },
  rainbow: { delay: 1700, duration: 1500 },
} as const;
/** Waking: a quick fade back to the card. */
export const WAKE_FADE_MS = 260;

/**
 * Where a part of the info drops in from (review m12 E): far enough above
 * that its whole box, tilted, starts off the top of the screen, whichever
 * corner it ends in. `bottom` is its box's bottom edge where it ends.
 */
export function dropFrom(bottom: number): string {
  return `0 ${-dropDistance(bottom)}px`;
}

/** How far a part falls, in px, to end with its box's bottom edge at `bottom`. */
export function dropDistance(bottom: number): number {
  return Math.ceil(Math.max(0, bottom) + 48);
}

/** The clock's spring in the owner's mockups (v5 to v14), which dropped it from half again its own height. */
const DROP_SPRING = { stiffness: 260, damping: 13, ms: 1000 } as const;
const MOCKUP_DROP = 1.5;

/**
 * The clock's bounce for a fall of `distance` px (0.13.2): the mockups' spring,
 * damped more for a longer fall, so it passes its spot by no more than it did
 * in the mockups. A spring overshoots by a share of how far it travels; from
 * just above the screen to a bottom corner that share carried the clock off
 * the bottom of the kitchen's screen and back up.
 */
export function dropEase(distance: number, height: number): string {
  const { stiffness, damping, ms } = DROP_SPRING;
  const reach = MOCKUP_DROP * Math.max(0, height);
  if (distance <= reach) return springEase(stiffness, damping, ms);
  // The share a spring overshoots by is exp(-pi z / sqrt(1 - z^2)) for its damping ratio z.
  const ratio = damping / (2 * Math.sqrt(stiffness));
  const share = Math.max(1e-4, Math.exp(-Math.PI * ratio / Math.sqrt(1 - ratio * ratio)) * reach / distance);
  const l = -Math.log(share) / Math.PI;
  return springEase(stiffness, 2 * Math.sqrt(stiffness) * (l / Math.sqrt(1 + l * l)), ms);
}

/** The sun or moon swinging up from behind the peaks, unseen until its turn (review m12 E). */
export const SUN_FRAMES: Keyframe[] = [
  { translate: '-9vw 46vh', scale: '0.7', opacity: 0 },
  { opacity: 1, offset: 0.2 },
  { translate: '-3vw 9vh', scale: '0.96', offset: 0.6 },
  { translate: '0 0', scale: '1', opacity: 1 },
];

/** A spring as CSS linear() points, the way PlanaVista's motion system draws springs. */
export function springEase(stiffness: number, damping: number, ms: number): string {
  const dt = 1 / 600;
  const steps = Math.round(ms / 1000 / dt);
  const every = Math.max(1, Math.round(steps / 60));
  const pts: number[] = [];
  let x = 0;
  let v = 0;
  for (let i = 0; i <= steps; i++) {
    if (i % every === 0) pts.push(x);
    v += (stiffness * (1 - x) - damping * v) * dt;
    x += v * dt;
  }
  pts.push(1);
  return `linear(${pts.map(p => p.toFixed(4)).join(', ')})`;
}

/** The light at a dimmed shared screen's level (0.12.0): every color the scene draws from it. */
export function dimLight(light: Light, level: number): Light {
  if (level >= 1) return light;
  const d = (c: Rgb) => dimRgb(c, level);
  return {
    ...light,
    sky: three(j => d(light.sky[j])),
    glow: [d(light.glow[0]), light.glow[1]],
    far: d(light.far),
    near: d(light.near),
    pine: d(light.pine),
    snow: d(light.snow),
    cloud: d(light.cloud),
    // The sun and moon are small and bright: they keep the text rule.
    sunColor: dimRgb(light.sunColor, level, true),
  };
}

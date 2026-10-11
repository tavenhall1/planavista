/**
 * Colors are measured, not eyeballed (spec 11.3). OKLCH derives dark
 * versions and tints that keep a color's hue; WCAG relative luminance
 * measures contrast.
 */

export interface Oklch {
  /** Lightness, 0 (black) to 1 (white). */
  l: number;
  /** Chroma, 0 (gray) to about 0.37. */
  c: number;
  /** Hue in degrees, 0 to 360. */
  h: number;
}

export const WHITE = '#FFFFFF';
export const NEAR_BLACK = '#1A1B1E';

/** '#RGB' or '#RRGGBB' (either case) as 0 to 255 channels; null when it isn't a hex color. */
export function parseHex(hex: string): [number, number, number] | null {
  const match = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex.trim());
  if (!match) return null;
  const digits = match[1].length === 3 ? match[1].split('').map(d => d + d).join('') : match[1];
  return [0, 2, 4].map(i => parseInt(digits.slice(i, i + 2), 16)) as [number, number, number];
}

/** 0 to 255 channels as '#RRGGBB' (rounded and clamped). */
export function toHex(r: number, g: number, b: number): string {
  const part = (v: number) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, '0');
  return `#${part(r)}${part(g)}${part(b)}`.toUpperCase();
}

function toLinear(channel: number): number {
  const v = channel / 255;
  return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
}

function fromLinear(v: number): number {
  return (v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055) * 255;
}

/** WCAG relative luminance: 0 for black, 1 for white; 0 for anything that isn't a hex color. */
export function relativeLuminance(hex: string): number {
  const rgb = parseHex(hex);
  if (!rgb) return 0;
  const [r, g, b] = rgb.map(toLinear);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG contrast ratio of two colors, from 1 (none) to 21 (black on white). */
export function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/**
 * White or near-black text, whichever measures more contrast on `bg`
 * (spec 11.3). The two cross at a relative luminance of about 0.2, where
 * 1.1.0 switched at 0.4 and put white text on colors that read better dark.
 */
export function contrastText(bg: string): string {
  return contrastRatio(bg, WHITE) >= contrastRatio(bg, NEAR_BLACK) ? WHITE : NEAR_BLACK;
}

/** A hex color in OKLCH (Björn Ottosson's OKLab, in polar form). */
export function toOklch(hex: string): Oklch {
  const [r, g, b] = (parseHex(hex) ?? [0, 0, 0]).map(toLinear);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  const c = Math.hypot(A, B);
  const h = c < 1e-6 ? 0 : ((Math.atan2(B, A) * 180) / Math.PI + 360) % 360;
  return { l: L, c, h };
}

function oklchToLinear({ l, c, h }: Oklch): [number, number, number] {
  const A = c * Math.cos((h * Math.PI) / 180);
  const B = c * Math.sin((h * Math.PI) / 180);
  const l3 = (l + 0.3963377774 * A + 0.2158037573 * B) ** 3;
  const m3 = (l - 0.1055613458 * A - 0.0638541728 * B) ** 3;
  const s3 = (l - 0.0894841775 * A - 1.291485548 * B) ** 3;
  return [
    4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3,
    -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3,
    -0.0041960863 * l3 - 0.7034186147 * m3 + 1.707614701 * s3,
  ];
}

function inGamut(rgb: number[]): boolean {
  return rgb.every(v => v >= -1e-4 && v <= 1 + 1e-4);
}

/** The sRGB color for an OKLCH color; chroma shrinks until it fits, keeping lightness and hue. */
export function fromOklch(color: Oklch): string {
  const l = Math.min(1, Math.max(0, color.l));
  let c = Math.max(0, color.c);
  if (!inGamut(oklchToLinear({ l, c, h: color.h }))) {
    let low = 0;
    let high = c;
    for (let i = 0; i < 24; i++) {
      const mid = (low + high) / 2;
      if (inGamut(oklchToLinear({ l, c: mid, h: color.h }))) low = mid;
      else high = mid;
    }
    c = low;
  }
  const [r, g, b] = oklchToLinear({ l, c, h: color.h }).map(v => fromLinear(Math.min(1, Math.max(0, v))));
  return toHex(r, g, b);
}

/**
 * The dark version of a color drawn on dark surfaces: an accent, a
 * person's color, the now line. Same hue, a little brighter (spec 12.4).
 */
export function matchedInk(hex: string): string {
  const { l, c, h } = toOklch(hex);
  return fromOklch({ l: Math.min(0.9, Math.max(l + 0.07, 0.69)), c, h });
}

/** The dark version of a background: its hue, nearly no color, as dark as the dark themes. */
export function matchedSurface(hex: string): string {
  const { c, h } = toOklch(hex);
  return fromOklch({ l: 0.19, c: Math.min(c, 0.02), h });
}

/** The pale fill behind a person's events in dark mode: their hue, low and quiet. */
export function darkTint(hex: string): string {
  const { c, h } = toOklch(hex);
  return fromOklch({ l: 0.255, c: Math.min(c, 0.037), h });
}

/** `hex` moved in OKLCH lightness by `delta` (positive is lighter), hue and chroma kept. */
export function shiftLightness(hex: string, delta: number): string {
  const color = toOklch(hex);
  return fromOklch({ ...color, l: color.l + delta });
}

/**
 * The color nearest to `fg` that has at least `min` contrast on `bg`: the
 * same hue, lightness moved away from the background only as far as needed
 * (the contrast guard's one-tap fix, spec 12.4). `fg` itself (as #RRGGBB)
 * when it already passes; null when no lightness gets there.
 */
export function adjustForContrast(
  fg: string,
  bg: string,
  min: number,
  toward?: 'lighter' | 'darker',
): string | null {
  const rgb = parseHex(fg);
  if (!rgb) return null;
  if (contrastRatio(fg, bg) >= min) return toHex(...rgb);
  const start = toOklch(fg);
  // Away from the background, unless the caller says which way (text that must stay light or dark).
  const target = toward ? (toward === 'lighter' ? 1 : 0) : toOklch(bg).l < 0.5 ? 1 : 0;
  const at = (t: number) => fromOklch({ ...start, l: start.l + (target - start.l) * t });
  if (contrastRatio(at(1), bg) < min) return null;
  let low = 0;
  let high = 1;
  for (let i = 0; i < 24; i++) {
    const mid = (low + high) / 2;
    if (contrastRatio(at(mid), bg) >= min) high = mid;
    else low = mid;
  }
  return at(high);
}

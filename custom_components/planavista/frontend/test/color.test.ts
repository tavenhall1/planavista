import { describe, expect, it } from 'vitest';
import {
  NEAR_BLACK,
  WHITE,
  adjustForContrast,
  contrastRatio,
  contrastText,
  darkTint,
  fromOklch,
  matchedInk,
  matchedSurface,
  parseHex,
  toOklch,
} from '../src/core/color';

// The calendar's color presets (const.py COLOR_PRESETS), the people in the
// approved mockups, the light accent, and the light now line.
const PRESETS = ['#F94144', '#F3722C', '#F8961E', '#F9844A', '#F9C74F', '#90BE6D', '#43AA8B', '#4D908E', '#577590', '#277DA1'];
const PEOPLE = ['#4A90D9', '#9B8EC4', '#6BA368', '#D4728C'];
const DARK_CARD = '#1B1C1F';
const DARK_INK = '#E9E9E6';

function hueDistance(a: number, b: number): number {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
}

describe('parseHex', () => {
  it('reads #RRGGBB and #RGB in either case, and nothing else', () => {
    expect(parseHex('#5B5BD6')).toEqual([91, 91, 214]);
    expect(parseHex('#fff')).toEqual([255, 255, 255]);
    expect(parseHex('var(--pv-accent)')).toBeNull();
    expect(parseHex('#12345')).toBeNull();
  });
});

describe('contrastRatio', () => {
  it('runs from 1 to 21 and is the same both ways', () => {
    expect(contrastRatio('#FFFFFF', '#000000')).toBeCloseTo(21, 5);
    expect(contrastRatio('#5B5BD6', '#5B5BD6')).toBeCloseTo(1, 5);
    expect(contrastRatio('#777777', '#FFFFFF')).toBeCloseTo(contrastRatio('#FFFFFF', '#777777'), 10);
  });
});

describe('contrastText', () => {
  it('picks whichever of white and near-black measures more contrast', () => {
    expect(contrastText('#FFFFFF')).toBe(NEAR_BLACK);
    expect(contrastText('#000000')).toBe(WHITE);
    expect(contrastText('#6366F1')).toBe(WHITE);
    expect(contrastText('#277DA1')).toBe(WHITE);
    expect(contrastText('#F9C74F')).toBe(NEAR_BLACK);
  });

  it('puts dark text on colors that 1.1.0 gave white text', () => {
    // 1.1.0 switched at a luminance of 0.4; these measure about 0.24 and 0.32.
    expect(contrastText('#F94144')).toBe(NEAR_BLACK);
    expect(contrastText('#43AA8B')).toBe(NEAR_BLACK);
  });

  it('crosses over at a relative luminance of about 0.2', () => {
    expect(contrastText('#7C7C7C')).toBe(WHITE); // 0.2016
    expect(contrastText('#7E7E7E')).toBe(NEAR_BLACK); // 0.2086
  });

  it('gives white for anything that is not a hex color, as 1.1.0 did', () => {
    expect(contrastText('var(--pv-accent)')).toBe(WHITE);
  });
});

describe('OKLCH', () => {
  it('measures the light accent', () => {
    const { l, c, h } = toOklch('#5B5BD6');
    expect(l).toBeCloseTo(0.5403, 3);
    expect(c).toBeCloseTo(0.1841, 3);
    expect(h).toBeCloseTo(278.3, 0);
  });

  it('round-trips every color preset exactly', () => {
    for (const hex of PRESETS) expect(fromOklch(toOklch(hex))).toBe(hex);
  });

  it('keeps out-of-gamut colors in sRGB by giving up chroma, not lightness', () => {
    const vivid = fromOklch({ l: 0.75, c: 0.4, h: 145 });
    expect(parseHex(vivid)).not.toBeNull();
    expect(toOklch(vivid).l).toBeCloseTo(0.75, 2);
  });
});

describe('matched dark colors', () => {
  it('keep their hue, brighten, and read on the dark card', () => {
    for (const hex of [...PRESETS, ...PEOPLE, '#5B5BD6', '#E5484D']) {
      const ink = matchedInk(hex);
      expect(hueDistance(toOklch(ink).h, toOklch(hex).h), hex).toBeLessThan(1.5);
      expect(toOklch(ink).l, hex).toBeGreaterThan(Math.min(0.9, toOklch(hex).l + 0.07) - 0.005);
      expect(contrastRatio(ink, DARK_CARD), hex).toBeGreaterThanOrEqual(4.5);
    }
  });

  it('come close to the approved dark people colors', () => {
    expect(toOklch(matchedInk('#4A90D9')).l).toBeCloseTo(toOklch('#62A3EA').l, 1);
    expect(toOklch(matchedInk('#6BA368')).l).toBeCloseTo(toOklch('#80BB7C').l, 1);
  });

  it('give each person a quiet dark tint that dark text reads well on', () => {
    for (const hex of [...PRESETS, ...PEOPLE]) {
      const tint = darkTint(hex);
      expect(toOklch(tint).l, hex).toBeCloseTo(0.255, 2);
      expect(hueDistance(toOklch(tint).h, toOklch(hex).h), hex).toBeLessThan(3);
      expect(contrastRatio(DARK_INK, tint), hex).toBeGreaterThanOrEqual(12);
    }
  });

  it('turn a light background into a dark one of the same hue', () => {
    const surface = matchedSurface('#FFF4E6');
    expect(toOklch(surface).l).toBeCloseTo(0.19, 2);
    expect(contrastRatio(DARK_INK, surface)).toBeGreaterThanOrEqual(12);
  });
});

describe('adjustForContrast', () => {
  it('leaves a color that already reads', () => {
    expect(adjustForContrast('#5b5bd6', '#FFFFFF', 3)).toBe('#5B5BD6');
  });

  it('brightens a color on a dark background just enough', () => {
    const fixed = adjustForContrast('#3B3BB0', DARK_CARD, 3)!;
    expect(contrastRatio(fixed, DARK_CARD)).toBeGreaterThanOrEqual(3);
    expect(contrastRatio(fixed, DARK_CARD)).toBeLessThan(3.1);
    expect(hueDistance(toOklch(fixed).h, toOklch('#3B3BB0').h)).toBeLessThan(3);
  });

  it('darkens a color on a light background just enough', () => {
    const fixed = adjustForContrast('#F9C74F', '#FFFFFF', 3)!;
    expect(contrastRatio(fixed, '#FFFFFF')).toBeGreaterThanOrEqual(3);
    expect(contrastRatio(fixed, '#FFFFFF')).toBeLessThan(3.1);
  });

  it('gives null when no lightness gets there, or for something that is not a color', () => {
    expect(adjustForContrast('#808080', '#7F7F7F', 22)).toBeNull();
    expect(adjustForContrast('red', '#FFFFFF', 3)).toBeNull();
  });
});

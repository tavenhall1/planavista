import { describe, expect, it } from 'vitest';
import { contrastRatio, matchedInk, matchedSurface, toOklch } from '../src/core/color';
import { Look, Mode, ThemePair, applyTokens, personColors, themeTokens } from '../src/styles/theme-pairs';

const PLAIN: Look = { pair: 'planavista', light: {}, dark: {}, shape: {} };
const look = (changes: Partial<Look>): Look => ({ ...PLAIN, ...changes });
const PAIRS: ThemePair[] = ['planavista', 'minimal', 'vibrant'];
const MODES: Mode[] = ['light', 'dark'];

/** The 20 colors the swatch picker offers, which households choose accents and backgrounds from. */
const PRESETS = [
  '#001219', '#005F73', '#0A9396', '#94D2BD', '#E9D8A6', '#EE9B00', '#CA6702', '#BB3E03', '#AE2012', '#9B2226',
  '#F94144', '#F3722C', '#F8961E', '#F9844A', '#F9C74F', '#90BE6D', '#43AA8B', '#4D908E', '#577590', '#277DA1',
];

function hueDistance(a: number, b: number): number {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
}

describe('themeTokens: the approved versions', () => {
  it('PlanaVista light is warm white with an indigo accent and a plain header', () => {
    const t = themeTokens(PLAIN, 'light');
    expect(t['--pv-bg']).toBe('#F8F8F6');
    expect(t['--pv-card-bg']).toBe('#FFFFFF');
    expect(t['--pv-text']).toBe('#1A1B1E');
    expect(t['--pv-accent']).toBe('#5B5BD6');
    expect(t['--pv-header-gradient']).toBe('#FFFFFF');
    expect(t['--pv-header-text']).toBe('#1A1B1E');
    expect(t['color-scheme']).toBe('light');
  });

  it('PlanaVista dark gets lighter as surfaces come forward, with no shadows', () => {
    const t = themeTokens(PLAIN, 'dark');
    expect(t['--pv-bg']).toBe('#111214');
    expect(t['--pv-card-bg']).toBe('#1B1C1F');
    expect(t['--pv-card-bg-elevated']).toBe('#25272B');
    expect(t['--pv-accent']).toBe('#6262DE');
    expect(t['--pv-accent-ink']).toBe('#8E8EF2');
    expect(t['--pv-shadow']).toBe('none');
    expect(t['color-scheme']).toBe('dark');
  });

  it('Minimal dark fills its accent with near-white and dark letters', () => {
    const t = themeTokens(look({ pair: 'minimal' }), 'dark');
    expect(t['--pv-accent']).toBe('#EDEDED');
    expect(t['--pv-accent-text']).toBe('#111214');
  });

  it('Vibrant keeps its gradient header in both versions', () => {
    expect(themeTokens(look({ pair: 'vibrant' }), 'light')['--pv-header-gradient']).toContain('#7C3AED');
    expect(themeTokens(look({ pair: 'vibrant' }), 'dark')['--pv-header-gradient']).toContain('#4C1D95');
  });

  it.each(PAIRS.flatMap(pair => MODES.map(mode => [pair, mode] as const)))('%s %s reads (spec 11.8)', (pair, mode) => {
    const t = themeTokens(look({ pair }), mode);
    const card = t['--pv-card-bg'];
    expect(contrastRatio(t['--pv-text'], card)).toBeGreaterThanOrEqual(7);
    expect(contrastRatio(t['--pv-text-secondary'], card)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(t['--pv-text-muted'], card)).toBeGreaterThanOrEqual(3);
    expect(contrastRatio(t['--pv-accent-text'], t['--pv-accent'])).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(t['--pv-accent-ink'], card)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(t['--pv-accent-tint-ink'], t['--pv-accent-tint'])).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(t['--pv-now-color'], card)).toBeGreaterThanOrEqual(3);
    expect(contrastRatio(t['--pv-warn-ink'], t['--pv-warn-bg'])).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(t['--pv-bad-ink'], t['--pv-bad-bg'])).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio('#FFFFFF', t['--pv-danger'])).toBeGreaterThanOrEqual(4.5);
    if (t['--pv-header-gradient'].startsWith('#')) {
      expect(contrastRatio(t['--pv-header-text'], t['--pv-header-gradient'])).toBeGreaterThanOrEqual(4.5);
    }
  });
});

describe('themeTokens: customizing', () => {
  it('a light accent gets a Matched dark accent of the same hue', () => {
    const t = themeTokens(look({ light: { accent: '#277DA1' } }), 'dark');
    expect(t['--pv-accent']).toBe(matchedInk('#277DA1'));
    expect(hueDistance(toOklch(t['--pv-accent']).h, toOklch('#277DA1').h)).toBeLessThan(1.5);
    expect(contrastRatio(t['--pv-accent-text'], t['--pv-accent'])).toBeGreaterThanOrEqual(4.5);
  });

  it('a dark color set by hand wins over the Matched one', () => {
    const t = themeTokens(look({ light: { accent: '#277DA1' }, dark: { accent: '#8E8EF2' } }), 'dark');
    expect(t['--pv-accent']).toBe('#8E8EF2');
  });

  it('a custom light background gets a dark one of its hue, and the text turns light', () => {
    const t = themeTokens(look({ light: { background: '#FFF4E6' } }), 'dark');
    expect(t['--pv-bg']).toBe(matchedSurface('#FFF4E6'));
    expect(t['--pv-text']).toBe('#E9E9E6');
    expect(t['--pv-header-gradient']).toBe(t['--pv-card-bg']);
    expect(contrastRatio(t['--pv-text'], t['--pv-card-bg'])).toBeGreaterThanOrEqual(7);
  });

  it('a dark background picked for the light version still gets light text', () => {
    const t = themeTokens(look({ light: { background: '#202124' } }), 'light');
    expect(t['--pv-text']).toBe('#E9E9E6');
    expect(t['color-scheme']).toBe('dark');
  });

  it('headers can be plain, a preset, or a color, and dark versions follow', () => {
    expect(themeTokens(look({ light: { header: 'gradient_teal' } }), 'light')['--pv-header-text']).toBe('#FFFFFF');
    expect(themeTokens(look({ light: { header: 'gradient_teal' } }), 'dark')['--pv-header-gradient']).toContain('#115E59');
    const solid = themeTokens(look({ light: { header: '#F9C74F' } }), 'light');
    expect(solid['--pv-header-gradient']).toBe('#F9C74F');
    expect(solid['--pv-header-text']).toBe('#1A1B1E');
    const night = themeTokens(look({ light: { header: '#F9C74F' } }), 'dark');
    expect(toOklch(night['--pv-header-gradient']).l).toBeLessThanOrEqual(0.405);
    expect(themeTokens(look({ pair: 'vibrant', light: { header: 'plain' } }), 'light')['--pv-header-gradient']).toBe('#FFFFFF');
  });

  it('the now line follows its light color in dark mode unless set by hand', () => {
    expect(themeTokens(look({ light: { now_color: '#E5484D' } }), 'dark')['--pv-now-color']).toBe(matchedInk('#E5484D'));
    expect(themeTokens(look({ dark: { now_color: '#FFFFFF' } }), 'dark')['--pv-now-color']).toBe('#FFFFFF');
  });

  it('shape settings apply to both versions', () => {
    for (const mode of MODES) {
      const t = themeTokens(look({ shape: { corner_style: 'pill', shadow_depth: 'bold', avatar_border: 'white' } }), mode);
      expect(t['--pv-radius']).toBe('20px');
      expect(t['--pv-shadow']).toContain('rgba(0, 0, 0, 0.15)');
      expect(t['--pv-avatar-border']).toBe('#FFFFFF');
    }
  });
});

describe('themeTokens: text stays readable on the colors a household picks', () => {
  it.each(PRESETS.flatMap(hex => MODES.map(mode => [hex, mode] as const)))(
    'text drawn in a %s accent reads in %s (4.5:1)', (hex, mode) => {
      const t = themeTokens(look({ [mode]: { accent: hex } }), mode);
      expect(contrastRatio(t['--pv-accent-ink'], t['--pv-card-bg'])).toBeGreaterThanOrEqual(4.5);
    },
  );

  it.each(PRESETS.flatMap(hex => MODES.map(mode => [hex, mode] as const)))(
    'secondary and muted text read on a %s background in %s', (hex, mode) => {
      const t = themeTokens(look({ [mode]: { background: hex } }), mode);
      const card = t['--pv-card-bg'];
      const best = contrastRatio(t['--pv-text'], card);
      // Where the main text can't reach 4.5:1 the contrast guard flags the background; otherwise every level reads.
      expect(contrastRatio(t['--pv-text-secondary'], card)).toBeGreaterThanOrEqual(Math.min(4.5, best));
      expect(contrastRatio(t['--pv-text-muted'], card)).toBeGreaterThanOrEqual(Math.min(3, best));
    },
  );
});

describe('personColors', () => {
  it('keeps a person colors in light mode and derives both in dark mode', () => {
    expect(personColors('#F94144', '#FDBDBE', 'light')).toEqual({ color: '#F94144', colorLight: '#FDBDBE' });
    const dark = personColors('#F94144', '#FDBDBE', 'dark');
    expect(dark.color).toBe(matchedInk('#F94144'));
    expect(toOklch(dark.colorLight).l).toBeCloseTo(0.255, 2);
  });
});

describe('applyTokens', () => {
  function fakeElement() {
    const style = new Map<string, string>();
    const element = {
      style: {
        setProperty: (name: string, value: string) => style.set(name, value),
        removeProperty: (name: string) => style.delete(name),
      },
    } as unknown as HTMLElement;
    return { element, style };
  }

  it('sets tokens and removes ones that are gone', () => {
    const { element, style } = fakeElement();
    applyTokens(element, { '--pv-bg': '#000000', '--pv-avatar-border': '#FFFFFF' });
    applyTokens(element, { '--pv-bg': '#FFFFFF' });
    expect(style.get('--pv-bg')).toBe('#FFFFFF');
    expect(style.has('--pv-avatar-border')).toBe(false);
  });
});

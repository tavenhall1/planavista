import { describe, expect, it } from 'vitest';
import {
  DIM_DAY_CHOICES,
  DIM_NIGHT_CHOICES,
  DIM_STEP_MS,
  dimColor,
  dimLevel,
  dimTokens,
  fadeBetween,
  LIGHT_FLOOR,
  mediaBrightness,
  surfaceLevel,
} from '../src/core/dimming';
import { contrastRatio } from '../src/core/color';
import { Look, Mode, ThemePair, themeTokens } from '../src/styles/theme-pairs';
import type { Member } from '../src/core/household';

const LEVELS = { day: 100, night: 30 };
const at = (h: number, m = 0, day = 14) => new Date(2026, 9, day, h, m); // Wednesday, October 14, 2026
const member = (bed: string | null, hours: number | null = null): Member =>
  ({ id: bed ?? 'x', name: 'A', color: '#fb8072', color_dark: null, bedtime: bed ? { weeknight: bed, weekend: bed } : null, sleep_hours: hours } as unknown as Member);

describe('the choices', () => {
  it('match the backend (100 at night is no dimming)', () => {
    expect(DIM_DAY_CHOICES).toEqual([100, 85, 70]);
    expect(DIM_NIGHT_CHOICES).toEqual([100, 50, 30, 15, 8]);
    expect(DIM_STEP_MS).toBe(15_000);
  });
});

describe('fadeBetween', () => {
  it('starts and ends on the levels and runs evenly by eye', () => {
    expect(fadeBetween(1, 0.3, 0)).toBe(1);
    expect(fadeBetween(1, 0.3, 1)).toBeCloseTo(0.3, 10);
    // Halfway is halfway in the cube root, not in the light: the eye barely sees the first drops
    // from a bright screen, so by the middle less light is left than the plain average.
    const mid = fadeBetween(1, 0.3, 0.5);
    expect(Math.cbrt(mid)).toBeCloseTo((1 + Math.cbrt(0.3)) / 2, 10);
    expect(mid).toBeLessThan(0.65);
  });
});

describe('dimLevel', () => {
  // With nobody's Sleep times, night runs 10:00 PM to 6:30 AM.
  const none: Member[] = [];
  it('is the day level by day and the night level at night', () => {
    expect(dimLevel(at(14), none, null, LEVELS)).toEqual({ level: 1, fading: false });
    expect(dimLevel(at(23, 15), none, null, LEVELS)).toEqual({ level: 0.3, fading: false });
    expect(dimLevel(at(3), none, null, LEVELS)).toEqual({ level: 0.3, fading: false });
  });

  it('fades for 30 minutes into the night and is there as it begins', () => {
    expect(dimLevel(at(21, 29), none, null, LEVELS).level).toBe(1);
    const start = dimLevel(at(21, 30), none, null, LEVELS);
    expect(start.fading).toBe(true);
    expect(start.level).toBeCloseTo(1, 6);
    const mid = dimLevel(at(21, 45), none, null, LEVELS);
    expect(mid.level).toBeCloseTo(fadeBetween(1, 0.3, 0.5), 6);
    expect(dimLevel(at(22, 0), none, null, LEVELS)).toEqual({ level: 0.3, fading: false });
  });

  it('comes back up over 10 minutes as night ends', () => {
    expect(dimLevel(at(6, 29), none, null, LEVELS).level).toBe(0.3);
    const up = dimLevel(at(6, 35), none, null, LEVELS);
    expect(up.fading).toBe(true);
    expect(up.level).toBeCloseTo(fadeBetween(0.3, 1, 0.5), 6);
    expect(dimLevel(at(6, 40), none, null, LEVELS)).toEqual({ level: 1, fading: false });
  });

  it("follows Sleep times, the night's own times, and a night past midnight", () => {
    const late = [member('23:30', 8)]; // night 11:30 PM to 7:30 AM
    expect(dimLevel(at(23, 0), late, null, LEVELS).fading).toBe(true);
    expect(dimLevel(at(7, 0), late, null, LEVELS).level).toBe(0.3);
    expect(dimLevel(at(7, 35), late, null, LEVELS).fading).toBe(true);
    const set = { from: '00:30', to: '05:00' }; // after midnight: its fade starts at midnight
    expect(dimLevel(at(23, 59), none, set, LEVELS).level).toBe(1);
    expect(dimLevel(at(0, 15, 15), none, set, LEVELS).fading).toBe(true);
    expect(dimLevel(at(1, 0, 15), none, set, LEVELS).level).toBe(0.3);
  });

  it('leaves the screen alone at 100%, and uses the day level by day', () => {
    expect(dimLevel(at(23), none, null, { day: 100, night: 100 })).toEqual({ level: 1, fading: false });
    expect(dimLevel(at(14), none, null, { day: 70, night: 30 }).level).toBe(0.7);
    expect(dimLevel(at(21, 45), none, null, { day: 70, night: 70 }).fading).toBe(false);
  });
});

describe('dimLevel at the edges (review m12)', () => {
  const none: Member[] = [];
  it('fades in before a set night that starts at or just after midnight', () => {
    const midnight = { from: '00:00', to: '06:00' };
    const fade = dimLevel(at(23, 45), none, midnight, LEVELS);
    expect(fade.fading).toBe(true);
    expect(fade.level).toBeLessThan(1);
    expect(fade.level).toBeGreaterThan(0.3);
    expect(dimLevel(at(23, 29), none, midnight, LEVELS)).toEqual({ level: 1, fading: false });
    expect(dimLevel(at(0, 10), none, midnight, LEVELS)).toEqual({ level: 0.3, fading: false });
    const late = { from: '00:20', to: '06:00' };
    expect(dimLevel(at(0, 0), none, late, LEVELS).fading).toBe(true);
    expect(dimLevel(at(23, 55), none, late, LEVELS).fading).toBe(true);
  });

  it('never brightens at night: 100 at night keeps the day level all night', () => {
    const levels = { day: 85, night: 100 };
    for (const [h, m] of [[14, 0], [21, 45], [22, 0], [23, 30], [3, 0], [6, 35], [7, 0]]) {
      expect(dimLevel(at(h, m), none, null, levels), `${h}:${m}`).toEqual({ level: 0.85, fading: false });
    }
  });
});

describe('dimColor', () => {
  it('leaves colors alone at full and scales them in real light', () => {
    expect(dimColor('#5B5BD6', 1)).toBe('#5B5BD6');
    // White at 30% gives off 30% of the light, warmer: red stays at the level.
    const r = parseInt(dimColor('#FFFFFF', 0.3).slice(1, 3), 16) / 255;
    const lin = r <= 0.04045 ? r / 12.92 : ((r + 0.055) / 1.055) ** 2.4;
    expect(lin).toBeCloseTo(0.3, 2);
  });

  it('turns warmer as it dims: less blue than red', () => {
    const c = dimColor('#FFFFFF', 0.08);
    const [r, g, b] = [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16));
    expect(r).toBeGreaterThan(g);
    expect(g).toBeGreaterThan(b);
  });

  it('keeps light text easy to read at the darkest level', () => {
    // The dark PlanaVista look's text on its background.
    const ratio = contrastRatio(dimColor('#E9E9E6', 0.08, true), dimColor('#111214', 0.08));
    expect(ratio).toBeGreaterThanOrEqual(4.5);
    // Without the text rule it wouldn't be.
    expect(contrastRatio(dimColor('#E9E9E6', 0.08), dimColor('#111214', 0.08))).toBeLessThan(4.5);
  });

});

// Review m12 A: every word token keeps its contrast with what it sits on, in every look, at every level.
describe('words on a dimmed screen', () => {
  const PAIRS: ThemePair[] = ['planavista', 'minimal', 'vibrant'];
  const MODES: Mode[] = ['light', 'dark'];
  const look = (pair: ThemePair): Look => ({ pair, light: {}, dark: {}, shape: {} });
  const PAIRS_OF: [string, string, number][] = [
    ['--pv-text', '--pv-card-bg', 4.5],
    ['--pv-text-secondary', '--pv-card-bg', 4.5],
    ['--pv-text-muted', '--pv-card-bg', 3],
    ['--pv-accent-ink', '--pv-card-bg', 4.5],
    ['--pv-danger-ink', '--pv-card-bg', 4.5],
    ['--pv-now-color', '--pv-card-bg', 3],
    ['--pv-star', '--pv-card-bg', 3],
    ['--pv-accent-text', '--pv-accent', 4.5],
    ['--pv-accent-tint-ink', '--pv-accent-tint', 4.5],
    ['--pv-warn-ink', '--pv-warn-bg', 4.5],
    ['--pv-bad-ink', '--pv-bad-bg', 4.5],
    ['--pv-header-text', '--pv-header-gradient', 4.5],
    ['--pv-toast-text', '--pv-toast-bg', 4.5],
    ['--pv-toast-action', '--pv-toast-bg', 4.5],
  ];
  const first = (v: string | undefined) => v?.match(/#[0-9a-fA-F]{6}/)?.[0];

  it('keep 4.5:1 (3:1 for muted words and marks), or what the theme gave them', () => {
    let checked = 0;
    for (const pair of PAIRS) for (const mode of MODES) {
      const full = themeTokens(look(pair), mode);
      for (const level of [0.85, 0.7, 0.5, 0.3, 0.15, 0.08]) {
        const dim = dimTokens(full, level, mode);
        for (const [ink, bg, target] of PAIRS_OF) {
          const text = first(full[ink]);
          const back = first(full[bg]);
          if (!text || !back || full[ink] !== text) continue;
          const goal = Math.min(target, contrastRatio(text, back)) - 0.02;
          expect(contrastRatio(dim[ink], first(dim[bg])!), `${pair} ${mode} ${level} ${ink} on ${bg}`).toBeGreaterThanOrEqual(goal);
          checked++;
        }
      }
    }
    expect(checked).toBeGreaterThan(300);
  });

  it('still dim: words no brighter than the theme drew them, surfaces at the level', () => {
    const full = themeTokens(look('planavista'), 'dark');
    const dim = dimTokens(full, 0.08, 'dark');
    expect(dim['--pv-card-bg']).toBe(dimColor(full['--pv-card-bg'], 0.08));
    expect(contrastRatio(dim['--pv-text'], '#000000')).toBeLessThan(contrastRatio(full['--pv-text'], '#000000'));
  });

  it("a light look's surfaces go no darker than the floor", () => {
    expect(LIGHT_FLOOR).toBe(0.25);
    expect(surfaceLevel(0.08, 'light')).toBe(0.25);
    expect(surfaceLevel(0.3, 'light')).toBe(0.3);
    expect(surfaceLevel(0.08, 'dark')).toBe(0.08);
    expect(surfaceLevel(1, 'light')).toBe(1);
    const full = themeTokens(look('minimal'), 'light');
    expect(dimTokens(full, 0.08, 'light')['--pv-bg']).toBe(dimColor(full['--pv-bg'], 0.25));
  });
});

describe('dimTokens', () => {
  it('dims every color in the tokens and leaves the rest', () => {
    const tokens = {
      '--pv-bg': '#111214',
      '--pv-text': '#E9E9E6',
      '--pv-backdrop': 'rgba(0, 0, 0, 0.6)',
      '--pv-today-bg': 'rgba(142, 142, 242, 0.08)',
      '--pv-header-gradient': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      '--pv-radius': '12px',
      'color-scheme': 'dark',
    };
    const dimmed = dimTokens(tokens, 0.3);
    expect(dimmed['--pv-bg']).toBe(dimColor('#111214', 0.3));
    // With no card background among these tokens, text keeps the plain rule.
    expect(dimmed['--pv-text']).toBe(dimColor('#E9E9E6', 0.3, true));
    expect(dimmed['--pv-backdrop']).toBe('rgba(0, 0, 0, 0.6)');
    expect(dimmed['--pv-today-bg']).toMatch(/^rgba\(\d+, \d+, \d+, 0\.08\)$/);
    expect(dimmed['--pv-today-bg']).not.toBe(tokens['--pv-today-bg']);
    expect(dimmed['--pv-header-gradient']).toBe(`linear-gradient(135deg, ${dimColor('#667eea', 0.3)} 0%, ${dimColor('#764ba2', 0.3)} 100%)`);
    expect(dimmed['--pv-radius']).toBe('12px');
    expect(dimmed['color-scheme']).toBe('dark');
  });

  it('hands back the same tokens at full', () => {
    const tokens = { '--pv-bg': '#111214' };
    expect(dimTokens(tokens, 1)).toBe(tokens);
  });
});

describe('mediaBrightness', () => {
  it('is the CSS brightness that scales a picture to the level in real light', () => {
    expect(mediaBrightness(1)).toBe(1);
    expect(mediaBrightness(0.3) ** 2.2).toBeCloseTo(0.3, 6);
  });
});

describe("people's colors on a dimmed screen", () => {
  it('memberColor and withModeColors draw everyone at the level', async () => {
    const { memberColor } = await import('../src/core/household');
    const { withModeColors } = await import('../src/modules/calendar/mode-colors');
    const alex = { id: 'alex', color: '#FB8072', color_dark: null };
    expect(memberColor(alex, 'light')).toBe('#FB8072');
    expect(memberColor(alex, 'light', 0.3)).toBe(dimColor('#FB8072', 0.3));
    expect(memberColor(alex, 'dark', 0.3)).toBe(dimColor(memberColor(alex, 'dark'), 0.3));
    const data = {
      calendars: [{ entity_id: 'calendar.alex', color: '#123456', member_id: 'alex' }, { entity_id: 'calendar.holidays', color: '#4CAF50' }],
      events: [{ calendar_entity_id: 'calendar.holidays', calendar_color: '#4CAF50' }],
    } as never;
    const dimmed = withModeColors(data, 'light', [alex], 0.3)!;
    expect(dimmed.calendars[0].color).toBe(dimColor('#FB8072', 0.3));
    expect(dimmed.calendars[1].color).toBe(dimColor('#4CAF50', 0.3));
    expect(dimmed.events[0].calendar_color).toBe(dimColor('#4CAF50', 0.3));
    // Nobody linked, light, and full: the same object, so nothing downstream recomputes.
    const plain = { calendars: [{ entity_id: 'calendar.holidays', color: '#4CAF50' }], events: [] } as never;
    expect(withModeColors(plain, 'light', [], 1)).toBe(plain);
  });

  it('the card hands the level to its modules, and pictures follow it', async () => {
    const { readFileSync } = await import('node:fs');
    const src = (path: string) => readFileSync(new URL(`../src/${path}`, import.meta.url), 'utf8');
    expect(src('shell/planavista-card.ts')).toMatch(/\.dim=\$\{this\._appearance\.dim\}/);
    expect(src('modules/chores/pv-chores-module.ts')).toMatch(/\.mode=\$\{this\.mode\} \.dim=\$\{this\.dim\}/);
    for (const file of ['core/pv-member-avatar.ts', 'modules/chores/pv-chore-tile.ts', 'modules/chores/pv-chores-my-day.ts',
      'modules/chores/pv-chores-day-sheet.ts', 'shell/pv-glance-header.ts']) {
      expect(src(file), file).toMatch(/filter: var\(--pv-media-filter, none\)/);
    }
  });
});

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import type { TemplateResult } from 'lit';
import { MOON, WEATHER_CONDITIONS, crescentPath, weatherIcon } from '../src/utils/weather-icons';
import type { WeatherCondition } from '../src/types';

const src = (path: string) => readFileSync(fileURLToPath(new URL(`../src/${path}`, import.meta.url)), 'utf-8').replace(/\r\n/g, '\n');

/** An icon's markup with its values in place (no DOM needed). */
function markup(t: TemplateResult): string {
  return t.strings.reduce((out, s, i) => out + s + (i < t.values.length ? String(t.values[i]) : ''), '');
}

describe('weather icons read on any header (the owner, 2026-10-15: "the icon looks like it\'s mostly missing")', () => {
  it('draws clouds, the moon, fog, and wind in the color of the words around them', () => {
    for (const condition of WEATHER_CONDITIONS) {
      const svg = markup(weatherIcon(condition as WeatherCondition, 32));
      // The old fixed slate greys nearly vanish on a colored header (#94A3B8 on the kitchen's green is about 1.2:1).
      expect(svg, condition).not.toMatch(/#94A3B8|#CBD5E1|#64748B|#475569/i);
      if (!['sunny', 'exceptional'].includes(condition)) expect(svg, condition).toContain('currentColor');
    }
  });

  it('dims its fixed colors with a dimmed shared screen itself, so nothing filters the drawn words twice', () => {
    for (const condition of WEATHER_CONDITIONS) {
      const svg = markup(weatherIcon(condition as WeatherCondition, 32));
      // No raw color attribute: every fixed color goes through the level (atLevel), in a style.
      expect(svg, condition).not.toMatch(/(fill|stroke)="#/);
      // (#000000 is the black that atLevel mixes toward.)
      for (const hex of (svg.match(/#[0-9A-Fa-f]{6}\b/g) ?? []).filter(h => h !== '#000000')) {
        expect(svg, `${condition} ${hex}`).toContain(`color-mix(in srgb-linear, ${hex} calc(var(--pv-dim, 1) * 100%), #000000)`);
      }
    }
    for (const [file, selector] of [
      ['shell/pv-glance-header.ts', '.weather svg'],
      ['modules/calendar/components/view-week.ts', '.day-weather svg'],
      ['modules/calendar/components/view-agenda.ts', '.day-weather svg'],
    ]) {
      expect(src(file), file).not.toContain(`${selector} {\n        filter: var(--pv-media-filter`);
      expect(src(file), file).not.toContain(`${selector} {\n      filter: var(--pv-media-filter`);
    }
  });

  it('draws clear night as a real crescent, thick enough to see at 32 px', () => {
    const { cx, cy, r, bx, by, br } = MOON;
    const apart = Math.hypot(bx - cx, by - cy);
    // The bite overlaps the moon and leaves horns: the circles cross.
    expect(apart).toBeGreaterThan(Math.abs(r - br));
    expect(apart).toBeLessThan(r + br);
    // At its widest the crescent is at least 8 of the icon's 64 units (4 px at 32 px).
    expect(r + apart - br).toBeGreaterThanOrEqual(8);
    expect(r).toBeGreaterThanOrEqual(16);
    expect(markup(weatherIcon('clear-night' as WeatherCondition, 32))).toContain(crescentPath(MOON));
    // Two arcs, closed.
    expect(crescentPath(MOON)).toMatch(/^M[\d. ]+A[\d. ]+A[\d. ]+Z$/);
  });

  it('every condition Home Assistant names has its own icon', () => {
    expect([...WEATHER_CONDITIONS].sort()).toEqual([
      'clear-night', 'cloudy', 'exceptional', 'fog', 'hail', 'lightning', 'lightning-rainy', 'partlycloudy', 'pouring',
      'rainy', 'snowy', 'snowy-rainy', 'sunny', 'windy', 'windy-variant',
    ]);
  });
});

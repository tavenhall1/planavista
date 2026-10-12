import { readFileSync, readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const read = (path: string) => readFileSync(new URL(path, import.meta.url), 'utf-8');

/** Every min-height, in px, that a rule for exactly `selector` sets in `source`. */
const minHeights = (source: string, selector: string): number[] => {
  const rule = new RegExp(selector.replace(/\./g, '\\.') + '\\s*\\{([^}]*)\\}', 'g');
  return [...source.matchAll(rule)].flatMap(m => [...m[1].matchAll(/min-height:\s*(\d+)px/g)].map(h => Number(h[1])));
};
const COMPONENTS = '../src/modules/calendar/components/';
const FILES = [
  '../src/modules/calendar/calendar-module.ts',
  ...readdirSync(new URL(COMPONENTS, import.meta.url)).filter(name => name.endsWith('.ts')).map(name => COMPONENTS + name),
];

describe("the calendar's sizes", () => {
  // DESIGN_SYSTEM 2.1: the card measures itself, so a narrow card on a wide screen gets narrow sizes.
  it.each(FILES)('%s sizes itself from the card, not the window', path => {
    expect(read(path)).not.toMatch(/@media[^{]*\((min|max)-width/);
  });

  it('measures a frame the sheets sit outside of, so they still cover the screen', () => {
    const module = read('../src/modules/calendar/calendar-module.ts');
    expect(module).toMatch(/\.pvc-frame\s*\{[^}]*container:\s*pv-calendar\s*\/\s*inline-size/);
    expect(module).not.toMatch(/:host\s*\{[^}]*container/);
    // The sheets render after the frame closes, never inside it.
    const frame = module.slice(module.indexOf('<div class="pvc-frame">'));
    expect(frame.indexOf('<pv-event-popup')).toBeGreaterThan(frame.indexOf('</div><!-- .pvc-frame -->'));
  });
});

describe("the calendar's touch targets", () => {
  // Touch targets are at least 48 px, even where the drawn control is smaller (DESIGN_SYSTEM.md), at every card size.
  it("keeps the toolbar's Today at 48 px or more at every size", () => {
    const heights = minHeights(read('../src/modules/calendar/calendar-module.ts'), '.pvc-today-btn');
    expect(heights.length).toBeGreaterThanOrEqual(3);
    expect(Math.min(...heights)).toBeGreaterThanOrEqual(48);
  });

  it("makes the Day view's all-day chips 48 px targets at every size, with the pill drawn inside", () => {
    const heights = minHeights(read('../src/modules/calendar/components/view-day.ts'), '.all-day-chip');
    expect(heights).toContain(48);
    expect(Math.min(...heights)).toBeGreaterThanOrEqual(48);
  });
});

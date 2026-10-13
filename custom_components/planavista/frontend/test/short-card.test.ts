import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { isShort } from '../src/core/layout';

const read = (path: string) =>
  readFileSync(new URL(`../src/${path}`, import.meta.url), 'utf-8').replace(/\r\n/g, '\n');

// Round 2: an iPhone held sideways with Home Assistant's sidebar docked (a card
// of 638 by 384) took the landscape arrangement, but the header put its chips on
// a line of their own and the bar wrapped its full labels onto two rows, leaving
// the module 135 px: the Day view had no hours and the board only clipped heads.
describe('a short card keeps its header and bar to one line each', () => {
  it('is short under 500 px tall', () => {
    expect(isShort({ width: 638, height: 384 })).toBe(true);
    expect(isShort({ width: 480, height: 376 })).toBe(true);
    expect(isShort({ width: 1376, height: 1032 })).toBe(false);
    expect(isShort({ width: 956, height: 500 })).toBe(false);
  });

  it('the layout controller says so, and the card tells the header and the bar', () => {
    expect(read('shell/layout-controller.ts')).toMatch(/const short = isShort\(box\);/);
    const card = read('shell/planavista-card.ts');
    expect(card).toMatch(/<pv-nav-bar\n\s+layout=\$\{this\._layout\.layout\}\n\s+\?short=\$\{this\._layout\.short\}/);
    expect(card).toMatch(/<pv-glance-header\n[\s\S]*?\?short=\$\{this\._layout\.short\}/);
  });

  it("the bar uses the buttons' short labels, as on a phone", () => {
    const bar = read('shell/pv-nav-bar.ts');
    expect(bar).toMatch(/@property\(\{ type: Boolean, reflect: true \}\) short = false;/);
    expect(bar).toMatch(/const text = \(this\.layout === 'phone' \|\| this\.short\) && action\.short !== undefined \? action\.short : action\.label;/);
  });

  it("the header leaves out the chips' own line", () => {
    const header = read('shell/pv-glance-header.ts');
    expect(header).toMatch(/@property\(\{ type: Boolean, reflect: true \}\) short = false;/);
    expect(header).toMatch(/:host\(\[shape='landscape'\]:not\(\[short\]\)\) \.below \{\n\s+display: block;/);
  });
});

// Round 2: on that short card the Day view's people strip (75 px) and its "Nothing on the
// calendar today" line (49 px) left the hours 39 px.
describe("the Day view keeps its hours on a short screen", () => {
  const block = (source: string, start: string): string => {
    const at = source.indexOf(start);
    expect(at, `no "${start}"`).toBeGreaterThan(-1);
    return source.slice(at, source.indexOf('\n      }\n', at));
  };

  it("lays the empty day's line over the hours, and shrinks the people strip", () => {
    const day = read('modules/calendar/components/view-day.ts');
    const short = block(day, '@media (max-height: 500px) {');
    expect(short).toMatch(/\.day-empty \{[^}]*position: absolute;/);
    expect(short).toMatch(/\.day-people \.person-avatar,\s*\.day-people \.person-initial \{[^}]*width: 24px;/);
  });

  it('pads the toolbar less', () => {
    const module = read('modules/calendar/calendar-module.ts');
    expect(block(module, '@media (max-height: 500px) {')).toMatch(/\.pvc-toolbar \{ padding: 6px 12px; \}/);
  });
});

describe('the Day view lays chips out at the height it draws them (round 2)', () => {
  it('passes the shortest chip, in time at its hour height, to the lanes', () => {
    const day = read('modules/calendar/components/view-day.ts');
    expect(day).toMatch(/const positioned = detectOverlaps\(events, \(MIN_CHIP_PX \/ this\._hourPx\) \* 3_600_000\);/);
    expect(read('modules/calendar/layout-rules.ts')).toMatch(/export const MIN_CHIP_PX = 34;/);
  });
});

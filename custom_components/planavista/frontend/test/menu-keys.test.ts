import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { menuStep } from '../src/core/menu-keys';

const read = (path: string) =>
  readFileSync(new URL(`../src/${path}`, import.meta.url), 'utf-8').replace(/\r\n/g, '\n');

describe('menuStep (the keys in a menu, as in iOS and the ARIA menu pattern)', () => {
  it('moves with the arrows, wrapping at the ends, and jumps with Home and End', () => {
    expect(menuStep('ArrowDown', 0, 4)).toBe(1);
    expect(menuStep('ArrowDown', 3, 4)).toBe(0);
    expect(menuStep('ArrowUp', 0, 4)).toBe(3);
    expect(menuStep('ArrowUp', 2, 4)).toBe(1);
    expect(menuStep('Home', 2, 4)).toBe(0);
    expect(menuStep('End', 1, 4)).toBe(3);
  });

  it('chooses with Enter or Space, and closes with Escape or Tab', () => {
    expect(menuStep('Enter', 1, 4)).toBe('choose');
    expect(menuStep(' ', 1, 4)).toBe('choose');
    expect(menuStep('Escape', 1, 4)).toBe('close');
    expect(menuStep('Tab', 1, 4)).toBe('close');
  });

  it('ignores other keys', () => {
    expect(menuStep('a', 1, 4)).toBeNull();
  });
});

describe("the bar's pop-up button for views", () => {
  const bar = read('shell/pv-nav-bar.ts');

  it('is a button that says it opens a menu and whether the menu is open, named for what it picks', () => {
    expect(bar).toMatch(/class="picker"[^\n]*aria-haspopup="menu"/);
    expect(bar).toMatch(/aria-expanded=\$\{this\._menuOpen \? 'true' : 'false'\}/);
    expect(bar).toMatch(/aria-label=\$\{`View: \$\{/);
  });

  it('lists the views as radio items with the current one checked', () => {
    expect(bar).toMatch(/role="menu"/);
    expect(bar).toMatch(/role="menuitemradio"[^\n]*aria-checked=\$\{view\.id === this\.activeView \? 'true' : 'false'\}/);
  });

  it("tightens a phone's bar so Chores' buttons fit on its one row (measured at 390 px)", () => {
    expect(bar).toMatch(/:host\(\[layout='phone'\]\) nav \{\s*gap: 8px;/);
    expect(bar).toMatch(/:host\(\[layout='phone'\]\) \.modules > button \{\s*padding: 0 11px;/);
  });

  it('keeps the segments it measures out of reach while they are hidden', () => {
    expect(bar).toMatch(/class="views pv-seg measure"[^\n]*aria-hidden="true"[^\n]*inert/);
  });
});

// Round 1 of the adversarial review: on an iPhone the bar took one row on Board and Week but two on
// My day and Rewards, because the pop-up button was measured with the current view's name.
describe('the pop-up button is as wide as its widest view', () => {
  const bar = readFileSync(new URL('../src/shell/pv-nav-bar.ts', import.meta.url), 'utf-8').replace(/\r\n/g, '\n');

  it('stacks every name in one spot and shows the current one, in the button and its hidden copy', () => {
    expect(bar.match(/<span class="label">\$\{this\._labels\(\)\}<\/span>/g)).toHaveLength(2);
    expect(bar).toMatch(/\.picker \.label > span \{\s*grid-area: 1 \/ 1;/);
    expect(bar).toMatch(/\.picker \.label > span:not\(\.on\) \{\s*visibility: hidden;/);
  });
});

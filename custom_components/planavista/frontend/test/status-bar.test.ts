import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const read = (path: string) =>
  readFileSync(new URL(`../src/${path}`, import.meta.url), 'utf-8').replace(/\r\n/g, '\n');

/** The rules inside one CSS block, found by its selector. */
const block = (source: string, selector: string): string => {
  const start = source.indexOf(`${selector} {`);
  expect(start, `no "${selector}" block`).toBeGreaterThan(-1);
  return source.slice(start, source.indexOf('\n      }', start));
};

// Round 1 of the adversarial review: with kiosk mode's top bar hidden the
// card runs up under the status bar (--pv-under-status-bar), but only the
// header made room for it. In parent mode the strip comes first, so its name,
// countdown, Lock, and Exit kiosk mode sat under the status bar, with a blank
// band below them where the header still made room; Settings did the same.
describe('whatever comes first in the card makes room for the status bar, once', () => {
  const card = read('shell/planavista-card.ts');

  it('the strip in parent mode, else the header, else the card itself', () => {
    const rule = card.slice(card.indexOf("private _underStatusBar(): 'strip' | 'header' | 'card' {"));
    expect(rule).toMatch(/if \(session && this\._household\.view\?\.members\.some\(m => m\.id === session\.memberId\)\) return 'strip';\n\s+return this\._config\?\.hide_header \? 'card' : 'header';/);
    expect(card).toMatch(/<ha-card class=\$\{this\._underStatusBar\(\) === 'card' \? 'under' : ''\}>/);
    expect(card).toMatch(/<pv-parent-strip\n\s+class="under"/);
    expect(card).toMatch(/<pv-glance-header\n\s+class=\$\{this\._underStatusBar\(\) === 'header' \? 'under' : ''\}/);
    expect(block(card, '      pv-parent-strip.under')).toMatch(/--pv-strip-top: var\(--pv-under-status-bar, 0px\);/);
    expect(block(card, '      pv-glance-header.under')).toMatch(/padding-top: var\(--pv-under-status-bar, 0px\);/);
    expect(block(card, '      ha-card.under')).toMatch(/padding-top: var\(--pv-under-status-bar, 0px\);/);
    expect(block(card, '      pv-glance-header')).not.toMatch(/--pv-under-status-bar/);
  });

  it("the strip's tint runs up under the status bar", () => {
    const strip = read('shell/pv-parent-strip.ts');
    expect(block(strip, '      .strip')).toMatch(/padding: var\(--pv-strip-top, 0px\) 6px 0 14px;/);
  });

  it('Settings and setup over the card make room too', () => {
    expect(block(card, '      .pvc-settings-overlay')).toMatch(/padding-top: var\(--pv-under-status-bar, 0px\);/);
  });
});

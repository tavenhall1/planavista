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

// Round 1: cancelling a PIN a sheet asked for left focus on the page, since the card
// remembered its own shadow root's active element (the module's host), so Escape no
// longer stepped back out of the sheet underneath.
describe("the card's PIN sheet gives focus back to the control that asked", () => {
  it('remembers the deep active element, inside the module', () => {
    const card = read('shell/planavista-card.ts');
    const gate = card.slice(card.indexOf('private readonly _pinGate: PinGate = {'), card.indexOf('constructor() {'));
    expect(gate).toMatch(/this\._sheetOpener = deepActiveElement\(this\.renderRoot as ShadowRoot\);/);
  });
});

// Round 1: on an iPhone held sideways (956 by 440) the keypad's last row
// (Cancel, 0, delete) fell below the sheet's 92vh, so a PIN with a 0 couldn't
// be typed without finding out the panel scrolls.
describe('the keypad fits a short screen', () => {
  it('shrinks its keys when the screen is short, still past a 44 px target', () => {
    const pin = read('shell/pv-pin-sheet.ts');
    const short = pin.slice(pin.indexOf('@media (max-height: 560px) {'));
    expect(short).toMatch(/\.keypad \{\s*grid-template-columns: repeat\(3, 52px\);/);
    expect(short).toMatch(/\.key \{\s*width: 52px;\s*height: 52px;/);
  });

  it("sheets measure against the screen as shown and pad by Home Assistant's inset, as the bar does", () => {
    const sheet = read('styles/sheet.ts');
    expect(sheet).toMatch(/max-height: 92vh;\s*max-height: 92dvh;/);
    expect(sheet).toMatch(/padding: 20px 20px calc\(20px \+ var\(--safe-area-inset-bottom, env\(safe-area-inset-bottom, 0px\)\)\);/);
  });
});

// Round 1: a wide, short card (an iPhone held sideways) takes the landscape header, whose chips sat
// beside the weather and ran into the date; and a long "Next:" chip was cut mid-word at the edge.
describe("the header's chips never run into the date or off the card", () => {
  const header = read('shell/pv-glance-header.ts');

  it('a narrow landscape header moves its chips to their own line', () => {
    expect(header).toMatch(/<div class="left">\$\{this\._weather\(32, 'condition'\)\}<div class="inline">\$\{this\._chips\(primary\)\}<\/div><\/div>/);
    expect(header).toMatch(/<div class="below">\$\{this\._chips\(primary\)\}<\/div>/);
    expect(header).toMatch(/@container \(max-width: 760px\) \{\s*:host\(\[shape='landscape'\]\) \.inline \{\s*display: none;\s*\}\s*:host\(\[shape='landscape'\]\) \.below \{\s*display: block;/);
  });

  it('a chip too long for its line ends in an ellipsis', () => {
    expect(header).toMatch(/<span class="text">\$\{chip\.text\}<\/span>/);
    expect(header).toMatch(/\.chip span\.pill \.text \{[^}]*text-overflow: ellipsis;/);
  });
});

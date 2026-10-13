import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const read = (path: string) =>
  readFileSync(new URL(`../src/${path}`, import.meta.url), 'utf-8').replace(/\r\n/g, '\n');

/** The rules inside one CSS block, found by its selector. */
const block = (source: string, selector: string): string => {
  const start = source.indexOf(`${selector} {`);
  expect(start, `no "${selector}" block`).toBeGreaterThan(-1);
  return source.slice(start, source.indexOf('}', start));
};

// On an iPhone, Home Assistant runs under the status bar and the home indicator
// (viewport-fit=cover): its header grows by --safe-area-inset-top and its view
// pads its bottom by --safe-area-inset-bottom, and Safari's 100vh is the screen
// with its toolbars hidden. A card of 100vh minus 56 px was 96 px too tall on an
// iPhone 17 Pro Max, so the page scrolled too and the bar sat below the fold.
describe('the card fits the screen on a phone (one scroll area)', () => {
  const card = read('shell/planavista-card.ts');

  it('fills only the space Home Assistant leaves above it, and runs under the home indicator in every layout', () => {
    const host = block(card, ':host');
    // (+ the status bar, which only kiosk mode's Hidden top bar sets: milestone 9.)
    expect(host).toMatch(/height: calc\(100dvh - var\(--header-height, 56px\) - var\(--safe-area-inset-top, 0px\) \+ var\(--pv-under-status-bar, 0px\)\);/);
    // Browsers without dvh keep the vh rule.
    expect(host).toMatch(/height: calc\(100vh - var\(--header-height, 56px\) - var\(--safe-area-inset-top, 0px\) \+ var\(--pv-under-status-bar, 0px\)\);\s*height: calc\(100dvh/);
    expect(host).toMatch(/margin-bottom: calc\(-1 \* var\(--safe-area-inset-bottom, 0px\)\);/);
    expect(host).not.toMatch(/height: calc\(100vh - var\(--header-height, 56px\)\);/);
  });

  it('keeps landscape content clear of the home indicator, with the card behind it (review: a light band showed under a dark card)', () => {
    expect(card).not.toMatch(/:host\(:not\(\[layout='landscape'\]\)\) \{/);
    const landscape = block(card, ":host([layout='landscape']) ha-card");
    expect(landscape).toMatch(/padding-bottom: var\(--safe-area-inset-bottom, 0px\);/);
    expect(landscape).toMatch(/box-sizing: border-box;/);
  });

  it('pads the bar by the same inset Home Assistant uses, so the two never disagree', () => {
    const bar = read('shell/pv-nav-bar.ts');
    expect(block(bar, ":host(:not([layout='landscape'])) nav")).toMatch(
      /padding: 0 12px var\(--safe-area-inset-bottom, env\(safe-area-inset-bottom, 0px\)\);/,
    );
  });
});

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

  it('fills only the space Home Assistant leaves: the visible screen less its header and the status bar', () => {
    const host = block(card, ':host');
    // (+ the status bar, which only kiosk mode's Hidden top bar sets: milestone 9.)
    expect(host).toMatch(/height: calc\(100dvh - var\(--header-height, 56px\) - var\(--safe-area-inset-top, 0px\) - var\(--safe-area-inset-bottom, 0px\) \+ var\(--pv-under-status-bar, 0px\)\);/);
    // Browsers without dvh keep the vh rule, with the insets.
    expect(host).toMatch(/height: calc\(100vh - var\(--header-height, 56px\) - var\(--safe-area-inset-top, 0px\) - var\(--safe-area-inset-bottom, 0px\) \+ var\(--pv-under-status-bar, 0px\)\);\s*height: calc\(100dvh/);
    expect(host).not.toMatch(/height: calc\(100vh - var\(--header-height, 56px\)\);/);
  });

  it('runs its bottom bar under the home indicator in portrait and on phones, as iOS bars do', () => {
    const bottom = block(card, ":host(:not([layout='landscape']))");
    expect(bottom).toMatch(/height: calc\(100dvh - var\(--header-height, 56px\) - var\(--safe-area-inset-top, 0px\) \+ var\(--pv-under-status-bar, 0px\)\);/);
    expect(bottom).toMatch(/margin-bottom: calc\(-1 \* var\(--safe-area-inset-bottom, 0px\)\);/);
  });

  it('pads the bar by the same inset Home Assistant uses, so the two never disagree', () => {
    const bar = read('shell/pv-nav-bar.ts');
    expect(block(bar, ":host(:not([layout='landscape'])) nav")).toMatch(
      /padding: 0 12px var\(--safe-area-inset-bottom, env\(safe-area-inset-bottom, 0px\)\);/,
    );
  });
});

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

// A panel view gives its one card the whole space and asks it for square
// corners, no border, and no shadow (Home Assistant's hui-panel-view sets
// --ha-card-border-radius to square for the card it holds). The card drew its
// own rounded corners there, so with kiosk mode's top bar hidden all four
// corners showed the page behind it: white on an iPad, where the screen's own
// rounded corners should be the only ones.
describe("a panel view's card meets the edges of the screen", () => {
  const card = read('shell/planavista-card.ts');

  it('shows Home Assistant\'s isPanel on the host, so its styles can follow it', () => {
    expect(card).toMatch(/@property\(\{ type: Boolean, reflect: true, attribute: 'panel' \}\) isPanel = false;/);
  });

  it('has square corners and no shadow as a panel\'s one card', () => {
    const panel = block(card, ':host([panel]) ha-card');
    expect(panel).toMatch(/border-radius: 0;/);
    expect(panel).toMatch(/box-shadow: none;/);
  });

  it('keeps the household\'s corners among other cards', () => {
    expect(block(card, '      ha-card')).toMatch(/border-radius: var\(--pv-radius-lg\);/);
  });
});

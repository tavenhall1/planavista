import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const card = readFileSync(new URL('../src/shell/planavista-card.ts', import.meta.url), 'utf-8').replace(/\r\n/g, '\n');

/** The rules inside one CSS block, found by its selector. */
const block = (selector: string): string => {
  const start = card.indexOf(`${selector} {`);
  expect(start, `no "${selector}" block`).toBeGreaterThan(-1);
  return card.slice(start, card.indexOf('\n      }', start));
};

// Round 2: in a sections view the card took the screen's height (978 px) in a
// 376 px cell and drew over the cards below it. Home Assistant sets the card's
// `layout` to 'grid' there; the card then fills its cell.
describe('a card in a sections view fills its cell', () => {
  it("hears Home Assistant's grid layout and shows it on the host", () => {
    expect(card).toMatch(/@property\(\{ attribute: false \}\) layout\?: string;/);
    expect(card).toMatch(/if \(changed\.has\('layout'\)\) this\.toggleAttribute\('grid', this\.layout === 'grid'\);/);
  });

  it('takes the height of its cell, with none of the panel margins', () => {
    const grid = block('      :host([grid])');
    expect(grid).toMatch(/height: 100%;/);
    expect(grid).toMatch(/margin: 0;/);
  });

  it('asks for the full width and a calendar-sized height by default', () => {
    const options = card.slice(card.indexOf('getGridOptions()'));
    expect(options.slice(0, options.indexOf('\n  }\n'))).toMatch(/return \{ columns: 'full', rows: 10, min_rows: 6, min_columns: 6 \};/);
  });
});

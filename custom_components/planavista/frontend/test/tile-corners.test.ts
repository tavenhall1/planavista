import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const tile = readFileSync(new URL('../src/modules/chores/pv-chore-tile.ts', import.meta.url), 'utf-8').replace(/\r\n/g, '\n');

/** The tile's geometry (pv-chore-tile.ts): 2 px border, 84 px ring centered, the ⋯ bubble and the tick in the corners. */
const BORDER = 2;
const RING = 84;
const MORE = { right: 2, top: 2, button: 48, bubble: 30 };
const TICK = { left: 10, top: 10, size: 28 };

/** How far each corner control stays clear of the ring at `width`, with the ring `paddingTop` below the border. */
function clearance(width: number, paddingTop: number): { more: number; tick: number } {
  const ring = { x: width / 2, y: BORDER + paddingTop + RING / 2, r: RING / 2 };
  const more = { x: width - BORDER - MORE.right - MORE.button / 2, y: BORDER + MORE.top + MORE.button / 2, r: MORE.bubble / 2 };
  const tick = { x: BORDER + TICK.left + TICK.size / 2, y: BORDER + TICK.top + TICK.size / 2, r: TICK.size / 2 };
  const gap = (c: { x: number; y: number; r: number }) => Math.hypot(c.x - ring.x, c.y - ring.y) - c.r - ring.r;
  return { more: gap(more), tick: gap(tick) };
}

// Round 2: on a phone (123 px tiles) the ⋯ bubble reached 12 px into the ring's
// stroke and the done tick 8 px, so every done ring read as broken at its corners.
describe("a picture tile's corner controls clear its ring", () => {
  it('moves the ring down on a narrow tile', () => {
    expect(tile).toMatch(/\.tile \{[^}]*container-type: inline-size;/);
    expect(tile).toMatch(/@container \(max-width: 160px\) \{\n\s+\.hold \{\n\s+padding-top: 36px;/);
    // After .hold's own padding, or that shorthand wins (seen on the copy: still 14 px).
    expect(tile.indexOf('@container (max-width: 160px)')).toBeGreaterThan(tile.indexOf('      padding: 14px 8px 12px;'));
  });

  // Round 3 (r3c C5): beside a phone's narrow tiles the present's ring sat 22 px higher and its row grew.
  it("starts a narrow present's ring where the tiles beside it start theirs", () => {
    const present = readFileSync(new URL('../src/modules/chores/pv-surprise-present.ts', import.meta.url), 'utf-8').replace(/\r\n/g, '\n');
    expect(present).toMatch(/\.surprise \{[^}]*container-type: inline-size;/);
    expect(present).toMatch(/@container \(max-width: 160px\) \{\n\s+:host\(:not\(\[shape='row'\]\)\) \.hold \{\n\s+padding-top: 36px;/);
    expect(present.indexOf('@container (max-width: 160px)')).toBeGreaterThan(present.indexOf('      padding: 14px 8px 12px;'));
  });

  // Round 4 (r4b B6): beside a present the row grew, and the tiles drew 179 and 192 px in a 197 px row.
  it('fills its row like the present beside it, rings level at the top', () => {
    const present = readFileSync(new URL('../src/modules/chores/pv-surprise-present.ts', import.meta.url), 'utf-8').replace(/\r\n/g, '\n');
    for (const [source, box] of [[tile, '.tile'], [present, '.surprise']] as const) {
      expect(source.slice(source.indexOf(`    ${box} {`), source.indexOf('}', source.indexOf(`    ${box} {`)))).toMatch(/height: 100%;/);
      const hold = source.slice(source.indexOf('    .hold {'), source.indexOf('}', source.indexOf('    .hold {')));
      expect(hold).toMatch(/height: 100%;/);
      expect(hold).toMatch(/justify-content: flex-start;/);
    }
    // The large present and the large tile on My day keep their content in the middle (round 5, r5b B6).
    expect(present).toMatch(/:host\(\[large\]\) \.hold \{[^}]*justify-content: center;/);
    expect(tile).toMatch(/:host\(\[large\]\) \.hold \{[^}]*justify-content: center;/);
  });

  it('clears both corners from the narrowest tile up, and the wider tiles keep their spacing', () => {
    // The query measures the tile inside its 2 px border: up to 160 px there is a tile up to 164 px.
    for (let width = 118; width <= 164; width += 2) {
      const { more, tick } = clearance(width, 36);
      expect(more, `⋯ at ${width} px`).toBeGreaterThan(2);
      expect(tick, `tick at ${width} px`).toBeGreaterThan(2);
    }
    expect(clearance(123, 14).more).toBeLessThan(0); // what the phone drew before
    expect(clearance(166, 14).more).toBeGreaterThan(2);
    expect(clearance(166, 14).tick).toBeGreaterThan(2);
  });
});

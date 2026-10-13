import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

// Element behavior is checked on the dev Home Assistant (the ring's drawn fill, frame by frame);
// these pin the two rules that check depends on.
const read = (path: string) => readFileSync(new URL(path, import.meta.url), 'utf-8');
const ring = read('../src/core/pv-ring.ts');
const tile = read('../src/modules/chores/pv-chore-tile.ts');
const column = read('../src/modules/chores/pv-chores-column.ts');

describe("a picture tile's hold (spec 11.5: it tracks the finger)", () => {
  it('a ring a hold drives draws each value as given, not easing along behind the finger', () => {
    expect(ring).toMatch(/:host\(\[tracking\]\)\s*\.fill\s*\{[^}]*transition:\s*none/);
  });

  it('the tile drives its ring that way', () => {
    expect(tile).toMatch(/<pv-ring[^>]*\?tracking=\$\{/);
  });

  it('a tile keeps its element when it becomes done, so its check-off still pops', () => {
    // One keyed list for open and done tiles: a second list would make a new element with no history.
    expect(column.match(/<pv-chore-tile\b/g)).toHaveLength(1);
  });
});

describe("a done tile's check", () => {
  it('sits over the ring, not under it (the ring is positioned and comes later)', () => {
    const start = tile.indexOf('    .tick {');
    expect(start).toBeGreaterThan(-1);
    expect(tile.slice(start, tile.indexOf('}', start))).toMatch(/z-index: 1;/);
  });

  it('draws the ring by the tile rule', () => {
    expect(tile).toMatch(/tileRingFill\(state, this\._held, this\._fill\)/);
  });
});

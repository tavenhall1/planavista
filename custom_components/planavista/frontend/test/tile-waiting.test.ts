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

// Seen with the approval wording: "⏳ Waiting for approval" wraps on a picture
// tile, and its second line sat flush left under the centered name.
describe("a picture tile's Waiting for approval", () => {
  const tile = read('modules/chores/pv-chore-tile.ts');

  it('centers under the name and wraps into even lines', () => {
    const waiting = block(tile, '.waiting');
    expect(waiting).toMatch(/text-align: center;/);
    expect(waiting).toMatch(/text-wrap: balance;/);
    expect(waiting).toMatch(/line-height: 1\.2;/);
  });
});

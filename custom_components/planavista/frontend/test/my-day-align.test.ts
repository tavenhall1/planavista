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

// Seen on a phone (1.5.1): in My day's Timeline, This week's rows started at the
// card's edge, 64 px left of the timeline's rows above them, and the band labels
// (Evening) were a lighter grey than every other section head.
describe("My day's Timeline: one left edge and one heading look", () => {
  const myDay = read('modules/chores/pv-chores-my-day.ts');

  it('sizes the time column once, and every timeline row uses it', () => {
    expect(block(myDay, ':host')).toMatch(/--tl-time: 56px;\s*--tl-gap: 8px;/);
    const row = block(myDay, '.tl-row');
    expect(row).toMatch(/grid-template-columns: var\(--tl-time\) minmax\(0, 1fr\);/);
    expect(row).toMatch(/gap: var\(--tl-gap\);/);
  });

  it("puts This week's rows in the timeline's column, under the timeline", () => {
    expect(block(myDay, '.tl-week')).toMatch(/margin-left: calc\(var\(--tl-time\) \+ var\(--tl-gap\)\);/);
    const weekRows = myDay.slice(myDay.indexOf('private _weekRows()'), myDay.indexOf('private _list()'));
    expect(weekRows).toMatch(/<div class="tl-week">/);
  });

  it('draws band labels as section heads, over the same column', () => {
    expect(myDay).toMatch(/<div class="section-head tl-band">\$\{entry\.label\}<\/div>/);
    const band = block(myDay, '.tl-band');
    expect(band).toMatch(/margin-left: calc\(var\(--tl-time\) \+ var\(--tl-gap\) \+ 4px\);/);
    expect(band).not.toMatch(/color:/);
    expect(band).not.toMatch(/font-/);
  });
});

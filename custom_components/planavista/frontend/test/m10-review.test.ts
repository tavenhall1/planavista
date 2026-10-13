import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const read = (path: string) =>
  readFileSync(new URL(`../src/${path}`, import.meta.url), 'utf-8').replace(/\r\n/g, '\n');

/** The rules inside one CSS block, found by its selector. */
const block = (source: string, selector: string): string => {
  const start = source.indexOf(`${selector} {`);
  expect(start, `no "${selector}" block`).toBeGreaterThan(-1);
  return source.slice(start, source.indexOf('\n    }', start));
};

// Milestone 10's screens review (reviewer B).
describe('the goal surprise against the controls beside it', () => {
  it("Watch it again is the family's secondary button, as Redeem is", () => {
    const rewards = read('modules/chores/pv-chores-rewards.ts');
    expect(rewards).not.toMatch(/pv-btn-text/);
    expect(rewards).toMatch(/<button class="again pv-btn pv-btn-secondary accent" type="button"/);
  });

  it("the present's tint is worked out where the person's color is set, so it shows in Rewards too", () => {
    const present = read('modules/chores/pv-surprise-present.ts');
    expect(block(present, '    :host')).not.toMatch(/--tint/);
    expect(block(present, '    .surprise')).toMatch(/--tint: color-mix\(in srgb, var\(--member\) 12%, var\(--pv-card-bg, #FFFFFF\)\);/);
  });
});

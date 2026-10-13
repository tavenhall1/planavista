import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const read = (path: string) =>
  readFileSync(new URL(`../src/${path}`, import.meta.url), 'utf-8').replace(/\r\n/g, '\n');

// Smaller things round 1 of the adversarial review found.
describe('round 1 polish', () => {
  it("a column's line breaks between its parts, never inside one (\"🔥 2 days\")", () => {
    const column = read('modules/chores/pv-chores-column.ts');
    expect(column).toMatch(/\.line > span \{\s*white-space: nowrap;\s*\}/);
  });

  it('a young child with nothing on the board gets the quiet line, not the sticker strip too', () => {
    const column = read('modules/chores/pv-chores-column.ts');
    expect(column).toMatch(/\$\{model\.member\.stars && !model\.empty \? html`\n\s+<div class="stickers">/);
  });

  it('the import review wraps a long unbroken name instead of running off the side', () => {
    const review = read('modules/chores/settings/pv-import-review.ts');
    expect(review).toMatch(/:host \{\s*display: block;\s*min-width: 0;\s*overflow-wrap: anywhere;\s*\}/);
  });

  it('"Tap to begin setup" sits in the middle of a full-height card', () => {
    const card = read('shell/planavista-card.ts');
    expect(card).toMatch(/\.pvc-setup-pending \{\s*flex: 1 1 auto;\s*display: flex;/);
  });
});

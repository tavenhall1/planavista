import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { CardDrafts } from '../src/core/page-drafts';

// Round 2: a Home Assistant restart rebuilds the card, and the drafts it kept went with it,
// though spec 9.4 keeps them until the page reloads.
describe("an editor's unsaved changes outlive the card", () => {
  it('a rebuilt card finds the drafts the old one kept, but keeps its own appearance edits', () => {
    const page = new Map<string, unknown>();
    const before = new CardDrafts(page);
    before.set('appearance', 'the old card');
    before.set('person:blair', { name: 'Blair B' });
    const after = new CardDrafts(page);
    expect(after.get('person:blair')).toEqual({ name: 'Blair B' });
    expect(after.has('appearance')).toBe(false);
    after.set('appearance', 'the new card');
    expect([...after.keys()].sort()).toEqual(['appearance', 'person:blair']);
    expect(after.delete('person:blair')).toBe(true);
    expect(before.has('person:blair')).toBe(false);
    expect(before.get('appearance')).toBe('the old card');
  });

  it('the card keeps its drafts this way', () => {
    const card = readFileSync(new URL('../src/shell/planavista-card.ts', import.meta.url), 'utf-8');
    expect(card).toMatch(/private _drafts = new CardDrafts\(\);/);
  });
});

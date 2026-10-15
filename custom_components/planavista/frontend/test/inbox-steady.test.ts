import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { ANSWERED_MS, approveAllSummary, heldArrivals, isHeld, type InboxGroups, type InboxRow } from '../src/modules/chores/inbox-derive';

const row = (id: string, kind: InboxRow['kind'] = 'completion'): InboxRow => ({
  id, kind, member: null, lead: '', what: id, tail: '', detail: '', allow: 'Looks good', decline: 'Send back', blocked: false,
});
const groups = (chores: string[], rewards: string[] = []): InboxGroups => ({
  chores: chores.map(id => row(id)), requests: [], rewards: rewards.map(id => row(id, 'redemption')), count: chores.length + rewards.length,
});
const src = (path: string) => readFileSync(fileURLToPath(new URL(`../src/${path}`, import.meta.url)), 'utf-8').replace(/\r\n/g, '\n');

// Round 7 (r7b B3, B4, B5, B6).
describe('the approvals hold still while a parent works', () => {
  it('holds rows that came in after it opened behind a word, so nothing shown moves', () => {
    const known = new Set(['fish', 'ice']);
    const held = heldArrivals(groups(['fish', 'table'], ['ice']), known);
    expect(held.groups.chores.map(r => r.id)).toEqual(['fish']);
    expect(held.groups.rewards.map(r => r.id)).toEqual(['ice']);
    expect(held.groups.count).toBe(3);
    expect(held.arrived).toBe(1);
  });

  it('shows arrivals at once when nothing is shown, where nothing can move under a finger', () => {
    const held = heldArrivals(groups(['table']), new Set(['fish']));
    expect(held.groups.chores.map(r => r.id)).toEqual(['table']);
    expect(held.arrived).toBe(0);
  });

  // Round 8 (r8b F5): the last row answered left the feed but was still drawn ("✓ Approved"), so a
  // reward ask came in without Show and its Approve slid into the place of the Looks good just pressed.
  it('keeps arrivals behind the word while an answered row is still drawn', () => {
    const drawn = new Set(['fish']);
    const held = heldArrivals(groups([], ['ice']), new Set(['fish']), drawn);
    expect(held.groups.rewards).toEqual([]);
    expect(held.arrived).toBe(1);
    // Once it has gone, nothing is drawn, and they show.
    expect(heldArrivals(groups([], ['ice']), new Set(['fish']), new Set()).arrived).toBe(0);
  });

  it('holds an answered row by one rule, for the drawing and for the arrivals', () => {
    expect(isHeld({ allow: true, at: 1000, state: 'done' }, 1000 + ANSWERED_MS - 1)).toBe(true);
    expect(isHeld({ allow: true, at: 1000, state: 'done' }, 1000 + ANSWERED_MS)).toBe(false);
    expect(isHeld(undefined, 1000)).toBe(false);
  });

  // Round 8 (r8b F2, F3, F4).
  it('keeps Done in its place: the note beside it, both pinned to the sheet\'s bottom', () => {
    const inbox = src('modules/chores/pv-chores-inbox.ts');
    const actions = inbox.slice(inbox.indexOf('      .actions {'), inbox.indexOf('}', inbox.indexOf('      .actions {')));
    expect(actions).toMatch(/flex-direction: row;/);
    expect(actions).toMatch(/position: sticky;/);
    expect(actions).toMatch(/bottom: 0;/);
    expect(inbox).toMatch(/\.actions \.more \{\n\s+flex: none;\n\s+width: auto;/);
    // "Nothing is waiting" only once nothing is drawn, not above a row still saying Approved.
    expect(inbox).toMatch(/\$\{this\._shownCount === 0 \? html`\n\s+<div class="state">/);
  });

  it('says when a row of Approve all did not save, instead of only what did', () => {
    expect(approveAllSummary(2, 0, 3)).toEqual({ text: "Approved 2. 3 didn't save. Check the connection and try again.", tone: 'bad' });
    expect(approveAllSummary(0, 0, 2)).toEqual({ text: "2 didn't save. Check the connection and try again.", tone: 'bad' });
    // Round 7 (r7a A3): stopped by a refusal (parent mode ended mid-way), it says why.
    expect(approveAllSummary(2, 0, 3, "A parent's PIN is needed on this screen."))
      .toEqual({ text: "Approved 2. 3 didn't save: A parent's PIN is needed on this screen.", tone: 'bad' });
    // Round 7 (r7a A4): answered elsewhere, unchecked by the child, or deleted: not waiting anymore.
    expect(approveAllSummary(2, 1)).toEqual({ text: "Approved 2. 1 wasn't waiting anymore.", tone: 'plain' });
    expect(approveAllSummary(2, 2)).toEqual({ text: "Approved 2. 2 weren't waiting anymore.", tone: 'plain' });
    expect(approveAllSummary(3, 0)).toEqual({ text: 'Approved 3 chores.', tone: 'plain' });
    expect(approveAllSummary(0, 2)).toEqual({ text: "Those weren't waiting anymore.", tone: 'plain' });
    expect(approveAllSummary(1, 0)).toBeNull();
    // Round 8 (r8b M1): a stop after some weren't waiting anymore accounts for every row.
    expect(approveAllSummary(2, 1, 2, "A parent's PIN is needed on this screen.")?.text)
      .toBe("Approved 2. 1 wasn't waiting anymore. 2 didn't save: A parent's PIN is needed on this screen.");
  });

  it('settles each row as it is answered, keeps its rows\' height and the link\'s space, and lets go when empty', () => {
    const module = src('modules/chores/pv-chores-module.ts');
    expect(module).toMatch(/settle\?\.\(row\.id, result === 'done'\);/);
    const inbox = src('modules/chores/pv-chores-inbox.ts');
    expect(inbox).toMatch(/rows\.style\.minHeight = `\$\{this\._rowsHeight\}px`;/);
    expect(inbox).toMatch(/class="link \$\{open\.length > 1 \? '' : 'unused'\}"/);
    expect(inbox).toMatch(/more came in · Show/);
    expect(inbox).toMatch(/panel\.style\.height = '';/);
    // Saving has no check: nothing has happened yet.
    expect(inbox).toMatch(/row\.answered === 'pending' \? '' : '✓ '/);
  });
});

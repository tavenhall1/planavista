import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { approveAllSummary, heldArrivals, type InboxGroups, type InboxRow } from '../src/modules/chores/inbox-derive';

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

  it('says when a row of Approve all did not save, instead of only what did', () => {
    expect(approveAllSummary(2, 0, 3)).toEqual({ text: "Approved 2. 3 didn't save. Check the connection and try again.", tone: 'bad' });
    expect(approveAllSummary(0, 0, 2)).toEqual({ text: "2 didn't save. Check the connection and try again.", tone: 'bad' });
    expect(approveAllSummary(2, 1)).toEqual({ text: 'Approved 2. 1 was already answered.', tone: 'plain' });
    expect(approveAllSummary(3, 0)).toEqual({ text: 'Approved 3 chores.', tone: 'plain' });
    expect(approveAllSummary(0, 2)).toEqual({ text: 'Those were already answered.', tone: 'plain' });
    expect(approveAllSummary(1, 0)).toBeNull();
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

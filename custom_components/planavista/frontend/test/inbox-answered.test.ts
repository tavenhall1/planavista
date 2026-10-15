import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { ANSWERED_MS, answeredWords, withAnswered, type InboxRow } from '../src/modules/chores/inbox-derive';

const row = (id: string, kind: InboxRow['kind'] = 'completion'): InboxRow => ({
  id, kind, member: null, lead: 'Dana finished', what: id, tail: '', detail: '', allow: 'Looks good', decline: 'Send back', blocked: false,
});

// Round 5 (r5b B1): a double tap on the first Looks good approved every waiting chore: the
// sheet shrank from the top and Approve all slid under the finger (the next row's Looks good
// in landscape). A row answered here stays where it was, without its buttons, for a moment.
describe('rows answered here stay in place for a moment', () => {
  const fish = row('fish');
  const table = row('table');
  const bed = row('bed');

  it('keeps an answered row where it was after the board drops it, then lets it go', () => {
    const answered = new Map([['fish', { allow: true, at: 1000 }]]);
    const shown = withAnswered([table, bed], [fish, table, bed], answered, 1500);
    expect(shown.map(r => [r.id, r.answered])).toEqual([['fish', 'allowed'], ['table', undefined], ['bed', undefined]]);
    expect(withAnswered([table, bed], shown, answered, 1000 + ANSWERED_MS).map(r => r.id)).toEqual(['table', 'bed']);
  });

  it('shows a row answered but not yet gone from the board as answered, so it takes no second tap', () => {
    const answered = new Map([['fish', { allow: false, at: 1000 }]]);
    expect(withAnswered([fish, table], [fish, table], answered, 1100)[0].answered).toBe('declined');
  });

  it('adds new rows at the end, and keeps the order rows were shown in', () => {
    const shown = withAnswered([bed, fish, table], [fish, table], new Map(), 0);
    expect(shown.map(r => r.id)).toEqual(['fish', 'table', 'bed']);
  });

  it('says how each was answered', () => {
    expect(answeredWords(row('a'), 'allowed')).toBe('Approved');
    expect(answeredWords(row('a'), 'declined')).toBe('Sent back');
    expect(answeredWords(row('a', 'skip'), 'allowed')).toBe('Allowed');
    expect(answeredWords(row('a', 'more_time'), 'declined')).toBe('Not this time');
    expect(answeredWords(row('a', 'redemption'), 'declined')).toBe('Declined');
  });

  it('asks before approving them all, and the day sheet keeps its rows while it reloads', () => {
    const src = (path: string) => readFileSync(fileURLToPath(new URL(`../src/${path}`, import.meta.url)), 'utf-8');
    expect(src('modules/chores/pv-chores-inbox.ts')).toMatch(/heading=\$\{`Approve all \$\{/);
    expect(src('modules/chores/pv-chores-module.ts')).toMatch(/this\._openDay\(this\._sheet\.member, this\._sheet\.date, true\)/);
  });
});

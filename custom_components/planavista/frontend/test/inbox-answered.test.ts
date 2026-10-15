import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
  ANSWERED_MS, PENDING_MS, answeredWords, approveAllSummary, withAnswered, type Answered, type InboxRow,
} from '../src/modules/chores/inbox-derive';

const row = (id: string, kind: InboxRow['kind'] = 'completion'): InboxRow => ({
  id, kind, member: null, lead: 'Dana finished', what: id, tail: '', detail: '', allow: 'Looks good', decline: 'Send back', blocked: false,
});
const src = (path: string) => readFileSync(fileURLToPath(new URL(`../src/${path}`, import.meta.url)), 'utf-8').replace(/\r\n/g, '\n');

// Round 5 (r5b B1): a double tap on the first Looks good approved every waiting chore: the
// sheet shrank from the top and Approve all slid under the finger (the next row's Looks good
// in landscape). A row answered here stays where it was, without its buttons, for a moment.
describe('rows answered here stay in place for a moment', () => {
  const fish = row('fish');
  const table = row('table');
  const bed = row('bed');
  const done = (at: number): Answered => ({ allow: true, at, state: 'done' });

  it('keeps an answered row where it was after the board drops it, then lets it go', () => {
    const answered = new Map([['fish', done(1000)]]);
    const shown = withAnswered([table, bed], [fish, table, bed], answered, 1500);
    expect(shown.map(r => [r.id, r.answered])).toEqual([['fish', 'allowed'], ['table', undefined], ['bed', undefined]]);
    expect(withAnswered([table, bed], shown, answered, 1000 + ANSWERED_MS).map(r => r.id)).toEqual(['table', 'bed']);
  });

  // Round 6 (r6a A5): it said Approved before the PIN was asked, and through a cancel or a refusal.
  it('says Saving while its answer is on its way, however long the PIN takes, and nothing after a cancel', () => {
    const pending = new Map<string, Answered>([['fish', { allow: true, at: 1000, state: 'pending' }]]);
    expect(withAnswered([fish, table], [fish, table], pending, 1000 + ANSWERED_MS * 5)[0].answered).toBe('pending');
    expect(withAnswered([fish, table], [fish, table], pending, 1000 + PENDING_MS + 1)[0].answered).toBeUndefined();
    expect(withAnswered([fish, table], [fish, table], new Map(), 1100)[0].answered).toBeUndefined();
  });

  it('adds new rows at the end, and keeps the order rows were shown in', () => {
    const shown = withAnswered([bed, fish, table], [fish, table], new Map(), 0);
    expect(shown.map(r => r.id)).toEqual(['fish', 'table', 'bed']);
  });

  it('says how each was answered', () => {
    expect(answeredWords(row('a'), 'pending')).toBe('Saving…');
    expect(answeredWords(row('a'), 'allowed')).toBe('Approved');
    expect(answeredWords(row('a'), 'declined')).toBe('Sent back');
    expect(answeredWords(row('a', 'skip'), 'allowed')).toBe('Allowed');
    expect(answeredWords(row('a', 'more_time'), 'declined')).toBe('Not this time');
    expect(answeredWords(row('a', 'redemption'), 'declined')).toBe('Declined');
  });

  it('asks before approving them all, and the day sheet keeps its rows while it reloads', () => {
    expect(src('modules/chores/pv-chores-module.ts')).toMatch(/heading=\$\{`Approve all \$\{/);
    expect(src('modules/chores/pv-chores-module.ts')).toMatch(/this\._openDay\(this\._sheet\.member, this\._sheet\.date, true\)/);
  });
});

// Round 6 (r6a A1, A3, A4).
describe('Approve all and Excuse it follow what happened', () => {
  it('approves past a row answered elsewhere and says so', () => {
    expect(approveAllSummary(2, 1)?.text).toBe("Approved 2. 1 wasn't waiting anymore.");
    expect(approveAllSummary(3, 0)?.text).toBe('Approved 3 chores.');
    expect(approveAllSummary(0, 2)?.text).toBe("Those weren't waiting anymore.");
    expect(approveAllSummary(1, 0)).toBeNull();
    expect(approveAllSummary(0, 0)).toBeNull();
    const module = src('modules/chores/pv-chores-module.ts');
    const all = module.slice(module.indexOf('  private async _approveAll('));
    expect(all.slice(0, all.indexOf('\n  }\n'))).toMatch(/else if \(result === 'gone'\) gone \+= 1;/);
    // A check-off unchecked or deleted meanwhile is gone too (round 7), and a refused excuse reloads the day.
    expect(module).toMatch(/\['unknown_request', 'request_closed', 'request_withdrawn', 'request_handed_on'\]\.includes\(errorCode\(err\)\)/);
    const excuse = module.slice(module.indexOf('  private async _excuseMissed('));
    expect(excuse.slice(0, excuse.indexOf('\n  }\n'))).toMatch(/errorCode\(err\) === 'not_missed'/);
  });

  it("freezes the rows its question names, and closes the question once they're gone", () => {
    // The board asks it (round 6, so toasts sit under it), for the rows the inbox named.
    expect(src('modules/chores/pv-chores-inbox.ts')).toMatch(/@click=\$\{\(\) => this\._askApproveAll\(open\)\}/);
    expect(src('modules/chores/pv-chores-module.ts')).toMatch(/const rows = ask\.rows\.filter\(row => waiting\.has\(row\.id\)\);/);
  });

  it("brings Excuse it back when nothing was excused (a cancelled PIN, a failed save)", () => {
    const sheet = src('modules/chores/pv-chores-day-sheet.ts');
    expect(sheet).not.toMatch(/_excused/);
    expect(sheet).toMatch(/!this\.excusing\.has\(item\.key\)/);
    const module = src('modules/chores/pv-chores-module.ts');
    const excuse = module.slice(module.indexOf('  private async _excuseMissed('));
    expect(excuse.slice(0, excuse.indexOf('\n  }\n'))).toMatch(/finally \{[\s\S]*this\._excusing = /);
    // Round 7 (r7b B2): it gave the link back before the day reloaded, so a double tap excused twice.
    expect(excuse.slice(0, excuse.indexOf('\n  }\n'))).toMatch(/await Promise\.all\(\[\s*this\._loadWeek\(true\),/);
  });
});

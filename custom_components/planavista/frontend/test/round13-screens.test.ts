import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { answeredText, answeredWords, inboxGroups } from '../src/modules/chores/inbox-derive';
import { MEMBERS } from './chores-fixtures';

const src = (path: string) => readFileSync(fileURLToPath(new URL(`../src/${path}`, import.meta.url)), 'utf-8').replace(/\r\n/g, '\n');

// The thirteenth adversarial round's findings on screen (r13b, and r13a's M3).
describe('round 13: screens', () => {
  // r13b I1: turned in a sections view (phone both ways), the sheet kept its sideways height.
  it('lets go of the held heights when its room changes without a new layout', () => {
    const inbox = src('modules/chores/pv-chores-inbox.ts');
    expect(inbox).toMatch(/private _resetHeld\(\): void \{/);
    expect(inbox).toMatch(/if \(Math\.abs\(height - room\) > 1 && !typing\) \{\n\s+room = height;\n\s+this\._resetHeld\(\);/);
    // The layout branch uses the same reset.
    expect(inbox).toMatch(/if \(changed\.has\('layout'\) && changed\.get\('layout'\) !== undefined\) \{\n\s+this\._resetHeld\(\);/);
  });

  // r13b M1: with no scroll padding, keyboard focus could sit behind the sticky head.
  it('brings keyboard focus out from under the sticky head', () => {
    const inbox = src('modules/chores/pv-chores-inbox.ts');
    expect(inbox).toMatch(/panel\.addEventListener\('focusin', this\._focusIn\);/);
    expect(inbox).toMatch(/const by = revealBy\(\{ top: shown\.top, bottom: shown\.bottom \}, \{ top: head\.getBoundingClientRect\(\)\.bottom \+ 8, bottom: Infinity \}\);/);
  });

  // r13a M3: an excused check-off sent back said it "went back", with Do it again; it stays excused.
  it("says an excused check-off stays excused when it isn't done", () => {
    const groups = inboxGroups([
      { id: 'r1', kind: 'completion', member: 'dana', name: 'Feed the fish', at: '2026-10-14T15:30:00-05:00', stars: 1, stays_excused: true },
    ], MEMBERS, '2026-10-15', '12h');
    const [row] = groups.chores;
    expect(row.excused).toBe(true);
    expect(row.decline).toBe('Not done');
    expect(row.detail).toMatch(/ · Excused$/);
    expect(answeredText(row, false, 'Lid left open')).toBe('Feed the fish stays excused: Lid left open.');
    expect(answeredWords(row, 'declined')).toBe('Not done');
    const inbox = src('modules/chores/pv-chores-inbox.ts');
    expect(inbox).toMatch(/row\.excused \? 'It stays excused\. Add a note for them\?'/);
    expect(inbox).toMatch(/sendBackReasons\(!!\(row\.late \|\| row\.excused\)\)/);
  });
});

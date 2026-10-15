import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { boardHandoff, handoffWords, sheetKey, sheetName } from '../src/modules/chores/sheet-key';

// Round 3 (r3a A8): tapping another chore while the last one's options were leaving
// opened its options in the same element, and the old one's close shut the new one.
describe("each of the board's sheets gets its own element", () => {
  it('a different sheet is a different element', () => {
    expect(sheetKey({ kind: 'options', key: 'a|dana|day:1|0' })).not.toBe(sheetKey({ kind: 'options', key: 'b|dana|day:1|0' }));
    expect(sheetKey({ kind: 'reward', id: 'ice_cream_trip' })).not.toBe(sheetKey({ kind: 'reward', id: null }));
    expect(sheetKey({ kind: 'day', member: 'dana', date: '2026-10-13' })).not.toBe(sheetKey({ kind: 'day', member: 'dana', date: '2026-10-14' }));
    expect(sheetKey({ kind: 'delete', row: { key: 'a' } })).not.toBe(sheetKey({ kind: 'delete', row: { key: 'b' } }));
    expect(sheetKey({ kind: 'inbox' })).not.toBe(sheetKey({ kind: 'quick_add' }));
    expect(sheetKey(null)).toBe('');
  });

  // Round 4 (r4a A8): a reconnect took New chore and what was typed in it, with no word.
  it('names each sheet for the card that comes back after a reconnect', () => {
    expect(sheetName({ kind: 'quick_add' })).toBe('New chore');
    expect(sheetName({ kind: 'inbox' })).toBe('the approvals');
    expect(sheetName({ kind: 'options', key: 'a' })).toBe("the chore's options");
    expect(sheetName({ kind: 'reward', id: null })).toBe('the reward');
    expect(sheetName({ kind: 'day', member: 'dana', date: '2026-10-13' })).toBe("the day's chores");
    expect(sheetName({ kind: 'start_over' })).toBe('that');
  });

  // Round 4 (r4b B2, B4): a reconnect took the reveal mid-celebration, and a check-off's toast.
  it("hands the new card what the board had open: a sheet, the reveal, the toast showing", () => {
    expect(boardHandoff({ sheet: null, reveal: null, toast: null, myDay: null })).toBeUndefined();
    expect(boardHandoff({ sheet: { kind: 'quick_add' }, reveal: 'dana', toast: 'Done.', myDay: null }))
      .toEqual({ closed: 'New chore', reveal: 'dana', toast: 'Done.' });
    expect(boardHandoff({ sheet: null, reveal: 'dana', toast: null, myDay: null })).toEqual({ reveal: 'dana' });
    // Round 5 (r5b B7): a reconnect took My day back to the first person.
    expect(boardHandoff({ sheet: null, reveal: null, toast: null, myDay: 'dana' })).toEqual({ myDay: 'dana' });
  });

  it('says what closed first, else the toast that was showing', () => {
    expect(handoffWords({ closed: 'New chore', toast: 'Done.' })).toBe('The connection dropped, so New chore closed. Try again.');
    expect(handoffWords({ toast: 'Feed the fish: waiting for approval.' })).toBe('Feed the fish: waiting for approval.');
    expect(handoffWords({ reveal: 'dana' })).toBeNull();
    expect(handoffWords(null)).toBeNull();
  });

  it('the board takes its note back on the new card', () => {
    const module = readFileSync(fileURLToPath(new URL('../src/modules/chores/pv-chores-module.ts', import.meta.url)), 'utf-8');
    expect(module).toMatch(/handoff\(\): BoardHandoff \| undefined \{\s*return boardHandoff\(/);
    expect(module).toMatch(/const words = handoffWords\(n\);/);
    // Round 5 (r5a A7): with the card's own word (the keypad closed), the board says nothing over it.
    expect(module).toMatch(/if \(words && !options\?\.quiet\)/);
  });

  it('the same sheet changing (busy, its history loading) keeps its element, so nothing typed is lost', () => {
    expect(sheetKey({ kind: 'reward', id: null, busy: true } as never)).toBe(sheetKey({ kind: 'reward', id: null }));
    expect(sheetKey({ kind: 'options', key: 'a', busy: true, history: ['x'] } as never)).toBe(sheetKey({ kind: 'options', key: 'a' }));
    expect(sheetKey({ kind: 'quick_add', busy: true } as never)).toBe(sheetKey({ kind: 'quick_add' }));
  });
});

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { sheetKey, sheetName } from '../src/modules/chores/sheet-key';

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

  it('the board says so on the new card', () => {
    const module = readFileSync(fileURLToPath(new URL('../src/modules/chores/pv-chores-module.ts', import.meta.url)), 'utf-8');
    expect(module).toMatch(/handoff\(\): \{ closed: string \} \| undefined \{/);
    expect(module).toMatch(/text: `The connection dropped, so \$\{closed\} closed\. Try again\.`/);
  });

  it('the same sheet changing (busy, its history loading) keeps its element, so nothing typed is lost', () => {
    expect(sheetKey({ kind: 'reward', id: null, busy: true } as never)).toBe(sheetKey({ kind: 'reward', id: null }));
    expect(sheetKey({ kind: 'options', key: 'a', busy: true, history: ['x'] } as never)).toBe(sheetKey({ kind: 'options', key: 'a' }));
    expect(sheetKey({ kind: 'quick_add', busy: true } as never)).toBe(sheetKey({ kind: 'quick_add' }));
  });
});

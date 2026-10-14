import { describe, expect, it } from 'vitest';
import { sheetKey } from '../src/modules/chores/sheet-key';

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

  it('the same sheet changing (busy, its history loading) keeps its element, so nothing typed is lost', () => {
    expect(sheetKey({ kind: 'reward', id: null, busy: true } as never)).toBe(sheetKey({ kind: 'reward', id: null }));
    expect(sheetKey({ kind: 'options', key: 'a', busy: true, history: ['x'] } as never)).toBe(sheetKey({ kind: 'options', key: 'a' }));
    expect(sheetKey({ kind: 'quick_add', busy: true } as never)).toBe(sheetKey({ kind: 'quick_add' }));
  });
});

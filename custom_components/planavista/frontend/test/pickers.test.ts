import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { dateKey, dateLabel, monthDays, scrollForPicker, shiftMonth, timeLabel, timeSlots } from '../src/core/pickers';

describe('the shared date and time pickers (milestone 8, spec 3.11)', () => {
  it('a month grid is six weeks from the Sunday on or before the 1st', () => {
    const days = monthDays(2026, 9); // October 2026
    expect(days).toHaveLength(42);
    expect(dateKey(days[0])).toBe('2026-09-27');
    expect(dateKey(days[4])).toBe('2026-10-01');
    expect(dateKey(days[41])).toBe('2026-11-07');
  });

  it('steps months across a year', () => {
    expect(shiftMonth(2026, 11, 1)).toEqual({ year: 2027, month: 0 });
    expect(shiftMonth(2026, 0, -1)).toEqual({ year: 2025, month: 11 });
  });

  it('offers every quarter hour, or the slots a setting allows', () => {
    const slots = timeSlots();
    expect(slots).toHaveLength(96);
    expect(slots[0]).toBe('00:00');
    expect(slots[95]).toBe('23:45');
  });

  it('labels times as the household reads them', () => {
    expect(timeLabel('00:00', '12h')).toBe('12:00 AM');
    expect(timeLabel('13:30', '12h')).toBe('1:30 PM');
    expect(timeLabel('07:05', '24h')).toBe('07:05');
    expect(timeLabel('', '12h')).toBe('');
  });

  it('labels a date one way, in the editor and every field', () => {
    expect(dateLabel('2026-10-20')).toBe('Tue, October 20, 2026');
    expect(dateLabel('')).toBe('');
  });

  it('dates and times are picked one way: no native date or time inputs anywhere', () => {
    const files = ['core/pv-recurrence-picker.ts', 'modules/chores/pv-chore-options.ts', 'modules/chores/pv-chores-quick-add.ts',
      'modules/chores/settings/pv-chore-editor.ts', 'modules/chores/settings/pv-person-chores.ts', 'modules/chores/settings/pv-person-sleep.ts',
      'shell/settings/pv-appearance-editor.ts'];
    for (const path of files) {
      const text = readFileSync(new URL(`../src/${path}`, import.meta.url), 'utf-8');
      expect(text, path).not.toMatch(/type="(date|time)"/);
    }
  });
});


// Round 1, left for later: with little room below, the date picker opened above its field
// and covered the sheet's title; it stayed put while the sheet scrolled.
describe('scrollForPicker', () => {
  it('scrolls the sheet just enough for the picker to open below its field', () => {
    expect(scrollForPicker(400, 900, 384, 500)).toBe(0); // room below already
    expect(scrollForPicker(700, 900, 384, 500)).toBe(196); // 200 below, wants 396
    expect(scrollForPicker(700, 900, 384, 100)).toBe(100); // as far as the sheet scrolls
    expect(scrollForPicker(700, 900, 384, 0)).toBe(0);
  });

  it('the editor scrolls first and follows the sheet as it scrolls', () => {
    const editor = readFileSync(new URL('../src/modules/calendar/components/event-create-dialog.ts', import.meta.url), 'utf-8');
    expect(editor).toMatch(/scrollForPicker\(/);
    expect(editor).toMatch(/@scroll=\$\{this\._onPanelScroll\}/);
  });
});

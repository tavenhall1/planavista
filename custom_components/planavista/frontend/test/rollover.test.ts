import { describe, expect, it } from 'vitest';
import { getDateKey, rolloverDate } from '../src/utils/date-utils';

describe('rolloverDate', () => {
  const fri = new Date(2026, 9, 9, 12, 0);

  it('does nothing while the local date is unchanged', () => {
    expect(rolloverDate(fri, '2026-10-09', new Date(2026, 9, 9, 23, 59))).toBeNull();
  });

  it('follows today across midnight', () => {
    const next = rolloverDate(fri, '2026-10-09', new Date(2026, 9, 10, 0, 0, 30));
    expect(next && getDateKey(next)).toBe('2026-10-10');
  });

  it('catches up after the tablet slept through midnight', () => {
    // The old check only advanced if "one minute ago" was still the viewed day.
    const next = rolloverDate(fri, '2026-10-09', new Date(2026, 9, 10, 7, 45));
    expect(next && getDateKey(next)).toBe('2026-10-10');
  });

  it('catches up across several days', () => {
    const next = rolloverDate(fri, '2026-10-09', new Date(2026, 9, 12, 7, 0));
    expect(next && getDateKey(next)).toBe('2026-10-12');
  });

  it('leaves a day the user navigated to alone', () => {
    const tue = new Date(2026, 9, 13);
    expect(rolloverDate(tue, '2026-10-09', new Date(2026, 9, 10, 0, 1))).toBeNull();
  });
});

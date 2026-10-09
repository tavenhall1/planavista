import { describe, expect, it } from 'vitest';
import { formatTime, isDateOnly, parseEventDate } from '../src/utils/date-utils';

describe('test environment', () => {
  it('runs in America/Chicago', () => {
    expect(Intl.DateTimeFormat().resolvedOptions().timeZone).toBe('America/Chicago');
    expect(new Date(2026, 9, 9).getTimezoneOffset()).toBe(300); // CDT, UTC-5
  });
});

describe('isDateOnly', () => {
  it('accepts YYYY-MM-DD only', () => {
    expect(isDateOnly('2026-10-09')).toBe(true);
    expect(isDateOnly('2026-10-09T00:00:00-05:00')).toBe(false);
    expect(isDateOnly('2026-10-09T10:00:00')).toBe(false);
    expect(isDateOnly('')).toBe(false);
  });
});

describe('parseEventDate', () => {
  it('maps an all-day date to local midnight of that day', () => {
    const d = parseEventDate('2026-10-09');
    expect([d.getFullYear(), d.getMonth(), d.getDate()]).toEqual([2026, 9, 9]);
    expect([d.getHours(), d.getMinutes()]).toEqual([0, 0]);
  });

  it('parses datetimes with an offset as that instant', () => {
    const d = parseEventDate('2026-10-09T10:00:00-04:00');
    expect(d.toISOString()).toBe('2026-10-09T14:00:00.000Z');
    expect([d.getDate(), d.getHours()]).toEqual([9, 9]); // 9:00 AM in Chicago
  });

  it('keeps the all-day date on the US fall-back day', () => {
    const d = parseEventDate('2026-11-01');
    expect([d.getMonth(), d.getDate(), d.getHours()]).toEqual([10, 1, 0]);
  });
});

describe('formatTime', () => {
  it('shows a timed event from another zone in local time', () => {
    expect(formatTime('2026-10-09T10:00:00-04:00', '12h')).toBe('9:00 AM');
    expect(formatTime('2026-10-09T10:00:00-04:00', '24h')).toBe('09:00');
  });
});

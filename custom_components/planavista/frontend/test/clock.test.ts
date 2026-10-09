import { describe, expect, it } from 'vitest';
import { formatClockParts } from '../src/utils/date-utils';

describe('formatClockParts', () => {
  it('formats a 12-hour clock', () => {
    expect(formatClockParts(new Date(2026, 9, 9, 15, 4), '12h')).toEqual({
      time: '3:04', ampm: 'PM', date: 'Friday, October 9',
    });
    expect(formatClockParts(new Date(2026, 9, 10, 0, 0), '12h')).toMatchObject({ time: '12:00', ampm: 'AM' });
  });

  it('formats a 24-hour clock without AM/PM', () => {
    expect(formatClockParts(new Date(2026, 9, 9, 15, 4), '24h')).toEqual({
      time: '15:04', ampm: '', date: 'Friday, October 9',
    });
  });
});

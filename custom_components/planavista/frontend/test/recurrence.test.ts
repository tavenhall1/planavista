import { describe, expect, it } from 'vitest';
import { ordinal, parseRule, ruleText, weekdaysText } from '../src/core/recurrence';

describe('parseRule', () => {
  it('reads the subset the engine follows', () => {
    expect(parseRule('FREQ=WEEKLY;BYDAY=SA;UNTIL=20261130')).toEqual({
      freq: 'WEEKLY', interval: 1, byday: ['SA'], bymonthday: null, count: null, until: '2026-11-30',
    });
    expect(parseRule('FREQ=MONTHLY;INTERVAL=2;BYMONTHDAY=1;COUNT=6')).toEqual({
      freq: 'MONTHLY', interval: 2, byday: [], bymonthday: 1, count: 6, until: null,
    });
    expect(parseRule('RRULE:FREQ=WEEKLY;BYDAY=TH,MO')!.byday).toEqual(['MO', 'TH']);
    expect(parseRule('FREQ=DAILY;UNTIL=20261130T000000Z')!.until).toBe('2026-11-30');
  });

  it.each([
    'FREQ=YEARLY', 'FREQ=DAILY;BYDAY=MO', 'FREQ=WEEKLY;BYMONTHDAY=3', 'FREQ=MONTHLY;BYMONTHDAY=32',
    'FREQ=WEEKLY;COUNT=3;UNTIL=20261130', 'FREQ=WEEKLY;BYSETPOS=1', 'FREQ=WEEKLY;INTERVAL=0', 'BYDAY=MO',
    'FREQ=WEEKLY;FREQ=DAILY',
  ])('refuses %s', text => {
    expect(parseRule(text)).toBeNull();
  });
});

describe('ruleText', () => {
  const text = (rule: string, window: 'day' | 'period' = 'day') => ruleText(parseRule(rule)!, window);

  it('says a rule in a few words', () => {
    expect(text('FREQ=WEEKLY;BYDAY=SA;UNTIL=20261130')).toBe('Saturdays until Nov 30');
    expect(text('FREQ=MONTHLY;BYMONTHDAY=1', 'period')).toBe('Monthly · any time that month');
    expect(text('FREQ=MONTHLY;BYMONTHDAY=1')).toBe('Monthly on the 1st');
    expect(text('FREQ=WEEKLY;INTERVAL=2;BYDAY=MO,TH')).toBe('Every 2 weeks · Mon, Thu');
    expect(text('FREQ=WEEKLY', 'period')).toBe('Weekly · any time that week');
    expect(text('FREQ=DAILY;INTERVAL=3;COUNT=5')).toBe('Every 3 days, 5 times');
    expect(text('FREQ=DAILY')).toBe('Every day');
  });

  it('names days and dates of the month', () => {
    expect(weekdaysText(['SA'])).toBe('Saturdays');
    expect(weekdaysText(['SA'], false)).toBe('Saturday');
    expect(['1st', '2nd', '3rd', '4th', '11th', '12th', '13th', '21st', '22nd', '31st']).toEqual(
      [1, 2, 3, 4, 11, 12, 13, 21, 22, 31].map(ordinal),
    );
  });
});

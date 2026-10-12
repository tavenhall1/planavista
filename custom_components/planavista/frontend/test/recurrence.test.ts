import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  happens, instanceDates, ordinal, parseRule, recurrenceSummary, recurrenceValue, ruleText, toRRule, weekdaysText,
} from '../src/core/recurrence';

const TABLE = JSON.parse(readFileSync(new URL('../../../../tests/fixtures/recurrence_cases.json', import.meta.url), 'utf-8')) as {
  cases: Array<{ name: string; rrule: string; start: string; dates: string[] }>;
};

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

describe('instanceDates', () => {
  it.each(TABLE.cases)('$name', c => {
    expect(instanceDates(parseRule(c.rrule)!, c.start, '2030-01-01')).toEqual(c.dates);
  });

  it('stops at the last day asked for, and at a limit', () => {
    expect(instanceDates(parseRule('FREQ=DAILY')!, '2026-10-13', '2026-10-15')).toEqual(['2026-10-13', '2026-10-14', '2026-10-15']);
    expect(instanceDates(parseRule('FREQ=DAILY')!, '2026-10-13', '2030-01-01', 2)).toHaveLength(2);
  });
});

describe('the picker value', () => {
  it.each(TABLE.cases)('$name comes back as the same rule', c => {
    expect(parseRule(toRRule(recurrenceValue(c.rrule, c.start)))).toEqual(parseRule(c.rrule));
  });

  it('starts a new rule weekly on the start day, never ending', () => {
    const value = recurrenceValue(null, '2026-10-17');
    expect(toRRule(value)).toBe('FREQ=WEEKLY;BYDAY=SA');
    expect(value.ends).toBe('never');
  });

  it('keeps a count and an end date while another ending is picked', () => {
    const value = { ...recurrenceValue('FREQ=WEEKLY;BYDAY=SA;UNTIL=20261130', '2026-10-17'), ends: 'never' as const };
    expect(toRRule(value)).toBe('FREQ=WEEKLY;BYDAY=SA');
    expect(toRRule({ ...value, ends: 'until' })).toBe('FREQ=WEEKLY;BYDAY=SA;UNTIL=20261130');
  });
});

describe('recurrenceSummary', () => {
  const summary = (rrule: string, start: string) => recurrenceSummary(recurrenceValue(rrule, start));

  it('says the rule, its end, and how many times (spec 14.4)', () => {
    expect(summary('FREQ=WEEKLY;BYDAY=SA;UNTIL=20261130', '2026-10-17')).toBe('Every Saturday until November 30: 7 times.');
    expect(summary('FREQ=WEEKLY;INTERVAL=2;BYDAY=MO,TH;COUNT=5', '2026-10-14')).toBe(
      'Every 2 weeks on Monday and Thursday, 5 times, ending November 12.',
    );
    expect(summary('FREQ=MONTHLY;BYMONTHDAY=1', '2026-10-01')).toBe('Every month on the 1st, from October 1.');
    expect(summary('FREQ=DAILY;INTERVAL=3', '2026-10-13')).toBe('Every 3 days, from October 13.');
  });

  it('notices a rule that never happens', () => {
    const never = recurrenceValue('FREQ=WEEKLY;BYDAY=SA;UNTIL=20261016', '2026-10-17');
    expect(recurrenceSummary(never)).toBe('This never happens. Pick a later end date.');
    expect(happens(never)).toBe(false);
    expect(happens(recurrenceValue('FREQ=MONTHLY;BYMONTHDAY=31', '2026-10-01'))).toBe(true);
  });
});

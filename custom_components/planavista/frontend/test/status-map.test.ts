import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { badgeBelow, daysBetween, itemBadge, minutesText, pastBadge, ringLabel, shortDay, type StatusView } from '../src/core/status-map';

const TABLE = JSON.parse(readFileSync(new URL('../../../../tests/fixtures/chores_status.json', import.meta.url), 'utf-8')) as {
  today: string;
  cases: Array<{
    name: string;
    view: StatusView;
    days_left?: number;
    remaining?: number;
    card: { words: string; tone: string; glyph?: string } | null;
  }>;
};

describe('itemBadge', () => {
  it.each(TABLE.cases)('$name', c => {
    const badge = itemBadge(c.view, { today: TABLE.today, daysLeft: c.days_left ?? 6, remaining: c.remaining ?? 1 });
    expect(badge).toEqual(c.card);
  });
});

describe('shortDay', () => {
  it('names the weekday within a week of today, and the date further out', () => {
    expect(shortDay('2026-10-12', '2026-10-13')).toBe('Mon');
    expect(shortDay('2026-10-19', '2026-10-13')).toBe('Mon');
    expect(shortDay('2026-10-20', '2026-10-13')).toBe('Oct 20');
    expect(shortDay('2026-09-28', '2026-10-13')).toBe('Sep 28');
  });

  it('counts days across a daylight saving change', () => {
    expect(daysBetween('2026-10-31', '2026-11-02')).toBe(2);
    expect(daysBetween('2026-03-07', '2026-03-09')).toBe(2);
  });
});

describe('pastBadge', () => {
  it('words a past day\'s outcomes', () => {
    expect(pastBadge('missed')).toEqual({ words: 'Missed', tone: 'bad', glyph: '×' });
    expect(pastBadge('excused', 'Sick day')).toEqual({ words: 'Excused: Sick day', tone: 'muted' });
    expect(pastBadge('done').words).toBe('Done');
  });

  it('says a make-up chore that slipped its day was not done that day', () => {
    expect(pastBadge('open')).toEqual({ words: 'Not done that day', tone: 'time', glyph: '•' });
  });
});

describe('badgeBelow (spec 12.3)', () => {
  it('puts a long badge, such as a sent-back note, under the name, and every badge in a narrow panel', () => {
    expect(badgeBelow({ words: 'Sent back: Missed a spot', tone: 'bad', glyph: '↩' }, false)).toBe(true);
    expect(badgeBelow({ words: 'Overdue since Mon', tone: 'bad' }, false)).toBe(true);
    expect(badgeBelow({ words: 'Waiting for OK', tone: 'act', glyph: '⏳' }, false)).toBe(false);
    expect(badgeBelow({ words: 'Due Fri', tone: 'neutral' }, false)).toBe(false);
    expect(badgeBelow({ words: 'Due Fri', tone: 'neutral' }, true)).toBe(true);
    expect(badgeBelow(null, false)).toBe(false);
  });
});

describe('minutesText', () => {
  it('shows minutes under an hour and hours above', () => {
    expect(minutesText(15)).toBe('15 min');
    expect(minutesText(0.4)).toBe('1 min');
    expect(minutesText(60)).toBe('1 h');
    expect(minutesText(90)).toBe('1.5 h');
    expect(minutesText(160)).toBe('2 h 40 min');
  });
});

describe('ringLabel', () => {
  it('tells a screen reader how the day is going', () => {
    expect(ringLabel('Casey', 1, 3)).toBe('Casey, 1 of 3 done today');
    expect(ringLabel('Blair', 5, 5)).toBe('Blair, ring closed for today');
    expect(ringLabel('Dana', 0, 0)).toBe('Dana, nothing due today');
  });
});

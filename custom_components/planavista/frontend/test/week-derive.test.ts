import { describe, expect, it } from 'vitest';
import { weekCell, weekDays, weekDaysLeft, weekHighlights, weekRows, weekShares, weekTitle, weeklyLine } from '../src/modules/chores/week-derive';
import type { WeekDay, WeekView } from '../src/modules/chores/chores-types';
import { MEMBERS } from './chores-fixtures';

const [alex, blair, casey, dana] = MEMBERS;

function day(date: string, kind: WeekDay['kind'], fields: Partial<WeekDay> = {}): WeekDay {
  return { date, kind, away: false, due: 3, done: 3, pending: 0, closed: true, missed: 0, ...fields };
}

const WEEK: WeekView = {
  week: { start: '2026-10-12', end: '2026-10-19' },
  today: '2026-10-13',
  members: {
    alex: { days: [day('2026-10-12', 'past'), day('2026-10-13', 'today', { due: 4, done: 2, closed: false }), day('2026-10-14', 'future', { done: 0, closed: false })], weekly: [{ chore: 'finance', name: 'Finance and budget', total: 2, done: 0, pending: 0, from: null }], contribution: { minutes: 150, shared_minutes: 150 }, away: [] },
    blair: { days: [day('2026-10-12', 'past', { due: 5, done: 5 }), day('2026-10-13', 'today', { due: 5, done: 5 })], weekly: [{ chore: 'laundry', name: 'Laundry', total: 3, done: 1, pending: 0, from: '2026-10-12' }], contribution: { minutes: 222, shared_minutes: 222 }, away: [] },
    casey: {
      days: [
        day('2026-10-12', 'past', { done: 2, closed: false, missed: 1, missed_items: [{ key: 'cat_care|casey|day:2026-10-12|1', chore: 'cat_care', name: 'Cat care', icon: null, status: 'missed' }] }),
        day('2026-10-13', 'today', { due: 3, done: 1, closed: false }),
      ],
      weekly: [{ chore: 'bathroom', name: 'Clean the bathroom', total: 3, done: 0, pending: 1, from: null }],
      contribution: { minutes: 132, shared_minutes: 132 }, away: [],
    },
    dana: { days: [day('2026-10-14', 'future', { away: true }), day('2026-10-15', 'future', { away: true })], weekly: [], contribution: { minutes: 36, shared_minutes: 0 }, away: [{ from: '2026-10-14', to: '2026-10-15', note: "At Grandma's" }] },
  },
};

describe('weekCell (spec 13.5)', () => {
  it('shows a closed ring with its count, a missed day, today, and days to come', () => {
    expect(weekCell(day('2026-10-12', 'past'))).toMatchObject({ label: '3 of 3', closed: true, tone: 'plain' });
    expect(weekCell(WEEK.members.casey.days[0])).toMatchObject({ label: '1 missed', tone: 'bad', closed: false });
    expect(weekCell(WEEK.members.alex.days[1])).toMatchObject({ label: '2 of 4', progress: 0.5, closed: false });
    expect(weekCell(day('2026-10-14', 'future', { done: 0 }))).toMatchObject({ label: '3 due', dashed: true, progress: 0 });
    expect(weekCell(day('2026-10-14', 'future', { away: true }))).toMatchObject({ label: 'Away', away: true });
    expect(weekCell(day('2026-10-12', 'past', { due: null, done: null, pending: null, closed: null }))).toMatchObject({ empty: true, label: '' });
  });

  // Round 2: a day whose only chore was excused read "Nothing due" (its sheet said Excused),
  // and a day to come with nothing on it had no words at all.
  it('says a day was excused, and a day to come has nothing due', () => {
    expect(weekCell(day('2026-10-08', 'past', { due: 0, done: 0, closed: false, excused: 1 }))).toMatchObject({ label: 'Excused', tone: 'muted' });
    expect(weekCell(day('2026-10-08', 'past', { due: 0, done: 0, closed: false }))).toMatchObject({ label: 'Nothing due' });
    expect(weekCell(day('2026-10-14', 'future', { due: 0, done: 0, closed: false }))).toMatchObject({ label: 'Nothing due', empty: true });
  });
});

describe('the days left of the week shown (final review B-m5)', () => {
  const shown = (start: string, end: string, today = '2026-10-15') => ({ week: { start, end }, today, members: {} }) as WeekView;

  it("counts this week's from today, a later week's in full, and an earlier week's as over", () => {
    expect(weekDaysLeft(shown('2026-10-12', '2026-10-19'))).toBe(4);
    expect(weekDaysLeft(shown('2026-10-19', '2026-10-26'))).toBe(7);
    expect(weekDaysLeft(shown('2026-10-05', '2026-10-12'))).toBe(0);
  });

  it("says nothing about days left once the week shown is over", () => {
    const open = [{ chore: 'yard', name: 'Yard work', total: 1, done: 0, pending: 0, from: null }];
    expect(weeklyLine(open, 0, '2026-10-15')).toEqual({ text: '0 of 1', badge: null, badgeTone: 'neutral', progress: 0 });
    expect(weeklyLine(open, 7, '2026-10-15')).toMatchObject({ badge: '7 days left', badgeTone: 'neutral' });
  });
});

describe('weeklyLine', () => {
  it('counts the week, and says what needs a look', () => {
    expect(weeklyLine(WEEK.members.blair.weekly, 6, '2026-10-13')).toEqual({ text: '1 of 3', badge: 'Laundry from Mon', badgeTone: 'time', progress: 1 / 3 });
    expect(weeklyLine(WEEK.members.casey.weekly, 6, '2026-10-13')).toMatchObject({ text: '1 of 3', badge: '⏳ 1 waiting', badgeTone: 'act' });
    expect(weeklyLine(WEEK.members.alex.weekly, 4, '2026-10-13')).toMatchObject({ text: '0 of 2', badge: '4 days left' });
    expect(weeklyLine([], 6, '2026-10-13')).toBeNull();
    expect(weeklyLine(WEEK.members.blair.weekly, 6, '2026-10-11')?.badge).toBe('6 days left');
  });

  it('feels the deadline: 3 and 2 days warn, the last day is bad', () => {
    const open = WEEK.members.alex.weekly;
    expect(weeklyLine(open, 3, '2026-10-13')).toMatchObject({ badge: '3 days left', badgeTone: 'warn' });
    expect(weeklyLine(open, 2, '2026-10-13')).toMatchObject({ badge: '2 days left', badgeTone: 'warn' });
    expect(weeklyLine(open, 1, '2026-10-13')).toMatchObject({ badge: 'Last day', badgeTone: 'bad' });
    expect(weeklyLine(open, 4, '2026-10-13')).toMatchObject({ badge: '4 days left', badgeTone: 'neutral' });
  });
});

describe('weekHighlights', () => {
  it('says who closed every ring, what was missed (to excuse), and who is away', () => {
    const lines = weekHighlights(WEEK, MEMBERS);
    expect(lines.map(l => l.text)).toEqual([
      'Blair has closed every ring this week.',
      'Casey missed Cat care on Monday.',
      'Dana is away Wednesday and Thursday.',
    ]);
    expect(lines[1].excuse).toEqual({ occurrence: 'cat_care|casey|day:2026-10-12|1', name: 'Cat care', day: '2026-10-12' });
  });
});

describe('the rest of the Week view', () => {
  it('heads the week and its days', () => {
    expect(weekTitle(WEEK)).toBe('October 12 – 18');
    expect(weekDays(WEEK).map(d => `${d.label}${d.today ? '*' : ''}`)).toEqual(['Mon', 'Tue*', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
  });

  it('keeps board order', () => {
    expect(weekRows(WEEK, [dana, alex], 6).map(r => r.member.id)).toEqual(['dana', 'alex']);
  });

  it('shares out shared chores by time done', () => {
    // The same words as My day's (milestone 8): time and share.
    expect(weekShares(WEEK, [alex, blair, casey, dana]).map(s => s.text)).toEqual(['Alex 2.5 h · 30%', 'Blair 3 h 42 min · 44%', 'Casey 2 h 12 min · 26%']);
  });
});

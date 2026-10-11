import { describe, expect, it } from 'vitest';
import { weekCell, weekDays, weekHighlights, weekRows, weekShares, weekTitle, weeklyLine } from '../src/modules/chores/week-derive';
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
});

describe('weeklyLine', () => {
  it('counts the week, and says what needs a look', () => {
    expect(weeklyLine(WEEK.members.blair.weekly, 6, '2026-10-13')).toEqual({ text: '1 of 3', badge: 'Laundry from Mon', badgeTone: 'time', progress: 1 / 3 });
    expect(weeklyLine(WEEK.members.casey.weekly, 6, '2026-10-13')).toMatchObject({ text: '1 of 3', badge: '⏳ 1 waiting', badgeTone: 'act' });
    expect(weeklyLine(WEEK.members.alex.weekly, 4, '2026-10-13')).toMatchObject({ text: '0 of 2', badge: '4 days left' });
    expect(weeklyLine([], 6, '2026-10-13')).toBeNull();
    expect(weeklyLine(WEEK.members.blair.weekly, 6, '2026-10-11')?.badge).toBe('6 days left');
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
    expect(weekTitle(WEEK)).toBe('Week of October 12');
    expect(weekDays(WEEK).map(d => `${d.label}${d.today ? '*' : ''}`)).toEqual(['Mon', 'Tue*', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
  });

  it('keeps board order', () => {
    expect(weekRows(WEEK, [dana, alex], 6).map(r => r.member.id)).toEqual(['dana', 'alex']);
  });

  it('shares out shared chores by time done', () => {
    expect(weekShares(WEEK, [alex, blair, casey, dana]).map(s => s.text)).toEqual(['Alex 2.5 h', 'Blair 3 h 42 min', 'Casey 2 h 12 min']);
  });
});

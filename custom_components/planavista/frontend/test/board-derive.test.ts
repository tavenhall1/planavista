import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  bandAt,
  bandState,
  boardColumns,
  boardRows,
  columnFor,
  doneToday,
  estimateText,
  eveningCheck,
  everyRingClosed,
  ringsToCelebrate,
  topPanels,
  type DeriveContext,
} from '../src/modules/chores/board-derive';
import type { DayEvent } from '../src/modules/chores/calendar-ties';
import { MEMBERS, NOW, TODAY, activity, board, column, item } from './chores-fixtures';

const [alex, blair, casey, dana] = MEMBERS;
const WEEK = { section: 'week' as const, window: 'week' as const, planned: null, due_day: '2026-10-18', counted: false };
/**
 * A week cut to end `left` days on (today included), as these tests draw one: this week's rows are due on its
 * last day, as the engine sends them (final review B-I1: a week row counts to its own due day).
 */
function inWeek<T extends { window?: string | null; due_day?: string | null; section?: string }>(items: T[], left: number): T[] {
  return items.map(i => (i.window === 'week' && i.due_day === WEEK.due_day && i.section !== 'missed' ? { ...i, due_day: `2026-10-${12 + left}` } : i));
}

function ctx(fields: Partial<DeriveContext> = {}): DeriveContext {
  return {
    today: TODAY,
    now: NOW,
    events: [],
    timeFormat: '12h',
    activities: new Map([['laundry', activity('laundry', { label: '2 loads' })]]),
    members: MEMBERS,
    ...fields,
  };
}

const keysOf = (entries: ReturnType<typeof columnFor>['entries']) =>
  entries.map(e => (e.kind === 'row' ? `${e.zone}:${e.row.key.split('|')[0]}` : `${e.kind}:${e.text}`));

describe('ringsToCelebrate (spec 11.5: once a ring, once a day)', () => {
  it('celebrates a ring when it closes, but not again after an undo and a redo that day', () => {
    const items = [item('cat_care|casey|day:2026-10-13|1', { status: 'done' })];
    const columns = boardColumns(board({ casey: column(items) }), ctx());
    const celebrated = new Set<string>();
    const open = new Map([['casey', false]]);
    expect(ringsToCelebrate(columns, open, celebrated, TODAY)).toEqual(['casey']);
    expect(ringsToCelebrate(columns, open, celebrated, TODAY)).toEqual([]);
    expect(ringsToCelebrate(columns, open, celebrated, '2026-10-14')).toEqual(['casey']);
    expect(ringsToCelebrate(columns, new Map(), new Set(), TODAY)).toEqual([]);
  });
});

describe('bandAt (the engine\'s bands, spec 8.4)', () => {
  it('runs morning from the day\'s start to noon, afternoon to 5 PM, and evening past midnight', () => {
    const times: Array<[number, number]> = [[3, 0], [11, 59], [12, 0], [16, 59], [17, 0], [23, 59], [0, 30], [2, 59]];
    expect(times.map(([h, m]) => bandAt(new Date(2026, 9, 13, h, m)))).toEqual(
      ['morning', 'morning', 'afternoon', 'afternoon', 'evening', 'evening', 'evening', 'evening'],
    );
    expect(bandAt(new Date(2026, 9, 13, 3, 30), '04:00')).toBe('evening');
  });
});

describe('columnFor (spec 13.1)', () => {
  it('puts Now first, then later bands, This week, Done today (every check-off today, milestone 8), and past bands as credit', () => {
    const casey_items = [
      item('cat_care|casey|day:2026-10-13|0', { band: 'morning', status: 'done', completion: { id: 'c', done_by: 'casey', by: 'casey', at: '2026-10-13T07:30:00-05:00', source: 'tablet', state: 'done', review: null, stars: 1 } }),
      item('take_out_the_trash|casey|week:2026-10-12|0', { band: 'evening', window: 'week', due_day: '2026-10-18' }),
      item('cat_care|casey|day:2026-10-13|1', { band: 'evening', credit_minutes: 15, stars: 1 }),
      item('fix_it|casey|once|0', { band: null, dated: true, due_day: '2026-10-17', window: 'once', counted: false }),
      item('clean_the_bathroom|casey|week:2026-10-12|0', { ...WEEK, status: 'pending', credit_minutes: 60 }),
      item('yard_work|casey|week:2026-10-12|0', { ...WEEK, status: 'sent_back', note: 'edges', credit_minutes: 60 }),
    ];
    const col = columnFor(casey, column(casey_items, { stars: 23, streak: 5 }), board({ casey: column(casey_items) }), ctx());
    expect(keysOf(col.entries)).toEqual([
      'head:Now · afternoon', 'now:fix_it',
      'head:Later · evening', 'later:take_out_the_trash', 'later:cat_care',
      'head:This week', 'week:clean_the_bathroom', 'week:yard_work',
      'head:Done today', 'done:cat_care',
      'credit:Morning · 1 done',
    ]);
    expect(col.line).toBe('1 of 3 today · ★ 23 · 🔥 5 days');
    expect(col.ring).toEqual({ progress: 1 / 3, closed: false, label: 'Casey, 1 of 3 done today' });
    const rows = col.entries.flatMap(e => (e.kind === 'row' ? [e.row] : []));
    expect(rows.find(r => r.key.startsWith('fix_it'))?.badge).toEqual({ words: 'Due Sat', tone: 'neutral' });
    expect(rows.find(r => r.key.startsWith('yard'))?.badge?.words).toBe('Sent back: edges');
    expect(rows.find(r => r.key.startsWith('cat_care'))?.meta).toBe('15 min · ★ 1');
  });

  it('follows the clock when the board was last sent in an earlier band', () => {
    const items = [
      item('feed_the_fish|casey|day:2026-10-13|0', { band: 'afternoon' }),
      item('cat_care|casey|day:2026-10-13|1', { band: 'evening' }),
    ];
    const col = columnFor(casey, column(items), board({ casey: column(items) }, { band: 'morning' }), ctx());
    expect(keysOf(col.entries)).toEqual(['head:Now · afternoon', 'now:feed_the_fish', 'head:Later · evening', 'later:cat_care']);
  });

  it('shows a floating chore once, with its check-offs this week', () => {
    const items = [
      item('yard_work|casey|week:2026-10-12|0', { ...WEEK, status: 'done', credit_minutes: 20, completion: { id: 'a', done_by: 'casey', by: 'casey', at: '2026-10-12T17:00:00-05:00', source: 'tablet', state: 'done', review: null, stars: 1 } }),
      item('yard_work|casey|week:2026-10-12|1', { ...WEEK, credit_minutes: 20 }),
      item('yard_work|casey|week:2026-10-12|2', { ...WEEK, credit_minutes: 20 }),
    ];
    const col = columnFor(casey, column(items), board({ casey: column(items) }), ctx());
    const rows = col.entries.flatMap(e => (e.kind === 'row' ? [e.row] : []));
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ key: 'yard_work|casey|week:2026-10-12|1', meta: '1 h · 1 of 3', group: { done: 1, total: 3 } });
  });

  it('shows a one-time chore\'s sessions as one row, in today\'s band', () => {
    const garage = (n: number, fields = {}) => item(`clean_out_the_garage|casey|once|${n}`, {
      band: null, window: 'once', period: 'once', dated: true, due_day: '2026-10-18', counted: false, credit_minutes: 120, ...fields,
    });
    const items = [
      garage(0, { status: 'done', completion: { id: 'g', done_by: 'casey', by: 'casey', at: '2026-10-12T15:00:00-05:00', source: 'tablet', state: 'done', review: null, stars: 8 } }),
      garage(1),
    ];
    const col = columnFor(casey, column(items), board({ casey: column(items) }), ctx());
    expect(keysOf(col.entries)).toEqual(['head:Now · afternoon', 'now:clean_out_the_garage']);
    const [, entry] = col.entries;
    expect(entry).toMatchObject({ row: { key: 'clean_out_the_garage|casey|once|1', meta: '4 h · 1 of 2', badge: { words: 'Due Sun' } } });
  });

  it('lists what was done today in Done today, with the time and who did it', () => {
    const laundry = item('laundry|blair|week:2026-10-12|0', {
      section: 'week', window: 'week', planned: '2026-10-12', from: '2026-10-12', status: 'done', credit_minutes: 30,
      completion: { id: 'l', done_by: 'alex', by: 'alex', at: '2026-10-13T15:40:00-05:00', source: 'tablet', state: 'done', review: null, stars: 2 },
    });
    const col = columnFor(blair, column([laundry]), board({ blair: column([laundry]) }), ctx());
    // Her ring closed, so the column says so first.
    const [note, head, row] = col.entries;
    expect(note).toMatchObject({ kind: 'note', text: 'Ring closed for today' });
    expect(head).toMatchObject({ kind: 'head', text: 'Done today' });
    expect(row).toMatchObject({ zone: 'done', row: { doneAt: '3:40', doneBy: 'Alex', label: '2 loads' } });
  });

  it('keeps a check-off from an earlier day out of Done today', () => {
    const monday = item('laundry|blair|week:2026-10-12|0', {
      section: 'week', window: 'week', planned: '2026-10-12', from: '2026-10-12', status: 'done',
      completion: { id: 'l', done_by: 'blair', by: 'blair', at: '2026-10-12T10:00:00-05:00', source: 'tablet', state: 'done', review: null, stars: 2 },
    });
    const entries = columnFor(blair, column([monday]), board({ blair: column([monday]) }), ctx()).entries;
    expect(entries.filter(e => e.kind !== 'note')).toEqual([]);
  });

  it('puts overdue items first and says a past band still has work', () => {
    const items = [
      item('cat_care|casey|day:2026-10-13|0', { band: 'morning' }),
      item('rake|casey|rep:2026-10-10|0', { section: 'overdue', overdue_since: '2026-10-12', window: 'day' }),
    ];
    const col = columnFor(casey, column(items), board({ casey: column(items) }), ctx());
    expect(keysOf(col.entries)).toEqual(['head:Overdue', 'overdue:rake', 'head:Morning · 1 left', 'past:cat_care']);
    expect(col.left).toBe(2);
  });

  it('closes the ring when everything due is done or waiting for approval', () => {
    const items = [
      item('a|dana|day:2026-10-13|0', { status: 'done', completion: { id: 'x', done_by: 'dana', by: 'dana', at: '2026-10-13T08:00:00-05:00', source: 'tablet', state: 'done', review: null, stars: 1 } }),
      item('b|dana|day:2026-10-13|0', { status: 'pending' }),
    ];
    const col = columnFor(dana, column(items, { stars: 12 }), board({ dana: column(items) }), ctx());
    expect(col.ring).toMatchObject({ progress: 1, closed: true, label: 'Dana, ring closed for today' });
    expect(col.pictures).toBe(true);
    expect(col.line).toBe('2 of 2 today · ★ 12');
  });

  it('says when nothing is due, and leaves stars out for someone who does not earn them', () => {
    const col = columnFor(alex, column([]), board({ alex: column([]) }), ctx());
    expect(col.line).toBe('Nothing due today');
    expect(col.empty).toBe(true);
  });

  it('names their next event, and says when they are free until then', () => {
    const soccer: DayEvent = {
      title: 'Soccer', start: new Date(2026, 9, 13, 17, 30), end: new Date(2026, 9, 13, 19), calendar: 'calendar.casey', member: 'casey',
    };
    const col = columnFor(casey, column([]), board({ casey: column([]) }), ctx({ events: [soccer] }));
    expect(col.next).toBe('Next on calendar: Soccer at 5:30 · free until then');
  });
});

describe('the top of a column: Missed, then due soon (missed-and-urgency spec 4, 5)', () => {
  // Today is Tuesday, October 13; a week ending (exclusive) `left` days on leaves `left` days, today included.
  const weekOf = (left: number) => ({ start: '2026-10-12', end: `2026-10-${13 + left}`, days_left: left });
  const done = (at: string) => ({ id: 'd', done_by: 'casey', by: 'casey', at, source: 'tablet', state: 'done', review: null, stars: 1 });
  const lastWeek = { count: 1, unit: 'week' as const, in_a_row: false, periods: ['2026-10-05'], late: true };
  const twoDays = { count: 2, unit: 'day' as const, in_a_row: true, periods: ['2026-10-11', '2026-10-12'], late: false };
  const laundry = (n: number, fields = {}) => item(`laundry|casey|week:2026-10-12|${n}`, { ...WEEK, credit_minutes: 30, ...fields });

  function col(items: ReturnType<typeof item>[], left = 6, who = casey) {
    const fitted = inWeek(items, left);
    const b = board({ [who.id]: column(fitted) }, { week: weekOf(left) });
    return columnFor(who, column(fitted), b, ctx());
  }
  const headOf = (c: ReturnType<typeof columnFor>, key: string) => c.entries.find(e => e.key === key);
  const rowOf = (c: ReturnType<typeof columnFor>, chore: string) =>
    c.entries.flatMap(e => (e.kind === 'row' ? [e] : [])).find(e => e.row.key.startsWith(`${chore}|`));

  it('draws Missed first (oldest miss first), then due soon, then Overdue, the bands, and Done today', () => {
    const items = [
      item('make_bed|casey|day:2026-10-13|0', { band: 'morning', credit_minutes: 5, missed: twoDays }),
      item('cat_care|casey|day:2026-10-13|1', { band: 'evening' }),
      item('rake|casey|rep:2026-10-10|0', { section: 'overdue', overdue_since: '2026-10-12', window: 'day' }),
      item('clean_the_bathroom|casey|week:2026-10-05|0', {
        ...WEEK, section: 'missed', due_day: '2026-10-11', overdue_since: '2026-10-11', credit_minutes: 60, missed: lastWeek,
      }),
      laundry(0), laundry(1),
      item('feed_the_fish|casey|day:2026-10-13|0', { band: 'morning', status: 'done', completion: done('2026-10-13T16:00:00-05:00') }),
    ];
    const c = col(items, 2);
    expect(keysOf(c.entries)).toEqual([
      'head:Missed · 2', 'missed:clean_the_bathroom', 'missed:make_bed',
      'head:This week · 2 to go', 'soon:laundry',
      'head:Overdue', 'overdue:rake',
      'head:Later · evening', 'later:cat_care',
      'head:Done today', 'done:feed_the_fish',
      // The morning's flagged bed left for the top, so the morning says only what was done.
      'credit:Morning · 1 done',
    ]);
    expect(headOf(c, 'head:missed')).toEqual({ kind: 'head', key: 'head:missed', text: 'Missed · 2', tone: 'missed' });
    expect(headOf(c, 'head:soon')).toEqual({ kind: 'head', key: 'head:soon', text: 'This week · 2 to go', right: '2 days left', tone: 'soon' });
    // Each panel's rows say which panel they're in, and the last one closes it.
    expect(rowOf(c, 'clean_the_bathroom')).toMatchObject({ zone: 'missed', panel: 'missed', end: false });
    expect(rowOf(c, 'make_bed')).toMatchObject({ zone: 'missed', panel: 'missed', end: true });
    expect(rowOf(c, 'laundry')).toMatchObject({ zone: 'soon', panel: 'soon', end: true });
    // A missed row's badge sits under its name, with its estimate beside it.
    expect(rowOf(c, 'make_bed')?.row).toMatchObject({
      badge: { words: 'Missed 2 days in a row', tone: 'bad', glyph: '×' }, badgeUnder: true, meta: '5 min · ★ 1',
    });
    expect(rowOf(c, 'clean_the_bathroom')?.row.badge?.words).toBe('Missed last week');
    // The panel's heading says the days left, so its rows show their estimate (the mockup), not "2 days left".
    expect(rowOf(c, 'laundry')?.row).toMatchObject({ badge: null, meta: '1 h · 0 of 2', group: { done: 0, total: 2 } });
    // A missed chore doesn't hold today's ring open: the late row isn't counted, today's flagged copy is.
    expect(c.left).toBe(3);
  });

  it('turns the panel red on the last day', () => {
    const c = col([laundry(0), laundry(1, { status: 'done', completion: done('2026-10-12T17:00:00-05:00') })], 1);
    expect(keysOf(c.entries)).toEqual(['head:Last day · 1 to go', 'soon:laundry']);
    expect(headOf(c, 'head:soon')).toMatchObject({ right: 'Ends tonight', tone: 'last' });
    expect(rowOf(c, 'laundry')).toMatchObject({ zone: 'soon', panel: 'last', end: true, row: { badge: null, meta: '1 h · 1 of 2' } });
  });

  it('counts open check-offs, and says Due soon when something other than the week joins', () => {
    const items = [
      laundry(0), laundry(1),
      item('wash_the_car|casey|rep:2026-10-01|0', { ...WEEK, window: 'month', due_day: '2026-10-14' }),
      item('fix_it|casey|once|0', { band: null, dated: true, due_day: '2026-10-13', window: 'once', counted: false }),
    ];
    const c = col(items, 2);
    expect(keysOf(c.entries)).toEqual(['head:Due soon · 4 to go', 'soon:fix_it', 'soon:wash_the_car', 'soon:laundry']);
    // The most urgent sets the look; what ends later says when.
    expect(headOf(c, 'head:soon')).toMatchObject({ right: 'Ends tonight', tone: 'last' });
    expect(rowOf(c, 'fix_it')).toMatchObject({ panel: 'last', tile: 'last', row: { badge: { words: 'Due today', tone: 'time' } } });
    // Each tile takes its own look in a mixed panel (final review B-m3).
    expect(rowOf(c, 'wash_the_car')).toMatchObject({ panel: 'last', tile: 'soon' });
    expect(rowOf(c, 'wash_the_car')?.row.badge).toEqual({ words: '2 days left', tone: 'time', glyph: '•' });
    expect(rowOf(c, 'laundry')?.row.badge).toEqual({ words: '2 days left', tone: 'time', glyph: '•' });
  });

  it('takes a monthly chore near its end on its own, leaving the week where it was', () => {
    const month = item('wash_the_car|casey|rep:2026-10-01|0', { ...WEEK, window: 'month', due_day: '2026-10-14' });
    const c = col([month, laundry(0)], 6);
    expect(keysOf(c.entries)).toEqual(['head:Due soon · 1 to go', 'soon:wash_the_car', 'head:This week', 'week:laundry']);
    expect(headOf(c, 'head:soon')).toMatchObject({ right: '2 days left', tone: 'soon' });
    expect(headOf(c, 'head:week')).toEqual({ kind: 'head', key: 'head:week', text: 'This week', right: '6 days left', tone: 'plain' });
  });

  it("warns at 3 days: the week heading's right and its rows turn amber, still in place", () => {
    const c = col([laundry(0)], 3);
    expect(keysOf(c.entries)).toEqual(['head:This week', 'week:laundry']);
    expect(headOf(c, 'head:week')).toEqual({ kind: 'head', key: 'head:week', text: 'This week', right: '3 days left', rightTone: 'warn', tone: 'plain' });
    expect(rowOf(c, 'laundry')?.row.badge).toEqual({ words: '3 days left', tone: 'time', glyph: '•' });
  });

  it('puts a flagged week copy in Missed only, never counted again in due soon', () => {
    const c = col([laundry(0, { missed: lastWeek }), item('vacuum|casey|week:2026-10-12|0', { ...WEEK })], 2);
    expect(keysOf(c.entries)).toEqual(['head:Missed · 1', 'missed:laundry', 'head:This week · 1 to go', 'soon:vacuum']);
  });

  it('calls the panel Due soon while a This week section stays below it (final review B-m1)', () => {
    const waiting = item('vacuum|casey|week:2026-10-12|0', { ...WEEK, status: 'pending', completion: done('2026-10-13T09:00:00-05:00') });
    const c = col([laundry(0), waiting], 2);
    expect(keysOf(c.entries)).toEqual(['head:Due soon · 1 to go', 'soon:laundry', 'head:This week', 'week:vacuum']);
    // Alone, it keeps the week's name.
    expect(keysOf(col([laundry(0)], 2).entries)).toEqual(['head:This week · 1 to go', 'soon:laundry']);
  });

  it("takes a group's flag only from an open check-off (final review B-I4)", () => {
    const c = col([laundry(0, { status: 'done', completion: done('2026-10-13T09:00:00-05:00'), missed: lastWeek }), laundry(1)], 6);
    expect(keysOf(c.entries)).toEqual(['head:This week', 'week:laundry', 'head:Done today', 'done:laundry']);
  });

  it('keeps a chore planned for today in its band, as a daily chore is', () => {
    const trash = item('take_out_the_trash|casey|week:2026-10-12|0', { band: 'evening', window: 'week', due_day: '2026-10-14' });
    expect(keysOf(col([trash], 2).entries)).toEqual(['head:Later · evening', 'later:take_out_the_trash']);
  });

  it("shows a one-time chore's late row on its own, and a sent-back carrier in Missed", () => {
    const once = item('clean_out_the_garage|casey|once|0', {
      section: 'missed', band: null, window: 'once', period: 'once', dated: true, due_day: '2026-10-10', overdue_since: '2026-10-10',
      counted: false, missed: { count: 1, unit: 'time', in_a_row: false, periods: ['2026-10-10'], late: true },
    });
    const c = col([
      once,
      laundry(0, { status: 'sent_back', note: 'socks' }),
      laundry(1, { missed: lastWeek }),
    ], 6);
    // Oldest miss first: last week's laundry, then Saturday's garage.
    expect(keysOf(c.entries)).toEqual(['head:Missed · 2', 'missed:laundry', 'missed:clean_out_the_garage']);
    expect(rowOf(c, 'clean_out_the_garage')?.row.badge?.words).toBe('Missed Sat');
    // The group's row acts on the sent-back load and says why; the flag puts it at the top.
    expect(rowOf(c, 'laundry')?.row).toMatchObject({ key: 'laundry|casey|week:2026-10-12|0', badge: { words: 'Sent back: socks' } });
  });

  it('lists a late row checked off today in Done today: Done late, or waiting for approval', () => {
    const late = (chore: string, status: 'done' | 'pending') => item(`${chore}|casey|week:2026-10-05|0`, {
      ...WEEK, section: 'missed', status, overdue_since: '2026-10-11', completion: done('2026-10-13T09:00:00-05:00'),
    });
    const c = col([late('clean_the_bathroom', 'done'), late('vacuum', 'pending')], 6);
    expect(keysOf(c.entries)).toEqual(['head:Done today', 'done:clean_the_bathroom', 'done:vacuum']);
    expect(rowOf(c, 'clean_the_bathroom')?.row.badge).toEqual({ words: 'Done late', tone: 'muted' });
    expect(rowOf(c, 'vacuum')?.row.badge?.words).toBe('Waiting for approval');
  });

  it("puts missed tiles first on a young child's screen", () => {
    const items = [
      item('feed_the_fish|dana|day:2026-10-13|0', { band: 'afternoon' }),
      item('tidy_toys|dana|day:2026-10-13|0', { band: 'afternoon', missed: { ...twoDays, count: 1, periods: ['2026-10-12'] } }),
    ];
    const c = col(items, 6, dana);
    expect(c.pictures).toBe(true);
    expect(keysOf(c.entries)).toEqual(['head:Missed · 1', 'missed:tidy_toys', 'head:Now · afternoon', 'now:feed_the_fish']);
    expect(rowOf(c, 'tidy_toys')?.row.badge?.words).toBe('Missed yesterday');
  });

  it("is one rule My day can reuse: the panels' entries and the rows they took", () => {
    const rowsFor = (left: number) => columnFor(casey, column(inWeek([laundry(0)], left)), board({ casey: column(inWeek([laundry(0)], left)) }), ctx())
      .entries.flatMap(e => (e.kind === 'row' ? [e.row] : []));
    const { entries, used } = topPanels(rowsFor(1), { today: TODAY, week: weekOf(1) });
    expect(entries.map(e => e.key)).toEqual(['head:soon', 'laundry|casey|week:2026-10-12|0']);
    expect([...used]).toEqual(['laundry|casey|week:2026-10-12|0']);
    expect(topPanels(rowsFor(6), { today: TODAY, week: weekOf(6) })).toEqual({ entries: [], used: new Set() });
  });
});

describe('"Ring closed for today" comes after the top panels (missed-and-urgency, review round 1)', () => {
  const fish = item('feed_the_fish|casey|day:2026-10-13|0', {
    band: 'morning', status: 'done',
    completion: { id: 'f', done_by: 'casey', by: 'casey', at: '2026-10-13T08:00:00-05:00', source: 'tablet', state: 'done', review: null, stars: 1 },
  });
  const late = item('clean_the_bathroom|casey|week:2026-10-05|0', {
    ...WEEK, section: 'missed', overdue_since: '2026-10-11',
    missed: { count: 1, unit: 'week', in_a_row: false, periods: ['2026-10-05'], late: true },
  });
  const laundry = item('laundry|casey|week:2026-10-12|0', { ...WEEK });
  function col(items: ReturnType<typeof item>[], left: number, who = casey) {
    const fitted = inWeek(items, left);
    const b = board({ [who.id]: column(fitted) }, { week: { start: '2026-10-12', end: `2026-10-${13 + left}`, days_left: left } });
    return columnFor(who, column(fitted), b, ctx());
  }

  it('says it after Missed and due soon, since misses don\'t count in the ring', () => {
    const c = col([fish, late, laundry], 2);
    expect(c.ring.closed).toBe(true);
    expect(keysOf(c.entries)).toEqual([
      'head:Missed · 1', 'missed:clean_the_bathroom',
      'head:This week · 1 to go', 'soon:laundry',
      'note:Ring closed for today',
      'head:Done today', 'done:feed_the_fish',
      'credit:Morning · 1 done',
    ]);
    expect(c.entries.find(e => e.kind === 'note')).toEqual({
      kind: 'note', key: 'note:closed', text: 'Ring closed for today', detail: 'Everything due today is done. Nice work.',
    });
  });

  it('says it first when nothing is at the top, and not while the ring is open', () => {
    expect(keysOf(col([fish, laundry], 6).entries).slice(0, 2)).toEqual(['note:Ring closed for today', 'head:This week']);
    expect(keysOf(col([late, item('cat_care|casey|day:2026-10-13|1', { band: 'evening' })], 6).entries)).not.toContain('note:Ring closed for today');
  });

  it("doesn't say it while one of today's chores is still open, in a band or a panel", () => {
    const fixIt = (due: string) => item('fix_it|casey|once|0', { band: null, dated: true, due_day: due, window: 'once', counted: false });
    expect(keysOf(col([fish, fixIt('2026-10-17')], 6).entries)).toEqual(['head:Now · afternoon', 'now:fix_it', 'head:Done today', 'done:feed_the_fish', 'credit:Morning · 1 done']);
    expect(keysOf(col([fish, fixIt('2026-10-13')], 6).entries)).toEqual([
      'head:Last day · 1 to go', 'soon:fix_it', 'head:Done today', 'done:feed_the_fish', 'credit:Morning · 1 done',
    ]);
  });

  it("goes in the same place among a young child's tiles", () => {
    const tidy = (fields = {}) => item('tidy_toys|dana|day:2026-10-13|0', {
      band: 'morning', status: 'done',
      completion: { id: 't', done_by: 'dana', by: 'dana', at: '2026-10-13T08:00:00-05:00', source: 'tablet', state: 'done', review: null, stars: 1 },
      ...fields,
    });
    const missedFish = item('feed_the_fish|dana|day:2026-10-12|0', {
      section: 'missed', overdue_since: '2026-10-12', counted: false,
      missed: { count: 1, unit: 'day', in_a_row: false, periods: ['2026-10-12'], late: true },
    });
    const c = col([tidy(), missedFish], 6, dana);
    expect(c.pictures).toBe(true);
    expect(keysOf(c.entries)).toEqual(['head:Missed · 1', 'missed:feed_the_fish', 'note:Ring closed for today', 'head:Done today', 'done:tidy_toys', 'credit:Morning · 1 done']);
  });
});

describe('boardColumns', () => {
  it('keeps board order and leaves out anyone the board has no column for', () => {
    const b = board({ dana: column([]), alex: column([]) });
    expect(boardColumns(b, ctx()).map(c => c.member.id)).toEqual(['alex', 'dana']);
  });
});

describe('eveningCheck (spec 9.9)', () => {
  const items = [item('cat_care|casey|day:2026-10-13|1', { band: 'evening' }), item('trash|casey|week:2026-10-12|0', { band: 'evening' })];
  const fish = [item('fish|dana|day:2026-10-13|0')];
  const b = board({ casey: column(items), dana: column(fish) });
  const cols = boardColumns(b, ctx());

  it('stays quiet before the evening check time', () => {
    expect(eveningCheck(cols, b, NOW)).toBeNull();
  });

  it('names who still has chores at the evening check', () => {
    expect(eveningCheck(cols, b, new Date(2026, 9, 13, 19, 5))).toEqual({
      text: 'Evening check: Casey has 2 chores left and Dana has 1', members: ['casey', 'dana'],
    });
    expect(eveningCheck(cols, { ...b, settings: { ...b.settings, evening_check: null } }, new Date(2026, 9, 13, 19, 5))).toBeNull();
  });
});

describe('boardRows (spec 12.3)', () => {
  it('keeps people in columns while each can be 240 px wide', () => {
    expect(boardRows(4, 1256)).toEqual([4]);
    expect(boardRows(3, 776)).toEqual([3]);
  });

  it('wraps into an even grid, with a short last row', () => {
    expect(boardRows(4, 776)).toEqual([2, 2]);
    expect(boardRows(5, 776)).toEqual([3, 2]);
    expect(boardRows(6, 776)).toEqual([3, 3]);
    expect(boardRows(2, 200)).toEqual([1, 1]);
    expect(boardRows(0, 800)).toEqual([]);
  });

  // Round 2: an iPhone held sideways with the sidebar (a 236 px board) drew two rows of
  // clipped heads with no chores showing.
  it('keeps one row, scrolling sideways, when rows would be too short to show a chore', () => {
    expect(boardRows(4, 614, 12, 240, 236)).toEqual([4]);
    expect(boardRows(4, 614, 12, 240, 800)).toEqual([2, 2]);
    expect(boardRows(8, 776, 12, 240, 1000)).toEqual([3, 3, 2]);
  });
});

describe('the board draws every column the same width (round 2)', () => {
  it("fills a short last row's empty places, and scrolls a row too wide to fit", () => {
    const source = readFileSync(new URL('../src/modules/chores/pv-chores-board.ts', import.meta.url), 'utf-8').replace(/\r\n/g, '\n');
    expect(source).toMatch(/Array\.from\(\{ length: perRow - count \}, \(\) => html`<div class="filler" aria-hidden="true"><\/div>`\)/);
    expect(source).toMatch(/const rows = boardRows\(columns\.length, width \|\| 1200, GAP, MIN_COLUMN, this\._height \|\| Infinity\);/);
    expect(source).toMatch(/\.row\.scroll \{\n\s+overflow-x: auto;/);
  });
});

describe('small helpers', () => {
  it('orders bands', () => {
    expect(bandState('morning', 'afternoon')).toBe('past');
    expect(bandState('afternoon', 'afternoon')).toBe('now');
    expect(bandState('evening', 'afternoon')).toBe('later');
  });

  it('shows the estimate, with stars only for someone who earns them', () => {
    expect(estimateText(item('a|x|day:1|0', { credit_minutes: 30, stars: 2 }), true)).toBe('30 min · ★ 2');
    expect(estimateText(item('a|x|day:1|0', { credit_minutes: 30, stars: 2 }), false)).toBe('30 min');
  });

  it('tells a check-off of today\'s chore day from yesterday\'s, across the 3:00 AM line', () => {
    const b = board({});
    const at = (stamp: string) => item('a|x|day:1|0', { completion: { id: 'c', done_by: 'x', by: 'x', at: stamp, source: 'tablet', state: 'done', review: null, stars: 1 } });
    expect(doneToday(at('2026-10-13T02:59:00-05:00'), b)).toBe(false);
    expect(doneToday(at('2026-10-13T03:00:00-05:00'), b)).toBe(true);
    expect(doneToday(at('2026-10-14T02:30:00-05:00'), b)).toBe(true);
  });

  it('celebrates the family once every ring with something due is closed', () => {
    const doneItem = item('a|alex|day:1|0', { status: 'done' });
    const closed = boardColumns(board({ alex: column([doneItem]), blair: column([]) }), ctx());
    expect(everyRingClosed(closed)).toBe(true);
    expect(everyRingClosed(boardColumns(board({ alex: column([item('a|alex|day:1|0')]) }), ctx()))).toBe(false);
    expect(everyRingClosed(boardColumns(board({ blair: column([]) }), ctx()))).toBe(false);
  });
});

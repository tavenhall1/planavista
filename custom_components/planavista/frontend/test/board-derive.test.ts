import { describe, expect, it } from 'vitest';
import {
  bandState,
  boardColumns,
  boardRows,
  columnFor,
  doneToday,
  estimateText,
  eveningCheck,
  everyRingClosed,
  type DeriveContext,
} from '../src/modules/chores/board-derive';
import type { DayEvent } from '../src/modules/chores/calendar-ties';
import { MEMBERS, NOW, TODAY, activity, board, column, item } from './chores-fixtures';

const [alex, blair, casey, dana] = MEMBERS;
const WEEK = { section: 'week' as const, window: 'week' as const, planned: null, due_day: '2026-10-18', counted: false };

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

describe('columnFor (spec 13.1)', () => {
  it('puts Now first, then later bands, This week, Done today, and past bands as credit', () => {
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
      'credit:Morning · 1 done',
    ]);
    expect(col.line).toBe('1 of 3 today · ★ 23 · 🔥 5 days');
    expect(col.ring).toEqual({ progress: 1 / 3, closed: false, label: 'Casey, 1 of 3 done today' });
    const rows = col.entries.flatMap(e => (e.kind === 'row' ? [e.row] : []));
    expect(rows.find(r => r.key.startsWith('fix_it'))?.badge).toEqual({ words: 'Due Sat', tone: 'neutral' });
    expect(rows.find(r => r.key.startsWith('yard'))?.badge?.words).toBe('Sent back: edges');
    expect(rows.find(r => r.key.startsWith('cat_care'))?.meta).toBe('15 min · ★ 1');
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
    const [head, row] = col.entries;
    expect(head).toMatchObject({ kind: 'head', text: 'Done today' });
    expect(row).toMatchObject({ zone: 'done', row: { doneAt: '3:40', doneBy: 'Alex', label: '2 loads' } });
  });

  it('keeps a check-off from an earlier day out of Done today', () => {
    const monday = item('laundry|blair|week:2026-10-12|0', {
      section: 'week', window: 'week', planned: '2026-10-12', from: '2026-10-12', status: 'done',
      completion: { id: 'l', done_by: 'blair', by: 'blair', at: '2026-10-12T10:00:00-05:00', source: 'tablet', state: 'done', review: null, stars: 2 },
    });
    expect(columnFor(blair, column([monday]), board({ blair: column([monday]) }), ctx()).entries).toEqual([]);
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

  it('closes the ring when everything due is done or waiting for OK', () => {
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

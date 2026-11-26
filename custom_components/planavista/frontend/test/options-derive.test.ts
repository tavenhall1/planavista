import { describe, expect, it } from 'vitest';
import {
  addDays,
  chipLabel,
  creditedText,
  dayWords,
  dueChips,
  historyLines,
  itemOptions,
  missedNote,
  moreTimeChips,
  type OptionsContext,
  planChips,
  rhythmText,
  whoDidItBody,
} from '../src/modules/chores/options-derive';
import { MEMBERS, TODAY, activity, item } from './chores-fixtures';
import type { MissedFlag } from '../src/core/status-map';

const [alex, blair, casey] = MEMBERS;
const YARD = item('yard_work|casey|week:2026-10-12|0', {
  section: 'week', window: 'week', planned: null, due_day: '2026-10-18', counted: false, credit_minutes: 60, stars: 4,
});
const LATCH = item('fix_the_gate_latch|alex|once|0', {
  window: 'once', period: 'once', dated: true, due_day: '2026-10-17', planned: null, credit_minutes: 30, stars: 2,
});

function ctx(fields: Partial<OptionsContext>): OptionsContext {
  return {
    item: YARD,
    activity: activity('yard_work', { minimum: { hours: 1, per: 'week' }, created: { by: 'blair', source: 'tablet', at: '2026-10-11T19:00:00-05:00' } }),
    owner: casey,
    members: MEMBERS,
    today: TODAY,
    member: 'yes',
    parent: 'pin',
    ...fields,
  };
}

const ids = (list: Array<{ id: string }>) => list.map(o => o.id);

describe('itemOptions (spec 13.3)', () => {
  it('offers a member planning, requests, done by someone else, and history', () => {
    const options = itemOptions(ctx({}));
    expect(ids(options.member)).toEqual(['plan_day', 'more_time', 'skip', 'done_by', 'history']);
    expect(options.member[1]).toMatchObject({ tag: 'Needs approval', hint: 'Sends a request to Alex and Blair.' });
    expect(options.member[0].hint).toBe('Shows on that day, and it\'s still due Sunday.');
    expect(options.title).toBe('Yard work');
    expect(options.meta).toBe('Casey · Every week · 1 h · ★ 4');
    expect(options.added).toBe('Added by Blair on Sunday');
  });

  it("leaves out Done by someone else when this screen can't credit anyone (round 2)", () => {
    expect(ids(itemOptions(ctx({ credit: false })).member)).toEqual(['plan_day', 'more_time', 'skip', 'history']);
    expect(ids(itemOptions(ctx({ credit: true })).member)).toContain('done_by');
  });

  it('names a person who added a chore, never an account kind (milestone 8)', () => {
    const byAdmin = activity('yard_work', { minimum: { hours: 1, per: 'week' }, created: { by: 'admin', source: 'tablet', at: '2026-10-10T19:00:00-05:00' } });
    expect(itemOptions(ctx({ activity: byAdmin })).added).toBe('Added on Saturday');
  });

  it('marks the parent options with a lock on a shared screen, and hides them on a child\'s own login', () => {
    const shared = itemOptions(ctx({}));
    expect(ids(shared.parent)).toEqual(['change_due', 'hand_off', 'excuse', 'edit', 'delete']);
    expect(shared.parent.find(o => o.id === 'edit')!.hint).toBe('Opens it in Settings.');
    expect(shared.parent.every(o => o.tag === '🔒 Parent')).toBe(true);
    expect(itemOptions(ctx({ parent: 'no' })).parent).toEqual([]);
    expect(itemOptions(ctx({ parent: 'yes' })).parent[0].tag).toBeUndefined();
  });

  it('gives a parent\'s own chore no requests, since a parent just changes it', () => {
    const options = itemOptions(ctx({ item: LATCH, owner: alex, activity: activity('fix_the_gate_latch', { schedule: 'once', once: { on: null, by: '2026-10-17', by_time: null, sessions: 1, estimate_minutes: 30 } }) }));
    expect(ids(options.member)).toEqual(['plan_day', 'done_by', 'history']);
    expect(options.meta).toBe('Alex · Once · by Saturday · 30 min');
  });

  it('asks for the owner\'s PIN where one is needed', () => {
    const options = itemOptions(ctx({ member: 'pin' }));
    expect(options.member[0].tag).toBe('🔒 Casey\'s PIN');
  });

  it('offers unchecking a done one, and review for one waiting for approval', () => {
    expect(ids(itemOptions(ctx({ item: { ...YARD, status: 'done' } })).member)).toEqual(['undo', 'done_by', 'history']);
    const pending = itemOptions(ctx({ item: { ...YARD, status: 'pending' }, parent: 'yes' }));
    expect(ids(pending.member)).toEqual(['undo', 'history']);
    expect(ids(pending.parent)).toEqual(['approve', 'send_back', 'edit', 'delete']);
  });

  it('says why a sent back one came back, and that a request is waiting', () => {
    expect(itemOptions(ctx({ item: { ...YARD, status: 'sent_back', note: 'edges' } })).note).toBe('Sent back: edges');
    const asked = itemOptions(ctx({ item: { ...YARD, request: { id: 'r', kind: 'more_time', until: '2026-10-25' } } }));
    expect(asked.note).toBe('Waiting for a parent: more time, until October 25.');
    expect(ids(asked.member)).toEqual(['plan_day', 'done_by', 'history']);
  });

  it('lets a child\'s own login see only the history of someone else\'s chore', () => {
    expect(ids(itemOptions(ctx({ member: 'no', parent: 'no' })).member)).toEqual(['history']);
  });
});

describe('day chips', () => {
  it('plans tomorrow up to the day it is due', () => {
    expect(planChips(YARD, TODAY).map(c => c.label)).toEqual(['Tomorrow', 'Thu', 'Fri', 'Sat', 'Sun']);
    expect(planChips(item('cat|x|day:1|0'), TODAY)).toEqual([]);
  });

  it('moves a due date a day or a week, and asks for later days', () => {
    expect(dueChips(LATCH, TODAY).map(c => c.label)).toEqual(['Sun', 'Next Sat']);
    expect(moreTimeChips(YARD, TODAY).map(c => [c.day, c.label])).toEqual([
      ['2026-10-19', 'Mon'], ['2026-10-20', 'Next Tue'], ['2026-10-25', 'Next Sun'],
    ]);
  });

  it('labels days the way a family says them', () => {
    expect(chipLabel('2026-10-14', TODAY)).toBe('Tomorrow');
    expect(chipLabel('2026-10-17', TODAY)).toBe('Sat');
    expect(chipLabel('2026-10-24', TODAY)).toBe('Next Sat');
    expect(chipLabel('2026-11-02', TODAY)).toBe('Nov 2');
    expect(dayWords('2026-10-18', TODAY)).toBe('Sunday');
    expect(addDays('2026-10-31', 1)).toBe('2026-11-01');
  });
});

describe('rhythmText', () => {
  it('says how often', () => {
    expect(rhythmText(activity('laundry', { minimum: { hours: 2, per: 'week' }, days: ['mon', 'thu'] }), YARD, TODAY)).toBe('Mon and Thu');
    expect(rhythmText(activity('cat', { minimum: { hours: 0.5, per: 'day' } }), YARD, TODAY)).toBe('Every day');
    expect(rhythmText(activity('filter', { schedule: 'repeats', repeats: { rrule: 'FREQ=MONTHLY;BYMONTHDAY=1', start: '2026-10-01', window: 'period', estimate_minutes: 15 } }), YARD, TODAY)).toBe('Repeats monthly');
  });
});

describe('historyLines', () => {
  it('words the streak, how often lately, the last time, and when it usually gets done', () => {
    const lines = historyLines({
      chore: 'yard_work', member: 'casey', streak: { weeks: 4 }, weeks: { done: 4, of: 6 },
      recent: [{ at: '2026-10-10T14:00:00-05:00', done_by: 'casey', state: 'done', occurrence: 'x' }],
      usual: { band: 'afternoon', day: 'sat' },
    }, TODAY, MEMBERS, '12h');
    expect(lines).toEqual(['🔥 4 weeks in a row', 'Done 4 of the last 6 weeks', 'Last done Saturday at 2:00 PM', 'Usually Saturdays in the afternoon']);
  });

  it('says when it has not been done yet, and who did it for someone else', () => {
    expect(historyLines({ chore: 'c', member: 'casey', streak: { days: 0 }, weeks: { done: 0, of: 0 }, recent: [], usual: { band: null, day: null } }, TODAY, MEMBERS, '12h'))
      .toEqual(['Not done yet']);
    const byBlair = historyLines({
      chore: 'c', member: 'casey', streak: { days: 3 }, weeks: { done: 1, of: 1 },
      recent: [{ at: '2026-10-12T19:30:00-05:00', done_by: 'blair', state: 'done', occurrence: 'x' }], usual: { band: 'evening', day: null },
    }, TODAY, [blair, casey], '24h');
    expect(byBlair).toEqual(['🔥 3 days in a row', 'Last done Monday at 19:30 by Blair', 'Usually in the evening']);
  });
});

describe('Who did it? (milestone 8)', () => {
  it('both sheets say the same thing before anyone is picked', () => {
    expect(whoDidItBody('Cat care')).toBe('They get the credit for Cat care.');
  });

  it('after the pick, says the stars only when that person earns them', () => {
    expect(creditedText({ name: 'Dana', stars: true }, 1)).toBe('Dana gets the credit and the stars.');
    expect(creditedText({ name: 'Blair', stars: false }, 1)).toBe('Blair gets the credit.');
    expect(creditedText({ name: 'Dana', stars: true }, 0)).toBe('Dana gets the credit.');
  });
});

describe("a missed chore's options (missed-and-urgency spec 6)", () => {
  const flag = (fields: Partial<MissedFlag>): MissedFlag => ({
    count: 1, unit: 'week', in_a_row: false, periods: ['2026-10-05'], late: true, keys: ['yard_work|casey|week:2026-10-05|0'], ...fields,
  });

  it('says what doing it now does, and what stays in the record', () => {
    expect(missedNote(flag({ late: false }), TODAY)).toEqual({ title: 'Missed last week', body: "Doing this week's takes it off the top." });
    expect(missedNote(flag({ late: false, unit: 'day', periods: ['2026-10-12'] }), TODAY).body).toBe("Doing today's takes it off the top.");
    expect(missedNote(flag({}), TODAY).body).toBe('Not done last week. Doing it now takes it off the top. It stays in the record.');
    expect(missedNote(flag({ count: 2, periods: ['2026-10-05', '2026-10-12'], in_a_row: true }), TODAY)).toEqual({
      title: 'Missed 2 weeks in a row',
      body: 'Not done the weeks of Oct 5 and Oct 12. Doing it now takes it off the top. Both misses stay in the record.',
    });
    expect(missedNote(flag({ count: 3, periods: ['2026-09-28', '2026-10-05', '2026-10-12'] }), TODAY).body)
      .toBe('Not done the weeks of Sep 28, Oct 5 and Oct 12. Doing it now takes it off the top. All 3 misses stay in the record.');
  });

  it('gives a parent Take it off the board and Excuse the misses, with the count in the label', () => {
    const many = flag({ count: 2, periods: ['2026-10-05', '2026-10-12'], keys: ['a|casey|week:2026-10-05|0', 'a|casey|week:2026-10-12|0'] });
    const options = itemOptions(ctx({ item: { ...YARD, missed: many } }));
    expect(options.missed?.title).toBe('Missed 2 times');
    expect(options.parent.filter(o => o.id === 'clear_missed' || o.id === 'excuse_missed')).toEqual([
      { id: 'clear_missed', label: 'Take it off the board', tag: '🔒 Parent', hint: 'It stays missed. Nothing more to do this time.' },
      { id: 'excuse_missed', label: 'Excuse the misses', tag: '🔒 Parent', hint: 'There was a good reason. They count as excused, not missed.', keys: many.keys },
    ]);
    const one = itemOptions(ctx({ item: { ...YARD, missed: flag({}) } }));
    expect(one.parent.find(o => o.id === 'excuse_missed')?.label).toBe('Excuse the miss');
    expect(one.parent.find(o => o.id === 'excuse_missed')?.hint).toBe('There was a good reason. It counts as excused, not missed.');
  });

  it('offers nothing about misses to a child, or on a chore with none', () => {
    expect(itemOptions(ctx({ item: { ...YARD, missed: flag({}) }, parent: 'no' })).parent).toEqual([]);
    expect(itemOptions(ctx({ item: { ...YARD, missed: flag({}) }, parent: 'no' })).missed?.title).toBe('Missed last week');
    expect(itemOptions(ctx({})).missed).toBeUndefined();
    expect(ids(itemOptions(ctx({})).parent)).not.toContain('clear_missed');
  });

  it('leaves out Excuse the misses when the feed names no records', () => {
    const options = itemOptions(ctx({ item: { ...YARD, missed: flag({ keys: [] }) } }));
    expect(ids(options.parent)).toContain('clear_missed');
    expect(ids(options.parent)).not.toContain('excuse_missed');
  });
});

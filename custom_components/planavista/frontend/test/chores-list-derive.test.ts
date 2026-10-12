import { describe, expect, it } from 'vitest';
import {
  choreRow, choresList, durationText, groupOf, onTheBoard, rhythmText,
} from '../src/modules/chores/settings/chores-list-derive';
import type { Activity } from '../src/modules/chores/chores-types';
import { MEMBERS, TODAY, activity } from './chores-fixtures';

const SETTINGS = { minutes_per_star: 15 };

/** The sample household's chores (spec 4), as the Settings mockup lists them. */
const SAMPLE: Activity[] = [
  activity('kitchen_cleanup', { name: 'Kitchen cleanup', assignees: ['alex'], minimum: { hours: 0.5, per: 'day' }, time_of_day: ['evening'] }),
  activity('cat_care', { name: 'Cat care', assignees: ['casey'], minimum: { hours: 1 / 3, per: 'day' }, times: 2, time_of_day: ['morning', 'evening'] }),
  activity('make_your_bed', { name: 'Make your bed', icon: '🛏️', assignees: ['dana'], minimum: { hours: 5 / 60, per: 'day' }, time_of_day: ['morning'], needs_ok: true }),
  activity('laundry', { name: 'Laundry', assignees: ['blair'], minimum: { hours: 2, per: 'week' }, days: ['mon', 'thu'], label: '2 loads' }),
  activity('clean_the_bathroom', { name: 'Clean the bathroom', assignees: ['blair', 'casey'], minimum: { hours: 2, per: 'week' }, split: 'shared', shares: { blair: 1, casey: 1 }, needs_ok: true }),
  activity('take_out_the_trash', { name: 'Take out the trash', assignees: ['casey'], minimum: { hours: 1 / 3, per: 'week' }, days: ['tue', 'fri'], time_of_day: ['evening'] }),
  activity('yard_work', { name: 'Yard work', assignees: ['casey'], minimum: { hours: 1.5, per: 'week' } }),
  activity('change_the_furnace_filter', { name: 'Change the furnace filter', schedule: 'repeats', assignees: ['alex'], repeats: { rrule: 'FREQ=MONTHLY;BYMONTHDAY=1', start: '2026-10-01', window: 'period', estimate_minutes: 15 } }),
  activity('rake_the_leaves', { name: 'Rake the leaves', schedule: 'repeats', assignees: ['casey'], repeats: { rrule: 'FREQ=WEEKLY;BYDAY=SA;UNTIL=20261130', start: '2026-10-17', window: 'day', estimate_minutes: 60 } }),
  activity('fix_the_gate_latch', { name: 'Fix the gate latch', schedule: 'once', assignees: ['alex'], once: { on: null, by: '2026-10-16', by_time: null, sessions: 1, estimate_minutes: 30 } }),
  activity('clean_out_the_garage', { name: 'Clean out the garage', schedule: 'once', assignees: ['casey'], needs_ok: true, once: { on: null, by: '2026-10-18', by_time: null, sessions: 2, estimate_minutes: 240 } }),
  activity('homework', { name: 'Homework', assignees: ['casey'], on_board: false, minimum: { hours: 1, per: 'day' }, days: ['mon', 'tue', 'wed', 'thu', 'fri'] }),
  activity('soccer_practice', { name: 'Soccer practice', assignees: ['casey'], minimum: { hours: 3, per: 'week' }, days: ['tue', 'thu'], set_time: '17:30' }),
  activity('wash_the_car', { name: 'Wash the car', assignees: [], minimum: { hours: 1, per: 'week' } }),
  activity('paint_the_fence', { name: 'Paint the fence', schedule: 'once', assignees: ['alex'], finished_at: '2026-10-10T12:00:00-05:00', once: { on: null, by: null, by_time: null, sessions: 1, estimate_minutes: 120 } }),
];

const rhythm = (id: string) => rhythmText(SAMPLE.find(a => a.id === id)!, TODAY);

describe('rhythmText', () => {
  it('says Plan chores in time and days', () => {
    expect(rhythm('kitchen_cleanup')).toBe('30 min a day · evenings');
    expect(rhythm('cat_care')).toBe('20 min a day, 2 times · morning and evening');
    expect(rhythm('laundry')).toBe('2 h a week, 2 loads · Mon, Thu');
    expect(rhythm('clean_the_bathroom')).toBe('2 h a week, split · any day');
    expect(rhythm('take_out_the_trash')).toBe('20 min a week · Tue, Fri evenings');
    expect(rhythm('yard_work')).toBe('1 h 30 min a week · any day');
    expect(rhythm('homework')).toBe('1 h a day · school days');
  });

  it('says set times, repeats, and one-time chores', () => {
    expect(rhythm('soccer_practice')).toBe('Tue, Thu at 5:30 PM · set time');
    expect(rhythmText(SAMPLE.find(a => a.id === 'soccer_practice')!, TODAY, '24h')).toBe('Tue, Thu at 17:30 · set time');
    expect(rhythm('change_the_furnace_filter')).toBe('Monthly · any time that month');
    expect(rhythm('rake_the_leaves')).toBe('Saturdays until Nov 30');
    expect(rhythm('fix_the_gate_latch')).toBe('By Friday');
    expect(rhythm('clean_out_the_garage')).toBe('By Sunday · 2 sessions');
    const on = (day: string) => rhythmText(activity('x', { schedule: 'once', once: { on: day, by: null, by_time: null, sessions: 1, estimate_minutes: 5 } }), TODAY);
    expect([on('2026-10-30'), on('2026-10-13'), on('2026-10-14'), on('2026-10-16')]).toEqual(['On Oct 30', 'Today', 'Tomorrow', 'On Friday']);
  });
});

describe('durationText', () => {
  it.each([[5, '5 min'], [60, '1 h'], [90, '1 h 30 min'], [135, '2 h 15 min'], [0.2, '1 min']])('%s min is %s', (minutes, text) => {
    expect(durationText(minutes)).toBe(text);
  });
});

describe('choreRow', () => {
  it('tags what needs an OK, plan-only chores, and chores nobody does yet', () => {
    const row = (id: string) => choreRow(SAMPLE.find(a => a.id === id)!, MEMBERS, SETTINGS, TODAY);
    expect(row('make_your_bed')).toMatchObject({ picture: '🛏️', tags: ['Needs an OK'], stars: 1 });
    expect(row('homework')).toMatchObject({ tags: ['Plan only'], stars: null });
    expect(row('wash_the_car')).toMatchObject({ tags: ['No one yet'], picture: '🚗' });
    expect(row('clean_the_bathroom').people.map(m => m.id)).toEqual(['blair', 'casey']);
    expect(row('laundry').stars).toBe(4);
    expect(row('clean_out_the_garage').stars).toBe(8);
  });
});

describe('choresList', () => {
  it('groups by rhythm and counts what is on the board', () => {
    const list = choresList(SAMPLE, MEMBERS, SETTINGS, { today: TODAY });
    expect(list.groups.map(g => [g.label, g.rows.length])).toEqual([
      ['Every day', 3], ['Every week', 5], ['On a schedule', 2], ['One time', 2], ['Not on the board', 2],
    ]);
    expect(list.onBoard).toBe(11);
    expect(list.total).toBe(14);
    expect(list.finished.map(r => r.id)).toEqual(['paint_the_fence']);
  });

  it('filters to one person and by a search', () => {
    const casey = choresList(SAMPLE, MEMBERS, SETTINGS, { today: TODAY, member: 'casey' });
    expect(casey.groups.flatMap(g => g.rows.map(r => r.id))).toEqual([
      'cat_care', 'clean_the_bathroom', 'take_out_the_trash', 'yard_work', 'rake_the_leaves', 'clean_out_the_garage',
      'homework', 'soccer_practice',
    ]);
    const search = choresList(SAMPLE, MEMBERS, SETTINGS, { today: TODAY, search: '  CLEAN ' });
    expect(search.groups.flatMap(g => g.rows.map(r => r.id))).toEqual(['kitchen_cleanup', 'clean_the_bathroom', 'clean_out_the_garage']);
    expect(search.total).toBe(14);
  });

  it('knows which group a chore goes in and whether it is checked off', () => {
    expect(SAMPLE.map(groupOf).filter(g => g === 'off_board')).toHaveLength(2);
    expect(onTheBoard(SAMPLE.find(a => a.id === 'wash_the_car')!)).toBe(false);
    expect(onTheBoard(SAMPLE.find(a => a.id === 'soccer_practice')!)).toBe(false);
    expect(onTheBoard(SAMPLE.find(a => a.id === 'laundry')!)).toBe(true);
  });
});

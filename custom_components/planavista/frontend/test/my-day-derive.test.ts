import { describe, expect, it } from 'vitest';
import { columnFor, type DeriveContext } from '../src/modules/chores/board-derive';
import { bedtimeOn, fairShares, fitsIn, goalFor, goalWords, nextLine, picturesFor, stickersLabel, timelineFor } from '../src/modules/chores/my-day-derive';
import type { DayEvent } from '../src/modules/chores/calendar-ties';
import { MEMBERS, NOW, TODAY, board, column, item } from './chores-fixtures';

const [alex, blair, casey, dana] = MEMBERS;
const at = (h: number, m = 0) => new Date(2026, 9, 13, h, m);
const event = (title: string, start: Date, end: Date, member = 'casey'): DayEvent => ({ title, start, end, calendar: `calendar.${member}`, member });
const EVENTS = [event('School', at(8), at(14, 45)), event('Soccer practice', at(17, 30), at(19))];
const WEEK = { section: 'week' as const, window: 'week' as const, planned: null, due_day: '2026-10-18', counted: false };

function casey_column() {
  const items = [
    item('cat_care|casey|day:2026-10-13|0', { band: 'morning', status: 'done', completion: { id: 'c', done_by: 'casey', by: 'casey', at: '2026-10-13T07:20:00-05:00', source: 'tablet', state: 'done', review: null, stars: 1 } }),
    item('take_out_the_trash|casey|week:2026-10-12|0', { band: 'evening', window: 'week', credit_minutes: 15 }),
    item('cat_care|casey|day:2026-10-13|1', { band: 'evening', credit_minutes: 15 }),
    item('yard_work|casey|week:2026-10-12|0', { ...WEEK, credit_minutes: 60 }),
    item('clean_the_bathroom|casey|week:2026-10-12|0', { ...WEEK, status: 'pending', credit_minutes: 60 }),
  ];
  const ctx: DeriveContext = { today: TODAY, now: NOW, events: EVENTS, timeFormat: '12h', activities: new Map(), members: MEMBERS };
  return columnFor(casey, column(items, { stars: 23 }), board({ casey: column(items) }), ctx);
}

describe('timelineFor (spec 13.4)', () => {
  it('puts events at their times, chores in their bands, and what fits at now', () => {
    const entries = timelineFor(casey_column(), { now: NOW, events: EVENTS, timeFormat: '12h', bedtime: at(22) });
    expect(entries.map(e => {
      switch (e.kind) {
        case 'band': return `== ${e.label}`;
        case 'event': return `${e.time} ${e.title}${e.past ? ' (past)' : ''}`;
        case 'chore': return `${e.time ?? '·'} ${e.row.name}${e.row.state === 'done' ? ' ✓' : ''}`;
        case 'now': return `${e.time} NOW`;
        case 'free': return `free until ${e.until} (${e.span}): ${e.fits.join(', ')}`;
        case 'bedtime': return `bedtime ${e.time}`;
      }
    })).toEqual([
      '== Morning', '7:20 Cat care ✓', '8:00 School (past)',
      '== Afternoon', '4:10 NOW', 'free until 5:30 (1 h 20 min): Take out the trash, Cat care',
      '== Evening', '5:30 Soccer practice', '· Take out the trash', '· Cat care',
      'bedtime 10:00 PM',
    ]);
  });

  it('keeps the end of the chore day, after midnight, in the evening as the engine does', () => {
    const items = [item('tidy_toys|casey|day:2026-10-13|0', { band: null })];
    const late = new Date(2026, 9, 14, 0, 30);
    const ctx: DeriveContext = { today: TODAY, now: late, events: [], timeFormat: '12h', activities: new Map(), members: MEMBERS };
    const col = columnFor(casey, column(items), board({ casey: column(items) }), ctx);
    const labels = timelineFor(col, { now: late, events: [], timeFormat: '12h', bedtime: null })
      .flatMap(e => (e.kind === 'band' ? [e.label] : e.kind === 'chore' ? [e.row.name] : []));
    expect(labels).toEqual(['Evening', 'Tidy toys']);
  });

  it('puts a check-off waiting for approval at the time it was done, with that time once (milestone 8)', () => {
    const waiting = { id: 'w', done_by: 'dana', by: 'dana', at: '2026-10-13T08:51:00-05:00', source: 'tablet', state: 'pending', review: null, stars: 1 } as const;
    const items = [
      item('feed_the_fish|dana|day:2026-10-13|0', { band: 'morning', status: 'pending', completion: waiting }),
      item('tidy_toys|dana|day:2026-10-13|0', { band: 'evening' }),
    ];
    const ctx: DeriveContext = { today: TODAY, now: NOW, events: [], timeFormat: '12h', activities: new Map(), members: MEMBERS };
    const col = columnFor(dana, column(items), board({ dana: column(items) }), ctx);
    const entries = timelineFor(col, { now: NOW, events: [], timeFormat: '12h', bedtime: null });
    const shown = entries.flatMap(e => (e.kind === 'band' ? [`== ${e.label}`] : e.kind === 'chore' ? [`${e.time ?? '·'} ${e.row.name}`] : e.kind === 'now' ? ['NOW'] : []));
    expect(shown).toEqual(['== Morning', '8:51 Feed the fish', '== Afternoon', 'NOW', '== Evening', '· Tidy toys']);
    const fish = entries.find(e => e.kind === 'chore' && e.row.name === 'Feed the fish');
    expect(fish && fish.kind === 'chore' ? fish.row.doneAt : 'missing').toBeUndefined();
  });

  it('says it is free for the rest of the day when nothing else is on the calendar', () => {
    const entries = timelineFor(casey_column(), { now: at(19, 30), events: EVENTS, timeFormat: '12h', bedtime: null });
    const free = entries.find(e => e.kind === 'free');
    expect(free).toMatchObject({ until: null, span: null });
  });
});

describe('fitsIn', () => {
  it('fills the gap greedily, in order, at most three', () => {
    const rows = casey_column().entries.flatMap(e => (e.kind === 'row' ? [e.row] : []));
    expect(fitsIn(30, rows)).toEqual(['Take out the trash', 'Cat care']);
    expect(fitsIn(null, rows)).toEqual(['Take out the trash', 'Cat care', 'Yard work']);
    expect(fitsIn(5, rows)).toEqual([]);
  });
});

describe('picturesFor', () => {
  it('shows the chore for now, then the next event and chore as picture steps', () => {
    const model = picturesFor(casey_column(), EVENTS, NOW, '12h');
    expect(model.now?.name).toBe('Take out the trash');
    expect(model.next).toEqual([
      { kind: 'event', picture: '⚽', text: 'Soccer practice at 5:30' },
      { kind: 'chore', row: expect.objectContaining({ name: 'Cat care' }) },
    ]);
    expect(model.waiting.map(r => r.name)).toEqual(['Clean the bathroom']);
    expect(model.done.map(r => r.name)).toEqual(['Cat care']);
  });
});

describe('small helpers', () => {
  it('finds tonight\'s bedtime', () => {
    const night = { ...casey, bedtime: { weeknight: '22:00', weekend: '23:30' } };
    expect(bedtimeOn(night, at(12))).toEqual(at(22));
    expect(bedtimeOn(night, new Date(2026, 9, 16, 12))?.getHours()).toBe(23);
    expect(bedtimeOn(casey, at(12))).toBeNull();
  });

  it('says what is next on the calendar', () => {
    expect(nextLine([event('Dentist', at(16, 45), at(17, 30), 'alex')], 'alex', NOW, '12h')).toBe('Next: Dentist at 4:45 PM · then nothing until tomorrow');
    expect(nextLine(EVENTS, 'casey', NOW, '12h')).toBe('Next: Soccer practice at 5:30 PM · then nothing until tomorrow');
    expect(nextLine(EVENTS, 'casey', at(7), '12h')).toBe('Next: School at 8:00 AM');
    expect(nextLine(EVENTS, 'dana', NOW, '12h')).toBeNull();
  });

  it('measures the goal', () => {
    const reward = { id: 'movie', name: 'Movie night pick', icon: '🎬', cost: 40, needs_ok: true, who: [] };
    expect(goalFor({ ...casey, goal: 'movie' }, column([], { stars: 23 }), [reward])).toEqual({ reward, have: 23, need: 17, progress: 23 / 40 });
    expect(goalFor(casey, column([], { stars: 23 }), [reward])).toBeNull();
    // Round 3 (r3b M1): the engine's rule, so My day never says "Enough stars!" for a goal that isn't theirs.
    expect(goalFor({ ...casey, goal: 'movie' }, column([], { stars: 23 }), [{ ...reward, who: ['dana'] }])).toBeNull();
    expect(goalFor({ ...casey, goal: 'movie', stars: false }, column([], { stars: 23 }), [reward])).toBeNull();
    expect(goalFor({ ...casey, goal: 'movie' }, column([], { stars: 23 }), [{ ...reward, who: ['casey'] }])?.need).toBe(17);
  });

  it('shares out the shared chores by time done', () => {
    const b = board({
      alex: column([], { contribution: { minutes: 60, shared_minutes: 30 } }),
      blair: column([], { contribution: { minutes: 90, shared_minutes: 90 } }),
      casey: column([], { contribution: { minutes: 0, shared_minutes: 0 } }),
    });
    expect(fairShares(b, [alex, blair, casey, dana]).map(s => [s.member.id, s.percent])).toEqual([['alex', 25], ['blair', 75]]);
    expect(fairShares(b, [alex, blair, casey, dana]).map(s => s.text)).toEqual(['Alex 30 min · 25%', 'Blair 1.5 h · 75%']);
    expect(fairShares(board({}), MEMBERS)).toEqual([]);
  });
});

describe('a goal and stickers read one way (milestone 8)', () => {
  const reward = { id: 'ice', name: 'Ice cream trip', icon: '🍦', cost: 25, needs_ok: true, who: [] };

  it("says how many more stars, or that there are enough", () => {
    expect(goalWords({ reward, have: 7, need: 18, progress: 7 / 25 })).toBe('18 more ★');
    expect(goalWords({ reward, have: 25, need: 0, progress: 1 })).toBe('Enough stars!');
  });

  it("names the week's stars the same on the board and in My day", () => {
    expect(stickersLabel(5)).toBe('This week: 5 ★');
    expect(stickersLabel(0)).toBe('This week: 0 ★');
  });
});

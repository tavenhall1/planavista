import { describe, expect, it } from 'vitest';
import { itemBadge } from '../src/core/status-map';
import type { ItemView } from '../src/modules/chores/chores-types';
import { daysToDeadline, urgencyOf } from '../src/modules/chores/urgency-derive';

// Week Mon 2026-10-12 to Sun 2026-10-18; `end` is the day after.
const board = { week: { end: '2026-10-19' } };
const item = (over: Partial<ItemView>): ItemView => ({ window: 'day', dated: false, due_day: null, ...over }) as ItemView;

describe('daysToDeadline and urgencyOf', () => {
  it('walks a weekly row from calm to last', () => {
    const weekly = item({ window: 'week' });
    const days = ['2026-10-14', '2026-10-15', '2026-10-16', '2026-10-17'].map(d => daysToDeadline(weekly, d, board));
    expect(days).toEqual([5, 4, 3, 2]);
    expect(daysToDeadline(weekly, '2026-10-18', board)).toBe(1);
    expect(urgencyOf(4)).toBe('calm');
    expect(urgencyOf(3)).toBe('amber');
    expect(urgencyOf(2)).toBe('soon');
    expect(urgencyOf(1)).toBe('last');
    expect(urgencyOf(0)).toBe('last');
    expect(urgencyOf(null)).toBe('calm');
  });

  it('counts a month row to its due day', () => {
    expect(daysToDeadline(item({ window: 'month', due_day: '2026-10-31' }), '2026-10-30', board)).toBe(2);
    expect(urgencyOf(2)).toBe('soon');
  });

  it('counts a dated one-time chore to its due day and ignores daily and undated rows', () => {
    expect(daysToDeadline(item({ window: 'once', dated: true, due_day: '2026-10-15' }), '2026-10-14', board)).toBe(2);
    expect(daysToDeadline(item({ window: 'day' }), '2026-10-14', board)).toBeNull();
    expect(daysToDeadline(item({ window: 'once', dated: false }), '2026-10-14', board)).toBeNull();
  });
});

describe('the amber badge', () => {
  it('shows 3 days left whatever the pace, and leaves 4 to the pace rule', () => {
    const view = { status: 'open', section: 'week', window: 'week' };
    expect(itemBadge(view, { today: '2026-10-15', daysLeft: 4, remaining: 1, deadlineDays: 3 })).toEqual({ words: '3 days left', tone: 'time', glyph: '•' });
    expect(itemBadge(view, { today: '2026-10-14', daysLeft: 5, remaining: 1, deadlineDays: 4 })).toBeNull();
  });
});

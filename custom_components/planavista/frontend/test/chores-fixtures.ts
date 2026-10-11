// The sample household's chores board (spec 4), for the chores tests: Tuesday,
// October 13, 2026, at 4:10 PM in America/Chicago, weeks starting on Monday.
import type { Member } from '../src/core/household';
import type { Activity, Board, BoardMember, ItemView } from '../src/modules/chores/chores-types';

export const TODAY = '2026-10-13';
export const NOW = new Date(2026, 9, 13, 16, 10);

export function person(id: string, fields: Partial<Member> = {}): Member {
  return {
    id, name: id[0].toUpperCase() + id.slice(1), color: '#43AA8B', color_dark: null, picture: { initial: true },
    age_group: 'adult', parent: false, person: null, order: 0, rev: 1, my_day: 'timeline', needs_ok_for: 'none',
    stars: false, has_pin: false, pin_length: null, locked_until: null, ...fields,
  };
}

export const MEMBERS: Member[] = [
  person('alex', { parent: true, order: 0, color: '#277DA1' }),
  person('blair', { parent: true, order: 1, has_pin: true, color: '#F3722C' }),
  person('casey', { age_group: 'teen', order: 2, has_pin: true, stars: true, needs_ok_for: 'marked', color: '#43AA8B' }),
  person('dana', { age_group: 'young_child', order: 3, stars: true, needs_ok_for: 'all', my_day: 'pictures', color: '#F94144' }),
];

export function item(key: string, fields: Partial<ItemView> = {}): ItemView {
  const [chore, member, period, n] = key.split('|');
  return {
    key, chore, name: chore.replace(/_/g, ' ').replace(/^./, c => c.toUpperCase()), icon: null, member, owner: member,
    period, n: Number(n), section: 'today', band: null, planned: TODAY, due: `${TODAY}T03:00:00-05:00`, due_day: TODAY,
    window: 'day', dated: false, status: 'open', counted: true, credit_minutes: 15, stars: 1, from: null,
    overdue_since: null, needs_ok: false, completion: null, note: null, request: null, ...fields,
  };
}

const ZERO = { due: 0, done: 0, pending: 0, minutes_due: 0, minutes_done: 0, minutes_pending: 0 };

export function column(items: ItemView[], fields: Partial<BoardMember> = {}): BoardMember {
  const counted = items.filter(i => i.counted && i.status !== 'away' && i.status !== 'excused');
  const today = {
    ...ZERO,
    due: counted.length,
    done: counted.filter(i => i.status === 'done').length,
    pending: counted.filter(i => i.status === 'pending').length,
  };
  return {
    items, today, week: { ...ZERO, percent: null }, contribution: { minutes: 0, shared_minutes: 0 }, streak: 0,
    week_streak: 0, stars: 0, week_stars: 0, chore_minutes: 0, away: null, ...fields,
  };
}

export function activity(id: string, fields: Partial<Activity> = {}): Activity {
  return {
    id, name: id.replace(/_/g, ' ').replace(/^./, c => c.toUpperCase()), icon: null, category: 'other',
    schedule: 'plan', assignees: [], on_board: true, needs_ok: false, stars: null, ...fields,
  };
}

export function board(members: Record<string, BoardMember>, fields: Partial<Board> = {}): Board {
  const household = { due: 0, done: 0, pending: 0 };
  for (const m of Object.values(members)) {
    household.due += m.today.due;
    household.done += m.today.done;
    household.pending += m.today.pending;
  }
  return {
    date: TODAY, today: TODAY, now: '2026-10-13T16:10:00-05:00', band: 'afternoon',
    day: { start: '2026-10-13T03:00:00-05:00', end: '2026-10-14T03:00:00-05:00' },
    week: { start: '2026-10-12', end: '2026-10-19', days_left: 6 },
    members, household, requests: [],
    settings: { missed: 'make_up', day_starts: '03:00', auto_approve: 'day_end', minutes_per_star: 15, evening_check: '19:00', sound: false },
    chores: [], rewards: [], recent_redemptions: [], needs_a_look: [], ...fields,
  };
}

import type { Member } from '../../core/household';
import type { Activity, Board, BoardMember, ItemView, Stats } from './chores-types';
import type { QueuedCheckoff } from './checkoff-queue';

const OPEN = new Set(['open', 'sent_back']);
const CREDITED = new Set(['done', 'pending']);

/** Due and done counts and minutes over the items that count today, as the engine adds them (spec 8.14). */
export function statsOf(items: ItemView[]): Stats {
  const stats: Stats = { due: 0, done: 0, pending: 0, minutes_due: 0, minutes_done: 0, minutes_pending: 0 };
  for (const item of items) {
    if (!item.counted || item.status === 'away' || item.status === 'excused') continue;
    stats.due += 1;
    stats.minutes_due += item.credit_minutes;
    if (item.status === 'done') {
      stats.done += 1;
      stats.minutes_done += item.credit_minutes;
    } else if (item.status === 'pending') {
      stats.pending += 1;
      stats.minutes_pending += item.credit_minutes;
    }
  }
  return stats;
}

/**
 * Whether a check-off by `doer` waits for a parent's OK (spec 8.5 step 3):
 * never for a parent; always for a chore a child added from a to-do list;
 * otherwise by their "Needs an OK for" setting and the chore's mark.
 */
export function needsOk(doer: Pick<Member, 'parent' | 'needs_ok_for'> | undefined, activity: Activity | undefined): boolean {
  if (!doer || doer.parent) return false;
  if (activity?.needs_ok_always) return true;
  const setting = doer.needs_ok_for ?? 'none';
  return setting === 'all' || (setting === 'marked' && !!activity?.needs_ok);
}

/** A local time with its offset, like the engine's stamps ("2026-10-13T16:10:00-05:00"). */
export function localStamp(ms: number): string {
  const date = new Date(ms);
  const pad = (n: number) => String(Math.abs(n)).padStart(2, '0');
  const offset = -date.getTimezoneOffset();
  const sign = offset >= 0 ? '+' : '-';
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T` +
    `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}` +
    `${sign}${pad(Math.trunc(offset / 60))}:${pad(offset % 60)}`
  );
}

function applied(item: ItemView, entry: QueuedCheckoff): ItemView {
  if (entry.op === 'complete' && OPEN.has(item.status)) {
    const state = entry.shows ?? 'done';
    return {
      ...item,
      status: state,
      note: null,
      completion: {
        id: `queued:${entry.id}`, done_by: entry.doneBy ?? item.member, by: '', at: localStamp(entry.at),
        source: 'tablet', state, review: null, stars: item.stars,
      },
    };
  }
  if (entry.op === 'undo' && CREDITED.has(item.status)) {
    return { ...item, status: 'open', completion: null };
  }
  return item;
}

/**
 * The board with check-offs that haven't reached Home Assistant yet shown as
 * if they had (spec 11.6: optimistic check-offs). The feed wins as soon as an
 * entry goes through; with nothing waiting, the board comes back unchanged.
 */
export function withQueued(board: Board, entries: readonly QueuedCheckoff[]): Board {
  if (entries.length === 0) return board;
  const members: Record<string, BoardMember> = { ...board.members };
  const touched = new Set<string>();
  for (const entry of entries) {
    const member = members[entry.member];
    if (!member) continue;
    const index = member.items.findIndex(item => item.key === entry.occurrence);
    if (index < 0) continue;
    const next = applied(member.items[index], entry);
    if (next === member.items[index]) continue;
    const items = [...member.items];
    items[index] = next;
    members[entry.member] = { ...member, items };
    touched.add(entry.member);
  }
  if (touched.size === 0) return board;
  const household = { due: 0, done: 0, pending: 0 };
  for (const [id, member] of Object.entries(members)) {
    const today = touched.has(id) ? statsOf(member.items) : member.today;
    if (touched.has(id)) members[id] = { ...member, today };
    household.due += today.due;
    household.done += today.done;
    household.pending += today.pending;
  }
  return { ...board, members, household };
}

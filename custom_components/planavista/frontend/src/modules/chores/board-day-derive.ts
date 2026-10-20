import type { Member } from '../../core/household';
import { inOrder } from '../../core/household';
import { StatusBadge, badgeBelow, itemBadge, pastBadge } from '../../core/status-map';
import type { DayView, ItemView, PastItem } from './chores-types';
import { addDays } from './options-derive';
import { chorePicture } from './picture-words';
import { keepOrder } from './week-derive';

/**
 * The Board on another day (0.14.0, the owner: "just like the Week view has a
 * navigator, I think the Board view should as well"). A past day shows its
 * record, where a parent can excuse a miss; a day to come shows what's
 * planned, look only. Checking off stays on Today, and an untouched board
 * comes back to it, so a kitchen screen never sits on another day.
 */
export const BOARD_RETURN_MS = 120_000;

/** How far back the record goes: the chores log keeps 90 days (engine RETENTION). */
export const KEPT_DAYS = 90;

/** Whether the Board may step back from `offset` days from today (review: older days have no record). */
export function mayStepBack(offset: number): boolean {
  return offset > -KEPT_DAYS;
}

/** Someone away that day, in the day's own tense (review: a day to come said "was due"). */
export function awayLine(kind: DayView['kind']): string {
  if (kind === 'past') return 'Away: nothing was due, and the streak keeps.';
  return kind === 'today' ? 'Away today: nothing is due.' : 'Away that day: nothing is due.';
}

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/** "Monday, October 12". */
export function longDay(day: string): string {
  const [y, m, d] = day.split('-').map(Number);
  const date = new Date(y, m - 1, d, 12);
  return `${WEEKDAYS[date.getDay()]}, ${MONTHS[date.getMonth()]} ${date.getDate()}`;
}

/** The chore day `offset` days from `today`. */
export function boardDate(today: string, offset: number): string {
  return offset === 0 ? today : addDays(today, offset);
}

/** "Today · Tuesday, October 13", "Yesterday · Monday, October 12", "Friday, October 16"; on a phone "Yesterday", "Fri, Oct 16". */
export function boardDayTitle(offset: number, date: string, short = false): string {
  const named = offset === 0 ? 'Today' : offset === -1 ? 'Yesterday' : offset === 1 ? 'Tomorrow' : null;
  if (short) {
    if (named) return named;
    const [y, m, d] = date.split('-').map(Number);
    const day = new Date(y, m - 1, d, 12);
    return `${WEEKDAYS[day.getDay()].slice(0, 3)}, ${MONTHS[day.getMonth()].slice(0, 3)} ${day.getDate()}`;
  }
  return named ? `${named} · ${longDay(date)}` : longDay(date);
}

export function isPast(item: ItemView | PastItem): item is PastItem {
  return !('section' in item);
}

/** A day's row badge, in the day sheet and on the Board's other days alike. */
export function dayItemBadge(
  item: ItemView | PastItem, memberId: string, today: string, names: (id: string) => string,
): StatusBadge | null {
  if (isPast(item)) {
    const badge = pastBadge(item.status, item.note);
    if (item.status === 'done' && item.done_by && item.done_by !== memberId) return { ...badge, words: `Done by ${names(item.done_by)}` };
    return badge;
  }
  return itemBadge(item, { today, daysLeft: 7, remaining: 0 }) ?? (item.status === 'done' ? pastBadge('done') : null);
}

export interface DayRow {
  key: string;
  name: string;
  picture: string;
  badge: StatusBadge | null;
  /** A parent may excuse it here: a miss, not being excused already. */
  excuse: boolean;
}

export interface DayColumn {
  member: Member;
  ring: { progress: number; closed: boolean; label: string };
  /** Under the name: how the day went, or what's planned. */
  line: string;
  rows: DayRow[];
  /** One long badge puts every badge in the column under its name (the day sheet's rule, round 12). */
  below: boolean;
  /** Said in place of rows when there are none. */
  empty: string | null;
}

export interface DayContext {
  today: string;
  canExcuse: boolean;
  excusing: ReadonlySet<string>;
  /** Each person's row keys as last shown, so rows keep their places through a reload. */
  order?: Readonly<Record<string, readonly string[]>>;
}

/** Everyone's column for one day, in the household's order. */
export function dayColumns(view: DayView, members: readonly Member[], ctx: DayContext): DayColumn[] {
  const names = (id: string) => members.find(m => m.id === id)?.name ?? id;
  const future = view.kind !== 'past';
  return inOrder([...members]).filter(member => view.members[member.id]).map(member => {
    const entry = view.members[member.id];
    const items = keepOrder(entry.items, ctx.order?.[member.id] ?? []);
    const rows = items.map(item => ({
      key: item.key,
      name: item.name,
      picture: chorePicture(item.icon, item.name),
      badge: dayItemBadge(item, member.id, ctx.today, names),
      excuse: isPast(item) && item.status === 'missed' && ctx.canExcuse && !ctx.excusing.has(item.key),
    }));
    const summary = entry.summary;
    const done = summary ? summary.done + summary.pending : 0;
    let line: string;
    let label: string;
    if (entry.away) {
      line = awayLine(view.kind);
      label = `${member.name}: away`;
    } else if (future) {
      line = items.length ? `${items.length} planned.` : '';
      label = `${member.name}: ${items.length} planned`;
    } else if (summary && summary.due > 0) {
      line = summary.closed ? `Ring closed: ${done} of ${summary.due} done.` : `${done} of ${summary.due} done.`;
      label = `${member.name}: ${summary.closed ? 'ring closed, ' : ''}${done} of ${summary.due} done`;
    } else {
      line = '';
      label = member.name;
    }
    return {
      member,
      ring: {
        progress: !future && summary && summary.due > 0 ? Math.min(1, done / summary.due) : 0,
        closed: !future && !!summary?.closed,
        label,
      },
      line,
      rows,
      below: rows.some(row => badgeBelow(row.badge, false)),
      empty: rows.length || entry.away ? null : future ? 'Nothing planned.' : 'Nothing was on the board.',
    };
  });
}

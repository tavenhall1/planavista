import type { Member } from '../../core/household';
import { BadgeContext, StatusBadge, itemBadge, minutesText, ringLabel, shortDay } from '../../core/status-map';
import type { Activity, Band, Board, BoardMember, ItemView } from './chores-types';
import { DayEvent, clockTime, nextOnCalendar } from './calendar-ties';

/** The bands of a chore day, in order (spec 8.1). */
export const BANDS: Band[] = ['morning', 'afternoon', 'evening'];
export const BAND_NAMES: Record<Band, string> = { morning: 'Morning', afternoon: 'Afternoon', evening: 'Evening' };

/** One row on the board: an item, or a floating chore's check-offs this week ("1 of 3"). */
export interface RowModel {
  /** The occurrence a hold acts on (for a floating chore, its next open check-off). */
  key: string;
  item: ItemView;
  name: string;
  icon: string | null;
  label: string | null;
  badge: StatusBadge | null;
  /** The estimate and stars, or how far a floating chore has come ("1.5 h · 0 of 1"). */
  meta: string;
  state: ItemView['status'];
  /** A floating chore's check-offs this week. */
  group?: { done: number; total: number };
  /** When it was checked off today ("4:20"), and by someone other than its owner. */
  doneAt?: string;
  doneBy?: string | null;
  /** Overdue from an earlier day: that day in short ("Wed", "Sep 28"). */
  overdueDay?: string;
}

export type BandState = 'past' | 'now' | 'later';

/** A list entry of a column, in order: section headings and rows share one list so rows can glide between sections. */
export type ColumnEntry =
  | { kind: 'head'; key: string; text: string; right?: string; tone: 'now' | 'later' | 'past' | 'plain' }
  | { kind: 'row'; key: string; row: RowModel; zone: 'now' | 'later' | 'past' | 'overdue' | 'week' | 'done' }
  | { kind: 'credit'; key: string; text: string };

export interface ColumnModel {
  member: Member;
  entry: BoardMember;
  ring: { progress: number; closed: boolean; label: string };
  /** "1 of 3 today · ★ 23 · 🔥 5 days". */
  line: string;
  /** The same line in parts; the stars part is where "+1 ★" flies to. */
  parts: Array<{ kind: 'count' | 'stars' | 'streak'; text: string }>;
  /** "Next on calendar: Soccer at 5:30 · free until then". */
  next: string | null;
  away: { note: string | null } | null;
  /** Picture tiles (young children, spec 7.2). */
  pictures: boolean;
  entries: ColumnEntry[];
  /** Open check-offs still due today, for the evening check. */
  left: number;
  /** Everything checked off today, earlier bands' too (My day lists them at their times). */
  doneToday: RowModel[];
  /** Nothing at all on their board today. */
  empty: boolean;
}

export interface DeriveContext {
  /** Today's chore day, YYYY-MM-DD. */
  today: string;
  now: Date;
  events: DayEvent[];
  timeFormat: '12h' | '24h';
  activities: Map<string, Activity>;
  members: Member[];
}

const OPEN = new Set(['open', 'sent_back']);

/** Whether a check-off happened within today's chore day. */
export function doneToday(item: ItemView, board: Pick<Board, 'day'>): boolean {
  const at = item.completion?.at;
  if (!at) return false;
  const t = new Date(at).getTime();
  return t >= new Date(board.day.start).getTime() && t < new Date(board.day.end).getTime();
}

/**
 * The band at `now`, as the engine works it out (periods.band): morning from the
 * day's start (3:00 AM unless the household moved it) until noon, afternoon until
 * 5:00 PM, and evening after that, past midnight too. The card works it out from
 * its own clock, since the board is only sent again after a change.
 */
export function bandAt(now: Date, dayStarts = '03:00'): Band {
  const [h, m] = dayStarts.split(':').map(Number);
  const minutes = now.getHours() * 60 + now.getMinutes();
  const start = (Number.isFinite(h) ? h : 3) * 60 + (Number.isFinite(m) ? m : 0);
  if (minutes >= start && minutes < 12 * 60) return 'morning';
  if (minutes >= 12 * 60 && minutes < 17 * 60) return 'afternoon';
  return 'evening';
}

/** The band an item belongs to now: its own, or the current one for items without one (spec 8.4). */
export function bandOf(item: ItemView, current: Band): Band {
  return item.band ?? current;
}

export function bandState(band: Band, current: Band): BandState {
  const a = BANDS.indexOf(band);
  const b = BANDS.indexOf(current);
  return a < b ? 'past' : a === b ? 'now' : 'later';
}

/** The estimate, and stars for someone who earns them ("15 min · ★ 1"). */
export function estimateText(item: ItemView, earnsStars: boolean): string {
  const time = minutesText(item.credit_minutes);
  return earnsStars && item.stars > 0 ? `${time} · ★ ${item.stars}` : time;
}

function rowFor(item: ItemView, ctx: DeriveContext, board: Board, earnsStars: boolean, extra: Partial<RowModel> = {}): RowModel {
  const activity = ctx.activities.get(item.chore);
  const remaining = extra.group ? extra.group.total - extra.group.done : 1;
  const badgeCtx: BadgeContext = { today: ctx.today, daysLeft: board.week.days_left, remaining };
  let doneAt: string | undefined;
  let doneBy: string | null | undefined;
  if (item.completion && (item.status === 'done' || item.status === 'pending')) {
    doneAt = clockTime(new Date(item.completion.at), ctx.timeFormat);
    const by = item.completion.done_by;
    doneBy = by && by !== item.member ? ctx.members.find(m => m.id === by)?.name ?? by : null;
  }
  const meta = item.window === 'month' ? 'this month' : estimateText(item, earnsStars);
  return {
    key: item.key,
    item,
    name: item.name,
    icon: item.icon,
    label: activity?.label ?? null,
    badge: itemBadge(item, badgeCtx),
    meta,
    state: item.status,
    doneAt,
    doneBy,
    ...(item.overdue_since ? { overdueDay: shortDay(item.overdue_since, ctx.today) } : {}),
    ...extra,
  };
}

/** A floating chore (weekly, no days) is one row however many check-offs it has this week. */
function isFloating(item: ItemView): boolean {
  return item.section === 'week' && item.window === 'week' && !item.planned && !item.from && !item.dated;
}

/**
 * Check-offs that show as one row: a floating chore's for the week, and a
 * one-time chore's sessions ("Clean out the garage · 1 of 2").
 */
export function groupKey(item: ItemView): string | null {
  if (item.section === 'overdue') return null;
  if (isFloating(item) || (item.window === 'once' && item.period === 'once')) return `${item.section}|${item.chore}|${item.period}`;
  return null;
}

/** One person's column (spec 13.1): bands with Now highlighted, This week, Done today (every check-off today), and past bands as credit. */
export function columnFor(member: Member, entry: BoardMember, board: Board, ctx: DeriveContext): ColumnModel {
  const current = bandAt(ctx.now, board.settings?.day_starts);
  const earnsStars = !!member.stars;
  const entries: ColumnEntry[] = [];
  const items = entry.items;
  const done: RowModel[] = [];
  const bandRows: Record<Band, RowModel[]> = { morning: [], afternoon: [], evening: [] };
  const bandDone: Record<Band, number> = { morning: 0, afternoon: 0, evening: 0 };
  const overdue: RowModel[] = [];
  const week: RowModel[] = [];
  const groups = new Map<string, ItemView[]>();
  const earlier: RowModel[] = [];

  for (const item of items) {
    const group = groupKey(item);
    if (group) {
      groups.set(group, [...(groups.get(group) ?? []), item]);
      continue;
    }
    if (item.section === 'overdue') {
      if (OPEN.has(item.status) || item.status === 'pending') overdue.push(rowFor(item, ctx, board, earnsStars));
      else if (item.status === 'done' && doneToday(item, board)) done.push(rowFor(item, ctx, board, earnsStars));
      continue;
    }
    if (item.section === 'today') {
      const band = bandOf(item, current);
      if (item.status === 'done') {
        if (bandState(band, current) === 'past') {
          bandDone[band] += 1;
          earlier.push(rowFor(item, ctx, board, earnsStars));
        } else done.push(rowFor(item, ctx, board, earnsStars));
        continue;
      }
      if (item.status === 'excused' || item.status === 'away') continue;
      bandRows[band].push(rowFor(item, ctx, board, earnsStars));
      continue;
    }
    // This week.
    if (item.status === 'done') {
      if (doneToday(item, board)) done.push(rowFor(item, ctx, board, earnsStars));
      continue;
    }
    if (item.status === 'excused' || item.status === 'away') continue;
    week.push(rowFor(item, ctx, board, earnsStars));
  }

  for (const [, list] of groups) {
    const live = list.filter(i => i.status !== 'excused' && i.status !== 'away');
    const total = live.length;
    const credited = live.filter(i => i.status === 'done' || i.status === 'pending').length;
    const today = list[0].section === 'today';
    for (const item of live) {
      if (item.status !== 'done' || !doneToday(item, board)) continue;
      const band = bandOf(item, current);
      if (today && bandState(band, current) === 'past') {
        bandDone[band] += 1;
        earlier.push(rowFor(item, ctx, board, earnsStars));
      } else done.push(rowFor(item, ctx, board, earnsStars));
    }
    // A sent-back session first, so its note shows (round 10: an open session hid it).
    const next = live.find(i => i.status === 'sent_back') ?? live.find(i => OPEN.has(i.status)) ?? live.find(i => i.status === 'pending');
    if (!next) continue;
    const group = { done: credited, total };
    const time = minutesText(live.reduce((sum, i) => sum + i.credit_minutes, 0));
    const row = rowFor(next, ctx, board, earnsStars, { group });
    row.meta = total > 1 || next.window === 'week' ? `${time} · ${credited} of ${total}` : row.meta;
    if (today) bandRows[bandOf(next, current)].push(row);
    else week.push(row);
  }

  if (overdue.length) {
    entries.push({ kind: 'head', key: 'head:overdue', text: 'Overdue', tone: 'plain' });
    for (const row of overdue) entries.push({ kind: 'row', key: row.key, row, zone: 'overdue' });
  }
  const credits: ColumnEntry[] = [];
  for (const band of BANDS) {
    const state = bandState(band, current);
    const rows = bandRows[band];
    if (state === 'past') {
      if (rows.length === 0) {
        if (bandDone[band] > 0) credits.push({ kind: 'credit', key: `credit:${band}`, text: `${BAND_NAMES[band]} · ${bandDone[band]} done` });
        continue;
      }
      const open = rows.filter(r => OPEN.has(r.state)).length;
      const waiting = rows.length - open;
      const said = [
        open ? `${open} left` : '',
        waiting ? `${waiting} waiting for approval` : '',
        bandDone[band] ? `${bandDone[band]} done` : '',
      ].filter(Boolean);
      entries.push({ kind: 'head', key: `head:${band}`, tone: 'past', text: `${BAND_NAMES[band]} · ${said.join(', ')}` });
    } else if (rows.length === 0) {
      continue;
    } else {
      entries.push({
        kind: 'head', key: `head:${band}`, tone: state,
        text: `${state === 'now' ? 'Now' : 'Later'} · ${BAND_NAMES[band].toLowerCase()}`,
      });
    }
    for (const row of rows) entries.push({ kind: 'row', key: row.key, row, zone: state });
  }
  if (week.length) {
    const left = board.week.days_left;
    entries.push({ kind: 'head', key: 'head:week', text: 'This week', right: left === 1 ? 'Last day' : `${left} days left`, tone: 'plain' });
    for (const row of week) entries.push({ kind: 'row', key: row.key, row, zone: 'week' });
  }
  // Every check-off today, a finished part of the day's too, so a mistaken one can be unchecked with the same hold (milestone 8).
  const allDone = [...earlier, ...done].sort((a, b) => (a.item.completion?.at ?? '').localeCompare(b.item.completion?.at ?? ''));
  if (allDone.length) {
    entries.push({ kind: 'head', key: 'head:done', text: 'Done today', tone: 'plain' });
    for (const row of allDone) entries.push({ kind: 'row', key: row.key, row, zone: 'done' });
  }
  entries.push(...credits);

  const { due, done: doneCount, pending } = entry.today;
  const finished = doneCount + pending;
  const closed = due > 0 && finished >= due;
  const parts: ColumnModel['parts'] = [{ kind: 'count', text: due > 0 ? `${Math.min(finished, due)} of ${due} today` : 'Nothing due today' }];
  if (earnsStars) parts.push({ kind: 'stars', text: `★ ${entry.stars}` });
  if (entry.streak >= 2) parts.push({ kind: 'streak', text: `🔥 ${entry.streak} days` });
  const next = nextOnCalendar(ctx.events, member.id, ctx.now);
  const nextText = next
    ? `Next on calendar: ${next.event.title} at ${clockTime(next.event.start, ctx.timeFormat)}${next.freeUntil ? ' · free until then' : ''}`
    : null;
  const left = items.filter(i => i.counted && OPEN.has(i.status) && i.section !== 'week').length;
  return {
    member,
    entry,
    ring: { progress: due > 0 ? Math.min(1, finished / due) : 0, closed, label: ringLabel(member.name, Math.min(finished, due), due) },
    line: parts.map(p => p.text).join(' · '),
    parts,
    next: nextText,
    away: entry.away ? { note: entry.away.note ?? null } : null,
    pictures: member.age_group === 'young_child',
    entries,
    doneToday: allDone,
    left,
    empty: items.length === 0,
  };
}

/** Everyone's columns, in board order (spec 12.3: the order never changes). */
export function boardColumns(board: Board, ctx: DeriveContext): ColumnModel[] {
  return ctx.members
    .filter(member => board.members[member.id])
    .map(member => columnFor(member, board.members[member.id], board, ctx));
}

/** "Evening check: Casey has 2 chores left" at the reminder time (spec 9.9), and whose columns pulse. */
export function eveningCheck(columns: ColumnModel[], board: Board, now: Date): { text: string; members: string[] } | null {
  const at = board.settings.evening_check;
  if (!at) return null;
  const [h, m] = at.split(':').map(Number);
  const start = new Date(board.day.start);
  const check = new Date(start.getFullYear(), start.getMonth(), start.getDate(), h, m);
  if (check < start) check.setDate(check.getDate() + 1);
  if (now < check || now >= new Date(board.day.end)) return null;
  const behind = columns.filter(c => c.left > 0 && !c.away);
  if (behind.length === 0) return null;
  const said = behind.map((c, i) => (i === 0 ? `${c.member.name} has ${c.left} ${c.left === 1 ? 'chore' : 'chores'} left` : `${c.member.name} has ${c.left}`));
  const text = said.length === 1 ? said[0] : `${said.slice(0, -1).join(', ')} and ${said[said.length - 1]}`;
  return { text: `Evening check: ${text}`, members: behind.map(c => c.member.id) };
}

/** A board row shorter than this shows a column's head and no chores. */
export const MIN_ROW_HEIGHT = 180;

/**
 * How many people each row holds (spec 12.3): columns while each can be 240 px
 * wide, else an even grid; one row that scrolls sideways when the grid's rows
 * would be too short to show a chore (round 2: a 236 px board drew two rows of heads).
 */
export function boardRows(count: number, width: number, gap = 12, minWidth = 240, height = Infinity): number[] {
  if (count <= 0) return [];
  const fits = Math.max(1, Math.floor((width + gap) / (minWidth + gap)));
  if (count <= fits) return [count];
  const rows = Math.ceil(count / fits);
  if ((height - gap * (rows + 1)) / rows < MIN_ROW_HEIGHT) return [count];
  const perRow = Math.ceil(count / rows);
  const result: number[] = [];
  let left = count;
  while (left > 0) {
    result.push(Math.min(perRow, left));
    left -= perRow;
  }
  return result;
}

/**
 * The people whose ring just closed and hasn't been celebrated on `day` yet (spec 11.5:
 * once a ring, once a day, so an undo and a redo don't play it again). `before` holds
 * whether each ring was closed at the last look; `celebrated` remembers who was, and
 * gets the ones returned.
 */
export function ringsToCelebrate(
  columns: ColumnModel[], before: Map<string, boolean>, celebrated: Set<string>, day: string,
): string[] {
  const now: string[] = [];
  for (const col of columns) {
    const id = col.member.id;
    if (before.get(id) !== false || !col.ring.closed || celebrated.has(`${id}|${day}`)) continue;
    celebrated.add(`${id}|${day}`);
    now.push(id);
  }
  return now;
}

/** Whether every ring that had something due today is closed (the family celebration). */
export function everyRingClosed(columns: ColumnModel[]): boolean {
  const due = columns.filter(c => c.entry.today.due > 0);
  return due.length > 0 && due.every(c => c.ring.closed);
}

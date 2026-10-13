import type { Member } from '../../core/household';
import { minutesText } from '../../core/status-map';
import { FairShare, fairnessShares } from './fairness';
import type { Band, Board, BoardMember, Reward } from './chores-types';
import type { ColumnModel, RowModel } from './board-derive';
import { BANDS, BAND_NAMES, bandAt, bandState } from './board-derive';
import { DayEvent, clockTime } from './calendar-ties';
import { pictureFor } from './picture-words';

/** Where a band starts on the clock (spec 8.1: morning until noon, afternoon until 5:00 PM). */
const BAND_START: Record<Band, number> = { morning: 0, afternoon: 12, evening: 17 };

export type TimelineEntry =
  | { kind: 'band'; key: string; band: Band; label: string }
  | { kind: 'event'; key: string; time: string; title: string; range: string; past: boolean; picture: string }
  | { kind: 'chore'; key: string; time: string | null; row: RowModel }
  | { kind: 'now'; key: string; time: string }
  | { kind: 'free'; key: string; until: string | null; span: string | null; fits: string[] }
  | { kind: 'bedtime'; key: string; time: string };

export interface DayContext {
  now: Date;
  events: DayEvent[];
  timeFormat: '12h' | '24h';
  /** Today's bedtime for this person, as a Date, or null. */
  bedtime: Date | null;
  /** When the chore day starts ("03:00"), for the bands. */
  dayStarts?: string;
}

function range(event: DayEvent, format: '12h' | '24h'): string {
  return `${clockTime(event.start, format, format === '12h')} – ${clockTime(event.end, format, format === '12h')}`;
}

/** The person's bedtime tonight (spec 7.2: weeknights, and Friday and Saturday nights). */
export function bedtimeOn(member: Member, day: Date): Date | null {
  const bedtime = member.bedtime as { weeknight?: string; weekend?: string } | undefined;
  const weekend = day.getDay() === 5 || day.getDay() === 6;
  const at = (weekend ? bedtime?.weekend : bedtime?.weeknight) ?? bedtime?.weeknight;
  if (!at || !/^\d{1,2}:\d{2}$/.test(at)) return null;
  const [h, m] = at.split(':').map(Number);
  return new Date(day.getFullYear(), day.getMonth(), day.getDate(), h, m);
}

/**
 * What fits in a free gap (spec 13.4): open chores in order, today's first,
 * while their estimates add up within the gap; at most three names.
 */
export function fitsIn(minutes: number | null, rows: RowModel[]): string[] {
  const names: string[] = [];
  let used = 0;
  for (const row of rows) {
    if (row.state !== 'open' && row.state !== 'sent_back') continue;
    const need = row.item.credit_minutes;
    if (minutes !== null && used + need > minutes) continue;
    used += need;
    names.push(row.name);
    if (names.length === 3) break;
  }
  return names;
}

/**
 * The Timeline (spec 13.4): calendar events at their real times, chores in
 * their bands in plan order, a line at now with what fits before the next
 * event, and the day ending at bedtime. Presentation only.
 */
export function timelineFor(column: ColumnModel, ctx: DayContext): TimelineEntry[] {
  const now = ctx.now;
  const current = bandAt(now, ctx.dayStarts);
  const rows = column.entries.flatMap(e => (e.kind === 'row' ? [{ row: e.row, zone: e.zone }] : []));
  const bandOf = (row: RowModel): Band => row.item.band ?? current;
  // A check-off waiting for approval happened already: it sits at its time, like a done one (milestone 8).
  const checkedOff = (row: RowModel) => row.state === 'pending' && !!row.item.completion;
  // Overdue ones and ones left from an earlier band are due now.
  const dueNow = rows
    .filter(r => (r.zone === 'overdue' || r.zone === 'past') && !checkedOff(r.row))
    .map(r => r.row);
  const open = rows.filter(r => (r.zone === 'now' || r.zone === 'later') && !checkedOff(r.row)).map(r => r.row);
  const waiting = rows.filter(r => r.zone !== 'week' && r.zone !== 'done' && checkedOff(r.row)).map(r => r.row);
  const done = [...column.doneToday, ...waiting];
  const week = rows.filter(r => r.zone === 'week').map(r => r.row);
  const events = ctx.events.filter(e => e.member === column.member.id);
  const entries: TimelineEntry[] = [];
  const end = ctx.bedtime;
  for (const band of BANDS) {
    const state = bandState(band, current);
    const inBand = events.filter(e => bandAt(e.start, ctx.dayStarts) === band && (!end || e.start < end));
    const choresHere = state === 'past' ? [] : [...(state === 'now' ? dueNow : []), ...open.filter(r => bandOf(r) === band)];
    const doneHere = done.filter(r => r.item.completion && bandAt(new Date(r.item.completion.at), ctx.dayStarts) === band);
    const items: Array<{ at: number; entry: TimelineEntry }> = [];
    for (const e of inBand) {
      items.push({
        at: e.start.getTime(),
        entry: {
          kind: 'event', key: `event:${e.calendar}:${e.start.getTime()}:${e.title}`, time: clockTime(e.start, ctx.timeFormat),
          title: e.title, range: range(e, ctx.timeFormat), past: e.end <= now, picture: pictureFor(e.title, '📅'),
        },
      });
    }
    for (const r of doneHere) {
      const at = new Date(r.item.completion!.at);
      // The time shows once, at the left; the row doesn't repeat it.
      items.push({ at: at.getTime(), entry: { kind: 'chore', key: r.key, time: clockTime(at, ctx.timeFormat), row: { ...r, doneAt: undefined } } });
    }
    if (state === 'now') {
      const nowAt = now.getTime();
      const next = events.find(e => e.start > now);
      const free = next ? Math.round((next.start.getTime() - nowAt) / 60000) : end ? Math.round((end.getTime() - nowAt) / 60000) : null;
      items.push({ at: nowAt, entry: { kind: 'now', key: 'now', time: clockTime(now, ctx.timeFormat) } });
      const busy = events.some(e => e.start <= now && e.end > now);
      if (!busy && (free === null || free >= 15)) {
        items.push({
          at: nowAt + 1,
          entry: {
            kind: 'free', key: 'free',
            until: next ? clockTime(next.start, ctx.timeFormat) : null,
            span: free !== null ? minutesText(free) : null,
            fits: fitsIn(free, [...dueNow, ...open, ...week]),
          },
        });
      }
      choresHere.forEach((r, i) => items.push({ at: nowAt + 2 + i, entry: { kind: 'chore', key: r.key, time: null, row: r } }));
    } else if (state === 'later') {
      const last = inBand.reduce((t, e) => Math.max(t, e.end.getTime()), 0);
      const base = Math.max(last, new Date(now.getFullYear(), now.getMonth(), now.getDate(), BAND_START[band]).getTime());
      choresHere.forEach((r, i) => items.push({ at: base + i, entry: { kind: 'chore', key: r.key, time: null, row: r } }));
    }
    if (items.length === 0) continue;
    entries.push({ kind: 'band', key: `band:${band}`, band, label: BAND_NAMES[band] });
    entries.push(...items.sort((a, b) => a.at - b.at).map(i => i.entry));
  }
  if (end && end > now) entries.push({ kind: 'bedtime', key: 'bedtime', time: clockTime(end, ctx.timeFormat, ctx.timeFormat === '12h') });
  return entries;
}

/** "Next: Dentist at 4:45 PM · then nothing until tomorrow" (List's top line). */
export function nextLine(events: DayEvent[], memberId: string, now: Date, format: '12h' | '24h'): string | null {
  const mine = events.filter(e => e.member === memberId && e.start > now);
  if (mine.length === 0) return null;
  const [next, ...rest] = mine;
  const time = clockTime(next.start, format, format === '12h');
  return rest.length === 0 ? `Next: ${next.title} at ${time} · then nothing until tomorrow` : `Next: ${next.title} at ${time}`;
}

export interface GoalModel {
  reward: Reward;
  have: number;
  /** Stars still to go; 0 when they have enough. */
  need: number;
  progress: number;
}

/** Someone's goal (spec 8.15): the reward they're saving up for, and how close they are. */
export function goalFor(member: Member, entry: BoardMember, rewards: Reward[]): GoalModel | null {
  const goal = typeof member.goal === 'string' ? member.goal : null;
  const reward = goal ? rewards.find(r => r.id === goal) : undefined;
  if (!reward) return null;
  const have = entry.stars;
  return { reward, have, need: Math.max(0, reward.cost - have), progress: reward.cost > 0 ? Math.min(1, have / reward.cost) : 1 };
}

export type { FairShare };

/** Shared chores this week, by time done (spec 13.4, 13.5): everyone's share of the minutes, as Week says it. */
export function fairShares(board: Board, members: Member[]): FairShare[] {
  return fairnessShares(members.map(member => ({ member, minutes: board.members[member.id]?.contribution.shared_minutes ?? 0 })));
}

export interface PicturesModel {
  now: RowModel | null;
  /** Now to Next: the next calendar event as a picture step, and the chore after this one. */
  next: Array<{ kind: 'event'; picture: string; text: string } | { kind: 'chore'; row: RowModel }>;
  waiting: RowModel[];
  done: RowModel[];
  later: RowModel[];
}

/** Pictures (spec 13.4): one huge Now tile, a Now to Next strip, then waiting and done tiles. */
export function picturesFor(column: ColumnModel, events: DayEvent[], now: Date, format: '12h' | '24h'): PicturesModel {
  const rows = column.entries.flatMap(e => (e.kind === 'row' ? [{ row: e.row, zone: e.zone }] : []));
  const todo = rows.filter(r => r.zone !== 'done' && (r.row.state === 'open' || r.row.state === 'sent_back'));
  const order = ['overdue', 'now', 'past', 'later', 'week'];
  todo.sort((a, b) => order.indexOf(a.zone) - order.indexOf(b.zone));
  const [first, ...others] = todo.map(r => r.row);
  const next: PicturesModel['next'] = [];
  const event = events.find(e => e.member === column.member.id && e.start > now);
  if (event) next.push({ kind: 'event', picture: pictureFor(event.title, '📅'), text: `${event.title} at ${clockTime(event.start, format)}` });
  if (others[0]) next.push({ kind: 'chore', row: others[0] });
  return {
    now: first ?? null,
    next,
    waiting: rows.filter(r => r.row.state === 'pending').map(r => r.row),
    done: column.doneToday,
    later: others.slice(1),
  };
}

/** A goal's progress in words, the same in My day and Rewards: "Goal: 🍦 Ice cream trip · 18 more ★" (milestone 8). */
export function goalWords(goal: Pick<GoalModel, 'need'>): string {
  return goal.need > 0 ? `${goal.need} more ★` : 'Enough stars!';
}

/** The week's stickers, the same on the board and in My day. */
export function stickersLabel(stars: number): string {
  return `This week: ${stars} ★`;
}

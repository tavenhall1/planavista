import type { Member } from '../../core/household';
import { daysBetween } from '../../core/status-map';
import type { ChoreRequest } from './chores-types';
import { clockTime } from './calendar-ties';
import { dayWords, skipWords } from './options-derive';

/** One request in the To approve inbox (spec 13.7). */
export interface InboxRow {
  id: string;
  kind: ChoreRequest['kind'];
  member: Member | null;
  /** "Dana finished", "Casey asks for more time on", "Casey wants". */
  lead: string;
  /** The chore or reward, in bold. */
  what: string;
  /** What follows ("this week" after a skip). */
  tail: string;
  /** "Today at 3:58 PM · ★ 1", "Move the due date to next Sunday", "★ 10 of 23". */
  detail: string;
  allow: string;
  decline: string;
  /** Approving isn't possible now (not enough stars). */
  blocked: boolean;
  /** A check-off whose time ran out: sending it back counts it as missed that day (round 9). */
  late?: boolean;
  /** A check-off of an occurrence owed nothing (excused, or its person away): sent back, it stays excused (round 13). */
  excused?: boolean;
}

export interface InboxGroups {
  chores: InboxRow[];
  requests: InboxRow[];
  rewards: InboxRow[];
  count: number;
}

/**
 * "Today at 3:58 PM", "Yesterday at 7:10 PM", "Monday at 9:00 AM", by the chore day
 * (round 10: 12:01 AM read "Tomorrow" before 3 AM, and "Today" once its day was over).
 * A time after midnight, before the day starts, is "Tonight" or "Last night".
 */
export function whenText(at: string, today: string, format: '12h' | '24h', dayStarts = '03:00'): string {
  const date = new Date(at);
  const pad = (v: number) => String(v).padStart(2, '0');
  const [h, m] = dayStarts.split(':').map(Number);
  const early = date.getHours() * 60 + date.getMinutes() < (Number.isFinite(h) ? h : 3) * 60 + (Number.isFinite(m) ? m : 0);
  const choreDay = new Date(date.getFullYear(), date.getMonth(), date.getDate() - (early ? 1 : 0));
  const day = `${choreDay.getFullYear()}-${pad(choreDay.getMonth() + 1)}-${pad(choreDay.getDate())}`;
  const time = clockTime(date, format, format === '12h');
  const ago = daysBetween(day, today);
  if (ago === 0) return `${early ? 'Tonight' : 'Today'} at ${time}`;
  if (ago === 1) return `${early ? 'Last night' : 'Yesterday'} at ${time}`;
  if (early) {
    // Further back, the calendar's own day (round 11: Wednesday 1:30 AM read "Tuesday at 1:30 AM"), in the
    // words any other time that day gets (round 12: "Oct 8" beside "October 8").
    const named = dayWords(`${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`, today);
    return `${named[0].toUpperCase()}${named.slice(1)} at ${time}`;
  }
  const words = dayWords(day, today);
  return `${words[0].toUpperCase()}${words.slice(1)} at ${time}`;
}

/** What a skip is for: a daily chore's day ("today"), else this week (round 14: a daily chore said "this week"). */
function skipWhen(occurrence: string | undefined, today: string): string {
  const period = occurrence?.split('|')[2] ?? '';
  if (period === 'once') return ''; // a one-time chore: skipping it is the whole of it (round 15)
  return period ? ` ${skipWords(period, today)}` : ' this week';
}

/** The inbox in its three groups: Chores to check, Requests, and Rewards (spec 13.7). */
export function inboxGroups(
  requests: ChoreRequest[], members: Member[], today: string, format: '12h' | '24h', dayStarts = '03:00',
): InboxGroups {
  const byId = new Map(members.map(m => [m.id, m]));
  const groups: InboxGroups = { chores: [], requests: [], rewards: [], count: requests.length };
  for (const r of requests) {
    const member = byId.get(r.member) ?? null;
    const name = member?.name ?? r.member;
    if (r.kind === 'completion') {
      const doer = r.done_by && r.done_by !== r.member ? byId.get(r.done_by)?.name ?? r.done_by : null;
      const stars = r.stars ? ` · ★\u00a0${r.stars}` : ''; // the star keeps its number (round 2)
      const late = r.missed_if_sent_back === true;
      const excused = r.stays_excused === true;
      groups.chores.push({
        id: r.id, kind: r.kind, member, lead: doer ? `${doer} finished` : `${name} finished`, what: r.name,
        tail: doer ? ` for ${name}` : '', detail: `${whenText(r.at, today, format, dayStarts)}${stars}${late ? ' · Its day is over' : excused ? (r.away ? ' · Away' : ' · Excused') : ''}`,
        allow: 'Looks good', decline: late || excused ? 'Not done' : 'Send back', blocked: false, late, excused,
      });
    } else if (r.kind === 'more_time' || r.kind === 'skip') {
      const more = r.kind === 'more_time';
      groups.requests.push({
        id: r.id, kind: r.kind, member,
        lead: more ? `${name} asks for more time on` : `${name} asks to skip`,
        what: r.name, tail: more ? '' : skipWhen(r.occurrence, today),
        detail: more && r.until ? `Move the due date to ${dayWords(r.until, today)}` : 'It would be excused, so nothing is missed.',
        allow: 'Allow', decline: 'Not this time', blocked: false,
      });
    } else {
      const cost = r.cost ?? 0;
      const balance = r.balance ?? 0;
      groups.rewards.push({
        id: r.id, kind: r.kind, member, lead: `${name} wants`, what: r.name, tail: '',
        detail: balance >= cost ? `★\u00a0${cost} of ${balance}` : `★\u00a0${cost}, and ${name} has ${balance}: not enough stars yet`,
        allow: 'Approve', decline: 'Decline', blocked: balance < cost,
      });
    }
  }
  return groups;
}

/** What the toast says once a parent answered. */
/** The PIN sheet's question for an answer from the inbox (round 3: Send back and Decline asked "To approve"). */
export function reviewQuestion(row: Pick<InboxRow, 'kind' | 'late' | 'excused'>, allow: boolean): string {
  if (allow) return "Who's approving?";
  if (row.kind === 'completion' && row.excused) return "Who's checking it?"; // it isn't sent back: it stays excused (round 14)
  if (row.kind === 'completion' && row.late) return "Who's counting it as missed?"; // round 10
  return row.kind === 'completion' ? "Who's sending it back?" : "Who's declining?";
}

/** Whether a check-off waiting for approval is past its day, so sending it back counts it as missed (round 10). */
export function lateRequest(board: { requests: ChoreRequest[] } | null | undefined, id: string | null | undefined): boolean {
  return !!id && !!board?.requests.some(r => r.id === id && r.missed_if_sent_back === true);
}

/**
 * How far to scroll so a box (Send back's reasons) shows within the room (below the sticky head, above a
 * pinned Done): up until its bottom shows, but never past its top, which comes first (round 12).
 */
export function revealBy(box: { top: number; bottom: number }, room: { top: number; bottom: number }): number {
  let by = 0;
  if (box.bottom > room.bottom) by = box.bottom - room.bottom;
  if (box.top - by < room.top) by = box.top - room.top;
  return by;
}

/** Whether a waiting check-off's occurrence was owed nothing, so sent back it stays excused (rounds 13 and 14). */
export function excusedRequest(board: { requests: ChoreRequest[] } | null | undefined, id: string | null | undefined): boolean {
  return !!id && !!board?.requests.some(r => r.id === id && r.stays_excused === true);
}

/** Quick reasons for Send back (spec 13.7); one whose day is over can't be done again (round 10). */
export function sendBackReasons(late: boolean): string[] {
  return late ? ['Not finished', 'Missed a spot'] : ['Not finished', 'Missed a spot', 'Do it again'];
}

/** How long a row answered here stays where it was, so nothing slides under the finger (round 5). */
export const ANSWERED_MS = 1200;
/** The longest a row waits for its answer (a PIN, the save) before its buttons come back (round 6). */
export const PENDING_MS = 30_000;

export interface Answered {
  allow: boolean;
  /** When it was tapped, or answered once `done` (ms, the page's clock). */
  at: number;
  /** On its way (the PIN, the save), or answered (round 6: it said Approved before either). */
  state: 'pending' | 'done';
}

export type ShownRow = InboxRow & { answered?: 'pending' | 'allowed' | 'declined' };

/**
 * A group's rows as drawn (round 5, r5b B1): the board's rows in the order they
 * were shown, with a row answered here kept in its place, without its buttons,
 * for `ANSWERED_MS` (gone from the board or not); new rows join at the end. A
 * double tap on Looks good approved everything: the bottom sheet shrank from the
 * top and Approve all slid under the finger.
 */
export function withAnswered(
  rows: readonly InboxRow[], before: readonly ShownRow[], answered: ReadonlyMap<string, Answered>, now: number,
): ShownRow[] {
  const fresh = new Map(rows.map(row => [row.id, row]));
  const shown: ShownRow[] = [];
  for (const row of before) {
    const live = fresh.get(row.id);
    fresh.delete(row.id);
    const answer = answered.get(row.id);
    if (answer && isHeld(answer, now)) {
      shown.push({ ...(live ?? row), answered: answer.state === 'pending' ? 'pending' : answer.allow ? 'allowed' : 'declined' });
    } else if (live) shown.push(live);
  }
  return [...shown, ...rows.filter(row => fresh.has(row.id))];
}

/** Whether a row answered here is still drawn in its place (on its way, or a moment after). */
export function isHeld(answer: Answered | undefined, now: number): boolean {
  return !!answer && now - answer.at < (answer.state === 'pending' ? PENDING_MS : ANSWERED_MS);
}

/** What an answered row says in place of its buttons. */
export function answeredWords(row: Pick<InboxRow, 'kind' | 'late' | 'excused'>, answered: 'pending' | 'allowed' | 'declined'): string {
  if (answered === 'pending') return 'Saving…';
  if (row.kind === 'completion') return answered === 'allowed' ? 'Approved' : row.excused ? 'Not done' : row.late ? 'Counted as missed' : 'Sent back';
  if (row.kind === 'redemption') return answered === 'allowed' ? 'Approved' : 'Declined';
  return answered === 'allowed' ? 'Allowed' : 'Not this time';
}

/**
 * What Approve all says when it ends: rows answered elsewhere meanwhile are named,
 * not failures (round 6), and rows that didn't save say so (round 7: "Approved 2
 * chores." replaced the error, and the parent thought all five went through).
 */
export function approveAllSummary(
  approved: number, gone: number, notSaved = 0, reason?: string | null,
): { text: string; tone: 'plain' | 'bad' } | null {
  if (notSaved > 0) {
    const why = reason ? `: ${reason}` : '. Check the connection and try again.';
    // Every row accounted for (round 8: the ones not waiting anymore went unsaid).
    const goneWords = gone > 0 ? `${gone} ${gone === 1 ? "wasn't" : "weren't"} waiting anymore. ` : '';
    return { text: `${approved > 0 ? `Approved ${approved}. ` : ''}${goneWords}${notSaved} didn't save${why}`, tone: 'bad' };
  }
  // Answered on another screen, unchecked by the child, or its chore deleted: not waiting anymore (round 7).
  if (approved > 0 && gone > 0) return { text: `Approved ${approved}. ${gone} ${gone === 1 ? "wasn't" : "weren't"} waiting anymore.`, tone: 'plain' };
  if (approved > 1) return { text: `Approved ${approved} chores.`, tone: 'plain' };
  if (approved === 0 && gone > 0) return { text: "Those weren't waiting anymore.", tone: 'plain' };
  return null;
}

/**
 * Rows that came in after the approvals opened wait behind a word ("2 more came in"),
 * so nothing shown moves under a finger (round 7: an arrival in an earlier group
 * pushed the later groups down). With nothing shown, they show at once.
 */
export function heldArrivals(
  groups: InboxGroups, known: ReadonlySet<string>, drawn: ReadonlySet<string> = new Set(),
): { groups: InboxGroups; arrived: number } {
  const all = [...groups.chores, ...groups.requests, ...groups.rewards];
  // An answered row still drawn counts as shown (round 8: arrivals slid into its place under the finger).
  if (!all.some(row => known.has(row.id)) && drawn.size === 0) return { groups, arrived: 0 };
  const keep = (rows: InboxRow[]) => rows.filter(row => known.has(row.id));
  const shown: InboxGroups = { chores: keep(groups.chores), requests: keep(groups.requests), rewards: keep(groups.rewards), count: groups.count };
  return { groups: shown, arrived: all.length - shown.chores.length - shown.requests.length - shown.rewards.length };
}

export function answeredText(row: InboxRow, allowed: boolean, note?: string | null): string {
  if (row.kind === 'completion' && !allowed && row.excused) return `${row.what} stays excused${note ? `: ${note}` : ''}.`;
  if (row.kind === 'completion' && !allowed && row.late) return `${row.what} counts as missed that day${note ? `: ${note}` : ''}.`;
  if (row.kind === 'completion') return allowed ? `${row.what}: looks good.` : `${row.what} went back${note ? `: ${note}` : ''}.`;
  if (row.kind === 'redemption') return allowed ? `${row.what} is ${row.member?.name ?? 'theirs'}'s.` : `${row.what}: declined.`;
  return allowed ? `Allowed: ${row.what}.` : `Not this time: ${row.what}.`;
}

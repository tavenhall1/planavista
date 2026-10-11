import type { Member } from '../../core/household';
import { dayDate, minutesText } from '../../core/status-map';
import type { PastItem, WeekDay, WeekView, WeeklyEntry } from './chores-types';
import { dayWords, addDays } from './options-derive';

const SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/** One person's day in the Week grid (spec 13.5): a mini ring and a word or two. */
export interface WeekCell {
  date: string;
  kind: WeekDay['kind'];
  /** "3 of 3", "1 missed", "3 due", "Away". */
  label: string;
  tone: 'plain' | 'bad' | 'muted';
  progress: number;
  closed: boolean;
  /** A day to come: the ring is dashed. */
  dashed: boolean;
  away: boolean;
  /** Nothing was due or nothing is known. */
  empty: boolean;
}

export interface WeekRow {
  member: Member;
  cells: WeekCell[];
  weekly: { text: string; badge: string | null; badgeTone: 'neutral' | 'act' | 'time'; progress: number } | null;
}

/** "Week of October 12". */
export function weekTitle(view: Pick<WeekView, 'week'>): string {
  const start = dayDate(view.week.start);
  return `Week of ${MONTHS[start.getMonth()]} ${start.getDate()}`;
}

/** The column heads: "Mon", "Tue" (with "Today" under today's). */
export function weekDays(view: Pick<WeekView, 'week' | 'today'>): Array<{ date: string; label: string; today: boolean }> {
  const days: Array<{ date: string; label: string; today: boolean }> = [];
  for (let n = 0; n < 7; n++) {
    const date = addDays(view.week.start, n);
    if (date >= view.week.end) break;
    days.push({ date, label: SHORT[dayDate(date).getDay()], today: date === view.today });
  }
  return days;
}

export function weekCell(day: WeekDay): WeekCell {
  const base = { date: day.date, kind: day.kind, away: day.away, dashed: day.kind === 'future' };
  if (day.away) return { ...base, label: 'Away', tone: 'muted', progress: 0, closed: false, empty: false };
  const due = day.due ?? 0;
  const finished = (day.done ?? 0) + (day.pending ?? 0);
  if (day.kind === 'future') {
    return { ...base, label: due ? `${due} due` : '', tone: 'muted', progress: 0, closed: false, empty: !due };
  }
  if (day.due === null) return { ...base, label: '', tone: 'muted', progress: 0, closed: false, empty: true };
  if (due === 0) return { ...base, label: 'Nothing due', tone: 'muted', progress: 0, closed: false, empty: true };
  if (day.kind === 'past' && day.missed > 0) {
    return { ...base, label: `${day.missed} missed`, tone: 'bad', progress: Math.min(1, finished / due), closed: false, empty: false };
  }
  return { ...base, label: `${Math.min(finished, due)} of ${due}`, tone: 'plain', progress: Math.min(1, finished / due), closed: !!day.closed || finished >= due, empty: false };
}

/** Weekly chores for one person: "1 of 3", with "Laundry from Mon" or "⏳ 1 waiting" (spec 13.5). */
export function weeklyLine(entries: WeeklyEntry[], daysLeft: number, today: string): WeekRow['weekly'] {
  if (entries.length === 0) return null;
  const total = entries.reduce((sum, e) => sum + e.total, 0);
  const done = entries.reduce((sum, e) => sum + e.done, 0);
  const pending = entries.reduce((sum, e) => sum + e.pending, 0);
  // A make-up is one whose day has passed; the Week view also looks at days still to come.
  const late = entries.filter(e => e.from && e.from < today).sort((a, b) => (a.from ?? '').localeCompare(b.from ?? ''))[0];
  let badge: string | null = null;
  let badgeTone: 'neutral' | 'act' | 'time' = 'neutral';
  if (late?.from) {
    badge = `${late.name} from ${SHORT[dayDate(late.from).getDay()]}`;
    badgeTone = 'time';
  } else if (pending) {
    badge = `⏳ ${pending} waiting`;
    badgeTone = 'act';
  } else if (done + pending < total) {
    badge = daysLeft === 1 ? 'Last day' : `${daysLeft} days left`;
  }
  return { text: `${done + pending} of ${total}`, badge, badgeTone, progress: total ? (done + pending) / total : 0 };
}

export function weekRows(view: WeekView, members: Member[], daysLeft: number): WeekRow[] {
  return members
    .filter(m => view.members[m.id])
    .map(member => {
      const entry = view.members[member.id];
      return {
        member,
        cells: entry.days.map(weekCell),
        weekly: weeklyLine(entry.weekly, daysLeft, view.today),
      };
    });
}

/** A plain-language highlight under the grid, with an Excuse it for a missed chore (spec 13.5). */
export interface Highlight {
  key: string;
  member: Member;
  text: string;
  excuse?: { occurrence: string; name: string; day: string };
}

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function joinDays(days: string[]): string {
  const names = days.map(d => WEEKDAYS[dayDate(d).getDay()]);
  if (names.length <= 1) return names.join('');
  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
}

/** Up to three highlights: rings closed all week, a chore missed, someone away. */
export function weekHighlights(view: WeekView, members: Member[], limit = 3): Highlight[] {
  const found: Highlight[] = [];
  for (const member of members) {
    const entry = view.members[member.id];
    if (!entry) continue;
    const counted = entry.days.filter(d => d.kind !== 'future' && !d.away && (d.due ?? 0) > 0);
    if (counted.length >= 2 && counted.some(d => d.kind === 'past') && counted.every(d => weekCell(d).closed)) {
      found.push({ key: `closed:${member.id}`, member, text: `${member.name} has closed every ring this week.` });
    }
  }
  for (const member of members) {
    const entry = view.members[member.id];
    if (!entry) continue;
    for (const day of entry.days) {
      for (const missed of day.missed_items ?? []) {
        found.push({
          key: `missed:${missed.key}`, member,
          text: `${member.name} missed ${missed.name} on ${dayWords(day.date, view.today)}.`,
          excuse: { occurrence: missed.key, name: missed.name, day: day.date },
        });
      }
    }
  }
  for (const member of members) {
    const entry = view.members[member.id];
    const away = entry?.days.filter(d => d.away).map(d => d.date) ?? [];
    if (away.length) found.push({ key: `away:${member.id}`, member, text: `${member.name} is away ${joinDays(away)}.` });
  }
  return found.slice(0, limit);
}

/** Shared chores this week, by time done: everyone's minutes, for the fairness bar. */
export function weekShares(view: WeekView, members: Member[]): Array<{ member: Member; minutes: number; text: string; percent: number }> {
  const shares = members
    .filter(m => view.members[m.id])
    .map(member => ({ member, minutes: view.members[member.id].contribution.shared_minutes }));
  const total = shares.reduce((sum, s) => sum + s.minutes, 0);
  if (total <= 0) return [];
  return shares
    .filter(s => s.minutes > 0)
    .map(s => ({ ...s, text: `${s.member.name} ${minutesText(s.minutes)}`, percent: (100 * s.minutes) / total }));
}

export type { PastItem };

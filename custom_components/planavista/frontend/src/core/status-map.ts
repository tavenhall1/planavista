/**
 * The status map (spec 11.4): one set of words, glyphs, and color jobs for
 * every chores view. Color is never alone: each state also has words.
 * The engine's to-do descriptions read the same item views and are checked
 * against the same table (tests/fixtures/chores_status.json).
 */

/** A color job (spec 11.3): neutral, something to act on (indigo), time pressure (amber), overdue or sent back (red), or quiet. */
export type Tone = 'neutral' | 'act' | 'time' | 'bad' | 'muted';

export interface StatusBadge {
  words: string;
  tone: Tone;
  glyph?: string;
}

/** The fields of an item view (planavista/chores/subscribe) the status map reads. */
export interface StatusView {
  status: string;
  section?: string;
  window?: string;
  from?: string | null;
  overdue_since?: string | null;
  dated?: boolean;
  due_day?: string | null;
  note?: string | null;
  planned?: string | null;
}

export interface BadgeContext {
  /** Today's chore day, YYYY-MM-DD. */
  today: string;
  /** Days left in the chore week, today included. */
  daysLeft: number;
  /** The chore's floating check-offs still open this week. */
  remaining: number;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** A YYYY-MM-DD day as a local date at noon (so no zone shift moves it to another day). */
export function dayDate(day: string): Date {
  const [y, m, d] = day.split('-').map(Number);
  return new Date(y, m - 1, d, 12);
}

/** Whole days from `from` to `to` (YYYY-MM-DD). */
export function daysBetween(from: string, to: string): number {
  return Math.round((dayDate(to).getTime() - dayDate(from).getTime()) / 86_400_000);
}

/** "Mon" within a week of today, otherwise "Oct 3" (the engine's short_day). */
export function shortDay(day: string, today: string): string {
  const date = dayDate(day);
  if (Math.abs(daysBetween(today, day)) <= 6) return WEEKDAYS[date.getDay()];
  return `${MONTHS[date.getMonth()]} ${date.getDate()}`;
}

/**
 * The badge beside an item's name, or null when its estimate shows instead.
 * Waiting for OK and Sent back come first; then overdue, make-up, and due
 * dates; a floating item turns amber when its open check-offs equal the days
 * left, and red on the last day (spec 8.4).
 */
export function itemBadge(view: StatusView, ctx: BadgeContext): StatusBadge | null {
  switch (view.status) {
    case 'done':
      return null;
    case 'pending':
      return { words: 'Waiting for OK', tone: 'act', glyph: '⏳' };
    case 'sent_back':
      return { words: view.note ? `Sent back: ${view.note}` : 'Sent back', tone: 'bad', glyph: '↩' };
    case 'excused':
      return { words: 'Excused', tone: 'muted' };
    case 'away':
      return { words: 'Away', tone: 'neutral', glyph: '🧳' };
    default:
      break;
  }
  if (view.overdue_since) return { words: `Overdue since ${shortDay(view.overdue_since, ctx.today)}`, tone: 'bad', glyph: '•' };
  if (view.from) return { words: `From ${shortDay(view.from, ctx.today)}`, tone: 'neutral' };
  if (view.dated && view.due_day) {
    if (view.due_day === ctx.today) return { words: 'Due today', tone: 'time' };
    return { words: `Due ${shortDay(view.due_day, ctx.today)}`, tone: 'neutral' };
  }
  if (view.section === 'week' && view.window === 'week' && ctx.remaining > 0) {
    if (ctx.daysLeft <= 1) return { words: 'Last day', tone: 'bad', glyph: '•' };
    if (ctx.remaining >= ctx.daysLeft) return { words: `${ctx.daysLeft} days left`, tone: 'time', glyph: '•' };
  }
  return null;
}

/** A past day's outcome for an item (the Week view's day sheet). */
export function pastBadge(status: string, note?: string | null): StatusBadge {
  switch (status) {
    case 'done':
      return { words: 'Done', tone: 'neutral', glyph: '✓' };
    case 'pending':
      return { words: 'Waiting for OK', tone: 'act', glyph: '⏳' };
    case 'missed':
      return { words: 'Missed', tone: 'bad', glyph: '×' };
    case 'carried':
      return { words: 'Carried over', tone: 'time', glyph: '•' };
    case 'open':
      // A make-up chore that slipped its day: it kept that day's ring open.
      return { words: 'Not done that day', tone: 'time', glyph: '•' };
    case 'excused':
      return { words: note ? `Excused: ${note}` : 'Excused', tone: 'muted' };
    default:
      return { words: status, tone: 'neutral' };
  }
}

/** Badges longer than this go under the chore's name, so the name keeps its room. */
export const LONG_BADGE = 14;

/**
 * Whether a badge sits under the chore's name (spec 12.3): always in a narrow
 * panel, and when its words are long (a sent-back note, "Overdue since Mon"),
 * where it wraps instead of being cut off.
 */
export function badgeBelow(badge: StatusBadge | null, narrow: boolean): boolean {
  if (!badge) return false;
  return narrow || badge.words.length > LONG_BADGE;
}

/** "15 min", "1 h", "1.5 h", "2 h 40 min". */
export function minutesText(minutes: number): string {
  const rounded = Math.round(minutes);
  if (rounded < 60) return `${Math.max(1, rounded)} min`;
  const hours = rounded / 60;
  if (Number.isInteger(hours)) return `${hours} h`;
  if (Number.isInteger(hours * 2)) return `${hours.toFixed(1)} h`;
  return `${Math.floor(hours)} h ${rounded % 60} min`;
}

/** What a ring says to a screen reader (spec 11.8). */
export function ringLabel(name: string, done: number, due: number): string {
  if (due === 0) return `${name}, nothing due today`;
  if (done >= due) return `${name}, ring closed for today`;
  return `${name}, ${done} of ${due} done today`;
}

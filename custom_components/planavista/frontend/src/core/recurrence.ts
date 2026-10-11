/**
 * Repeating rules in the subset the engine follows (spec 7.3): FREQ=DAILY,
 * WEEKLY, or MONTHLY; INTERVAL; BYDAY (weekly); BYMONTHDAY (monthly, one
 * day); and COUNT or UNTIL. The chore editor's pv-recurrence-picker writes
 * them and the Chores list describes them; the calendar can reuse both.
 */

export type Freq = 'DAILY' | 'WEEKLY' | 'MONTHLY';
export type Weekday = 'MO' | 'TU' | 'WE' | 'TH' | 'FR' | 'SA' | 'SU';

export const WEEKDAYS: Weekday[] = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'];
const SHORT: Record<Weekday, string> = { MO: 'Mon', TU: 'Tue', WE: 'Wed', TH: 'Thu', FR: 'Fri', SA: 'Sat', SU: 'Sun' };
const LONG: Record<Weekday, string> = {
  MO: 'Monday', TU: 'Tuesday', WE: 'Wednesday', TH: 'Thursday', FR: 'Friday', SA: 'Saturday', SU: 'Sunday',
};
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export interface Rule {
  freq: Freq;
  interval: number;
  byday: Weekday[];
  bymonthday: number | null;
  count: number | null;
  /** The last day it may happen, YYYY-MM-DD. */
  until: string | null;
}

/** A rule from its RRULE text, or null when it isn't one the engine follows. */
export function parseRule(text: string): Rule | null {
  const parts = new Map<string, string>();
  for (const part of text.replace(/^RRULE:/i, '').split(';')) {
    const [key, value] = part.split('=');
    if (!key || value === undefined || parts.has(key.toUpperCase())) return null;
    parts.set(key.toUpperCase(), value.toUpperCase());
  }
  const freq = parts.get('FREQ') as Freq | undefined;
  if (freq !== 'DAILY' && freq !== 'WEEKLY' && freq !== 'MONTHLY') return null;
  const interval = parts.has('INTERVAL') ? Number(parts.get('INTERVAL')) : 1;
  const byday = parts.get('BYDAY')?.split(',') ?? [];
  if (!Number.isInteger(interval) || interval < 1 || byday.some(d => !WEEKDAYS.includes(d as Weekday))) return null;
  if (byday.length && freq !== 'WEEKLY') return null;
  const monthday = parts.has('BYMONTHDAY') ? Number(parts.get('BYMONTHDAY')) : null;
  if (monthday !== null && (freq !== 'MONTHLY' || !Number.isInteger(monthday) || monthday < 1 || monthday > 31)) return null;
  const count = parts.has('COUNT') ? Number(parts.get('COUNT')) : null;
  if (count !== null && (!Number.isInteger(count) || count < 1)) return null;
  const untilMatch = parts.get('UNTIL')?.match(/^(\d{4})(\d{2})(\d{2})(T\d{6}Z?)?$/);
  if (parts.has('UNTIL') && !untilMatch) return null;
  if (count !== null && untilMatch) return null;
  const known = new Set(['FREQ', 'INTERVAL', 'BYDAY', 'BYMONTHDAY', 'COUNT', 'UNTIL']);
  if ([...parts.keys()].some(key => !known.has(key))) return null;
  return {
    freq,
    interval,
    byday: WEEKDAYS.filter(d => byday.includes(d)),
    bymonthday: monthday,
    count,
    until: untilMatch ? `${untilMatch[1]}-${untilMatch[2]}-${untilMatch[3]}` : null,
  };
}

/** "Mon, Thu", or "Saturdays" for one day. */
export function weekdaysText(days: Weekday[], plural = true): string {
  if (days.length === 1) return plural ? `${LONG[days[0]]}s` : LONG[days[0]];
  return days.map(d => SHORT[d]).join(', ');
}

export function ordinal(n: number): string {
  const tens = n % 100;
  if (tens >= 11 && tens <= 13) return `${n}th`;
  return `${n}${['th', 'st', 'nd', 'rd'][n % 10] ?? 'th'}`;
}

/** "Nov 30" from YYYY-MM-DD. */
export function shortDate(iso: string): string {
  const [, month, day] = iso.split('-').map(Number);
  return `${MONTHS[month - 1]} ${day}`;
}

/**
 * A rule in a few words for a list (spec 14.3): "Saturdays until Nov 30",
 * "Monthly · any time that month", "Every 2 weeks · Mon, Thu".
 */
export function ruleText(rule: Rule, window: 'day' | 'period' = 'day'): string {
  let text: string;
  if (rule.freq === 'DAILY') {
    text = rule.interval === 1 ? 'Every day' : `Every ${rule.interval} days`;
  } else if (rule.freq === 'WEEKLY') {
    const days = rule.byday;
    if (rule.interval === 1) {
      text = window === 'period' || days.length === 0 ? 'Weekly · any time that week' : weekdaysText(days);
    } else {
      const every = `Every ${rule.interval} weeks`;
      text = window === 'period' || days.length === 0 ? `${every} · any time that week` : `${every} · ${weekdaysText(days, false)}`;
    }
  } else {
    const every = rule.interval === 1 ? 'Monthly' : `Every ${rule.interval} months`;
    text = window === 'period' || rule.bymonthday === null
      ? `${every} · any time that month`
      : `${every} on the ${ordinal(rule.bymonthday)}`;
  }
  if (rule.until) return `${text} until ${shortDate(rule.until)}`;
  if (rule.count) return `${text}, ${rule.count} ${rule.count === 1 ? 'time' : 'times'}`;
  return text;
}

// The picker's value ------------------------------------------------------------------------

/** What pv-recurrence-picker edits: a rule, and the day it starts. */
export interface RecurrenceValue {
  freq: Freq;
  interval: number;
  byday: Weekday[];
  bymonthday: number | null;
  ends: 'never' | 'count' | 'until';
  /** Kept while another ending is picked, so switching back keeps it. */
  count: number;
  until: string;
  /** YYYY-MM-DD. */
  start: string;
}

const LONG_MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October',
  'November', 'December'];

function dateOf(iso: string): Date {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function isoOf(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Monday is 0, as the engine counts (date.weekday()). */
function weekdayIndex(iso: string): number {
  return (dateOf(iso).getUTCDay() + 6) % 7;
}

export function weekdayOf(iso: string): Weekday {
  return WEEKDAYS[weekdayIndex(iso)];
}

function addDays(iso: string, days: number): string {
  const date = dateOf(iso);
  date.setUTCDate(date.getUTCDate() + days);
  return isoOf(date);
}

/** "November 30". */
export function longDate(iso: string): string {
  const [, month, day] = iso.split('-').map(Number);
  return `${LONG_MONTHS[month - 1]} ${day}`;
}

/** The value for a stored rule, or a new one: every week on the start's weekday, never ending. */
export function recurrenceValue(rrule: string | null | undefined, start: string): RecurrenceValue {
  const rule = rrule ? parseRule(rrule) : null;
  const fallbackUntil = addDays(start, 56);
  if (!rule) {
    return { freq: 'WEEKLY', interval: 1, byday: [weekdayOf(start)], bymonthday: null, ends: 'never', count: 4, until: fallbackUntil, start };
  }
  return {
    freq: rule.freq,
    interval: rule.interval,
    byday: rule.byday,
    bymonthday: rule.bymonthday,
    ends: rule.count ? 'count' : rule.until ? 'until' : 'never',
    count: rule.count ?? 4,
    until: rule.until ?? fallbackUntil,
    start,
  };
}

/** The RRULE the picker's value makes, in the subset the engine follows. */
export function toRRule(value: RecurrenceValue): string {
  const parts = [`FREQ=${value.freq}`];
  if (value.interval > 1) parts.push(`INTERVAL=${value.interval}`);
  if (value.freq === 'WEEKLY' && value.byday.length) parts.push(`BYDAY=${WEEKDAYS.filter(d => value.byday.includes(d)).join(',')}`);
  if (value.freq === 'MONTHLY' && value.bymonthday) parts.push(`BYMONTHDAY=${value.bymonthday}`);
  if (value.ends === 'count') parts.push(`COUNT=${value.count}`);
  if (value.ends === 'until') parts.push(`UNTIL=${value.until.replace(/-/g, '')}`);
  return parts.join(';');
}

function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
}

/**
 * The dates a rule happens on from `start` through `last`, as the engine
 * works them out (chores/recurrence.py): weeks start on Monday, a weekly
 * rule without days repeats on the start's weekday, a monthly one on its
 * day of the month (skipping months that don't have it), and COUNT counts
 * from the start. At most `max` dates.
 */
export function instanceDates(rule: Rule, start: string, last: string, max = 1000): string[] {
  const out: string[] = [];
  const end = rule.until && rule.until < last ? rule.until : last;
  const push = (iso: string): boolean => {
    if (iso > end || (rule.count !== null && out.length >= rule.count) || out.length >= max) return false;
    out.push(iso);
    return true;
  };
  if (rule.freq === 'DAILY') {
    for (let iso = start; iso <= end; iso = addDays(iso, rule.interval)) if (!push(iso)) break;
    return out;
  }
  if (rule.freq === 'WEEKLY') {
    const days = rule.byday.length ? rule.byday.map(d => WEEKDAYS.indexOf(d)) : [weekdayIndex(start)];
    days.sort((a, b) => a - b);
    for (let monday = addDays(start, -weekdayIndex(start)); monday <= end; monday = addDays(monday, 7 * rule.interval)) {
      for (const day of days) {
        const iso = addDays(monday, day);
        if (iso >= start && !push(iso)) return out;
      }
    }
    return out;
  }
  const dayOfMonth = rule.bymonthday ?? dateOf(start).getUTCDate();
  const first = dateOf(start);
  for (let months = 0; ; months += rule.interval) {
    const year = first.getUTCFullYear() + Math.floor((first.getUTCMonth() + months) / 12);
    const month = (first.getUTCMonth() + months) % 12;
    if (isoOf(new Date(Date.UTC(year, month, 1))) > end) return out;
    if (dayOfMonth <= daysInMonth(year, month)) {
      const iso = isoOf(new Date(Date.UTC(year, month, dayOfMonth)));
      if (iso >= start && !push(iso)) return out;
    }
  }
}

function joinAnd(words: string[]): string {
  if (words.length <= 1) return words.join('');
  return `${words.slice(0, -1).join(', ')} and ${words[words.length - 1]}`;
}

/** The picker's line under the rule (spec 14.4): "Every Saturday until November 30: 7 times." */
export function recurrenceSummary(value: RecurrenceValue): string {
  const rule = parseRule(toRRule(value));
  if (!rule) return '';
  let base: string;
  if (rule.freq === 'DAILY') {
    base = rule.interval === 1 ? 'Every day' : `Every ${rule.interval} days`;
  } else if (rule.freq === 'WEEKLY') {
    const days = joinAnd((rule.byday.length ? rule.byday : [weekdayOf(value.start)]).map(d => LONG[d]));
    base = rule.interval === 1 ? `Every ${days}` : `Every ${rule.interval} weeks on ${days}`;
  } else {
    const day = ordinal(rule.bymonthday ?? dateOf(value.start).getUTCDate());
    base = rule.interval === 1 ? `Every month on the ${day}` : `Every ${rule.interval} months on the ${day}`;
  }
  const times = (n: number) => `${n} ${n === 1 ? 'time' : 'times'}`;
  if (rule.until) {
    const count = instanceDates(rule, value.start, rule.until).length;
    return count ? `${base} until ${longDate(rule.until)}: ${times(count)}.` : 'This never happens. Pick a later end date.';
  }
  if (rule.count) {
    const dates = instanceDates(rule, value.start, addDays(value.start, 366 * 30));
    return dates.length ? `${base}, ${times(dates.length)}, ending ${longDate(dates[dates.length - 1])}.` : '';
  }
  return `${base}, from ${longDate(value.start)}.`;
}

/** Whether the rule happens at least once from its start (the engine refuses one that never does). */
export function happens(value: RecurrenceValue): boolean {
  const rule = parseRule(toRRule(value));
  return !!rule && instanceDates(rule, value.start, addDays(value.start, 366 * 5), 1).length > 0;
}

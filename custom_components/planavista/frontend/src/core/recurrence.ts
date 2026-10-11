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

import { CreateEventData } from '../types';
import { calendarDaysBetween, getDateKey, isDateOnly, parseEventDate } from './date-utils';

/**
 * Pure date math for the create/edit dialog. Everything here takes and
 * returns plain values so it can be unit-tested without the DOM.
 */

/** The date/time part of the dialog. */
export interface EventFormDates {
  /** Start date, YYYY-MM-DD (local). */
  date: string;
  allDay: boolean;
  /** HH:MM, 24-hour (timed events). */
  startTime: string;
  /** HH:MM, 24-hour (timed events). */
  endTime: string;
  /** All-day length in days (at least 1). The end date sent is date + spanDays (exclusive). */
  spanDays: number;
  /** Timed events: calendar days from the start date to the end date (0 = same day). */
  endDayOffset: number;
}

/** Date fields of a create/update payload. */
export type EventDatePayload =
  | { start_date: string; end_date: string }
  | { start_date_time: string; end_date_time: string };

/** Text fields of the dialog. */
export interface EventTextFields {
  summary: string;
  description?: string;
  location?: string;
}

const TIME_RE = /^\d{2}:\d{2}$/;

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

/** "HH:MM" for a Date's local wall-clock time. */
export function toTimeString(d: Date): string {
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** ISO 8601 with the local UTC offset in effect at that moment, e.g. 2026-10-09T09:00:00-05:00. */
export function toLocalIsoString(d: Date): string {
  const offset = -d.getTimezoneOffset();
  const sign = offset >= 0 ? '+' : '-';
  const abs = Math.abs(offset);
  return `${getDateKey(d)}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}` +
    `${sign}${pad(Math.floor(abs / 60))}:${pad(abs % 60)}`;
}

/** Shift a YYYY-MM-DD date by whole calendar days. */
export function shiftDateKey(date: string, days: number): string {
  const [y, m, d] = date.split('-').map(Number);
  return getDateKey(new Date(y, m - 1, d + days));
}

/** Local date (YYYY-MM-DD) + time (HH:MM) as a Date. */
function localDateTime(date: string, time: string): Date {
  const [y, m, d] = date.split('-').map(Number);
  const [hh, mm] = time.split(':').map(Number);
  return new Date(y, m - 1, d, hh, mm, 0, 0);
}

/**
 * Prefill from an event's start/end as the backend sends them: date-only for
 * all-day events (exclusive end), ISO datetimes otherwise. The all-day/timed
 * kind comes from the string format only, so a timed event that starts at
 * midnight stays timed.
 */
export function formDatesFromEvent(start: string, end?: string): EventFormDates {
  const s = parseEventDate(start);
  if (isDateOnly(start)) {
    const e = end ? parseEventDate(end) : s;
    return {
      date: getDateKey(s),
      allDay: true,
      startTime: '09:00',
      endTime: '10:00',
      spanDays: Math.max(1, calendarDaysBetween(s, e)),
      endDayOffset: 0,
    };
  }
  const e = end ? parseEventDate(end) : new Date(s.getTime() + 3600000);
  return {
    date: getDateKey(s),
    allDay: false,
    startTime: toTimeString(s),
    endTime: toTimeString(e),
    spanDays: 1,
    endDayOffset: Math.max(0, calendarDaysBetween(s, e)),
  };
}

/** Defaults for a new event: the next quarter hour, one hour long. */
export function defaultFormDates(now: Date): EventFormDates {
  const start = new Date(now);
  start.setMinutes(Math.ceil(start.getMinutes() / 15) * 15, 0, 0);
  const end = new Date(start.getTime() + 3600000);
  return {
    date: getDateKey(start),
    allDay: false,
    startTime: toTimeString(start),
    endTime: toTimeString(end),
    spanDays: 1,
    endDayOffset: calendarDaysBetween(start, end),
  };
}

/** Last calendar day the event covers (YYYY-MM-DD), for the "Ends ..." hint. */
export function formEndDate(f: EventFormDates): string {
  return f.allDay
    ? shiftDateKey(f.date, Math.max(1, f.spanDays) - 1)
    : shiftDateKey(f.date, f.endDayOffset);
}

/** Error text for invalid dates, or null when the form can be saved. */
export function validateFormDates(f: EventFormDates): string | null {
  if (!isDateOnly(f.date)) return 'Please pick a date';
  if (f.allDay) return null;
  if (!TIME_RE.test(f.startTime) || !TIME_RE.test(f.endTime)) return 'Please pick a start and end time';
  const start = localDateTime(f.date, f.startTime);
  const end = localDateTime(shiftDateKey(f.date, f.endDayOffset), f.endTime);
  return end > start ? null : 'End time must be after start time';
}

/**
 * Service date fields. All-day ends are exclusive (start + span, at least one
 * day). Timed values carry the local UTC offset so DST days and a browser in
 * another zone than Home Assistant stay unambiguous.
 */
export function buildDatePayload(f: EventFormDates): EventDatePayload {
  if (f.allDay) {
    return { start_date: f.date, end_date: shiftDateKey(f.date, Math.max(1, Math.round(f.spanDays))) };
  }
  return {
    start_date_time: toLocalIsoString(localDateTime(f.date, f.startTime)),
    end_date_time: toLocalIsoString(localDateTime(shiftDateKey(f.date, f.endDayOffset), f.endTime)),
  };
}

/**
 * Apply a new start time. A same-day end that would no longer be after the
 * start moves to an hour after it (into the next day after 23:00); an
 * overnight end is left alone.
 */
export function withStartTime(f: EventFormDates, startTime: string): EventFormDates {
  const next: EventFormDates = { ...f, startTime };
  if (f.endDayOffset === 0 && f.endTime <= startTime) {
    const [h, m] = startTime.split(':').map(Number);
    next.endTime = `${pad((h + 1) % 24)}:${pad(m)}`;
    next.endDayOffset = h + 1 >= 24 ? 1 : 0;
  }
  return next;
}

/** Create payload without entity_id: trimmed text plus dates; empty optional text is omitted. */
export function buildEventBase(f: EventFormDates, text: EventTextFields): Omit<CreateEventData, 'entity_id'> {
  const base: Omit<CreateEventData, 'entity_id'> = { summary: text.summary.trim(), ...buildDatePayload(f) };
  const description = text.description?.trim();
  const location = text.location?.trim();
  if (description) base.description = description;
  if (location) base.location = location;
  return base;
}

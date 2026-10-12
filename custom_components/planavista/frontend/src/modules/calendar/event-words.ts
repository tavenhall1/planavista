import type { CalendarEvent } from '../../types';
import type { StatusBadge } from '../../core/status-map';
import { formatTime, getDateKey, parseEventDate } from '../../utils/date-utils';
import { isAllDayEvent } from './utils/event-utils';

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const SOON_MINUTES = 15;

/** "Monday, October 12", with the year when it isn't this year. */
export function longDate(date: Date, now: Date): string {
  const words = `${WEEKDAYS[date.getDay()]}, ${MONTHS[date.getMonth()]} ${date.getDate()}`;
  return date.getFullYear() === now.getFullYear() ? words : `${words}, ${date.getFullYear()}`;
}

/** "Tue, Oct 13". */
function shortDate(date: Date): string {
  return `${WEEKDAYS[date.getDay()].slice(0, 3)}, ${MONTHS[date.getMonth()].slice(0, 3)} ${date.getDate()}`;
}

/** The last day an all-day event covers (its end date is exclusive). */
function lastAllDay(event: CalendarEvent): Date {
  const start = parseEventDate(event.start);
  const end = parseEventDate(event.end);
  const last = new Date(end.getFullYear(), end.getMonth(), end.getDate() - 1);
  return last < start ? start : last;
}

/** A timed event that ends on a later day than it starts (an end at midnight belongs to the start day). */
function endsAnotherDay(start: Date, end: Date): boolean {
  const lastMoment = new Date(Math.max(end.getTime() - 1, start.getTime()));
  return getDateKey(lastMoment) !== getDateKey(start);
}

/**
 * When an event happens, as the event sheet says it (spec 11.7):
 * "Monday, October 12" over "9:00 AM – 9:30 AM", "All day", or
 * "All day, through Wednesday, October 14".
 */
export function eventWhen(event: CalendarEvent, timeFormat: '12h' | '24h', now: Date): { date: string; time: string } {
  const start = parseEventDate(event.start);
  const date = longDate(start, now);
  if (isAllDayEvent(event)) {
    const last = lastAllDay(event);
    return { date, time: getDateKey(last) === getDateKey(start) ? 'All day' : `All day, through ${longDate(last, now)}` };
  }
  const end = parseEventDate(event.end);
  const from = formatTime(event.start, timeFormat);
  const to = formatTime(event.end, timeFormat);
  return { date, time: endsAnotherDay(start, end) ? `${from} – ${shortDate(end)}, ${to}` : `${from} – ${to}` };
}

/**
 * The status map's calendar rows (DESIGN_SYSTEM 6): Now while it runs, In
 * N min in amber for the last 15 minutes before it starts (time pressure),
 * and Day N of M through a multi-day all-day event.
 */
export function eventStatus(event: CalendarEvent, now: Date): StatusBadge | null {
  if (isAllDayEvent(event)) return dayOfStatus(event, now);
  const start = parseEventDate(event.start);
  const end = parseEventDate(event.end);
  if (now >= start && now < end) return { words: 'Now', tone: 'neutral' };
  const minutes = (start.getTime() - now.getTime()) / 60_000;
  if (minutes > 0 && minutes <= SOON_MINUTES) return { words: `In ${Math.ceil(minutes)} min`, tone: 'time' };
  return null;
}

/** Day N of M through a multi-day all-day event, counted on `day` (an Agenda card counts its own day). */
export function dayOfStatus(event: CalendarEvent, day: Date): StatusBadge | null {
  if (!isAllDayEvent(event)) return null;
  const start = parseEventDate(event.start);
  const last = lastAllDay(event);
  const days = Math.round((last.getTime() - start.getTime()) / 86_400_000) + 1;
  if (days < 2) return null;
  const on = new Date(day.getFullYear(), day.getMonth(), day.getDate());
  const n = Math.round((on.getTime() - new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime()) / 86_400_000) + 1;
  return n >= 1 && n <= days ? { words: `Day ${n} of ${days}`, tone: 'neutral' } : null;
}

/** "Alex", "Alex and Blair", "Alex, Blair, and Casey". */
export function namesList(names: string[]): string {
  if (names.length <= 1) return names[0] ?? '';
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names.slice(0, -1).join(', ')}, and ${names[names.length - 1]}`;
}

/** The event's name in a sentence ("Delete Dentist?"), or "this event" when it has none. */
export function eventName(event: Pick<CalendarEvent, 'summary'>): string {
  return event.summary?.trim() || 'this event';
}

export interface DeleteQuestion {
  heading: string;
  body: string;
  /** A shared event offers Delete for everyone and Remove someone instead of Delete. */
  shared: boolean;
}

/** The confirmation a delete asks, by name (spec 11.7). */
export function deleteQuestion(event: CalendarEvent, sharedNames: string[]): DeleteQuestion {
  const name = eventName(event);
  const heading = `Delete ${name}?`;
  if (sharedNames.length > 1) {
    return { heading, body: `It's on ${namesList(sharedNames.map(n => `${n}'s`))} calendars.`, shared: true };
  }
  return { heading, body: '', shared: false };
}

/** What a failed delete says: what happened and what to do next. */
export function deleteFailedText(event: CalendarEvent, failedNames: string[], everyone: boolean): string {
  const name = eventName(event);
  if (!everyone || failedNames.length === 0) return `Couldn't delete ${name}. Check that Home Assistant is reachable, then try again.`;
  const whose = failedNames.length === 1 ? `${failedNames[0]}'s calendar` : `${namesList(failedNames.map(n => `${n}'s`))} calendars`;
  return `Couldn't delete ${name} from ${whose}. Try again in a moment.`;
}

/** Bits of a calendar's supported_features (Home Assistant CalendarEntityFeature). */
const CREATE = 1;
const DELETE = 2;
const UPDATE = 4;

/** What PlanaVista can change on a calendar, from its entity's supported_features. Unknown means yes (older data). */
export function calendarCan(features: unknown): { delete: boolean; edit: boolean } {
  if (typeof features !== 'number') return { delete: true, edit: true };
  return {
    delete: (features & DELETE) !== 0,
    edit: (features & UPDATE) !== 0 || ((features & CREATE) !== 0 && (features & DELETE) !== 0),
  };
}

export interface FormFields {
  title: string;
  calendars: Iterable<string>;
  date: string;
  allDay: boolean;
  startTime: string;
  endTime: string;
  spanDays: number;
  endDayOffset: number;
  description: string;
  location: string;
}

/**
 * What the editor's fields say, to tell whether anything changed before a
 * tap outside, Escape, or a drag throws it away. The order people were
 * picked in doesn't matter, and nor do spaces at either end.
 */
export function formSignature(f: FormFields): string {
  return JSON.stringify([
    f.title.trim(),
    [...f.calendars].sort(),
    f.date,
    f.allDay,
    f.allDay ? f.spanDays : [f.startTime, f.endTime, f.endDayOffset],
    f.description.trim(),
    f.location.trim(),
  ]);
}

/** What a failed save says: what happened and what to do next. */
export function saveFailedText(title: string, editing: boolean): string {
  return `Couldn't ${editing ? 'save' : 'add'} ${eventName({ summary: title })}. Check that Home Assistant is reachable, then try again.`;
}

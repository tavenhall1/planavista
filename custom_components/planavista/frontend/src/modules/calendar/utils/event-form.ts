import { CalendarEvent, CreateEventData, DeleteEventData } from '../../../types';
import { calendarDaysBetween, getDateKey, isDateOnly, parseEventDate } from '../../../utils/date-utils';

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
  } else if (next.endDayOffset === 1 && next.endTime > startTime) {
    // The end is already later than the new start on the same clock day, so a
    // leftover next-day offset (e.g. from an earlier 23:xx start) is not needed.
    next.endDayOffset = 0;
  }
  return next;
}

/**
 * Apply a new end time. An end one day out that lands after the start time
 * means the event now finishes on the start day, so the offset drops to 0.
 * Same-day offsets and genuine multi-day offsets (2+) are left alone.
 */
export function withEndTime(f: EventFormDates, endTime: string): EventFormDates {
  const next: EventFormDates = { ...f, endTime };
  if (f.endDayOffset === 1 && endTime > f.startTime) next.endDayOffset = 0;
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

// ---------------------------------------------------------------------------
// Editing = delete + recreate
// ---------------------------------------------------------------------------

/**
 * Delete payload for one calendar's copy of an event. A recurring instance
 * carries its recurrence_id (and never a recurrence_range), so only that
 * instance is removed, never the whole series.
 */
export function buildDeleteData(
  event: Pick<CalendarEvent, 'calendar_entity_id' | 'uid' | 'recurrence_id'>,
  entityId: string = event.calendar_entity_id,
): DeleteEventData {
  if (!event.uid) {
    throw new Error('This event has no unique ID, so it can only be changed in its calendar app.');
  }
  const data: DeleteEventData = { entity_id: entityId, uid: event.uid };
  if (event.recurrence_id) data.recurrence_id = event.recurrence_id;
  return data;
}

/**
 * Create payload that puts an event back exactly as the backend reported it
 * (date-only all-day dates with their exclusive end, or the original ISO
 * datetimes). A restored recurring instance comes back as a single event.
 */
export function buildRestoreData(event: CalendarEvent, entityId: string = event.calendar_entity_id): CreateEventData {
  const data: CreateEventData = isDateOnly(event.start)
    ? { entity_id: entityId, summary: event.summary, start_date: event.start, end_date: event.end }
    : { entity_id: entityId, summary: event.summary, start_date_time: event.start, end_date_time: event.end };
  if (event.description) data.description = event.description;
  if (event.location) data.location = event.location;
  return data;
}

/** The three payloads an edit needs. */
export interface EditPlan {
  deleteData: DeleteEventData;
  createData: CreateEventData;
  restoreData: CreateEventData;
}

/** Plan editing `original` on one calendar: delete it, create `base`, restore on failure. */
export function planEdit(
  original: CalendarEvent,
  entityId: string,
  base: Omit<CreateEventData, 'entity_id'>,
): EditPlan {
  return {
    deleteData: buildDeleteData(original, entityId),
    createData: { ...base, entity_id: entityId },
    restoreData: buildRestoreData(original, entityId),
  };
}

/** Thrown when an edit failed after the delete; the message says whether the original came back. */
export class EditRestoreError extends Error {
  constructor(message: string, readonly restored: boolean) {
    super(message);
    this.name = 'EditRestoreError';
  }
}

function errorText(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (err && typeof err === 'object' && 'message' in err) return String((err as { message: unknown }).message);
  return String(err);
}

/**
 * Run delete -> create. If create fails after the delete succeeded, run
 * restore and throw an EditRestoreError saying whether the original came back.
 * A failed delete is rethrown before anything is created.
 */
export async function runEditWithRestore(steps: {
  remove: () => Promise<unknown>;
  create: () => Promise<unknown>;
  restore: () => Promise<unknown>;
}): Promise<void> {
  await steps.remove();
  try {
    await steps.create();
  } catch (createErr) {
    const reason = errorText(createErr);
    try {
      await steps.restore();
    } catch (restoreErr) {
      throw new EditRestoreError(
        `Your changes couldn't be saved (${reason}), and the original event couldn't be put back ` +
        `(${errorText(restoreErr)}). Please re-create it in your calendar app.`,
        false,
      );
    }
    throw new EditRestoreError(`Your changes couldn't be saved (${reason}). The original event was restored.`, true);
  }
}

import type { CalendarEvent, PlanaVistaCardConfig, PlanaVistaData } from '../../types';
import { selectCalendars } from '../../core/calendars';
import type { Member } from '../../core/household';
import { isDateOnly, parseEventDate } from '../../utils/date-utils';

/** A timed event of today, as the chores screens use it (spec 13.9). */
export interface DayEvent {
  title: string;
  start: Date;
  end: Date;
  calendar: string;
  /** Whose calendar it is, when it belongs to someone. */
  member: string | null;
}

/** "5:30" (12-hour) or "17:30" (24-hour); "4:45 PM" with `ampm`. */
export function clockTime(date: Date, format: '12h' | '24h' = '12h', ampm = false): string {
  const minutes = String(date.getMinutes()).padStart(2, '0');
  if (format === '24h') return `${date.getHours()}:${minutes}`;
  const hour = date.getHours() % 12 || 12;
  return ampm ? `${hour}:${minutes} ${date.getHours() >= 12 ? 'PM' : 'AM'}` : `${hour}:${minutes}`;
}

/**
 * Today's timed events (all-day ones are left out), soonest first, with whose calendar each is;
 * only from the calendars this card shows, as the calendar module does.
 */
export function eventsOn(
  data: PlanaVistaData | null, dayStart: Date, dayEnd: Date, config?: PlanaVistaCardConfig,
): DayEvent[] {
  if (!data) return [];
  const shown = selectCalendars(data, config);
  const owners = new Map(shown.map(cal => [cal.entity_id, cal.member_id ?? null]));
  const found: DayEvent[] = [];
  for (const event of data.events ?? []) {
    if (!owners.has(event.calendar_entity_id)) continue;
    if (!event.start || isDateOnly(event.start)) continue;
    const start = parseEventDate(event.start);
    const end = event.end ? parseEventDate(event.end) : start;
    if (end <= dayStart || start >= dayEnd) continue;
    found.push({
      title: event.summary || 'Busy',
      start,
      end,
      calendar: event.calendar_entity_id,
      member: owners.get(event.calendar_entity_id) ?? null,
    });
  }
  return found.sort((a, b) => a.start.getTime() - b.start.getTime());
}

/** A person's own events of today (from the calendars that belong to them). */
export function eventsOf(events: DayEvent[], memberId: string): DayEvent[] {
  return events.filter(event => event.member === memberId);
}

export interface NextUp {
  event: DayEvent;
  /** Nothing else on their calendar before it, for at least an hour. */
  freeUntil: boolean;
}

/** Someone's next event still to start today, and whether they are free until then (spec 13.1). */
export function nextOnCalendar(events: DayEvent[], memberId: string, now: Date): NextUp | null {
  const mine = eventsOf(events, memberId);
  const next = mine.find(event => event.start > now);
  if (!next) return null;
  const busyNow = mine.some(event => event.start <= now && event.end > now);
  return { event: next, freeUntil: !busyNow && next.start.getTime() - now.getTime() >= 60 * 60 * 1000 };
}

/** The household's next event today ("Next: Dentist at 4:45 · Alex"), for the header. */
export function nextForHousehold(
  events: DayEvent[],
  members: Member[],
  now: Date,
  format: '12h' | '24h',
  calendarName: (entityId: string) => string | null,
): { title: string; time: string; who: string | null } | null {
  const next = events.find(event => event.start > now);
  if (!next) return null;
  const owner = next.member ? members.find(m => m.id === next.member)?.name ?? null : null;
  return { title: next.title, time: clockTime(next.start, format), who: owner ?? calendarName(next.calendar) };
}

/** The display name of a calendar, for an event that belongs to no one. */
export function calendarNameOf(data: PlanaVistaData | null, entityId: string): string | null {
  return data?.calendars?.find(cal => cal.entity_id === entityId)?.display_name ?? null;
}

export type { CalendarEvent };

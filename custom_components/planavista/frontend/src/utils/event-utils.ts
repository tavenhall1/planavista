import { CalendarEvent, CalendarConfig } from '../types';
import { getDateKey } from './date-utils';

/**
 * Check if an event is all-day.
 */
export function isAllDayEvent(event: CalendarEvent): boolean {
  // All-day events typically have date-only strings (no 'T') or midnight-to-midnight
  const start = event.start;
  const end = event.end;
  if (!start.includes('T') && !end.includes('T')) return true;
  const s = new Date(start);
  const e = new Date(end);
  return s.getHours() === 0 && s.getMinutes() === 0 && e.getHours() === 0 && e.getMinutes() === 0 && e.getTime() - s.getTime() >= 86400000;
}

/**
 * Check if an event spans multiple days.
 */
export function isMultiDayEvent(event: CalendarEvent): boolean {
  const s = new Date(event.start);
  const e = new Date(event.end);
  return s.toDateString() !== e.toDateString();
}

/**
 * Group events by date key.
 */
export function groupEventsByDate(events: CalendarEvent[]): Map<string, CalendarEvent[]> {
  const groups = new Map<string, CalendarEvent[]>();
  for (const event of events) {
    const start = new Date(event.start);
    const end = new Date(event.end);
    // For multi-day events, add to each day
    const current = new Date(start);
    current.setHours(0, 0, 0, 0);
    const endDay = new Date(end);
    endDay.setHours(0, 0, 0, 0);

    while (current <= endDay) {
      const key = getDateKey(current);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(event);
      current.setDate(current.getDate() + 1);
    }
  }
  // Sort events within each group
  for (const [, groupEvents] of groups) {
    groupEvents.sort((a, b) => {
      const aAllDay = isAllDayEvent(a);
      const bAllDay = isAllDayEvent(b);
      if (aAllDay && !bAllDay) return -1;
      if (!aAllDay && bAllDay) return 1;
      return new Date(a.start).getTime() - new Date(b.start).getTime();
    });
  }
  return groups;
}

/**
 * Group events by person entity for day view columns.
 */
export function groupEventsByPerson(
  events: CalendarEvent[],
  calendars: CalendarConfig[]
): Map<string, CalendarEvent[]> {
  const groups = new Map<string, CalendarEvent[]>();
  const calMap = new Map(calendars.map(c => [c.entity_id, c]));

  // Initialize groups for each calendar with a person
  for (const cal of calendars) {
    if (cal.visible !== false) {
      const key = cal.person_entity || cal.entity_id;
      if (!groups.has(key)) groups.set(key, []);
    }
  }

  for (const event of events) {
    const cal = calMap.get(event.calendar_entity_id);
    const key = cal?.person_entity || event.calendar_entity_id;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(event);
  }

  return groups;
}

/**
 * Filter events in a date range.
 */
export function getEventsForDateRange(
  events: CalendarEvent[],
  start: Date,
  end: Date
): CalendarEvent[] {
  return events.filter(event => {
    const eventStart = new Date(event.start);
    const eventEnd = new Date(event.end);
    return eventStart < end && eventEnd > start;
  });
}

/**
 * Calculate event position as percentages for time-grid views.
 * Returns top (%) and height (%) relative to the day grid.
 */
export function getEventPosition(
  event: CalendarEvent,
  dayStartHour: number = 0,
  dayEndHour: number = 24
): { top: number; height: number } {
  const start = new Date(event.start);
  const end = new Date(event.end);
  const totalMinutes = (dayEndHour - dayStartHour) * 60;
  const startMinutes = Math.max(0, (start.getHours() - dayStartHour) * 60 + start.getMinutes());
  const endMinutes = Math.min(totalMinutes, (end.getHours() - dayStartHour) * 60 + end.getMinutes());
  const durationMinutes = Math.max(endMinutes - startMinutes, 15); // minimum 15 min visual height

  return {
    top: (startMinutes / totalMinutes) * 100,
    height: (durationMinutes / totalMinutes) * 100,
  };
}

/**
 * Detect overlapping events and assign columns.
 * Returns events with column and totalColumns properties.
 */
export function detectOverlaps(events: CalendarEvent[]): Array<CalendarEvent & { column: number; totalColumns: number }> {
  const timed = events.filter(e => !isAllDayEvent(e)).sort(
    (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
  );

  const result: Array<CalendarEvent & { column: number; totalColumns: number }> = [];
  const columns: Array<{ end: number }> = [];

  for (const event of timed) {
    const eventStart = new Date(event.start).getTime();
    const eventEnd = new Date(event.end).getTime();

    // Find a column where this event fits (no overlap)
    let placed = false;
    for (let i = 0; i < columns.length; i++) {
      if (eventStart >= columns[i].end) {
        columns[i].end = eventEnd;
        result.push({ ...event, column: i, totalColumns: 0 });
        placed = true;
        break;
      }
    }

    if (!placed) {
      columns.push({ end: eventEnd });
      result.push({ ...event, column: columns.length - 1, totalColumns: 0 });
    }
  }

  // Update totalColumns for overlapping groups
  // Simple approach: find max column used
  const maxCol = columns.length;
  for (const event of result) {
    event.totalColumns = maxCol;
  }

  return result;
}

/**
 * Filter visible events based on hidden calendars.
 */
export function filterVisibleEvents(
  events: CalendarEvent[],
  hiddenCalendars: Set<string>
): CalendarEvent[] {
  return events.filter(e => !hiddenCalendars.has(e.calendar_entity_id));
}

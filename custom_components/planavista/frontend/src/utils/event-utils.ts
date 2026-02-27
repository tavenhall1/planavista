import { CalendarEvent, CalendarConfig } from '../types';
import { getDateKey } from './date-utils';

export interface SharedEvent extends CalendarEvent {
  shared_calendars: Array<{
    entity_id: string;
    color: string;
    color_light: string;
    person_entity: string;
    display_name: string;
  }>;
}

export function deduplicateSharedEvents(
  events: CalendarEvent[],
  calendars: CalendarConfig[]
): SharedEvent[] {
  const calMap = new Map(calendars.map(c => [c.entity_id, c]));
  const eventMap = new Map<string, SharedEvent>();

  for (const event of events) {
    // Key: summary + start + end (normalized)
    const key = `${event.summary}|${event.start}|${event.end}`;

    if (eventMap.has(key)) {
      // Add this calendar as a participant
      const existing = eventMap.get(key)!;
      const cal = calMap.get(event.calendar_entity_id);
      if (cal) {
        existing.shared_calendars.push({
          entity_id: cal.entity_id,
          color: cal.color,
          color_light: cal.color_light,
          person_entity: cal.person_entity,
          display_name: cal.display_name,
        });
      }
    } else {
      // First occurrence
      const cal = calMap.get(event.calendar_entity_id);
      eventMap.set(key, {
        ...event,
        shared_calendars: cal ? [{
          entity_id: cal.entity_id,
          color: cal.color,
          color_light: cal.color_light,
          person_entity: cal.person_entity,
          display_name: cal.display_name,
        }] : [],
      });
    }
  }

  return Array.from(eventMap.values());
}

/**
 * Check if an event has already ended.
 */
export function isEventPast(event: CalendarEvent): boolean {
  return new Date(event.end) < new Date();
}

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

    // All-day events use exclusive end dates (CalDAV/iCal spec):
    // A single all-day event on Feb 24 has end = Feb 25.
    // Use < instead of <= for all-day to avoid double-counting.
    const allDay = isAllDayEvent(event);

    while (allDay ? current < endDay : current <= endDay) {
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
 * `viewDate` is required to correctly clamp multi-day/overnight events to the visible day.
 */
export function getEventPosition(
  event: CalendarEvent,
  dayStartHour: number = 0,
  dayEndHour: number = 24,
  viewDate?: Date
): { top: number; height: number } {
  const start = new Date(event.start);
  const end = new Date(event.end);
  const totalMinutes = (dayEndHour - dayStartHour) * 60;

  // Clamp start/end to the visible day boundaries for overnight/multi-day events
  let startMins: number;
  let endMins: number;

  if (viewDate) {
    const dayStart = new Date(viewDate);
    dayStart.setHours(dayStartHour, 0, 0, 0);
    const dayEnd = new Date(viewDate);
    dayEnd.setHours(dayEndHour, 0, 0, 0);

    const clampedStart = start < dayStart ? dayStart : start;
    const clampedEnd = end > dayEnd ? dayEnd : end;

    startMins = (clampedStart.getHours() - dayStartHour) * 60 + clampedStart.getMinutes();
    endMins = (clampedEnd.getHours() - dayStartHour) * 60 + clampedEnd.getMinutes();
  } else {
    startMins = Math.max(0, (start.getHours() - dayStartHour) * 60 + start.getMinutes());
    endMins = Math.min(totalMinutes, (end.getHours() - dayStartHour) * 60 + end.getMinutes());
    // Handle overnight: if end is on a different day and endMins would be small, extend to dayEnd
    if (end.toDateString() !== start.toDateString() && endMins <= 0) {
      endMins = totalMinutes;
    }
  }

  startMins = Math.max(0, Math.min(startMins, totalMinutes));
  endMins = Math.max(0, Math.min(endMins, totalMinutes));
  const durationMinutes = Math.max(endMins - startMins, 15); // minimum 15 min visual height

  return {
    top: (startMins / totalMinutes) * 100,
    height: (durationMinutes / totalMinutes) * 100,
  };
}

/**
 * Detect overlapping events and assign columns per overlap cluster.
 * Events that don't overlap each other get full width (totalColumns=1).
 * Returns events with column and totalColumns properties.
 */
export function detectOverlaps(events: CalendarEvent[]): Array<CalendarEvent & { column: number; totalColumns: number }> {
  const timed = events.filter(e => !isAllDayEvent(e)).sort(
    (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
  );

  if (timed.length === 0) return [];

  // Build overlap clusters: groups of events that transitively overlap
  type EventInfo = { event: CalendarEvent; start: number; end: number; column: number; cluster: number };
  const infos: EventInfo[] = timed.map(e => ({
    event: e,
    start: new Date(e.start).getTime(),
    end: new Date(e.end).getTime(),
    column: 0,
    cluster: 0,
  }));

  // Assign columns within clusters using a greedy algorithm
  let clusterIdx = 0;
  let clusterStart = 0;

  for (let i = 0; i < infos.length; i++) {
    // Check if this event overlaps with any event in the current cluster
    let overlapsCluster = false;
    for (let j = clusterStart; j < i; j++) {
      if (infos[i].start < infos[j].end) {
        overlapsCluster = true;
        break;
      }
    }

    if (!overlapsCluster && i > clusterStart) {
      // Finalize previous cluster
      const clusterEnd = i;
      let maxCol = 0;
      for (let j = clusterStart; j < clusterEnd; j++) {
        maxCol = Math.max(maxCol, infos[j].column + 1);
      }
      for (let j = clusterStart; j < clusterEnd; j++) {
        infos[j].cluster = clusterIdx;
      }
      clusterIdx++;
      clusterStart = i;
    }

    // Assign column: find the first column not occupied by an overlapping event
    const occupiedCols = new Set<number>();
    for (let j = clusterStart; j < i; j++) {
      if (infos[i].start < infos[j].end) {
        occupiedCols.add(infos[j].column);
      }
    }
    let col = 0;
    while (occupiedCols.has(col)) col++;
    infos[i].column = col;
  }

  // Finalize last cluster
  infos.forEach((info, idx) => {
    if (idx >= clusterStart) info.cluster = clusterIdx;
  });

  // Calculate totalColumns per cluster
  const clusterMaxCols = new Map<number, number>();
  for (const info of infos) {
    const current = clusterMaxCols.get(info.cluster) || 0;
    clusterMaxCols.set(info.cluster, Math.max(current, info.column + 1));
  }

  return infos.map(info => ({
    ...info.event,
    column: info.column,
    totalColumns: clusterMaxCols.get(info.cluster) || 1,
  }));
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

/**
 * Build a CSS linear-gradient for multi-participant diagonal stripes.
 * One stripe per participant — organizer (first) gets a larger band.
 * Uses each participant's color_light for soft pastel bands.
 */
export function buildStripeGradient(
  sharedCalendars: SharedEvent['shared_calendars']
): string {
  const n = sharedCalendars.length;
  if (n <= 1) return '';

  // Organizer (first entry) gets a larger share of the stripe
  const organizerPct = n === 2 ? 60 : Math.min(50, Math.round(100 / n * 1.5));
  const otherPct = (100 - organizerPct) / (n - 1);

  const stops: string[] = [];
  let pos = 0;
  sharedCalendars.forEach((cal, i) => {
    const color = cal.color_light || cal.color;
    const width = i === 0 ? organizerPct : otherPct;
    stops.push(`${color} ${pos}%`);
    pos += width;
    stops.push(`${color} ${pos}%`);
  });
  return `linear-gradient(135deg, ${stops.join(', ')})`;
}

/**
 * Resolve the "organizer" calendar for an event.
 * 1. Try event.organizer field, match to a calendar config
 * 2. Fallback: first calendar in user's ordered list that appears in shared_calendars
 */
export function getOrganizerCalendar(
  event: SharedEvent,
  calendars: CalendarConfig[]
): SharedEvent['shared_calendars'][0] | undefined {
  // Try organizer field
  if ((event as any).organizer) {
    const orgMatch = event.shared_calendars.find(sc =>
      sc.display_name?.toLowerCase() === (event as any).organizer?.toLowerCase() ||
      sc.entity_id === (event as any).organizer
    );
    if (orgMatch) return orgMatch;
  }
  // Fallback: first calendar in user's ordered config list
  for (const cal of calendars) {
    const match = event.shared_calendars.find(sc => sc.entity_id === cal.entity_id);
    if (match) return match;
  }
  return event.shared_calendars[0];
}

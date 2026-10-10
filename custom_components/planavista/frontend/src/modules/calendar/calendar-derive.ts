import type { CalendarConfig, CalendarEvent, PlanaVistaCardConfig, PlanaVistaData, ViewType } from '../../types';
import { filterVisibleEvents } from '../../utils/event-utils';

/** A calendar that shares an event (same UID), for Day-view participant avatars. */
export interface SharedParticipant {
  entity_id: string;
  calendar_name: string;
  calendar_color: string;
  person_entity: string;
}

/** What the calendar views need from the PlanaVista data. */
export interface CalendarDerived {
  calendars: CalendarConfig[];
  visibleEvents: CalendarEvent[];
  sharedEventMap: Map<string, SharedParticipant[]>;
}

/** Calendars this card shows: visible in Settings, narrowed by the card's `calendars` list. */
export function selectCalendars(data: PlanaVistaData | null, config: PlanaVistaCardConfig | undefined): CalendarConfig[] {
  const all = (data?.calendars || []).filter(c => c.visible !== false);
  const cardFilter = config?.calendars;
  return Array.isArray(cardFilter) && cardFilter.length > 0
    ? all.filter(c => cardFilter.includes(c.entity_id))
    : all;
}

/** The calendars, the events the filter leaves visible, and the shared-event map. */
export function deriveCalendarData(
  data: PlanaVistaData | null,
  config: PlanaVistaCardConfig | undefined,
  hidden: Set<string>,
): CalendarDerived {
  const calendars = selectCalendars(data, config);
  const events = data?.events || [];

  // Group all events by UID to find shared events (Day-view participant avatars).
  const sharedEventMap = new Map<string, SharedParticipant[]>();
  for (const ev of events) {
    const uid = ev.uid;
    if (!uid) continue;
    if (!sharedEventMap.has(uid)) sharedEventMap.set(uid, []);
    const arr = sharedEventMap.get(uid)!;
    const eid = ev.calendar_entity_id;
    // Deduplicate by calendar entity (recurring events share UIDs)
    if (!arr.some(p => p.entity_id === eid)) {
      const cal = calendars.find(c => c.entity_id === eid);
      arr.push({
        entity_id: eid,
        calendar_name: ev.calendar_name || cal?.display_name || '',
        calendar_color: ev.calendar_color || cal?.color || '',
        person_entity: cal?.person_entity || '',
      });
    }
  }

  return { calendars, visibleEvents: filterVisibleEvents(events, hidden), sharedEventMap };
}

/** People whose avatars the calendar shows; their state changes re-render it. */
export function calendarWatchedEntities(calendars: CalendarConfig[]): string[] {
  return calendars.map(c => c.person_entity).filter(id => !!id);
}

/** The view a card opens on: its `view` or `default_view`, else the saved default view. */
export function initialView(config: PlanaVistaCardConfig | undefined, data: PlanaVistaData | null): ViewType | undefined {
  return config?.view || config?.default_view || data?.display?.default_view || undefined;
}

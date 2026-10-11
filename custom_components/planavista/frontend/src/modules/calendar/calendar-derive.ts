import type { CalendarConfig, CalendarEvent, PlanaVistaCardConfig, PlanaVistaData, ViewType } from '../../types';
import { selectCalendars } from '../../core/calendars';
import { filterVisibleEvents } from './utils/event-utils';

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

export { selectCalendars };

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
/** One person on an event, as the event popup reads them. */
export interface PopupParticipant {
  entity_id: string;
  calendar_name: string;
  calendar_color: string;
}

/** A calendar a view merged into one chip (deduplicateSharedEvents' shape). */
interface MergedParticipant {
  entity_id: string;
  display_name?: string;
  color?: string;
  calendar_name?: string;
  calendar_color?: string;
}

/**
 * The event the popup opens with, its people always in the shape the popup
 * reads. A shared event (the same uid on several calendars) lists each
 * calendar once; the clicked copy stays the main event (HA doesn't expose
 * who organized it). A chip a view merged (the same title and times on
 * several calendars, each copy with its own uid) lists the calendars it
 * was merged from.
 */
export function eventForPopup(clicked: CalendarEvent, allEvents: CalendarEvent[]): CalendarEvent {
  if (clicked.uid) {
    const siblings = allEvents.filter(ev => ev.uid === clicked.uid && ev.uid !== '');
    // Recurring events share one uid across instances: one chip per calendar.
    const seen = new Set<string>();
    const unique = siblings.filter(s => {
      if (seen.has(s.calendar_entity_id)) return false;
      seen.add(s.calendar_entity_id);
      return true;
    });
    if (unique.length > 1) {
      const shared: PopupParticipant[] = unique.map(s => ({
        entity_id: s.calendar_entity_id,
        calendar_name: s.calendar_name,
        calendar_color: s.calendar_color,
      }));
      return { ...clicked, shared_calendars: shared } as CalendarEvent;
    }
  }
  const merged = (clicked as { shared_calendars?: MergedParticipant[] }).shared_calendars;
  if (merged?.length) {
    const shared: PopupParticipant[] = merged.map(p => ({
      entity_id: p.entity_id,
      calendar_name: p.calendar_name ?? p.display_name ?? '',
      calendar_color: p.calendar_color ?? p.color ?? clicked.calendar_color,
    }));
    return { ...clicked, shared_calendars: shared } as CalendarEvent;
  }
  return clicked;
}

export function calendarWatchedEntities(calendars: CalendarConfig[]): string[] {
  return calendars.map(c => c.person_entity).filter(id => !!id);
}

/** The view a card opens on: its `view` or `default_view`, else the saved default view. */
export function initialView(config: PlanaVistaCardConfig | undefined, data: PlanaVistaData | null): ViewType | undefined {
  return config?.view || config?.default_view || data?.display?.default_view || undefined;
}

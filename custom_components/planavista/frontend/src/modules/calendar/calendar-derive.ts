import type { CalendarConfig, CalendarEvent, PlanaVistaCardConfig, PlanaVistaData, ViewType } from '../../types';
import { selectCalendars } from '../../core/calendars';
import { filterVisibleEvents, sameEventKey } from './utils/event-utils';

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

export { sameEventKey, selectCalendars };

/** The calendars, the events the filter leaves visible, and the shared-event map. */
export function deriveCalendarData(
  data: PlanaVistaData | null,
  config: PlanaVistaCardConfig | undefined,
  hidden: Set<string>,
): CalendarDerived {
  const calendars = selectCalendars(data, config);
  const events = data?.events || [];

  // The copies of one event on several calendars, by the same key every view merges by (Day-view participant avatars).
  const sharedEventMap = new Map<string, SharedParticipant[]>();
  for (const ev of events) {
    const key = sameEventKey(ev);
    if (!sharedEventMap.has(key)) sharedEventMap.set(key, []);
    const arr = sharedEventMap.get(key)!;
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
  /** This person's own copy of the event, for deleting or editing it there. */
  uid?: string;
  recurrence_id?: string;
}

/** A calendar a view merged into one chip (deduplicateSharedEvents' shape). */
interface MergedParticipant {
  entity_id: string;
  display_name?: string;
  color?: string;
  calendar_name?: string;
  calendar_color?: string;
  uid?: string;
  recurrence_id?: string;
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
        uid: s.uid,
        recurrence_id: s.recurrence_id,
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
      uid: p.uid,
      recurrence_id: p.recurrence_id,
    }));
    return { ...clicked, shared_calendars: shared } as CalendarEvent;
  }
  // Day draws each copy in its person's lane: the others are found as Week merges them.
  const key = sameEventKey(clicked);
  const copies = onePerCalendar(allEvents.filter(ev => sameEventKey(ev) === key));
  if (copies.length > 1) {
    const shared: PopupParticipant[] = copies.map(s => ({
      entity_id: s.calendar_entity_id,
      calendar_name: s.calendar_name,
      calendar_color: s.calendar_color,
      uid: s.uid,
      recurrence_id: s.recurrence_id,
    }));
    return { ...clicked, shared_calendars: shared } as CalendarEvent;
  }
  return clicked;
}

function onePerCalendar(events: CalendarEvent[]): CalendarEvent[] {
  const seen = new Set<string>();
  return events.filter(ev => {
    if (seen.has(ev.calendar_entity_id)) return false;
    seen.add(ev.calendar_entity_id);
    return true;
  });
}

/** The copies of each event together, in the order the events first appear (Day's all-day row: one pill per event). */
export function groupSameEvents(events: readonly CalendarEvent[]): CalendarEvent[][] {
  const groups = new Map<string, CalendarEvent[]>();
  for (const ev of events) {
    const key = sameEventKey(ev);
    const group = groups.get(key);
    if (group) group.push(ev);
    else groups.set(key, [ev]);
  }
  return [...groups.values()];
}

export function calendarWatchedEntities(calendars: CalendarConfig[]): string[] {
  return calendars.map(c => c.person_entity).filter(id => !!id);
}

/** The view a card opens on: its `view` or `default_view`, else the saved default view. */
export function initialView(config: PlanaVistaCardConfig | undefined, data: PlanaVistaData | null): ViewType | undefined {
  return config?.view || config?.default_view || data?.display?.default_view || undefined;
}

/**
 * Whose calendars an event is on (milestone 8, D1), once each: a member id,
 * or null for a calendar that belongs to nobody (or that PlanaVista no
 * longer shows).
 */
export function ownersOf(calendarIds: readonly string[], rows: readonly CalendarConfig[]): (string | null)[] {
  const owners: (string | null)[] = [];
  for (const id of calendarIds) {
    const owner = rows.find(row => row.entity_id === id)?.member_id ?? null;
    if (!owners.includes(owner)) owners.push(owner);
  }
  return owners;
}

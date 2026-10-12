import { describe, expect, it } from 'vitest';
import {
  calendarWatchedEntities, deriveCalendarData, eventForPopup, initialView, ownersOf, selectCalendars,
} from '../src/modules/calendar/calendar-derive';
import type { CalendarConfig, CalendarEvent, DisplayConfig, PlanaVistaCardConfig, PlanaVistaData } from '../src/types';

const cal = (entity_id: string, person_entity = '', visible = true): CalendarConfig => ({
  entity_id, display_name: entity_id.split('.')[1], color: '#F94144', color_light: '#FDBDBE',
  icon: 'mdi:calendar', person_entity, visible,
});
const ev = (calendar_entity_id: string, uid?: string): CalendarEvent => ({
  summary: 'Dinner', start: '2026-10-13T18:00:00-05:00', end: '2026-10-13T19:00:00-05:00', uid,
  calendar_entity_id, calendar_name: calendar_entity_id.split('.')[1], calendar_color: '#F94144', calendar_color_light: '#FDBDBE',
});
const data = (calendars: CalendarConfig[], events: CalendarEvent[] = [], display: Partial<DisplayConfig> = {}): PlanaVistaData => ({
  calendars, events,
  display: { time_format: '12h', weather_entity: '', first_day: 'sunday', default_view: 'week', theme: 'light', ...display },
});
const card = (extra: Partial<PlanaVistaCardConfig> = {}): PlanaVistaCardConfig => ({ type: 'custom:planavista-card', ...extra });

describe('selectCalendars', () => {
  const all = [cal('calendar.test_alex', 'person.alex'), cal('calendar.test_blair'), cal('calendar.test_casey', 'person.casey', false)];

  it('leaves out calendars hidden in Settings', () => {
    expect(selectCalendars(data(all), card()).map(c => c.entity_id)).toEqual(['calendar.test_alex', 'calendar.test_blair']);
  });

  it('narrows to the card\'s calendars list, and an empty list shows them all', () => {
    expect(selectCalendars(data(all), card({ calendars: ['calendar.test_blair'] })).map(c => c.entity_id)).toEqual(['calendar.test_blair']);
    expect(selectCalendars(data(all), card({ calendars: [] })).map(c => c.entity_id)).toEqual(['calendar.test_alex', 'calendar.test_blair']);
  });

  it('returns nothing before data arrives', () => {
    expect(selectCalendars(null, card())).toEqual([]);
  });
});

describe('deriveCalendarData', () => {
  it('drops events from calendars the filter hides', () => {
    const d = data([cal('calendar.test_alex'), cal('calendar.test_blair')], [ev('calendar.test_alex', 'a'), ev('calendar.test_blair', 'b')]);
    expect(deriveCalendarData(d, card(), new Set(['calendar.test_blair'])).visibleEvents.map(e => e.uid)).toEqual(['a']);
  });

  it('groups shared events by uid, once per calendar, and skips events without a uid', () => {
    const d = data([cal('calendar.test_alex', 'person.alex'), cal('calendar.test_blair')], [
      ev('calendar.test_alex', 'dinner'), ev('calendar.test_blair', 'dinner'), ev('calendar.test_alex', 'dinner'), ev('calendar.test_alex'),
    ]);
    const map = deriveCalendarData(d, card(), new Set()).sharedEventMap;
    expect([...map.keys()]).toEqual(['dinner']);
    expect(map.get('dinner')!.map(p => [p.entity_id, p.person_entity])).toEqual([
      ['calendar.test_alex', 'person.alex'], ['calendar.test_blair', ''],
    ]);
  });
});

describe('calendarWatchedEntities', () => {
  it('lists the people linked to the calendars', () => {
    expect(calendarWatchedEntities([cal('calendar.test_alex', 'person.alex'), cal('calendar.test_blair')])).toEqual(['person.alex']);
  });
});

describe('initialView', () => {
  const savedMonth = data([], [], { default_view: 'month' });

  it('prefers the card\'s view, then its default_view, then the saved default view', () => {
    expect(initialView(card({ view: 'day', default_view: 'agenda' }), savedMonth)).toBe('day');
    expect(initialView(card({ default_view: 'agenda' }), savedMonth)).toBe('agenda');
    expect(initialView(card(), savedMonth)).toBe('month');
  });

  it('has no view before data arrives when the card sets none', () => {
    expect(initialView(card(), null)).toBeUndefined();
  });
});

describe('eventForPopup (what the event popup opens with)', () => {
  const people = (event: CalendarEvent) => (event as { shared_calendars?: unknown }).shared_calendars;
  const blair = { entity_id: 'calendar.test_blair', calendar_name: 'test_blair', calendar_color: '#F94144' };
  const casey = { entity_id: 'calendar.test_casey', calendar_name: 'test_casey', calendar_color: '#F94144' };

  it('lists each calendar of a shared event once, in the shape the popup reads', () => {
    const a = ev('calendar.test_blair', 'same');
    const b = ev('calendar.test_casey', 'same');
    expect(people(eventForPopup(a, [a, b, { ...b }]))).toEqual([{ ...blair, uid: 'same' }, { ...casey, uid: 'same' }]);
  });

  it('gives a merged chip (one entry on two calendars with separate ids) its people in that shape too', () => {
    const merged = {
      ...ev('calendar.test_blair', 'one'),
      shared_calendars: [
        { entity_id: 'calendar.test_blair', color: '#F94144', color_light: '#FDBDBE', person_entity: '', display_name: 'test_blair', uid: 'one' },
        { entity_id: 'calendar.test_casey', color: '#F94144', color_light: '#FDBDBE', person_entity: '', display_name: 'test_casey', uid: 'two' },
      ],
    } as CalendarEvent;
    // Each person's copy keeps its own uid, so a delete for everyone reaches every copy.
    expect(people(eventForPopup(merged, [merged, ev('calendar.test_casey', 'two')]))).toEqual([{ ...blair, uid: 'one' }, { ...casey, uid: 'two' }]);
  });

  it('leaves an event on one calendar as it is', () => {
    const a = ev('calendar.test_blair', 'alone');
    expect(eventForPopup(a, [a])).toBe(a);
  });
});

describe('ownersOf (milestone 8, D1)', () => {
  const rows = [
    { entity_id: 'calendar.alex', member_id: 'alex' },
    { entity_id: 'calendar.alex_work', member_id: 'alex' },
    { entity_id: 'calendar.casey', member_id: 'casey' },
    { entity_id: 'calendar.family', member_id: null },
  ] as CalendarConfig[];

  it('names whose calendars an event is on, once each', () => {
    expect(ownersOf(['calendar.casey'], rows)).toEqual(['casey']);
    expect(ownersOf(['calendar.alex', 'calendar.alex_work'], rows)).toEqual(['alex']);
    expect(ownersOf(['calendar.alex', 'calendar.casey'], rows)).toEqual(['alex', 'casey']);
  });

  it("a calendar that belongs to nobody, or one PlanaVista no longer shows, counts as nobody's", () => {
    expect(ownersOf(['calendar.family'], rows)).toEqual([null]);
    expect(ownersOf(['calendar.gone', 'calendar.casey'], rows)).toEqual([null, 'casey']);
  });
});

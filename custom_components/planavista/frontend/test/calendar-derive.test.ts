import { describe, expect, it } from 'vitest';
import {
  calendarWatchedEntities, deriveCalendarData, initialView, selectCalendars,
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

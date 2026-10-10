import { describe, expect, it } from 'vitest';
import { ModuleRegistry, initialModuleView } from '../src/core/module-registry';
import {
  calendarModule,
  calendarSettingsPages,
  calendarSetupSteps,
  registerCalendarModule,
} from '../src/modules/calendar/definition';
import type { CalendarConfig, PlanaVistaData } from '../src/types';

const cal = (entity_id: string, person_entity = '', visible = true): CalendarConfig => ({
  entity_id, display_name: entity_id.split('.')[1], color: '#F94144', color_light: '#FDBDBE',
  icon: 'mdi:calendar', person_entity, visible,
});
const data: PlanaVistaData = {
  calendars: [cal('calendar.test_alex', 'person.alex'), cal('calendar.test_blair'), cal('calendar.test_casey', 'person.casey', false)],
  events: [],
  display: { time_format: '12h', weather_entity: '', first_day: 'sunday', default_view: 'week', theme: 'light' },
};

describe('the calendar module', () => {
  it('is rendered by pv-calendar-module', () => {
    expect(calendarModule.id).toBe('calendar');
    expect(calendarModule.tag).toBe('pv-calendar-module');
  });

  it('watches the people linked to the calendars this card shows', () => {
    expect(calendarModule.watchedEntities({ config: undefined, data })).toEqual(['person.alex']);
    expect(calendarModule.watchedEntities({ config: { type: 'custom:planavista-card', calendars: ['calendar.test_blair'] }, data })).toEqual([]);
    expect(calendarModule.watchedEntities({ config: undefined, data: null })).toEqual([]);
  });

  it('offers its four views and opens on the one the card or Settings names', () => {
    expect(calendarModule.views.map(v => v.label)).toEqual(['Day', 'Week', 'Month', 'Agenda']);
    expect(initialModuleView(calendarModule, { config: undefined, data })).toBe('week');
    expect(initialModuleView(calendarModule, { config: { type: 'custom:planavista-card', view: 'month' }, data })).toBe('month');
    // As 1.1.0 did with no saved default view.
    expect(initialModuleView(calendarModule, { config: undefined, data: null })).toBe('day');
  });

  it('registers itself', () => {
    const modules = new ModuleRegistry();
    registerCalendarModule(modules);
    expect(modules.list().map(m => m.id)).toEqual(['calendar']);
  });
});

describe('calendar settings pages', () => {
  it('adds Calendars and Calendar options to Settings, and Calendars to setup', () => {
    expect(calendarSettingsPages.map(p => [p.id, p.group, p.tag])).toEqual([
      ['calendars', 'calendar', 'pv-calendar-calendars-page'],
      ['calendar-options', 'calendar', 'pv-calendar-options-page'],
    ]);
    expect(calendarSetupSteps.map(s => s.id)).toEqual(['calendars']);
  });
});

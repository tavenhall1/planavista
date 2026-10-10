import { ModuleDefinition, ModuleRegistry, moduleRegistry } from '../../core/module-registry';
import { calendarWatchedEntities, selectCalendars } from './calendar-derive';

/** The calendar module, as the shell sees it. */
export const calendarModule: ModuleDefinition = {
  id: 'calendar',
  label: 'Calendar',
  icon: 'mdi:calendar-month',
  tag: 'pv-calendar-module',
  order: 10,
  watchedEntities: ({ config, data }) => calendarWatchedEntities(selectCalendars(data, config)),
};

/** Add the calendar to the module registry. */
export function registerCalendarModule(modules: ModuleRegistry = moduleRegistry): void {
  modules.register(calendarModule);
}

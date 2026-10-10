import { ModuleDefinition, ModuleRegistry, moduleRegistry } from '../../core/module-registry';
import { PageRegistry, WizardContext, WizardPage, settingsPages, setupSteps } from '../../core/page-registry';
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

/** The calendar's pages in setup and Settings. */
export const calendarPages: WizardPage<WizardContext>[] = [
  { id: 'preferences', label: 'Preferences', order: 100 },
  { id: 'calendars', label: 'Calendars', order: 200 },
];

/** Add the calendar to the module registry, and its pages to setup and Settings. */
export function registerCalendarModule(
  modules: ModuleRegistry = moduleRegistry,
  steps: PageRegistry<WizardContext> = setupSteps,
  settings: PageRegistry<WizardContext> = settingsPages,
): void {
  modules.register(calendarModule);
  for (const page of calendarPages) {
    steps.register(page);
    settings.register(page);
  }
}

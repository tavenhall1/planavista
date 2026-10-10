import { ModuleDefinition, ModuleRegistry, moduleRegistry } from '../../core/module-registry';
import { PageRegistry } from '../../core/page-registry';
import {
  SettingsContext,
  SettingsPage,
  SetupContext,
  SetupStep,
  settingsRegistry,
  setupRegistry,
} from '../../core/settings-registry';
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

const VIEW_NAMES: Record<string, string> = { day: 'Day', week: 'Week', month: 'Month', agenda: 'Agenda' };

/** The calendar's Settings pages (spec 14.5: Calendars with Belongs to, and Calendar options). */
export const calendarSettingsPages: SettingsPage[] = [
  {
    id: 'calendars',
    label: 'Calendars',
    group: 'calendar',
    order: 300,
    tag: 'pv-calendar-calendars-page',
    summary: ({ data }) => {
      const n = data.calendars?.length ?? 0;
      return n === 0 ? 'None yet' : `${n} ${n === 1 ? 'calendar' : 'calendars'}`;
    },
  },
  {
    id: 'calendar-options',
    label: 'Calendar options',
    group: 'calendar',
    order: 310,
    tag: 'pv-calendar-options-page',
    summary: ({ data }) =>
      `${VIEW_NAMES[data.display?.default_view ?? 'week'] ?? 'Week'} · ${data.display?.time_format === '24h' ? '24-hour' : '12-hour'}`,
  },
];

/** The calendar's setup step. */
export const calendarSetupSteps: SetupStep[] = [
  {
    id: 'calendars',
    label: 'Calendars',
    order: 200,
    tag: 'pv-calendar-calendars-page',
    heading: 'Calendars',
    lead: 'Choose the calendars to show, and who each one belongs to.',
  },
];

/** Add the calendar's Settings pages and setup step. */
export function registerCalendarSettings(
  settings: PageRegistry<SettingsContext, SettingsPage> = settingsRegistry,
  setup: PageRegistry<SetupContext, SetupStep> = setupRegistry,
): void {
  for (const page of calendarSettingsPages) settings.register(page);
  for (const step of calendarSetupSteps) setup.register(step);
}

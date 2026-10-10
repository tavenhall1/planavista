import { describe, expect, it } from 'vitest';
import { PageRegistry } from '../src/core/page-registry';
import {
  SETTINGS_GROUPS,
  SettingsContext,
  SettingsPage,
  SetupContext,
  SetupStep,
  groupPages,
  resumeIndex,
} from '../src/core/settings-registry';
import { registerShellSettings } from '../src/shell/definition';
import { registerCalendarSettings } from '../src/modules/calendar/definition';
import { HouseholdView } from '../src/core/household';
import { PlanaVistaData } from '../src/types';
import { version } from '../package.json';

function context(overrides: Partial<HouseholdView> = {}): SettingsContext {
  const household = {
    available: true,
    members: [{ id: 'alex', parent: true, has_pin: true }, { id: 'dana', parent: false, has_pin: false }],
    account: { kind: 'shared', shared: true, parent_level: false },
    security: { shuffle_keypad: false, shared_screens: 1 },
    modules: {},
    setup: { completed: true, step: null },
    ...overrides,
  } as unknown as HouseholdView;
  const data = {
    calendars: [{ entity_id: 'calendar.test_alex' }, { entity_id: 'calendar.test_blair' }],
    events: [],
    display: { time_format: '12h', weather_entity: '', first_day: 'monday', default_view: 'week', theme: 'dark' },
  } as unknown as PlanaVistaData;
  return { household, data };
}

function registries() {
  const settings = new PageRegistry<SettingsContext, SettingsPage>();
  const setup = new PageRegistry<SetupContext, SetupStep>();
  registerShellSettings(settings, setup);
  registerCalendarSettings(settings, setup);
  return { settings, setup };
}

describe('settings registry', () => {
  it('groups the sidebar in the spec order and drops empty groups', () => {
    const { settings } = registries();
    const groups = groupPages(settings.pages(context()));
    expect(groups.map(g => [g.group.id, g.group.label, g.pages.map(p => p.id)])).toEqual([
      ['people', null, ['people']],
      ['calendar', 'Calendar', ['calendars', 'calendar-options']],
      ['appearance', null, ['appearance']],
      ['security', null, ['pins']],
      ['about', null, ['about']],
    ]);
  });

  it('puts pages of an unknown group at the end', () => {
    const page: SettingsPage = { id: 'lists', label: 'Lists', group: 'lists', order: 1, tag: 'pv-x' };
    const groups = groupPages([page], SETTINGS_GROUPS);
    expect(groups).toEqual([{ group: { id: 'lists', label: null, order: 1000 }, pages: [page] }]);
  });

  it('says what each row is set to', () => {
    const { settings } = registries();
    const ctx = context();
    const summaries = Object.fromEntries(settings.pages(ctx).map(p => [p.id, p.summary?.(ctx)]));
    expect(summaries).toEqual({
      people: '2 people',
      calendars: '2 calendars',
      'calendar-options': 'Week · 12-hour',
      appearance: 'Deep Dark',
      pins: 'Shared screen · 1 PIN',
      about: `Version ${version}`,
    });
    const quiet = context({
      members: [],
      account: { kind: 'admin', shared: false, parent_level: true } as unknown as HouseholdView['account'],
    });
    expect(settings.pages(quiet).find(p => p.id === 'people')?.summary?.(quiet)).toBe('No one yet');
    expect(settings.pages(quiet).find(p => p.id === 'pins')?.summary?.(quiet)).toBe('Not a shared screen');
  });

  it('leaves out People and PINs when there is no household', () => {
    const { settings } = registries();
    const ctx = { household: null, data: context().data };
    expect(settings.pages(ctx).map(p => p.id)).toEqual(['calendars', 'calendar-options', 'appearance', 'about']);
  });

  it('lists the setup steps in order and resumes where setup stopped', () => {
    const { setup } = registries();
    const steps = setup.pages(context());
    expect(steps.map(s => [s.id, s.tag])).toEqual([
      ['welcome', 'pv-setup-welcome'],
      ['people', 'pv-setup-people'],
      ['calendars', 'pv-calendar-calendars-page'],
      ['look', 'pv-setup-look'],
      ['done', 'pv-setup-done'],
    ]);
    expect(resumeIndex(steps, 'calendars')).toBe(2);
    expect(resumeIndex(steps, 'chores')).toBe(0);
    expect(resumeIndex(steps, null)).toBe(0);
  });
});

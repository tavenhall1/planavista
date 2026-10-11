import { describe, expect, it } from 'vitest';
import { PageRegistry } from '../src/core/page-registry';
import type { ModuleService } from '../src/core/module-registry';
import {
  DonePart, SettingsContext, SettingsPage, SetupContext, SetupStep, needsALook, settingsAt,
} from '../src/core/settings-registry';
import { onlySteps } from '../src/core/setup-flow';
import { registerShellSettings, shellSettingsPages } from '../src/shell/definition';
import { CHORES_SETUP_FLOW, choresSettingsPages, registerChoresSettings } from '../src/modules/chores/definition';
import { registerCalendarSettings } from '../src/modules/calendar/definition';
import { IMPORT_EXPORT, choreEditor, editChore } from '../src/modules/chores/settings/targets';
import type { Board, ChoresFeed } from '../src/modules/chores/chores-types';
import type { HouseholdView } from '../src/core/household';
import { activity, board } from './chores-fixtures';

const MEMBERS = [
  { id: 'alex', name: 'Alex', parent: true, has_pin: true },
  { id: 'blair', name: 'Blair', parent: true, has_pin: false },
];

function household(enabled: boolean, start: string | null = null): HouseholdView {
  return {
    available: true, members: MEMBERS, account: { kind: 'admin', shared: false },
    security: { shuffle_keypad: false, shared_screens: 0 }, modules: { chores: { enabled } },
    setup: { completed: true, step: null, start },
  } as unknown as HouseholdView;
}

function context(feed: Partial<ChoresFeed> | null, options: { enabled?: boolean; display?: object; hass?: object } = {}): SettingsContext {
  const full = feed ? { state: 'ok', save_failed: false, board: null, notify_problems: [], ...feed } as ChoresFeed : null;
  const service = { board: () => (full?.state === 'ok' ? full.board : null), feed: full } as unknown as ModuleService;
  return {
    household: household(options.enabled ?? true),
    data: { display: options.display ?? {} } as never,
    services: { chores: service },
    hass: options.hass as never,
  };
}

function pages(ctx: SettingsContext): SettingsPage[] {
  const registry = new PageRegistry<SettingsContext, SettingsPage>();
  registerShellSettings(registry);
  registerCalendarSettings(registry);
  registerChoresSettings(registry);
  return registry.pages(ctx);
}

const WITH_SUN = { states: { 'sun.sun': { state: 'above_horizon', attributes: {} } } };

describe('Needs a look at the top of Settings (spec 15.4)', () => {
  const unassigned: Board = board({}, {
    chores: [activity('wash_the_car', { name: 'Wash the car', assignees: [] })],
    needs_a_look: [{ kind: 'unassigned', chore: 'wash_the_car', name: 'Wash the car' }],
  });

  it('lists a chore no one is assigned to, opening its editor', () => {
    const ctx = context({ board: unassigned }, { hass: WITH_SUN });
    expect(needsALook(pages(ctx), ctx)).toEqual([{
      id: 'unassigned:wash_the_car',
      text: 'No one is assigned to Wash the car. It waits off the board until someone is.',
      page: 'chores',
      stack: [choreEditor({ id: 'wash_the_car', name: 'Wash the car' })],
    }]);
  });

  it('lists chores data that needs a look, opening Import and export', () => {
    const ctx = context({ state: 'needs_a_look' }, { hass: WITH_SUN });
    expect(needsALook(pages(ctx), ctx)).toEqual([{
      id: 'chores-data',
      text: "Some chores data couldn't be read, so the board waits for a parent. Restore a PlanaVista file, or start over.",
      page: 'import-export',
    }]);
  });

  it('lists a phone Home Assistant no longer has, opening that person', () => {
    const ctx = context({ board: board({}), notify_problems: [{ member: 'blair', phone: 'notify.mobile_app_blairs_phone' }] }, { hass: WITH_SUN });
    expect(needsALook(pages(ctx), ctx)).toEqual([{
      id: 'phone:notify.mobile_app_blairs_phone',
      text: "Blair's phone, Blairs phone, isn't in Home Assistant anymore, so nothing is sent to it.",
      page: 'people',
      stack: [{ tag: 'pv-settings-person', title: 'Blair', back: 'People', props: { memberId: 'blair' } }],
    }]);
  });

  it("says when automatic appearance follows the sun but there's no Sun integration", () => {
    const sunny = { appearance: 'automatic', appearance_switch: 'sun' };
    const missing = context(null, { enabled: false, display: sunny, hass: { states: {} } });
    expect(needsALook(pages(missing), missing)).toEqual([{
      id: 'appearance-sun',
      text: "Automatic appearance follows the sun, but Home Assistant's Sun integration isn't set up. The schedule's times are used until it is.",
      page: 'appearance',
    }]);
    const fine = context(null, { enabled: false, display: sunny, hass: WITH_SUN });
    expect(needsALook(pages(fine), fine)).toEqual([]);
    const light = context(null, { enabled: false, display: { appearance: 'light' }, hass: { states: {} } });
    expect(needsALook(pages(light), light)).toEqual([]);
  });

  it('is empty when nothing needs a person', () => {
    const ctx = context({ board: board({}) }, { hass: WITH_SUN });
    expect(needsALook(pages(ctx), ctx)).toEqual([]);
  });
});

describe('opening Settings at a page (the board\'s Edit and Import a plan)', () => {
  const ctx = context({ board: board({}) }, { hass: WITH_SUN });

  it('picks the page and the pages on top of it', () => {
    expect(settingsAt(pages(ctx), editChore({ id: 'laundry', name: 'Laundry' }))).toEqual({
      selected: 'chores',
      stack: [{ tag: 'pv-chore-editor', title: 'Laundry', back: 'Chores', props: { choreId: 'laundry' } }],
    });
    expect(settingsAt(pages(ctx), IMPORT_EXPORT)).toEqual({ selected: 'import-export', stack: [] });
  });

  it('starts at the list for a page that does not apply, or no target', () => {
    const off = context(null, { enabled: false });
    expect(settingsAt(pages(off), editChore({ id: 'laundry', name: 'Laundry' }))).toEqual({ selected: null, stack: [] });
    expect(settingsAt(pages(ctx), null)).toEqual({ selected: null, stack: [] });
  });
});

describe('the Chores row for a calendar-only home (spec 14.7)', () => {
  it('shows Chores, Off, while chores are off, and the Chores list once they are on', () => {
    const off = context(null, { enabled: false });
    const row = pages(off).find(p => p.group === 'chores')!;
    expect(row).toMatchObject({ id: 'chores-off', label: 'Chores', tag: 'pv-chores-off-page' });
    expect(row.summary!(off)).toBe('Off');
    const on = context({ board: board({}) });
    expect(pages(on).map(p => p.id)).not.toContain('chores-off');
    expect(choresSettingsPages.find(p => p.id === 'chores-off')!.applies!({ household: null, data: {} as never })).toBe(false);
  });

  function flow(view: HouseholdView): SetupStep[] {
    const setup = new PageRegistry<SetupContext, SetupStep>();
    registerShellSettings(undefined, setup);
    registerCalendarSettings(undefined, setup);
    registerChoresSettings(undefined, undefined, setup, new PageRegistry<SetupContext, DonePart>());
    return onlySteps(setup.pages({ household: view, data: {} as never }), CHORES_SETUP_FLOW);
  }

  it('runs a short setup: the chores question, then common chores or the plan, then the shared screen', () => {
    expect(flow(household(false)).map(s => s.id)).toEqual(['chores']);
    expect(flow(household(true, 'common')).map(s => s.id)).toEqual(['chores', 'chores-common', 'shared-screen']);
    expect(flow(household(true, 'plan')).map(s => s.id)).toEqual(['chores', 'chores-plan', 'shared-screen']);
    expect(flow(household(true, 'empty')).map(s => s.id)).toEqual(['chores', 'shared-screen']);
  });

  it('ends on the shared screen with Open the board', () => {
    const last = flow(household(true, 'empty')).at(-1)!;
    expect(last).toMatchObject({ id: 'shared-screen', finish: 'Open the board', module: 'chores' });
  });

  it('keeps every step without a list', () => {
    const steps = [{ id: 'a' }, { id: 'b' }] as SetupStep[];
    expect(onlySteps(steps, null)).toBe(steps);
  });
});

describe('the Settings pages', () => {
  it('give every page with Needs a look a page that applies', () => {
    const ids = [...shellSettingsPages, ...choresSettingsPages].filter(p => p.needsALook).map(p => p.id);
    expect(ids).toEqual(['appearance', 'chores', 'reminders']);
  });
});

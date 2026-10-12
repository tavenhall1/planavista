import { describe, expect, it } from 'vitest';
import { PageRegistry } from '../src/core/page-registry';
import type { DonePart, SetupContext, SetupStep } from '../src/core/settings-registry';
import { mergePatch, stepAfter, stepButton, withPatch } from '../src/core/setup-flow';
import { registerShellSettings, shellSetupSteps } from '../src/shell/definition';
import { registerChoresSettings } from '../src/modules/chores/definition';
import { registerCalendarSettings } from '../src/modules/calendar/definition';
import type { HouseholdView } from '../src/core/household';

function view(start: string | null, choresOn: boolean): HouseholdView {
  return {
    available: true, members: [], account: { kind: 'admin', shared: false } as never,
    security: { shuffle_keypad: false, shared_screens: 0 }, modules: { chores: { enabled: choresOn } },
    setup: { completed: false, step: null, start },
  };
}

function steps(household: HouseholdView): string[] {
  const setup = new PageRegistry<SetupContext, SetupStep>();
  registerShellSettings(undefined, setup);
  registerCalendarSettings(undefined, setup);
  registerChoresSettings(undefined, undefined, setup, new PageRegistry<SetupContext, DonePart>());
  return setup.pages({ household, data: {} as never }).map(step => step.id);
}

describe('first-run setup with chores (spec 14.7)', () => {
  it('asks about chores after Calendars, and offers Restore on Welcome', () => {
    expect(steps(view(null, false))).toEqual(['welcome', 'people', 'calendars', 'chores', 'look', 'done']);
    expect(shellSetupSteps[0].secondary).toBe('Restore from a PlanaVista file');
  });

  it('brings in common chores or the plan, and the shared screen once chores are on', () => {
    expect(steps(view('common', true))).toEqual(['welcome', 'people', 'calendars', 'chores', 'chores-common', 'shared-screen', 'look', 'done']);
    expect(steps(view('plan', true))).toEqual(['welcome', 'people', 'calendars', 'chores', 'chores-plan', 'shared-screen', 'look', 'done']);
    expect(steps(view('empty', true))).toEqual(['welcome', 'people', 'calendars', 'chores', 'shared-screen', 'look', 'done']);
  });

  it('goes straight to Look for just the calendar', () => {
    expect(steps(view('calendar', false))).toEqual(['welcome', 'people', 'calendars', 'chores', 'look', 'done']);
  });

  it('restores in one step, then skips the chores question', () => {
    expect(steps(view('restore', false))).toEqual(['welcome', 'restore', 'people', 'calendars', 'look', 'done']);
    expect(steps(view('restore', true))).toEqual(['welcome', 'restore', 'people', 'calendars', 'shared-screen', 'look', 'done']);
  });
});

describe('the setup host\'s patches', () => {
  it('lays what a step changed over the household until its update arrives', () => {
    const patched = withPatch(view(null, false), { setup: { start: 'common' }, modules: { chores: { enabled: true } } })!;
    expect(patched.setup.start).toBe('common');
    expect((patched.modules.chores as { enabled: boolean }).enabled).toBe(true);
    expect(withPatch(null, { setup: { start: 'plan' } })).toBeNull();
    const plain = view('plan', true);
    expect(withPatch(plain, {})).toBe(plain);
  });

  it('merges patches, the later one winning', () => {
    const merged = mergePatch({ setup: { start: 'common' }, modules: { chores: { enabled: true } } },
      { setup: { start: 'calendar' }, modules: { chores: { enabled: false } } });
    expect(merged).toEqual({ setup: { start: 'calendar' }, modules: { chores: { enabled: false } } });
    expect(mergePatch({ setup: { a: 1 } }, undefined)).toEqual({ setup: { a: 1 } });
  });

  it('moves to the step after the one on screen, as the steps stand now', () => {
    const now = [{ id: 'chores' }, { id: 'chores-common' }, { id: 'look' }];
    expect(stepAfter(now, 'chores')).toBe(1);
    expect(stepAfter(now, 'look')).toBeNull();
    expect(stepAfter(now, 'gone')).toBe(1);
  });
});

describe("setup's main button (spec 14.7)", () => {
  const choice = { id: 'chores', primary: 'Continue' };
  const shared = { id: 'shared-screen', primary: 'Continue', finish: 'Open the board' };

  it("uses the step's own element once it's drawn, never the step's before it", () => {
    const common = { step: 'chores-common', primaryLabel: 'Add 8 chores', ready: false };
    expect(stepButton(choice, common, { last: false, short: true })).toEqual({ label: 'Continue', ready: true });
    expect(stepButton({ id: 'chores-common' }, common, { last: false, short: true })).toEqual({ label: 'Add 8 chores', ready: false });
    expect(stepButton(shared, common, { last: true, short: true })).toEqual({ label: 'Open the board', ready: true });
  });

  it("ends a short setup with the step's finish label, and otherwise says Next or Finish", () => {
    expect(stepButton(shared, null, { last: true, short: true }).label).toBe('Open the board');
    expect(stepButton(shared, null, { last: false, short: false }).label).toBe('Continue');
    expect(stepButton({ id: 'look' }, null, { last: false, short: false }).label).toBe('Next');
    expect(stepButton({ id: 'done' }, null, { last: true, short: false }).label).toBe('Finish');
  });
});

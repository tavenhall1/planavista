import { ModuleDefinition, ModuleRegistry, moduleRegistry } from '../../core/module-registry';
import { PageRegistry } from '../../core/page-registry';
import {
  DonePart, PersonSection, SettingsContext, SettingsPage, SetupContext, SetupStep, doneParts, personSections,
  settingsRegistry, setupRegistry,
} from '../../core/settings-registry';
import { ChoresService, choresEnabled } from './chores-service';
import type { Board, ChoresFeed } from './chores-types';
import { choresLooks, phoneLooks } from './settings/looks-derive';
import { remindersSummary } from './settings/reminders-derive';
import { rulesSummary } from './settings/rules-derive';

/** The views the Chores module offers in the bar (spec 12.2). */
export const CHORES_VIEWS = [
  { id: 'board', label: 'Board' },
  { id: 'week', label: 'Week' },
  { id: 'my_day', label: 'My day' },
  { id: 'rewards', label: 'Rewards' },
];

/** The Chores module, as the shell sees it. It shows once the household turns chores on. */
export const choresModule: ModuleDefinition = {
  id: 'chores',
  label: 'Chores',
  icon: 'mdi:checkbox-marked-circle-outline',
  tag: 'pv-chores-module',
  order: 20,
  views: CHORES_VIEWS,
  // Chores arrive over their own subscription, not through entity states.
  watchedEntities: () => [],
  enabled: ctx => choresEnabled(ctx),
  service: host => new ChoresService(host),
};

/** Add Chores to the module registry. */
export function registerChoresModule(modules: ModuleRegistry = moduleRegistry): void {
  modules.register(choresModule);
}

/** Today's chores board as Settings sees it, or null before the feed arrives. */
export function settingsBoard(ctx: Pick<SettingsContext, 'services'>): Board | null {
  return (ctx.services?.chores as ChoresService | undefined)?.board() ?? null;
}

/** The chores feed as it came (its state and phone problems too), or null before it arrives. */
export function settingsFeed(ctx: Pick<SettingsContext, 'services'>): ChoresFeed | null {
  return (ctx.services?.chores as ChoresService | undefined)?.feed ?? null;
}

function count(n: number, one: string, many: string): string {
  return `${n} ${n === 1 ? one : many}`;
}

/**
 * The Chores group of Settings (spec 14.1): Chores, Rewards, Rules, and
 * Reminders while chores are on; while they're off, one Chores row that runs
 * a short version of setup (spec 14.7).
 */
export const choresSettingsPages: SettingsPage[] = [
  {
    id: 'chores',
    label: 'Chores',
    group: 'chores',
    order: 200,
    tag: 'pv-chores-list-page',
    applies: ({ household }) => choresEnabled({ household }),
    summary: ctx => {
      const board = settingsBoard(ctx);
      return board ? count(board.chores.filter(a => !a.finished_at).length, 'chore', 'chores') : '';
    },
    needsALook: ctx => choresLooks(settingsFeed(ctx), settingsBoard(ctx)),
  },
  {
    id: 'chores-off',
    label: 'Chores',
    group: 'chores',
    order: 200,
    tag: 'pv-chores-off-page',
    applies: ({ household }) => !!household?.available && !choresEnabled({ household }),
    summary: () => 'Off',
  },
  {
    id: 'rewards',
    label: 'Rewards',
    group: 'chores',
    order: 210,
    tag: 'pv-rewards-page',
    applies: ({ household }) => choresEnabled({ household }),
    summary: ctx => {
      const board = settingsBoard(ctx);
      return board ? count(board.rewards.length, 'reward', 'rewards') : '';
    },
  },
  {
    id: 'rules',
    label: 'Rules',
    group: 'chores',
    order: 220,
    tag: 'pv-rules-page',
    applies: ({ household }) => choresEnabled({ household }),
    summary: ctx => {
      const board = settingsBoard(ctx);
      return board ? rulesSummary(board.settings) : '';
    },
  },
  {
    id: 'reminders',
    label: 'Reminders',
    group: 'chores',
    order: 230,
    tag: 'pv-reminders-page',
    applies: ({ household }) => choresEnabled({ household }),
    summary: ctx => {
      const board = settingsBoard(ctx);
      return board ? remindersSummary(board.settings, ctx.data?.display?.time_format) : '';
    },
    needsALook: ctx => phoneLooks(settingsFeed(ctx), ctx.household?.members ?? []),
  },
  {
    // People, chores, rewards, and rules travel together, so this works with chores off too.
    id: 'import-export',
    label: 'Import and export',
    group: 'data',
    order: 600,
    tag: 'pv-import-export-page',
    applies: ({ household }) => !!household?.available,
  },
];

/** The person page's chores parts (spec 14.2): the chores rows, sleep, and phones with Use in automations. */
export const choresPersonSections: PersonSection[] = [
  { id: 'chores', label: 'Chores', order: 100, slot: 'role', tag: 'pv-person-chores', applies: ({ household }) => choresEnabled({ household }) },
  { id: 'sleep', label: 'Sleep', order: 200, slot: 'pin', tag: 'pv-person-sleep', applies: ({ household }) => choresEnabled({ household }) },
  { id: 'phones', label: 'Phones', order: 300, slot: 'links', tag: 'pv-person-phones', applies: ({ household }) => choresEnabled({ household }) },
];

/** How the household started setup (spec 14.7), from what setup saved. */
function startOf(ctx: SetupContext): string | null {
  return (ctx.household?.setup.start as string | null | undefined) ?? null;
}

/** The chores setup steps (spec 14.7): restore, the chores choice, common chores or a plan, and the shared screen. */
export const choresSetupSteps: SetupStep[] = [
  {
    id: 'restore',
    label: 'Restore',
    order: 50,
    tag: 'pv-setup-file',
    heading: 'Restore from a PlanaVista file',
    lead: 'Choose the file, or paste its text. You see everything in it before anything is saved.',
    wide: true,
    applies: ctx => startOf(ctx) === 'restore',
  },
  {
    id: 'chores',
    label: 'Chores',
    order: 300,
    tag: 'pv-setup-chores-choice',
    heading: 'Do you want chores too?',
    lead: "Chores sit next to the calendar. Kids hold a chore's circle to finish it and earn stars.",
    primary: 'Continue',
    secondary: 'Not now, just the calendar',
    applies: ctx => !!ctx.household?.available && startOf(ctx) !== 'restore',
  },
  {
    id: 'chores-common',
    label: 'Common chores',
    order: 310,
    tag: 'pv-setup-common-chores',
    heading: 'Pick some to start with',
    lead: 'Each comes with a person, how often, and about how long. Tap a picked chore to change those.',
    skip: true,
    wide: true,
    applies: ctx => startOf(ctx) === 'common',
  },
  {
    id: 'chores-plan',
    label: 'Household plan',
    order: 320,
    tag: 'pv-setup-file',
    heading: 'Start from your household plan',
    lead: 'Choose the plan file, or paste its text. You see where everything goes before anything is saved.',
    wide: true,
    applies: ctx => startOf(ctx) === 'plan',
  },
  {
    id: 'shared-screen',
    label: 'Shared screen',
    order: 400,
    tag: 'pv-setup-shared-screen',
    heading: 'Is this a shared family screen?',
    lead: 'On a shared screen, parents use a PIN for grown-up things like approving chores and changing settings.',
    primary: 'Continue',
    finish: 'Open the board',
    module: 'chores',
    applies: ({ household }) => choresEnabled({ household }),
  },
];

/** The short setup that Settings' Chores row runs for a calendar-only home (spec 14.7). */
export const CHORES_SETUP_FLOW = ['chores', 'chores-common', 'chores-plan', 'shared-screen'];

/** What chores add to setup's last step: the board, two tips, and Open the board. */
export const choresDoneParts: DonePart[] = [
  {
    id: 'chores-board', label: 'Your board', order: 100, tag: 'pv-setup-done-board', primary: 'Open the board', module: 'chores',
    applies: ({ household }) => choresEnabled({ household }),
  },
];

/** Add the chores pages to Settings, their parts to the person page, and their steps to setup. */
export function registerChoresSettings(
  settings: PageRegistry<SettingsContext, SettingsPage> = settingsRegistry,
  sections: PageRegistry<SettingsContext, PersonSection> = personSections,
  setup: PageRegistry<SetupContext, SetupStep> = setupRegistry,
  done: PageRegistry<SetupContext, DonePart> = doneParts,
): void {
  for (const page of choresSettingsPages) settings.register(page);
  for (const section of choresPersonSections) sections.register(section);
  for (const step of choresSetupSteps) setup.register(step);
  for (const part of choresDoneParts) done.register(part);
}

import { ModuleDefinition, ModuleRegistry, moduleRegistry } from '../../core/module-registry';
import { PageRegistry } from '../../core/page-registry';
import {
  PersonSection, SettingsContext, SettingsPage, personSections, settingsRegistry,
} from '../../core/settings-registry';
import { ChoresService, choresEnabled } from './chores-service';
import type { Board } from './chores-types';
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

function count(n: number, one: string, many: string): string {
  return `${n} ${n === 1 ? one : many}`;
}

/** The Chores group of Settings (spec 14.1): Chores, Rewards, Rules, and Reminders, while chores are on. */
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

/** Add the chores pages to Settings, and their parts to the person page. */
export function registerChoresSettings(
  settings: PageRegistry<SettingsContext, SettingsPage> = settingsRegistry,
  sections: PageRegistry<SettingsContext, PersonSection> = personSections,
): void {
  for (const page of choresSettingsPages) settings.register(page);
  for (const section of choresPersonSections) sections.register(section);
}

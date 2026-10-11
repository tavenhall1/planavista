import { ModuleDefinition, ModuleRegistry, moduleRegistry } from '../../core/module-registry';
import { PageRegistry } from '../../core/page-registry';
import { SettingsContext, SettingsPage, settingsRegistry } from '../../core/settings-registry';
import { ChoresService, choresEnabled } from './chores-service';
import type { Board } from './chores-types';

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
];

/** Add the chores pages to Settings. */
export function registerChoresSettings(settings: PageRegistry<SettingsContext, SettingsPage> = settingsRegistry): void {
  for (const page of choresSettingsPages) settings.register(page);
}

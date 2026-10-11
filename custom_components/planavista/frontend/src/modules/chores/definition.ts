import { ModuleDefinition, ModuleRegistry, moduleRegistry } from '../../core/module-registry';
import { ChoresService, choresEnabled } from './chores-service';

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

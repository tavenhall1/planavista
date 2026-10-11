import { describe, expect, it } from 'vitest';
import { ModuleRegistry } from '../src/core/module-registry';
import { CHORES_VIEWS, choresModule, registerChoresModule } from '../src/modules/chores/definition';

describe('the Chores module', () => {
  it('offers Board, Week, My day, and Rewards (spec 12.2)', () => {
    expect(CHORES_VIEWS.map(v => v.label)).toEqual(['Board', 'Week', 'My day', 'Rewards']);
    expect(choresModule.views[0].id).toBe('board');
  });

  it('shows only once the household turns chores on', () => {
    const household = (modules: Record<string, unknown>) =>
      ({ available: true, modules } as never);
    expect(choresModule.enabled?.({ config: undefined, data: null, household: household({ chores: { enabled: true } }) })).toBe(true);
    expect(choresModule.enabled?.({ config: undefined, data: null, household: household({ chores: { enabled: false } }) })).toBe(false);
    expect(choresModule.enabled?.({ config: undefined, data: null, household: null })).toBe(false);
  });

  it('comes after the calendar and keeps card-wide state', () => {
    const registry = new ModuleRegistry();
    registerChoresModule(registry);
    expect(registry.get('chores')?.order).toBeGreaterThan(10);
    expect(typeof choresModule.service).toBe('function');
    expect(choresModule.watchedEntities({ config: undefined, data: null })).toEqual([]);
  });
});

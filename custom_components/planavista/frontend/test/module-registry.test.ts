import { describe, expect, it } from 'vitest';
import { ModuleRegistry, resolveModules, type ModuleDefinition } from '../src/core/module-registry';

const mod = (id: string, order: number): ModuleDefinition => ({
  id, label: id, icon: 'mdi:puzzle', tag: `pv-${id}-module`, order, watchedEntities: () => [],
});
const calendar = mod('calendar', 10);
const chores = mod('chores', 20);
const lists = mod('lists', 30);
const all = [calendar, chores, lists];

describe('ModuleRegistry', () => {
  it('lists modules by order, and registering an id again replaces it', () => {
    const registry = new ModuleRegistry();
    registry.register(chores);
    registry.register(calendar);
    registry.register({ ...chores, label: 'Chores 2' });
    expect(registry.list().map(m => m.id)).toEqual(['calendar', 'chores']);
    expect(registry.get('chores')?.label).toBe('Chores 2');
    expect(registry.get('lists')).toBeUndefined();
  });

  it('breaks order ties by id', () => {
    const registry = new ModuleRegistry();
    registry.register(mod('b', 5));
    registry.register(mod('a', 5));
    expect(registry.list().map(m => m.id)).toEqual(['a', 'b']);
  });
});

describe('resolveModules', () => {
  it('shows every module and opens the first when the card sets nothing', () => {
    const { shown, initial } = resolveModules(all, {});
    expect(shown.map(m => m.id)).toEqual(['calendar', 'chores', 'lists']);
    expect(initial?.id).toBe('calendar');
  });

  it('shows only the modules the card lists, in the card\'s order', () => {
    expect(resolveModules(all, { modules: ['chores', 'calendar'] }).shown.map(m => m.id)).toEqual(['chores', 'calendar']);
  });

  it('ignores unknown ids and repeats, and shows everything when nothing valid is listed', () => {
    expect(resolveModules(all, { modules: ['chores', 'garden', 'chores'] }).shown.map(m => m.id)).toEqual(['chores']);
    expect(resolveModules(all, { modules: ['garden'] }).shown).toHaveLength(3);
    expect(resolveModules(all, { modules: 'chores' }).shown).toHaveLength(3);
  });

  it('opens the module the card names when it is shown', () => {
    expect(resolveModules(all, { module: 'chores' }).initial?.id).toBe('chores');
    expect(resolveModules(all, { modules: ['calendar'], module: 'chores' }).initial?.id).toBe('calendar');
    expect(resolveModules(all, { module: 7 }).initial?.id).toBe('calendar');
  });

  it('has nothing to show when no modules are registered', () => {
    expect(resolveModules([], {})).toEqual({ shown: [], initial: undefined });
  });
});

import { describe, expect, it } from 'vitest';
import { PageRegistry } from '../src/core/page-registry';

type Ctx = { mode: 'onboarding' | 'settings' };

describe('PageRegistry', () => {
  it('returns pages in order and skips the ones that do not apply', () => {
    const registry = new PageRegistry<Ctx>();
    registry.register({ id: 'theme', label: 'Theme', order: 900 });
    registry.register({ id: 'preferences', label: 'Preferences', order: 100 });
    registry.register({ id: 'calendars', label: 'Calendars', order: 200, applies: ctx => ctx.mode === 'onboarding' });
    expect(registry.pages({ mode: 'onboarding' }).map(p => p.id)).toEqual(['preferences', 'calendars', 'theme']);
    expect(registry.pages({ mode: 'settings' }).map(p => p.id)).toEqual(['preferences', 'theme']);
  });

  it('replaces a page registered again under the same id', () => {
    const registry = new PageRegistry<Ctx>();
    registry.register({ id: 'theme', label: 'Theme', order: 900 });
    registry.register({ id: 'theme', label: 'Look', order: 50 });
    expect(registry.pages({ mode: 'settings' })).toEqual([{ id: 'theme', label: 'Look', order: 50 }]);
  });

  it('breaks order ties by id so the list is stable', () => {
    const registry = new PageRegistry<Ctx>();
    registry.register({ id: 'b', label: 'B', order: 1 });
    registry.register({ id: 'a', label: 'A', order: 1 });
    expect(registry.pages({ mode: 'settings' }).map(p => p.id)).toEqual(['a', 'b']);
  });
});

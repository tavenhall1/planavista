import { describe, expect, it } from 'vitest';
import { PageRegistry } from '../src/core/page-registry';
import type { SettingsContext, SettingsPage } from '../src/core/settings-registry';
import type { ModuleService } from '../src/core/module-registry';
import { choresSettingsPages, registerChoresSettings, settingsBoard } from '../src/modules/chores/definition';
import type { Board } from '../src/modules/chores/chores-types';
import { activity, board } from './chores-fixtures';

const household = (enabled: boolean) => ({ available: true, modules: { chores: { enabled } } } as never);

function context(enabled: boolean, chores: Board | null): SettingsContext {
  const service = { board: () => chores } as unknown as ModuleService;
  return { household: household(enabled), data: {} as never, services: { chores: service } };
}

const sample = board({}, {
  chores: [activity('laundry'), activity('vacuum'), activity('paint', { finished_at: '2026-10-10T12:00:00-05:00' })],
});

describe('the Chores group of Settings', () => {
  it('shows its pages only while chores are on', () => {
    const registry = new PageRegistry<SettingsContext, SettingsPage>();
    registerChoresSettings(registry);
    expect(registry.pages(context(true, sample)).map(p => p.id)).toContain('chores');
    expect(registry.pages(context(false, null)).map(p => p.id)).not.toContain('chores');
  });

  it('counts the chores not yet finished', () => {
    const page = choresSettingsPages.find(p => p.id === 'chores')!;
    expect(page.summary!(context(true, sample))).toBe('2 chores');
    expect(page.summary!(context(true, null))).toBe('');
  });

  it('sums up Rewards, Rules, and Reminders', () => {
    const summary = (id: string, b: Board | null = sample) => choresSettingsPages.find(p => p.id === id)!.summary!(context(true, b));
    expect(summary('rewards', { ...sample, rewards: [{ id: 'x', name: 'X', icon: null, cost: 5, needs_ok: true, who: [] }] })).toBe('1 reward');
    expect(summary('rules')).toBe('Make it up');
    expect(summary('reminders')).toBe('7:00 PM');
    expect(summary('reminders', { ...sample, settings: { ...sample.settings, evening_check: null } })).toBe('Off');
    expect(summary('rules', null)).toBe('');
  });

  it('offers the Chores row and Import and export with chores off', () => {
    const registry = new PageRegistry<SettingsContext, SettingsPage>();
    registerChoresSettings(registry);
    expect(registry.pages(context(false, null)).map(p => p.id)).toEqual(['chores-off', 'import-export']);
    expect(registry.pages({ household: null, data: {} as never }).map(p => p.id)).toEqual([]);
  });

  it('reads the board from the chores service', () => {
    expect(settingsBoard(context(true, sample))).toBe(sample);
    expect(settingsBoard({ services: {} })).toBeNull();
  });
});

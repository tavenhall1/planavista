import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { stripStart } from '../src/core/people-strip';
import { peopleStripStyles } from '../src/styles/controls';

const read = (path: string) => readFileSync(new URL(`../src/${path}`, import.meta.url), 'utf-8');

describe('stripStart (milestone 8, spec 3.6): whose screen a people strip opens on', () => {
  const ids = ['alex', 'blair', 'casey', 'dana'];

  it('opens on the account\'s own person: Casey\'s phone shows Casey', () => {
    expect(stripStart(ids, null, 'casey')).toBe('casey');
  });

  it('keeps the person someone picked', () => {
    expect(stripStart(ids, 'dana', 'casey')).toBe('dana');
  });

  it('opens on the first person on a shared or admin login, or when the pick has gone', () => {
    expect(stripStart(ids, null, null)).toBe('alex');
    expect(stripStart(ids, 'eve', null)).toBe('alex');
    expect(stripStart([], null, 'casey')).toBeNull();
  });
});

describe('two people patterns, by job (milestone 8, spec 3.9)', () => {
  it('a people strip chooses whose view: the phone board, Day on a phone, and My day', () => {
    for (const path of ['modules/chores/pv-chores-board.ts', 'modules/chores/pv-chores-my-day.ts', 'modules/calendar/components/view-day.ts']) {
      expect(read(path), path).toMatch(/class="pv-people/);
      expect(read(path), path).toMatch(/class="pv-person"/);
    }
  });

  it('the strip never shrinks, so names stay whole', () => {
    const strip = /\.pv-people \{([^}]*)\}/.exec(peopleStripStyles.cssText)?.[1] ?? '';
    expect(strip).toMatch(/flex:\s*0 0 auto/);
  });

  it('person chips choose who something is for: New event, quick add, a chore, a reward', () => {
    for (const path of ['modules/calendar/components/event-create-dialog.ts', 'modules/chores/pv-chores-quick-add.ts',
      'modules/chores/settings/pv-chore-editor.ts', 'modules/chores/pv-chores-reward-sheet.ts']) {
      expect(read(path), path).toMatch(/class="pv-person-chip/);
      expect(read(path), path).not.toMatch(/class="face"|class="cal-option/);
    }
  });

  it('Day on a narrow card shows one person at a time, with the strip', () => {
    const day = read('modules/calendar/components/view-day.ts');
    expect(day).toMatch(/\.day-people \{ display: flex; \}/);
    expect(day).toMatch(/\.person-column:not\(\.chosen\) \{ display: none; \}/);
  });
});

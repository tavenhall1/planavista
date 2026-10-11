import { describe, expect, it } from 'vitest';
import { STARTERS, addLabel, pickActivity, pickLine, suggestPicks } from '../src/modules/chores/setup/starter-chores';
import { MEMBERS, person } from './chores-fixtures';

describe('the common chores starter list (spec 14.7)', () => {
  it('has the twelve starters in the spec\'s order', () => {
    expect(STARTERS.map(s => s.name)).toEqual([
      'Make your bed', 'Set the table', 'Tidy toys', 'Unload the dishwasher', 'Take out the trash', 'Feed the pet', 'Laundry',
      'Kitchen cleanup', 'Vacuum', 'Clean the bathroom', 'Yard work', 'Groceries',
    ]);
  });

  it('suggests each one by age and picks eight for the sample household', () => {
    const picks = suggestPicks(MEMBERS);
    expect(picks.map(p => [p.id, p.member, p.on])).toEqual([
      ['make_your_bed', 'dana', true], ['set_the_table', 'dana', true], ['tidy_toys', 'dana', true],
      ['unload_the_dishwasher', 'casey', true], ['take_out_the_trash', 'casey', true], ['feed_the_pet', 'casey', false],
      ['laundry', 'alex', true], ['kitchen_cleanup', 'blair', true], ['vacuum', 'alex', false],
      ['clean_the_bathroom', 'casey', true], ['yard_work', 'casey', false], ['groceries', 'blair', false],
    ]);
    expect(addLabel(picks)).toBe('Add 8 chores');
  });

  it('leaves a chore nobody suits unpicked, with no one', () => {
    const picks = suggestPicks([person('alex', { parent: true }), person('blair', { parent: true })]);
    const bed = picks.find(p => p.id === 'make_your_bed')!;
    expect([bed.member, bed.on]).toEqual([null, false]);
    expect(addLabel(picks)).toBe('Add 2 chores');
    expect(addLabel(picks.map(p => ({ ...p, on: false })))).toBe('Add chores');
  });

  it('says each tile\'s rhythm and time', () => {
    const picks = suggestPicks(MEMBERS);
    expect(picks.slice(0, 1).concat(picks.slice(4, 5), picks.slice(6, 7)).map(pickLine)).toEqual([
      'Daily · 5 min', 'Tue, Fri · 10 min', 'Weekly · 2 h',
    ]);
  });

  it('turns a pick into a normal Plan chore', () => {
    const picks = suggestPicks(MEMBERS);
    expect(pickActivity(picks.find(p => p.id === 'take_out_the_trash')!)).toEqual({
      name: 'Take out the trash', icon: '🗑️', category: 'home', schedule: 'plan', assignees: ['casey'], on_board: true,
      needs_ok: false, stars: null, minimum: { hours: 20 / 60, per: 'week' }, split: 'each', times: 1, days: ['tue', 'fri'],
      time_of_day: ['evening'],
    });
    expect(pickActivity(picks.find(p => p.id === 'make_your_bed')!).minimum).toEqual({ hours: 5 / 60, per: 'day' });
  });
});

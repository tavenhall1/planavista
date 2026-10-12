import { describe, expect, it } from 'vitest';
import { memberEntities } from '../src/modules/chores/settings/entities';

describe('memberEntities', () => {
  it('finds the ids Home Assistant gave a person\'s chores entities by their names', () => {
    const states = {
      'todo.casey_chores_2': { attributes: { friendly_name: 'Casey Chores' } },
      'sensor.casey_stars': { attributes: { friendly_name: 'Casey Stars' } },
      'sensor.casey_chores_left': { attributes: { friendly_name: 'Casey Chores left' } },
      'event.casey_chores': { attributes: { friendly_name: 'Casey Chores' } },
    };
    expect(memberEntities(states, { id: 'casey', name: 'Casey' })).toEqual([
      { label: 'To-do list', entity_id: 'todo.casey_chores_2' },
      { label: 'Chores left today', entity_id: 'sensor.casey_chores_left' },
      { label: 'Stars', entity_id: 'sensor.casey_stars' },
      { label: 'Done for today', entity_id: 'binary_sensor.casey_chores_done' },
      { label: 'Events', entity_id: 'event.casey_chores' },
    ]);
  });

  it('falls back to the ids they were made with', () => {
    expect(memberEntities(undefined, { id: 'dana', name: 'Dana' })[0]).toEqual({ label: 'To-do list', entity_id: 'todo.dana_chores' });
  });
});

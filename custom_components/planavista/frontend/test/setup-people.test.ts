import { describe, expect, it } from 'vitest';
import { addedRow, setupPlan, setupRows } from '../src/core/setup-people';
import { Member } from '../src/core/household';

const casey = { id: 'casey', name: 'Casey', person: 'person.casey', age_group: 'teen', parent: false } as Member;
const PERSONS = [
  { entity_id: 'person.alex', name: 'Alex', user_id: 'user-alex' },
  { entity_id: 'person.blair', name: 'Blair', user_id: null },
  { entity_id: 'person.casey', name: 'Casey', user_id: 'user-casey' },
];

describe('who lives here', () => {
  it('lists people already in the household, then Home Assistant people who are not', () => {
    const rows = setupRows([casey], PERSONS, 'user-alex');
    expect(rows.map(r => [r.key, r.name, r.memberId, r.role, r.checked])).toEqual([
      ['casey', 'Casey', 'casey', 'teen', true],
      ['person.alex', 'Alex', null, 'parent', true],
      ['person.blair', 'Blair', null, 'adult', true],
    ]);
  });

  it('adds someone without Home Assistant by name', () => {
    expect(addedRow('  Dana ', 0)).toEqual({ key: 'new:0', name: 'Dana', person: null, memberId: null, role: 'adult', checked: true });
  });

  it('turns the rows into adds, role changes, and removals', () => {
    const rows = setupRows([casey], PERSONS, 'user-alex');
    rows[0] = { ...rows[0], role: 'older_child' };
    rows[2] = { ...rows[2], checked: false };
    rows.push({ ...addedRow('Dana', 0), role: 'young_child' }, { ...addedRow('   ', 1) });
    expect(setupPlan(rows, [casey])).toEqual({
      add: [
        { name: 'Alex', age_group: 'adult', parent: true, person: 'person.alex' },
        { name: 'Dana', age_group: 'young_child', parent: false },
      ],
      update: [{ id: 'casey', changes: { age_group: 'older_child', parent: false } }],
      remove: [],
    });
    rows[0] = { ...rows[0], checked: false };
    expect(setupPlan(rows, [casey]).remove).toEqual(['casey']);
  });
});

import { describe, expect, it } from 'vitest';
import { belongsTo, buildCalendarRows, toSavedCalendars } from '../src/modules/calendar/calendar-rows';
import { Member } from '../src/core/household';

const PRESETS = [{ color: '#001219', light: '#A6ACAF' }, { color: '#005F73', light: '#A6C7CE' }];
const SAVED = [
  {
    entity_id: 'calendar.test_casey', display_name: 'Casey', color: '#43AA8B', color_light: '#BDE1D6',
    icon: 'mdi:soccer', person_entity: 'person.casey', visible: false, member_id: 'casey',
    added_later: 'kept', state: 'off', attributes: { friendly_name: 'Test Casey' },
  },
];
const names: Record<string, string> = { 'calendar.test_alex': 'Test Alex', 'calendar.test_blair': 'Test Blair' };

describe('calendar rows', () => {
  it('lists saved calendars first, then the other Home Assistant calendars, sorted and left out', () => {
    const rows = buildCalendarRows(SAVED, ['calendar.test_blair', 'calendar.test_alex', 'calendar.test_casey'], id => names[id], PRESETS);
    expect(rows.map(r => [r.entity_id, r.include])).toEqual([
      ['calendar.test_casey', true],
      ['calendar.test_alex', false],
      ['calendar.test_blair', false],
    ]);
    expect(rows[1]).toMatchObject({ display_name: 'Test Alex', color: '#005F73', color_light: '#A6C7CE', member_id: null, saved: null });
    expect(rows[0].saved).not.toHaveProperty('state');
    expect(rows[0].saved).not.toHaveProperty('attributes');
  });

  it('saves included rows with every key they had, and defaults for new ones', () => {
    const rows = buildCalendarRows(SAVED, ['calendar.test_alex'], id => names[id], PRESETS);
    rows[1] = { ...rows[1], include: true, member_id: 'alex' };
    rows[0] = { ...rows[0], display_name: 'Casey (school)' };
    expect(toSavedCalendars(rows)).toEqual([
      {
        entity_id: 'calendar.test_casey', display_name: 'Casey (school)', color: '#43AA8B', color_light: '#BDE1D6',
        icon: 'mdi:soccer', person_entity: 'person.casey', visible: false, member_id: 'casey', added_later: 'kept',
      },
      {
        entity_id: 'calendar.test_alex', display_name: 'Test Alex', color: '#005F73', color_light: '#A6C7CE',
        icon: 'mdi:calendar', person_entity: '', visible: true, member_id: 'alex',
      },
    ]);
  });

  it('says who a calendar belongs to', () => {
    const members = [
      { id: 'casey', person: 'person.casey' },
      { id: 'dana', person: null },
    ] as Member[];
    expect(belongsTo({ person_entity: 'person.casey', member_id: 'dana' }, members)).toEqual({ memberId: 'casey', viaPerson: true });
    expect(belongsTo({ person_entity: 'person.alex', member_id: 'dana' }, members)).toEqual({ memberId: 'dana', viaPerson: false });
    expect(belongsTo({ person_entity: '', member_id: 'blair' }, members)).toEqual({ memberId: null, viaPerson: false });
  });
});

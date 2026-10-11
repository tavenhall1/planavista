import { describe, expect, it } from 'vitest';
import { clockTime, eventsOn, nextForHousehold, nextOnCalendar } from '../src/modules/chores/calendar-ties';
import type { PlanaVistaData } from '../src/types';
import { MEMBERS, NOW } from './chores-fixtures';

function data(): PlanaVistaData {
  const cal = (entity: string, member: string | null, name: string) => ({
    entity_id: entity, display_name: name, color: '#000000', color_light: '#FFFFFF', icon: '', person_entity: '',
    member_id: member, visible: true,
  });
  const ev = (calendar: string, summary: string, start: string, end: string) => ({
    summary, start, end, calendar_entity_id: calendar, calendar_name: calendar, calendar_color: '', calendar_color_light: '',
  });
  return {
    calendars: [cal('calendar.alex', 'alex', 'Alex'), cal('calendar.casey', 'casey', 'Casey'), cal('calendar.family', null, 'Family')],
    events: [
      ev('calendar.casey', 'Soccer practice', '2026-10-13T17:30:00-05:00', '2026-10-13T19:00:00-05:00'),
      ev('calendar.alex', 'Dentist', '2026-10-13T16:45:00-05:00', '2026-10-13T17:30:00-05:00'),
      ev('calendar.casey', 'School', '2026-10-13T08:00:00-05:00', '2026-10-13T14:45:00-05:00'),
      ev('calendar.family', 'Pizza night', '2026-10-13T18:00:00-05:00', '2026-10-13T19:00:00-05:00'),
      ev('calendar.alex', 'Holiday', '2026-10-13', '2026-10-14'),
      ev('calendar.alex', 'Tomorrow', '2026-10-14T09:00:00-05:00', '2026-10-14T10:00:00-05:00'),
    ],
    display: { time_format: '12h', weather_entity: '', first_day: 'monday', default_view: 'week', theme: 'planavista' },
  };
}

const dayStart = new Date('2026-10-13T03:00:00-05:00');
const dayEnd = new Date('2026-10-14T03:00:00-05:00');

describe('eventsOn', () => {
  it('lists the chore day\'s timed events, soonest first, with whose calendar each is', () => {
    const events = eventsOn(data(), dayStart, dayEnd);
    expect(events.map(e => [e.title, e.member])).toEqual([
      ['School', 'casey'], ['Dentist', 'alex'], ['Soccer practice', 'casey'], ['Pizza night', null],
    ]);
  });

  it('leaves out the calendars this card hides, as the calendar does', () => {
    const hidden = data();
    hidden.calendars[0].visible = false;
    expect(eventsOn(hidden, dayStart, dayEnd).map(e => e.title)).toEqual(['School', 'Soccer practice', 'Pizza night']);
    const familyOnly = { type: 'custom:planavista-card', calendars: ['calendar.family'] };
    expect(eventsOn(data(), dayStart, dayEnd, familyOnly).map(e => e.title)).toEqual(['Pizza night']);
  });
});

describe('nextOnCalendar (spec 13.1)', () => {
  const events = eventsOn(data(), dayStart, dayEnd);

  it('finds someone\'s next event and whether they are free until then', () => {
    expect(nextOnCalendar(events, 'casey', NOW)).toMatchObject({ event: { title: 'Soccer practice' }, freeUntil: true });
    expect(nextOnCalendar(events, 'alex', NOW)).toMatchObject({ event: { title: 'Dentist' }, freeUntil: false });
  });

  it('is busy, not free, during an event', () => {
    expect(nextOnCalendar(events, 'casey', new Date('2026-10-13T12:00:00-05:00'))?.freeUntil).toBe(false);
  });

  it('has nothing for someone with no more events today', () => {
    expect(nextOnCalendar(events, 'dana', NOW)).toBeNull();
    expect(nextOnCalendar(events, 'alex', new Date('2026-10-13T18:00:00-05:00'))).toBeNull();
  });
});

describe('nextForHousehold', () => {
  it('names whose event is next, or the calendar when it belongs to no one', () => {
    const events = eventsOn(data(), dayStart, dayEnd);
    const name = (id: string) => data().calendars.find(c => c.entity_id === id)?.display_name ?? null;
    expect(nextForHousehold(events, MEMBERS, NOW, '12h', name)).toEqual({ title: 'Dentist', time: '4:45', who: 'Alex' });
    expect(nextForHousehold(events, MEMBERS, new Date('2026-10-13T17:45:00-05:00'), '24h', name))
      .toEqual({ title: 'Pizza night', time: '18:00', who: 'Family' });
  });
});

describe('clockTime', () => {
  it('writes the time the household reads', () => {
    const t = new Date(2026, 9, 13, 17, 5);
    expect(clockTime(t)).toBe('5:05');
    expect(clockTime(t, '12h', true)).toBe('5:05 PM');
    expect(clockTime(t, '24h')).toBe('17:05');
  });
});

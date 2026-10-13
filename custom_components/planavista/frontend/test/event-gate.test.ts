import { describe, expect, it } from 'vitest';
import { calendarsOf, eventGate } from '../src/modules/calendar/event-gate';
import type { HouseholdView, Member } from '../src/core/household';
import type { PinGate } from '../src/core/pin-gate';
import type { CalendarConfig, CalendarEvent } from '../src/types';

function member(id: string, fields: Partial<Member> = {}): Member {
  return {
    id, name: id[0].toUpperCase() + id.slice(1), color: '#43AA8B', color_dark: null, picture: { initial: true },
    age_group: 'adult', parent: false, person: null, order: 0, rev: 1, my_day: 'timeline', needs_ok_for: 'none',
    stars: false, has_pin: false, pin_length: null, locked_until: null, ...fields,
  };
}

const PEOPLE = [
  member('blair', { parent: true, has_pin: true, order: 1 }),
  member('casey', { age_group: 'teen', has_pin: true, order: 2 }),
  member('dana', { age_group: 'young_child', order: 3 }),
];

const ROWS = [
  { entity_id: 'calendar.casey', member_id: 'casey' },
  { entity_id: 'calendar.dana', member_id: 'dana' },
  { entity_id: 'calendar.family', member_id: null },
] as CalendarConfig[];

function view(kind: 'shared' | 'member', memberId: string | null = null): HouseholdView {
  return {
    available: true,
    members: PEOPLE,
    account: { user_id: 'u', name: 'u', is_admin: false, shared: kind === 'shared', kind, member_id: memberId, parent_level: false },
    security: { shuffle_keypad: false, shared_screens: 1 },
    modules: {},
    setup: { completed: true, step: null },
  };
}

function fakeGate(answer: boolean) {
  const asked: Array<{ members: string[]; heading: string; reason?: string }> = [];
  const gate: PinGate = {
    ask: async (members, heading, reason) => {
      asked.push({ members: members.map(m => m.id), heading, reason });
      return answer;
    },
  };
  return { gate, asked };
}

describe('the event gate (milestone 8, D1)', () => {
  it("asks the shared screen for the owner's PIN, saying why", async () => {
    const { gate, asked } = fakeGate(true);
    const events = eventGate(() => ({ view: view('shared'), session: null, pinGate: gate, rows: ROWS }));
    expect(await events.ask(['calendar.casey'], 'Team standup')).toBe(true);
    expect(asked).toEqual([{ members: ['casey', 'blair'], heading: "Who's changing Team standup?", reason: 'To change Team standup' }]);
  });

  it('goes ahead without a PIN when none is needed, and stops when the PIN sheet is cancelled', async () => {
    const { gate, asked } = fakeGate(false);
    const events = eventGate(() => ({ view: view('shared'), session: null, pinGate: gate, rows: ROWS }));
    expect(await events.ask(['calendar.dana'], 'Swim')).toBe(true);
    expect(asked).toEqual([]);
    expect(await events.ask(['calendar.family'], 'Dinner')).toBe(false);
    expect(asked.map(a => a.members)).toEqual([['blair']]);
  });

  it("a child's own login changes only their own events, and says who can", async () => {
    const { gate, asked } = fakeGate(true);
    const events = eventGate(() => ({ view: view('member', 'casey'), session: null, pinGate: gate, rows: ROWS }));
    expect(events.allowed(['calendar.casey'])).toBe(true);
    expect(events.allowed(['calendar.dana'])).toBe(false);
    expect(await events.ask(['calendar.dana'], 'Swim')).toBe(false);
    expect(asked).toEqual([]);
    expect(events.note(['calendar.dana'])).toBe('Only Dana or a parent can change this event.');
    expect(events.note(['calendar.casey', 'calendar.dana'])).toBe('Only a parent can change this event.');
  });

  it("an event's calendars: every person's copy, or its own calendar", () => {
    const one = { calendar_entity_id: 'calendar.casey' } as CalendarEvent;
    const shared = { calendar_entity_id: 'calendar.casey', shared_calendars: [{ entity_id: 'calendar.casey' }, { entity_id: 'calendar.dana' }] } as unknown as CalendarEvent;
    expect(calendarsOf(one)).toEqual(['calendar.casey']);
    expect(calendarsOf(shared)).toEqual(['calendar.casey', 'calendar.dana']);
  });
});

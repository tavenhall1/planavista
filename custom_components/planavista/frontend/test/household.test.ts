import { describe, expect, it } from 'vitest';
import {
  AccountKind,
  HouseholdView,
  Member,
  inOrder,
  initialOf,
  memberSummary,
  nextFreeColor,
  parentsWithPins,
  pictureOf,
  roleFields,
  roleOf,
  settingsAccess,
  takenColors,
} from '../src/core/household';

function member(overrides: Partial<Member>): Member {
  return {
    id: 'alex', name: 'Alex', color: '#F94144', color_dark: null, picture: { initial: true },
    age_group: 'adult', parent: false, person: null, order: 0, rev: 1, my_day: 'timeline',
    needs_ok_for: 'none', stars: false, has_pin: false, pin_length: null, locked_until: null,
    ...overrides,
  };
}

const ALEX = member({ id: 'alex', name: 'Alex', parent: true, has_pin: true, pin_length: 4, person: 'person.alex', order: 0 });
const BLAIR = member({ id: 'blair', name: 'Blair', color: '#277DA1', parent: true, order: 1 });
const CASEY = member({ id: 'casey', name: 'Casey', color: '#43AA8B', age_group: 'teen', order: 2 });
const DANA = member({ id: 'dana', name: 'Dana', color: '#F9C74F', age_group: 'young_child', picture: { emoji: '\u{1F996}' }, order: 3 });
const EVERYONE = [ALEX, BLAIR, CASEY, DANA];

function view(kind: AccountKind, parentLevel: boolean, members = EVERYONE, available = true): HouseholdView {
  return {
    available,
    members,
    account: { user_id: 'u1', name: 'U', is_admin: kind === 'admin', shared: kind === 'shared', kind, member_id: null, parent_level: parentLevel },
    security: { shuffle_keypad: false, shared_screens: 0 },
    modules: {},
    setup: { completed: true, step: null },
  };
}

describe('settingsAccess', () => {
  it('opens Settings for admins and parents on their own login', () => {
    expect(settingsAccess(view('admin', true), true)).toBe('open');
    expect(settingsAccess(view('parent', true), false)).toBe('open');
  });

  it('asks for a parent PIN on shared screens and on accounts linked to no one', () => {
    expect(settingsAccess(view('shared', false), false)).toBe('pin');
    expect(settingsAccess(view('other', false), false)).toBe('pin');
  });

  it('explains when no parent has a PIN yet', () => {
    expect(settingsAccess(view('shared', false, [BLAIR, CASEY]), false)).toBe('no_pin');
    expect(settingsAccess(view('other', false, []), true)).toBe('no_pin');
  });

  it('keeps Settings away from children on their own login', () => {
    expect(settingsAccess(view('member', false), false)).toBe('none');
  });

  it('falls back to admins only, as in 1.1.0, without a usable household', () => {
    expect(settingsAccess(null, true)).toBe('open');
    expect(settingsAccess(null, false)).toBe('none');
    expect(settingsAccess(view('shared', false, EVERYONE, false), true)).toBe('open');
  });
});

describe('people helpers', () => {
  it('maps roles to age group and parent and back', () => {
    expect(roleOf(ALEX)).toBe('parent');
    expect(roleOf(CASEY)).toBe('teen');
    expect(roleFields('parent')).toEqual({ age_group: 'adult', parent: true });
    expect(roleFields('young_child')).toEqual({ age_group: 'young_child', parent: false });
  });

  it('sorts people in board order', () => {
    expect(inOrder([DANA, BLAIR, ALEX, CASEY]).map(m => m.id)).toEqual(['alex', 'blair', 'casey', 'dana']);
  });

  it('takes the first letter of a name for the initial', () => {
    expect(initialOf('alex')).toBe('A');
    expect(initialOf('  zoë')).toBe('Z');
    expect(initialOf('\u{1F996} Rex')).toBe('\u{1F996}');
    expect(initialOf('')).toBe('?');
  });

  it('finds the parents who can start parent mode', () => {
    expect(parentsWithPins(EVERYONE).map(m => m.id)).toEqual(['alex']);
  });

  it('knows which colors are taken and which is free', () => {
    expect([...takenColors(EVERYONE, 'alex').keys()]).toEqual(['#277DA1', '#43AA8B', '#F9C74F']);
    expect(nextFreeColor([ALEX], ['#f94144', '#277da1'])).toBe('#277da1');
    expect(nextFreeColor([ALEX], ['#F94144'])).toBeNull();
  });

  it('summarizes a person for the People list', () => {
    const calendars = [
      { entity_id: 'calendar.alex', display_name: 'Work', member_id: 'alex' },
      { entity_id: 'calendar.school', display_name: 'School', member_id: 'casey' },
      { entity_id: 'calendar.soccer', display_name: 'Soccer', member_id: 'casey' },
    ];
    expect(memberSummary(ALEX, calendars)).toBe("Parent · PIN on · Alex's calendar");
    expect(memberSummary(CASEY, calendars)).toBe('Teen · 2 calendars');
    expect(memberSummary(DANA, calendars)).toBe('Young child · no calendar');
  });

  it('picks what a picture shows', () => {
    const photos = (id: string) => (id === 'person.alex' ? '/api/image/alex.jpg' : null);
    expect(pictureOf(DANA, photos)).toEqual({ kind: 'emoji', text: '\u{1F996}' });
    expect(pictureOf({ ...ALEX, picture: { person: true } }, photos)).toEqual({ kind: 'photo', url: '/api/image/alex.jpg' });
    expect(pictureOf({ ...CASEY, picture: { person: true }, person: 'person.casey' }, photos)).toEqual({ kind: 'initial', text: 'C' });
    expect(pictureOf(BLAIR, photos)).toEqual({ kind: 'initial', text: 'B' });
  });
});

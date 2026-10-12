import { describe, expect, it } from 'vitest';
import { actingParent, eventAccess, eventPinChoices, mayEverReview, memberAccess, parentAccess, pinChoicesFor } from '../src/core/access';
import type { AccountKind, HouseholdView, Member } from '../src/core/household';
import type { Session } from '../src/core/session';

function member(id: string, fields: Partial<Member> = {}): Member {
  return {
    id, name: id[0].toUpperCase() + id.slice(1), color: '#43AA8B', color_dark: null, picture: { initial: true },
    age_group: 'adult', parent: false, person: null, order: 0, rev: 1, my_day: 'timeline', needs_ok_for: 'none',
    stars: false, has_pin: false, pin_length: null, locked_until: null, ...fields,
  };
}

const PEOPLE = [
  member('alex', { parent: true, order: 0 }),
  member('blair', { parent: true, has_pin: true, order: 1 }),
  member('casey', { age_group: 'teen', has_pin: true, order: 2 }),
  member('dana', { age_group: 'young_child', order: 3 }),
];

function view(kind: AccountKind, memberId: string | null = null, members = PEOPLE): HouseholdView {
  return {
    available: true,
    members,
    account: {
      user_id: 'u', name: 'u', is_admin: kind === 'admin', shared: kind === 'shared', kind,
      member_id: memberId, parent_level: kind === 'admin' || kind === 'parent',
    },
    security: { shuffle_keypad: false, shared_screens: 1 },
    modules: {},
    setup: { completed: true, step: null },
  };
}

const session = (memberId: string, parent: boolean): Session => ({ token: 't', memberId, parent, lastTouch: 0 });

describe('memberAccess (spec 9.5)', () => {
  it('lets a parent\'s own login and an admin change anyone\'s items', () => {
    expect(memberAccess(view('parent', 'alex'), null, 'casey')).toBe('yes');
    expect(memberAccess(view('admin'), null, 'casey')).toBe('yes');
  });

  it('lets a child\'s own login change only their own items', () => {
    expect(memberAccess(view('member', 'casey'), null, 'casey')).toBe('yes');
    expect(memberAccess(view('member', 'casey'), null, 'dana')).toBe('no');
  });

  it('asks a shared screen for the PIN of someone who has one', () => {
    const kitchen = view('shared');
    expect(memberAccess(kitchen, null, 'dana')).toBe('yes');
    expect(memberAccess(kitchen, null, 'casey')).toBe('pin');
    expect(memberAccess(kitchen, session('casey', false), 'casey')).toBe('yes');
    expect(memberAccess(kitchen, session('casey', false), 'blair')).toBe('pin');
    expect(memberAccess(kitchen, session('blair', true), 'casey')).toBe('yes');
    expect(memberAccess(view('other'), null, 'casey')).toBe('pin');
  });

  it('allows nothing before the household answers, or for someone removed', () => {
    expect(memberAccess(null, null, 'casey')).toBe('no');
    expect(memberAccess(view('shared'), null, 'gone')).toBe('no');
  });
});

describe('parentAccess (spec 9.5)', () => {
  it('needs parent mode on a shared screen, and a parent with a PIN to start it', () => {
    expect(parentAccess(view('shared'), null)).toBe('pin');
    expect(parentAccess(view('shared'), session('blair', true))).toBe('yes');
    expect(parentAccess(view('shared'), session('casey', false))).toBe('pin');
    const nobody = PEOPLE.map(m => ({ ...m, has_pin: false }));
    expect(parentAccess(view('shared', null, nobody), null)).toBe('no_pin');
  });

  it('never lets a child\'s own login make parent changes', () => {
    expect(parentAccess(view('member', 'casey'), null)).toBe('no');
    expect(mayEverReview(view('member', 'casey'))).toBe(false);
    expect(mayEverReview(view('shared'))).toBe(true);
    expect(parentAccess(view('parent', 'alex'), null)).toBe('yes');
  });
});

describe('pinChoicesFor', () => {
  it('offers the person first, then parents who have PINs', () => {
    expect(pinChoicesFor(view('shared'), 'casey').map(m => m.id)).toEqual(['casey', 'blair']);
    expect(pinChoicesFor(view('shared'), 'dana').map(m => m.id)).toEqual(['blair']);
    expect(pinChoicesFor(view('shared'), 'blair').map(m => m.id)).toEqual(['blair']);
  });
});

describe('actingParent', () => {
  it('is the parent in parent mode, or the parent whose login this is', () => {
    expect(actingParent(view('shared'), session('blair', true))?.id).toBe('blair');
    expect(actingParent(view('parent', 'alex'), null)?.id).toBe('alex');
    expect(actingParent(view('shared'), null)).toBeNull();
  });
});

describe('eventAccess (milestone 8, D1: events follow 9.5)', () => {
  it('an event only on your own calendar is yours to change; anything else needs a parent', () => {
    const casey = view('member', 'casey');
    expect(eventAccess(casey, null, ['casey'])).toBe('yes');
    expect(eventAccess(casey, null, ['dana'])).toBe('no');
    expect(eventAccess(casey, null, ['casey', 'dana'])).toBe('no');
    expect(eventAccess(casey, null, [null])).toBe('no');
  });

  it("a parent's own login and an admin change any event", () => {
    expect(eventAccess(view('parent', 'alex'), null, ['casey', 'dana'])).toBe('yes');
    expect(eventAccess(view('admin'), null, [null])).toBe('yes');
  });

  it("the shared screen asks for the owner's PIN or a parent's", () => {
    const kitchen = view('shared');
    expect(eventAccess(kitchen, null, ['dana'])).toBe('yes');
    expect(eventAccess(kitchen, null, ['casey'])).toBe('pin');
    expect(eventAccess(kitchen, null, ['casey', 'dana'])).toBe('pin');
    expect(eventAccess(kitchen, null, [null])).toBe('pin');
    expect(eventAccess(kitchen, session('casey', false), ['casey'])).toBe('yes');
    expect(eventAccess(kitchen, session('casey', false), ['casey', 'dana'])).toBe('pin');
    expect(eventAccess(kitchen, session('blair', true), ['casey', null])).toBe('yes');
  });

  it('who may unlock: the owner and the parents for one person, the parents otherwise', () => {
    const kitchen = view('shared');
    expect(eventPinChoices(kitchen, ['casey']).map(m => m.id)).toEqual(['casey', 'blair']);
    expect(eventPinChoices(kitchen, ['casey', 'dana']).map(m => m.id)).toEqual(['blair']);
    expect(eventPinChoices(kitchen, [null]).map(m => m.id)).toEqual(['blair']);
  });

  it('a household with no parent PINs keeps changing events as before', () => {
    const open = view('shared', null, PEOPLE.map(m => ({ ...m, has_pin: false })));
    expect(eventAccess(open, null, [null])).toBe('yes');
    expect(eventAccess(open, null, ['casey', 'dana'])).toBe('yes');
    expect(eventAccess(view('other', null, []), null, [null])).toBe('yes');
  });

  it('the calendar keeps working before the household answers, or when it is unavailable', () => {
    expect(eventAccess(null, null, ['casey'])).toBe('yes');
    expect(eventAccess({ ...view('shared'), available: false }, null, [null])).toBe('yes');
  });
});

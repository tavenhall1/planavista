import { describe, expect, it } from 'vitest';
import { choresBarActions, choresGlance, choresStripActions, nextEventChip } from '../src/modules/chores/chores-glance';
import { choresEnabled, refusalText } from '../src/modules/chores/chores-service';
import type { AccountKind, HouseholdView } from '../src/core/household';
import type { Session } from '../src/core/session';
import { MEMBERS, board, column, item } from './chores-fixtures';

function view(kind: AccountKind, memberId: string | null = null, modules: Record<string, unknown> = { chores: { enabled: true } }): HouseholdView {
  return {
    available: true,
    members: MEMBERS,
    account: { user_id: 'u', name: 'u', is_admin: kind === 'admin', shared: kind === 'shared', kind, member_id: memberId, parent_level: kind === 'admin' || kind === 'parent' },
    security: { shuffle_keypad: false, shared_screens: 1 },
    modules,
    setup: { completed: true, step: null },
  };
}

const today = board({
  alex: column([item('a|alex|day:1|0', { status: 'done' }), item('b|alex|day:1|0')]),
  casey: column([item('c|casey|day:1|0', { status: 'pending' }), item('d|casey|day:1|0')]),
});

describe('choresGlance (spec 12.2)', () => {
  it('counts the household\'s chores, Waiting for OK as done', () => {
    expect(choresGlance(today)).toEqual([{
      id: 'chores', text: '2 of 4 chores done today', progress: 0.5, primary: true, open: { module: 'chores', view: 'board' },
    }]);
  });

  it('says when every chore is done, and shows nothing on a day with none', () => {
    const done = board({ alex: column([item('a|alex|day:1|0', { status: 'done' })]) });
    expect(choresGlance(done)[0].text).toBe('All 1 chores done today');
    expect(choresGlance(board({}))).toEqual([]);
    expect(choresGlance(null)).toEqual([]);
  });

  it('words the next event', () => {
    expect(nextEventChip({ title: 'Dentist', time: '4:45', who: 'Alex' })[0].text).toBe('Next: Dentist at 4:45 · Alex');
    expect(nextEventChip({ title: 'Pizza night', time: '6:00', who: null })[0].text).toBe('Next: Pizza night at 6:00');
    expect(nextEventChip(null)).toEqual([]);
  });
});

describe('choresBarActions', () => {
  const waiting = { ...today, requests: [{ id: 'r1', kind: 'completion' as const, member: 'dana', name: 'Feed the fish', at: '' }] };
  const parentMode: Session = { token: 't', memberId: 'blair', parent: true, lastTouch: 0 };

  it('shows Waiting for OK and New chore on a shared screen', () => {
    expect(choresBarActions(waiting, view('shared'), null).map(a => a.label)).toEqual(['1 waiting for OK', 'New chore']);
  });

  it('keeps New chore in the bar in parent mode; the strip holds who, the countdown, and Lock (milestone 8, D2)', () => {
    expect(choresBarActions(waiting, view('shared'), parentMode).map(a => a.id)).toEqual(['inbox', 'add']);
    expect(choresStripActions(waiting)).toEqual([]);
  });

  it('shows a child\'s own login neither', () => {
    expect(choresBarActions(waiting, view('member', 'casey'), null)).toEqual([]);
  });

  it('leaves out Waiting for OK when nothing waits', () => {
    expect(choresBarActions(today, view('parent', 'alex'), null).map(a => a.id)).toEqual(['add']);
  });
});

describe('choresEnabled', () => {
  it('is on only when the household turned chores on', () => {
    expect(choresEnabled({ household: view('shared') })).toBe(true);
    expect(choresEnabled({ household: view('shared', null, {}) })).toBe(false);
    expect(choresEnabled({ household: null })).toBe(false);
  });
});

describe('refusalText (spec 15.1)', () => {
  const entry = { id: '1', op: 'complete' as const, occurrence: 'x', member: 'casey', name: 'Take out the trash', at: 0 };
  it('says what happened and what to do', () => {
    expect(refusalText(entry, 'period_closed')).toBe('Couldn\'t save "Take out the trash": the day had ended.');
    expect(refusalText(entry, 'pin_required')).toBe('Couldn\'t save "Take out the trash". The PIN timed out, so hold it again.');
    expect(refusalText(entry, 'not_open')).toBe('Couldn\'t save "Take out the trash". Try again.');
    // An Undo says what it couldn't do; someone else's open session needs this item's own PIN (review).
    expect(refusalText({ ...entry, op: 'undo' }, 'period_closed')).toBe('Couldn\'t uncheck "Take out the trash": the day had ended.');
    expect(refusalText({ ...entry, op: 'undo' }, 'not_open')).toBe('Couldn\'t uncheck "Take out the trash". Try again.');
    expect(refusalText(entry, 'other_pin_required')).toBe('Couldn\'t save "Take out the trash". It needs its owner\'s PIN or a parent\'s.');
  });
});

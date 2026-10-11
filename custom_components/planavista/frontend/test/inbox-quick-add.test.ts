import { describe, expect, it } from 'vitest';
import { answeredText, inboxGroups, whenText } from '../src/modules/chores/inbox-derive';
import {
  activityFrom,
  autoNeedsOk,
  byChips,
  everyChoices,
  newDraft,
  quickAddProblem,
  withWho,
  worthLine,
} from '../src/modules/chores/quick-add';
import { pictureFor } from '../src/modules/chores/picture-words';
import type { ChoreRequest } from '../src/modules/chores/chores-types';
import { MEMBERS, TODAY } from './chores-fixtures';

const REQUESTS: ChoreRequest[] = [
  { id: 'c1', kind: 'completion', member: 'dana', done_by: 'dana', name: 'Feed the fish', at: '2026-10-13T15:58:00-05:00', stars: 1, chore: 'feed_the_fish', occurrence: 'x' },
  { id: 'c2', kind: 'completion', member: 'casey', done_by: 'blair', name: 'Clean the bathroom', at: '2026-10-12T19:10:00-05:00', stars: 4, chore: 'clean_the_bathroom', occurrence: 'y' },
  { id: 'r1', kind: 'more_time', member: 'casey', name: 'Yard work', at: '2026-10-13T12:00:00-05:00', until: '2026-10-25', chore: 'yard_work', occurrence: 'z' },
  { id: 'r2', kind: 'skip', member: 'casey', name: 'Rake the leaves', at: '2026-10-13T12:05:00-05:00', chore: 'rake', occurrence: 'w' },
  { id: 'g1', kind: 'redemption', member: 'casey', name: 'Pick the weekend game', at: '2026-10-13T13:00:00-05:00', reward: 'game', cost: 10, balance: 23 },
  { id: 'g2', kind: 'redemption', member: 'dana', name: 'Movie night pick', at: '2026-10-13T13:00:00-05:00', reward: 'movie', cost: 40, balance: 12 },
];

describe('inboxGroups (spec 13.7)', () => {
  const groups = inboxGroups(REQUESTS, MEMBERS, TODAY, '12h');

  it('puts chores to check, requests, and rewards in their groups', () => {
    expect(groups.count).toBe(6);
    expect(groups.chores.map(r => r.id)).toEqual(['c1', 'c2']);
    expect(groups.requests.map(r => r.id)).toEqual(['r1', 'r2']);
    expect(groups.rewards.map(r => r.id)).toEqual(['g1', 'g2']);
  });

  it('words each the way the approved inbox does', () => {
    expect(groups.chores[0]).toMatchObject({ lead: 'Dana finished', what: 'Feed the fish', detail: 'Today at 3:58 PM · ★ 1', allow: 'Looks good', decline: 'Send back' });
    expect(groups.chores[1]).toMatchObject({ lead: 'Blair finished', tail: ' for Casey', detail: 'Yesterday at 7:10 PM · ★ 4' });
    expect(groups.requests[0]).toMatchObject({ lead: 'Casey asks for more time on', what: 'Yard work', detail: 'Move the due date to October 25', allow: 'Allow', decline: 'Not this time' });
    expect(groups.requests[1]).toMatchObject({ lead: 'Casey asks to skip', tail: ' this week' });
    expect(groups.rewards[0]).toMatchObject({ lead: 'Casey wants', detail: '★ 10 of 23', allow: 'Approve', blocked: false });
    expect(groups.rewards[1]).toMatchObject({ detail: '★ 40, and Dana has 12: not enough stars yet', blocked: true });
  });

  it('says what was done once a parent answers', () => {
    expect(answeredText(groups.chores[0], true)).toBe('Feed the fish: looks good.');
    expect(answeredText(groups.chores[0], false, 'Missed a spot')).toBe('Feed the fish went back: Missed a spot.');
    expect(answeredText(groups.rewards[0], true)).toBe('Pick the weekend game is Casey\'s.');
    expect(answeredText(groups.requests[0], false)).toBe('Not this time: Yard work.');
  });

  it('words when', () => {
    expect(whenText('2026-10-13T09:05:00-05:00', TODAY, '24h')).toBe('Today at 9:05');
    expect(whenText('2026-10-10T09:05:00-05:00', TODAY, '12h')).toBe('Saturday at 9:05 AM');
  });
});

describe('quick add (spec 13.8)', () => {
  it('turns Needs a parent\'s OK on for young children, until a parent sets it', () => {
    expect(autoNeedsOk(['dana'], MEMBERS)).toBe(true);
    let draft = withWho(newDraft(), ['casey'], MEMBERS);
    expect(draft.needsOk).toBe(false);
    draft = withWho(draft, ['casey', 'dana'], MEMBERS);
    expect(draft.needsOk).toBe(true);
    draft = withWho({ ...draft, needsOk: false, needsOkSet: true }, ['dana'], MEMBERS);
    expect(draft.needsOk).toBe(false);
  });

  it('offers Tomorrow, Saturday, and Sunday', () => {
    expect(byChips(TODAY).map(c => [c.day, c.label])).toEqual([
      ['2026-10-14', 'Tomorrow'], ['2026-10-17', 'Saturday'], ['2026-10-18', 'Sunday'],
    ]);
    expect(byChips('2026-10-16').map(c => c.label)).toEqual(['Tomorrow', 'Sunday']);
  });

  it('words its repeats from today', () => {
    expect(everyChoices(TODAY).map(c => c.label)).toEqual(['Every day', 'Every Tuesday', 'Every month on the 13th']);
    expect(everyChoices('2026-10-31')[2].label).toBe('Every month on the 28th');
    expect(everyChoices('2026-10-22')[2].label).toBe('Every month on the 22nd');
  });

  it('says what it earns, from the engine\'s formula', () => {
    expect(worthLine({ ...newDraft(), minutes: 60 }, 15)).toBe('Earns ★ 4 (1 per 15 minutes)');
    expect(worthLine({ ...newDraft(), minutes: 60, stars: 10 }, 15)).toBe('Earns ★ 10 each time');
  });

  it('says what is missing', () => {
    expect(quickAddProblem(newDraft(), TODAY)).toBe('Add what needs doing.');
    expect(quickAddProblem({ ...newDraft(), name: 'Wash the car' }, TODAY)).toBe('Pick who does it.');
    expect(quickAddProblem({ ...newDraft(), name: 'Wash the car', who: ['casey'], when: 'by' }, TODAY)).toBe('Pick a day to finish by.');
    expect(quickAddProblem({ ...newDraft(), name: 'Wash the car', who: ['casey'] }, TODAY)).toBeNull();
  });

  it('saves a Once chore for today or by a date, or a simple Repeats one', () => {
    const draft = { ...newDraft(), name: ' Clean out the garage ', who: ['casey'], minutes: 60, needsOk: true };
    expect(activityFrom(draft, TODAY)).toEqual({
      name: 'Clean out the garage', icon: '📦', category: 'other', assignees: ['casey'], on_board: true, needs_ok: true, stars: null,
      schedule: 'once', once: { on: TODAY, by: null, by_time: null, sessions: 1, estimate_minutes: 60 },
    });
    expect(activityFrom({ ...draft, when: 'by', by: '2026-10-17' }, TODAY).once).toMatchObject({ on: null, by: '2026-10-17' });
    expect(activityFrom({ ...draft, when: 'repeats', every: 'weekly' }, TODAY).repeats).toEqual({
      rrule: 'FREQ=WEEKLY;BYDAY=TU', start: TODAY, window: 'day', estimate_minutes: 60,
    });
    expect(activityFrom({ ...draft, when: 'repeats', every: 'monthly' }, '2026-10-30').repeats?.rrule).toBe('FREQ=MONTHLY;BYMONTHDAY=28');
  });
});

describe('pictureFor', () => {
  it('finds a picture in a name, or falls back', () => {
    expect(pictureFor('Take out the trash')).toBe('🗑️');
    expect(pictureFor('Swim practice', '📅')).toBe('🏊');
    expect(pictureFor('Rake the leaves')).toBe('🍂');
    expect(pictureFor('Something new')).toBe('⭐');
    expect(pictureFor('Book club', '📅')).toBe('📅');
  });
});

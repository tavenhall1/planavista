import { describe, expect, it } from 'vitest';
import {
  automationExample, beginChoreDraft, choreChanges, choreProblem, draftOf, evenShares, isDirty, okText, onceText,
  rebaseChore, sharesStatus, whenText, windowText, worthText,
} from '../src/modules/chores/settings/chore-draft';
import type { ChoreDraft } from '../src/modules/chores/settings/chore-draft';
import { MEMBERS, TODAY, activity } from './chores-fixtures';

const SETTINGS = { minutes_per_star: 15 };
const BATHROOM = activity('clean_the_bathroom', {
  name: 'Clean the bathroom', icon: '🛁', category: 'cleaning', assignees: ['blair', 'casey'], needs_ok: true,
  minimum: { hours: 2, per: 'week' }, split: 'shared', shares: { blair: 1, casey: 1 }, times: 1, days: [], time_of_day: [],
  type: 'need', locked: true, rev: 3,
});
const GARAGE = activity('clean_out_the_garage', {
  name: 'Clean out the garage', schedule: 'once', assignees: ['casey'], needs_ok: true,
  once: { on: null, by: '2026-10-18', by_time: null, sessions: 2, estimate_minutes: 240 },
});
const LEAVES = activity('rake_the_leaves', {
  name: 'Rake the leaves', schedule: 'repeats', assignees: ['casey'],
  repeats: { rrule: 'FREQ=WEEKLY;BYDAY=SA;UNTIL=20261130', start: '2026-10-17', window: 'day', estimate_minutes: 60 },
});

const edit = (draft: ChoreDraft, patch: Partial<ChoreDraft>): ChoreDraft => ({ ...draft, ...patch });

describe('a draft of a chore', () => {
  it('starts a new chore as a Plan chore of 15 minutes a day, for the person filtered to', () => {
    const record = beginChoreDraft(null, TODAY, ['dana']);
    expect(record.rev).toBeNull();
    expect(record.draft).toMatchObject({ schedule: 'plan', minutes: 15, per: 'day', assignees: ['dana'], on_board: true });
    expect(record.draft.recurrence.start).toBe(TODAY);
  });

  it('reads a saved chore in minutes', () => {
    const d = draftOf(BATHROOM, TODAY);
    expect(d).toMatchObject({ minutes: 120, per: 'week', split: 'shared', shares: { blair: 60, casey: 60 }, icon: '🛁' });
    expect(draftOf(GARAGE, TODAY)).toMatchObject({ once_when: 'by', date: '2026-10-18', sessions: 2, estimate: 240 });
    const leaves = draftOf(LEAVES, TODAY);
    expect(leaves.recurrence).toMatchObject({ freq: 'WEEKLY', byday: ['SA'], ends: 'until', until: '2026-11-30', start: '2026-10-17' });
    expect(leaves.estimate).toBe(60);
  });

  it('notices changes, and keeps this screen\'s on top of another screen\'s', () => {
    const record = beginChoreDraft(BATHROOM, TODAY);
    expect(record.rev).toBe(3);
    expect(isDirty(record)).toBe(false);
    const edited = { ...record, draft: edit(record.draft, { name: 'Bathroom' }) };
    expect(isDirty(edited)).toBe(true);
    const newer = { ...BATHROOM, needs_ok: false, rev: 4 };
    const rebased = rebaseChore(edited, newer, TODAY);
    expect(rebased.rev).toBe(4);
    expect(rebased.draft).toMatchObject({ name: 'Bathroom', needs_ok: false });
  });
});

describe('what Save sends', () => {
  it('sends a Plan chore in hours, with shares only while the time is split', () => {
    const record = beginChoreDraft(BATHROOM, TODAY);
    expect(choreChanges(record)).toEqual({
      name: 'Clean the bathroom', icon: '🛁', category: 'cleaning', schedule: 'plan', assignees: ['blair', 'casey'],
      needs_ok: true, stars: null, label: null, on_board: true, minimum: { hours: 2, per: 'week' }, split: 'shared',
      shares: { blair: 1, casey: 1 }, times: 1, days: [], time_of_day: [],
    });
    const one = { ...record, draft: edit(record.draft, { assignees: ['casey'] }) };
    expect(choreChanges(one)).toMatchObject({ split: 'each', shares: null });
  });

  it('sends a Once chore by its date and a Repeats chore by its rule', () => {
    expect(choreChanges(beginChoreDraft(GARAGE, TODAY)).once).toEqual({
      on: null, by: '2026-10-18', by_time: null, sessions: 2, estimate_minutes: 240,
    });
    const record = beginChoreDraft(LEAVES, TODAY);
    expect(choreChanges(record).repeats).toEqual({
      rrule: 'FREQ=WEEKLY;BYDAY=SA;UNTIL=20261130', start: '2026-10-17', window: 'day', estimate_minutes: 60,
    });
    const daily = { ...record, draft: edit(record.draft, { recurrence: { ...record.draft.recurrence, freq: 'DAILY' }, window: 'period' }) };
    expect(choreChanges(daily).repeats!.window).toBe('day');
  });

  it('turns off a to-do chore\'s OK for every check-off only when asked', () => {
    const record = beginChoreDraft(activity('brush_teeth', { needs_ok: true, needs_ok_always: true, minimum: { hours: 0.1, per: 'day' } }), TODAY);
    expect(choreChanges(record)).not.toHaveProperty('needs_ok_always');
    expect(choreChanges({ ...record, draft: edit(record.draft, { needs_ok: false, needs_ok_always: false }) }).needs_ok_always).toBe(false);
  });
});

describe('checks before saving', () => {
  const plan = draftOf(BATHROOM, TODAY);

  it('needs a name and shares that add up', () => {
    expect(choreProblem(edit(plan, { name: ' ' }), TODAY)).toBe('Add a name.');
    expect(choreProblem(edit(plan, { shares: { blair: 60, casey: 45 } }), TODAY)).toBe('Everyone\'s share has to add up to the time.');
    expect(choreProblem(plan, TODAY)).toBeNull();
  });

  it('needs a date from today on, and a rule that happens', () => {
    const once = draftOf(GARAGE, TODAY);
    expect(choreProblem(edit(once, { date: '2026-10-01' }), TODAY)).toBe('Pick today or a later day.');
    expect(choreProblem(edit(once, { date: '2026-10-01' }), TODAY, '2026-10-01')).toBeNull();
    const leaves = draftOf(LEAVES, TODAY);
    const never = edit(leaves, { recurrence: { ...leaves.recurrence, until: '2026-10-16' } });
    expect(choreProblem(never, TODAY)).toBe('This never happens. Pick another day or a later end date.');
  });

  it('says how the shares stand', () => {
    expect(sharesStatus(plan)).toEqual({ ok: true, text: '✓ The shares add up to 2 h.' });
    expect(sharesStatus(edit(plan, { shares: { blair: 60, casey: 30 } }))).toEqual({ ok: false, text: '30 min still unassigned.' });
    expect(sharesStatus(edit(plan, { shares: { blair: 90, casey: 45 } }))).toEqual({ ok: false, text: '15 min over the time.' });
    expect(evenShares(['blair', 'casey', 'dana'], 100)).toEqual({ blair: 40, casey: 30, dana: 30 });
  });
});

describe('the editor\'s lines', () => {
  it('says what each check-off is worth (spec 14.4)', () => {
    const plan = draftOf(BATHROOM, TODAY);
    expect(worthText(plan, SETTINGS, MEMBERS)).toBe('Each check-off is worth about 1 h and ★ 4.');
    expect(worthText(edit(plan, { shares: { blair: 90, casey: 30 } }), SETTINGS, MEMBERS)).toBe(
      'Each check-off is worth about 1 h 30 min and ★ 6 for Blair and 30 min and ★ 2 for Casey.',
    );
    expect(worthText(draftOf(GARAGE, TODAY), SETTINGS, MEMBERS)).toBe('Each session is worth about 2 h and ★ 8.');
    expect(worthText(draftOf(LEAVES, TODAY), SETTINGS, MEMBERS)).toBe('Each time is worth about 1 h and ★ 4.');
    expect(worthText(edit(draftOf(LEAVES, TODAY), { stars: 10 }), SETTINGS, MEMBERS)).toBe('Each time is worth about 1 h and ★ 10.');
  });

  it('says who waits for an OK', () => {
    const plan = draftOf(BATHROOM, TODAY);
    expect(okText(plan, MEMBERS)).toBe("Casey's check-offs wait for an OK. Blair is a parent, so Blair's count right away.");
    expect(okText(edit(plan, { needs_ok: false }), MEMBERS)).toBe('');
    expect(okText(edit(plan, { needs_ok: false, assignees: ['dana'] }), MEMBERS)).toBe(
      "Dana's check-offs still wait for an OK: every chore of Dana's needs one.",
    );
    expect(okText(edit(plan, { assignees: ['alex', 'casey', 'dana'] }), MEMBERS)).toBe(
      "Check-offs by Casey and Dana wait for an OK. Alex is a parent, so Alex's count right away.",
    );
  });

  it('explains when a chore shows', () => {
    const plan = draftOf(BATHROOM, TODAY);
    expect(whenText(plan)).toBe('No days or times picked, so any time this week works. It waits under This week on the board.');
    expect(whenText(edit(plan, { days: ['mon', 'thu'] }))).toBe('2 h split across 2 days.');
    const once = draftOf(GARAGE, TODAY);
    expect(onceText(once, TODAY)).toBe('On the board from today until Sunday. Each session is its own check-off.');
    expect(onceText(edit(once, { once_when: 'on', sessions: 1 }), TODAY)).toBe('On the board on October 18.');
    expect(windowText('make_up')).toBe("Not done on the day? The house rule decides. Right now that's: make it up within the week.");
  });

  it('writes a ready-to-copy automation', () => {
    expect(automationExample('clean_the_bathroom', 'casey')).toBe(
      'action: planavista.complete_chore\ndata:\n  member: casey\n  chore: clean_the_bathroom',
    );
  });
});

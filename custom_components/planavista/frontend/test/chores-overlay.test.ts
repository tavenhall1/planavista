import { describe, expect, it } from 'vitest';
import { localStamp, needsOk, statsOf, withQueued } from '../src/modules/chores/overlay';
import { activity, board, column, item, MEMBERS } from './chores-fixtures';

const TRASH = 'take_out_the_trash|casey|week:2026-10-12|0';
const CAT = 'cat_care|casey|day:2026-10-13|1';
const queued = (occurrence: string, op: 'complete' | 'undo', fields = {}) => ({
  id: 'q1', op, occurrence, member: 'casey', name: 'x', at: new Date(2026, 9, 13, 16, 12).getTime(), ...fields,
});

describe('withQueued (spec 11.6)', () => {
  const today = board({ casey: column([item(TRASH), item(CAT, { status: 'done' })]) });

  it('hands back the same board when nothing waits', () => {
    expect(withQueued(today, [])).toBe(today);
  });

  it('shows a waiting check-off as done, and counts it', () => {
    const shown = withQueued(today, [queued(TRASH, 'complete')]);
    const trash = shown.members.casey.items[0];
    expect(trash.status).toBe('done');
    expect(trash.completion).toMatchObject({ done_by: 'casey', state: 'done', at: '2026-10-13T16:12:00-05:00' });
    expect(shown.members.casey.today).toMatchObject({ due: 2, done: 2 });
    expect(shown.household).toEqual({ due: 2, done: 2, pending: 0 });
    expect(today.members.casey.items[0].status).toBe('open');
  });

  it('shows Waiting for approval when the check-off needs one, and who did it', () => {
    const shown = withQueued(today, [queued(TRASH, 'complete', { shows: 'pending', doneBy: 'blair' })]);
    expect(shown.members.casey.items[0]).toMatchObject({ status: 'pending', completion: { done_by: 'blair' } });
    expect(shown.members.casey.today.pending).toBe(1);
  });

  it('shows a waiting uncheck as open again', () => {
    const shown = withQueued(today, [queued(CAT, 'undo')]);
    expect(shown.members.casey.items[1]).toMatchObject({ status: 'open', completion: null });
    expect(shown.members.casey.today.done).toBe(0);
  });

  it('leaves items the feed already settled, and items it no longer has', () => {
    expect(withQueued(today, [queued(CAT, 'complete')])).toBe(today);
    expect(withQueued(today, [queued('gone|casey|once|0', 'complete')])).toBe(today);
  });
});

describe('statsOf', () => {
  it('counts what is due today, with Waiting for approval apart and excused or away left out', () => {
    const stats = statsOf([
      item('a|x|day:1|0', { status: 'done', credit_minutes: 30 }),
      item('b|x|day:1|0', { status: 'pending', credit_minutes: 10 }),
      item('c|x|day:1|0', { status: 'excused' }),
      item('d|x|week:1|0', { counted: false }),
      item('e|x|day:1|0'),
    ]);
    expect(stats).toEqual({ due: 3, done: 1, pending: 1, minutes_due: 55, minutes_done: 30, minutes_pending: 10 });
  });
});

describe('needsOk (spec 8.5)', () => {
  const [alex, , casey, dana] = MEMBERS;
  it('follows the doer\'s setting and the chore\'s mark', () => {
    expect(needsOk(alex, activity('laundry', { needs_ok: true }))).toBe(false);
    expect(needsOk(casey, activity('laundry'))).toBe(false);
    expect(needsOk(casey, activity('bathroom', { needs_ok: true }))).toBe(true);
    expect(needsOk(dana, activity('feed_the_fish'))).toBe(true);
    expect(needsOk({ ...casey, needs_ok_for: 'none' }, activity('brush', { needs_ok_always: true }))).toBe(true);
    expect(needsOk(undefined, activity('x'))).toBe(false);
  });
});

describe('localStamp', () => {
  it('writes a local time with its offset, as the engine does', () => {
    expect(localStamp(new Date(2026, 9, 13, 16, 10, 5).getTime())).toBe('2026-10-13T16:10:05-05:00');
    expect(localStamp(new Date(2026, 11, 1, 9, 0).getTime())).toBe('2026-12-01T09:00:00-06:00');
  });
});

import { describe, expect, it } from 'vitest';
import { rowChange, tileLine, tileRingFill } from '../src/modules/chores/hold-state';
import type { RowModel } from '../src/modules/chores/board-derive';
import { item } from './chores-fixtures';

function row(key: string, state: RowModel['state']): RowModel {
  return { key, item: item(key, { status: state }), name: key.split('|')[0], icon: null, label: null, badge: null, meta: '', state };
}

// Round 2: a sent-back chore's tile looked untouched (no words, no glyph), so the
// note never reached the young child it was for; a row said "↩ Sent back: Missed a spot".
describe("a picture tile's line under the name", () => {
  const sentBack = { ...row('tidy_toys|dana|day:2026-10-13|0', 'sent_back'), badge: { words: 'Sent back: Missed a spot', tone: 'bad' as const, glyph: '↩' } };

  it('says it was sent back and why, in the badge words', () => {
    expect(tileLine(sentBack, 0, false, 1)).toEqual({ kind: 'bad', text: '↩ Sent back: Missed a spot' });
  });

  it('says it waits for approval, keeps holding, or asks for a hold on the big tile', () => {
    expect(tileLine(row('a|dana|x|0', 'pending'), 0, false, 1)).toEqual({ kind: 'waiting', text: '⏳ Waiting for approval' });
    expect(tileLine(sentBack, 0.4, false, 1)).toEqual({ kind: 'hint', text: 'Keep holding… ⭐ +1' });
    expect(tileLine(row('a|dana|x|0', 'open'), 0, true, 0)).toEqual({ kind: 'hint', text: 'Hold me' });
    expect(tileLine(row('a|dana|x|0', 'open'), 0, false, 0)).toEqual({ kind: 'hint', text: '' });
    expect(tileLine(row('a|dana|x|0', 'done'), 0.5, true, 1)).toEqual({ kind: 'hint', text: '' });
  });
});

const FISH = 'feed_the_fish|dana|day:2026-10-13|0';
const TABLE = 'set_the_table|dana|day:2026-10-13|0';

describe('rowChange (spec 13.2: a hold target handed a row)', () => {
  it('forgets a finished hold when the element now shows another chore, without celebrating', () => {
    expect(rowChange(row(FISH, 'open'), row(TABLE, 'open'))).toBe('reset');
    expect(rowChange(row('yard_work|casey|week:2026-10-12|0', 'open'), row('yard_work|casey|week:2026-10-12|1', 'open'))).toBe('reset');
  });

  it('ends the hold when its own chore changes state (the answer came)', () => {
    expect(rowChange(row(FISH, 'open'), row(FISH, 'pending'))).toBe('answered');
    expect(rowChange(row(FISH, 'done'), row(FISH, 'open'))).toBe('answered');
  });

  it('does nothing for the first row or the same one again', () => {
    expect(rowChange(undefined, row(FISH, 'open'))).toBe('none');
    expect(rowChange(row(FISH, 'open'), row(FISH, 'open'))).toBe('none');
  });
});

// Seen on the kitchen tablet (1.6.1): a done tile drew an empty, faded track
// under its check, which read as "not started". A done chore's ring is closed,
// as a person's ring is when their day is done, and holding it to uncheck
// drains it.
describe("a picture tile's ring", () => {
  it('fills as an open chore is held, and stays full while the answer comes', () => {
    expect(tileRingFill('open', false, 0)).toBe(0);
    expect(tileRingFill('open', false, 0.4)).toBe(0.4);
    expect(tileRingFill('open', true, 0.4)).toBe(1);
  });

  it('is closed when the chore is done, and drains as it is held to uncheck', () => {
    expect(tileRingFill('done', false, 0)).toBe(1);
    expect(tileRingFill('done', false, 0.25)).toBe(0.75);
    expect(tileRingFill('done', true, 0.25)).toBe(0);
  });

  it('stays empty while it waits for approval', () => {
    expect(tileRingFill('pending', false, 0)).toBe(0);
  });
});

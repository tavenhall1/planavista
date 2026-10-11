import { describe, expect, it } from 'vitest';
import { rowChange } from '../src/modules/chores/hold-state';
import type { RowModel } from '../src/modules/chores/board-derive';
import { item } from './chores-fixtures';

function row(key: string, state: RowModel['state']): RowModel {
  return { key, item: item(key, { status: state }), name: key.split('|')[0], icon: null, label: null, badge: null, meta: '', state };
}

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

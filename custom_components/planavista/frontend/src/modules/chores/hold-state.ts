import type { RowModel } from './board-derive';

/** What a hold target does when it is handed a row (spec 13.2). */
export type RowChange = 'none' | 'reset' | 'answered';

/**
 * - `reset`: it now shows a different chore (a list reused the element, or a
 *   floating chore moved on to its next check-off), so a finished hold is
 *   forgotten without a celebration;
 * - `answered`: its own chore changed state (the check-off's answer came), so
 *   the hold is over, with a celebration when it became done or waiting;
 * - `none`: nothing to do.
 */
export function rowChange(before: RowModel | undefined, row: RowModel): RowChange {
  if (!before) return 'none';
  if (before.key !== row.key) return 'reset';
  return before.state !== row.state ? 'answered' : 'none';
}

/**
 * How full a picture tile's ring is drawn: a hold fills it, and it stays full
 * while the answer comes. A done chore's ring is closed, as a person's ring is
 * when their day is done, and holding it to uncheck drains it (1.6.2: a done
 * tile drew an empty, faded track that read as "not started").
 */
export function tileRingFill(state: RowModel['state'], held: boolean, fill: number): number {
  const progress = held ? 1 : fill;
  return state === 'done' ? 1 - progress : progress;
}

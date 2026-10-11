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

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

export interface TileLine {
  /** 'waiting' (indigo), 'bad' (red, as a row's badge), or a plain hint. */
  kind: 'waiting' | 'bad' | 'hint';
  text: string;
}

/**
 * The line under a picture tile's name (spec 11.4: Waiting for approval and
 * Sent back are spelled out even on picture tiles). A sent-back chore says so
 * and why, in its badge's words, until a hold starts (round 2: the tile looked
 * untouched, so the parent's note never reached the child).
 */
export function tileLine(row: RowModel, fill: number, large: boolean, stars: number): TileLine {
  const done = row.state === 'done';
  if (row.state === 'pending') return { kind: 'waiting', text: '⏳ Waiting for approval' };
  if (fill > 0 && !done) return { kind: 'hint', text: `Keep holding… ${stars > 0 ? `⭐ +${stars}` : ''}`.trim() };
  // Overdue from an earlier day, it says so beside today's copy (round 9: two tiles looked the same;
  // round 10: one never done looked like today's too).
  const day = overdueDay(row);
  if (row.state === 'sent_back') return { kind: 'bad', text: `↩ ${row.badge?.words ?? 'Sent back'}${day ? ` · from ${day}` : ''}` };
  if (day && !done) return { kind: 'bad', text: `Overdue since ${day}` };
  return { kind: 'hint', text: large && !done ? 'Hold me' : '' };
}

function overdueDay(row: RowModel): string | null {
  const since = row.item.overdue_since;
  if (!since) return null;
  return row.overdueDay ?? new Date(`${since}T12:00:00`).toLocaleDateString('en-US', { weekday: 'short' });
}

/** What a picture tile says to a screen reader, overdue included (round 10). */
export function tileLabel(row: RowModel): string {
  if (row.state === 'done') return `${row.name}, done. Hold to uncheck`;
  if (row.state === 'pending') return `${row.name}, waiting for approval`;
  const day = overdueDay(row);
  const since = day ? `, overdue since ${day}` : '';
  if (row.state === 'sent_back') return `${row.name}, ${row.badge?.words ?? 'sent back'}${since}. Hold to complete`;
  return since ? `${row.name}${since}. Hold to complete` : `Hold to complete ${row.name}`;
}

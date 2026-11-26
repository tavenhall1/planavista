import { daysBetween } from '../../core/status-map';
import type { ItemView } from './chores-types';

/** How near an item's own deadline is: calm (4+ days or none), amber (3), soon (2), last (1 or less). */
export type Urgency = 'calm' | 'amber' | 'soon' | 'last';

/**
 * Days left to the item's own deadline, today included (the meaning
 * `board.week.days_left` has): a week window ends with the week, a month window
 * on its due day, a dated one-time chore on its due day. Daily and undated
 * items have no deadline of their own.
 */
export function daysToDeadline(item: ItemView, today: string, board: { week: { end: string } }): number | null {
  if (item.window === 'week') return Math.max(0, daysBetween(today, board.week.end));
  if (item.window === 'month' && item.due_day) return Math.max(0, daysBetween(today, item.due_day) + 1);
  if (item.window === 'once' && item.dated && item.due_day) return Math.max(0, daysBetween(today, item.due_day) + 1);
  return null;
}

export function urgencyOf(days: number | null): Urgency {
  if (days === null || days >= 4) return 'calm';
  if (days === 3) return 'amber';
  if (days === 2) return 'soon';
  return 'last';
}

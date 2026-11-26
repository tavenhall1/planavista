import type { GlanceChip, ModuleAction } from '../../core/module-registry';
import type { HouseholdView } from '../../core/household';
import type { Session } from '../../core/session';
import { mayEverReview, parentAccess } from '../../core/access';
import type { Board } from './chores-types';

/** "2 missed": the rows at the top of the Board that missed before (missed-and-urgency spec 3), or null when none. */
export function missedChip(board: Board | null): string | null {
  const total = board?.missed_total ?? 0;
  return total > 0 ? `${total} missed` : null;
}

/**
 * What the header says about chores (spec 12.2): "9 of 17 chores done today", on
 * every module, and "2 missed" beside it, even on a day with nothing due.
 */
export function choresGlance(board: Board | null): GlanceChip[] {
  if (!board) return [];
  const chips: GlanceChip[] = [];
  const { due, done, pending } = board.household;
  if (due > 0) {
    const finished = Math.min(due, done + pending);
    chips.push({
      id: 'chores',
      text: finished >= due ? `All ${due} chores done today` : `${finished} of ${due} chores done today`,
      progress: finished / due,
      primary: true,
      open: { module: 'chores', view: 'board' },
    });
  }
  const missed = missedChip(board);
  if (missed) chips.push({ id: 'missed', text: missed, tone: 'bad', primary: true, open: { module: 'chores', view: 'board' } });
  return chips;
}

/** "Next: Dentist at 4:45 · Alex" from the household's calendars, for the portrait header. */
export function nextEventChip(next: { title: string; time: string; who: string | null } | null): GlanceChip[] {
  if (!next) return [];
  return [{
    id: 'next',
    text: `Next: ${next.title} at ${next.time}${next.who ? ` · ${next.who}` : ''}`,
    open: { module: 'calendar' },
  }];
}

/**
 * The Chores bar's buttons (spec 12.2, 13.7, 13.8): "⏳ n to approve"
 * when something waits and this screen can ever review it, and Add chore for
 * anyone who can become a parent here. In parent mode, Add chore moves to
 * the parent-mode strip.
 */
export function choresBarActions(board: Board | null, view: HouseholdView | null, session: Session | null): ModuleAction[] {
  if (!board) return [];
  const actions: ModuleAction[] = [];
  const waiting = board.requests.length;
  if (waiting > 0 && mayEverReview(view)) {
    actions.push({ id: 'inbox', label: `${waiting} to approve`, short: String(waiting), glyph: '⏳', tone: 'act' });
  }
  const access = parentAccess(view, session);
  if (access !== 'no') actions.push({ id: 'add', label: 'New chore', short: '', glyph: '+' });
  return actions;
}

/** The parent-mode strip holds who, the countdown, and Lock; New chore stays in the bar (milestone 8, D2). */
export function choresStripActions(_board: Board | null): ModuleAction[] {
  return [];
}

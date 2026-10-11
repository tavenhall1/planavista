import type { GlanceChip, ModuleAction } from '../../core/module-registry';
import type { HouseholdView } from '../../core/household';
import type { Session } from '../../core/session';
import { mayEverReview, parentAccess } from '../../core/access';
import type { Board } from './chores-types';

/** What the header says about chores (spec 12.2): "9 of 17 chores done today", on every module. */
export function choresGlance(board: Board | null): GlanceChip[] {
  if (!board) return [];
  const { due, done, pending } = board.household;
  if (due === 0) return [];
  const finished = Math.min(due, done + pending);
  return [{
    id: 'chores',
    text: finished >= due ? `All ${due} chores done today` : `${finished} of ${due} chores done today`,
    progress: finished / due,
    primary: true,
    open: { module: 'chores', view: 'board' },
  }];
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
 * The Chores bar's buttons (spec 12.2, 13.7, 13.8): "⏳ n waiting for OK"
 * when something waits and this screen can ever review it, and Add chore for
 * anyone who can become a parent here. In parent mode, Add chore moves to
 * the parent-mode strip.
 */
export function choresBarActions(board: Board | null, view: HouseholdView | null, session: Session | null): ModuleAction[] {
  if (!board) return [];
  const actions: ModuleAction[] = [];
  const waiting = board.requests.length;
  if (waiting > 0 && mayEverReview(view)) {
    actions.push({ id: 'inbox', label: `${waiting} waiting for OK`, glyph: '⏳', tone: 'act' });
  }
  const access = parentAccess(view, session);
  if (access !== 'no' && !session?.parent) actions.push({ id: 'add', label: 'Add chore', glyph: '+' });
  return actions;
}

/** The parent-mode strip's button (spec 9.4). */
export function choresStripActions(board: Board | null): ModuleAction[] {
  return board ? [{ id: 'add', label: 'Add chore', glyph: '+' }] : [];
}

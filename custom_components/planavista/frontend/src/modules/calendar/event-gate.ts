import { eventAccess, eventPinChoices } from '../../core/access';
import type { HouseholdView } from '../../core/household';
import type { PinGate } from '../../core/pin-gate';
import type { Session } from '../../core/session';
import type { CalendarConfig, CalendarEvent } from '../../types';
import { ownersOf } from './calendar-derive';
import { changeReason, lockedEventNote } from './event-words';

/**
 * Who may change calendar events on this screen (milestone 8, D1), for the
 * details sheet and the editor: whether Edit and Delete show at all, and the
 * PIN to ask for before a change. The card's rule; Home Assistant's own
 * calendar stays as it allows.
 */
export interface EventGate {
  /** Whether this screen may ever change an event on these calendars (Edit and Delete show). */
  allowed(calendarIds: readonly string[]): boolean;
  /** Ask for a PIN when one is needed; true when the change may go ahead. */
  ask(calendarIds: readonly string[], summary: string, mode?: 'change' | 'add' | 'delete'): Promise<boolean>;
  /** The note under an event this screen may not change. */
  note(calendarIds: readonly string[]): string;
}

export interface GateState {
  view: HouseholdView | null;
  session: Session | null;
  pinGate?: PinGate;
  rows: readonly CalendarConfig[];
}

/** The calendars an event is on: every person's copy, or its own calendar. */
export function calendarsOf(event: CalendarEvent): string[] {
  const shared = (event as { shared_calendars?: Array<{ entity_id: string }> }).shared_calendars ?? [];
  return shared.length ? shared.map(c => c.entity_id) : [event.calendar_entity_id];
}

/** A gate that reads the module's state each time it is asked. */
export function eventGate(state: () => GateState): EventGate {
  return {
    allowed(calendarIds) {
      const { view, session, rows } = state();
      return eventAccess(view, session, ownersOf(calendarIds, rows)) !== 'no';
    },
    async ask(calendarIds, summary, mode = 'change') {
      const { view, session, pinGate, rows } = state();
      const owners = ownersOf(calendarIds, rows);
      const access = eventAccess(view, session, owners);
      if (access === 'yes') return true;
      if (access === 'no' || !pinGate) return false;
      const { heading, reason } = changeReason(summary, mode);
      return pinGate.ask(eventPinChoices(view, owners), heading, reason);
    },
    note(calendarIds) {
      const { view, rows } = state();
      const owners = ownersOf(calendarIds, rows);
      const names = owners.length === 1 && owners[0] ? [view?.members.find(m => m.id === owners[0])?.name ?? ''] : [];
      return lockedEventNote(names.filter(Boolean));
    },
  };
}

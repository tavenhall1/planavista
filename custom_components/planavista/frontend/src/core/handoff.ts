import type { Toast } from './pv-toast';

/**
 * A card rebuilt after a reconnect picks up where the old one was (round 3).
 * When the connection comes back, Home Assistant makes the card again, and
 * what was open went with the old element without a word: an event being
 * typed, the PIN keypad half entered, the toast saying parent mode ended. A
 * card that leaves the page soon after the connection dropped leaves a note
 * by its place (core/place.ts placeKey); the new card for the same place
 * takes it as it starts. A card that leaves with the connection never having
 * dropped (a dashboard edited, a page left) leaves nothing.
 */
export const DROP_MS = 10 * 60_000;
export const TAKE_MS = 15_000;

export interface Handoff {
  /** The PIN keypad was open: its digits are never kept, so it says so. */
  pin: boolean;
  /** The toast that was showing. */
  toast: Toast | null;
  /** Each module's own note (its `handoff()`), by module id. */
  modules: Record<string, unknown>;
}

export class Handoffs {
  private _dropped: number | null = null;
  private _notes = new Map<string, { note: Handoff; at: number }>();

  /** The connection dropped. */
  dropped(now: number): void {
    this._dropped = now;
  }

  /** A card leaves the page with `note` open. */
  leave(key: string, note: Handoff, now: number): void {
    const open = note.pin || note.toast !== null || Object.keys(note.modules).length > 0;
    if (!open || this._dropped === null || now - this._dropped > DROP_MS) return;
    this._notes.set(key, { note, at: now });
  }

  /** What the old card for this place had open, once. */
  take(key: string, now: number): Handoff | null {
    const kept = this._notes.get(key);
    this._notes.delete(key);
    return kept && now - kept.at <= TAKE_MS ? kept.note : null;
  }
}

/** The page's notes: every card on it shares them. */
export const PAGE_HANDOFFS = new Handoffs();

/** What the new card says: that the keypad closed, else the toast that was showing. */
export function handoffToast(note: Handoff): Toast | null {
  if (note.pin) return { id: `handoff-${note.toast?.id ?? 'pin'}`, text: 'The connection dropped, so the PIN closed. Try again.' };
  // Its buttons answered to the old card.
  return note.toast ? { id: note.toast.id, text: note.toast.text, ...(note.toast.tone ? { tone: note.toast.tone } : {}) } : null;
}

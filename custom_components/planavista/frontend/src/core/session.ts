/**
 * A parent-mode or member session on this card (spec 9.4). The backend
 * decides; the card mirrors the backend's clock, which restarts each time a
 * touch reaches it, so the countdown never promises time the backend
 * won't give.
 */
export const SESSION_IDLE_MS = 120_000;
export const TOUCH_EVERY_MS = 30_000;

export interface Session {
  token: string;
  memberId: string;
  parent: boolean;
  /** When the backend last heard from this card (ms). */
  lastTouch: number;
}

export function startSession(result: { session: string; member_id: string; parent: boolean }, now: number): Session {
  return { token: result.session, memberId: result.member_id, parent: result.parent, lastTouch: now };
}

export function remainingMs(session: Session, now: number): number {
  return Math.max(0, session.lastTouch + SESSION_IDLE_MS - now);
}

export function expired(session: Session, now: number): boolean {
  return remainingMs(session, now) === 0;
}

/** Someone touched the card: whether to tell the backend now (at most every 30 seconds). */
export function noteActivity(session: Session, now: number): { session: Session; touch: boolean } {
  if (now - session.lastTouch < TOUCH_EVERY_MS) return { session, touch: false };
  return { session: { ...session, lastTouch: now }, touch: true };
}

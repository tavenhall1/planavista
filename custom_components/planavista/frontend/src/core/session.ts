/**
 * A parent-mode or member session on this card (spec 9.4). The backend
 * decides; the card mirrors the backend's clock, which restarts each time a
 * touch reaches it, so the countdown never promises time the backend
 * won't give. Since milestone 8 the household picks both limits (D3): how
 * long a quiet session lasts (Lock after no touches) and when any session
 * ends however busy (Parent mode ends after).
 */
export const SESSION_IDLE_MS = 120_000;
export const PARENT_MODE_MS = 10 * 60_000;
export const TOUCH_EVERY_MS = 30_000;

export interface Session {
  token: string;
  memberId: string;
  parent: boolean;
  /** When the backend last heard from this card (ms). */
  lastTouch: number;
  /** When the PIN opened it (ms). */
  startedAt: number;
  /** How long a quiet session lasts (ms). */
  idleMs: number;
  /** When the session ends however busy (ms since the epoch). */
  capAt: number;
}

export function startSession(
  result: { session: string; member_id: string; parent: boolean; idle_seconds?: number; cap_in?: number },
  now: number,
): Session {
  return {
    token: result.session,
    memberId: result.member_id,
    parent: result.parent,
    lastTouch: now,
    startedAt: now,
    idleMs: result.idle_seconds ? result.idle_seconds * 1000 : SESSION_IDLE_MS,
    capAt: now + (result.cap_in ? result.cap_in * 1000 : PARENT_MODE_MS),
  };
}

/** New limits saved while the session is open: the backend reads them at every check, so the card does too. */
export function withLimits(session: Session, idleSeconds: number | undefined, capMinutes: number | undefined): Session {
  const idleMs = idleSeconds ? idleSeconds * 1000 : session.idleMs;
  const capAt = capMinutes ? session.startedAt + capMinutes * 60_000 : session.capAt;
  if (idleMs === session.idleMs && capAt === session.capAt) return session;
  return { ...session, idleMs, capAt };
}

/** When the session ends unless someone touches the screen first (ms since the epoch). */
export function endsAt(session: Session): number {
  return Math.min(session.lastTouch + session.idleMs, session.capAt);
}

export function remainingMs(session: Session, now: number): number {
  return Math.max(0, endsAt(session) - now);
}

export function expired(session: Session, now: number): boolean {
  return remainingMs(session, now) === 0;
}

/** The backend accepted a command made with the session, which counts as a touch there. */
export function usedAt(session: Session, now: number): Session {
  return now > session.lastTouch ? { ...session, lastTouch: now } : session;
}

/** How often to tell the backend about touches: every 30 seconds, or sooner when the quiet time is short. */
export function touchEveryMs(session: Session): number {
  return Math.min(TOUCH_EVERY_MS, session.idleMs / 4);
}

/** Someone touched the card: whether to tell the backend now. */
export function noteActivity(session: Session, now: number): { session: Session; touch: boolean } {
  if (now - session.lastTouch < touchEveryMs(session)) return { session, touch: false };
  return { session: { ...session, lastTouch: now }, touch: true };
}

/** A parent's session and a child's window share one strip (D5); only the words differ. */
export function sessionWords(parent: boolean): { mode: string; ends: string } {
  return parent ? { mode: 'parent mode', ends: 'Parent mode ends in' } : { mode: 'unlocked', ends: 'Locks in' };
}

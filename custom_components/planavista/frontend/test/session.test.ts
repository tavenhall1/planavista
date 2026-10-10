import { describe, expect, it } from 'vitest';
import { SESSION_IDLE_MS, TOUCH_EVERY_MS, expired, noteActivity, remainingMs, startSession } from '../src/core/session';

const UNLOCKED = { session: 'token', member_id: 'blair', parent: true };

describe('session', () => {
  it('starts with two minutes left', () => {
    const session = startSession(UNLOCKED, 1000);
    expect(session).toEqual({ token: 'token', memberId: 'blair', parent: true, lastTouch: 1000 });
    expect(remainingMs(session, 1000)).toBe(SESSION_IDLE_MS);
  });

  it('runs out after two minutes without a touch the backend heard', () => {
    const session = startSession(UNLOCKED, 0);
    expect(remainingMs(session, 119_000)).toBe(1000);
    expect(expired(session, 119_999)).toBe(false);
    expect(expired(session, 120_000)).toBe(true);
  });

  it('tells the backend about activity at most every 30 seconds', () => {
    const session = startSession(UNLOCKED, 0);
    const soon = noteActivity(session, TOUCH_EVERY_MS - 1);
    expect(soon.touch).toBe(false);
    expect(soon.session).toBe(session);
    const later = noteActivity(session, TOUCH_EVERY_MS);
    expect(later.touch).toBe(true);
    expect(remainingMs(later.session, TOUCH_EVERY_MS)).toBe(SESSION_IDLE_MS);
  });
});

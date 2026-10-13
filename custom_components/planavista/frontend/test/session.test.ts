import { describe, expect, it } from 'vitest';
import {
  SESSION_IDLE_MS, TOUCH_EVERY_MS, expired, noteActivity, remainingMs, sessionWords, spokenTimeLeft, startSession, touchEveryMs, usedAt, withLimits,
} from '../src/core/session';

const UNLOCKED = { session: 'token', member_id: 'blair', parent: true };

describe('session', () => {
  it('starts with two minutes left', () => {
    const session = startSession(UNLOCKED, 1000);
    expect(session).toEqual({ token: 'token', memberId: 'blair', parent: true, lastTouch: 1000, startedAt: 1000, idleMs: SESSION_IDLE_MS, capAt: 601_000, mayExitKiosk: false });
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

  it('lasts as long as the household chose (Lock after no touches)', () => {
    const session = startSession({ ...UNLOCKED, idle_seconds: 30, cap_in: 300 }, 0);
    expect(remainingMs(session, 0)).toBe(30_000);
    expect(expired(session, 30_000)).toBe(true);
  });

  it('never outlasts Parent mode ends after, however often someone touches', () => {
    let session = startSession({ ...UNLOCKED, idle_seconds: 120, cap_in: 300 }, 0);
    for (let now = 30_000; now <= 270_000; now += 30_000) session = noteActivity(session, now).session;
    expect(remainingMs(session, 270_000)).toBe(30_000);
    expect(expired(session, 300_000)).toBe(true);
  });

  it('tells the backend often enough for a short quiet time', () => {
    const short = startSession({ ...UNLOCKED, idle_seconds: 30, cap_in: 300 }, 0);
    expect(touchEveryMs(short)).toBe(7_500);
    expect(noteActivity(short, 7_500).touch).toBe(true);
    expect(touchEveryMs(startSession({ ...UNLOCKED, idle_seconds: 300, cap_in: 900 }, 0))).toBe(TOUCH_EVERY_MS);
  });

  it("names a parent's session and a child's window the same way, with their own words", () => {
    expect(sessionWords(true)).toEqual({ mode: 'parent mode', ends: 'Parent mode ends in' });
    expect(sessionWords(false)).toEqual({ mode: 'unlocked', ends: 'Locks in' });
  });

  it('follows new limits saved while it is open, as the backend does', () => {
    const session = startSession({ ...UNLOCKED, idle_seconds: 120, cap_in: 600 }, 0);
    const shorter = withLimits(session, 30, 5);
    expect(shorter.idleMs).toBe(30_000);
    expect(shorter.capAt).toBe(300_000);
    expect(remainingMs(shorter, 0)).toBe(30_000);
    expect(withLimits(session, 120, 10)).toBe(session);
    expect(withLimits(session, undefined, undefined)).toBe(session);
  });

  it('a command the backend accepted with the session counts as a touch', () => {
    const session = startSession({ ...UNLOCKED, idle_seconds: 30, cap_in: 300 }, 0);
    expect(remainingMs(usedAt(session, 20_000), 20_000)).toBe(30_000);
    expect(usedAt(session, 280_000).lastTouch).toBe(280_000);
    expect(remainingMs(usedAt(session, 280_000), 280_000)).toBe(20_000);
  });

  it('says the time left the way a person would, in 10-second steps (review)', () => {
    expect(spokenTimeLeft(30_000)).toBe('30 s');
    expect(spokenTimeLeft(25_500)).toBe('30 s');
    expect(spokenTimeLeft(110_000)).toBe('1 min 50 s');
    expect(spokenTimeLeft(120_000)).toBe('2 min');
    expect(spokenTimeLeft(0)).toBe('0 s');
  });
});

import { describe, expect, it } from 'vitest';
import {
  IDLE_MS,
  REVEAL,
  confettiPieces,
  holdPose,
  idleOffset,
  mayOpenSurprise,
  revealWords,
  surpriseOf,
  surpriseWords,
} from '../src/modules/chores/surprise-derive';
import type { BoardMember, Reward } from '../src/modules/chores/chores-types';
import type { HouseholdView } from '../src/core/household';

const ICE_CREAM: Reward = { id: 'ice_cream_trip', name: 'Ice cream trip', icon: '🍦', cost: 3, needs_ok: true, who: [] };
const STICKER: Reward = { id: 'sticker', name: 'Sticker', icon: null, cost: 2, needs_ok: false, who: [] };

const entry = (surprise: BoardMember['surprise']): BoardMember => ({ surprise } as BoardMember);

const view = (account: Partial<HouseholdView['account']>, sharedScreens = 1): HouseholdView => ({
  account: { user_id: 'u', name: 'U', is_admin: false, shared: false, kind: 'other', member_id: null, parent_level: false, ...account },
  security: { shared_screens: sharedScreens },
} as unknown as HouseholdView);

describe("a member's surprise (milestone 10)", () => {
  it('comes from the feed, with the reward it is for', () => {
    expect(surpriseOf('dana', entry({ reward: 'ice_cream_trip', opened: false }), [ICE_CREAM])).toEqual({
      memberId: 'dana', reward: ICE_CREAM, opened: false,
    });
    expect(surpriseOf('dana', entry(null), [ICE_CREAM])).toBeNull();
    expect(surpriseOf('dana', entry(undefined), [ICE_CREAM])).toBeNull(); // an older backend
    expect(surpriseOf('dana', entry({ reward: 'gone', opened: false }), [ICE_CREAM])).toBeNull();
    expect(surpriseOf('dana', undefined, [ICE_CREAM])).toBeNull();
  });
});

describe('who may open it', () => {
  it('opens on a shared screen and on the child\'s own login', () => {
    expect(mayOpenSurprise(view({ kind: 'shared', shared: true }), 'dana')).toBe(true);
    expect(mayOpenSurprise(view({ kind: 'other' }), 'dana')).toBe(true);
    expect(mayOpenSurprise(view({ kind: 'member', member_id: 'dana' }), 'dana')).toBe(true);
  });

  it("waits on a parent's phone, a sibling's login, and an admin's own login", () => {
    expect(mayOpenSurprise(view({ kind: 'parent', member_id: 'alex', parent_level: true }), 'dana')).toBe(false);
    expect(mayOpenSurprise(view({ kind: 'member', member_id: 'casey' }), 'dana')).toBe(false);
    expect(mayOpenSurprise(view({ kind: 'admin', is_admin: true, parent_level: true }), 'dana')).toBe(false);
    expect(mayOpenSurprise(null, 'dana')).toBe(false);
  });

  it('opens on any login when the household has no shared screens', () => {
    expect(mayOpenSurprise(view({ kind: 'parent', member_id: 'alex', parent_level: true }, 0), 'dana')).toBe(true);
  });
});

describe('its words', () => {
  // Review B9: the same teen read "Hold to open" on the board and "Hold me" on My day.
  it('says whose it is and how to open it, the same words on every screen', () => {
    expect(surpriseWords('Dana', true, true)).toEqual({ title: 'A surprise for Dana!', hint: 'Hold me' });
    expect(surpriseWords('Casey', true, false)).toEqual({ title: 'A surprise for Casey!', hint: 'Hold to open' });
    expect(surpriseWords('Dana', false, true)).toEqual({ title: 'A surprise for Dana!', hint: 'Waiting for Dana to open it' });
  });

  it("the reveal names them and the reward's own button", () => {
    expect(revealWords('Dana', ICE_CREAM)).toEqual({ title: 'Dana, you did it!', reward: 'Ice cream trip', button: '🙋 Ask for it', asked: false });
    expect(revealWords('Dana', STICKER).button).toBe('🎉 Get it');
    // Review B3: Watch it again offered Ask for it while that ask waited, and filed it twice.
    expect(revealWords('Dana', ICE_CREAM, true)).toEqual({ title: 'Dana, you did it!', reward: 'Ice cream trip', button: '⏳ Waiting for approval', asked: true });
  });
});

describe('the hold is the reveal\'s first act', () => {
  it('shakes harder, faster, and higher as it fills', () => {
    expect(holdPose(0)).toEqual({ angle: 0, rise: 0, scale: 1, period: 180 });
    const half = holdPose(0.5);
    const full = holdPose(1);
    expect(full).toEqual({ angle: 6, rise: 10, scale: 1.08, period: 80 });
    expect(half.angle).toBeGreaterThan(0);
    expect(half.angle).toBeLessThan(full.angle);
    expect(half.period).toBeGreaterThan(full.period);
  });

  it('never goes past a full hold', () => {
    expect(holdPose(1.4)).toEqual(holdPose(1));
    expect(holdPose(-1)).toEqual(holdPose(0));
  });
});

describe('the reveal', () => {
  it('runs in order: fly, shake, lid, reward, words, buttons, about 4 seconds', () => {
    const marks = [REVEAL.shakeAt, REVEAL.lidAt, REVEAL.riseAt, REVEAL.wordsAt, REVEAL.buttonsAt, REVEAL.endAt];
    expect([...marks].sort((a, b) => a - b)).toEqual(marks);
    expect(REVEAL.flyMs).toBeLessThanOrEqual(REVEAL.shakeAt);
    expect(REVEAL.endAt).toBeGreaterThanOrEqual(3500);
    expect(REVEAL.endAt).toBeLessThanOrEqual(4500);
  });

  it("throws confetti across the screen in the child's color and gold, the same for the same seed", () => {
    const pieces = confettiPieces(80, 7, '#E5484D');
    expect(pieces).toHaveLength(80);
    expect(confettiPieces(80, 7, '#E5484D')).toEqual(pieces);
    expect(new Set(pieces.map(p => p.color))).toEqual(new Set(['#E5484D', '#F5B800']));
    expect(pieces.some(p => p.star)).toBe(true);
    // They spread both ways and mostly fall.
    expect(pieces.some(p => p.dx < -0.3) && pieces.some(p => p.dx > 0.3)).toBe(true);
    expect(pieces.filter(p => p.dy > 0).length).toBeGreaterThan(40);
    for (const p of pieces) {
      expect(Math.abs(p.dx)).toBeLessThanOrEqual(0.6);
      expect(p.delay).toBeGreaterThanOrEqual(0);
      expect(p.delay).toBeLessThan(400);
    }
  });
});

describe('waiting', () => {
  // Review B6: Casey's and Dana's presents wiggled 220 ms apart inside a 700 ms wiggle.
  it('wiggles every few seconds, each person a fifth of the cycle from the next', () => {
    expect(IDLE_MS).toBe(4000);
    expect([0, 1, 2, 3, 4, 5].map(idleOffset)).toEqual([0, 800, 1600, 2400, 3200, 0]);
  });
});

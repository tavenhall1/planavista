import type { HouseholdView } from '../../core/household';
import type { BoardMember, Reward } from './chores-types';

/**
 * The goal surprise (milestone 10): when a member's stars reach their goal, a
 * wrapped present waits on their screen until they hold it open, then a
 * full-screen reveal plays. The backend wraps and keeps it; these are the
 * card's rules for showing it.
 */

export interface SurpriseModel {
  memberId: string;
  reward: Reward;
  opened: boolean;
}

/** A member's surprise from the board feed, with the reward it is for (none from an older backend). */
export function surpriseOf(memberId: string, entry: BoardMember | undefined, rewards: Reward[]): SurpriseModel | null {
  const surprise = entry?.surprise;
  if (!surprise) return null;
  const reward = rewards.find(r => r.id === surprise.reward);
  return reward ? { memberId, reward, opened: surprise.opened } : null;
}

/**
 * Whether this screen may open `memberId`'s surprise, as the backend decides:
 * a shared screen or their own login, never a parent's phone, unless the
 * household has no shared screens at all.
 */
export function mayOpenSurprise(view: HouseholdView | null, memberId: string): boolean {
  if (!view) return false;
  const { kind, member_id } = view.account;
  if (kind === 'shared' || kind === 'other' || member_id === memberId) return true;
  return view.security.shared_screens === 0;
}

/** "A surprise for Dana!" and how to open it, or who it waits for. */
export function surpriseWords(name: string, may: boolean, young: boolean): { title: string; hint: string } {
  // By who it is for, not the screen's shape, so one person reads one hint everywhere (review B9).
  const hint = may ? (young ? 'Hold me' : 'Hold to open') : `Waiting for ${name} to open it`;
  return { title: `A surprise for ${name}!`, hint };
}

/** The reveal's words and the reward's own button; while an ask waits, it says so and can't be pressed (review B3). */
export function revealWords(
  name: string, reward: Reward, asked = false, parent = false,
): { title: string; reward: string; button: string; asked: boolean } {
  // A parent's own ask is their answer, so on a parent's screen the button gives it at once (round 3, r3b I4).
  const button = asked ? '⏳ Waiting for approval' : reward.needs_ok && !parent ? '🙋 Ask for it' : '🎉 Get it';
  return { title: `${name}, you did it!`, reward: reward.name, button, asked };
}

/**
 * What a key does on the reveal (round 3, r3b I2): Escape is Later at any
 * time; Space or Enter skips to the end while it plays. The key that skipped
 * (`held`) presses nothing once the buttons are there: Ask for it takes focus
 * as they arrive, so the same key's keyup (Space) or its repeats (Enter)
 * would press it.
 */
export function revealKey(
  key: string, phase: 'down' | 'up', ready: boolean, held: string | null, repeat = false,
): 'later' | 'skip' | 'swallow' | null {
  const press = key === ' ' || key === 'Enter';
  if (phase === 'up') return press && key === held ? 'swallow' : null;
  if (key === 'Escape') return 'later';
  if (!press) return null;
  if (!ready) return 'skip';
  return repeat || key === held ? 'swallow' : null;
}

/**
 * How the present moves while it is held (the reveal's first act): it shakes
 * harder and faster and rises as the hold fills. `angle` is the shake's
 * reach in degrees, `period` its length in ms, `rise` in px.
 */
export function holdPose(fill: number): { angle: number; rise: number; scale: number; period: number } {
  const f = Math.min(1, Math.max(0, fill));
  return {
    angle: round(6 * f),
    rise: round(10 * f),
    scale: round(1 + 0.08 * f),
    period: Math.round(180 - 100 * f),
  };
}

/** The reveal's timeline in ms from the end of the hold. */
export const REVEAL = {
  /** The present flies from where it was to the middle. */
  flyMs: 500,
  shakeAt: 500,
  lidAt: 1000,
  riseAt: 1200,
  wordsAt: 1600,
  buttonsAt: 2200,
  endAt: 4000,
  confettiMs: 1800,
} as const;

/** How often a waiting present wiggles. */
export const IDLE_MS = 4000;

/**
 * Where in the wiggle's cycle a member's present starts, by their place in the
 * household: five places a fifth of the cycle apart, so two presents never
 * move in step (review B6: a hash of the names put two 220 ms apart).
 */
export function idleOffset(order: number): number {
  return (Math.abs(Math.trunc(order)) % 5) * (IDLE_MS / 5);
}

export interface ConfettiPiece {
  /** Where it ends, as a share of the screen's width and height from the middle. */
  dx: number;
  dy: number;
  spin: number;
  delay: number;
  size: number;
  color: string;
  /** A gold star instead of a paper square. */
  star: boolean;
}

const GOLD = '#F5B800';

/** The burst from the box: the child's color and gold stars, the same for the same seed. */
export function confettiPieces(count: number, seed: number, color: string): ConfettiPiece[] {
  const random = mulberry32(seed);
  return Array.from({ length: count }, (_, i) => {
    const star = i % 4 === 0;
    return {
      dx: round((random() - 0.5) * 1.2),
      dy: round(random() * 0.9 - 0.25),
      spin: Math.round((random() - 0.5) * 720),
      delay: Math.round(random() * 350),
      size: Math.round(8 + random() * 10),
      color: star || i % 3 === 0 ? GOLD : color,
      star,
    };
  });
}

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function round(value: number): number {
  return Math.round(value * 1000) / 1000;
}

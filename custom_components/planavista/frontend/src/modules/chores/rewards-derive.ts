import type { Member } from '../../core/household';
import type { Board, Reward } from './chores-types';
import { GoalModel, goalFor } from './my-day-derive';
import { dayWords } from './options-derive';

export interface Balance {
  member: Member;
  stars: number;
  goal: GoalModel | null;
}

/** Who earns stars, with their balance and goal (spec 13.6: balances and goals on top). */
export function balances(board: Board, members: Member[]): Balance[] {
  return members
    .filter(m => m.stars && board.members[m.id])
    .map(member => ({ member, stars: board.members[member.id].stars, goal: goalFor(member, board.members[member.id], board.rewards) }));
}

export interface RewardCard {
  reward: Reward;
  /** Who can get it, and whether they can afford it ("Casey ✓", "Dana: 3 more"). */
  people: Array<{ member: Member; afford: boolean; more: number; asked: boolean }>;
  /** "Casey's goal". */
  goals: Member[];
  /** Waiting for a parent: "⏳ Casey · Waiting for OK". */
  asked: Member[];
  /** Someone who can get it can afford it and hasn't asked yet. */
  canRedeem: boolean;
}

/** Who a reward is for: the people named, or everyone who earns stars (spec 7.5). */
export function eligible(reward: Reward, members: Member[]): Member[] {
  const earners = members.filter(m => m.stars);
  return reward.who.length ? earners.filter(m => reward.who.includes(m.id)) : earners;
}

/** The catalog (spec 13.6): each card shows who can afford it, goals, and redemptions waiting. */
export function rewardCards(board: Board, members: Member[]): RewardCard[] {
  return board.rewards.map(reward => {
    const asked = new Set(
      board.requests.filter(r => r.kind === 'redemption' && r.reward === reward.id).map(r => r.member),
    );
    const people = eligible(reward, members).map(member => {
      const stars = board.members[member.id]?.stars ?? 0;
      return { member, afford: stars >= reward.cost, more: Math.max(0, reward.cost - stars), asked: asked.has(member.id) };
    });
    return {
      reward,
      people,
      goals: members.filter(m => m.goal === reward.id),
      asked: members.filter(m => asked.has(m.id)),
      canRedeem: people.some(p => p.afford && !p.asked),
    };
  });
}

/** "Recently: Casey redeemed Pick the weekend game on Sunday, approved by Blair" (spec 13.6). */
export function recentLine(board: Board, members: Member[]): string | null {
  const last = board.recent_redemptions[0];
  if (!last) return null;
  const name = (id: string | null) => (id ? members.find(m => m.id === id)?.name ?? null : null);
  const who = name(last.member) ?? last.member;
  const by = last.by === 'auto' ? null : name(last.by);
  return `Recently: ${who} redeemed ${last.name} ${dayWords(last.at.slice(0, 10), board.today) === 'today' ? 'today' : `on ${dayWords(last.at.slice(0, 10), board.today)}`}${by ? `, approved by ${by}` : ''}.`;
}

/** A reward's answers so far in the reward sheet (spec 14.5: picture, name, cost, needs an OK, who). */
export interface RewardDraft {
  name: string;
  icon: string;
  cost: number;
  needsOk: boolean;
  who: string[];
}

export function rewardDraft(reward?: Reward): RewardDraft {
  return reward
    ? { name: reward.name, icon: reward.icon ?? '🎁', cost: reward.cost, needsOk: reward.needs_ok, who: [...reward.who] }
    : { name: '', icon: '🎁', cost: 20, needsOk: true, who: [] };
}

export function rewardProblem(draft: RewardDraft): string | null {
  if (!draft.name.trim()) return 'Add a name.';
  if (!Number.isInteger(draft.cost) || draft.cost < 1 || draft.cost > 10_000) return 'A reward costs from 1 to 10,000 stars.';
  return null;
}

export function rewardFrom(draft: RewardDraft): Partial<Reward> {
  return { name: draft.name.trim(), icon: draft.icon.trim() || null, cost: draft.cost, needs_ok: draft.needsOk, who: [...draft.who] };
}

/** Pictures a parent can tap for a reward. */
export const REWARD_PICTURES = ['🎁', '🎬', '🎮', '🍦', '🍕', '📱', '🌙', '💵', '🧸', '🎨', '⚽', '🏊', '🎟️', '🍪'];

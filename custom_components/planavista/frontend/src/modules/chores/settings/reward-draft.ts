import type { Member } from '../../../core/household';
import type { Reward } from '../chores-types';

/** What the reward editor edits (spec 14.5, 8.15). */
export interface RewardDraft {
  name: string;
  icon: string | null;
  cost: number;
  needs_ok: boolean;
  /** Empty means everyone who earns stars. */
  who: string[];
}

export interface RewardRecord {
  draft: RewardDraft;
  start: RewardDraft;
}

export function rewardDraftOf(reward: Reward | null): RewardDraft {
  return reward
    ? { name: reward.name, icon: reward.icon, cost: reward.cost, needs_ok: reward.needs_ok, who: [...reward.who] }
    : { name: '', icon: null, cost: 20, needs_ok: true, who: [] };
}

export function beginRewardDraft(reward: Reward | null): RewardRecord {
  const start = rewardDraftOf(reward);
  return { draft: start, start };
}

export function rewardDirty(record: RewardRecord): boolean {
  return JSON.stringify(record.draft) !== JSON.stringify(record.start);
}

/** What Save sends. */
export function rewardChanges(draft: RewardDraft): Partial<Reward> {
  return { name: draft.name.trim(), icon: draft.icon, cost: draft.cost, needs_ok: draft.needs_ok, who: draft.who };
}

export function rewardProblem(draft: RewardDraft): string | null {
  if (!draft.name.trim()) return 'Add a name.';
  if (!Number.isInteger(draft.cost) || draft.cost < 1 || draft.cost > 10_000) return 'A reward costs from 1 to 10,000 stars.';
  return null;
}

/** Steps of 1 star up to 20, then 5. */
export function nextCost(cost: number, up: boolean): number {
  if (up) return Math.min(10_000, cost < 20 ? cost + 1 : cost + 5);
  return Math.max(1, cost <= 20 ? cost - 1 : cost - 5);
}

/** Who can get it, in words: "Casey, Dana", or "Everyone who earns stars". */
export function whoText(who: string[], members: Member[]): string {
  if (!who.length) return 'Everyone who earns stars';
  return members.filter(m => who.includes(m.id)).map(m => m.name).join(', ');
}

/** A Rewards row's line (spec 14.5): "★ 40 · needs an OK · Casey, Dana". */
export function rewardLine(reward: Reward, members: Member[]): string {
  const parts = [`★ ${reward.cost}`];
  if (reward.needs_ok) parts.push('needs an OK');
  parts.push(whoText(reward.who, members));
  return parts.join(' · ');
}

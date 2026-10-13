import { describe, expect, it } from 'vitest';
import {
  balances,
  eligible,
  recentLine,
  redeemLabel,
  rewardCards,
  settleAsks,
  rewardDraft,
  rewardFrom,
  rewardProblem,
} from '../src/modules/chores/rewards-derive';
import type { Reward } from '../src/modules/chores/chores-types';
import { MEMBERS, board, column } from './chores-fixtures';

const [, , casey, dana] = MEMBERS;
const reward = (id: string, cost: number, who: string[] = []): Reward => ({ id, name: id.replace(/_/g, ' '), icon: '🎁', cost, needs_ok: true, who });

const REWARDS = [reward('screen_time', 15), reward('weekend_game', 10), reward('movie_night_pick', 40, ['casey', 'dana']), reward('ice_cream_trip', 25)];
const PEOPLE = [MEMBERS[0], MEMBERS[1], { ...casey, goal: 'movie_night_pick' }, { ...dana, goal: 'ice_cream_trip' }];
const B = board(
  { alex: column([]), blair: column([]), casey: column([], { stars: 23 }), dana: column([], { stars: 12 }) },
  {
    rewards: REWARDS,
    requests: [{ id: 'r1', kind: 'redemption', member: 'casey', name: 'weekend game', at: '2026-10-13T13:00:00-05:00', reward: 'weekend_game', cost: 10, balance: 23 }],
    recent_redemptions: [{ id: 'g', member: 'casey', reward: 'screen_time', name: '30 minutes of extra screen time', cost: 15, at: '2026-10-11T18:00:00-05:00', by: 'blair' }],
  },
);

describe('balances (spec 13.6)', () => {
  it('lists who earns stars, with their goal', () => {
    const list = balances(B, PEOPLE);
    expect(list.map(b => [b.member.id, b.stars, b.goal?.need])).toEqual([['casey', 23, 17], ['dana', 12, 13]]);
  });
});

describe('rewardCards', () => {
  const cards = rewardCards(B, PEOPLE);

  it('says who can afford each, and how many more someone needs', () => {
    expect(cards[0].people.map(p => [p.member.id, p.afford, p.more])).toEqual([['casey', true, 0], ['dana', false, 3]]);
    expect(cards[0].canRedeem).toBe(true);
  });

  it('shows a redemption waiting for OK, and goals', () => {
    expect(cards[1].asked.map(m => m.id)).toEqual(['casey']);
    expect(cards[1].canRedeem).toBe(true);
    expect(cards[2].goals.map(m => m.id)).toEqual(['casey']);
    expect(cards[2].canRedeem).toBe(false);
  });

  it('keeps a reward to the people named on it', () => {
    expect(eligible(reward('x', 5, ['dana']), PEOPLE).map(m => m.id)).toEqual(['dana']);
    expect(eligible(reward('x', 5), PEOPLE).map(m => m.id)).toEqual(['casey', 'dana']);
  });
});

describe('asking for a reward (milestone 8)', () => {
  it('Redeem waits as soon as someone asks, before the board comes back', () => {
    const asking = rewardCards(B, PEOPLE, [{ member: 'dana', reward: 'weekend_game' }])[1];
    expect(asking.asked.map(m => m.id)).toEqual(['casey', 'dana']);
    expect(asking.canRedeem).toBe(false);
    expect(redeemLabel(asking)).toBe('Waiting for OK');
  });

  it('says Redeem while anyone can, and why not otherwise', () => {
    const cards = rewardCards(B, PEOPLE);
    expect(redeemLabel(cards[0])).toBe('Redeem');
    expect(redeemLabel(cards[1])).toBe('Redeem');
    expect(redeemLabel(cards[2])).toBe('Not enough stars yet');
  });
});

describe('an ask, once the board has it (review)', () => {
  const ask = { member: 'casey', reward: 'weekend_game' };

  it("is the board's from then on, so an answer clears it", () => {
    expect(settleAsks([ask], B)).toEqual([]);
    const answered = { ...B, requests: [] };
    expect(rewardCards(answered, PEOPLE, settleAsks([ask], B))[1].asked).toEqual([]);
  });

  it("stays while the board hasn't shown it yet", () => {
    const asks = [{ member: 'dana', reward: 'weekend_game' }];
    expect(settleAsks(asks, B)).toBe(asks);
  });
});

describe('recentLine', () => {
  it('says who got what, and who approved it', () => {
    expect(recentLine(B, PEOPLE)).toBe('Recently: Casey redeemed 30 minutes of extra screen time on Sunday, approved by Blair.');
    expect(recentLine({ ...B, recent_redemptions: [] }, PEOPLE)).toBeNull();
  });
});

describe('the reward sheet', () => {
  it('starts from a reward or from nothing, and says what is missing', () => {
    expect(rewardDraft()).toEqual({ name: '', icon: '🎁', cost: 20, needsOk: true, who: [] });
    expect(rewardDraft(REWARDS[2])).toMatchObject({ cost: 40, who: ['casey', 'dana'] });
    expect(rewardProblem(rewardDraft())).toBe('Add a name.');
    expect(rewardProblem({ ...rewardDraft(), name: 'Pizza', cost: 0 })).toBe('A reward costs from 1 to 10,000 stars.');
    expect(rewardFrom({ ...rewardDraft(), name: ' Pizza night ', icon: '🍕' })).toEqual({ name: 'Pizza night', icon: '🍕', cost: 20, needs_ok: true, who: [] });
  });
});

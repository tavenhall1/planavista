import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import type { Activity } from '../src/modules/chores/chores-types';
import { checkoffMinutes, checkoffStars } from '../src/modules/chores/worth';

const TABLE = JSON.parse(readFileSync(new URL('../../../../tests/fixtures/chores_worth.json', import.meta.url), 'utf-8')) as {
  cases: Array<{ name: string; activity: Partial<Activity>; minutes: Record<string, number> }>;
};

describe('checkoffMinutes', () => {
  it.each(TABLE.cases)('$name', c => {
    for (const [member, minutes] of Object.entries(c.minutes)) {
      expect(checkoffMinutes(c.activity, member)).toBeCloseTo(minutes, 2);
    }
  });

  it('reads the first assignee when no one is named', () => {
    const bathroom = TABLE.cases.find(c => c.name === 'a week, split unevenly, any day')!.activity;
    expect(checkoffMinutes(bathroom)).toBe(90);
  });
});

describe('checkoffStars', () => {
  const laundry = TABLE.cases.find(c => c.name === 'a week on two days')!.activity;

  it('works stars out from the time at the household rate', () => {
    expect(checkoffStars(laundry, 15)).toBe(4);
    expect(checkoffStars(laundry, 30)).toBe(2);
  });

  it('uses the chore\'s own stars when it has them', () => {
    expect(checkoffStars({ ...laundry, stars: 7 }, 15)).toBe(7);
  });
});

import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { perStarText, starsFor } from '../src/core/stars';

const TABLE = JSON.parse(readFileSync(new URL('../../../../tests/fixtures/chores_stars.json', import.meta.url), 'utf-8')) as {
  cases: Array<{ minutes: number; minutes_per_star: number; override?: number; stars: number }>;
};

describe('starsFor', () => {
  it.each(TABLE.cases)('$minutes min at 1 per $minutes_per_star (override $override) earns $stars', c => {
    expect(starsFor(c.minutes, c.minutes_per_star, c.override)).toBe(c.stars);
  });

  it('treats a missing override like none', () => {
    expect(starsFor(60, 15, null)).toBe(4);
    expect(starsFor(60, 15, undefined)).toBe(4);
  });
});

describe('perStarText', () => {
  it('says how often a star comes', () => {
    expect(perStarText(15)).toBe('1 per 15 minutes');
    expect(perStarText(1)).toBe('1 per minute');
  });
});

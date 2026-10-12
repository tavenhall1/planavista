import { describe, expect, it } from 'vitest';
import { RecentCheckoffs } from '../src/modules/chores/recent-checkoffs';

describe('RecentCheckoffs (milestone 8: Undo always knows what it undoes)', () => {
  it("each toast's Undo finds its own check-off, even after another one", () => {
    const recent = new RecentCheckoffs<string>();
    recent.remember('t1', 'Make your bed');
    recent.remember('t2', 'Feed the fish');
    expect(recent.take('t1')).toBe('Make your bed');
    expect(recent.take('t1')).toBeUndefined();
    expect(recent.peek('t2')).toBe('Feed the fish');
  });

  it('keeps only the last few', () => {
    const recent = new RecentCheckoffs<number>(3);
    for (let i = 1; i <= 5; i++) recent.remember(`t${i}`, i);
    expect(recent.take('t1')).toBeUndefined();
    expect(recent.take('t3')).toBe(3);
  });
});

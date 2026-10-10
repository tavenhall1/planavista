import { describe, expect, it } from 'vitest';
import { revealCircle } from '../src/shell/view-transition';

describe('the reveal', () => {
  it('grows from the finger until it covers the whole screen', () => {
    // A tap near the top left: the farthest corner is the bottom right.
    expect(revealCircle({ x: 100, y: 50 }, 1280, 800)).toEqual({ x: 100, y: 50, radius: Math.hypot(1180, 750) });
    // A tap near the bottom right reaches back to the top left.
    expect(revealCircle({ x: 1200, y: 700 }, 1280, 800).radius).toBe(Math.hypot(1200, 700));
    // From the middle, every corner is the same distance away.
    expect(revealCircle({ x: 640, y: 400 }, 1280, 800).radius).toBe(Math.hypot(640, 400));
  });
});

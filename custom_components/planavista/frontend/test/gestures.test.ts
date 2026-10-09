import { describe, expect, it } from 'vitest';
import { swipeDirection } from '../src/utils/gestures';

describe('swipeDirection', () => {
  it('reads a clear horizontal swipe', () => {
    expect(swipeDirection(120, 10)).toBe('prev'); // finger moved right
    expect(swipeDirection(-120, -10)).toBe('next'); // finger moved left
  });

  it('needs more than 50 px of horizontal travel', () => {
    expect(swipeDirection(50, 0)).toBeNull();
    expect(swipeDirection(51, 0)).toBe('prev');
  });

  it('ignores diagonal and vertical scrolls', () => {
    expect(swipeDirection(80, 60)).toBeNull();
    expect(swipeDirection(-100, 50)).toBeNull(); // exactly 2:1 is not enough
    expect(swipeDirection(-101, 50)).toBe('next');
    expect(swipeDirection(5, 300)).toBeNull();
  });
});

import { describe, expect, it } from 'vitest';
import { SMOOTH } from '../src/core/motion';
import { viewChange, viewMotion } from '../src/core/view-motion';

const MON = new Date(2026, 9, 12).getTime();
const TUE = new Date(2026, 9, 13).getTime();

describe('viewChange', () => {
  it("doesn't move the first draw", () => {
    expect(viewChange(null, { view: 'day', at: MON })).toBe('none');
  });

  it('glides another view in, and slides a later or earlier day in from its side', () => {
    expect(viewChange({ view: 'day', at: MON }, { view: 'week', at: MON })).toBe('switch');
    expect(viewChange({ view: 'day', at: MON }, { view: 'day', at: TUE })).toBe('forward');
    expect(viewChange({ view: 'day', at: TUE }, { view: 'day', at: MON })).toBe('back');
    expect(viewChange({ view: 'board', at: 0 }, { view: 'board', at: 0 })).toBe('none');
  });
});

describe('viewMotion', () => {
  it('rides the smooth spring: a short rise for another view, a slide from the side for a step', () => {
    const glide = viewMotion('switch', 'full', true)!;
    expect(glide.keyframes).toEqual([{ opacity: 0, transform: 'translateY(12px)' }, { opacity: 1, transform: 'none' }]);
    expect(glide.options).toEqual({ duration: SMOOTH.duration, easing: SMOOTH.easing });
    expect(viewMotion('forward', 'full', true)!.keyframes[0]).toEqual({ opacity: 0, transform: 'translateX(32px)' });
    expect(viewMotion('back', 'full', true)!.keyframes[0]).toEqual({ opacity: 0, transform: 'translateX(-32px)' });
  });

  it('keeps the length but uses a plain curve where the browser has no linear() easing', () => {
    const glide = viewMotion('switch', 'full', false)!;
    expect(glide.options.duration).toBe(SMOOTH.duration);
    expect(glide.options.easing).not.toContain('linear(');
  });

  it('fades quickly with reduced motion, and does nothing when nothing changed', () => {
    expect(viewMotion('forward', 'reduced', true)).toEqual({
      keyframes: [{ opacity: 0.4 }, { opacity: 1 }],
      options: { duration: 150, easing: 'ease-out' },
    });
    expect(viewMotion('none', 'full', true)).toBeNull();
  });
});

import { describe, expect, it, vi } from 'vitest';
import { memoizeOne, statesChanged } from '../src/utils/render-cache';

describe('memoizeOne', () => {
  it('reuses the last result while every argument is identical', () => {
    const fn = vi.fn((a: object, b: Set<string>) => ({ a, size: b.size }));
    const memo = memoizeOne(fn);
    const state = {};
    const hidden = new Set<string>();
    const first = memo(state, hidden);
    expect(memo(state, hidden)).toBe(first);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('recomputes when any argument changes identity', () => {
    const fn = vi.fn((a: object, b: Set<string>) => ({ a, size: b.size }));
    const memo = memoizeOne(fn);
    const state = {};
    const first = memo(state, new Set());
    const second = memo(state, new Set(['calendar.test_alex']));
    expect(second).not.toBe(first);
    expect(second.size).toBe(1);
    expect(memo({}, new Set())).not.toBe(second);
    expect(fn).toHaveBeenCalledTimes(3);
  });
});

describe('statesChanged', () => {
  const config = { state: 'configured' };
  const weather = { state: 'sunny' };
  const sun = { state: 'above_horizon' };

  it('ignores changes to entities the card does not show', () => {
    const before = { states: { 'sensor.planavista_config': config, 'weather.home': weather, 'sun.sun': sun } };
    const after = { states: { ...before.states, 'sun.sun': { state: 'below_horizon' } } };
    expect(statesChanged(before, after, ['sensor.planavista_config', 'weather.home'])).toBe(false);
  });

  it('notices a new config sensor or weather state object', () => {
    const before = { states: { 'sensor.planavista_config': config, 'weather.home': weather } };
    expect(statesChanged(before, { states: { ...before.states, 'sensor.planavista_config': { ...config } } }, ['sensor.planavista_config'])).toBe(true);
    expect(statesChanged(before, { states: { ...before.states, 'weather.home': { state: 'rainy' } } }, ['sensor.planavista_config', 'weather.home'])).toBe(true);
  });

  it('treats the first hass as a change', () => {
    expect(statesChanged(undefined, { states: {} }, ['sensor.planavista_config'])).toBe(true);
  });
});

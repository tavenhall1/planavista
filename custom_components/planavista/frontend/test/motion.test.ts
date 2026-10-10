import { describe, expect, it, vi } from 'vitest';
import { BOUNCY, GENTLE, SMOOTH, resolveMotion, spring, springEasing } from '../src/core/motion';
import { HOLD_MS, HoldGesture } from '../src/core/hold';
import { sheetDragOffset, sheetDragOutcome } from '../src/core/sheet-drag';

function points(easing: string): number[] {
  return easing.slice('linear('.length, -1).split(',').map(Number);
}

describe('spring', () => {
  it('samples the spring into linear() easing that starts at 0 and ends at 1', () => {
    const p = points(SMOOTH.easing);
    expect(p).toHaveLength(51);
    expect(p[0]).toBe(0);
    expect(p[50]).toBe(1);
  });

  it('settles in the approved times', () => {
    expect(SMOOTH.duration).toBe(639);
    expect(BOUNCY.duration).toBe(900);
    expect(GENTLE.duration).toBe(733);
  });

  it('overshoots when bouncy and barely when smooth', () => {
    expect(Math.max(...points(BOUNCY.easing))).toBeGreaterThan(1.1);
    expect(Math.max(...points(SMOOTH.easing))).toBeLessThan(1.01);
  });

  it('survives a damping of 1 or more', () => {
    expect(points(spring(0.5, 1).easing).every(Number.isFinite)).toBe(true);
  });

  it('falls back to a curve of the same length without linear()', () => {
    expect(springEasing(SMOOTH, false)).toEqual({ easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)', duration: 639 });
    expect(springEasing(SMOOTH, true)).toBe(SMOOTH);
  });
});

describe('resolveMotion', () => {
  it('lets PlanaVista overrule the device, or follow it', () => {
    expect(resolveMotion('reduced', false)).toBe('reduced');
    expect(resolveMotion('full', true)).toBe('full');
    expect(resolveMotion('device', true)).toBe('reduced');
    expect(resolveMotion('device', false)).toBe('full');
    expect(resolveMotion(undefined, false)).toBe('full');
  });
});

describe('HoldGesture', () => {
  function gesture() {
    const calls = { progress: vi.fn(), complete: vi.fn(), rewind: vi.fn(), tap: vi.fn() };
    return { calls, hold: new HoldGesture(calls) };
  }

  it('fills over 550 ms and completes once', () => {
    const { calls, hold } = gesture();
    hold.down(10, 10, 1000);
    hold.frame(1000 + HOLD_MS / 2);
    expect(calls.progress).toHaveBeenLastCalledWith(0.5);
    hold.frame(1000 + HOLD_MS);
    hold.frame(1000 + HOLD_MS + 16);
    expect(calls.complete).toHaveBeenCalledTimes(1);
    expect(hold.holding).toBe(false);
  });

  it('rewinds when let go early, from the fill it reached', () => {
    const { calls, hold } = gesture();
    hold.down(0, 0, 0);
    hold.frame(275);
    hold.up(300);
    expect(calls.rewind).toHaveBeenCalledWith(0.5);
    expect(calls.complete).not.toHaveBeenCalled();
    expect(calls.tap).not.toHaveBeenCalled();
  });

  it('treats a quick press as a tap', () => {
    const { calls, hold } = gesture();
    hold.down(0, 0, 0);
    hold.up(150);
    expect(calls.tap).toHaveBeenCalledTimes(1);
  });

  it('hands a move of more than 12 px back to the page, without a tap', () => {
    const { calls, hold } = gesture();
    hold.down(0, 0, 0);
    hold.move(12, 0);
    expect(hold.holding).toBe(true);
    hold.move(9, 9);
    expect(hold.holding).toBe(false);
    expect(calls.rewind).toHaveBeenCalledTimes(1);
    hold.up(50);
    expect(calls.tap).not.toHaveBeenCalled();
  });

  it('completes at once from the keyboard', () => {
    const { calls, hold } = gesture();
    expect(hold.key('Tab')).toBe(false);
    expect(hold.key(' ')).toBe(true);
    expect(calls.complete).toHaveBeenCalledTimes(1);
  });
});

describe('sheet drag', () => {
  it('follows the finger down only', () => {
    expect(sheetDragOffset(40)).toBe(40);
    expect(sheetDragOffset(-30)).toBe(0);
  });

  it('closes when dragged past 90 px or flicked, and settles otherwise', () => {
    expect(sheetDragOutcome(91, 1000)).toBe('close');
    expect(sheetDragOutcome(40, 50)).toBe('close');
    expect(sheetDragOutcome(60, 400)).toBe('settle');
    expect(sheetDragOutcome(-200, 50)).toBe('settle');
  });
});

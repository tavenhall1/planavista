import { describe, expect, it } from 'vitest';
import { dayHourHeight, monthCellEvents, rescaleScroll } from '../src/modules/calendar/layout-rules';

describe('Day view hours', () => {
  it('keep 80 px in landscape and on phones', () => {
    expect(dayHourHeight('landscape', 600)).toBe(80);
    expect(dayHourHeight('phone', 640)).toBe(80);
  });

  it('fit about 14 hours in portrait, between 48 and 80 px each', () => {
    expect(dayHourHeight('portrait', 1030)).toBe(73);
    expect(dayHourHeight('portrait', 500)).toBe(48);
    expect(dayHourHeight('portrait', 1400)).toBe(80);
    expect(dayHourHeight('portrait', 0)).toBe(80);
  });

  it('keep the same time at the top when the hours change size', () => {
    expect(rescaleScroll(800, 80, 73)).toBe(730);
    expect(rescaleScroll(800, 0, 73)).toBe(800);
  });
});

describe('Month cells', () => {
  it('show three events and "+N more" before they are measured, as 1.1.0 did', () => {
    expect(monthCellEvents(5, 0)).toEqual({ shown: 3, more: 2 });
    expect(monthCellEvents(2, 0)).toEqual({ shown: 2, more: 0 });
  });

  it('show as many as fit, keeping a line for "+N more"', () => {
    expect(monthCellEvents(3, 100)).toEqual({ shown: 3, more: 0 });
    expect(monthCellEvents(5, 100)).toEqual({ shown: 2, more: 3 });
    expect(monthCellEvents(5, 166)).toEqual({ shown: 5, more: 0 });
    expect(monthCellEvents(9, 166)).toEqual({ shown: 5, more: 4 });
    expect(monthCellEvents(4, 30)).toEqual({ shown: 1, more: 3 });
  });

  it('use the sizes the grid draws, where chips are taller', () => {
    // Wide screens pad each chip more, so fewer fit in the same cell.
    const wide = { number: 30, row: 32, more: 16 };
    expect(monthCellEvents(2, 100, wide)).toEqual({ shown: 2, more: 0 });
    expect(monthCellEvents(5, 100, wide)).toEqual({ shown: 1, more: 4 });
    expect(monthCellEvents(5, 230, wide)).toEqual({ shown: 5, more: 0 });
  });
});

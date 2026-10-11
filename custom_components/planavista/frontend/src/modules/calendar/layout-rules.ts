import type { Layout } from '../../core/layout';

/** The Day view's hour height in landscape and on phones, as in 1.1.0. */
export const HOUR_PX = 80;
const PORTRAIT_HOURS = 14;
const MIN_HOUR_PX = 48;

/**
 * The Day view's hour height. In portrait the view fits about 14 hours
 * instead of about 8 (spec 12.2), between 48 and 80 px an hour.
 */
export function dayHourHeight(layout: Layout, viewHeight: number): number {
  if (layout !== 'portrait' || !(viewHeight > 0)) return HOUR_PX;
  return Math.max(MIN_HOUR_PX, Math.min(HOUR_PX, Math.floor(viewHeight / PORTRAIT_HOURS)));
}

/** The scroll position that keeps the same time at the top when the hour height changes (rotating keeps your place). */
export function rescaleScroll(scrollTop: number, fromHourPx: number, toHourPx: number): number {
  return fromHourPx > 0 ? Math.round((scrollTop * toHourPx) / fromHourPx) : scrollTop;
}

/** What a Month cell draws, in px: the space above and below its events, one event row, and the "+N more" line. */
export interface MonthCellSizes {
  number: number;
  row: number;
  more: number;
}

/** A small screen's sizes, used until the grid is measured. */
export const MONTH_SIZES: MonthCellSizes = { number: 28, row: 21, more: 14 };
/** Before the grid is measured, as in 1.1.0. */
const UNMEASURED = 3;

/**
 * How many of a day's events a Month cell shows, and how many go behind
 * "+N more": as many as fit, so taller portrait cells show more (spec 12.3).
 * `sizes` are what the grid draws; wide screens pad each event more.
 */
export function monthCellEvents(
  count: number,
  cellHeight: number,
  sizes: MonthCellSizes = MONTH_SIZES,
): { shown: number; more: number } {
  if (!(cellHeight > 0)) {
    const shown = Math.min(count, UNMEASURED);
    return { shown, more: count - shown };
  }
  const room = cellHeight - sizes.number;
  if (count <= Math.floor(room / sizes.row)) return { shown: count, more: 0 };
  const shown = Math.min(count, Math.max(1, Math.floor((room - sizes.more) / sizes.row)));
  return { shown, more: count - shown };
}

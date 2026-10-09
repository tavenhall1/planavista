import { afterEach, describe, expect, it, vi } from 'vitest';
import type { CalendarEvent } from '../src/types';
import {
  compareEventsForDisplay,
  detectOverlaps,
  getEventsForDateRange,
  groupEventsByDate,
  isAllDayEvent,
  isEventPast,
  isMultiDayEvent,
} from '../src/utils/event-utils';

function ev(summary: string, start: string, end: string, extra: Partial<CalendarEvent> = {}): CalendarEvent {
  return {
    summary,
    start,
    end,
    calendar_entity_id: 'calendar.test_alex',
    calendar_name: 'Alex',
    calendar_color: '#4A7FB5',
    calendar_color_light: '',
    ...extra,
  };
}

/** Local-day range [00:00, 23:59:59.999] like the views build. */
function day(y: number, m: number, d: number): [Date, Date] {
  return [new Date(y, m - 1, d, 0, 0, 0, 0), new Date(y, m - 1, d, 23, 59, 59, 999)];
}

const allDay = ev('All-day test', '2026-10-09', '2026-10-10');
const weekendTrip = ev('Weekend trip', '2026-10-10', '2026-10-13');

afterEach(() => {
  vi.useRealTimers();
});

describe('all-day events (date-only, exclusive end)', () => {
  it('are recognised as all-day', () => {
    expect(isAllDayEvent(allDay)).toBe(true);
    expect(isAllDayEvent(ev('Dentist', '2026-10-09T15:00:00-05:00', '2026-10-09T16:00:00-05:00'))).toBe(false);
  });

  it('land only on their own day', () => {
    expect([...groupEventsByDate([allDay]).keys()]).toEqual(['2026-10-09']);
    expect(getEventsForDateRange([allDay], ...day(2026, 10, 9))).toHaveLength(1);
    expect(getEventsForDateRange([allDay], ...day(2026, 10, 8))).toHaveLength(0);
    expect(getEventsForDateRange([allDay], ...day(2026, 10, 10))).toHaveLength(0);
  });

  it('span start..end-1 for multi-day events', () => {
    expect([...groupEventsByDate([weekendTrip]).keys()]).toEqual(['2026-10-10', '2026-10-11', '2026-10-12']);
    expect(getEventsForDateRange([weekendTrip], ...day(2026, 10, 13))).toHaveLength(0);
    expect(isMultiDayEvent(weekendTrip)).toBe(true);
    expect(isMultiDayEvent(allDay)).toBe(false); // the end date is exclusive
  });

  it('are not past until their last day is over', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 9, 9, 20, 0)); // Fri Oct 9, 8 PM local
    expect(isEventPast(allDay)).toBe(false);
    vi.setSystemTime(new Date(2026, 9, 10, 0, 1));
    expect(isEventPast(allDay)).toBe(true);
  });
});

describe('timed events with an offset that differs from the browser zone', () => {
  // 10:00 in UTC-4 is 9:00 in Chicago (UTC-5 in October).
  const eastern = ev('Call', '2026-10-09T10:00:00-04:00', '2026-10-09T11:00:00-04:00');
  // 23:30-00:30 in UTC-4 is 22:30-23:30 in Chicago: still Oct 9 only.
  const lateEastern = ev('Late call', '2026-10-09T23:30:00-04:00', '2026-10-10T00:30:00-04:00');

  it('are placed on the local day', () => {
    expect([...groupEventsByDate([eastern]).keys()]).toEqual(['2026-10-09']);
    expect([...groupEventsByDate([lateEastern]).keys()]).toEqual(['2026-10-09']);
    expect(getEventsForDateRange([lateEastern], ...day(2026, 10, 10))).toHaveLength(0);
  });

  it('overlap by instant, not by string', () => {
    const chicago = ev('Standup', '2026-10-09T09:30:00-05:00', '2026-10-09T10:00:00-05:00');
    const placed = detectOverlaps([chicago, eastern]);
    expect(placed.map(p => p.summary)).toEqual(['Call', 'Standup']); // 9:00 before 9:30
    expect(placed.every(p => p.totalColumns === 2)).toBe(true);
  });
});

describe('compareEventsForDisplay', () => {
  it('puts all-day events first, then orders by actual start instant', () => {
    const call = ev('Call', '2026-10-09T10:00:00-04:00', '2026-10-09T11:00:00-04:00'); // 9:00 local
    const standup = ev('Standup', '2026-10-09T09:30:00-05:00', '2026-10-09T10:00:00-05:00'); // 9:30 local
    const sorted = [standup, call, allDay].sort(compareEventsForDisplay);
    expect(sorted.map(e => e.summary)).toEqual(['All-day test', 'Call', 'Standup']);
  });

  it('orders each day group in groupEventsByDate', () => {
    const late = ev('Late', '2026-10-09T18:00:00-05:00', '2026-10-09T19:00:00-05:00');
    const early = ev('Early', '2026-10-09T08:00:00-05:00', '2026-10-09T09:00:00-05:00');
    const group = groupEventsByDate([late, early, allDay]).get('2026-10-09')!;
    expect(group.map(e => e.summary)).toEqual(['All-day test', 'Early', 'Late']);
  });
});

describe('timed events ending exactly at midnight', () => {
  it('do not spill onto the next day', () => {
    const e = ev('Movie', '2026-10-09T22:00:00-05:00', '2026-10-10T00:00:00-05:00');
    expect([...groupEventsByDate([e]).keys()]).toEqual(['2026-10-09']);
    expect(isMultiDayEvent(e)).toBe(false);
  });

  it('still cover every day an overnight event touches', () => {
    const shift = ev('Overnight shift', '2026-10-09T22:00:00-05:00', '2026-10-10T06:00:00-05:00');
    expect([...groupEventsByDate([shift]).keys()]).toEqual(['2026-10-09', '2026-10-10']);
    expect(isMultiDayEvent(shift)).toBe(true);
  });
});

describe('US fall-back day (2026-11-01)', () => {
  it('keeps an all-day event on Nov 1 only', () => {
    const e = ev('Fall back', '2026-11-01', '2026-11-02');
    expect([...groupEventsByDate([e]).keys()]).toEqual(['2026-11-01']);
    expect(getEventsForDateRange([e], ...day(2026, 11, 1))).toHaveLength(1);
    expect(getEventsForDateRange([e], ...day(2026, 11, 2))).toHaveLength(0);
  });

  it('keeps a 01:30 CDT -> 03:00 CST event on Nov 1 with real elapsed time', () => {
    const e = ev('Night shift', '2026-11-01T01:30:00-05:00', '2026-11-01T03:00:00-06:00');
    expect([...groupEventsByDate([e]).keys()]).toEqual(['2026-11-01']);
    expect(isMultiDayEvent(e)).toBe(false);
    expect(isAllDayEvent(e)).toBe(false);
    const [o] = detectOverlaps([e]);
    expect(o.totalColumns).toBe(1);
  });
});

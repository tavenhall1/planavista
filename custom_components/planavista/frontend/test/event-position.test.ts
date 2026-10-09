import { describe, expect, it } from 'vitest';
import type { CalendarEvent } from '../src/types';
import { getEventPosition } from '../src/utils/event-utils';

function ev(start: string, end: string): CalendarEvent {
  return {
    summary: 'Event',
    start,
    end,
    calendar_entity_id: 'calendar.test_casey',
    calendar_name: 'Casey',
    calendar_color: '#E07A5F',
    calendar_color_light: '',
  };
}

const pct = (minutes: number) => (minutes / 1440) * 100;

describe('getEventPosition (Day view, 0-24h grid)', () => {
  const shift = ev('2026-10-09T22:00:00-05:00', '2026-10-10T06:00:00-05:00');

  it('draws the evening part of an overnight event on its first day', () => {
    const pos = getEventPosition(shift, 0, 24, new Date(2026, 9, 9));
    expect(pos.top).toBeCloseTo(pct(22 * 60));
    expect(pos.height).toBeCloseTo(pct(2 * 60)); // 22:00-24:00, not a 15-minute sliver
  });

  it('draws the morning part of an overnight event on the next day', () => {
    const pos = getEventPosition(shift, 0, 24, new Date(2026, 9, 10, 15, 30)); // any time that day
    expect(pos.top).toBeCloseTo(0);
    expect(pos.height).toBeCloseTo(pct(6 * 60));
  });

  it('fills the whole grid on a middle day of a multi-day timed event', () => {
    const trip = ev('2026-10-09T18:00:00-05:00', '2026-10-11T09:00:00-05:00');
    const pos = getEventPosition(trip, 0, 24, new Date(2026, 9, 10));
    expect(pos.top).toBeCloseTo(0);
    expect(pos.height).toBeCloseTo(100);
  });

  it('places an event from another zone at its local time', () => {
    const pos = getEventPosition(ev('2026-10-09T10:00:00-04:00', '2026-10-09T11:00:00-04:00'), 0, 24, new Date(2026, 9, 9));
    expect(pos.top).toBeCloseTo(pct(9 * 60)); // 9:00 AM Chicago
    expect(pos.height).toBeCloseTo(pct(60));
  });

  it('uses wall-clock positions on the fall-back day', () => {
    // 01:30 CDT -> 03:00 CST is 2.5 h elapsed but spans 01:30-03:00 on the clock face.
    const pos = getEventPosition(ev('2026-11-01T01:30:00-05:00', '2026-11-01T03:00:00-06:00'), 0, 24, new Date(2026, 10, 1));
    expect(pos.top).toBeCloseTo(pct(90));
    expect(pos.height).toBeCloseTo(pct(90));
  });

  it('keeps a 15-minute minimum height', () => {
    const pos = getEventPosition(ev('2026-10-09T09:00:00-05:00', '2026-10-09T09:05:00-05:00'), 0, 24, new Date(2026, 9, 9));
    expect(pos.height).toBeCloseTo(pct(15));
  });

  it('falls back to the start day when no view date is given', () => {
    const pos = getEventPosition(shift);
    expect(pos.top).toBeCloseTo(pct(22 * 60));
    expect(pos.height).toBeCloseTo(pct(2 * 60));
  });
});

import { describe, expect, it } from 'vitest';
import { calendarDaysBetween, parseEventDate } from '../src/utils/date-utils';
import {
  buildDatePayload,
  buildEventBase,
  defaultFormDates,
  formDatesFromEvent,
  formEndDate,
  toLocalIsoString,
  validateFormDates,
  withEndTime,
  withStartTime,
  type EventFormDates,
} from '../src/utils/event-form';

describe('calendarDaysBetween', () => {
  it('counts calendar days, not 24-hour blocks', () => {
    expect(calendarDaysBetween(parseEventDate('2026-10-10'), parseEventDate('2026-10-13'))).toBe(3);
    // Nov 1 2026 is 25 hours long in Chicago.
    expect(calendarDaysBetween(parseEventDate('2026-11-01'), parseEventDate('2026-11-02'))).toBe(1);
    // Mar 8 2026 is 23 hours long.
    expect(calendarDaysBetween(parseEventDate('2026-03-08'), parseEventDate('2026-03-09'))).toBe(1);
  });
});

describe('formDatesFromEvent (prefill)', () => {
  it('prefills an all-day event on its own date', () => {
    const f = formDatesFromEvent('2026-10-09', '2026-10-10');
    expect(f).toMatchObject({ date: '2026-10-09', allDay: true, spanDays: 1 });
  });

  it('keeps the length of a multi-day all-day event', () => {
    const f = formDatesFromEvent('2026-10-10', '2026-10-13');
    expect(f).toMatchObject({ date: '2026-10-10', allDay: true, spanDays: 3 });
    expect(formEndDate(f)).toBe('2026-10-12'); // last day shown to the user
  });

  it('keeps a timed event that starts at midnight timed', () => {
    const f = formDatesFromEvent('2026-10-09T00:00:00-05:00', '2026-10-09T01:00:00-05:00');
    expect(f).toMatchObject({ date: '2026-10-09', allDay: false, startTime: '00:00', endTime: '01:00', endDayOffset: 0 });
  });

  it('shows a timed event from another zone in local time', () => {
    const f = formDatesFromEvent('2026-10-09T10:00:00-04:00', '2026-10-09T11:00:00-04:00');
    expect(f).toMatchObject({ date: '2026-10-09', startTime: '09:00', endTime: '10:00', endDayOffset: 0 });
  });

  it('keeps the end day of an overnight event', () => {
    const f = formDatesFromEvent('2026-10-09T22:00:00-05:00', '2026-10-10T06:00:00-05:00');
    expect(f).toMatchObject({ date: '2026-10-09', startTime: '22:00', endTime: '06:00', endDayOffset: 1 });
    expect(formEndDate(f)).toBe('2026-10-10');
  });

  it('handles the US fall-back day', () => {
    expect(formDatesFromEvent('2026-11-01', '2026-11-02')).toMatchObject({ date: '2026-11-01', spanDays: 1 });
    const f = formDatesFromEvent('2026-11-01T01:30:00-05:00', '2026-11-01T03:00:00-06:00');
    expect(f).toMatchObject({ date: '2026-11-01', startTime: '01:30', endTime: '03:00', endDayOffset: 0 });
  });
});

describe('buildDatePayload', () => {
  it('sends an exclusive all-day end (start + 1 day)', () => {
    expect(buildDatePayload(formDatesFromEvent('2026-10-09', '2026-10-10'))).toEqual({
      start_date: '2026-10-09',
      end_date: '2026-10-10',
    });
  });

  it('round-trips a multi-day all-day event unchanged', () => {
    expect(buildDatePayload(formDatesFromEvent('2026-10-10', '2026-10-13'))).toEqual({
      start_date: '2026-10-10',
      end_date: '2026-10-13',
    });
  });

  it('moves a multi-day all-day event without shrinking it', () => {
    const moved: EventFormDates = { ...formDatesFromEvent('2026-10-10', '2026-10-13'), date: '2026-10-30' };
    expect(buildDatePayload(moved)).toEqual({ start_date: '2026-10-30', end_date: '2026-11-02' });
  });

  it('never sends an all-day end equal to the start', () => {
    const f: EventFormDates = { ...formDatesFromEvent('2026-10-09', '2026-10-10'), spanDays: 0 };
    expect(buildDatePayload(f)).toEqual({ start_date: '2026-10-09', end_date: '2026-10-10' });
  });

  it('sends timed events with the local UTC offset', () => {
    expect(buildDatePayload(formDatesFromEvent('2026-10-09T10:00:00-04:00', '2026-10-09T11:00:00-04:00'))).toEqual({
      start_date_time: '2026-10-09T09:00:00-05:00',
      end_date_time: '2026-10-09T10:00:00-05:00',
    });
  });

  it('round-trips an overnight event', () => {
    expect(buildDatePayload(formDatesFromEvent('2026-10-09T22:00:00-05:00', '2026-10-10T06:00:00-05:00'))).toEqual({
      start_date_time: '2026-10-09T22:00:00-05:00',
      end_date_time: '2026-10-10T06:00:00-05:00',
    });
  });

  it('keeps a midnight-start event timed', () => {
    expect(buildDatePayload(formDatesFromEvent('2026-10-09T00:00:00-05:00', '2026-10-09T01:00:00-05:00'))).toEqual({
      start_date_time: '2026-10-09T00:00:00-05:00',
      end_date_time: '2026-10-09T01:00:00-05:00',
    });
  });

  it('gets the fall-back day right', () => {
    expect(buildDatePayload(formDatesFromEvent('2026-11-01', '2026-11-02'))).toEqual({
      start_date: '2026-11-01',
      end_date: '2026-11-02',
    });
    const p = buildDatePayload(formDatesFromEvent('2026-11-01T01:30:00-05:00', '2026-11-01T03:00:00-06:00'));
    if (!('start_date_time' in p)) throw new Error('expected a timed payload');
    // 01:30 happens twice that night; either reading is a valid local 01:30.
    expect(p.start_date_time.startsWith('2026-11-01T01:30:00-0')).toBe(true);
    expect(p.end_date_time).toBe('2026-11-01T03:00:00-06:00');
    expect(parseEventDate(p.end_date_time).getTime()).toBeGreaterThan(parseEventDate(p.start_date_time).getTime());
  });
});

describe('toLocalIsoString', () => {
  it('formats with the zone offset in effect on that date', () => {
    expect(toLocalIsoString(new Date(2026, 9, 9, 9, 5, 7))).toBe('2026-10-09T09:05:07-05:00');
    expect(toLocalIsoString(new Date(2026, 11, 25, 18, 0))).toBe('2026-12-25T18:00:00-06:00');
  });
});

describe('validateFormDates', () => {
  it('rejects a same-day end at or before the start', () => {
    const f = formDatesFromEvent('2026-10-09T10:00:00-05:00', '2026-10-09T11:00:00-05:00');
    expect(validateFormDates({ ...f, endTime: '10:00' })).toBe('End time must be after start time');
    expect(validateFormDates(f)).toBeNull();
  });

  it('accepts an overnight end', () => {
    expect(validateFormDates(formDatesFromEvent('2026-10-09T22:00:00-05:00', '2026-10-10T06:00:00-05:00'))).toBeNull();
  });

  it('accepts all-day events without times', () => {
    expect(validateFormDates(formDatesFromEvent('2026-10-09', '2026-10-10'))).toBeNull();
  });
});

describe('withStartTime', () => {
  it('pushes a same-day end an hour past a later start', () => {
    const f = formDatesFromEvent('2026-10-09T10:00:00-05:00', '2026-10-09T11:00:00-05:00');
    expect(withStartTime(f, '14:15')).toMatchObject({ startTime: '14:15', endTime: '15:15', endDayOffset: 0 });
  });

  it('rolls the end into the next day after 23:00', () => {
    const f = formDatesFromEvent('2026-10-09T10:00:00-05:00', '2026-10-09T11:00:00-05:00');
    const g = withStartTime(f, '23:30');
    expect(g).toMatchObject({ startTime: '23:30', endTime: '00:30', endDayOffset: 1 });
    expect(validateFormDates(g)).toBeNull();
  });

  it('leaves an overnight end alone', () => {
    const f = formDatesFromEvent('2026-10-09T22:00:00-05:00', '2026-10-10T06:00:00-05:00');
    expect(withStartTime(f, '21:00')).toMatchObject({ startTime: '21:00', endTime: '06:00', endDayOffset: 1 });
  });
});

describe('withStartTime offset reset', () => {
  it('drops a next-day offset when the end is already after the new start', () => {
    const f = formDatesFromEvent('2026-10-09T23:15:00-05:00', '2026-10-10T23:45:00-05:00');
    expect(withStartTime(f, '19:00')).toMatchObject({ startTime: '19:00', endTime: '23:45', endDayOffset: 0 });
  });
});

describe('withEndTime', () => {
  it('drops a late-start day bump once the start moves earlier and an end is picked (new event)', () => {
    const f0 = defaultFormDates(new Date(2026, 9, 9, 10, 0));
    const late = withStartTime(f0, '23:15');
    expect(late).toMatchObject({ endTime: '00:15', endDayOffset: 1 });
    const f = withEndTime(withStartTime(late, '19:00'), '20:00');
    expect(f.endDayOffset).toBe(0);
    expect(validateFormDates(f)).toBeNull();
    expect(buildDatePayload(f)).toEqual({
      start_date_time: '2026-10-09T19:00:00-05:00',
      end_date_time: '2026-10-09T20:00:00-05:00',
    });
  });

  it('lets an overnight event be shortened to end the same day (edit)', () => {
    const f = formDatesFromEvent('2026-10-09T18:00:00-05:00', '2026-10-10T10:00:00-05:00');
    expect(f.endDayOffset).toBe(1);
    const g = withEndTime(f, '21:00');
    expect(g.endDayOffset).toBe(0);
    expect(buildDatePayload(g)).toEqual({
      start_date_time: '2026-10-09T18:00:00-05:00',
      end_date_time: '2026-10-09T21:00:00-05:00',
    });
  });

  it('keeps a genuine overnight event overnight', () => {
    const f = formDatesFromEvent('2026-10-09T22:00:00-05:00', '2026-10-10T06:00:00-05:00');
    const g = withEndTime(f, '07:00');
    expect(g).toMatchObject({ endTime: '07:00', endDayOffset: 1 });
    expect(buildDatePayload(g)).toEqual({
      start_date_time: '2026-10-09T22:00:00-05:00',
      end_date_time: '2026-10-10T07:00:00-05:00',
    });
  });

  it('leaves same-day and multi-day offsets alone', () => {
    const same = formDatesFromEvent('2026-10-09T10:00:00-05:00', '2026-10-09T11:00:00-05:00');
    expect(withEndTime(same, '09:00')).toMatchObject({ endTime: '09:00', endDayOffset: 0 });
    const multi = formDatesFromEvent('2026-10-09T10:00:00-05:00', '2026-10-11T09:00:00-05:00');
    expect(withEndTime(multi, '12:00')).toMatchObject({ endTime: '12:00', endDayOffset: 2 });
  });
});

describe('defaultFormDates', () => {
  it('starts at the next quarter hour and lasts an hour', () => {
    expect(defaultFormDates(new Date(2026, 9, 9, 14, 7))).toMatchObject({
      date: '2026-10-09', allDay: false, startTime: '14:15', endTime: '15:15', endDayOffset: 0,
    });
  });

  it('rolls late-night defaults into the right days', () => {
    expect(defaultFormDates(new Date(2026, 9, 9, 23, 20))).toMatchObject({
      date: '2026-10-09', startTime: '23:30', endTime: '00:30', endDayOffset: 1,
    });
    expect(defaultFormDates(new Date(2026, 9, 9, 23, 50))).toMatchObject({
      date: '2026-10-10', startTime: '00:00', endTime: '01:00', endDayOffset: 0,
    });
  });
});

describe('buildEventBase', () => {
  it('trims text and omits empty optional fields', () => {
    const base = buildEventBase(formDatesFromEvent('2026-10-09', '2026-10-10'), {
      summary: '  Field trip ',
      description: '   ',
      location: ' Museum ',
    });
    expect(base).toEqual({ summary: 'Field trip', start_date: '2026-10-09', end_date: '2026-10-10', location: 'Museum' });
  });
});

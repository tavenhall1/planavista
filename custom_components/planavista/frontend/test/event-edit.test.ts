import { describe, expect, it, vi } from 'vitest';
import type { CalendarEvent } from '../src/types';
import {
  EditRestoreError,
  buildDeleteData,
  buildEventBase,
  buildRestoreData,
  formDatesFromEvent,
  planEdit,
  runEditWithRestore,
} from '../src/utils/event-form';

const weeklyLesson: CalendarEvent = {
  summary: 'Piano lesson',
  start: '2026-10-13T16:00:00-05:00',
  end: '2026-10-13T17:00:00-05:00',
  description: 'Bring book 2',
  location: 'Music room',
  uid: 'lesson-series-uid',
  recurrence_id: '20261013T210000Z',
  calendar_entity_id: 'calendar.test_casey',
  calendar_name: 'Casey',
  calendar_color: '#E07A5F',
  calendar_color_light: '',
};

const weekendTrip: CalendarEvent = {
  summary: 'Weekend trip',
  start: '2026-10-10',
  end: '2026-10-13',
  uid: 'trip-uid',
  recurrence_id: '',
  calendar_entity_id: 'calendar.test_blair',
  calendar_name: 'Blair',
  calendar_color: '#81B29A',
  calendar_color_light: '',
};

describe('buildDeleteData', () => {
  it('deletes only the edited instance of a recurring event', () => {
    expect(buildDeleteData(weeklyLesson)).toEqual({
      entity_id: 'calendar.test_casey',
      uid: 'lesson-series-uid',
      recurrence_id: '20261013T210000Z',
    });
    // No recurrence_range: THISANDFUTURE would remove the rest of the series.
    expect(buildDeleteData(weeklyLesson)).not.toHaveProperty('recurrence_range');
  });

  it('omits an empty recurrence_id', () => {
    expect(buildDeleteData(weekendTrip)).toEqual({ entity_id: 'calendar.test_blair', uid: 'trip-uid' });
  });

  it('can target another calendar copy of a shared event', () => {
    expect(buildDeleteData(weeklyLesson, 'calendar.test_alex').entity_id).toBe('calendar.test_alex');
  });

  it('refuses events without a uid', () => {
    expect(() => buildDeleteData({ ...weekendTrip, uid: undefined })).toThrow('no unique ID');
  });
});

describe('buildRestoreData', () => {
  it('recreates a timed event exactly as the backend reported it', () => {
    expect(buildRestoreData(weeklyLesson)).toEqual({
      entity_id: 'calendar.test_casey',
      summary: 'Piano lesson',
      start_date_time: '2026-10-13T16:00:00-05:00',
      end_date_time: '2026-10-13T17:00:00-05:00',
      description: 'Bring book 2',
      location: 'Music room',
    });
  });

  it('recreates an all-day event with its exclusive end date', () => {
    expect(buildRestoreData(weekendTrip)).toEqual({
      entity_id: 'calendar.test_blair',
      summary: 'Weekend trip',
      start_date: '2026-10-10',
      end_date: '2026-10-13',
    });
  });
});

describe('planEdit', () => {
  it('edits one instance of a recurring event without touching the series', () => {
    const base = buildEventBase(formDatesFromEvent(weeklyLesson.start, weeklyLesson.end), {
      summary: 'Piano lesson (moved room)',
      location: 'Library',
    });
    const plan = planEdit(weeklyLesson, 'calendar.test_casey', base);
    expect(plan.deleteData).toEqual({
      entity_id: 'calendar.test_casey',
      uid: 'lesson-series-uid',
      recurrence_id: '20261013T210000Z',
    });
    expect(plan.createData).toEqual({
      entity_id: 'calendar.test_casey',
      summary: 'Piano lesson (moved room)',
      start_date_time: '2026-10-13T16:00:00-05:00',
      end_date_time: '2026-10-13T17:00:00-05:00',
      location: 'Library',
    });
    expect(plan.createData).not.toHaveProperty('uid');
    expect(plan.createData).not.toHaveProperty('recurrence_id');
    expect(plan.restoreData.summary).toBe('Piano lesson');
  });

  it('keeps a multi-day all-day event the same length when only the title changes', () => {
    const base = buildEventBase(formDatesFromEvent(weekendTrip.start, weekendTrip.end), { summary: 'Lake trip' });
    expect(planEdit(weekendTrip, 'calendar.test_blair', base).createData).toEqual({
      entity_id: 'calendar.test_blair',
      summary: 'Lake trip',
      start_date: '2026-10-10',
      end_date: '2026-10-13',
    });
  });
});

describe('runEditWithRestore', () => {
  it('deletes then creates', async () => {
    const calls: string[] = [];
    await runEditWithRestore({
      remove: async () => { calls.push('remove'); },
      create: async () => { calls.push('create'); },
      restore: async () => { calls.push('restore'); },
    });
    expect(calls).toEqual(['remove', 'create']);
  });

  it('puts the original back when the new event cannot be created', async () => {
    const restore = vi.fn(async () => {});
    const run = runEditWithRestore({
      remove: async () => {},
      create: async () => { throw { code: 'invalid_format', message: 'End must be after start' }; },
      restore,
    });
    await expect(run).rejects.toBeInstanceOf(EditRestoreError);
    await expect(run).rejects.toThrow("Your changes couldn't be saved (End must be after start). The original event was restored.");
    expect(restore).toHaveBeenCalledTimes(1);
  });

  it('says so when the original cannot be put back either', async () => {
    const run = runEditWithRestore({
      remove: async () => {},
      create: async () => { throw new Error('create failed'); },
      restore: async () => { throw new Error('restore failed'); },
    });
    await expect(run).rejects.toThrow(/couldn't be put back \(restore failed\)/);
  });

  it('creates nothing when the delete fails', async () => {
    const create = vi.fn(async () => {});
    const restore = vi.fn(async () => {});
    await expect(runEditWithRestore({
      remove: async () => { throw new Error('delete failed'); },
      create,
      restore,
    })).rejects.toThrow('delete failed');
    expect(create).not.toHaveBeenCalled();
    expect(restore).not.toHaveBeenCalled();
  });
});

import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../src/utils/ha-utils', () => ({
  createEvent: vi.fn(),
  deleteEvent: vi.fn(),
  refreshPlanaVista: vi.fn(async () => {}),
}));

import type { HomeAssistant } from 'custom-card-helpers';
import type { CreateEventData, DeleteEventData } from '../src/types';
import { createEvent, deleteEvent } from '../src/utils/ha-utils';
import { PlanaVistaController } from '../src/state/state-manager';

const host = {
  addController: () => {},
  removeController: () => {},
  requestUpdate: () => {},
  updateComplete: Promise.resolve(true),
};
const state = new PlanaVistaController(host).state;
const hass = {} as HomeAssistant;

afterAll(() => {
  state.stopAutoAdvance();
});

describe('doEditEvent', () => {
  const del: DeleteEventData = { entity_id: 'calendar.test_alex', uid: 'u1', recurrence_id: '20261009T200000Z' };
  const next: CreateEventData = {
    entity_id: 'calendar.test_alex', summary: 'Dentist', start_date_time: '2026-10-09T16:00:00-05:00', end_date_time: '2026-10-09T17:00:00-05:00',
  };
  const original: CreateEventData = {
    entity_id: 'calendar.test_alex', summary: 'Dentist', start_date_time: '2026-10-09T15:00:00-05:00', end_date_time: '2026-10-09T16:00:00-05:00',
  };

  beforeEach(() => {
    vi.mocked(createEvent).mockReset();
    vi.mocked(deleteEvent).mockReset();
    vi.mocked(deleteEvent).mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('deletes the instance and creates the edited event', async () => {
    vi.mocked(createEvent).mockResolvedValue(undefined);
    await state.doEditEvent(hass, del, next, original);
    expect(deleteEvent).toHaveBeenCalledWith(hass, del);
    expect(createEvent).toHaveBeenCalledTimes(1);
    expect(createEvent).toHaveBeenCalledWith(hass, next);
  });

  it('restores the original event when the recreate fails', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(createEvent)
      .mockRejectedValueOnce(new Error('Invalid end time'))
      .mockResolvedValueOnce(undefined);
    await expect(state.doEditEvent(hass, del, next, original)).rejects.toThrow('The original event was restored.');
    expect(createEvent).toHaveBeenNthCalledWith(2, hass, original);
    expect(state.isLoading).toBe(false);
    expect(errorSpy).toHaveBeenCalledWith('PlanaVista: Failed to edit event', expect.anything());
  });
});

describe('date rollover', () => {
  it('moves the viewed day to the new today, including after a long sleep', () => {
    state.checkRollover(new Date(2026, 9, 9, 8, 0)); // sync "today" to Fri Oct 9
    state.setDate(new Date(2026, 9, 9, 8, 0));
    state.checkRollover(new Date(2026, 9, 10, 7, 45)); // first check after waking Saturday
    expect(state.currentDate.getDate()).toBe(10);
  });

  it('keeps a day the user navigated to', () => {
    state.checkRollover(new Date(2026, 9, 10, 8, 0)); // today is Sat Oct 10
    state.setDate(new Date(2026, 9, 14));
    state.checkRollover(new Date(2026, 9, 11, 0, 1));
    expect(state.currentDate.getDate()).toBe(14);
  });
});

describe('hiddenCalendars', () => {
  it('is replaced, not mutated, on toggle', () => {
    const before = state.hiddenCalendars;
    state.toggleCalendar('calendar.test_alex');
    const hidden = state.hiddenCalendars;
    expect(hidden).not.toBe(before);
    expect(before.has('calendar.test_alex')).toBe(false);
    expect(hidden.has('calendar.test_alex')).toBe(true);

    state.toggleCalendar('calendar.test_alex');
    expect(state.hiddenCalendars).not.toBe(hidden);
    expect(hidden.has('calendar.test_alex')).toBe(true);
    expect(state.hiddenCalendars.has('calendar.test_alex')).toBe(false);
  });
});

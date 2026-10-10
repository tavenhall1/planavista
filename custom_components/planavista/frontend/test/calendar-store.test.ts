import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../src/utils/ha-utils', () => ({
  createEvent: vi.fn(),
  deleteEvent: vi.fn(),
  refreshPlanaVista: vi.fn(async () => {}),
}));

import type { HomeAssistant } from 'custom-card-helpers';
import type { CreateEventData, DeleteEventData } from '../src/types';
import { createEvent, deleteEvent } from '../src/utils/ha-utils';
import { CalendarStore, CalendarStoreController, StoreSubscriber } from '../src/modules/calendar/calendar-store';

const makeHost = () => ({
  addController: vi.fn(),
  removeController: vi.fn(),
  requestUpdate: vi.fn(),
  updateComplete: Promise.resolve(true),
});

const state = new CalendarStore();
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

describe('one store per card', () => {
  it('keeps each card\'s view, date, and filters apart', () => {
    const dayCard = new CalendarStore();
    const weekCard = new CalendarStore();
    const before = weekCard.currentDate.getTime();
    dayCard.setView('month');
    dayCard.setDate(new Date(2027, 0, 15));
    dayCard.toggleCalendar('calendar.test_alex');
    expect(weekCard.currentView).toBe('day');
    expect(weekCard.currentDate.getTime()).toBe(before);
    expect(weekCard.hiddenCalendars.has('calendar.test_alex')).toBe(false);
  });

  it('does not start a timer until an element connects', () => {
    expect(new CalendarStore().autoAdvancing).toBe(false);
  });
});

describe('CalendarStoreController', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('runs the day-change timer only while its element is connected', () => {
    const ctl = new CalendarStoreController(makeHost());
    ctl.hostConnected();
    expect(ctl.store.autoAdvancing).toBe(true);
    ctl.hostDisconnected();
    expect(ctl.store.autoAdvancing).toBe(false);
  });

  it('moves to the new day when its element reconnects after midnight', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 9, 9, 23, 0)); // Friday night
    const ctl = new CalendarStoreController(makeHost());
    ctl.hostConnected();
    ctl.hostDisconnected(); // the user leaves the dashboard
    vi.setSystemTime(new Date(2026, 9, 10, 7, 30)); // and comes back Saturday morning
    ctl.hostConnected();
    expect(ctl.store.currentDate.getDate()).toBe(10);
    ctl.hostDisconnected();
  });

  it('re-renders its element when the store changes', () => {
    const host = makeHost();
    const ctl = new CalendarStoreController(host);
    ctl.hostConnected();
    ctl.store.setView('week');
    expect(host.requestUpdate).toHaveBeenCalledTimes(1);
    ctl.hostDisconnected();
  });
});

describe('StoreSubscriber', () => {
  it('follows the store its element was given, and stops when disconnected', () => {
    const host = makeHost();
    let store = new CalendarStore();
    const sub = new StoreSubscriber(host, () => store);
    sub.hostConnected();

    store.setView('month');
    expect(host.requestUpdate).toHaveBeenCalledTimes(1);

    const old = store;
    store = new CalendarStore();
    sub.hostUpdate();
    old.setView('week');
    expect(host.requestUpdate).toHaveBeenCalledTimes(1);
    store.setView('week');
    expect(host.requestUpdate).toHaveBeenCalledTimes(2);

    sub.hostDisconnected();
    store.setView('agenda');
    expect(host.requestUpdate).toHaveBeenCalledTimes(2);
  });
});

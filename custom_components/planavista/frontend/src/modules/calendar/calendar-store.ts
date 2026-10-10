import { ReactiveController, ReactiveControllerHost } from 'lit';
import { HomeAssistant } from 'custom-card-helpers';
import { ViewType, CalendarEvent, DialogType, CreateEventData, DeleteEventData } from '../../types';
import { createEvent, deleteEvent, refreshPlanaVista } from '../../utils/ha-utils';
import { getDateKey, navigateDate, rolloverDate } from '../../utils/date-utils';
import { runEditWithRestore } from './utils/event-form';

/**
 * The calendar's UI state for one card: view, date, calendar filter,
 * selection, and open dialogs. Every card owns its own store, so two cards
 * on one dashboard never overwrite each other.
 */
export class CalendarStore {
  // State
  hiddenCalendars = new Set<string>();
  currentView: ViewType = 'day';
  currentDate: Date = new Date();
  selectedEvent: CalendarEvent | null = null;
  dialogOpen: DialogType = null;
  createPrefill: Partial<CalendarEvent> | null = null;
  isLoading = false;

  // Subscribers
  private _hosts = new Set<ReactiveControllerHost>();
  private _autoAdvanceTimer: ReturnType<typeof setInterval> | null = null;
  /** Local date key of "today" at the last rollover check. */
  private _todayKey = getDateKey(new Date());
  private _onVisibilityChange = (): void => {
    if (document.visibilityState === 'visible') this.checkRollover();
  };

  // =========================================================================
  // Subscription
  // =========================================================================

  subscribe(host: ReactiveControllerHost): void {
    this._hosts.add(host);
  }

  unsubscribe(host: ReactiveControllerHost): void {
    this._hosts.delete(host);
  }

  private _notify(): void {
    for (const host of this._hosts) {
      host.requestUpdate();
    }
  }

  // =========================================================================
  // UI Actions
  // =========================================================================

  /** Replaces the Set (never mutates it) so memoized views see a new identity. */
  toggleCalendar(entityId: string): void {
    const next = new Set(this.hiddenCalendars);
    if (next.has(entityId)) {
      next.delete(entityId);
    } else {
      next.add(entityId);
    }
    this.hiddenCalendars = next;
    this._notify();
  }

  setView(view: ViewType): void {
    if (this.currentView !== view) {
      this.currentView = view;
      this._notify();
    }
  }

  navigateDate(direction: 'prev' | 'next' | 'today'): void {
    if (direction === 'today') {
      this.currentDate = new Date();
    } else {
      this.currentDate = navigateDate(this.currentDate, this.currentView, direction);
    }
    this._notify();
  }

  setDate(date: Date): void {
    this.currentDate = new Date(date);
    this._notify();
  }

  selectEvent(event: CalendarEvent | null): void {
    this.selectedEvent = event;
    this._notify();
  }

  openCreateDialog(prefill?: Partial<CalendarEvent>): void {
    this.dialogOpen = 'create';
    this.createPrefill = prefill || null;
    this._notify();
  }

  openEditDialog(event: CalendarEvent, hints?: { removeGuests?: boolean }): void {
    this.dialogOpen = 'edit';
    this.selectedEvent = event;
    const prefill: any = { ...event };
    if (hints?.removeGuests) {
      prefill._removeGuestsHint = true;
    }
    this.createPrefill = prefill;
    this._notify();
  }

  closeDialog(): void {
    this.dialogOpen = null;
    this.createPrefill = null;
    this._notify();
  }

  // =========================================================================
  // Event CRUD (async, calls HA services)
  // =========================================================================

  async doCreateEvent(hass: HomeAssistant, data: CreateEventData): Promise<void> {
    this.isLoading = true;
    this._notify();
    try {
      await createEvent(hass, data);
      await refreshPlanaVista(hass);
      this.closeDialog();
    } catch (err) {
      console.error('PlanaVista: Failed to create event', err);
      throw err;
    } finally {
      this.isLoading = false;
      this._notify();
    }
  }

  async doDeleteEvent(hass: HomeAssistant, data: DeleteEventData): Promise<void> {
    this.isLoading = true;
    this._notify();
    try {
      await deleteEvent(hass, data);
      await refreshPlanaVista(hass);
      this.selectedEvent = null;
      this.closeDialog();
    } catch (err) {
      console.error('PlanaVista: Failed to delete event', err);
      throw err;
    } finally {
      this.isLoading = false;
      this._notify();
    }
  }

  /**
   * Edit = delete + recreate. If the recreate fails, `restore` (the original
   * event's payload) is created again and the thrown error says so.
   */
  async doEditEvent(
    hass: HomeAssistant,
    oldEvent: DeleteEventData,
    newEvent: CreateEventData,
    restore: CreateEventData,
  ): Promise<void> {
    this.isLoading = true;
    this._notify();
    try {
      await runEditWithRestore({
        remove: () => deleteEvent(hass, oldEvent),
        create: () => createEvent(hass, newEvent),
        restore: () => createEvent(hass, restore),
      });
      await refreshPlanaVista(hass);
      this.selectedEvent = null;
      this.closeDialog();
    } catch (err) {
      console.error('PlanaVista: Failed to edit event', err);
      // Show whatever is on the calendar now (the restored original, if any).
      await refreshPlanaVista(hass).catch(() => undefined);
      throw err;
    } finally {
      this.isLoading = false;
      this._notify();
    }
  }

  // =========================================================================
  // Auto-advance
  // =========================================================================

  /**
   * Follow "today" across midnight: if the local date changed since the last
   * check and the view was on that day, move it to the new today.
   */
  checkRollover(now: Date = new Date()): void {
    const next = rolloverDate(this.currentDate, this._todayKey, now);
    this._todayKey = getDateKey(now);
    if (next) {
      this.currentDate = next;
      this._notify();
    }
  }

  /** True while the day-change timer runs (between start and stop). */
  get autoAdvancing(): boolean {
    return this._autoAdvanceTimer !== null;
  }

  startAutoAdvance(): void {
    if (this._autoAdvanceTimer) return;
    // Catch up on a day that changed while the timer was stopped.
    this.checkRollover();
    this._autoAdvanceTimer = setInterval(() => this.checkRollover(), 60000);
    // Timers are throttled or paused while a tablet sleeps; check as soon as it wakes.
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', this._onVisibilityChange);
    }
  }

  stopAutoAdvance(): void {
    if (this._autoAdvanceTimer) {
      clearInterval(this._autoAdvanceTimer);
      this._autoAdvanceTimer = null;
    }
    if (typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', this._onVisibilityChange);
    }
  }
}

/**
 * Gives one element its own CalendarStore, re-renders it when the store
 * changes, and runs the store's day-change timer while it is connected.
 *
 * Usage:
 *   private _pv = new CalendarStoreController(this);
 *   // this._pv.store.currentView, this._pv.store.setView('week')
 */
export class CalendarStoreController implements ReactiveController {
  readonly store = new CalendarStore();

  constructor(private readonly host: ReactiveControllerHost) {
    host.addController(this);
  }

  hostConnected(): void {
    this.store.subscribe(this.host);
    this.store.startAutoAdvance();
  }

  hostDisconnected(): void {
    this.store.unsubscribe(this.host);
    this.store.stopAutoAdvance();
  }
}

/**
 * Re-renders a child element (the event popup or dialog) whenever the store
 * its parent handed it changes, and follows the parent to a new store.
 */
export class StoreSubscriber implements ReactiveController {
  private _store: CalendarStore | undefined;

  constructor(
    private readonly host: ReactiveControllerHost,
    private readonly getStore: () => CalendarStore | undefined,
  ) {
    host.addController(this);
  }

  hostConnected(): void {
    this._sync();
  }

  hostUpdate(): void {
    this._sync();
  }

  hostDisconnected(): void {
    this._store?.unsubscribe(this.host);
    this._store = undefined;
  }

  private _sync(): void {
    const next = this.getStore();
    if (next === this._store) return;
    this._store?.unsubscribe(this.host);
    next?.subscribe(this.host);
    this._store = next;
  }
}

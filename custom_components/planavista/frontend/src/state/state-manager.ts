import { ReactiveController, ReactiveControllerHost } from 'lit';
import { HomeAssistant } from 'custom-card-helpers';
import { ViewType, CalendarEvent, DialogType, CreateEventData, DeleteEventData } from '../types';
import { createEvent, deleteEvent, refreshPlanaVista } from '../utils/ha-utils';
import { navigateDate } from '../utils/date-utils';
import { runEditWithRestore } from '../utils/event-form';

/**
 * Singleton state manager for PlanaVista.
 * Holds client-side UI state shared across all cards.
 */
class PlanaVistaStateManager {
  private static _instance: PlanaVistaStateManager;

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

  private constructor() {
    this.startAutoAdvance();
  }

  static getInstance(): PlanaVistaStateManager {
    if (!PlanaVistaStateManager._instance) {
      PlanaVistaStateManager._instance = new PlanaVistaStateManager();
    }
    return PlanaVistaStateManager._instance;
  }

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

  toggleCalendar(entityId: string): void {
    if (this.hiddenCalendars.has(entityId)) {
      this.hiddenCalendars.delete(entityId);
    } else {
      this.hiddenCalendars.add(entityId);
    }
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

  startAutoAdvance(): void {
    if (this._autoAdvanceTimer) return;
    this._autoAdvanceTimer = setInterval(() => {
      const now = new Date();
      if (
        now.getDate() !== this.currentDate.getDate() ||
        now.getMonth() !== this.currentDate.getMonth() ||
        now.getFullYear() !== this.currentDate.getFullYear()
      ) {
        // Date has changed — only auto-advance if we were viewing "today"
        const wasToday =
          this.currentDate.toDateString() ===
          new Date(Date.now() - 60000).toDateString(); // 1 min ago
        if (wasToday) {
          this.currentDate = now;
          this._notify();
        }
      }
    }, 60000); // Check every 60 seconds
  }

  stopAutoAdvance(): void {
    if (this._autoAdvanceTimer) {
      clearInterval(this._autoAdvanceTimer);
      this._autoAdvanceTimer = null;
    }
  }
}

/**
 * ReactiveController wrapper for Lit components.
 * Add to any LitElement to get access to shared PlanaVista state.
 *
 * Usage:
 *   private _pv = new PlanaVistaController(this);
 *   // Access state: this._pv.state.currentView
 *   // Actions: this._pv.state.setView('week')
 */
export class PlanaVistaController implements ReactiveController {
  host: ReactiveControllerHost;
  private _state: PlanaVistaStateManager;

  constructor(host: ReactiveControllerHost) {
    this.host = host;
    this._state = PlanaVistaStateManager.getInstance();
    host.addController(this);
  }

  hostConnected(): void {
    this._state.subscribe(this.host);
  }

  hostDisconnected(): void {
    this._state.unsubscribe(this.host);
  }

  get state(): PlanaVistaStateManager {
    return this._state;
  }
}

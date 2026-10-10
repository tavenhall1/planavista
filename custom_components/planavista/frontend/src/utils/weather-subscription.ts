import { getDateKey, parseEventDate } from './date-utils';

/** One entry of a weather/subscribe_forecast message. */
export interface ForecastEntry {
  datetime: string;
  condition: string;
  temperature: number;
  templow?: number;
}

/** A day's forecast as the views show it. */
export interface DayForecast {
  condition: string;
  tempHigh: number;
  tempLow: number;
}

type Unsubscribe = () => void | Promise<void>;

/** The part of hass.connection this helper uses. */
export interface ForecastConnection {
  subscribeMessage(
    callback: (msg: { forecast?: ForecastEntry[] }) => void,
    message: Record<string, unknown>,
  ): Promise<Unsubscribe>;
}

export function safeUnsubscribe(unsub: Unsubscribe): void {
  try {
    const result = unsub();
    if (result && typeof (result as Promise<void>).catch === 'function') {
      (result as Promise<void>).catch(() => undefined);
    }
  } catch {
    // The connection may already be gone; nothing left to clean up.
  }
}

/**
 * Daily forecast subscription shared by the Week and Agenda views.
 *
 * Holds at most one live subscription and never loses its unsubscribe
 * handle: repeated update() calls for the same entity while a subscribe is
 * still in flight don't start another one, and a subscribe that resolves
 * after stop() (or after the entity changed) is unsubscribed immediately.
 */
export class ForecastSubscription {
  /** Entity subscribed to, being subscribed to, or that fell back to its legacy attribute; '' when stopped. */
  private _entityId = '';
  private _unsub: Unsubscribe | null = null;
  /** Incremented on every stop/replace; stale callbacks compare against it. */
  private _generation = 0;

  constructor(private readonly _onForecast: (forecast: ForecastEntry[]) => void) {}

  /**
   * Subscribe to `entityId`'s daily forecast; a no-op when already handling
   * that entity (subscribed, subscribing, or fallen back). An empty entity or
   * missing connection stops any subscription and clears the forecast.
   * `legacyForecast` (the entity's old `forecast` attribute) is used if the
   * subscribe command fails.
   */
  update(connection: ForecastConnection | undefined, entityId: string, legacyForecast?: ForecastEntry[]): void {
    if (!entityId || !connection) {
      const wasActive = this._entityId !== '';
      this.stop();
      if (wasActive) this._onForecast([]);
      return;
    }
    if (entityId === this._entityId) return;
    this.stop();
    this._entityId = entityId;
    const generation = this._generation;
    connection
      .subscribeMessage(
        msg => {
          if (generation === this._generation) this._onForecast(msg?.forecast || []);
        },
        { type: 'weather/subscribe_forecast', forecast_type: 'daily', entity_id: entityId },
      )
      .then(unsub => {
        if (generation !== this._generation) {
          safeUnsubscribe(unsub); // stopped or replaced while in flight
          return;
        }
        this._unsub = unsub;
      })
      .catch(() => {
        if (generation === this._generation) this._onForecast(legacyForecast || []);
      });
  }

  /** Drop the subscription (including one still in flight). */
  stop(): void {
    this._generation++;
    this._entityId = '';
    if (this._unsub) {
      const unsub = this._unsub;
      this._unsub = null;
      safeUnsubscribe(unsub);
    }
  }
}

/** Forecast entries keyed by local date (YYYY-MM-DD). */
export function buildForecastMap(forecast: ForecastEntry[]): Map<string, DayForecast> {
  const map = new Map<string, DayForecast>();
  for (const fc of forecast) {
    if (!fc.datetime) continue;
    map.set(getDateKey(parseEventDate(fc.datetime)), {
      condition: fc.condition || '',
      tempHigh: fc.temperature ?? 0,
      tempLow: fc.templow ?? fc.temperature ?? 0,
    });
  }
  return map;
}

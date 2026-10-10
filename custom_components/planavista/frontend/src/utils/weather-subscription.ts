import { getDateKey, parseEventDate } from './date-utils';
import { Unsubscribe, retryDelayMs, safeUnsubscribe } from './subscriptions';

export { safeUnsubscribe } from './subscriptions';

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

/** The part of hass.connection this helper uses. */
export interface ForecastConnection {
  subscribeMessage(
    callback: (msg: { forecast?: ForecastEntry[] }) => void,
    message: Record<string, unknown>,
    options?: { resubscribe?: boolean },
  ): Promise<Unsubscribe>;
  addEventListener?(event: 'ready', listener: () => void): void;
  removeEventListener?(event: 'ready', listener: () => void): void;
}

/** Tries after a failed subscribe before settling on the entity's own forecast: about a minute. */
export const RECONNECT_TRIES = 6;

/**
 * The daily forecast for the card's weather entity (the header's high and
 * low, and the Week and Agenda views), one subscription per card.
 *
 * Holds at most one live subscription and never loses its unsubscribe
 * handle: repeated update() calls for the same entity while a subscribe is
 * still in flight don't start another one, and a subscribe that resolves
 * after stop() (or after the entity changed) is unsubscribed immediately.
 * After Home Assistant restarts, the socket comes back before the weather
 * integration does: the socket library drops a resubscribe that fails, and
 * Home Assistant rebuilds the dashboard's cards, whose first subscribe can
 * fail the same way. So this subscribes again after every reconnect, and a
 * failed subscribe tries again for about a minute (1 s, doubling). Meanwhile
 * a card that never had a forecast shows the entity's own forecast
 * attribute, and one that had a forecast keeps it; once the tries run out,
 * the entity's attribute is what shows.
 */
export class ForecastSubscription {
  /** Entity subscribed to, being subscribed to, or that fell back to its legacy attribute; '' when stopped. */
  private _entityId = '';
  private _connection: ForecastConnection | undefined;
  private _legacy: ForecastEntry[] | undefined;
  private _unsub: Unsubscribe | null = null;
  /** Incremented on every stop, replace, and reconnect; stale callbacks compare against it. */
  private _generation = 0;
  private _retry: ReturnType<typeof setTimeout> | undefined;
  private _attempt = 0;
  /** A forecast arrived for this entity since it was subscribed to. */
  private _hadForecast = false;

  constructor(private readonly _onForecast: (forecast: ForecastEntry[]) => void) {}

  /**
   * Subscribe to `entityId`'s daily forecast; a no-op when already handling
   * that entity on this connection. An empty entity or a missing connection
   * stops any subscription and clears the forecast. `legacyForecast` (the
   * entity's old `forecast` attribute) is used when subscribing fails.
   */
  update(connection: ForecastConnection | undefined, entityId: string, legacyForecast?: ForecastEntry[]): void {
    this._legacy = legacyForecast;
    if (!entityId || !connection) {
      const wasActive = this._entityId !== '';
      this.stop();
      if (wasActive) this._onForecast([]);
      return;
    }
    if (entityId === this._entityId && connection === this._connection) return;
    this.stop();
    this._entityId = entityId;
    this._connection = connection;
    connection.addEventListener?.('ready', this._onReady);
    this._subscribe();
  }

  /** Drop the subscription (including one still in flight) and stop following reconnects. */
  stop(): void {
    this._generation++;
    this._cancelRetry();
    this._connection?.removeEventListener?.('ready', this._onReady);
    this._connection = undefined;
    this._entityId = '';
    this._hadForecast = false;
    if (this._unsub) {
      const unsub = this._unsub;
      this._unsub = null;
      safeUnsubscribe(unsub);
    }
  }

  /** The socket was made again: Home Assistant forgot the subscription with the old one. */
  private _onReady = (): void => {
    if (!this._connection || !this._entityId) return;
    this._generation++;
    // Not unsubscribed: command ids start again after a reconnect.
    this._unsub = null;
    this._cancelRetry();
    this._subscribe();
  };

  private _subscribe(): void {
    const connection = this._connection;
    if (!connection) return;
    const generation = this._generation;
    connection
      .subscribeMessage(
        msg => {
          if (generation !== this._generation) return;
          this._hadForecast = true;
          this._onForecast(msg?.forecast || []);
        },
        { type: 'weather/subscribe_forecast', forecast_type: 'daily', entity_id: this._entityId },
        { resubscribe: false },
      )
      .then(unsub => {
        if (generation !== this._generation) {
          safeUnsubscribe(unsub); // stopped or replaced while in flight
          return;
        }
        this._unsub = unsub;
        this._attempt = 0;
      })
      .catch(() => {
        if (generation !== this._generation) return;
        const givingUp = this._attempt >= RECONNECT_TRIES;
        if (givingUp || !this._hadForecast) this._onForecast(this._legacy || []);
        if (givingUp) return;
        this._retry = setTimeout(() => {
          this._retry = undefined;
          if (generation === this._generation) this._subscribe();
        }, retryDelayMs(this._attempt++));
      });
  }

  private _cancelRetry(): void {
    if (this._retry !== undefined) clearTimeout(this._retry);
    this._retry = undefined;
    this._attempt = 0;
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

/** Today's high and low for the portrait header; null when the forecast has no entry for today. */
export function todayHighLow(forecast: ForecastEntry[], now: Date): { high: number; low: number | null } | null {
  const today = getDateKey(now);
  const entry = forecast.find(fc => fc.datetime && getDateKey(parseEventDate(fc.datetime)) === today);
  if (!entry || typeof entry.temperature !== 'number') return null;
  return { high: Math.round(entry.temperature), low: typeof entry.templow === 'number' ? Math.round(entry.templow) : null };
}

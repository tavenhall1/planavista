import { Unsubscribe, retryDelayMs, safeUnsubscribe } from '../utils/subscriptions';

/** The part of hass.connection a live subscription uses. */
export interface LiveConnection<T> {
  subscribeMessage(
    callback: (event: T) => void,
    message: Record<string, unknown>,
    options?: { resubscribe?: boolean },
  ): Promise<Unsubscribe>;
  addEventListener(event: 'ready' | 'disconnected', listener: () => void): void;
  removeEventListener(event: 'ready' | 'disconnected', listener: () => void): void;
}

/** idle (no connection), connecting (asked, no answer yet), live, or offline (dropped or refused; trying again). */
export type LiveStatus = 'idle' | 'connecting' | 'live' | 'offline';

/**
 * Follows one PlanaVista subscription with at most one live subscription.
 * A subscribe that resolves after stop() is dropped at once. When the
 * backend refuses before anything arrived, the event handler hears null.
 *
 * After Home Assistant restarts, the socket comes back before PlanaVista's
 * commands do, and the socket library drops a resubscribe that fails. So
 * this subscribes itself after every reconnect and keeps trying (keeping the
 * last event meanwhile), or a kiosk would keep a frozen screen until it
 * reloads.
 */
export class LiveSubscription<T> {
  status: LiveStatus = 'idle';
  private _connection: LiveConnection<T> | undefined;
  private _unsub: Unsubscribe | null = null;
  private _generation = 0;
  private _retry: ReturnType<typeof setTimeout> | undefined;
  private _attempt = 0;
  private _hadEvent = false;

  constructor(
    private readonly _message: Record<string, unknown>,
    private readonly _onEvent: (event: T | null) => void,
    private readonly _onStatus?: (status: LiveStatus) => void,
  ) {}

  update(connection: LiveConnection<T> | undefined): void {
    if (connection === this._connection) return;
    this.stop();
    this._connection = connection;
    if (!connection) return;
    connection.addEventListener('ready', this._onReady);
    connection.addEventListener('disconnected', this._onDisconnected);
    this._subscribe();
  }

  stop(): void {
    this._generation++;
    this._cancelRetry();
    this._connection?.removeEventListener('ready', this._onReady);
    this._connection?.removeEventListener('disconnected', this._onDisconnected);
    this._connection = undefined;
    this._hadEvent = false;
    if (this._unsub) {
      const unsub = this._unsub;
      this._unsub = null;
      safeUnsubscribe(unsub);
    }
    this._setStatus('idle');
  }

  /** Try again now (a Try again button), instead of waiting for the next retry. */
  retry(): void {
    if (!this._connection || this.status === 'live' || this.status === 'connecting') return;
    this._generation++;
    this._cancelRetry();
    this._subscribe();
  }

  /** The socket was made again: the backend forgot the subscription with the old one. */
  private _onReady = (): void => {
    if (!this._connection) return;
    this._generation++;
    // Not unsubscribed: command ids start again after a reconnect, so the
    // old id may belong to a new command now.
    this._unsub = null;
    this._cancelRetry();
    this._subscribe();
  };

  private _onDisconnected = (): void => {
    if (this._connection) this._setStatus('offline');
  };

  private _subscribe(): void {
    const connection = this._connection;
    if (!connection) return;
    const generation = this._generation;
    if (this.status !== 'offline') this._setStatus('connecting');
    connection
      .subscribeMessage(
        event => {
          if (generation !== this._generation) return;
          this._hadEvent = true;
          this._onEvent(event);
        },
        this._message,
        { resubscribe: false },
      )
      .then(unsub => {
        if (generation !== this._generation) {
          safeUnsubscribe(unsub);
          return;
        }
        this._unsub = unsub;
        this._attempt = 0;
        this._setStatus('live');
      })
      .catch(() => {
        if (generation !== this._generation) return;
        if (!this._hadEvent) this._onEvent(null);
        this._setStatus('offline');
        this._retry = setTimeout(() => {
          this._retry = undefined;
          if (generation === this._generation) this._subscribe();
        }, retryDelayMs(this._attempt++));
      });
  }

  private _setStatus(status: LiveStatus): void {
    if (status === this.status) return;
    this.status = status;
    this._onStatus?.(status);
  }

  private _cancelRetry(): void {
    if (this._retry !== undefined) clearTimeout(this._retry);
    this._retry = undefined;
    this._attempt = 0;
  }
}

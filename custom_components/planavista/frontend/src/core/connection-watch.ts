/** The events of hass.connection that say its socket closed or was made again. */
export type ConnectionEvent = 'ready' | 'disconnected';

/** The part of hass.connection that reports drops and reconnects. */
export interface ConnectionEvents {
  addEventListener(event: ConnectionEvent, listener: () => void): void;
  removeEventListener(event: ConnectionEvent, listener: () => void): void;
}

/**
 * Calls back when the followed connection drops or comes back. The backend
 * binds a PIN session to one WebSocket connection (spec 9.4), so either
 * event means the session is over. Follows at most one connection.
 */
export class ConnectionWatch {
  private _connection: ConnectionEvents | undefined;

  constructor(private readonly _onDrop: () => void) {}

  follow(connection: ConnectionEvents | undefined): void {
    if (connection === this._connection) return;
    this.stop();
    this._connection = connection;
    connection?.addEventListener('disconnected', this._handle);
    connection?.addEventListener('ready', this._handle);
  }

  stop(): void {
    this._connection?.removeEventListener('disconnected', this._handle);
    this._connection?.removeEventListener('ready', this._handle);
    this._connection = undefined;
  }

  private _handle = (): void => {
    this._onDrop();
  };
}

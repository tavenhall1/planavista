import { HouseholdView, Member, MemberChanges } from './household';
import { Unsubscribe, retryDelayMs, safeUnsubscribe } from '../utils/subscriptions';

export { retryDelayMs };

/** The part of hass.connection the subscription uses. */
export interface HouseholdConnection {
  subscribeMessage(
    callback: (view: HouseholdView) => void,
    message: Record<string, unknown>,
    options?: { resubscribe?: boolean },
  ): Promise<Unsubscribe>;
  addEventListener(event: 'ready', listener: () => void): void;
  removeEventListener(event: 'ready', listener: () => void): void;
}

/**
 * Follows planavista/household/subscribe with at most one live subscription.
 * A subscribe that resolves after stop() is dropped at once. When the backend
 * has no household (an older PlanaVista, or not set up yet), the view is null.
 *
 * After Home Assistant restarts, the socket comes back before PlanaVista's
 * commands do, and the socket library drops a resubscribe that fails. So
 * this subscribes itself after every reconnect and keeps trying (keeping the
 * last view meanwhile), or a kiosk would keep a frozen household until it
 * reloads.
 */
export class HouseholdSubscription {
  private _connection: HouseholdConnection | undefined;
  private _unsub: Unsubscribe | null = null;
  private _generation = 0;
  private _retry: ReturnType<typeof setTimeout> | undefined;
  private _attempt = 0;
  private _hadView = false;

  constructor(private readonly _onView: (view: HouseholdView | null) => void) {}

  update(connection: HouseholdConnection | undefined): void {
    if (connection === this._connection) return;
    this.stop();
    this._connection = connection;
    if (!connection) return;
    connection.addEventListener('ready', this._onReady);
    this._subscribe();
  }

  stop(): void {
    this._generation++;
    this._cancelRetry();
    this._connection?.removeEventListener('ready', this._onReady);
    this._connection = undefined;
    this._hadView = false;
    if (this._unsub) {
      const unsub = this._unsub;
      this._unsub = null;
      safeUnsubscribe(unsub);
    }
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

  private _subscribe(): void {
    const connection = this._connection;
    if (!connection) return;
    const generation = this._generation;
    connection
      .subscribeMessage(
        view => {
          if (generation !== this._generation) return;
          this._hadView = true;
          this._onView(view);
        },
        { type: 'planavista/household/subscribe' },
        { resubscribe: false },
      )
      .then(unsub => {
        if (generation !== this._generation) {
          safeUnsubscribe(unsub);
          return;
        }
        this._unsub = unsub;
        this._attempt = 0;
      })
      .catch(() => {
        if (generation !== this._generation) return;
        if (!this._hadView) this._onView(null);
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

/** The part of hass the commands use. */
export interface WsCaller {
  callWS<T>(message: Record<string, unknown>): Promise<T>;
}

export interface UnlockResult {
  ok: boolean;
  session?: string;
  member_id?: string;
  parent?: boolean;
  expires_in?: number;
  reason?: 'no_pin' | 'wrong_pin' | 'paused';
  tries_left?: number;
  retry_after?: number | null;
}

/**
 * The household and PIN commands, with this card's session token added when
 * it has one. A command refused with parent_mode_required although it
 * carried a session means the backend already ended that session (after a
 * reconnect or a restart); `onSessionEnded` hears about it.
 */
export class HouseholdApi {
  constructor(
    private readonly _ws: WsCaller,
    private readonly _session: () => string | null,
    private readonly _onSessionEnded?: (token: string) => void,
  ) {}

  private _call<T>(type: string, fields: Record<string, unknown>, withSession = true): Promise<T> {
    const message: Record<string, unknown> = { type, ...fields };
    const token = withSession ? this._session() : null;
    if (!token) return this._ws.callWS<T>(message);
    message.session = token;
    return this._ws.callWS<T>(message).catch((err: unknown) => {
      if (errorCode(err) === 'parent_mode_required') this._onSessionEnded?.(token);
      throw err;
    });
  }

  saveMember(changes: MemberChanges, existing?: { id: string; rev: number }): Promise<{ member: Member }> {
    const fields: Record<string, unknown> = { member: changes };
    if (existing) Object.assign(fields, { member_id: existing.id, rev: existing.rev });
    return this._call('planavista/household/member/save', fields);
  }

  deleteMember(memberId: string): Promise<void> {
    return this._call('planavista/household/member/delete', { member_id: memberId });
  }

  reorder(order: string[]): Promise<void> {
    return this._call('planavista/household/member/reorder', { order });
  }

  setSharedScreen(shared: boolean): Promise<void> {
    return this._call('planavista/household/shared_screen', { shared });
  }

  saveSecurity(settings: { shuffle_keypad: boolean }): Promise<void> {
    return this._call('planavista/household/settings/save', settings);
  }

  saveSetup(progress: { step?: string | null; completed?: boolean }): Promise<void> {
    return this._call('planavista/household/setup/save', progress);
  }

  saveConfig(changes: Record<string, unknown>): Promise<void> {
    return this._call('planavista/config/save', changes);
  }

  unlock(memberId: string, pin: string): Promise<UnlockResult> {
    return this._call('planavista/pin/unlock', { member_id: memberId, pin }, false);
  }

  setPin(memberId: string, pin: string): Promise<void> {
    return this._call('planavista/pin/set', { member_id: memberId, pin });
  }

  clearPin(memberId: string): Promise<void> {
    return this._call('planavista/pin/clear', { member_id: memberId });
  }

  clearPause(memberId: string): Promise<void> {
    return this._call('planavista/pin/clear_lockout', { member_id: memberId });
  }

  lock(token: string): Promise<void> {
    return this._call('planavista/pin/lock', { session: token }, false);
  }

  touch(token: string): Promise<{ expires_in: number }> {
    return this._call('planavista/pin/touch', { session: token }, false);
  }
}

/** The code of a failed command (Home Assistant rejects with {code, message}). */
export function errorCode(err: unknown): string {
  if (err && typeof err === 'object' && typeof (err as { code?: unknown }).code === 'string') {
    return (err as { code: string }).code;
  }
  return 'unknown';
}

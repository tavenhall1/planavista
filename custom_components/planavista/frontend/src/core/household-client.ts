import { HouseholdView, Member, MemberChanges } from './household';
import { safeUnsubscribe } from '../utils/weather-subscription';

type Unsubscribe = () => void | Promise<void>;

/** The part of hass.connection the subscription uses. */
export interface HouseholdConnection {
  subscribeMessage(
    callback: (view: HouseholdView) => void,
    message: Record<string, unknown>,
  ): Promise<Unsubscribe>;
}

/**
 * Follows planavista/household/subscribe with at most one live subscription.
 * A subscribe that resolves after stop() is dropped at once. When the backend
 * has no household (an older PlanaVista), the view is null.
 */
export class HouseholdSubscription {
  private _connection: HouseholdConnection | undefined;
  private _unsub: Unsubscribe | null = null;
  private _generation = 0;

  constructor(private readonly _onView: (view: HouseholdView | null) => void) {}

  update(connection: HouseholdConnection | undefined): void {
    if (connection === this._connection) return;
    this.stop();
    this._connection = connection;
    if (!connection) return;
    const generation = this._generation;
    connection
      .subscribeMessage(
        view => {
          if (generation === this._generation) this._onView(view);
        },
        { type: 'planavista/household/subscribe' },
      )
      .then(unsub => {
        if (generation !== this._generation) {
          safeUnsubscribe(unsub);
          return;
        }
        this._unsub = unsub;
      })
      .catch(() => {
        if (generation === this._generation) this._onView(null);
      });
  }

  stop(): void {
    this._generation++;
    this._connection = undefined;
    if (this._unsub) {
      const unsub = this._unsub;
      this._unsub = null;
      safeUnsubscribe(unsub);
    }
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

/** The household and PIN commands, with this card's session token added when it has one. */
export class HouseholdApi {
  constructor(
    private readonly _ws: WsCaller,
    private readonly _session: () => string | null,
  ) {}

  private _call<T>(type: string, fields: Record<string, unknown>, withSession = true): Promise<T> {
    const message: Record<string, unknown> = { type, ...fields };
    const token = withSession ? this._session() : null;
    if (token) message.session = token;
    return this._ws.callWS<T>(message);
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

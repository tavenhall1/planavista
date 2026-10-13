import { ReactiveController, ReactiveControllerHost } from 'lit';
import { ConnectionEvents, ConnectionWatch } from '../core/connection-watch';
import { HouseholdApi, UnlockResult } from '../core/household-client';
import { Session, endsAt, expired, noteActivity, startSession, usedAt, withLimits } from '../core/session';

type Host = ReactiveControllerHost & HTMLElement & { hass?: { connection?: unknown } };

/**
 * The card's PIN session (spec 9.4). A PIN starts it; touches keep it open,
 * reported at most every 30 seconds; Lock, the household's quiet time (two
 * minutes unless changed), its cap however busy (D3), a hidden page,
 * a dropped or re-made connection (the backend bound the session to the old
 * one), or a command or touch the backend refuses (it forgot the session,
 * for example after a restart) end it. Ending is the safe way to fail on a
 * kiosk.
 */
export class SessionController implements ReactiveController {
  session: Session | null = null;
  private _timer: number | undefined;
  private readonly _connection = new ConnectionWatch(() => this._forget());

  constructor(
    private readonly _host: Host,
    private readonly _api: () => HouseholdApi,
  ) {
    _host.addController(this);
  }

  get token(): string | null {
    return this.session?.token ?? null;
  }

  /** When the session ends unless someone touches the screen (ms since the epoch). */
  get endsAt(): number | null {
    return this.session ? endsAt(this.session) : null;
  }

  /** A full ring: the household's quiet time (ms). */
  get spanMs(): number {
    return this.session?.idleMs ?? 0;
  }

  hostConnected(): void {
    this._host.addEventListener('pointerdown', this._onActivity, true);
    this._host.addEventListener('keydown', this._onActivity, true);
    document.addEventListener('visibilitychange', this._onVisibility);
    this._followConnection();
  }

  hostUpdate(): void {
    // A no-op unless Home Assistant handed the card a different connection.
    this._followConnection();
  }

  hostDisconnected(): void {
    this._host.removeEventListener('pointerdown', this._onActivity, true);
    this._host.removeEventListener('keydown', this._onActivity, true);
    document.removeEventListener('visibilitychange', this._onVisibility);
    this._connection.stop();
    this.lock();
  }

  /** The backend refused a command made with this session: it has already ended there. */
  ended(token: string): void {
    if (this.session?.token === token) this._forget();
  }

  /** The backend accepted a command made with this session: it counted as a touch there. */
  used(token: string): void {
    if (this.session?.token !== token) return;
    this.session = usedAt(this.session, Date.now());
    this._host.requestUpdate();
  }

  private _followConnection(): void {
    this._connection.follow(this._host.hass?.connection as ConnectionEvents | undefined);
  }

  /** The household's limits as saved now (Settings may change them while a session is open). */
  follow(security: { session_idle_seconds?: number; parent_mode_minutes?: number } | undefined): void {
    if (!this.session || !security) return;
    const next = withLimits(this.session, security.session_idle_seconds, security.parent_mode_minutes);
    if (next === this.session) return;
    this.session = next;
    this._host.requestUpdate();
  }

  /** A PIN was accepted: start the session it returned. */
  unlocked(result: UnlockResult): void {
    if (!result.ok || !result.session || !result.member_id) return;
    this._forget();
    this.session = startSession(
      {
        session: result.session, member_id: result.member_id, parent: !!result.parent,
        idle_seconds: result.idle_seconds, cap_in: result.cap_in, admin_parent: result.admin_parent,
      },
      Date.now(),
    );
    this._timer = window.setInterval(this._check, 1000);
    this._host.requestUpdate();
  }

  /** End the session here and on the backend. */
  lock(): void {
    const token = this.token;
    this._forget();
    if (token) this._api().lock(token).catch(() => undefined);
  }

  private _forget(): void {
    window.clearInterval(this._timer);
    this._timer = undefined;
    if (this.session) {
      this.session = null;
      this._host.requestUpdate();
    }
  }

  private _check = (): void => {
    if (this.session && expired(this.session, Date.now())) this.lock();
  };

  private _onActivity = (): void => {
    if (!this.session) return;
    const { session, touch } = noteActivity(this.session, Date.now());
    if (!touch) return;
    this.session = session;
    const token = session.token;
    // A refused touch means the backend already forgot the session.
    this._api().touch(token).catch(() => {
      if (this.session?.token === token) this._forget();
    });
    this._host.requestUpdate();
  };

  private _onVisibility = (): void => {
    if (document.visibilityState === 'hidden') this.lock();
  };
}

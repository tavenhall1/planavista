import { ReactiveController, ReactiveControllerHost } from 'lit';
import { HouseholdApi, UnlockResult } from '../core/household-client';
import { SESSION_IDLE_MS, Session, expired, noteActivity, startSession } from '../core/session';

type Host = ReactiveControllerHost & HTMLElement;

/**
 * The card's PIN session (spec 9.4). A PIN starts it; touches keep it open,
 * reported at most every 30 seconds; Lock, two quiet minutes, a hidden page,
 * or a touch the backend refuses (it forgot the session, for example after a
 * restart) end it. Ending is the safe way to fail on a kiosk.
 */
export class SessionController implements ReactiveController {
  session: Session | null = null;
  private _timer: number | undefined;

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
    return this.session ? this.session.lastTouch + SESSION_IDLE_MS : null;
  }

  hostConnected(): void {
    this._host.addEventListener('pointerdown', this._onActivity, true);
    this._host.addEventListener('keydown', this._onActivity, true);
    document.addEventListener('visibilitychange', this._onVisibility);
  }

  hostDisconnected(): void {
    this._host.removeEventListener('pointerdown', this._onActivity, true);
    this._host.removeEventListener('keydown', this._onActivity, true);
    document.removeEventListener('visibilitychange', this._onVisibility);
    this.lock();
  }

  /** A PIN was accepted: start the session it returned. */
  unlocked(result: UnlockResult): void {
    if (!result.ok || !result.session || !result.member_id) return;
    this._forget();
    this.session = startSession(
      { session: result.session, member_id: result.member_id, parent: !!result.parent },
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

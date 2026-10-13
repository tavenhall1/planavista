/** The part of hass the commands use. */
export interface WsCaller {
  callWS<T>(message: Record<string, unknown>): Promise<T>;
}

/** The code of a failed command (Home Assistant rejects with {code, message}). */
export function errorCode(err: unknown): string {
  if (err && typeof err === 'object' && typeof (err as { code?: unknown }).code === 'string') {
    return (err as { code: string }).code;
  }
  return 'unknown';
}

/** What a failed command said, for a toast (Home Assistant rejects with {code, message}). */
export function errorMessage(err: unknown): string | null {
  if (err && typeof err === 'object' && typeof (err as { message?: unknown }).message === 'string') {
    return (err as { message: string }).message;
  }
  return null;
}

/** Codes that mean the backend no longer knows the session a command carried. */
const SESSION_GONE = new Set(['parent_mode_required', 'pin_required']);

/**
 * PlanaVista commands with this card's PIN session token added when it has
 * one. A command refused for want of a PIN although it carried a session
 * means the backend already ended that session (after a reconnect or a
 * restart); `onSessionEnded` hears about it. A command the backend accepted
 * with the session also counted as a touch there; `onSessionUsed` hears about
 * that, so the card's countdown matches.
 */
export class WsApi {
  constructor(
    private readonly _ws: WsCaller,
    private readonly _session: () => string | null,
    private readonly _onSessionEnded?: (token: string) => void,
    private readonly _onSessionUsed?: (token: string) => void,
  ) {}

  protected call<T>(type: string, fields: Record<string, unknown>, withSession = true): Promise<T> {
    const message: Record<string, unknown> = { type, ...fields };
    const token = withSession ? this._session() : null;
    if (!token) return this._ws.callWS<T>(message);
    message.session = token;
    return this._ws.callWS<T>(message).then(
      result => {
        this._onSessionUsed?.(token);
        return result;
      },
      (err: unknown) => {
        if (SESSION_GONE.has(errorCode(err))) this._onSessionEnded?.(token);
        throw err;
      },
    );
  }
}

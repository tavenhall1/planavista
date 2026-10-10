/** Helpers shared by the card's WebSocket subscriptions. */

export type Unsubscribe = () => void | Promise<void>;

/** Unsubscribe without throwing, even when the connection is already gone. */
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

const RETRY_FIRST_MS = 1000;
const RETRY_MAX_MS = 30_000;

/** How long to wait before try `attempt` + 1 after a failed subscribe: 1 s, doubling, at most 30 s. */
export function retryDelayMs(attempt: number): number {
  return Math.min(RETRY_MAX_MS, RETRY_FIRST_MS * 2 ** attempt);
}

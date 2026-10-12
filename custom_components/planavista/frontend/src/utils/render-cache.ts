/**
 * Helpers that keep the card from re-rendering (and recomputing) when nothing
 * it shows has changed.
 */

/**
 * Cache the last call: while every argument is identical (===) to the
 * previous call's, return the previous result without calling `fn`.
 */
export function memoizeOne<A extends unknown[], R>(fn: (...args: A) => R): (...args: A) => R {
  let lastArgs: A | null = null;
  let lastResult!: R;
  return (...args: A): R => {
    if (lastArgs && lastArgs.length === args.length && args.every((arg, i) => arg === lastArgs![i])) {
      return lastResult;
    }
    lastResult = fn(...args);
    lastArgs = args;
    return lastResult;
  };
}

type StatesHolder = { states: Record<string, unknown> } | null | undefined;

/**
 * True when any of `entityIds` has a different state object in `next` than
 * in `prev`. Home Assistant replaces a state object only when that entity
 * changes, so identity is enough. A missing `prev` (first hass) counts as a change.
 */
export function statesChanged(prev: StatesHolder, next: StatesHolder, entityIds: readonly string[]): boolean {
  if (!prev || !next) return prev !== next;
  return entityIds.some(id => prev.states[id] !== next.states[id]);
}

type HomeHolder = { connected?: boolean; config?: { state?: string } } | null | undefined;

/**
 * True when Home Assistant went out of reach or came back, or finished
 * starting. The card shows both (spec 11.6) though no entity changed:
 * Home Assistant's frontend reports them as a new hass with the same states.
 */
export function homeChanged(prev: HomeHolder, next: HomeHolder): boolean {
  return prev?.connected !== next?.connected || prev?.config?.state !== next?.config?.state;
}

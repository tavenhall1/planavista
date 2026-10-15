/**
 * The key that wakes the screensaver presses nothing (0.11.0 review): Enter on
 * a focused button opened New event, Escape asked to discard a draft, a letter
 * was typed into a field, and Space on Show it now opened it again at once.
 *
 * The waking keydown is stopped before the page hears it, and for a moment so
 * are its repeats, its keyup and keypress, and the click a button makes of a
 * key (`detail` 0; a finger's clicks are the press guard's to judge).
 */
export const WAKING_KEY_MS = 800;

type KeyLike = Event & { key?: string; repeat?: boolean; detail?: number };

export function swallowWakingKey(event: KeyLike, page: EventTarget, ms = WAKING_KEY_MS): void {
  event.preventDefault();
  event.stopImmediatePropagation();
  const stop = (e: KeyLike): void => {
    if (e.type === 'click' && e.detail !== 0) return;
    if (e.type === 'keydown' && !e.repeat) return;
    e.preventDefault();
    e.stopImmediatePropagation();
  };
  const types = ['keydown', 'keyup', 'keypress', 'click'];
  const capture = { capture: true };
  for (const type of types) page.addEventListener(type, stop, capture);
  setTimeout(() => {
    for (const type of types) page.removeEventListener(type, stop, capture);
  }, ms);
}

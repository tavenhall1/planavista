/**
 * The key or touch that wakes the screensaver presses nothing (0.11.0 review
 * and re-review): Enter on a focused button opened New event, Escape asked to
 * discard a draft, a letter was typed into a field, Space on Show it now opened
 * it again at once, a key held past a moment checked off a tile, a palm's
 * second finger checked off the chore beneath it, and a long hold's lifting
 * click opened a chore's options.
 *
 * The screensaver goes at the first pointerdown or keydown, so what follows of
 * that burst lands on the page: these keep it from the page until the burst
 * ends (every finger or the key lifted, then a moment), and never longer than
 * `WAKING_MAX_MS`, should a lift go unheard.
 */
export const WAKING_TAIL_MS = 300;
export const WAKING_MAX_MS = 10_000;

type KeyLike = Event & { key?: string; repeat?: boolean; detail?: number };
type PointerLike = Event & { pointerId?: number };

const CAPTURE = { capture: true };

/** Listens on `page` (capture) until `done` is called or the limit passes; returns `done`. */
function burst(page: EventTarget, handlers: Record<string, (e: Event) => void>, longest: number): () => void {
  let ended = false;
  const done = (): void => {
    if (ended) return;
    ended = true;
    clearTimeout(limit);
    for (const [type, handler] of Object.entries(handlers)) page.removeEventListener(type, handler, CAPTURE);
  };
  for (const [type, handler] of Object.entries(handlers)) page.addEventListener(type, handler, CAPTURE);
  const limit = setTimeout(done, longest);
  return done;
}

const stop = (e: Event): void => {
  e.preventDefault();
  e.stopImmediatePropagation();
};

/**
 * The waking keydown and the rest of that key: its repeats while held, its
 * keyup, keypresses, and the click a button makes of it (`detail` 0) until a
 * moment after it lifts. A finger's clicks are the press guard's to judge.
 */
export function swallowWakingKey(event: KeyLike, page: EventTarget, tail = WAKING_TAIL_MS, longest = WAKING_MAX_MS): void {
  stop(event);
  let lifted = false;
  const done = burst(page, {
    keydown: (e: KeyLike) => {
      if (!lifted && (e.repeat || e.key === event.key)) stop(e);
    },
    keypress: (e: KeyLike) => {
      if (!lifted) stop(e);
    },
    keyup: (e: KeyLike) => {
      if (e.key !== event.key) return;
      stop(e);
      if (lifted) return;
      lifted = true;
      setTimeout(() => done(), tail);
    },
    click: (e: KeyLike) => {
      if (e.detail === 0) stop(e);
    },
  } as Record<string, (e: Event) => void>, longest);
}

/**
 * The waking touch: every other pointerdown (a palm, a second finger) and
 * every click, until each finger that came down has lifted and a moment has
 * passed. Lifts aren't stopped; with their pointerdowns kept away they press nothing.
 */
export function swallowWakingPress(event: PointerLike, page: EventTarget, tail = WAKING_TAIL_MS, longest = WAKING_MAX_MS): void {
  const down = new Set<number>([event.pointerId ?? 0]);
  let after: ReturnType<typeof setTimeout> | undefined;
  const lifted = (e: PointerLike): void => {
    down.delete(e.pointerId ?? 0);
    if (down.size) return;
    clearTimeout(after);
    after = setTimeout(() => done(), tail);
  };
  const done = burst(page, {
    pointerdown: (e: PointerLike) => {
      down.add(e.pointerId ?? 0);
      clearTimeout(after);
      stop(e);
    },
    touchstart: (e: Event) => e.stopImmediatePropagation(),
    pointerup: lifted,
    pointercancel: lifted,
    click: stop,
    contextmenu: stop,
  } as Record<string, (e: Event) => void>, longest);
}

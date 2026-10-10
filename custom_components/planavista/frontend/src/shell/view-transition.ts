import type { TransitionKind } from '../core/appearance';
import type { TapPoint } from '../core/appearance-edits';
import { SMOOTH, springEasing } from '../core/motion';
import { setTransitionStyles, transitionCss } from './page-styles';

/** About two seconds for night to fall or day to rise; a quick fade with reduced motion (spec 12.4). */
const SWEEP_MS = 2000;
const SWEEP_EASING = 'cubic-bezier(.45,0,.25,1)';
const FADE_MS = 250;

interface ViewTransitionLike {
  ready: Promise<void>;
  finished: Promise<void>;
}
type StartViewTransition = (update: () => Promise<void>) => ViewTransitionLike;

interface Change {
  element: HTMLElement;
  apply: () => Promise<void>;
  point?: TapPoint;
}

let waiting: { kind: TransitionKind; changes: Change[] } | null = null;
let running = false;

/**
 * The page itself takes part, not each card: Home Assistant draws every card
 * inside shadow roots, and a view-transition-name there is never captured
 * (names are tree-scoped). Only the cards change, so only they visibly sweep.
 */
const PAGE = 'root';

/** The browser has View Transitions (Chrome and Edge 111, Safari 18). */
export function viewTransitionsSupported(doc: Document = document): boolean {
  return typeof (doc as unknown as { startViewTransition?: unknown }).startViewTransition === 'function';
}

/** The reveal's circle: centred on the finger, big enough to reach the screen's farthest corner. */
export function revealCircle(point: TapPoint, width: number, height: number): { x: number; y: number; radius: number } {
  return { x: point.x, y: point.y, radius: Math.hypot(Math.max(point.x, width - point.x), Math.max(point.y, height - point.y)) };
}

/**
 * Change a card between light and dark (spec 12.4): `apply` draws the new
 * mode. Cards that change at the same moment (every card on a dashboard at
 * sunset) share one transition; a change that arrives while one runs just
 * switches. Without View Transitions, or for kind 'none', it just switches.
 */
export function runAppearanceChange(
  kind: TransitionKind,
  element: HTMLElement,
  apply: () => Promise<void>,
  point?: TapPoint,
): Promise<void> {
  if (kind === 'none' || running || !viewTransitionsSupported()) return apply();
  return new Promise<void>((resolve, reject) => {
    const change: Change = { element, apply: () => apply().then(resolve, reject), point };
    if (waiting && waiting.kind === kind) {
      waiting.changes.push(change);
    } else if (waiting) {
      void change.apply();
    } else {
      waiting = { kind, changes: [change] };
      // After this task, so every card that changes now joins in.
      setTimeout(() => void start(), 0);
    }
  });
}

async function start(): Promise<void> {
  const batch = waiting;
  waiting = null;
  if (!batch) return;
  running = true;
  const root = document.documentElement;
  setTransitionStyles(transitionCss([PAGE], batch.kind));
  root.dataset.pvVt = batch.kind;
  const applyAll = () => Promise.all(batch.changes.map(change => change.apply())).then(() => undefined);
  try {
    const startTransition = (document as unknown as { startViewTransition: StartViewTransition }).startViewTransition.bind(document);
    let transition: ViewTransitionLike;
    try {
      transition = startTransition(applyAll);
    } catch {
      await applyAll();
      return;
    }
    try {
      await transition.ready;
      animate(batch.kind, batch.changes);
    } catch {
      // The browser skipped the animation; the change itself still happened.
    }
    await transition.finished.catch(() => undefined);
  } finally {
    delete root.dataset.pvVt;
    setTransitionStyles('');
    running = false;
  }
}

function animate(kind: TransitionKind, changes: Change[]): void {
  const root = document.documentElement;
  const oldImage = `::view-transition-old(${PAGE})`;
  const newImage = `::view-transition-new(${PAGE})`;
  if (kind === 'dusk' || kind === 'dawn') {
    // Night falls from the top; day rises from the bottom.
    const [from, to] = kind === 'dusk' ? ['0% 100%', '0% 0%'] : ['0% 0%', '0% 100%'];
    root.animate(
      { maskPosition: [from, to], webkitMaskPosition: [from, to] },
      { duration: SWEEP_MS, easing: SWEEP_EASING, fill: 'both', pseudoElement: oldImage },
    );
  } else if (kind === 'reveal') {
    // The new look spreads out from the finger, or from the card's middle.
    const tapped = changes.find(change => change.point) ?? changes[0];
    const rect = tapped.element.getBoundingClientRect();
    const point = tapped.point ?? { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    const circle = revealCircle(point, window.innerWidth, window.innerHeight);
    const spring = springEasing(SMOOTH);
    root.animate(
      { clipPath: [`circle(0px at ${circle.x}px ${circle.y}px)`, `circle(${circle.radius}px at ${circle.x}px ${circle.y}px)`] },
      { duration: spring.duration, easing: spring.easing, fill: 'both', pseudoElement: newImage },
    );
  } else {
    root.animate({ opacity: [1, 0] }, { duration: FADE_MS, easing: 'ease', fill: 'both', pseudoElement: oldImage });
    root.animate({ opacity: [0, 1] }, { duration: FADE_MS, easing: 'ease', fill: 'both', pseudoElement: newImage });
  }
}

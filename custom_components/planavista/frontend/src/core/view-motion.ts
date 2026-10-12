import { Motion, SMOOTH, springEasing } from './motion';

/**
 * How a screen's content moves when it changes (spec 11.5: view changes use
 * the same springs as everything else): another view glides in, a step to a
 * later or an earlier day, week, or month slides in from that side, and the
 * first draw doesn't move at all.
 */
export type ViewChange = 'none' | 'switch' | 'forward' | 'back';

export interface ViewPlace {
  /** Which view shows (Day, Week, Board...). */
  view: string;
  /** Where in time it shows, as a number that grows forward (a day's start, in ms); 0 when it has none. */
  at: number;
}

export function viewChange(prev: ViewPlace | null, next: ViewPlace): ViewChange {
  if (!prev) return 'none';
  if (prev.view !== next.view) return 'switch';
  if (next.at > prev.at) return 'forward';
  if (next.at < prev.at) return 'back';
  return 'none';
}

export interface ViewMotion {
  keyframes: Keyframe[];
  options: KeyframeAnimationOptions;
}

const SLIDE_PX = 32;
const RISE_PX = 12;
const FADE_MS = 150;

/**
 * The entrance for a change: the smooth spring at full motion, a quick fade
 * with reduced motion, which keeps the meaning (something new is here)
 * without the movement. Only transform and opacity move, so older wall
 * tablets keep up.
 */
export function viewMotion(change: ViewChange, motion: Motion, linear: boolean): ViewMotion | null {
  if (change === 'none') return null;
  if (motion === 'reduced') {
    return { keyframes: [{ opacity: 0.4 }, { opacity: 1 }], options: { duration: FADE_MS, easing: 'ease-out' } };
  }
  const spring = springEasing(SMOOTH, linear);
  const from = change === 'switch'
    ? `translateY(${RISE_PX}px)`
    : `translateX(${change === 'forward' ? SLIDE_PX : -SLIDE_PX}px)`;
  return {
    keyframes: [{ opacity: 0, transform: from }, { opacity: 1, transform: 'none' }],
    options: { duration: spring.duration, easing: spring.easing },
  };
}

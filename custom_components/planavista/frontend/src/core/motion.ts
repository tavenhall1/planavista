/** Motion is part of the product (spec 11.5): springs, not timers. */

export interface Spring {
  /** CSS linear() easing, for element.animate() or a transition. */
  easing: string;
  /** Milliseconds until the spring settles within 0.1 percent. */
  duration: number;
}

/**
 * A damped spring sampled into CSS linear() easing, with SwiftUI's
 * parameters: `response` is the period in seconds and `damping` the damping
 * ratio (below 1 it overshoots). The curve ends exactly at 1.
 */
export function spring(response: number, damping: number, samples = 50): Spring {
  const z = Math.min(0.999, Math.max(0.05, damping));
  const w = (2 * Math.PI) / response;
  const wd = w * Math.sqrt(1 - z * z);
  const settle = Math.log(1000) / (z * w);
  const points: string[] = [];
  for (let i = 0; i < samples; i++) {
    const t = (settle * i) / samples;
    const value = 1 - Math.exp(-z * w * t) * (Math.cos(wd * t) + ((z * w) / wd) * Math.sin(wd * t));
    points.push(value.toFixed(4));
  }
  points.push('1');
  return { easing: `linear(${points.join(', ')})`, duration: Math.round(settle * 1000) };
}

/** Glides (sheets, rows moving to Done). */
export const SMOOTH = spring(0.5, 0.86);
/** Pops (a check, a badge). */
export const BOUNCY = spring(0.45, 0.55);
/** Large moves (a ring filling). */
export const GENTLE = spring(0.6, 0.9);

/** For browsers without linear(): the same length on a smooth curve. */
const FALLBACK_EASING = 'cubic-bezier(0.2, 0.8, 0.2, 1)';

/** Whether this browser draws CSS linear() easing. */
export function supportsLinearEasing(): boolean {
  return typeof CSS !== 'undefined' && typeof CSS.supports === 'function' && CSS.supports('animation-timing-function', 'linear(0, 1)');
}

/** A spring this browser can draw. */
export function springEasing(s: Spring, linear = supportsLinearEasing()): Spring {
  return linear ? s : { easing: FALLBACK_EASING, duration: s.duration };
}

/**
 * How a ring fills, which the card paints for every ring inside it with the
 * Motion setting (--pv-ring-ms, --pv-ring-ease), so no ring reads the setting
 * itself: on the kitchen screen (a Pi 4) each ring's read came after the last
 * ring's write and forced a style recalc, about 300 ms whenever the board drew.
 */
export function ringTokens(motion: Motion, linear = supportsLinearEasing()): Record<'--pv-ring-ms' | '--pv-ring-ease', string> {
  if (motion === 'reduced') return { '--pv-ring-ms': '180ms', '--pv-ring-ease': 'linear' };
  const fill = springEasing(GENTLE, linear);
  return { '--pv-ring-ms': `${fill.duration}ms`, '--pv-ring-ease': fill.easing };
}

export type MotionSetting = 'device' | 'full' | 'reduced';
export type Motion = 'full' | 'reduced';

/**
 * Full or reduced motion: PlanaVista's Motion setting, or the device's when
 * it says Follow the device (spec 11.5; kiosk tablets often hide theirs).
 */
export function resolveMotion(setting: MotionSetting | undefined, deviceReduced: boolean): Motion {
  if (setting === 'full' || setting === 'reduced') return setting;
  return deviceReduced ? 'reduced' : 'full';
}

/**
 * Full or reduced motion where an element is drawn. The card sets
 * --pv-motion (spec 11.5), and custom properties reach into every shadow
 * root, so a sheet inside a Settings page reads it too.
 */
export function motionOf(element: Element): Motion {
  const value = getComputedStyle(element).getPropertyValue('--pv-motion').trim();
  if (value === 'reduced' || value === 'full') return value;
  return typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches ? 'reduced' : 'full';
}

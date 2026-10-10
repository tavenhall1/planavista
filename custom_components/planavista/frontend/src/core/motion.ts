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

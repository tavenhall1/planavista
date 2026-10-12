/**
 * A sheet stays on screen while it leaves (DESIGN_SYSTEM 2.4: a sheet leaves
 * before it reports why it closed). A module keeps one Presence per sheet
 * and steps it whenever the state that wants the sheet changes, so a sheet
 * the state lets go of (an event saved, a delete done) still plays its exit.
 */
export interface Presence<T> {
  /** What the sheet shows; null while it isn't mounted. */
  value: T | null;
  /** True once nothing wants it any more: it is playing its exit. */
  leaving: boolean;
}

/** No sheet. */
export const GONE: Presence<never> = Object.freeze({ value: null, leaving: false });

/** The next presence, given what should show now (null for nothing). */
export function nextPresence<T>(prev: Presence<T>, wanted: T | null): Presence<T> {
  if (wanted !== null) return prev.value === wanted && !prev.leaving ? prev : { value: wanted, leaving: false };
  if (prev.value === null || prev.leaving) return prev;
  return { value: prev.value, leaving: true };
}

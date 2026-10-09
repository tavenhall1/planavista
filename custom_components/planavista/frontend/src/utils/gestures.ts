/** Minimum horizontal travel, in px, for a swipe to change the date. */
export const SWIPE_MIN_PX = 50;

/**
 * Classify a finished one-finger gesture by how far it moved. A swipe must
 * travel more than 50 px sideways and more than twice as far sideways as up
 * or down, so diagonal scrolls don't change the date. Moving the finger right
 * goes to the previous period, left to the next.
 */
export function swipeDirection(dx: number, dy: number): 'prev' | 'next' | null {
  if (Math.abs(dx) <= SWIPE_MIN_PX) return null;
  if (Math.abs(dx) <= 2 * Math.abs(dy)) return null;
  return dx > 0 ? 'prev' : 'next';
}

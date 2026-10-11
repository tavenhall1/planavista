/** Dragging a sheet down to close it (spec 12.3), as in the approved motion prototype. */

export const DISMISS_PX = 90;
/** Pixels per millisecond: a flick closes even a short drag. */
export const DISMISS_SPEED = 0.6;

/** How far the panel follows the finger: down only. */
export function sheetDragOffset(dy: number): number {
  return Math.max(0, dy);
}

/** On release: close when dragged far enough or flicked, otherwise settle back. */
export function sheetDragOutcome(dy: number, ms: number): 'close' | 'settle' {
  const distance = sheetDragOffset(dy);
  return distance > DISMISS_PX || distance / Math.max(1, ms) > DISMISS_SPEED ? 'close' : 'settle';
}

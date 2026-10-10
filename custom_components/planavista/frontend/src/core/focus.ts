/** What Tab can reach inside a dialog. */
export const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** The element to focus next when Tab (or Shift+Tab) runs past either end. */
export function wrapFocusIndex(current: number, count: number, backwards: boolean): number {
  if (count === 0) return -1;
  if (current < 0) return backwards ? count - 1 : 0;
  return backwards ? (current - 1 + count) % count : (current + 1) % count;
}

/** Keep Tab inside a dialog rendered in `root` (spec 11.8). */
export function trapTab(root: ShadowRoot, event: KeyboardEvent): void {
  if (event.key !== 'Tab') return;
  const items = [...root.querySelectorAll<HTMLElement>(FOCUSABLE)];
  const index = items.indexOf(root.activeElement as HTMLElement);
  const next = wrapFocusIndex(index, items.length, event.shiftKey);
  if (next >= 0) {
    event.preventDefault();
    items[next].focus();
  }
}

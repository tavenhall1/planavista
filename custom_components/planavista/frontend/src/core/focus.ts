/** What Tab can reach inside a dialog. */
export const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** The element to focus next when Tab (or Shift+Tab) runs past either end. */
export function wrapFocusIndex(current: number, count: number, backwards: boolean): number {
  if (count === 0) return -1;
  if (current < 0) return backwards ? count - 1 : 0;
  return backwards ? (current - 1 + count) % count : (current + 1) % count;
}

/** Where focus is kept: the document, or a shadow root. */
interface FocusHolder {
  activeElement: Element | null;
}

/** The element with focus, looking inside shadow roots (the card's controls live in several). */
export function deepActiveElement(root: FocusHolder = document): HTMLElement | null {
  let active: Element | null = root.activeElement;
  while (active?.shadowRoot?.activeElement) active = active.shadowRoot.activeElement;
  return active && typeof (active as HTMLElement).focus === 'function' ? (active as HTMLElement) : null;
}

/** The controls Tab can land on: shown ones only (round 14: a hidden Done took the press, and Tab went nowhere). */
export function tabbable(items: HTMLElement[]): HTMLElement[] {
  return items.filter(el => el.getClientRects().length > 0);
}

/** Keep Tab inside a dialog rendered in `root` (spec 11.8). */
export function trapTab(root: ShadowRoot, event: KeyboardEvent): void {
  if (event.key !== 'Tab') return;
  const items = tabbable([...root.querySelectorAll<HTMLElement>(FOCUSABLE)]);
  const index = items.indexOf(root.activeElement as HTMLElement);
  const next = wrapFocusIndex(index, items.length, event.shiftKey);
  if (next >= 0) {
    event.preventDefault();
    items[next].focus();
  }
}

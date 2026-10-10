/** The card's layout comes from its own size, not the device (spec 12.1). */
export type Layout = 'phone' | 'portrait' | 'landscape';

export interface Box {
  width: number;
  height: number;
}

export const PHONE_MAX_WIDTH = 600;
const SQUARE_LOW = 0.95;
const SQUARE_HIGH = 1.05;

/**
 * Phone below 600 px wide; otherwise portrait or landscape by shape. A
 * nearly square card (aspect 0.95 to 1.05) keeps its previous portrait or
 * landscape, landscape at first, so split screens don't flip. While a text
 * field has focus, a height-only shrink is the on-screen keyboard, and the
 * layout stays as it was.
 */
export function classifyLayout(
  box: Box,
  previous: Layout | null,
  previousBox: Box | null,
  textFocused: boolean,
): Layout {
  if (
    previous &&
    previousBox &&
    textFocused &&
    box.width === previousBox.width &&
    box.height < previousBox.height
  ) {
    return previous;
  }
  if (box.width < PHONE_MAX_WIDTH) return 'phone';
  const ratio = box.height > 0 ? box.width / box.height : Number.POSITIVE_INFINITY;
  if (ratio >= SQUARE_LOW && ratio <= SQUARE_HIGH) {
    return previous === 'portrait' || previous === 'landscape' ? previous : 'landscape';
  }
  return ratio > 1 ? 'landscape' : 'portrait';
}

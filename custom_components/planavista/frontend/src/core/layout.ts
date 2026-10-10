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
 * field has focus, a height-only change below the card's box from before
 * the field took focus is the on-screen keyboard, and the layout stays.
 */
export function classifyLayout(
  box: Box,
  previous: Layout | null,
  beforeKeyboard: Box | null,
  textFocused: boolean,
): Layout {
  if (
    previous &&
    beforeKeyboard &&
    textFocused &&
    box.width === beforeKeyboard.width &&
    box.height < beforeKeyboard.height
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

/**
 * The card's layout, measurement by measurement (spec 12.1). It keeps the
 * card's box from just before a text field took focus, so a keyboard that
 * opens, changes height (suggestions, emoji), or closes while a field has
 * focus never flips the layout. Moving between fields keeps the same box.
 */
export class LayoutTracker {
  layout: Layout | null = null;
  private _box: Box | null = null;
  private _beforeKeyboard: Box | null = null;
  private _textFocused = false;

  /** Focus moved to a control; `textField` when it brings up a keyboard (or a picker). */
  focus(textField: boolean): void {
    this._textFocused = textField;
    if (textField && !this._beforeKeyboard) this._beforeKeyboard = this._box;
  }

  blur(): void {
    this._textFocused = false;
  }

  measure(box: Box): Layout {
    const before = this._beforeKeyboard;
    this.layout = classifyLayout(box, this.layout, before, this._textFocused);
    // Forget that box once the keyboard is gone, or when the card really changed size.
    if (before && (box.width !== before.width || (!this._textFocused && box.height >= before.height))) {
      this._beforeKeyboard = null;
    }
    this._box = box;
    return this.layout;
  }
}

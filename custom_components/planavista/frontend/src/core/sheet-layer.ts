import type { ReactiveController, ReactiveControllerHost } from 'lit';

/**
 * Sheets stack in the order they open. Every sheet sits in the card's one
 * stacking context, and on one shared z-index the browser paints them by the
 * flex order of what holds them, so the module's sheets (order 3) covered the
 * card's own keypad (order 0): a PIN asked for from a chore's options opened
 * behind them (1.6.2). Each sheet now takes the next layer when it opens.
 */
let top = 100;

/*
 * Toasts take the next layer too, when each appears (pv-toast): above the
 * sheet it is about (a refusal, an Undo), under whatever opens after it. Round
 * 1 put them above every sheet, so a check-off's Undo stayed live over the
 * keypad the next hold opened and over Settings (round 2).
 */

/** An open menu (the phone bar's views) sits above everything else. */
export const MENU_LAYER = 2_000_000_100;

/** The layer above every sheet opened so far. */
export function nextSheetLayer(): number {
  top += 1;
  return top;
}

/*
 * The keypad and the notice ask the screen something first (round 3, r3a A3):
 * two children at once, a toast that came while one hold's keypad was open
 * went above it, and its "Someone else did it?" opened behind the keypad. Each
 * keeps the layer just under its own, and a toast that shows while one is open
 * takes that layer: above the sheet it's about, under the question.
 */
const asking = new Set<number>();

/** The layer for a toast showing now: the next one, or just under the lowest open question. */
export function toastLayer(): number {
  return asking.size ? Math.min(...asking) - 1 : nextSheetLayer();
}

type LayerHost = ReactiveControllerHost & { style: { zIndex: string } };

/** Puts its sheet on the next layer each time it is connected (opened); `asks` for the keypad and the notice. */
export class SheetLayer implements ReactiveController {
  private _z = 0;

  constructor(private readonly host: LayerHost, private readonly asks = false) {
    host.addController(this);
  }

  hostConnected(): void {
    if (this.asks) nextSheetLayer(); // the layer under it, for toasts
    this._z = nextSheetLayer();
    this.host.style.zIndex = String(this._z);
    if (this.asks) asking.add(this._z);
  }

  hostDisconnected(): void {
    asking.delete(this._z);
  }
}

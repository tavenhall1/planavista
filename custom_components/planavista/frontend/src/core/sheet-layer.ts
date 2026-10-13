import type { ReactiveController, ReactiveControllerHost } from 'lit';

/**
 * Sheets stack in the order they open. Every sheet sits in the card's one
 * stacking context, and on one shared z-index the browser paints them by the
 * flex order of what holds them, so the module's sheets (order 3) covered the
 * card's own keypad (order 0): a PIN asked for from a chore's options opened
 * behind them (1.6.2). Each sheet now takes the next layer when it opens.
 */
let top = 100;

/**
 * Toasts sit above every sheet: they say what just happened, often about the
 * sheet below (a refusal, an Undo). Round 1 of the adversarial review: at
 * z-index 40 they hid under every sheet.
 */
export const TOAST_LAYER = 2_000_000_000;

/** An open menu (the phone bar's views) sits above a toast that would otherwise cover it. */
export const MENU_LAYER = 2_000_000_100;

/** The layer above every sheet opened so far. */
export function nextSheetLayer(): number {
  top += 1;
  return top;
}

type LayerHost = ReactiveControllerHost & { style: { zIndex: string } };

/** Puts its sheet on the next layer each time it is connected (opened). */
export class SheetLayer implements ReactiveController {
  constructor(private readonly host: LayerHost) {
    host.addController(this);
  }

  hostConnected(): void {
    this.host.style.zIndex = String(nextSheetLayer());
  }
}

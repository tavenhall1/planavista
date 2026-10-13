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

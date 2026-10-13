import type { ReactiveController, ReactiveControllerHost } from 'lit';

/**
 * Sheets stack in the order they open. Every sheet sits in the card's one
 * stacking context, and on one shared z-index the browser paints them by the
 * flex order of what holds them, so the module's sheets (order 3) covered the
 * card's own keypad (order 0): a PIN asked for from a chore's options opened
 * behind them (1.6.2). Each sheet now takes the next layer when it opens.
 */
let top = 100;

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

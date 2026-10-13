/**
 * A sheet's backdrop closes it on a tap that began on the backdrop. A hold
 * that finishes while the finger is still down can open a sheet under that
 * finger, and Safari sends the touch's click to whatever is under it when it
 * lifts: on an iPad in landscape, the backdrop around the centered card. That
 * click didn't start on the backdrop, so it doesn't close the sheet.
 */
export interface BackdropTap {
  /** Bind to the backdrop's pointerdown. */
  down: (event: { target: unknown; currentTarget: unknown }) => void;
  /** Bind to the backdrop's click. */
  click: () => void;
}

export function backdropTap(close: () => void): BackdropTap {
  let pressed = false;
  return {
    down: event => {
      pressed = event.target === event.currentTarget;
    },
    click: () => {
      const closes = pressed;
      pressed = false;
      if (closes) close();
    },
  };
}

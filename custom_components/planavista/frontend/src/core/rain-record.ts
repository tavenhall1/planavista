/**
 * When it last rained here, for the screensaver's rainbow afterwards (0.12.0).
 * The page notes rain whenever it's open, not only while the screensaver
 * shows (review m12a M2), and keeps it in localStorage so a reload remembers.
 */

/** The Home Assistant conditions that count as rain for the rainbow afterwards. */
export const RAIN_CONDITIONS: ReadonlySet<string> = new Set(['rainy', 'pouring', 'lightning-rainy', 'snowy-rainy', 'hail']);

export const RAIN_KEY = 'planavista.rainAt';
/** The page looks at the weather this often; the rainbow's 20 minutes don't need finer. */
export const RAIN_LOOK_MS = 60_000;

let lookedAt = 0;

export function rainAt(): number {
  try {
    return Number(localStorage.getItem(RAIN_KEY)) || 0;
  } catch {
    return 0;
  }
}

export function noteRain(at: number): void {
  try {
    localStorage.setItem(RAIN_KEY, String(at));
  } catch {
    // A private window keeps no storage: the rainbow just doesn't come after a reload.
  }
}

/** The page's look at the weather, at most once a minute: rain now is noted. */
export function lookForRain(condition: string | undefined, now: number): void {
  if (now - lookedAt < RAIN_LOOK_MS) return;
  lookedAt = now;
  if (condition && RAIN_CONDITIONS.has(condition)) noteRain(now);
}

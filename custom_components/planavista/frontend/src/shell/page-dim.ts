import { mediaBrightness } from '../core/dimming';

/**
 * Home Assistant's own top bar and sidebar on a dimmed shared screen (review
 * m12 I). PlanaVista draws its own colors at the level; Home Assistant's bars
 * aren't ours to recolor, so they take a brightness filter, set once on the
 * page (`--pv-ha-dim`) and read by a small sheet in each of their shadow
 * roots. Kiosk mode's Hidden hides them anyway.
 */
export const HA_DIM_CSS = {
  header: '.header { filter: var(--pv-ha-dim, none); }',
  sidebar: 'ha-sidebar { filter: var(--pv-ha-dim, none); }',
};

/** Each connected card's level; the page follows the darkest. */
const levels = new Map<object, number>();
let shown: string | null = null;
const added = new WeakSet<ShadowRoot>();

/** A card's level (`null` when it leaves the page). */
export function setPageDim(owner: object, level: number | null): void {
  if (level === null) levels.delete(owner);
  else levels.set(owner, level);
  const darkest = Math.min(1, ...levels.values());
  const filter = darkest < 1 ? `brightness(${mediaBrightness(darkest).toFixed(3)})` : null;
  if (filter) addSheets();
  if (filter === shown) return;
  shown = filter;
  const style = typeof document === 'undefined' ? undefined : document.documentElement?.style;
  if (!style) return;
  if (filter) style.setProperty('--pv-ha-dim', filter);
  else style.removeProperty('--pv-ha-dim');
}

/** Home Assistant 2026.10's own path to its bars; a root it rebuilds gets a new sheet. */
function addSheets(): void {
  if (typeof document === 'undefined' || typeof CSSStyleSheet === 'undefined') return;
  const main = document.querySelector('home-assistant')?.shadowRoot?.querySelector('home-assistant-main')?.shadowRoot;
  const root = main?.querySelector('ha-panel-lovelace')?.shadowRoot?.querySelector('hui-root')?.shadowRoot;
  for (const [shadow, css] of [[main, HA_DIM_CSS.sidebar], [root, HA_DIM_CSS.header]] as const) {
    if (!shadow || added.has(shadow)) continue;
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(css);
    shadow.adoptedStyleSheets = [...shadow.adoptedStyleSheets, sheet];
    added.add(shadow);
  }
}

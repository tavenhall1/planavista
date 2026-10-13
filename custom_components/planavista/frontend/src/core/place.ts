/**
 * Coming back where you were (milestone 8, spec 3.7). Each card on each
 * device remembers its module and each module's view in localStorage
 * (`planavista.place`, one entry per dashboard path and card config). A card
 * that comes back within an hour of last being on screen (a Home Assistant
 * restart or update, a reconnect, a reload) opens there; after that it opens
 * on its configured start. Dates are never remembered: it comes back on today.
 */
export const PLACE_STORAGE = 'planavista.place';
export const PLACE_MS = 60 * 60_000;

export interface Place {
  module: string;
  /** Each module's view, by module id. */
  views: Record<string, string>;
  /** When the card was last on screen (ms). */
  at: number;
}

/** A card's key: where it is, and how it is set up (two cards on one dashboard keep their own). */
export function placeKey(path: string, config: Record<string, unknown>): string {
  return `${path}|${stable(config)}`;
}

function stable(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stable).join(',')}]`;
  if (value && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b));
    return `{${entries.map(([k, v]) => `${JSON.stringify(k)}:${stable(v)}`).join(',')}}`;
  }
  return JSON.stringify(value) ?? 'null';
}

function entriesOf(raw: string | null): Record<string, unknown> {
  if (!raw) return {};
  try {
    const parsed: unknown = JSON.parse(raw);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? (parsed as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

function asPlace(value: unknown): Place | null {
  if (!value || typeof value !== 'object') return null;
  const { module, views, at } = value as Partial<Place>;
  if (typeof module !== 'string' || typeof at !== 'number' || !views || typeof views !== 'object') return null;
  const clean = Object.fromEntries(Object.entries(views).filter(([, v]) => typeof v === 'string')) as Record<string, string>;
  return { module, views: clean, at };
}

/** This card's place, if it was on screen less than an hour ago. */
export function readPlace(raw: string | null, key: string, now: number): Place | null {
  const place = asPlace(entriesOf(raw)[key]);
  return place && now - place.at < PLACE_MS ? place : null;
}

/** The storage with this card's place set (as of `now`) and places older than an hour gone. */
export function writePlace(raw: string | null, key: string, place: Omit<Place, 'at'>, now: number): string {
  const kept: Record<string, Place> = {};
  for (const [k, v] of Object.entries(entriesOf(raw))) {
    const p = asPlace(v);
    if (p && now - p.at < PLACE_MS) kept[k] = p;
  }
  kept[key] = { module: place.module, views: { ...place.views }, at: now };
  return JSON.stringify(kept);
}

/** The part of a place this card can still use: a module it shows, and views that module has. */
export function usablePlace(
  place: Place | null,
  modules: ReadonlyArray<{ id: string; views: ReadonlyArray<{ id: string }> }>,
): { module: string; views: Record<string, string> } | null {
  if (!place || !modules.some(m => m.id === place.module)) return null;
  const views: Record<string, string> = {};
  for (const mod of modules) {
    const view = place.views[mod.id];
    if (view && mod.views.some(v => v.id === view)) views[mod.id] = view;
  }
  return { module: place.module, views };
}

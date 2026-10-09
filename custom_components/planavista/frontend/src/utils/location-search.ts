/**
 * Opt-in address suggestions for the event dialog (display setting
 * `location_autocomplete`, off by default).
 *
 * When on, the text typed into the Location field, and nothing else, is sent
 * to Photon (photon.komoot.io), an OpenStreetMap geocoder built for
 * search-as-you-type: at most once per 350 ms pause, only for 3+ characters,
 * without cookies or a Referer. Only the newest response is applied.
 */

export const PHOTON_API = 'https://photon.komoot.io/api/';
export const LOCATION_DEBOUNCE_MS = 350;
export const LOCATION_MIN_CHARS = 3;
const MAX_SUGGESTIONS = 5;

/** The Photon feature properties PlanaVista shows. */
export interface PhotonProperties {
  name?: string;
  housenumber?: string;
  street?: string;
  city?: string;
  state?: string;
  postcode?: string;
  country?: string;
}

/** Photon search URL for the typed text. */
export function buildPhotonUrl(text: string): string {
  return `${PHOTON_API}?q=${encodeURIComponent(text)}&limit=${MAX_SUGGESTIONS}&lang=en`;
}

/**
 * One-line address: name, house number + street, city, state, postcode,
 * country. Empty parts are skipped, and so are repeats (a city result's name
 * is usually also its city).
 */
export function formatPhotonFeature(p: PhotonProperties): string {
  const streetLine = [p.housenumber, p.street].filter(Boolean).join(' ');
  const parts: string[] = [];
  for (const part of [p.name, streetLine, p.city, p.state, p.postcode, p.country]) {
    const text = (part || '').trim();
    if (text && !parts.some(existing => existing.toLowerCase() === text.toLowerCase())) parts.push(text);
  }
  return parts.join(', ');
}

/** Unique display strings from a Photon GeoJSON response (at most five). */
export function parsePhotonResponse(body: unknown): string[] {
  const features = (body as { features?: unknown } | null)?.features;
  if (!Array.isArray(features)) return [];
  const out: string[] = [];
  for (const feature of features) {
    const label = formatPhotonFeature((feature as { properties?: PhotonProperties })?.properties || {});
    if (label && !out.includes(label)) out.push(label);
    if (out.length === MAX_SUGGESTIONS) break;
  }
  return out;
}

export interface LocationSearchOptions {
  onResults: (suggestions: string[]) => void;
  onLoading: (loading: boolean) => void;
  /** Injected in tests; defaults to window.fetch. */
  fetchFn?: typeof fetch;
}

/** Debounced, newest-wins Photon lookup for one input field. */
export class LocationSearch {
  private _timer: ReturnType<typeof setTimeout> | null = null;
  private _abort: AbortController | null = null;
  /** Bumped by every input/cancel; a response for an older value is dropped. */
  private _seq = 0;
  private readonly _fetch: typeof fetch;

  constructor(private readonly _opts: LocationSearchOptions) {
    this._fetch = _opts.fetchFn ?? ((input, init) => fetch(input, init));
  }

  /** Call on every change to the field. With `enabled` false nothing is ever sent. */
  input(text: string, enabled: boolean): void {
    this.cancel();
    const query = text.trim();
    if (!enabled || query.length < LOCATION_MIN_CHARS) {
      this._opts.onResults([]);
      this._opts.onLoading(false);
      return;
    }
    this._opts.onLoading(true);
    const seq = this._seq;
    this._timer = setTimeout(() => {
      this._timer = null;
      void this._run(query, seq);
    }, LOCATION_DEBOUNCE_MS);
  }

  /** Drop any pending or in-flight search (dialog closed, suggestion picked). */
  cancel(): void {
    this._seq++;
    if (this._timer) {
      clearTimeout(this._timer);
      this._timer = null;
    }
    if (this._abort) {
      this._abort.abort();
      this._abort = null;
    }
  }

  private async _run(query: string, seq: number): Promise<void> {
    const controller = new AbortController();
    this._abort = controller;
    try {
      const resp = await this._fetch(buildPhotonUrl(query), {
        signal: controller.signal,
        credentials: 'omit',
        referrerPolicy: 'no-referrer',
      });
      if (!resp.ok) throw new Error(`Photon HTTP ${resp.status}`);
      const body = await resp.json();
      if (seq === this._seq) this._opts.onResults(parsePhotonResponse(body));
    } catch {
      if (seq === this._seq) this._opts.onResults([]);
    } finally {
      if (seq === this._seq) {
        this._abort = null;
        this._opts.onLoading(false);
      }
    }
  }
}

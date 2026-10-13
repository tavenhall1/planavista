/**
 * Kiosk mode on every Home Assistant page (milestone 9, spec 3.2).
 *
 * PlanaVista's script loads on every page, so kiosk mode is applied here,
 * not by the card: tied to the card it would lift whenever another tab or
 * panel showed. On a shared screen with the household's switch on, it turns
 * on Home Assistant's own kiosk switch (the sidebar and its menu button go)
 * and adds a style to the dashboard's root that hides the header, or all of
 * it but the tabs. A parent who may step out lifts it by parent mode's own
 * clock, counted anywhere on the page (D4).
 */
import type { HouseholdView } from '../core/household';
import { HouseholdConnection, HouseholdSubscription } from '../core/household-client';
import { KIOSK_SHEETS, KioskLook, StepOut, kioskLook, startStepOut, stepOutOver, stepOutTouched } from '../core/kiosk';

/** What the controller needs from the page; the tests fake it. */
export interface KioskEnv {
  /** The dashboard root's shadow root now, or null on a page without a dashboard. */
  root(): object | null;
  /** Adds a style to a root; the handle changes its text or takes it away. */
  addSheet(root: object, css: string): { set(css: string): void; remove(): void };
  /** Home Assistant's own kiosk switch (the sidebar and its menu button). */
  setHaKiosk(enable: boolean): void;
  haKiosk(): boolean;
}

export class KioskController {
  private _view: HouseholdView | null = null;
  private _stepOut: StepOut | null = null;
  private _applied: { root: object; handle: { set(css: string): void; remove(): void }; css: string } | null = null;
  /** We turned Home Assistant's switch on, so we may turn it off; someone else's we leave alone. */
  private _haOn = false;
  private _last: { look: KioskLook; out: boolean } = { look: 'off', out: false };
  private readonly _listeners = new Set<() => void>();

  constructor(private readonly _env: KioskEnv) {}

  /** off, hidden, or tabs, as the household says for this screen. */
  get look(): KioskLook {
    return kioskLook(this._view);
  }

  /** A parent stepped out and Home Assistant's menus show for now. */
  get steppedOut(): boolean {
    return this._stepOut !== null;
  }

  /** Hear when the look or the step out changes (the card's strip). */
  onChange(listener: () => void): () => void {
    this._listeners.add(listener);
    return () => this._listeners.delete(listener);
  }

  setView(view: HouseholdView | null): void {
    this._view = view;
    if (this.look === 'off') this._stepOut = null;
    this.sync();
  }

  /** Step out until the quiet time passes without a touch, or the cap (D4). */
  lift(now: number, idleMs: number, capAt: number): void {
    if (this.look === 'off') return;
    this._stepOut = startStepOut(now, idleMs, capAt);
    this.sync();
  }

  /** Back to kiosk mode: Back to kiosk mode, Lock, or a hidden page. */
  restore(): void {
    if (!this._stepOut) return;
    this._stepOut = null;
    this.sync();
  }

  /** A touch anywhere on the page keeps a step out going. */
  touch(now: number): void {
    if (this._stepOut) this._stepOut = stepOutTouched(this._stepOut, now);
  }

  /** Ends a step out whose time is up. */
  tick(now: number): void {
    if (this._stepOut && stepOutOver(this._stepOut, now)) this.restore();
  }

  /** Makes the page match: the current dashboard root styled, Home Assistant's switch on, or neither. */
  sync(): void {
    const look = this.look;
    const wanted = look !== 'off' && !this._stepOut;
    const root = wanted ? this._env.root() : null;
    if (this._applied && (!wanted || this._applied.root !== root)) {
      this._applied.handle.remove();
      this._applied = null;
    }
    if (wanted && root) {
      const css = KIOSK_SHEETS[look];
      if (!this._applied) this._applied = { root, handle: this._env.addSheet(root, css), css };
      else if (this._applied.css !== css) {
        this._applied.handle.set(css);
        this._applied.css = css;
      }
    }
    if (wanted && !this._env.haKiosk()) {
      this._env.setHaKiosk(true);
      this._haOn = true;
    }
    if (!wanted && this._haOn) {
      this._env.setHaKiosk(false);
      this._haOn = false;
    }
    const now = { look, out: !!this._stepOut };
    if (now.look !== this._last.look || now.out !== this._last.out) {
      this._last = now;
      this._listeners.forEach(listener => listener());
    }
  }
}

type HassElement = HTMLElement & { hass?: { connection?: unknown; kioskMode?: boolean } };

/** The dashboard's root, along Home Assistant 2026.10's own path; null anywhere else. */
function dashboardRoot(): ShadowRoot | null {
  const ha = document.querySelector('home-assistant');
  const main = ha?.shadowRoot?.querySelector('home-assistant-main');
  const lovelace = main?.shadowRoot?.querySelector('ha-panel-lovelace');
  return lovelace?.shadowRoot?.querySelector('hui-root')?.shadowRoot ?? null;
}

const browserEnv: KioskEnv = {
  root: () => dashboardRoot(),
  addSheet: (root, css) => {
    const shadow = root as ShadowRoot;
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(css);
    shadow.adoptedStyleSheets = [...shadow.adoptedStyleSheets, sheet];
    return {
      set: next => sheet.replaceSync(next),
      remove: () => {
        shadow.adoptedStyleSheets = shadow.adoptedStyleSheets.filter(s => s !== sheet);
      },
    };
  },
  setHaKiosk: enable => window.dispatchEvent(new CustomEvent('hass-kiosk-mode', { detail: { enable } })),
  haKiosk: () => (document.querySelector('home-assistant') as HassElement | null)?.hass?.kioskMode === true,
};

/** The page's one controller; the card's strip uses it to step out and back. */
export const kiosk = new KioskController(browserEnv);

const STARTED = '__planavistaKiosk';

/** Starts kiosk mode for this page, once even if the bundle loads twice. */
export function startKiosk(): void {
  const w = window as unknown as Record<string, unknown>;
  if (w[STARTED]) return;
  w[STARTED] = true;
  const subscription = new HouseholdSubscription(view => kiosk.setView(view));
  const follow = () => {
    const ha = document.querySelector('home-assistant') as HassElement | null;
    subscription.update(ha?.hass?.connection as HouseholdConnection | undefined);
    kiosk.sync();
    kiosk.tick(Date.now());
  };
  window.setInterval(follow, 1000);
  follow();
  // A new panel or dashboard renders a moment after Home Assistant navigates.
  window.addEventListener('location-changed', () => {
    window.setTimeout(() => kiosk.sync(), 50);
    window.setTimeout(() => kiosk.sync(), 500);
  });
  const touched = () => kiosk.touch(Date.now());
  document.addEventListener('pointerdown', touched, true);
  document.addEventListener('keydown', touched, true);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') kiosk.restore();
  });
}

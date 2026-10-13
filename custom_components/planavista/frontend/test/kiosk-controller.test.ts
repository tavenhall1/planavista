import { describe, expect, it } from 'vitest';
import type { HouseholdView } from '../src/core/household';
import { KIOSK_SHEETS } from '../src/core/kiosk';
import { KioskController, type KioskEnv } from '../src/shell/kiosk-controller';

const view = (shared: boolean, enabled: boolean, top_bar: 'hidden' | 'tabs' = 'hidden'): HouseholdView =>
  ({
    available: true,
    members: [],
    account: { user_id: 'u', name: 'Kitchen', is_admin: false, shared, kind: shared ? 'shared' : 'parent', member_id: null, parent_level: false },
    security: { shuffle_keypad: false, shared_screens: 1, kiosk: { enabled, top_bar } },
    modules: {},
    setup: { completed: true, step: null },
  }) as HouseholdView;

/** A fake Home Assistant page: dashboard roots, the sheets on them, and HA's own kiosk switch. */
function fakeEnv() {
  const sheets = new Map<object, string>();
  const env = {
    current: { name: 'dashboard', parts: ['.header', '.action-items', 'ha-tab-group'] } as { parts?: string[] } | null,
    sheets,
    haKioskOn: false,
    switched: [] as boolean[],
    root: () => env.current,
    has: (root: object, selector: string) => ((root as { parts?: string[] }).parts ?? []).includes(selector),
    addSheet: (root: object, css: string) => {
      sheets.set(root, css);
      return { set: (next: string) => sheets.set(root, next), remove: () => sheets.delete(root) };
    },
    setHaKiosk: (enable: boolean) => {
      env.haKioskOn = enable;
      env.switched.push(enable);
    },
    haKiosk: () => env.haKioskOn,
    at: '/wall-calendar/planavista',
    navigated: [] as string[],
    path: () => env.at,
    navigate: (path: string) => {
      env.at = path;
      env.navigated.push(path);
    },
    saved: null as string | null,
    remembered: () => env.saved,
    remember: (path: string) => {
      env.saved = path;
    },
  };
  return env;
}

describe('the page-wide kiosk controller (spec 3.2)', () => {
  it('does nothing on a screen that is not shared, or while the switch is off', () => {
    const env = fakeEnv();
    const kiosk = new KioskController(env as KioskEnv);
    kiosk.setView(view(false, true));
    kiosk.setView(view(true, false));
    expect(env.sheets.size).toBe(0);
    expect(env.switched).toEqual([]);
    expect(kiosk.look).toBe('off');
  });

  it("hides the sidebar with Home Assistant's own switch and the header with the dashboard's style", () => {
    const env = fakeEnv();
    const kiosk = new KioskController(env as KioskEnv);
    kiosk.setView(view(true, true, 'hidden'));
    expect(env.haKioskOn).toBe(true);
    expect(env.sheets.get(env.current!)).toBe(KIOSK_SHEETS.hidden);
    // Tabs only changes the style in place.
    kiosk.setView(view(true, true, 'tabs'));
    expect(env.sheets.get(env.current!)).toBe(KIOSK_SHEETS.tabs);
    expect(env.sheets.size).toBe(1);
  });

  it('follows the page to a new dashboard root, and keeps Home Assistant switched on', () => {
    const env = fakeEnv();
    const kiosk = new KioskController(env as KioskEnv);
    kiosk.setView(view(true, true));
    const first = env.current!;
    env.current = { name: 'another dashboard', parts: ['.header', '.action-items'] };
    env.haKioskOn = false; // a reload of Home Assistant's own state, say
    kiosk.sync();
    expect(env.sheets.has(first)).toBe(false);
    expect(env.sheets.get(env.current)).toBe(KIOSK_SHEETS.hidden);
    expect(env.haKioskOn).toBe(true);
    // On a page with no dashboard there is nothing to style, and nothing breaks.
    env.current = null;
    kiosk.sync();
    expect(env.sheets.size).toBe(0);
    expect(env.haKioskOn).toBe(true);
  });

  it("fails open: no style where the part it hides isn't there (review)", () => {
    const env = fakeEnv();
    // A Home Assistant that renamed its header: hiding nothing beats a page that scrolls.
    env.current = { parts: ['.action-items'] };
    const kiosk = new KioskController(env as KioskEnv);
    kiosk.setView(view(true, true, 'hidden'));
    expect(env.sheets.size).toBe(0);
    expect(env.haKioskOn).toBe(true);
    kiosk.setView(view(true, true, 'tabs'));
    expect(env.sheets.size).toBe(1);
    // Tabs showing but the buttons beside them renamed: still nothing hidden.
    env.current = { parts: ['.header', 'ha-tab-group'] };
    kiosk.sync();
    expect(env.sheets.size).toBe(0);
  });

  it('turns everything back when the switch goes off, and only what it turned on', () => {
    const env = fakeEnv();
    const kiosk = new KioskController(env as KioskEnv);
    kiosk.setView(view(true, true));
    kiosk.setView(view(true, false));
    expect(env.sheets.size).toBe(0);
    expect(env.haKioskOn).toBe(false);
    // Someone else's kiosk (the Companion app's, say) is left alone.
    const other = fakeEnv();
    other.haKioskOn = true;
    const idle = new KioskController(other as KioskEnv);
    idle.setView(view(true, false));
    expect(other.haKioskOn).toBe(true);
    expect(other.switched).toEqual([]);
  });

  it("steps out by parent mode's clock, counted anywhere on the page, then comes back (D4)", () => {
    const env = fakeEnv();
    const kiosk = new KioskController(env as KioskEnv);
    const changes: string[] = [];
    kiosk.onChange(() => changes.push(kiosk.steppedOut ? 'out' : kiosk.look));
    kiosk.setView(view(true, true));
    kiosk.lift(0, 120_000, 600_000, 0);
    expect(kiosk.steppedOut).toBe(true);
    expect(env.sheets.size).toBe(0);
    expect(env.haKioskOn).toBe(false);
    kiosk.touch(100_000);
    kiosk.tick(150_000);
    expect(kiosk.steppedOut).toBe(true);
    kiosk.tick(220_000);
    expect(kiosk.steppedOut).toBe(false);
    expect(env.sheets.get(env.current!)).toBe(KIOSK_SHEETS.hidden);
    expect(env.haKioskOn).toBe(true);
    expect(changes).toEqual(['hidden', 'out', 'hidden']);
  });

  it('takes new limits from the household while stepped out (review)', () => {
    const env = fakeEnv();
    const kiosk = new KioskController(env as KioskEnv);
    kiosk.setView(view(true, true));
    kiosk.lift(0, 120_000, 600_000, 0);
    const shorter = view(true, true);
    shorter.security.session_idle_seconds = 30;
    shorter.security.parent_mode_minutes = 5;
    kiosk.setView(shorter);
    kiosk.tick(29_000);
    expect(kiosk.steppedOut).toBe(true);
    kiosk.tick(30_000);
    expect(kiosk.steppedOut).toBe(false);
  });

  it('comes back at once on Back to kiosk mode, on Lock, or when the page is hidden', () => {
    const env = fakeEnv();
    const kiosk = new KioskController(env as KioskEnv);
    kiosk.setView(view(true, true));
    kiosk.lift(0, 120_000, 600_000, 0);
    kiosk.restore();
    expect(kiosk.steppedOut).toBe(false);
    expect(env.sheets.size).toBe(1);
  });

  it('cannot step out where kiosk mode is off', () => {
    const env = fakeEnv();
    const kiosk = new KioskController(env as KioskEnv);
    kiosk.setView(view(true, false));
    kiosk.lift(0, 120_000, 600_000, 0);
    expect(kiosk.steppedOut).toBe(false);
  });
});


// Round 1 of the adversarial review: a step out that ended while Home Assistant's own Overview showed
// stranded the tablet there, kiosk mode back on with no sidebar, no menu button, and no card.
describe('a step out that ends away from the card goes back to it', () => {
  it("goes back to the card's dashboard when the quiet time ends on another page", () => {
    const env = fakeEnv();
    const kiosk = new KioskController(env as KioskEnv);
    kiosk.setView(view(true, true));
    kiosk.lift(0, 60_000, 600_000);
    env.at = '/home/overview';
    env.current = null;
    kiosk.tick(30_000);
    expect(env.navigated).toEqual([]);
    kiosk.tick(61_000);
    expect(env.navigated).toEqual(['/wall-calendar/planavista']);
    expect(kiosk.steppedOut).toBe(false);
  });

  it('stays put when it ends on the card itself', () => {
    const env = fakeEnv();
    const kiosk = new KioskController(env as KioskEnv);
    kiosk.setView(view(true, true));
    kiosk.lift(0, 60_000, 600_000);
    kiosk.restore();
    expect(env.navigated).toEqual([]);
  });

  it('goes back on Lock or a hidden page too', () => {
    const env = fakeEnv();
    const kiosk = new KioskController(env as KioskEnv);
    kiosk.setView(view(true, true));
    kiosk.lift(0, 60_000, 600_000);
    env.at = '/config/dashboard';
    kiosk.restore();
    expect(env.navigated).toEqual(['/wall-calendar/planavista']);
  });
});


// Round 2: after a step out ended, the browser's Back took the shared screen to Home Assistant's
// Overview with kiosk mode on: no sidebar, no menu button, no card, and a reload kept it there.
describe("kiosk mode keeps the screen on the card's dashboard", () => {
  const onHome = (env: ReturnType<typeof fakeEnv>) => {
    const kiosk = new KioskController(env as KioskEnv);
    kiosk.setView(view(true, true));
    kiosk.cardShown('/wall-calendar/planavista');
    return kiosk;
  };

  it('goes back when the page has shown no card for 3 seconds on another dashboard', () => {
    const env = fakeEnv();
    const kiosk = onHome(env);
    kiosk.cardGone();
    env.at = '/home/overview';
    env.current = null;
    kiosk.tick(10_000);
    kiosk.tick(12_000);
    expect(env.navigated).toEqual([]);
    kiosk.tick(13_000);
    expect(env.navigated).toEqual(['/wall-calendar/planavista']);
  });

  it('remembers the card across a reload', () => {
    const env = fakeEnv();
    env.saved = '/wall-calendar/planavista';
    env.at = '/home/overview';
    const kiosk = new KioskController(env as KioskEnv);
    kiosk.setView(view(true, true));
    kiosk.tick(0);
    kiosk.tick(3_000);
    expect(env.navigated).toEqual(['/wall-calendar/planavista']);
  });

  it("stays on another view of the card's dashboard, while a card shows, during a step out, and with kiosk mode off", () => {
    const tabs = fakeEnv();
    const kiosk = onHome(tabs);
    kiosk.cardGone();
    tabs.at = '/wall-calendar/photos';
    kiosk.tick(0);
    kiosk.tick(5_000);
    expect(tabs.navigated).toEqual([]);

    const moved = fakeEnv();
    const card = onHome(moved);
    card.cardGone();
    moved.at = '/kitchen/board';
    card.cardShown('/kitchen/board');
    card.tick(0);
    card.tick(5_000);
    expect(moved.saved).toBe('/kitchen/board');
    expect(moved.navigated).toEqual([]);

    const out = fakeEnv();
    const stepped = onHome(out);
    stepped.cardGone();
    stepped.lift(0, 60_000, 600_000);
    out.at = '/config/dashboard';
    stepped.tick(1_000);
    stepped.tick(5_000);
    expect(out.navigated).toEqual([]);

    const off = fakeEnv();
    off.saved = '/wall-calendar/planavista';
    off.at = '/home/overview';
    const plain = new KioskController(off as KioskEnv);
    plain.setView(view(true, false));
    plain.tick(0);
    plain.tick(5_000);
    expect(off.navigated).toEqual([]);
  });
});


// Round 1 of the adversarial review: Tabs only on a dashboard with one view (Home Assistant shows no
// tabs then) left a bare title bar with nothing to tap, white over a dark card.
describe('Tabs only on a dashboard without tabs', () => {
  it('hides the whole top bar, as Hidden does', () => {
    const env = fakeEnv();
    env.current = { parts: ['.header', '.action-items'] };
    const kiosk = new KioskController(env as KioskEnv);
    kiosk.setView(view(true, true, 'tabs'));
    expect(env.sheets.get(env.current!)).toBe(KIOSK_SHEETS.hidden);
  });

  it('keeps the tabs once there are tabs to keep', () => {
    const env = fakeEnv();
    const kiosk = new KioskController(env as KioskEnv);
    kiosk.setView(view(true, true, 'tabs'));
    expect(env.sheets.get(env.current!)).toBe(KIOSK_SHEETS.tabs);
  });
});

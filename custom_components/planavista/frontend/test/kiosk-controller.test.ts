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
    current: { name: 'dashboard', parts: ['.header', '.action-items'] } as { parts?: string[] } | null,
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
    env.current = { parts: ['.header'] };
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

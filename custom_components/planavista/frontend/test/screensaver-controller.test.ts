import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { ScreensaverController, type ScreensaverEnv } from '../src/shell/screensaver-controller';
import type { EntityState, ServiceCall } from '../src/core/screensaver';
import type { HouseholdView } from '../src/core/household';

const src = (path: string) => readFileSync(fileURLToPath(new URL(`../src/${path}`, import.meta.url)), 'utf-8').replace(/\r\n/g, '\n');
const MIN = 60_000;

function view(screens: { screen?: string | null; motion?: string | null } = {}, fields: { shared?: boolean; enabled?: boolean } = {}): HouseholdView {
  return {
    available: true,
    members: [],
    account: { user_id: 'kitchen', name: 'Kitchen', is_admin: false, shared: fields.shared ?? true, kind: 'shared', member_id: null, parent_level: false },
    security: {
      shuffle_keypad: false, shared_screens: 1,
      screensaver: {
        enabled: fields.enabled ?? true, after_minutes: 5, night: { from: '22:00', to: '06:30' },
        screens: [{ user_id: 'kitchen', name: 'Kitchen', screen: screens.screen ?? null, motion: screens.motion ?? null }],
      },
    },
    modules: {},
    setup: { completed: true, step: null },
  } as unknown as HouseholdView;
}

class FakePage implements ScreensaverEnv {
  shown = false;
  calls: ServiceCall[] = [];
  locks = 0;
  guards = 0;
  wake: boolean[] = [];
  entities: Record<string, EntityState & { last_changed?: string }> = {};
  states() { return this.entities; }
  call(call: ServiceCall) { this.calls.push(call); return Promise.resolve(); }
  show() { this.shown = true; }
  hide() { this.shown = false; }
  lockParentMode() { this.locks += 1; }
  wakeLock(hold: boolean) { this.wake.push(hold); }
  guardTaps() { this.guards += 1; }
}

const noon = (minutes = 0) => new Date(2026, 9, 15, 12, minutes);

describe('the screensaver controller (spec 3.2)', () => {
  it('comes on after the wait without a touch, and a touch only wakes it', () => {
    const page = new FakePage();
    const start = noon().getTime();
    const saver = new ScreensaverController(page, start);
    saver.setView(view(), start);
    expect(page.wake).toEqual([true]);
    saver.tick(start + 4 * MIN, noon(4));
    expect(page.shown).toBe(false);
    saver.tick(start + 5 * MIN, noon(5));
    expect(page.shown).toBe(true);
    expect(page.locks).toBe(1);
    saver.touch(start + 6 * MIN);
    expect(page.shown).toBe(false);
    expect(page.guards).toBe(1);
    // The wait starts over from the waking touch.
    saver.tick(start + 10 * MIN, noon(10));
    expect(page.shown).toBe(false);
    saver.tick(start + 11 * MIN, noon(11));
    expect(page.shown).toBe(true);
  });

  it("never runs where it shouldn't, and goes when the setting does", () => {
    const page = new FakePage();
    const start = noon().getTime();
    const saver = new ScreensaverController(page, start);
    saver.setView(view({}, { shared: false }), start);
    saver.tick(start + 30 * MIN, noon(30));
    expect(page.shown).toBe(false);
    saver.setView(view(), start);
    saver.tick(start + 30 * MIN, noon(30));
    expect(page.shown).toBe(true);
    saver.setView(view({}, { enabled: false }), start + 31 * MIN);
    expect(page.shown).toBe(false);
    expect(page.wake.at(-1)).toBe(false);
  });

  it('stays off while motion reads on, and motion wakes it', () => {
    const page = new FakePage();
    const start = noon().getTime();
    const saver = new ScreensaverController(page, start);
    saver.setView(view({ motion: 'binary_sensor.kitchen' }), start);
    page.entities['binary_sensor.kitchen'] = { state: 'on', attributes: {}, last_changed: new Date(start).toISOString() };
    saver.tick(start + 20 * MIN, noon(20));
    expect(page.shown).toBe(false);
    page.entities['binary_sensor.kitchen'] = { state: 'off', attributes: {}, last_changed: new Date(start + 20 * MIN).toISOString() };
    saver.tick(start + 24 * MIN, noon(24));
    expect(page.shown).toBe(false);
    saver.tick(start + 25 * MIN, noon(25));
    expect(page.shown).toBe(true);
    page.entities['binary_sensor.kitchen'] = { state: 'on', attributes: {}, last_changed: new Date(start + 26 * MIN).toISOString() };
    saver.tick(start + 26 * MIN, noon(26));
    expect(page.shown).toBe(false);
  });

  it('dims the screen by day, turns it off at night, and puts it back on waking', () => {
    const page = new FakePage();
    const start = new Date(2026, 9, 15, 21, 50).getTime();
    const saver = new ScreensaverController(page, start);
    saver.setView(view({ screen: 'light.planar' }), start);
    page.entities['light.planar'] = { state: 'on', attributes: { brightness: 230 } };
    saver.tick(start + 5 * MIN, new Date(start + 5 * MIN));
    expect(page.calls).toEqual([{ domain: 'light', service: 'turn_on', data: { entity_id: 'light.planar', brightness_pct: 40 } }]);
    saver.tick(start + 10 * MIN, new Date(start + 10 * MIN));
    expect(page.calls.at(-1)).toEqual({ domain: 'light', service: 'turn_off', data: { entity_id: 'light.planar' } });
    saver.touch(start + 30 * MIN);
    expect(page.calls.at(-1)).toEqual({ domain: 'light', service: 'turn_on', data: { entity_id: 'light.planar', brightness: 230 } });
  });

  it("shows at once for Settings' Show it now, without touching the screen's entity", () => {
    const page = new FakePage();
    const start = noon().getTime();
    const saver = new ScreensaverController(page, start);
    saver.setView(view({ screen: 'light.planar', motion: 'binary_sensor.kitchen' }), start);
    page.entities['light.planar'] = { state: 'on', attributes: { brightness: 230 } };
    page.entities['binary_sensor.kitchen'] = { state: 'on', attributes: {}, last_changed: new Date(start + MIN).toISOString() };
    saver.preview(noon());
    saver.tick(start + 2 * MIN, noon(2));
    expect(page.shown).toBe(true);
    expect(page.calls).toEqual([]);
    saver.touch(start + 3 * MIN);
    expect(page.shown).toBe(false);
    expect(page.calls).toEqual([]);
  });

  it('is started from main.ts, locks parent mode, and shares the page household with kiosk mode', () => {
    expect(src('main.ts')).toMatch(/startScreensaver\(\);/);
    expect(src('shell/session-controller.ts')).toMatch(/window\.addEventListener\('pv-screensaver-shown', this\._onScreensaver\);/);
    expect(src('shell/kiosk-controller.ts')).toMatch(/onPageHousehold\(view => kiosk\.setView\(view\)\);/);
    expect(src('shell/screensaver-controller.ts')).toMatch(/guardTaps: \(\) => \{\n\s+guardPageTaps\(\);/);
  });
});

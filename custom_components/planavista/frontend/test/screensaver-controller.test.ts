import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { ScreensaverController, type ScreensaverEnv } from '../src/shell/screensaver-controller';
import { DARK_FADE_MS, LIGHT_UP_MS, PANEL_WAKE_MS, type EntityState, type ScreenRecord, type ServiceCall, type SkyStage } from '../src/core/screensaver';
import type { HouseholdView } from '../src/core/household';

const src = (path: string) => readFileSync(fileURLToPath(new URL(`../src/${path}`, import.meta.url)), 'utf-8').replace(/\r\n/g, '\n');
const MIN = 60_000;

function view(
  screens: { screen?: string | null; motion?: string | null } = {}, fields: { shared?: boolean; enabled?: boolean; dark?: number } = {},
): HouseholdView {
  return {
    available: true,
    members: [],
    account: { user_id: 'kitchen', name: 'Kitchen', is_admin: false, shared: fields.shared ?? true, kind: 'shared', member_id: null, parent_level: false },
    security: {
      shuffle_keypad: false, shared_screens: 1,
      screensaver: {
        enabled: fields.enabled ?? true, after_minutes: 5, dark_minutes: fields.dark ?? 10, night: { from: '22:00', to: '06:30' },
        screens: [{ user_id: 'kitchen', name: 'Kitchen', screen: screens.screen ?? null, motion: screens.motion ?? null }],
      },
    },
    modules: {},
    setup: { completed: true, step: null },
  } as unknown as HouseholdView;
}

/** What one browser keeps for every page of the login: the record and the last touch on any of them. */
class Browser {
  record: ScreenRecord = { showing: false, holds: [] };
  touchedAt = 0;
  entities: Record<string, EntityState & { last_changed?: string }> = {};
}

/** A page with Home Assistant's entities, which answer the calls as Home Assistant would (skipping unavailable ones). */
class FakePage implements ScreensaverEnv {
  shown = false;
  calls: ServiceCall[] = [];
  locks = 0;
  guards = 0;
  wake: boolean[] = [];
  hidden = false;
  constructor(readonly browser = new Browser()) {}
  get entities() { return this.browser.entities; }
  set entities(value) { this.browser.entities = value; }
  get record() { return this.browser.record; }
  states() { return this.browser.entities; }
  call(call: ServiceCall) {
    this.calls.push(call);
    const id = String(call.data.entity_id);
    const was = this.entities[id];
    if (!was || was.state === 'unavailable') return Promise.resolve(); // Home Assistant skips it and answers done
    if (call.service === 'turn_off') this.entities[id] = { state: 'off', attributes: { ...was?.attributes, brightness: null } };
    if (call.service === 'turn_on') {
      const brightness = call.data.brightness ?? was?.attributes.brightness;
      this.entities[id] = { state: 'on', attributes: { ...was?.attributes, ...(brightness == null ? {} : { brightness }) } };
    }
    if (call.service === 'set_value') this.entities[id] = { state: String(call.data.value), attributes: { ...was?.attributes } };
    return Promise.resolve();
  }
  stages: Array<[SkyStage, number]> = [];
  show(stage: SkyStage) { this.shown = true; this.stages.push([stage, 0]); }
  stage(stage: SkyStage, ease: { ms: number }) { this.stages.push([stage, ease.ms]); }
  get now(): SkyStage | undefined { return this.stages.at(-1)?.[0]; }
  hide() { this.shown = false; }
  lockParentMode() { this.locks += 1; }
  keeps = 0;
  keepParentMode() { this.keeps += 1; }
  wakeLock(hold: boolean) { this.wake.push(hold); }
  guardTaps() { this.guards += 1; }
  loadRecord() { return structuredClone(this.browser.record); }
  saveRecord(record: ScreenRecord) { this.browser.record = structuredClone(record); }
  lastTouchAnywhere() { return this.browser.touchedAt; }
  shareTouch(now: number) { this.browser.touchedAt = Math.max(this.browser.touchedAt, now); }
  visible() { return !this.hidden; }
}

const noon = (minutes = 0) => new Date(2026, 9, 15, 12, minutes);
const evening = (hours: number, minutes = 0) => new Date(2026, 9, 15, hours, minutes);

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
    expect(saver.touch(start + 6 * MIN)).toBe(true);
    expect(page.shown).toBe(false);
    expect(page.guards).toBe(1);
    expect(saver.touch(start + 6 * MIN)).toBe(false);
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

  it('stays off while motion reads on; motion lights the sky but only a touch opens the board (0.13.0)', () => {
    const page = new FakePage();
    const start = noon().getTime();
    const saver = new ScreensaverController(page, start);
    saver.setView(view({ motion: 'binary_sensor.kitchen' }), start);
    page.entities['binary_sensor.kitchen'] = { state: 'on', attributes: {}, last_changed: new Date(start).toISOString() };
    saver.tick(start + 19 * MIN, noon(19));
    expect(page.shown).toBe(false);
    page.entities['binary_sensor.kitchen'] = { state: 'off', attributes: {}, last_changed: new Date(start + 20 * MIN).toISOString() };
    saver.tick(start + 20 * MIN, noon(20));
    saver.tick(start + 24 * MIN, noon(24));
    expect(page.shown).toBe(false);
    saver.tick(start + 25 * MIN, noon(25));
    expect([page.shown, page.now]).toEqual([true, 'rest']);
    page.entities['binary_sensor.kitchen'] = { state: 'on', attributes: {}, last_changed: new Date(start + 26 * MIN).toISOString() };
    saver.tick(start + 26 * MIN, noon(26));
    expect([page.shown, page.stages.at(-1)]).toEqual([true, ['lit', LIGHT_UP_MS]]);
    // They walk away: it rests again.
    page.entities['binary_sensor.kitchen'] = { state: 'off', attributes: {}, last_changed: new Date(start + 27 * MIN).toISOString() };
    saver.tick(start + 27 * MIN, noon(27));
    expect([page.shown, page.now]).toEqual([true, 'rest']);
    expect(saver.touch(start + 28 * MIN)).toBe(true);
    expect(page.shown).toBe(false);
  });

  it("a restart's fresh reading of no motion doesn't start the wait over (the kitchen screen)", () => {
    const page = new FakePage();
    const start = noon().getTime();
    const saver = new ScreensaverController(page, start);
    saver.setView(view({ motion: 'binary_sensor.kitchen' }), start);
    page.entities['binary_sensor.kitchen'] = { state: 'off', attributes: {}, last_changed: new Date(start - 30 * MIN).toISOString() };
    saver.tick(start + MIN, noon(1));
    // Home Assistant restarts: the sensor goes away and comes back off, changed just now.
    page.entities['binary_sensor.kitchen'] = { state: 'unavailable', attributes: {} };
    saver.tick(start + 2 * MIN, noon(2));
    page.entities['binary_sensor.kitchen'] = { state: 'off', attributes: {}, last_changed: new Date(start + 3 * MIN).toISOString() };
    saver.tick(start + 3 * MIN, noon(3));
    saver.tick(start + 5 * MIN, noon(5));
    expect(page.shown).toBe(true);
  });

  it("lights on motion when Home Assistant's clock is behind the screen's", () => {
    const page = new FakePage();
    const start = noon().getTime();
    const behind = (ms: number) => new Date(ms - 10 * MIN).toISOString();
    const saver = new ScreensaverController(page, start);
    saver.setView(view({ motion: 'binary_sensor.kitchen' }), start);
    page.entities['binary_sensor.kitchen'] = { state: 'off', attributes: {}, last_changed: behind(start - 30 * MIN) };
    saver.tick(start + 5 * MIN, noon(5));
    expect(page.shown).toBe(true);
    page.entities['binary_sensor.kitchen'] = { state: 'on', attributes: {}, last_changed: behind(start + 6 * MIN) };
    saver.tick(start + 6 * MIN, noon(6));
    expect([page.shown, page.now]).toEqual([true, 'lit']);
  });

  it('goes dark after the dark wait: the Screen off once the fade has played, the device free to sleep, and a touch puts it back', () => {
    const page = new FakePage();
    const start = noon().getTime();
    const saver = new ScreensaverController(page, start);
    saver.setView(view({ screen: 'light.planar' }), start);
    page.entities['light.planar'] = { state: 'on', attributes: { brightness: 230 } };
    saver.tick(start + 5 * MIN, noon(5));
    // No motion sensor: lit, and the Screen left alone until dark (the shade dims now, not the light).
    expect([page.now, page.calls]).toEqual(['lit', []]);
    saver.tick(start + 15 * MIN - 1000, noon(15));
    expect(page.now).toBe('lit');
    saver.tick(start + 15 * MIN, noon(15));
    expect(page.stages.at(-1)).toEqual(['dark', DARK_FADE_MS]);
    expect(page.wake.at(-1)).toBe(false);
    expect(page.calls).toEqual([]);
    saver.tick(start + 15 * MIN + DARK_FADE_MS, noon(15));
    expect(page.calls).toEqual([{ domain: 'light', service: 'turn_off', data: { entity_id: 'light.planar' } }]);
    saver.tick(start + 16 * MIN, noon(16));
    expect(page.calls).toHaveLength(1);
    saver.touch(start + 30 * MIN);
    expect(page.calls.at(-1)).toEqual({ domain: 'light', service: 'turn_on', data: { entity_id: 'light.planar', brightness: 230 } });
    expect(page.wake.at(-1)).toBe(true);
    expect(page.record).toEqual({ showing: false, holds: [] });
  });

  it('at night the same: it rests and goes dark on the waits, not as soon as it shows', () => {
    const page = new FakePage();
    const start = evening(23).getTime();
    const saver = new ScreensaverController(page, start);
    saver.setView(view({ screen: 'switch.planar', motion: 'binary_sensor.kitchen' }), start);
    page.entities['switch.planar'] = { state: 'on', attributes: {} };
    page.entities['binary_sensor.kitchen'] = { state: 'off', attributes: {}, last_changed: new Date(start - MIN).toISOString() };
    saver.tick(start + 5 * MIN, evening(23, 5));
    expect([page.now, page.entities['switch.planar'].state, page.wake.at(-1)]).toEqual(['rest', 'on', true]);
    saver.tick(start + 15 * MIN, evening(23, 15));
    saver.tick(start + 15 * MIN + DARK_FADE_MS, evening(23, 15));
    expect([page.now, page.entities['switch.planar'].state]).toEqual(['dark', 'off']);
  });

  it('someone walking up in the dark: the Screen back on, the sky easing up slowly enough to outlast the panel waking', () => {
    const page = new FakePage();
    const start = noon().getTime();
    const saver = new ScreensaverController(page, start);
    saver.setView(view({ screen: 'light.planar', motion: 'binary_sensor.kitchen' }), start);
    page.entities['light.planar'] = { state: 'on', attributes: { brightness: 230 } };
    page.entities['binary_sensor.kitchen'] = { state: 'off', attributes: {}, last_changed: new Date(start - MIN).toISOString() };
    saver.tick(start + 5 * MIN, noon(5));
    saver.tick(start + 15 * MIN, noon(15));
    saver.tick(start + 15 * MIN + DARK_FADE_MS, noon(15));
    expect(page.entities['light.planar'].state).toBe('off');
    page.entities['binary_sensor.kitchen'] = { state: 'on', attributes: {}, last_changed: new Date(start + 20 * MIN).toISOString() };
    saver.tick(start + 20 * MIN, noon(20));
    expect([page.shown, page.stages.at(-1)]).toEqual([true, ['lit', PANEL_WAKE_MS]]);
    expect(page.entities['light.planar']).toEqual({ state: 'on', attributes: { brightness: 230 } });
    expect(page.wake.at(-1)).toBe(true);
    expect(page.record.holds).toEqual([]);
    // They walk away: rest at once, dark again after the full waits from then.
    page.entities['binary_sensor.kitchen'] = { state: 'off', attributes: {}, last_changed: new Date(start + 21 * MIN).toISOString() };
    saver.tick(start + 21 * MIN, noon(21));
    expect(page.now).toBe('rest');
    saver.tick(start + 35 * MIN, noon(35));
    expect(page.now).toBe('rest');
    saver.tick(start + 36 * MIN, noon(36));
    expect(page.now).toBe('dark');
  });

  it('a drawn dark (no Screen picked) lights quickly, and Never never goes dark', () => {
    const page = new FakePage();
    const start = noon().getTime();
    const saver = new ScreensaverController(page, start);
    saver.setView(view({ motion: 'binary_sensor.kitchen' }), start);
    page.entities['binary_sensor.kitchen'] = { state: 'off', attributes: {}, last_changed: new Date(start - MIN).toISOString() };
    saver.tick(start + 15 * MIN, noon(15));
    expect(page.now).toBe('dark');
    page.entities['binary_sensor.kitchen'] = { state: 'on', attributes: {}, last_changed: new Date(start + 16 * MIN).toISOString() };
    saver.tick(start + 16 * MIN, noon(16));
    expect(page.stages.at(-1)).toEqual(['lit', LIGHT_UP_MS]);
    const never = new FakePage();
    const other = new ScreensaverController(never, start);
    other.setView(view({}, { dark: 0 }), start);
    other.tick(start + 5 * MIN, noon(5));
    other.tick(start + 600 * MIN, noon(0));
    expect(never.stages).toEqual([['lit', 0]]);
  });

  it('a motion sensor stuck on keeps the sky lit and never dark; a touch still opens the board', () => {
    const page = new FakePage();
    const start = noon().getTime();
    const saver = new ScreensaverController(page, start);
    saver.setView(view({ motion: 'binary_sensor.kitchen' }), start);
    page.entities['binary_sensor.kitchen'] = { state: 'off', attributes: {}, last_changed: new Date(start - MIN).toISOString() };
    saver.tick(start + 5 * MIN, noon(5));
    page.entities['binary_sensor.kitchen'] = { state: 'on', attributes: {}, last_changed: new Date(start + 6 * MIN).toISOString() };
    for (let m = 6; m < 200; m += 7) saver.tick(start + m * MIN, noon(0));
    expect(page.now).toBe('lit');
    saver.touch(start + 200 * MIN);
    expect(page.shown).toBe(false);
  });

  it('after a reload while it shows, comes back up as it was, and a touch puts the screen back', () => {
    const page = new FakePage();
    const start = evening(23).getTime();
    const before = new ScreensaverController(page, start);
    before.setView(view({ screen: 'light.planar' }), start);
    page.entities['light.planar'] = { state: 'on', attributes: { brightness: 230 } };
    before.tick(start + 5 * MIN, new Date(start + 5 * MIN));
    before.tick(start + 15 * MIN, new Date(start + 15 * MIN));
    before.tick(start + 15 * MIN + DARK_FADE_MS, new Date(start + 15 * MIN));
    expect(page.entities['light.planar'].state).toBe('off');
    // The page reloads (a kiosk browser's own reload, a crash): nobody touched it, so it shows again at once, still dark.
    page.shown = false;
    page.stages = [];
    const after = new ScreensaverController(page, start + 16 * MIN);
    after.tick(start + 16 * MIN, new Date(start + 16 * MIN));
    expect(page.shown).toBe(false); // not before the household says it still runs here
    after.setView(view({ screen: 'light.planar' }), start + 16 * MIN);
    after.tick(start + 16 * MIN, new Date(start + 16 * MIN));
    after.tick(start + 17 * MIN, new Date(start + 17 * MIN));
    expect([page.shown, page.stages]).toEqual([true, [['dark', 0]]]);
    expect(page.entities['light.planar'].state).toBe('off');
    after.touch(start + 18 * MIN);
    expect(page.entities['light.planar']).toEqual({ state: 'on', attributes: { brightness: 230 } });
    expect(page.record).toEqual({ showing: false, holds: [] });
  });

  it('a reload after it was woken puts back what it still held', () => {
    const page = new FakePage();
    page.browser.record = { showing: false, holds: [{ entity: 'light.planar', before: { state: 'on', attributes: { brightness: 230 } } }] };
    page.entities['light.planar'] = { state: 'off', attributes: {} };
    const saver = new ScreensaverController(page, noon().getTime());
    saver.setView(view({ screen: 'light.planar' }), noon().getTime());
    saver.tick(noon().getTime(), noon());
    expect(page.shown).toBe(false);
    expect(page.entities['light.planar']).toEqual({ state: 'on', attributes: { brightness: 230 } });
  });

  it('keeps what it changed until the Screen can be put back (Home Assistant skips an unavailable one)', () => {
    const page = new FakePage();
    const start = noon().getTime();
    const saver = new ScreensaverController(page, start);
    saver.setView(view({ screen: 'light.planar' }), start);
    page.entities['light.planar'] = { state: 'on', attributes: { brightness: 200 } };
    saver.tick(start + 5 * MIN, noon(5));
    saver.tick(start + 15 * MIN, noon(15));
    saver.tick(start + 15 * MIN + DARK_FADE_MS, noon(15));
    expect(page.entities['light.planar'].state).toBe('off');
    page.entities['light.planar'] = { state: 'unavailable', attributes: {} };
    saver.touch(start + 16 * MIN);
    expect(page.shown).toBe(false);
    expect(page.record.holds).toHaveLength(1);
    page.entities['light.planar'] = { state: 'off', attributes: {} };
    saver.tick(start + 16 * MIN + 2000, noon(16));
    expect(page.entities['light.planar']).toEqual({ state: 'on', attributes: { brightness: 200 } });
    expect(page.record.holds).toEqual([]);
  });

  it('two pages of the shared login in one browser: a touch on either counts for both, and the Screen comes back as it was', () => {
    const browser = new Browser();
    const a = new FakePage(browser);
    const b = new FakePage(browser);
    const start = noon().getTime();
    browser.entities['light.planar'] = { state: 'on', attributes: { brightness: 200 } };
    const tabA = new ScreensaverController(a, start);
    const tabB = new ScreensaverController(b, start);
    tabA.setView(view({ screen: 'light.planar' }), start);
    tabB.setView(view({ screen: 'light.planar' }), start);
    // Someone uses page A; page B, idle, keeps the screensaver off.
    for (let m = 1; m <= 10; m += 1) {
      tabA.touch(start + m * MIN);
      tabB.tick(start + m * MIN + 1000, noon(m));
    }
    expect(b.shown).toBe(false);
    expect(browser.entities['light.planar'].attributes.brightness).toBe(200);
    // Both idle: both show, both go dark, and the one record keeps the Screen as it really was.
    tabA.tick(start + 16 * MIN, noon(16));
    tabB.tick(start + 16 * MIN, noon(16));
    expect([a.shown, b.shown]).toEqual([true, true]);
    for (const t of [26 * MIN, 26 * MIN + DARK_FADE_MS]) {
      tabA.tick(start + t, noon(26));
      tabB.tick(start + t, noon(26));
    }
    expect(browser.entities['light.planar'].state).toBe('off');
    expect(browser.record.holds).toEqual([{ entity: 'light.planar', before: { state: 'on', attributes: { brightness: 200 } } }]);
    // A touch on page A wakes page B too.
    tabA.touch(start + 27 * MIN);
    tabB.tick(start + 27 * MIN + 1000, noon(27));
    expect([a.shown, b.shown]).toEqual([false, false]);
    expect(browser.entities['light.planar']).toEqual({ state: 'on', attributes: { brightness: 200 } });
  });

  it('never comes up on a page that is hidden', () => {
    const page = new FakePage();
    page.hidden = true;
    const start = noon().getTime();
    const saver = new ScreensaverController(page, start);
    saver.setView(view(), start);
    saver.tick(start + 30 * MIN, noon(30));
    expect(page.shown).toBe(false);
    page.hidden = false;
    saver.tick(start + 31 * MIN, noon(31));
    expect(page.shown).toBe(true);
  });

  it('puts the screen back when the setting goes off or the screen stops being shared', () => {
    for (const fields of [{ enabled: false }, { shared: false }]) {
      const page = new FakePage();
      const start = evening(23).getTime();
      const saver = new ScreensaverController(page, start);
      saver.setView(view({ screen: 'switch.planar' }), start);
      page.entities['switch.planar'] = { state: 'on', attributes: {} };
      saver.tick(start + 5 * MIN, new Date(start + 5 * MIN));
      saver.tick(start + 15 * MIN, new Date(start + 15 * MIN));
      saver.tick(start + 15 * MIN + DARK_FADE_MS, new Date(start + 15 * MIN));
      expect(page.entities['switch.planar'].state).toBe('off');
      saver.setView(view({}, fields), start + 16 * MIN);
      expect(page.shown).toBe(false);
      expect(page.entities['switch.planar'].state, JSON.stringify(fields)).toBe('on');
    }
  });

  it('a Screen picked while it shows: the old one goes back, the new one starts from how it is', () => {
    const page = new FakePage();
    const start = noon().getTime();
    const saver = new ScreensaverController(page, start);
    saver.setView(view({ screen: 'light.planar' }), start);
    page.entities['light.planar'] = { state: 'on', attributes: { brightness: 230 } };
    page.entities['input_number.backlight'] = { state: '200', attributes: { min: 0, max: 255, step: 1 } };
    saver.tick(start + 15 * MIN, noon(15));
    saver.tick(start + 15 * MIN + DARK_FADE_MS, noon(15));
    expect(page.entities['light.planar'].state).toBe('off');
    saver.setView(view({ screen: 'input_number.backlight' }), start + 16 * MIN);
    saver.tick(start + 16 * MIN, noon(16));
    expect(page.entities['light.planar']).toEqual({ state: 'on', attributes: { brightness: 230 } });
    expect(page.entities['input_number.backlight'].state).toBe('0');
    saver.touch(start + 17 * MIN);
    expect(page.entities['input_number.backlight'].state).toBe('200');
  });

  it('a new pick while the old Screen is unavailable: the new one starts at once, the old one goes back when it can', () => {
    const page = new FakePage();
    const start = noon().getTime();
    const saver = new ScreensaverController(page, start);
    saver.setView(view({ screen: 'light.planar' }), start);
    page.entities['light.planar'] = { state: 'on', attributes: { brightness: 230 } };
    page.entities['input_number.backlight'] = { state: '200', attributes: { min: 0, max: 255, step: 1 } };
    saver.tick(start + 15 * MIN, noon(15));
    saver.tick(start + 15 * MIN + DARK_FADE_MS, noon(15));
    page.entities['light.planar'] = { state: 'unavailable', attributes: {} };
    saver.setView(view({ screen: 'input_number.backlight' }), start + 16 * MIN);
    saver.tick(start + 16 * MIN, noon(16));
    expect(page.entities['input_number.backlight'].state).toBe('0');
    page.entities['light.planar'] = { state: 'off', attributes: {} };
    saver.tick(start + 16 * MIN + 2000, noon(16));
    expect(page.entities['light.planar'].attributes.brightness).toBe(230);
    saver.touch(start + 17 * MIN);
    expect(page.entities['input_number.backlight'].state).toBe('200');
    expect(page.record.holds).toEqual([]);
  });

  it("never touches a Screen whose state it doesn't know, and takes it once it does", () => {
    const page = new FakePage();
    const start = evening(23).getTime();
    const saver = new ScreensaverController(page, start);
    saver.setView(view({ screen: 'light.planar' }), start);
    page.entities['light.planar'] = { state: 'unavailable', attributes: {} };
    saver.tick(start + 15 * MIN, new Date(start + 15 * MIN));
    saver.tick(start + 15 * MIN + DARK_FADE_MS, new Date(start + 15 * MIN));
    expect(page.calls).toEqual([]);
    page.entities['light.planar'] = { state: 'on', attributes: { brightness: 180 } };
    saver.tick(start + 16 * MIN, new Date(start + 16 * MIN));
    expect(page.entities['light.planar'].state).toBe('off');
    saver.touch(start + 17 * MIN);
    expect(page.entities['light.planar']).toEqual({ state: 'on', attributes: { brightness: 180 } });
  });

  it("Show it now keeps parent mode and leaves the screen alone, until it's left up past the wait", () => {
    const page = new FakePage();
    const start = noon().getTime();
    const saver = new ScreensaverController(page, start);
    saver.setView(view({ screen: 'light.planar', motion: 'binary_sensor.kitchen' }), start);
    page.entities['light.planar'] = { state: 'on', attributes: { brightness: 230 } };
    page.entities['binary_sensor.kitchen'] = { state: 'off', attributes: {}, last_changed: new Date(start - MIN).toISOString() };
    saver.preview(noon());
    saver.tick(start + 2 * MIN, noon(2));
    expect([page.shown, page.now]).toEqual([true, 'lit']);
    expect([page.locks, page.calls.length]).toEqual([0, 0]);
    // A preview never rests or goes dark while a parent looks; nobody touched it for the wait: now it is the screensaver.
    saver.tick(start + 5 * MIN, noon(5));
    expect([page.locks, page.now, page.calls]).toEqual([1, 'rest', []]);
    page.entities['binary_sensor.kitchen'] = { state: 'on', attributes: {}, last_changed: new Date(start + 6 * MIN).toISOString() };
    saver.tick(start + 6 * MIN, noon(6));
    expect([page.shown, page.now]).toEqual([true, 'lit']);
  });

  it('a parent looking at a preview keeps parent mode while it shows, and the touch that ends it counts (review m12 J)', () => {
    const page = new FakePage();
    const start = noon().getTime();
    const saver = new ScreensaverController(page, start);
    saver.setView(view({ screen: 'light.planar' }), start);
    page.entities['light.planar'] = { state: 'on', attributes: { brightness: 230 } };
    saver.preview(noon());
    saver.tick(start + MIN, noon(1));
    saver.tick(start + 2 * MIN, noon(2));
    expect(page.keeps).toBe(2);
    saver.touch(start + 3 * MIN);
    expect([page.shown, page.keeps, page.locks]).toEqual([false, 3, 0]);
    // The real screensaver keeps nothing: parent mode ended as it came on.
    saver.tick(start + 9 * MIN, noon(9));
    expect(page.shown).toBe(true);
    saver.tick(start + 10 * MIN, noon(10));
    saver.touch(start + 11 * MIN);
    expect([page.keeps, page.locks]).toEqual([3, 1]);
    expect(src('shell/session-controller.ts')).toMatch(/window\.addEventListener\('pv-screensaver-looked', this\._onActivity\);/);
  });

  it('is started from main.ts, locks parent mode, and shares the page household with kiosk mode', () => {
    expect(src('main.ts')).toMatch(/startScreensaver\(\);/);
    expect(src('shell/session-controller.ts')).toMatch(/window\.addEventListener\('pv-screensaver-shown', this\._onScreensaver\);/);
    expect(src('shell/kiosk-controller.ts')).toMatch(/onPageHousehold\(view => kiosk\.setView\(view\)\);/);
    expect(src('shell/screensaver-controller.ts')).toMatch(/guardTaps: \(\) => \{\n\s+guardPageTaps\(\);/);
  });

  it("the waking touch or key presses nothing beneath, and what it changed is kept in the browser's storage", () => {
    const controller = src('shell/screensaver-controller.ts');
    expect(controller).toMatch(/if \(screensaver\.touch\(Date\.now\(\)\)\) swallowWakingKey\(event, window\);/);
    expect(controller).toMatch(/if \(screensaver\.touch\(Date\.now\(\)\)\) swallowWakingPress\(event, window\);/);
    expect(controller).toMatch(/window\.addEventListener\('keydown', keyed, true\);/);
    expect(controller).toMatch(/window\.addEventListener\('pointerdown', pressed, true\);/);
    expect(controller).toMatch(/localStorage\.setItem\(RECORD_KEY, JSON\.stringify\(record\)\)/);
    expect(controller).toMatch(/readRecord\(localStorage\.getItem\(RECORD_KEY\)\)/);
  });
});

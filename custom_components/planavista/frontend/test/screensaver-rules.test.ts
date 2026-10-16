import { describe, expect, it } from 'vitest';
import {
  DARK_CHOICES, DARK_FADE_MS, DEFAULT_NIGHT, LIGHT_UP_MS, LIGHTNING_GAP_MS, PANEL_WAKE_EASE, PANEL_WAKE_MS, REST_SHADE, SETTLE_MS,
  shadeOf, skyStage, stageEase, entityChoices, holdOf, infoCorner, isNight, motionCandidate, motionReading, nextLightning,
  nightText, nightWindow, readRecord, screenAction, screenRestore, screensaverHere, seeMotion, showsAt, weatherScene,
} from '../src/core/screensaver';
import type { HouseholdView, Member } from '../src/core/household';

const person = (id: string, weeknight: string, weekend: string, hours: number): Member =>
  ({ id, name: id, color: '#000000', bedtime: { weeknight, weekend }, sleep_hours: hours }) as Member;

function view(fields: { shared?: boolean; enabled?: boolean; available?: boolean } = {}): HouseholdView {
  return {
    available: fields.available ?? true,
    members: [],
    account: { user_id: 'kitchen', name: 'Kitchen', is_admin: false, shared: fields.shared ?? true, kind: 'shared', member_id: null, parent_level: false },
    security: {
      shuffle_keypad: false, shared_screens: 1,
      screensaver: {
        enabled: fields.enabled ?? true, after_minutes: 5, night: null,
        screens: [{ user_id: 'kitchen', name: 'Kitchen', screen: 'light.planar', motion: null }],
      },
    },
    modules: {},
    setup: { completed: true, step: null },
  } as unknown as HouseholdView;
}

describe('the screensaver: where and when (milestone 11)', () => {
  it('runs only on a shared screen with the setting on', () => {
    expect(screensaverHere(view())?.mine?.screen).toBe('light.planar');
    expect(screensaverHere(view({ shared: false }))).toBeNull();
    expect(screensaverHere(view({ enabled: false }))).toBeNull();
    expect(screensaverHere(view({ available: false }))).toBeNull();
    expect(screensaverHere(null)).toBeNull();
  });

  it('comes on after the wait, and never while motion reads on', () => {
    expect(showsAt(1000, null, 5)).toBe(1000 + 5 * 60_000);
    expect(showsAt(1000, { on: true, since: 900 }, 5)).toBeNull();
    // Motion went off after the last touch: the wait starts then.
    expect(showsAt(1000, { on: false, since: 4000 }, 2)).toBe(4000 + 2 * 60_000);
    expect(showsAt(9000, { on: false, since: 4000 }, 2)).toBe(9000 + 2 * 60_000);
  });

  it("offers motion, occupancy, and presence sensors for Motion, not PlanaVista's own", () => {
    expect(motionCandidate('binary_sensor.kitchen_motion', { device_class: 'motion' })).toBe(true);
    expect(motionCandidate('binary_sensor.hall', { device_class: 'occupancy' })).toBe(true);
    expect(motionCandidate('binary_sensor.planar_presence', { device_class: 'presence' })).toBe(true);
    expect(motionCandidate('input_boolean.someone_here', {})).toBe(true);
    expect(motionCandidate('binary_sensor.casey_chores_done', {})).toBe(false);
    expect(motionCandidate('binary_sensor.front_door', { device_class: 'door' })).toBe(false);
  });

  it("reads motion changes on the page's own clock, whatever Home Assistant's says", () => {
    const ha = (ms: number) => new Date(ms - 600_000).toISOString(); // Home Assistant 10 minutes behind
    // A first reading of no motion (the page loading, the sensor back after a restart) starts nothing.
    const first = seeMotion(null, { state: 'off', last_changed: ha(1_000_000) }, 1_000_000);
    expect(first).toMatchObject({ on: false, at: 0 });
    expect(seeMotion(null, { state: 'on', last_changed: ha(1_000_000) }, 1_000_000)).toMatchObject({ on: true, at: 400_000 });
    expect(seeMotion(first, { state: 'off', last_changed: ha(1_000_000) }, 1_005_000)).toBe(first);
    expect(seeMotion(first, { state: 'on', last_changed: ha(1_010_000) }, 1_010_000)).toMatchObject({ on: true, at: 1_010_000 });
    expect(seeMotion(first, { state: 'unavailable' }, 1_020_000)).toBeNull();
    // A clock ahead of the screen's never puts a change in the future.
    expect(seeMotion(null, { state: 'on', last_changed: new Date(2_000_000).toISOString() }, 1_000_000)?.at).toBe(1_000_000);
  });

  it("offers Settings' picks by name, keeping a stored one Home Assistant doesn't list now", () => {
    const states = {
      'light.b': { entity_id: 'light.b', attributes: { friendly_name: 'Backlight' } },
      'light.a': { entity_id: 'light.a', attributes: { friendly_name: 'Attic' } },
      'sensor.x': { entity_id: 'sensor.x', attributes: { friendly_name: 'Hall' } },
    };
    const lights = (s: { entity_id: string }) => s.entity_id.startsWith('light.');
    expect(entityChoices(states, lights, null)).toEqual([{ id: 'light.a', name: 'Attic' }, { id: 'light.b', name: 'Backlight' }]);
    expect(entityChoices(states, lights, 'light.gone')[0]).toEqual({ id: 'light.gone', name: 'light.gone (not found)' });
    expect(entityChoices(states, lights, 'sensor.x')[0]).toEqual({ id: 'sensor.x', name: 'Hall' });
    expect(entityChoices(states, lights, 'light.b')).toHaveLength(2);
  });

  it('reads the stored record, and nothing else', () => {
    const hold = holdOf('light.planar', { state: 'on', attributes: { brightness: 230, friendly_name: 'Planar' } });
    expect(hold).toEqual({ entity: 'light.planar', before: { state: 'on', attributes: { brightness: 230 } } });
    const record = { showing: true, holds: [hold] };
    expect(readRecord(JSON.stringify(record))).toEqual(record);
    // Holds that can't be read are left out; anything else reads as nothing held.
    expect(readRecord(JSON.stringify({ showing: false, holds: [hold, { entity: 3 }, { entity: 'light.x', before: {} }] }))).toEqual({ showing: false, holds: [hold] });
    for (const raw of [null, '', '{', '[]', '{"showing":"yes"}']) expect(readRecord(raw), String(raw)).toEqual({ showing: false, holds: [] });
  });

  it('reads a motion entity, and treats an unavailable one as none', () => {
    expect(motionReading({ state: 'on', last_changed: '2026-10-15T08:00:00Z' })).toEqual({ on: true, since: Date.parse('2026-10-15T08:00:00Z') });
    expect(motionReading({ state: 'off' })).toEqual({ on: false, since: 0 });
    expect(motionReading({ state: 'unavailable' })).toBeNull();
    expect(motionReading(undefined)).toBeNull();
  });
});

describe('the screensaver: night (spec D3)', () => {
  const thursday = new Date(2026, 9, 15);
  const friday = new Date(2026, 9, 16);
  const family = [person('dana', '19:30', '20:30', 11), person('casey', '22:00', '23:30', 9), person('alex', '22:30', '23:00', 7.5)];

  it('runs from the latest bedtime to the earliest wake-up', () => {
    // Alex to bed last, at 10:30 PM, and up first, at 6:00 AM (7.5 hours).
    expect(nightWindow(family, null, thursday)).toEqual({ from: 22 * 60 + 30, to: 1440 + 6 * 60, source: 'sleep' });
    // Friday: weekend bedtimes. Casey to bed at 11:30 PM; Alex up at 6:30 AM.
    expect(nightWindow(family, null, friday)).toEqual({ from: 23 * 60 + 30, to: 1440 + 6 * 60 + 30, source: 'sleep' });
  });

  it('takes a bedtime after midnight as late, and its own times when set', () => {
    const owl = [person('casey', '00:30', '01:00', 8), person('alex', '22:30', '23:00', 7.5)];
    expect(nightWindow(owl, null, thursday)).toEqual({ from: 1440 + 30, to: 1440 + 6 * 60, source: 'sleep' });
    expect(nightWindow(family, { from: '21:00', to: '05:45' }, thursday)).toEqual({ from: 21 * 60, to: 1440 + 5 * 60 + 45, source: 'set' });
  });

  it('takes a bedtime without hours of sleep, ending at the usual morning without any', () => {
    const late = [person('alex', '23:30', '23:30', 0), person('dana', '19:30', '20:30', 10.5)];
    // Alex to bed last; Dana up first, at 6:00 AM.
    expect(nightWindow(late, null, thursday)).toEqual({ from: 23 * 60 + 30, to: 1440 + 6 * 60, source: 'sleep' });
    expect(nightWindow([person('alex', '23:30', '23:30', 0)], null, thursday)).toEqual({ from: 23 * 60 + 30, to: 1440 + 6 * 60 + 30, source: 'sleep' });
  });

  it("leaves out someone who sleeps by day (a night shift's morning bedtime)", () => {
    const shift = [...family, person('blair', '07:30', '07:30', 8)];
    expect(nightWindow(shift, null, thursday)).toEqual(nightWindow(family, null, thursday));
  });

  it('runs 10:00 PM to 6:30 AM when nobody has Sleep times', () => {
    expect(nightWindow([], null, thursday)).toEqual({ from: 22 * 60, to: 1440 + 6 * 60 + 30, source: 'default' });
    expect(DEFAULT_NIGHT).toEqual({ from: '22:00', to: '06:30' });
  });

  it('knows whether it is night, before and after midnight', () => {
    expect(isNight(new Date(2026, 9, 15, 22, 29), family, null)).toBe(false);
    expect(isNight(new Date(2026, 9, 15, 22, 30), family, null)).toBe(true);
    expect(isNight(new Date(2026, 9, 16, 3, 0), family, null)).toBe(true);
    expect(isNight(new Date(2026, 9, 16, 6, 0), family, null)).toBe(false);
  });

  it('says its times in words', () => {
    expect(nightText(nightWindow(family, null, thursday), '12h')).toBe('10:30 PM to 6:00 AM');
    expect(nightText(nightWindow(family, null, thursday), '24h')).toBe('22:30 to 06:00');
  });
});

describe('the screensaver: the Screen entity (spec 3.2)', () => {
  const on = (attributes: Record<string, unknown> = {}) => ({ state: 'on', attributes });

  const off = { state: 'off', attributes: {} };
  const light = (service: string, extra: Record<string, unknown> = {}) => ({ domain: 'light', service, data: { entity_id: 'light.planar', ...extra } });

  it('turns a light off in the dark and leaves it alone otherwise (0.13.0: the shade dims, not the light)', () => {
    const was = on({ brightness: 255 });
    expect(screenAction('light.planar', was)).toEqual(light('turn_off'));
    expect(screenAction('light.planar', off)).toBeNull();
    expect(screenAction('light.planar', on())).toEqual(light('turn_off'));
    expect(screenRestore('light.planar', on({ brightness: 200 }))).toEqual({ domain: 'light', service: 'turn_on', data: { entity_id: 'light.planar', brightness: 200 } });
    expect(screenRestore('light.planar', { state: 'off', attributes: {} })).toEqual({ domain: 'light', service: 'turn_off', data: { entity_id: 'light.planar' } });
  });

  it('turns a switch off in the dark', () => {
    expect(screenAction('input_boolean.planar', on())).toEqual({ domain: 'input_boolean', service: 'turn_off', data: { entity_id: 'input_boolean.planar' } });
    expect(screenAction('switch.planar', off)).toBeNull();
    expect(screenRestore('switch.planar', on())).toEqual({ domain: 'switch', service: 'turn_on', data: { entity_id: 'switch.planar' } });
  });

  it('sets a number to its minimum in the dark', () => {
    const level = { state: '80', attributes: { min: 10, max: 100, step: 5 } };
    expect(screenAction('input_number.planar', level)).toEqual({ domain: 'input_number', service: 'set_value', data: { entity_id: 'input_number.planar', value: 10 } });
    expect(screenAction('number.planar_brightness', { ...level, state: '10' })).toBeNull();
    expect(screenRestore('number.planar_brightness', level)).toEqual({ domain: 'number', service: 'set_value', data: { entity_id: 'number.planar_brightness', value: 80 } });
  });

  it('does nothing to an entity that is unavailable, or with nothing known to put back', () => {
    expect(screenAction('light.planar', { state: 'unavailable', attributes: {} })).toBeNull();
    expect(screenAction('light.planar', undefined)).toBeNull();
    expect(screenRestore('light.planar', undefined)).toBeNull();
  });
});

describe('the screensaver: weather, lightning, and the info (spec 3.3)', () => {
  it('gives every Home Assistant condition a sky', () => {
    for (const condition of ['clear-night', 'cloudy', 'exceptional', 'fog', 'hail', 'lightning', 'lightning-rainy', 'partlycloudy',
      'pouring', 'rainy', 'snowy', 'snowy-rainy', 'sunny', 'windy', 'windy-variant']) {
      const scene = weatherScene(condition);
      expect(scene.cover, condition).toBeGreaterThan(0);
      expect(scene.cover, condition).toBeLessThanOrEqual(1);
    }
    expect(weatherScene('lightning-rainy')).toMatchObject({ storm: true, rain: 150 });
    expect(weatherScene('fog').fog).toBe(1);
    // Wind in gusts since 0.12.0, as the approved mockup blew.
    expect(weatherScene('windy').wind).toBe(2.6);
    expect(weatherScene('who-knows')).toMatchObject({ cover: 0.35, rain: 0, storm: false });
  });

  it("takes the entity's cloud coverage, keeping rain under clouds", () => {
    expect(weatherScene('partlycloudy', 62).cover).toBeCloseTo(0.62);
    expect(weatherScene('rainy', 20).cover).toBe(0.6);
    expect(weatherScene('sunny', 'lots').cover).toBe(0.05);
  });

  it('never flashes lightning less than 9 seconds apart', () => {
    expect(LIGHTNING_GAP_MS).toBe(9000);
    expect(nextLightning(1000, 0)).toBe(10_000);
    expect(nextLightning(1000, 0.999)).toBeLessThan(1000 + 30_000);
  });

  it('moves the info to the next corner every 10 minutes', () => {
    expect(infoCorner(0)).toBe('bottom-left');
    expect(infoCorner(10 * 60_000)).toBe('top-left');
    expect(infoCorner(40 * 60_000)).toBe('bottom-left');
  });
});

describe('the sky wakes like a phone (0.13.0, spec D4 to D8)', () => {
  const MIN = 60_000;
  const quiet = 1_000_000;
  const still = { on: false, since: 0 };
  const settings = { after: 2, dark: 10 };
  const at = (minutes: number) => quiet + minutes * MIN;
  const stage = (now: number, motion: { on: boolean; since: number } | null = still, s = settings) =>
    skyStage(now, quiet, motion, s.after, s.dark);

  it('rests once the sky is up, goes dark after the dark wait, and is lit while someone is there', () => {
    expect(DARK_CHOICES).toEqual([0, 5, 10, 15, 30, 60]);
    expect(stage(at(2))).toBe('rest');
    expect(stage(at(11.9))).toBe('rest');
    // Dark counts from when the sky came on: 2 + 10 minutes after the quiet began.
    expect(stage(at(12))).toBe('dark');
    expect(stage(at(500))).toBe('dark');
    expect(stage(at(20), { on: true, since: at(19) })).toBe('lit');
  });

  it('counts the dark wait again from when motion clears', () => {
    const cleared = { on: false, since: at(20) };
    expect(stage(at(21), cleared)).toBe('rest');
    expect(stage(at(31.9), cleared)).toBe('rest');
    expect(stage(at(32), cleared)).toBe('dark');
  });

  it('stays lit without a motion sensor, since nothing could light it again', () => {
    expect(stage(at(2), null)).toBe('lit');
    expect(stage(at(12), null)).toBe('dark');
  });

  it('never goes dark with Dark after Never, and a missing setting is Never', () => {
    expect(stage(at(10_000), still, { after: 2, dark: 0 })).toBe('rest');
    expect(skyStage(at(10_000), quiet, still, 2, undefined)).toBe('rest');
  });

  it('a touch later than the motion counts from the touch', () => {
    expect(skyStage(at(3), at(2), { on: false, since: at(1) }, 2, 10)).toBe('rest');
    expect(skyStage(at(14), at(2), { on: false, since: at(1) }, 2, 10)).toBe('dark');
  });

  it('draws each stage with one shade', () => {
    expect(shadeOf('lit')).toBe(0);
    expect(shadeOf('rest')).toBe(REST_SHADE);
    expect(REST_SHADE).toBeGreaterThan(0.3);
    expect(REST_SHADE).toBeLessThan(0.6);
    expect(shadeOf('dark')).toBe(1);
  });

  it('eases quickly up, slowly down, and from a panel it turned off slowly enough to outlast its wake', () => {
    expect(stageEase(null, 'rest', false)).toEqual({ ms: 0, easing: 'linear' });
    expect(stageEase('rest', 'lit', false)).toEqual({ ms: LIGHT_UP_MS, easing: 'ease-out' });
    expect(stageEase('lit', 'rest', false)).toEqual({ ms: SETTLE_MS, easing: 'ease-in-out' });
    expect(stageEase('rest', 'dark', false)).toEqual({ ms: DARK_FADE_MS, easing: 'ease-in-out' });
    expect(stageEase('dark', 'lit', false)).toEqual({ ms: LIGHT_UP_MS, easing: 'ease-out' });
    expect(stageEase('dark', 'lit', true)).toEqual({ ms: PANEL_WAKE_MS, easing: PANEL_WAKE_EASE });
    // The kitchen's panel shows a picture about 4 s after it is turned on: most of the brightening comes after that.
    // Timed on the kitchen's Planar: a picture 3.5 to 5 s after turn_on; the end of the brightening still shows (review K2).
    expect(PANEL_WAKE_MS).toBe(6000);
    expect(stageEase('dark', 'rest', true)).toEqual({ ms: PANEL_WAKE_MS, easing: PANEL_WAKE_EASE });
    expect(LIGHT_UP_MS).toBeLessThan(1000);
    expect(SETTLE_MS).toBeGreaterThan(LIGHT_UP_MS);
  });
});

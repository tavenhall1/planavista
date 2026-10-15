import { describe, expect, it } from 'vitest';
import {
  DEFAULT_NIGHT, LIGHTNING_GAP_MS, infoCorner, isNight, motionReading, nextLightning, nightText, nightWindow,
  screenAction, screenRestore, screensaverHere, showsAt, weatherScene,
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

  it('dims a light by day, turns it off at night, and puts it back', () => {
    expect(screenAction('light.planar', 'day', on({ brightness: 255 }))).toEqual({ domain: 'light', service: 'turn_on', data: { entity_id: 'light.planar', brightness_pct: 40 } });
    expect(screenAction('light.planar', 'night', on())).toEqual({ domain: 'light', service: 'turn_off', data: { entity_id: 'light.planar' } });
    expect(screenAction('light.planar', 'day', { state: 'off', attributes: {} })).toBeNull();
    expect(screenRestore('light.planar', on({ brightness: 200 }))).toEqual({ domain: 'light', service: 'turn_on', data: { entity_id: 'light.planar', brightness: 200 } });
    expect(screenRestore('light.planar', { state: 'off', attributes: {} })).toEqual({ domain: 'light', service: 'turn_off', data: { entity_id: 'light.planar' } });
  });

  it('leaves a switch on by day and turns it off at night', () => {
    expect(screenAction('switch.planar', 'day', on())).toBeNull();
    expect(screenAction('input_boolean.planar', 'night', on())).toEqual({ domain: 'input_boolean', service: 'turn_off', data: { entity_id: 'input_boolean.planar' } });
    expect(screenRestore('switch.planar', on())).toEqual({ domain: 'switch', service: 'turn_on', data: { entity_id: 'switch.planar' } });
  });

  it('sets a number to 40% of its range by day and its minimum at night', () => {
    const level = { state: '80', attributes: { min: 10, max: 100, step: 5 } };
    expect(screenAction('number.planar_brightness', 'day', level)).toEqual({ domain: 'number', service: 'set_value', data: { entity_id: 'number.planar_brightness', value: 45 } });
    expect(screenAction('input_number.planar', 'night', level)).toEqual({ domain: 'input_number', service: 'set_value', data: { entity_id: 'input_number.planar', value: 10 } });
    expect(screenAction('number.planar_brightness', 'night', { ...level, state: '10' })).toBeNull();
    expect(screenRestore('number.planar_brightness', level)).toEqual({ domain: 'number', service: 'set_value', data: { entity_id: 'number.planar_brightness', value: 80 } });
  });

  it('does nothing to an entity that is unavailable', () => {
    expect(screenAction('light.planar', 'night', { state: 'unavailable', attributes: {} })).toBeNull();
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
    expect(weatherScene('windy').wind).toBe(2);
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

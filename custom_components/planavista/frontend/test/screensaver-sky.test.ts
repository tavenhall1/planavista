import { describe, expect, it } from 'vitest';
import type { WeatherScene } from '../src/core/screensaver';
import {
  DEFAULT_RISE, DEFAULT_SET, GREY, KEYS, Rgb, cloudPlan, fractal, hex, horizonAt, lightAt, minuteOfDay, mixRgb,
  moonPhase, nightLight, rng, shade, sunAt, sunPosition,
} from '../src/modules/screensaver/sky';

// The living sky's light rules (spec 3.3), checked against the approved mockup (v4).
const RISE = 430; // 7:10 AM
const SET = 1101; // 6:21 PM
const NIGHT = 1440 - (SET - RISE);

const scene = (over: Partial<WeatherScene> = {}): WeatherScene => ({ cover: 0, rain: 0, snow: 0, fog: 0, storm: false, wind: 1, ...over });
const CLEAR = scene();

/** The minute (today, after sunrise and before midday) or (tonight, after sunset) when the sun stands at `e` degrees. */
const minuteAt = (e: number): number =>
  e >= 0 ? RISE + (Math.asin(e / 38) / Math.PI) * (SET - RISE) : SET + (Math.asin(-e / 26) / Math.PI) * NIGHT;

const expectColor = (actual: Rgb, expected: string) => {
  const want = hex(expected);
  for (let j = 0; j < 3; j++) expect(actual[j]).toBeCloseTo(want[j], 6);
};
const brightness = (c: Rgb) => c[0] + c[1] + c[2];
const distance = (a: Rgb, b: Rgb) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

describe('sunAt', () => {
  it('rises at sunrise', () => {
    expect(sunAt(RISE, RISE, SET)).toEqual({ day: true, p: 0, e: 0 });
  });

  it('stands highest at midday, between sunrise and sunset', () => {
    const noon = sunAt(720, RISE, SET);
    expect(noon.day).toBe(true);
    expect(noon.p).toBeCloseTo((720 - RISE) / (SET - RISE), 9);
    expect(noon.e).toBeCloseTo(38 * Math.sin(Math.PI * noon.p), 9);
    expect(noon.e).toBeGreaterThan(37);
    expect(sunAt((RISE + SET) / 2, RISE, SET).e).toBeCloseTo(38, 9);
  });

  it('sets at sunset, and the night begins just after', () => {
    const set = sunAt(SET, RISE, SET);
    expect(set.day).toBe(true);
    expect(set.p).toBe(1);
    expect(set.e).toBeCloseTo(0, 9);
    const after = sunAt(SET + 1, RISE, SET);
    expect(after.day).toBe(false);
    expect(after.p).toBeCloseTo(1 / NIGHT, 9);
  });

  it('is well below at midnight, on the night from sunset to the next sunrise', () => {
    const midnight = sunAt(0, RISE, SET);
    expect(midnight.day).toBe(false);
    expect(midnight.p).toBeCloseTo((1440 - SET) / NIGHT, 9);
    expect(midnight.e).toBeCloseTo(-26 * Math.sin(Math.PI * midnight.p), 9);
    expect(midnight.e).toBeLessThan(-25);
    // The night's middle is its lowest, and 24:00 is midnight again.
    expect(sunAt(SET + NIGHT / 2, RISE, SET).e).toBeCloseTo(-26, 9);
    expect(sunAt(1440, RISE, SET)).toEqual(midnight);
  });

  it('uses 7:00 AM and 7:00 PM when the day it is given makes no sense', () => {
    expect(sunAt(600, NaN, NaN)).toEqual(sunAt(600, DEFAULT_RISE, DEFAULT_SET));
    expect(sunAt(600, 900, 800)).toEqual(sunAt(600, 420, 1140));
  });
});

describe('lightAt', () => {
  // The mockup's KEYS, as it wrote them.
  const MOCKUP = [
    { e: -18, sky: ['#0a1322', '#122038', '#1b2b48'], glow: ['#3a4673', 0.10], far: '#33435f', near: '#0e1828', pine: '#0b1520', snow: '#3e4d6a', cloud: '#2b3956', sun: '#f2e8d4' },
    { e: -6, sky: ['#25355c', '#5b5f8d', '#c99ba0'], glow: ['#f2a688', 0.42], far: '#8a88ab', near: '#2a395a', pine: '#22304a', snow: '#cac6dc', cloud: '#a096ba', sun: '#ffc39a' },
    { e: 0, sky: ['#6e8ec0', '#c4a7c3', '#f9c49b'], glow: ['#ffae78', 0.85], far: '#cbb9cd', near: '#385d6c', pine: '#2c4a46', snow: '#f6e7e4', cloud: '#f5d3c6', sun: '#ffcd9b' },
    { e: 8, sky: ['#8db5e0', '#cedbee', '#fbe2c4'], glow: ['#ffd8a6', 0.6], far: '#c4d7e1', near: '#30686c', pine: '#2d5446', snow: '#fcf8f3', cloud: '#fffaf2', sun: '#fff0d2' },
    { e: 25, sky: ['#a7cdef', '#d6e8f8', '#fdf6ee'], glow: ['#fff0d4', 0.34], far: '#c9dee8', near: '#2c676b', pine: '#2f5d4a', snow: '#ffffff', cloud: '#ffffff', sun: '#fff7e6' },
  ] as const;

  it('keeps the mockup key table', () => {
    expect(KEYS.map(k => k.e)).toEqual(MOCKUP.map(k => k.e));
  });

  // Midnight sits past -18 and midday past 25, so they read the end keys.
  it.each([
    ['-18 (midnight)', 0, 0],
    ['-6', minuteAt(-6), 1],
    ['0 (sunrise)', RISE, 2],
    ['8', minuteAt(8), 3],
    ['25 (midday)', 720, 4],
  ])('gives the key colors at %s degrees with no cloud', (_name, minute, index) => {
    const key = MOCKUP[index];
    const light = lightAt(minute, CLEAR, RISE, SET);
    expect(light.e).toBeCloseTo(key.e, 6);
    light.sky.forEach((c, j) => expectColor(c, key.sky[j]));
    expectColor(light.glow[0], key.glow[0]);
    expect(light.glow[1]).toBeCloseTo(key.glow[1], 6);
    expectColor(light.far, key.far);
    expectColor(light.near, key.near);
    expectColor(light.pine, key.pine);
    expectColor(light.snow, key.snow);
    expectColor(light.cloud, key.cloud);
    expectColor(light.sunColor, key.sun);
  });

  it('mixes between keys, smoothly', () => {
    const light = lightAt(minuteAt(4), CLEAR, RISE, SET);
    const near = brightness(light.sky[0]);
    expect(near).toBeGreaterThan(brightness(hex('#6e8ec0')));
    expect(near).toBeLessThan(brightness(hex('#8db5e0')));
  });

  it('greys toward the storm palette in a storm', () => {
    const storm = lightAt(720, scene({ cover: 1, storm: true, rain: 150 }), RISE, SET);
    const overcast = lightAt(720, scene({ cover: 1 }), RISE, SET);
    const clear = lightAt(720, CLEAR, RISE, SET);
    storm.sky.forEach((c, j) => {
      // In daylight the storm's grey goes in at 95% of the cover.
      const want = mixRgb(clear.sky[j], GREY.storm[j], 0.95);
      for (let i = 0; i < 3; i++) expect(c[i]).toBeCloseTo(want[i], 6);
      expect(distance(c, GREY.storm[j])).toBeLessThan(distance(overcast.sky[j], GREY.storm[j]));
      expect(distance(c, GREY.storm[j])).toBeLessThan(distance(clear.sky[j], GREY.storm[j]));
    });
    expect(storm.cloud).toEqual(GREY.stormCloud);
    expect(storm.glow[1]).toBe(0);
    expect(brightness(storm.far)).toBeLessThan(brightness(clear.far));
  });

  it('darkens the storm palette after dark', () => {
    const night = lightAt(0, scene({ cover: 1, storm: true }), RISE, SET);
    const want = mixRgb(KEYS[0].sky[0], shade(GREY.storm[0], -0.78), 0.95);
    for (let i = 0; i < 3; i++) expect(night.sky[0][i]).toBeCloseTo(want[i], 6);
  });

  it('greys clouds for rain, and lightens the ranges for snow', () => {
    const rain = lightAt(720, scene({ cover: 1, rain: 70 }), RISE, SET);
    expect(distance(rain.cloud, GREY.rain)).toBeLessThan(distance(lightAt(720, scene({ cover: 1 }), RISE, SET).cloud, GREY.rain));
    const snow = lightAt(720, scene({ cover: 0.8, snow: 90 }), RISE, SET);
    const cloudy = lightAt(720, scene({ cover: 0.8 }), RISE, SET);
    expect(brightness(snow.far)).toBeGreaterThan(brightness(cloudy.far));
  });

  it('shows stars only at night, and fewer through cloud', () => {
    expect(lightAt(720, CLEAR, RISE, SET).stars).toBe(0);
    expect(lightAt(RISE, CLEAR, RISE, SET).stars).toBe(0);
    expect(lightAt(0, CLEAR, RISE, SET).stars).toBe(1);
    const some = lightAt(0, scene({ cover: 0.35 }), RISE, SET).stars;
    expect(some).toBeCloseTo(1 - 0.35 * 1.4, 9);
    expect(lightAt(0, scene({ cover: 0.8 }), RISE, SET).stars).toBe(0);
  });

  it('carries the fog', () => {
    expect(lightAt(600, scene({ fog: 1 }), RISE, SET).fog).toBe(1);
    expect(lightAt(600, CLEAR, RISE, SET).fog).toBe(0);
  });
});

describe('nightLight', () => {
  it('is the same light, darker overall, with the stars kept', () => {
    const light = lightAt(1350, CLEAR, RISE, SET);
    const night = nightLight(light);
    night.sky.forEach((c, j) => expect(brightness(c)).toBeLessThan(brightness(light.sky[j])));
    for (const part of ['far', 'near', 'pine', 'snow', 'cloud', 'sunColor'] as const) {
      expect(brightness(night[part])).toBeLessThan(brightness(light[part]));
    }
    expect(night.glow[1]).toBeLessThan(light.glow[1]);
    expect(night.stars).toBe(light.stars);
    expect(night.sun).toEqual(light.sun);
  });
});

describe('sunPosition', () => {
  const W = 1920;
  const H = 1080;
  const horizon = horizonAt(W, H);

  it('rises a tenth of the way across, arcs to a tenth of the height, and sets at nine tenths', () => {
    expect(horizon).toBeCloseTo(H * 0.47, 9);
    const band = H - horizon;
    const rise = sunPosition(RISE, RISE, SET, W, H, horizon);
    expect(rise.x).toBeCloseTo(W * 0.1, 9);
    expect(rise.y).toBeCloseTo(horizon + band * 0.12, 9);
    const top = sunPosition((RISE + SET) / 2, RISE, SET, W, H, horizon);
    expect(top.x).toBeCloseTo(W / 2, 9);
    expect(top.y).toBeCloseTo(H * 0.1 + band * 0.12, 9);
    expect(sunPosition(SET, RISE, SET, W, H, horizon).x).toBeCloseTo(W * 0.9, 9);
  });

  it('puts the horizon lower on a tall screen', () => {
    expect(horizonAt(1080, 1920)).toBeCloseTo(1920 * 0.58, 9);
  });
});

describe('moonPhase', () => {
  // Circular distance: 0.99 is as near to new as 0.01.
  const from = (p: number, target: number) => Math.min(Math.abs(p - target), 1 - Math.abs(p - target));

  it('is near new on 2024-01-11 and near full on 2024-01-25', () => {
    expect(from(moonPhase(new Date(2024, 0, 11, 12)), 0)).toBeLessThan(0.03);
    expect(from(moonPhase(new Date(2024, 0, 25, 12)), 0.5)).toBeLessThan(0.03);
  });

  it('runs from 0 up to 1 and comes round once a lunar month', () => {
    const p = moonPhase(new Date(2026, 9, 15));
    expect(p).toBeGreaterThanOrEqual(0);
    expect(p).toBeLessThan(1);
    const later = moonPhase(new Date(new Date(2026, 9, 15).getTime() + 29.530588853 * 86_400_000));
    expect(later).toBeCloseTo(p, 6);
    expect(moonPhase(new Date(1990, 0, 1))).toBeGreaterThanOrEqual(0);
  });
});

describe('fractal and rng', () => {
  it('gives the same numbers for the same seed', () => {
    const a = rng(211);
    const b = rng(211);
    const draws = Array.from({ length: 5 }, () => [a(), b()]);
    for (const [x, y] of draws) expect(x).toBe(y);
    expect(rng(212)()).not.toBe(rng(211)());
  });

  it('draws the same ridge for a seed, scaled so the largest is 1', () => {
    const one = fractal(rng(211), 513, 0.56);
    const two = fractal(rng(211), 513, 0.56);
    expect(Array.from(one)).toEqual(Array.from(two));
    expect(Math.max(...Array.from(one, Math.abs))).toBeCloseTo(1, 6);
    expect(Array.from(fractal(rng(242), 513, 0.56))).not.toEqual(Array.from(one));
  });
});

describe('cloudPlan', () => {
  it('lays out the mockup presets with their own seeds', () => {
    // 55 + the cover in twentieths + the preset's place in the mockup's list (clear, partly, cloudy, fog, rain, storm, snow) times 7.
    expect(cloudPlan(scene({ cover: 0.35 })).seed).toBe(55 + 7 + 7);
    expect(cloudPlan(scene({ cover: 0.8 })).seed).toBe(55 + 16 + 14);
    expect(cloudPlan(scene({ cover: 0.95, rain: 150, storm: true })).seed).toBe(55 + 19 + 35);
  });

  it('brings more clouds as the cover grows, towers in a storm, and fog in the valleys', () => {
    const few = cloudPlan(scene({ cover: 0.05 }));
    const many = cloudPlan(scene({ cover: 0.8 }));
    expect(few.high + few.low + few.more).toBeLessThan(many.high + many.low + many.more);
    expect(many.more).toBe(2);
    expect(cloudPlan(scene({ cover: 0.95, storm: true })).towers).toBe(2);
    expect(few.towers).toBe(0);
    expect(cloudPlan(scene({ cover: 0.55, fog: 1 })).fog).toEqual([2, 2, 1]);
    expect(cloudPlan(scene({ cover: 0.85, rain: 70, fog: 0.4 })).fog).toEqual([1, 0, 0]);
    expect(few.fog).toEqual([0, 0, 0]);
  });
});

describe('minuteOfDay', () => {
  it('counts seconds too', () => {
    expect(minuteOfDay(new Date(2026, 9, 15, 6, 30, 30))).toBeCloseTo(390.5, 9);
  });
});

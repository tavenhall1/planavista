import { describe, expect, it } from 'vitest';
import {
  ENTRANCE, ENTRANCE_PACE, LIFE, RAINBOW_MS, RAIN_CONDITIONS, cloudPlan, dimLight, gustAt, hex, lightAt, moonPixels,
  rainbowStrength, rainbowWeather, seasonAt, seasonGround, snowFor, springEase, swayAt,
} from '../src/modules/screensaver/sky';
import { trialTime, weatherScene } from '../src/core/screensaver';

/** The living sky of 0.12.0 (mockup v15): the rules the scene draws from. */
describe('calm-day life', () => {
  it('keeps three puffs in a clear sky, and the sway grows far to near', () => {
    const clear = weatherScene('sunny');
    expect(cloudPlan(clear).high).toBe(0);
    expect(cloudPlan(clear, true).high).toBe(LIFE.puffs);
    expect(cloudPlan(weatherScene('cloudy'), true).high).toBe(3);
    const near = swayAt(30, 3, 4, true);
    const far = swayAt(30, 0, 4, true);
    expect(Math.abs(near.x)).toBeLessThanOrEqual(28);
    expect(Math.abs(far.x)).toBeLessThanOrEqual(6);
    // Without life, the gentle sway of 0.11.
    expect(Math.abs(swayAt(30, 3, 4, false).x)).toBeLessThanOrEqual(14);
  });

  it('blows in gusts only when windy', () => {
    expect(gustAt(10, 1)).toBe(1);
    const gusts = Array.from({ length: 200 }, (_, i) => gustAt(i * 0.3, 2.6));
    expect(Math.min(...gusts)).toBeGreaterThan(1);
    expect(Math.max(...gusts)).toBeLessThanOrEqual(2.6);
    expect(Math.max(...gusts) - Math.min(...gusts)).toBeGreaterThan(0.4);
    expect(weatherScene('windy').wind).toBe(2.6);
  });
});

describe('seasons on the land', () => {
  it('follows the month, six months on south of the equator', () => {
    expect(seasonAt(new Date(2026, 9, 14), 41.8)).toBe('autumn');
    expect(seasonAt(new Date(2026, 9, 14), -33.9)).toBe('spring');
    expect(seasonAt(new Date(2026, 0, 10), null)).toBe('winter');
    expect(seasonAt(new Date(2026, 6, 4), -33.9)).toBe('winter');
  });

  it('lays more snow in winter, and colors the near ground by season', () => {
    expect(snowFor(0.5, 1, 'summer')).toBe(0.5);
    expect(snowFor(0.5, 1, 'winter')).toBeCloseTo(0.725, 6);
    expect(snowFor(undefined, 3, 'winter')).toBe(0.24);
    expect(snowFor(undefined, 4, 'winter')).toBe(0);
    const light = lightAt(14 * 60, weatherScene('sunny'), 7 * 60, 19 * 60);
    const ground = hex('#6f8f5e');
    expect(seasonGround(ground, 1, light, 'autumn')).toEqual(ground);
    const autumn = seasonGround(ground, 5, light, 'autumn');
    const winter = seasonGround(ground, 5, light, 'winter');
    expect(autumn).not.toEqual(ground);
    expect(winter[0]).toBeGreaterThan(autumn[0]);
  });
});

describe('a rainbow after rain', () => {
  it('comes in, holds, and goes over about twenty minutes', () => {
    expect(rainbowStrength(-1)).toBe(0);
    expect(rainbowStrength(0)).toBe(0);
    expect(rainbowStrength(RAINBOW_MS * 0.06)).toBeGreaterThan(0);
    expect(rainbowStrength(RAINBOW_MS * 0.5)).toBe(1);
    expect(rainbowStrength(RAINBOW_MS * 0.95)).toBeLessThan(0.5);
    expect(rainbowStrength(RAINBOW_MS)).toBe(0);
  });

  it('needs the rain gone and some sky', () => {
    expect(RAIN_CONDITIONS.has('pouring')).toBe(true);
    expect(rainbowWeather(weatherScene('partlycloudy'))).toBe(true);
    expect(rainbowWeather(weatherScene('rainy'))).toBe(false);
    expect(rainbowWeather(weatherScene('cloudy'))).toBe(false);
  });
});

describe('the moon as one sphere (the owner, v10 to v13)', () => {
  const light = hex('#fff1d6');
  const dark = hex('#28324a');
  const lit = (px: Uint8ClampedArray) => {
    let n = 0;
    let bright = 0;
    for (let i = 0; i < px.length; i += 4) if (px[i + 3] > 250) { n++; if (px[i] > 200) bright++; }
    return bright / n;
  };
  it('is dark at new moon, half lit at a quarter, and lit at full', () => {
    expect(lit(moonPixels(40, 0, light, dark))).toBe(0);
    expect(lit(moonPixels(40, 0.25, light, dark))).toBeGreaterThan(0.35);
    expect(lit(moonPixels(40, 0.25, light, dark))).toBeLessThan(0.6);
    expect(lit(moonPixels(40, 0.5, light, dark))).toBeGreaterThan(0.95);
  });

  it('lights the right side while waxing and the left while waning, with a solid disc and a soft rim', () => {
    const waxing = moonPixels(40, 0.25, light, dark);
    const waning = moonPixels(40, 0.75, light, dark);
    const at = (px: Uint8ClampedArray, x: number, y: number) => px[(y * 40 + x) * 4];
    expect(at(waxing, 34, 20)).toBeGreaterThan(at(waxing, 6, 20));
    expect(at(waning, 6, 20)).toBeGreaterThan(at(waning, 34, 20));
    // Solid inside, nothing outside the disc.
    expect(waxing[(20 * 40 + 20) * 4 + 3]).toBe(255);
    expect(waxing[3]).toBe(0);
  });
});

describe('the entrance', () => {
  it('runs about four and a half seconds, with a rainbow that is out coming last', () => {
    const ends = Object.values(ENTRANCE).map(part => (part.delay + ('step' in part ? part.step * 3 : 0) + part.duration) * ENTRANCE_PACE);
    expect(Math.max(...ends)).toBeLessThan(5500);
    const rainbowStart = ENTRANCE.rainbow.delay;
    for (const [name, part] of Object.entries(ENTRANCE)) if (name !== 'rainbow') expect(part.delay, name).toBeLessThan(rainbowStart);
  });

  it('draws springs as CSS linear() points that end at 1', () => {
    const ease = springEase(170, 17, 1100);
    expect(ease.startsWith('linear(0.0000')).toBe(true);
    expect(ease.endsWith(', 1.0000)')).toBe(true);
  });
});

describe("Try it's times", () => {
  it("follow the home's own sun: an hour after sunrise, two thirds to sunset, sunset, the middle of the night", () => {
    const now = new Date(2026, 9, 14, 10, 37);
    const at = (time: 'morning' | 'afternoon' | 'evening' | 'night', rise = 420, set = 1140) => trialTime(now, time, rise, set);
    expect(at('morning')).toEqual(new Date(2026, 9, 14, 8, 0));
    expect(at('afternoon')).toEqual(new Date(2026, 9, 14, 15, 10));
    expect(at('evening')).toEqual(new Date(2026, 9, 14, 19, 0));
    expect(at('night')).toEqual(new Date(2026, 9, 14, 1, 0));
    // A home whose sun runs on another clock (sunrise 12:42 AM, sunset 12:48 PM here) still gets day in the afternoon.
    const afternoon = at('afternoon', 42, 768);
    expect(afternoon.getHours() * 60 + afternoon.getMinutes()).toBeGreaterThan(42);
    expect(afternoon.getHours() * 60 + afternoon.getMinutes()).toBeLessThan(768);
  });

  it('come from Settings as picks, Now leaving that part as it is', async () => {
    const { trialOf } = await import('../src/shell/settings/screens-page');
    expect(trialOf('now', 'now', 'now')).toBeNull();
    expect(trialOf('night', 'snowy', 'winter')).toEqual({ time: 'night', weather: 'snowy', season: 'winter' });
    expect(trialOf('now', 'after_rain', 'now')).toEqual({ weather: 'after_rain' });
  });
});

describe('the screensaver on a dimmed screen', () => {
  it('draws every color of its light at the level, the sun and moon by the text rule', () => {
    const light = lightAt(14 * 60, weatherScene('sunny'), 7 * 60, 19 * 60);
    expect(dimLight(light, 1)).toBe(light);
    const dim = dimLight(light, 0.3);
    expect(dim.sky[0][0]).toBeLessThan(light.sky[0][0]);
    expect(dim.near[1]).toBeLessThan(light.near[1]);
    // The text rule dims less: the sun keeps more of its brightness than the sky does.
    expect(dim.sunColor[0] / light.sunColor[0]).toBeGreaterThan(dim.sky[2][0] / light.sky[2][0]);
  });
});

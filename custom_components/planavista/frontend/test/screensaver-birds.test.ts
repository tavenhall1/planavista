import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { FLOCKS, LIFE, flockPlan, rng } from '../src/modules/screensaver/sky';

// 0.13.3 (the owner): "the reason the birds were believable is because no matter where you are sitting,
// there could still be some birds that are flying close to you." They came every 3 to 6 minutes, always
// far off behind the land, so a flock was in view about a tenth of the time and easy to never see.
describe('paper birds, far and close', () => {
  const plans = (n: number, windy = false) => {
    const random = rng(1013);
    return Array.from({ length: n }, () => flockPlan(windy, random));
  };

  it('come every one to two minutes by day, the first soon after the sky comes in', () => {
    expect(LIFE.flockEveryMs).toEqual([60_000, 120_000]);
    expect(LIFE.firstFlockMs).toEqual([10_000, 30_000]);
  });

  it('about one flock in three flies close', () => {
    const all = plans(3000);
    const share = all.filter(p => p.near).length / all.length;
    expect(share).toBeGreaterThan(0.3);
    expect(share).toBeLessThan(0.37);
  });

  it('a close flock is bigger, lower, quicker across, and smaller in number', () => {
    expect(FLOCKS.near.size).toBeGreaterThanOrEqual(2 * FLOCKS.far.size);
    expect(FLOCKS.near.y[0]).toBeGreaterThan(FLOCKS.far.y[0]);
    expect(FLOCKS.near.y[1]).toBeGreaterThan(FLOCKS.far.y[1]);
    // The kitchen (1920 by 1080): with the info in the top corners, the Today card ends at 372 px (0.344) and
    // far flocks pass behind it and the clock. A close flock's leader flies below that, and its whole V stays
    // above a bottom corner's card (it starts near 0.66): the lowest bird is about 78 px under the leader.
    expect(FLOCKS.near.y[0]).toBeGreaterThanOrEqual(0.36);
    expect(FLOCKS.near.y[1] * 1080 + 78).toBeLessThan(0.62 * 1080);
    // Close things cross the view quicker: parallax is what tells the eye they're close, not just big.
    expect(FLOCKS.near.crossS[1]).toBeLessThan(FLOCKS.far.crossS[0]);
    expect(FLOCKS.near.count[1]).toBeLessThanOrEqual(FLOCKS.far.count[0]);
    for (const p of plans(400)) {
      const k = p.near ? FLOCKS.near : FLOCKS.far;
      expect(p.size).toBe(k.size);
      expect(p.birds.length).toBeGreaterThanOrEqual(k.count[0]);
      expect(p.birds.length).toBeLessThanOrEqual(k.count[1]);
      expect(p.y).toBeGreaterThanOrEqual(k.y[0]);
      expect(p.y).toBeLessThanOrEqual(k.y[1]);
      expect(p.crossS).toBeGreaterThanOrEqual(k.crossS[0]);
      expect(p.crossS).toBeLessThanOrEqual(k.crossS[1]);
    }
  });

  it('keeps its loose V, spaced by the birds\' size, the leader in front', () => {
    const near = plans(200).find(p => p.near && p.birds.length >= 3);
    const far = plans(200).find(p => !p.near && p.birds.length >= 3);
    for (const p of [near, far]) {
      expect(p).toBeDefined();
      const [lead, a, b] = p!.birds;
      expect(lead.dx).toBe(0);
      expect(a.dx).toBe(-46 * p!.size * p!.dir);
      expect(b.dx).toBe(-46 * p!.size * p!.dir);
      expect(Math.sign(a.dy)).not.toBe(Math.sign(b.dy));
      expect(Math.abs(a.dy)).toBeLessThanOrEqual((16 + 5) * p!.size);
    }
  });

  it('flies with the wind when it blows, either way when calm', () => {
    expect(plans(100, true).every(p => p.dir === 1)).toBe(true);
    const calm = plans(200);
    expect(calm.some(p => p.dir === 1) && calm.some(p => p.dir === -1)).toBe(true);
  });

  it('the scene flies a close flock in front of the near hill, drawn sharp at its size', () => {
    const source = readFileSync(new URL('../src/modules/screensaver/sky-scene.ts', import.meta.url), 'utf8');
    expect(source).toMatch(/r3, this\._nearBirds,/);
    expect(source).toMatch(/flockPlan\(/);
    expect(source).toMatch(/plan\.near \? this\._nearBirds : this\._birds/);
    expect(source).toMatch(/this\._birdCanvas\(plan\.size\)/);
    expect(source).toMatch(/between\(LIFE\.firstFlockMs\)/);
  });
});

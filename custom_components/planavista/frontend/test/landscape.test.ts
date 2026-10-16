import { describe, expect, it } from 'vitest';
import { ridgeGeometry, type SheetGeometry } from '../src/modules/screensaver/sky-scene';
import { APPROVED_LANDSCAPE, SECOND_SEEDS, TOP_SEEDS, pickLandscape, rng } from '../src/modules/screensaver/sky';

/** One number for a sheet's cut edge and trees, so a change anywhere shows. */
function print(sheet: SheetGeometry): number {
  let sum = 0;
  sheet.edge.forEach(([x, y], i) => { sum += (x * 3 + y * 7) * ((i % 13) + 1); });
  sheet.pines.forEach((p, i) => { sum += (p.x + p.y * 5 + p.h * 11 + (p.leafy ? 17 : 0)) * ((i % 7) + 1); });
  return Math.round(sum);
}

describe('the landscape (0.13.0)', () => {
  it("keeps the approved land when given the approved seeds, as it was before seeds came in", () => {
    const before = ridgeGeometry(1920, 1080, 'summer').sheets.map(print);
    const given = ridgeGeometry(1920, 1080, 'summer', APPROVED_LANDSCAPE).sheets.map(print);
    expect(given).toEqual(before);
    // Pinned from 0.12.0's drawing, so the approved mockup's shapes can't drift.
    expect(before).toEqual(APPROVED_PRINTS);
  });

  it("changes only the sheet whose seed changed", () => {
    const shapes = [...APPROVED_LANDSCAPE.shapes];
    shapes[2] = 99_001;
    const before = ridgeGeometry(1920, 1080, 'summer').sheets.map(print);
    const after = ridgeGeometry(1920, 1080, 'summer', { ...APPROVED_LANDSCAPE, shapes }).sheets.map(print);
    after.forEach((p, d) => (d === 2 ? expect(p).not.toBe(before[d]) : expect(p).toBe(before[d])));
  });

  it("keeps the tallest peak where the light sits whatever the seed", () => {
    for (let k = 0; k < 20; k++) {
      const r = rng(500 + k);
      const shapes = APPROVED_LANDSCAPE.shapes.map(() => Math.floor(r() * 1e6));
      const hero = ridgeGeometry(1920, 1080, 'summer', { ...APPROVED_LANDSCAPE, shapes }).sheets[1];
      const top = hero.apexes.reduce((a, b) => (b.y < a.y ? b : a));
      // The hero stands at 0.57 of the drawn width (the screen plus both margins).
      expect(Math.abs(top.x - (1920 + 112) * 0.57)).toBeLessThan(1920 * 0.06);
    }
  });

  it("moves the trees only with their own seed", () => {
    const trees = [...APPROVED_LANDSCAPE.trees];
    trees[4] = 12_345;
    const a = ridgeGeometry(1920, 1080, 'summer').sheets[4];
    const b = ridgeGeometry(1920, 1080, 'summer', { ...APPROVED_LANDSCAPE, trees }).sheets[4];
    expect(b.edge).toEqual(a.edge);
    expect(b.pines.map(p => [p.x, p.y])).toEqual(a.pines.map(p => [p.x, p.y]));
    expect(b.pines.map(p => p.leafy)).not.toEqual(a.pines.map(p => p.leafy));
  });

  it("picks the snowy ranges from the owner's lists and everything else at random", () => {
    expect(TOP_SEEDS).toEqual([242, 595380, 557009, 614891, 264828, 39358, 60862]);
    expect(SECOND_SEEDS).toEqual([273, 348899, 712769, 239700, 623634, 300407, 235294, 680635, 145242, 185318]);
    // Today's ranges are among them.
    expect(TOP_SEEDS[0]).toBe(APPROVED_LANDSCAPE.shapes[1]);
    expect(SECOND_SEEDS[0]).toBe(APPROVED_LANDSCAPE.shapes[2]);
    const seen = { top: new Set<number>(), second: new Set<number>(), far: new Set<number>() };
    for (let k = 0; k < 400; k++) {
      const land = pickLandscape(rng(k + 1));
      expect(land.shapes).toHaveLength(6);
      expect(land.trees).toHaveLength(6);
      expect(TOP_SEEDS).toContain(land.shapes[1]);
      expect(SECOND_SEEDS).toContain(land.shapes[2]);
      for (const n of [...land.shapes, ...land.trees]) expect(Number.isInteger(n) && n >= 0).toBe(true);
      seen.top.add(land.shapes[1]);
      seen.second.add(land.shapes[2]);
      seen.far.add(land.shapes[0]);
    }
    // Every pick comes up, and the random sheets vary.
    expect(seen.top.size).toBe(TOP_SEEDS.length);
    expect(seen.second.size).toBe(SECOND_SEEDS.length);
    expect(seen.far.size).toBeGreaterThan(300);
  });

  it("a random of exactly 1 still picks from the lists (Math.random never gives it, but a fake might)", () => {
    const land = pickLandscape(() => 0.999_999_999);
    expect(land.shapes[1]).toBe(TOP_SEEDS[TOP_SEEDS.length - 1]);
    expect(pickLandscape(() => 1).shapes[2]).toBe(SECOND_SEEDS[SECOND_SEEDS.length - 1]);
  });
});

const APPROVED_PRINTS = [15768499, 14562416, 17389904, 19976941, 22690787, 26901080];

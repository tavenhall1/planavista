import { describe, expect, it } from 'vitest';
import { ridgeGeometry, type SheetGeometry } from '../src/modules/screensaver/sky-scene';
import { APPROVED_LANDSCAPE, SECOND_SEEDS, TOP_SEEDS, horizonAt, pickLandscape, rng } from '../src/modules/screensaver/sky';

/** One number for a sheet's cut edge and trees, so a change anywhere shows. */
function print(sheet: SheetGeometry): number {
  let sum = 0;
  sheet.edge.forEach(([x, y], i) => { sum += (x * 3 + y * 7) * ((i % 13) + 1); });
  sheet.pines.forEach((p, i) => { sum += (p.x + p.y * 5 + p.h * 11 + (p.leafy ? 17 : 0)) * ((i % 7) + 1); });
  return Math.round(sum);
}

describe('the landscape (0.13.0)', () => {
  it("keeps the approved land when given the approved seeds, as the Mountain Picker drew it", () => {
    const before = ridgeGeometry(1048, 590, 'summer').sheets.map(print);
    const given = ridgeGeometry(1048, 590, 'summer', APPROVED_LANDSCAPE).sheets.map(print);
    expect(given).toEqual(before);
    // Pinned from the picker's stage (1048 wide), where the owner chose the ranges, so they can't drift.
    expect(before).toEqual(PICKER_PRINTS);
  });

  it("draws every curated range exactly as the owner saw it in the Mountain Picker (review m13 I3)", () => {
    const edge = (sheet: SheetGeometry) => {
      let sum = 0;
      sheet.edge.forEach(([x, y], i) => { sum += (x * 3 + y * 7) * ((i % 13) + 1); });
      return Math.round(sum);
    };
    const at = (shapes: number[]) => ridgeGeometry(1048, 590, 'summer', { ...APPROVED_LANDSCAPE, shapes }).sheets;
    expect(TOP_SEEDS.map(s => edge(at([211, s, 273, 304, 335, 366])[1]))).toEqual(PICKER_TOP);
    expect(SECOND_SEEDS.map(s => edge(at([211, 242, s, 304, 335, 366])[2]))).toEqual(PICKER_SECOND);
  });

  it("gives each curated range the same peaks on every wide screen, the kitchen's 1920 and a phone on its side (review m13 I3)", () => {
    // A tall screen draws its turned screen's land (tested below), so it has these peaks too.
    const peaks = (W: number, H: number, d: 1 | 2, seed: number) => {
      const shapes = [...APPROVED_LANDSCAPE.shapes];
      shapes[d] = seed;
      const sheet = ridgeGeometry(W, H, 'summer', { ...APPROVED_LANDSCAPE, shapes }).sheets[d];
      const width = W + 112;
      const span = sheet.bottom - sheet.top;
      return sheet.apexes.map(a => [a.x / width, (sheet.bottom - a.y) / span]);
    };
    for (const [d, seeds] of [[1, TOP_SEEDS], [2, SECOND_SEEDS]] as const) {
      for (const seed of seeds) {
        const picker = peaks(1048, 590, d, seed);
        for (const [W, H] of [[1920, 1080], [956, 440], [3840, 2160]]) {
          const here = peaks(W, H, d, seed);
          expect(here.length, `${seed} at ${W}`).toBe(picker.length);
          here.forEach(([x, h], i) => {
            expect(Math.abs(x - picker[i][0]), `${seed} at ${W}: peak ${i} across`).toBeLessThan(0.02);
            expect(Math.abs(h - picker[i][1]), `${seed} at ${W}: peak ${i} height`).toBeLessThan(0.05);
          });
        }
      }
    }
  });

  it("keeps every range's steepness on every screen, wide or tall (the kitchen's panel in portrait, 2026-11-17)", () => {
    // In screen pixels: how steeply the tallest peak rises from the valley on its left. Fractions of the
    // drawn width and of the band (the test above) passed while a tall screen stretched every peak up.
    const steepness = (W: number, H: number, d: 1 | 2, seed: number) => {
      const shapes = [...APPROVED_LANDSCAPE.shapes];
      shapes[d] = seed;
      const sheet = ridgeGeometry(W, H, 'summer', { ...APPROVED_LANDSCAPE, shapes }).sheets[d];
      const top = sheet.apexes.reduce((a, b) => (b.y < a.y ? b : a));
      return (top.ly - top.y) / (top.x - top.lx);
    };
    for (const [d, seeds] of [[1, TOP_SEEDS], [2, SECOND_SEEDS]] as const) {
      for (const seed of seeds) {
        const picker = steepness(1048, 590, d, seed);
        for (const [W, H] of [[1920, 1080], [1080, 1920], [1280, 800], [800, 1280], [1024, 768], [768, 1024],
          [956, 440], [440, 956], [390, 844], [3840, 2160]]) {
          // A wide screen's own shape moves it a little (a 4:3 screen about a third steeper, a phone a fifth
          // flatter); the stretched tall screens were 1.8 to 2.6 times as steep.
          const ratio = steepness(W, H, d, seed) / picker;
          expect(ratio, `${seed} at ${W} by ${H}`).toBeGreaterThan(0.75);
          expect(ratio, `${seed} at ${W} by ${H}`).toBeLessThan(1.4);
        }
      }
    }
  });

  it("draws a tall screen's land as the same screen turned on its side would, lowered to the bottom and centered", () => {
    for (const [W, H] of [[1080, 1920], [800, 1280], [440, 956], [390, 844]]) {
      const tall = ridgeGeometry(W, H, 'summer');
      const turned = ridgeGeometry(H, W, 'summer');
      const dx = -(H - W) / 2;
      const dy = H - W;
      expect(tall.horizon, `${W} by ${H}`).toBe(horizonAt(W, H));
      expect(tall.horizon).toBeCloseTo(turned.horizon + dy, 9);
      expect(tall.band).toBe(turned.band);
      tall.sheets.forEach((sheet, d) => {
        const from = turned.sheets[d];
        // The edge keeps a point past each side of the canvas (the screen plus both margins).
        const start = from.edge.findIndex(([x]) => Math.abs(x + dx - sheet.edge[0][0]) < 1e-9);
        expect(start, `${W} by ${H}, sheet ${d}`).toBeGreaterThan(0);
        sheet.edge.forEach(([x, y], i) => {
          expect(x).toBeCloseTo(from.edge[start + i][0] + dx, 9);
          expect(y).toBeCloseTo(from.edge[start + i][1] + dy, 9);
        });
        expect(sheet.edge[0][0]).toBeLessThan(-20);
        expect(sheet.edge[sheet.edge.length - 1][0]).toBeGreaterThan(W + 112 + 20);
        if (from.snowline) {
          expect(sheet.snowline).toHaveLength(sheet.edge.length);
          expect(sheet.snowline![3][1]).toBeCloseTo(from.snowline[start + 3][1] + dy, 9);
        }
        expect(sheet.apexes.map(a => [a.x, a.y, a.lx, a.vy])).toEqual(
          from.apexes.map(a => [a.x + dx, a.y + dy, a.lx + dx, a.vy + dy]));
        expect([sheet.top, sheet.bottom, sheet.foot]).toEqual([from.top + dy, from.bottom + dy, from.foot + dy]);
        // Trees off the canvas are left out, the rest keep their place, size, and kind.
        const kept = from.pines.filter(p => p.x + dx > -p.h && p.x + dx < W + 112 + p.h);
        expect(sheet.pines.map(p => [p.x, p.y, p.h, p.leafy, p.tone])).toEqual(
          kept.map(p => [p.x + dx, p.y + dy, p.h, p.leafy, p.tone]));
      });
    }
  });

  it("changes only the sheet whose seed changed", () => {
    const shapes = [...APPROVED_LANDSCAPE.shapes];
    shapes[2] = 99_001;
    const before = ridgeGeometry(1920, 1080, 'summer').sheets.map(print);
    const after = ridgeGeometry(1920, 1080, 'summer', { ...APPROVED_LANDSCAPE, shapes }).sheets.map(print);
    after.forEach((p, d) => (d === 2 ? expect(p).not.toBe(before[d]) : expect(p).toBe(before[d])));
  });

  it("keeps the tallest peak where the light sits for every top range it picks from, on every screen", () => {
    // Only the owner's picks draw the top range (pickLandscape); random seeds never reach it.
    for (const seed of TOP_SEEDS) {
      for (const [W, H] of [[1048, 590], [1920, 1080], [440, 956], [956, 440], [3840, 2160]]) {
        const shapes = [...APPROVED_LANDSCAPE.shapes];
        shapes[1] = seed;
        const hero = ridgeGeometry(W, H, 'summer', { ...APPROVED_LANDSCAPE, shapes }).sheets[1];
        const top = hero.apexes.reduce((a, b) => (b.y < a.y ? b : a));
        // The hero stands at 0.57 of the drawn width (the screen plus both margins); a tall screen shows the
        // middle of its turned screen's land.
        const wide = Math.max(W, H);
        const at = (wide + 112) * 0.57 - (wide - W) / 2;
        expect(Math.abs(top.x - at), `${seed} at ${W}`).toBeLessThan((wide + 112) * 0.06);
      }
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

/** The approved land at the Mountain Picker's stage size (1048 by 590), before review m13 I3 and after. */
const PICKER_PRINTS = [5047250, 4624518, 5508565, 6422695, 7578513, 9179078];
/** Each curated range's cut edge there (sheets 1 and 2 have no trees). */
const PICKER_TOP = [4624518, 4676255, 4529757, 4568311, 4659005, 4601844, 4449966];
const PICKER_SECOND = [5508565, 5314980, 5345684, 5402737, 5464801, 5507352, 5484942, 5485212, 5406190, 5539338];

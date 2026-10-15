import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { PvColorSwatchPicker } from '../src/core/color-swatch-picker';
import { lightTint, contrastRatio, contrastText } from '../src/core/color';

const TABLE = JSON.parse(readFileSync(new URL('../../../../tests/fixtures/palette.json', import.meta.url), 'utf-8')) as {
  presets: Array<{ name: string; color: string; light: string }>;
  legacy: Array<{ name: string; color: string; light: string }>;
};

// The owner, 2026-10-14: the first 20 colors left out pink, purple, and most blues.
describe("people's and the theme's colors", () => {
  it('the picker offers the shared table, 24 standard colors, and knows the first 20', () => {
    expect(PvColorSwatchPicker.PRESETS).toEqual(TABLE.presets);
    expect(PvColorSwatchPicker.LEGACY).toEqual(TABLE.legacy);
    expect(TABLE.presets).toHaveLength(24);
  });

  it("every color's light tint is the color 65% of the way to white", () => {
    for (const p of [...TABLE.presets, ...TABLE.legacy]) expect(lightTint(p.color), p.name).toBe(p.light.toLowerCase());
  });

  it('letters on every new color read at 4.5:1', () => {
    for (const p of TABLE.presets) expect(contrastRatio(contrastText(p.color), p.color), p.name).toBeGreaterThanOrEqual(4.5);
  });

  it("a person page shows a person's color when it isn't one offered, so an old color stays visible", () => {
    const page = readFileSync(new URL('../src/shell/settings/person-page.ts', import.meta.url), 'utf-8');
    expect(page).toMatch(/const current = PvColorSwatchPicker\.PRESETS\.some\(p => p\.color\.toUpperCase\(\) === this\._draft\.color\.toUpperCase\(\)\)/);
  });
});

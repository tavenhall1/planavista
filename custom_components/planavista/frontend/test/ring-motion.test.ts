import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { GENTLE, ringTokens } from '../src/core/motion';

const src = (path: string) => readFileSync(fileURLToPath(new URL(`../src/${path}`, import.meta.url)), 'utf-8').replace(/\r\n/g, '\n');

// The kitchen screen (a Pi 4, 2026-10-15): switching to the board took about 0.5 s, 300 ms of it rings
// reading the Motion setting one by one, each read after the last ring's write forcing a style recalc.
describe('rings take their motion from the card, never reading it themselves', () => {
  it('the card paints how a ring fills, with the Motion setting', () => {
    expect(ringTokens('full', true)).toEqual({ '--pv-ring-ms': `${GENTLE.duration}ms`, '--pv-ring-ease': GENTLE.easing });
    expect(ringTokens('full', false)['--pv-ring-ease']).not.toMatch(/^linear\(/);
    expect(ringTokens('reduced', true)).toEqual({ '--pv-ring-ms': '180ms', '--pv-ring-ease': 'linear' });
    expect(src('shell/appearance-controller.ts')).toMatch(/'--pv-motion': this\.motion,\s+\.\.\.ringTokens\(this\.motion\),/);
  });

  it('pv-ring reads no style and writes none to draw or fill; only a celebration asks', () => {
    const ring = src('core/pv-ring.ts');
    expect(ring).not.toMatch(/_setEasing|getComputedStyle|style\.setProperty|firstUpdated|willUpdate/);
    expect(ring.match(/motionOf\(this\)/g)?.length).toBe(1);
    expect(ring).toMatch(/private _play\(\): void \{\n\s+const glow = [^\n]+\n\s+if \(!glow\) return;\n\s+if \(motionOf\(this\) === 'reduced'\)/);
  });

  it("the bar measures itself after the browser's own layout, never forcing one on each update", () => {
    const bar = src('shell/pv-nav-bar.ts');
    const updated = bar.slice(bar.indexOf('protected updated('), bar.indexOf('\n  }\n', bar.indexOf('protected updated(')));
    expect(updated).not.toMatch(/_measure\(/);
    expect(updated).toMatch(/this\._watchParts\(\);/);
    expect(bar).toMatch(/private _watchParts\(\): void \{\n\s+const nav = this\.renderRoot\.querySelector\('nav'\);\n\s+if \(!nav \|\| !this\._observer\) return;\n\s+this\._observer\.disconnect\(\);/);
  });
});

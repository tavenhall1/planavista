import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { backdropTap } from '../src/core/backdrop';

// Seen on an iPad in landscape (1.5.3): holding a chore that needs a PIN, or one
// with several people, opened the centered sheet while the finger was still
// down. Safari sends that touch's click to whatever is under the finger when it
// lifts, the backdrop, so the sheet closed at once. Unchecking did the same.
describe('a backdrop closes its sheet only after a press that began on it', () => {
  const press = (on: object, at: object) => ({ target: on, currentTarget: at });

  it("ignores the click of the finger that opened the sheet", () => {
    let closed = 0;
    const tap = backdropTap(() => closed++);
    tap.click();
    expect(closed).toBe(0);
  });

  it('closes on a press that went down on the backdrop', () => {
    let closed = 0;
    const tap = backdropTap(() => closed++);
    const backdrop = {};
    tap.down(press(backdrop, backdrop));
    tap.click();
    expect(closed).toBe(1);
    // That press is used up: another click needs another press.
    tap.click();
    expect(closed).toBe(1);
  });

  it('ignores a press that began somewhere else inside it', () => {
    let closed = 0;
    const tap = backdropTap(() => closed++);
    tap.down(press({}, {}));
    tap.click();
    expect(closed).toBe(0);
  });
});

describe('every sheet uses it', () => {
  const src = fileURLToPath(new URL('../src/', import.meta.url));
  const files = (dir: string): string[] =>
    readdirSync(dir).flatMap(name => {
      const path = join(dir, name);
      return statSync(path).isDirectory() ? files(path) : path.endsWith('.ts') ? [path] : [];
    });
  const backdrops = files(src).flatMap(path =>
    readFileSync(path, 'utf-8').split(/\r?\n/).filter(line => line.includes('class="backdrop"')).map(line => ({ path, line })),
  );

  it('finds all ten', () => {
    expect(backdrops).toHaveLength(10);
  });

  it('binds the press and the click, and nothing else', () => {
    for (const { path, line } of backdrops) {
      expect(line.trim(), path).toBe('<div class="backdrop" @pointerdown=${this._backdrop.down} @click=${this._backdrop.click}></div>');
    }
  });
});

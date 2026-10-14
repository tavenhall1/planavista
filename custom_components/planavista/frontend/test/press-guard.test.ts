import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { PRESS_GRACE_MS, PressGuard } from '../src/core/press-guard';

// Round 1 of the adversarial review: Safari sends a lifting finger's click to
// whatever is under it now, ignoring pointer capture. A hold that opened the
// PIN sheet picked the parent's face under the finger ("Blair, enter your
// PIN"), a hold at a column's bottom pressed the new toast's "Someone else did
// it?", and a double tap's second tap closed the options it had just opened.
class Host extends EventTarget {
  controllers: PressGuard[] = [];
  addController(c: PressGuard) { this.controllers.push(c); }
  removeController() {}
  requestUpdate() {}
  get updateComplete() { return Promise.resolve(true); }
}

function tap(target: EventTarget, type: 'pointerdown' | 'click', detail = 1): Event {
  const event = new Event(type, { bubbles: true, cancelable: true });
  Object.defineProperty(event, 'detail', { value: detail });
  target.dispatchEvent(event);
  return event;
}

function setup(start = 1000) {
  let now = start;
  const host = new Host();
  const guard = new PressGuard(host as never, () => now);
  guard.hostConnected();
  const clicks: number[] = [];
  host.addEventListener('click', () => clicks.push(now));
  return { host, guard, clicks, advance: (ms: number) => { now += ms; } };
}

describe('a sheet or toast ignores the tap of a finger that went down before it appeared', () => {
  it("stops the lifting finger's click when no press began on it", () => {
    const { host, clicks } = setup();
    const click = tap(host, 'click');
    expect(clicks).toEqual([]);
    expect(click.defaultPrevented).toBe(true);
  });

  it('lets a tap that began on it through', () => {
    const { host, clicks, advance } = setup();
    advance(PRESS_GRACE_MS);
    tap(host, 'pointerdown');
    tap(host, 'click');
    expect(clicks).toHaveLength(1);
  });

  it("ignores a double tap's second tap while it is still arriving", () => {
    const { host, clicks, advance } = setup();
    advance(150);
    tap(host, 'pointerdown');
    tap(host, 'click');
    expect(clicks).toEqual([]);
  });

  // Round 4 (r4b B1): a child's triple tap (one tap every 190 ms) skipped the reveal, then its
  // third tap, 380 ms after the buttons came, pressed Get it and spent the stars.
  it('a burst of taps keeps starting it over, so only a tap after a pause counts', () => {
    const { host, guard, clicks, advance } = setup();
    guard.arm();
    for (let i = 0; i < 4; i++) {
      advance(190);
      tap(host, 'pointerdown');
      tap(host, 'click');
    }
    expect(clicks).toEqual([]);
    advance(PRESS_GRACE_MS);
    tap(host, 'pointerdown');
    tap(host, 'click');
    expect(clicks).toHaveLength(1);
  });

  it('lets keyboard and programmatic clicks through (no pointer, detail 0)', () => {
    const { host, clicks } = setup();
    tap(host, 'click', 0);
    expect(clicks).toHaveLength(1);
  });

  it('starts over when what it guards appears again (a new toast, a sheet opened again)', () => {
    const { host, guard, clicks, advance } = setup();
    advance(PRESS_GRACE_MS);
    tap(host, 'pointerdown');
    guard.arm();
    tap(host, 'click');
    expect(clicks).toEqual([]);
  });

  it('stops listening once disconnected', () => {
    const { host, guard, clicks } = setup();
    guard.hostDisconnected();
    tap(host, 'click');
    expect(clicks).toHaveLength(1);
  });
});

describe('every sheet and the toast take the guard', () => {
  const src = fileURLToPath(new URL('../src', import.meta.url));
  const files = (dir: string): string[] => readdirSync(dir).flatMap(name => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? files(path) : path.endsWith('.ts') ? [path] : [];
  });
  const sheets = files(src).filter(path => /\bsheetStyles\b/.test(readFileSync(path, 'utf-8')) && !path.endsWith(join('styles', 'sheet.ts')));

  it.each(sheets.map(path => [path.slice(src.length + 1), path]))('%s', (_name, path) => {
    expect(readFileSync(path, 'utf-8')).toMatch(/private readonly _pressGuard = new PressGuard\(this\);/);
  });

  it('the toast, which starts over with each new toast', () => {
    const toast = readFileSync(join(src, 'core', 'pv-toast.ts'), 'utf-8');
    expect(toast).toMatch(/private readonly _pressGuard = new PressGuard\(this\);/);
    expect(toast).toMatch(/this\._pressGuard\.arm\(\);/);
  });
});

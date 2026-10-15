import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { PRESS_GRACE_MS, PressGuard, guardPageTaps } from '../src/core/press-guard';

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
  const guard = new PressGuard(host as never, { now: () => now });
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

  // Round 5 (r5b B4): round 4's restart ate a briskly typed PIN, digits 120 to 150 ms apart
  // never leaving the window; a double-tapped gear's second tap started it.
  it('the keypad\'s guard ignores only the stray early press, then counts digits however fast', () => {
    let now = 1000;
    const host = new Host();
    const guard = new PressGuard(host as never, { now: () => now, restart: false });
    guard.hostConnected();
    const clicks: number[] = [];
    host.addEventListener('click', () => clicks.push(now));
    now += 180;
    tap(host, 'pointerdown');
    tap(host, 'click');
    expect(clicks).toEqual([]);
    now += 250;
    for (let i = 0; i < 4; i++) {
      tap(host, 'pointerdown');
      tap(host, 'click');
      now += 130;
    }
    expect(clicks).toHaveLength(4);
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

// Round 5 (r5b B2, B8): a double tap on the reveal's Later pressed Redeem beneath it, and a
// hold's lifting finger, under a reveal that closed at once, opened the person's day.
describe('the page beneath an overlay that just closed ignores that burst', () => {
  const page = () => {
    let now = 5000;
    const target = new EventTarget();
    // On the page the guard listens on the window, in the capture phase, before anything else.
    const stop = guardPageTaps(target, () => now, 3000);
    const clicks: number[] = [];
    target.addEventListener('click', () => clicks.push(now));
    return { target, clicks, stop, advance: (ms: number) => { now += ms; } };
  };

  it("stops a lifting finger's click and a double tap's second tap", () => {
    const { target, clicks, advance, stop } = page();
    tap(target, 'click');
    advance(150);
    tap(target, 'pointerdown');
    tap(target, 'click');
    advance(200);
    tap(target, 'pointerdown');
    tap(target, 'click');
    expect(clicks).toEqual([]);
    stop();
  });

  it('lets a deliberate tap after a pause through, then goes', () => {
    const { target, clicks, advance } = page();
    advance(PRESS_GRACE_MS);
    tap(target, 'pointerdown');
    tap(target, 'click');
    advance(50);
    tap(target, 'pointerdown');
    tap(target, 'click');
    tap(target, 'click', 0);
    expect(clicks).toHaveLength(3);
  });

  it('the reveal, a sheet closing, and a reveal that could not open all start it', () => {
    const src = (path: string) => readFileSync(new URL(`../src/${path}`, import.meta.url), 'utf-8');
    expect(src('modules/chores/pv-surprise-reveal.ts')).toMatch(/private _choose\(choice: 'ask' \| 'later'\): void \{[\s\S]*?guardPageTaps\(\);/);
    expect(src('shell/sheet-motion.ts')).toMatch(/async close\(panel: HTMLElement, backdrop: HTMLElement\): Promise<void> \{[\s\S]*?guardPageTaps\(\);/);
    expect(src('modules/chores/pv-chores-module.ts')).toMatch(/detail\.settle\(false\);\s*guardPageTaps\(\);/);
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
    expect(readFileSync(path, 'utf-8')).toMatch(/private readonly _pressGuard = new PressGuard\(this(, \{ restart: false \})?\);/);
  });

  // Round 5 (r5b B3): a double tap on your face typed its second tap on the keypad that replaced the faces.
  it('the keypad types fast, and starts its guard over when the faces turn into it', () => {
    const pin = readFileSync(join(src, 'shell', 'pv-pin-sheet.ts'), 'utf-8').replace(/\r\n/g, '\n');
    expect(pin).toMatch(/private readonly _pressGuard = new PressGuard\(this, \{ restart: false \}\);/);
    const enter = pin.slice(pin.indexOf('  private _enterFor(member: Member): void {'));
    expect(enter.slice(0, enter.indexOf('\n  }\n'))).toMatch(/this\._pressGuard\.arm\(\);/);
  });

  it('the toast, which starts over with each new toast', () => {
    const toast = readFileSync(join(src, 'core', 'pv-toast.ts'), 'utf-8');
    expect(toast).toMatch(/private readonly _pressGuard = new PressGuard\(this\);/);
    expect(toast).toMatch(/this\._pressGuard\.arm\(\);/);
  });
});

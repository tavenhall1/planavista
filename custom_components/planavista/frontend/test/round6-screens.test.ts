import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { PRESS_GRACE_MS, PressGuard, watchPagePresses } from '../src/core/press-guard';
import { keepOrder } from '../src/modules/chores/week-derive';

const src = (path: string) => readFileSync(fileURLToPath(new URL(`../src/${path}`, import.meta.url)), 'utf-8').replace(/\r\n/g, '\n');
const body = (source: string, start: string) => {
  const from = source.indexOf(start);
  expect(from, start).toBeGreaterThan(-1);
  return source.slice(from, source.indexOf('\n  }\n', from));
};

class Host extends EventTarget {
  addController() {}
  removeController() {}
  requestUpdate() {}
  get updateComplete() { return Promise.resolve(true); }
}

// The second adversarial review of round 5's fixes (round 6, reviewer B).
describe('round 6: screens', () => {
  // B5: a triple-tapped face typed its third tap (210 ms gaps) on the keypad.
  it('the keypad starts its window over for a burst at one spot, never for typing on other keys', () => {
    let now = 1000;
    const page = new EventTarget();
    const host = new Host();
    const guard = new PressGuard(host as never, { now: () => now, restart: 'same-spot', page });
    guard.hostConnected();
    const clicks: number[] = [];
    host.addEventListener('click', () => clicks.push(now));
    const tap = (x: number, y: number) => {
      const down = new Event('pointerdown');
      Object.defineProperties(down, { clientX: { value: x }, clientY: { value: y } });
      page.dispatchEvent(down);
      host.dispatchEvent(down);
      const click = new Event('click', { cancelable: true });
      Object.defineProperty(click, 'detail', { value: 1 });
      host.dispatchEvent(click);
    };
    guard.arm();
    for (let i = 0; i < 3; i++) { tap(284, 700); now += 210; }
    expect(clicks).toEqual([]);
    // A double-tapped gear (another spot), then digits typed fast on other keys: they count.
    now += PRESS_GRACE_MS;
    guard.arm();
    now += 180;
    tap(50, 40);
    now += 250;
    for (const [x, y] of [[120, 500], [220, 500], [320, 500], [120, 580]]) { tap(x, y); now += 120; }
    expect(clicks).toHaveLength(4);
  });

  // Round 7 (r7b B1): a triple tap on Looks good opened the keypad with tap 1, outside it, so the
  // keypad's same-spot rule had nothing to compare tap 2 with, and tap 3 typed a 9 into Blair's PIN.
  it("the keypad knows a burst that began on the page before it opened", () => {
    let now = 1000;
    const page = new EventTarget();
    const host = new Host();
    const guard = new PressGuard(host as never, { now: () => now, restart: 'same-spot', page });
    guard.hostConnected();
    const clicks: number[] = [];
    host.addEventListener('click', () => clicks.push(now));
    const down = (x: number, y: number) => {
      const event = new Event('pointerdown');
      Object.defineProperties(event, { clientX: { value: x }, clientY: { value: y } });
      return event;
    };
    const click = () => {
      const event = new Event('click', { cancelable: true });
      Object.defineProperty(event, 'detail', { value: 1 });
      host.dispatchEvent(event);
    };
    page.dispatchEvent(down(314, 760)); // tap 1: on Looks good, which opens the keypad
    guard.arm();
    for (let i = 0; i < 2; i++) {
      now += 200;
      const event = down(314, 760);
      page.dispatchEvent(event); // the page hears every press first, as the window's capture does
      host.dispatchEvent(event);
      click();
    }
    expect(clicks).toEqual([]);
  });

  // Round 8 (r8b F1): the page's presses were heard only from the first keypad on, which the card
  // draws after tap 1, so a page's first keypad still typed tap 3. The page listens from the start.
  it('the page hears presses before any keypad is built', () => {
    let now = 1000;
    const page = new EventTarget();
    watchPagePresses(page, () => now);
    const down = (x: number, y: number) => {
      const event = new Event('pointerdown');
      Object.defineProperties(event, { clientX: { value: x }, clientY: { value: y } });
      return event;
    };
    page.dispatchEvent(down(516, 1080)); // tap 1: Looks good, which builds and opens the keypad
    const host = new Host();
    const guard = new PressGuard(host as never, { now: () => now, restart: 'same-spot', page });
    guard.hostConnected();
    const clicks: number[] = [];
    host.addEventListener('click', () => clicks.push(now));
    for (let i = 0; i < 2; i++) {
      now += 200;
      const event = down(516, 1080);
      page.dispatchEvent(event);
      host.dispatchEvent(event);
      const click = new Event('click', { cancelable: true });
      Object.defineProperty(click, 'detail', { value: 1 });
      host.dispatchEvent(click);
    }
    expect(clicks).toEqual([]);
    expect(src('main.ts')).toMatch(/\nwatchPagePresses\(\);\n/);
  });

  // B4: excusing the first of two missed chores sorted it below the second, which slid under the finger.
  it('the day sheet keeps its rows in the order it showed them', () => {
    const fish = { key: 'fish' };
    const cat = { key: 'cat' };
    const bed = { key: 'bed' };
    expect(keepOrder([cat, fish], ['fish', 'cat']).map(i => i.key)).toEqual(['fish', 'cat']);
    expect(keepOrder([bed, cat, fish], ['fish', 'cat']).map(i => i.key)).toEqual(['fish', 'cat', 'bed']);
    expect(keepOrder([cat], ['fish', 'cat']).map(i => i.key)).toEqual(['cat']);
    const sheet = src('modules/chores/pv-chores-day-sheet.ts');
    expect(sheet).toMatch(/keepOrder\(entry\.items, /);
  });

  it("the Week view's Excuse it takes no second tap while the highlights reload", () => {
    const week = src('modules/chores/pv-chores-week.ts');
    expect(week).toMatch(/!this\.excusing\.has\(h\.excuse\.occurrence\)/);
    expect(week).toMatch(/if \(performance\.now\(\) < this\._quietUntil\) return;/);
  });

  // B3: a double tap on the docked approvals' Done opened a chore's options beneath.
  it("the docked approvals' close guards the page, like every sheet", () => {
    const inbox = src('modules/chores/pv-chores-inbox.ts');
    const close = body(inbox, '  async close(): Promise<void> {');
    expect(close).toMatch(/this\.style\.pointerEvents = 'none';\s*guardPageTaps\(\);/);
  });

  // B2: in the bottom sheet a row arriving moved every row up, and one leaving moved them down.
  it('the approvals hold their height while open in portrait', () => {
    const inbox = src('modules/chores/pv-chores-inbox.ts');
    expect(inbox).toMatch(/panel\.style\.height = `\$\{this\._heldHeight\}px`;/);
  });

  // B1: a toast covered Approve all's question, drawn inside the inbox's own layer.
  it("Approve all's question opens at the board's level, with the rows it named", () => {
    const inbox = src('modules/chores/pv-chores-inbox.ts');
    expect(inbox).not.toMatch(/<pv-notice-sheet/);
    expect(inbox).toMatch(/'pv-approve-all-ask'/);
    const module = src('modules/chores/pv-chores-module.ts');
    expect(module).toMatch(/heading=\$\{`Approve all \$\{rows\.length\}\?`\}/);
  });
});

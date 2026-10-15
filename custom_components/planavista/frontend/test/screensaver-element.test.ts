import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { swallowWakingKey } from '../src/core/wake-keys';

const src = (path: string) => readFileSync(fileURLToPath(new URL(`../src/${path}`, import.meta.url)), 'utf-8').replace(/\r\n/g, '\n');
const keyEvent = (type: string, key: string, repeat = false) => Object.assign(new Event(type, { cancelable: true }), { key, repeat });
const click = (detail: number) => Object.assign(new Event('click', { cancelable: true }), { detail });

describe('the key that wakes the screensaver presses nothing (0.11.0 review)', () => {
  afterEach(() => vi.useRealTimers());

  it('stops the key, its repeats, its keyup, and the click a button makes of it', () => {
    const page = new EventTarget();
    const waking = keyEvent('keydown', 'Enter');
    swallowWakingKey(waking, page);
    expect(waking.defaultPrevented).toBe(true);
    const heard: string[] = [];
    for (const type of ['keydown', 'keyup', 'keypress', 'click']) page.addEventListener(type, e => heard.push(type + ((e as Event & { detail?: number }).detail ?? '')));
    page.dispatchEvent(keyEvent('keydown', 'Enter', true));
    page.dispatchEvent(keyEvent('keypress', 'Enter'));
    page.dispatchEvent(keyEvent('keyup', 'Enter'));
    page.dispatchEvent(click(0));
    expect(heard).toEqual([]);
    // A finger's click is the press guard's to judge, and a new key counts.
    page.dispatchEvent(click(1));
    page.dispatchEvent(keyEvent('keydown', 'a'));
    expect(heard).toEqual(['click1', 'keydown']);
  });

  it('lets keyboard clicks through again after a moment', () => {
    vi.useFakeTimers();
    const page = new EventTarget();
    swallowWakingKey(keyEvent('keydown', ' '), page);
    const heard: number[] = [];
    page.addEventListener('click', e => heard.push((e as Event & { detail: number }).detail));
    vi.advanceTimersByTime(1000);
    page.dispatchEvent(click(0));
    expect(heard).toEqual([0]);
  });
});

describe('the screensaver over everything (0.11.0 review)', () => {
  const element = src('shell/pv-screensaver.ts');

  it("is a modal dialog in the top layer, above Home Assistant's own dialogs, and closes before it goes", () => {
    expect(element).toMatch(/<dialog class="saver" @cancel=\$\{\(e: Event\) => e\.preventDefault\(\)\}>/);
    expect(element).toMatch(/this\.renderRoot\.querySelector<HTMLDialogElement>\('dialog'\)\?\.showModal\(\);/);
    expect(element).toMatch(/dismiss\(\): void \{\n\s+this\.renderRoot\.querySelector<HTMLDialogElement>\('dialog'\)\?\.close\(\);/);
    expect(src('shell/screensaver-controller.ts')).toMatch(/\?\.dismiss\?\.\(\);\n\s+shown\?\.remove\(\);/);
  });

  it("takes the household's Motion setting, not only the device's", () => {
    expect(element).toMatch(/resolveMotion\(appearanceSettings\(data\?\.display\)\.motion, matchMedia\('\(prefers-reduced-motion: reduce\)'\)\.matches\) === 'reduced'/);
    expect(element).toMatch(/:host\(\[reduced\]\) \.info/);
  });

  it('moves the info to each corner of the screen, not only a few pixels', () => {
    expect(element).toMatch(/\.info\.lower \{ align-content: end; align-items: end;/);
    expect(element).toMatch(/\.info\.mirrored \{ justify-items: end; \}/);
    expect(element).not.toMatch(/translateY\(3vh\)/);
    expect(element).toMatch(/keyed\(corner, html`/);
  });
});

describe("Settings' screensaver picks (0.11.0 review)", () => {
  const page = src('shell/settings/pins-page.ts');

  it('draws its selects like every other select, and keeps a stored pick it cannot list', () => {
    expect(page).not.toMatch(/class="pv-select"/);
    expect(page.match(/class="pv-input pv-select"/g)?.length).toBeGreaterThanOrEqual(2);
    expect(page).toMatch(/entityChoices\(this\.hass\?\.states \?\? \{\}, /);
  });

  it("says the Screen should be the screen's own", () => {
    expect(page).toMatch(/Pick this screen's own backlight or plug, not a room's light\./);
  });
});

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { WAKING_MAX_MS, WAKING_TAIL_MS, swallowWakingKey, swallowWakingPress } from '../src/core/wake-keys';

const src = (path: string) => readFileSync(fileURLToPath(new URL(`../src/${path}`, import.meta.url)), 'utf-8').replace(/\r\n/g, '\n');
const keyEvent = (type: string, key: string, repeat = false) => Object.assign(new Event(type, { cancelable: true }), { key, repeat });
const click = (detail: number) => Object.assign(new Event('click', { cancelable: true }), { detail });
const pointer = (type: string, pointerId: number) => Object.assign(new Event(type, { cancelable: true }), { pointerId });

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

  it('keeps stopping a held key until it lifts, then lets keyboard clicks through after a moment', () => {
    vi.useFakeTimers();
    const page = new EventTarget();
    swallowWakingKey(keyEvent('keydown', ' '), page);
    const heard: string[] = [];
    page.addEventListener('keydown', () => heard.push('keydown'));
    page.addEventListener('click', e => heard.push(`click${(e as Event & { detail: number }).detail}`));
    // Held for over a second: its repeats still press nothing.
    vi.advanceTimersByTime(1200);
    page.dispatchEvent(keyEvent('keydown', ' ', true));
    page.dispatchEvent(keyEvent('keyup', ' '));
    page.dispatchEvent(click(0)); // Space's click comes with its keyup
    expect(heard).toEqual([]);
    vi.advanceTimersByTime(WAKING_TAIL_MS + 10);
    page.dispatchEvent(click(0));
    expect(heard).toEqual(['click0']);
  });

  it('never keeps a key forever', () => {
    vi.useFakeTimers();
    const page = new EventTarget();
    swallowWakingKey(keyEvent('keydown', 'Enter'), page);
    const heard: string[] = [];
    page.addEventListener('keydown', () => heard.push('keydown'));
    vi.advanceTimersByTime(WAKING_MAX_MS + 10);
    page.dispatchEvent(keyEvent('keydown', 'Enter', true));
    expect(heard).toEqual(['keydown']);
  });
});

describe('the touch that wakes the screensaver presses nothing (0.11.0 re-review)', () => {
  afterEach(() => vi.useRealTimers());

  it('a palm or a second finger landing as it wakes reaches nothing, nor any click, until every finger lifts', () => {
    vi.useFakeTimers();
    const page = new EventTarget();
    swallowWakingPress(pointer('pointerdown', 1), page);
    const heard: string[] = [];
    for (const type of ['pointerdown', 'click']) page.addEventListener(type, () => heard.push(type));
    vi.advanceTimersByTime(30);
    page.dispatchEvent(pointer('pointerdown', 2));
    vi.advanceTimersByTime(3500); // a long hold: Safari's lifting click still presses nothing
    page.dispatchEvent(pointer('pointerup', 1));
    page.dispatchEvent(click(1));
    page.dispatchEvent(pointer('pointerup', 2));
    page.dispatchEvent(click(1));
    expect(heard).toEqual([]);
    vi.advanceTimersByTime(WAKING_TAIL_MS + 10);
    page.dispatchEvent(pointer('pointerdown', 3));
    page.dispatchEvent(click(1));
    expect(heard).toEqual(['pointerdown', 'click']);
  });

  it('never keeps the page for longer than its limit, should a lift go unheard', () => {
    vi.useFakeTimers();
    const page = new EventTarget();
    swallowWakingPress(pointer('pointerdown', 1), page);
    const heard: string[] = [];
    page.addEventListener('pointerdown', () => heard.push('pointerdown'));
    vi.advanceTimersByTime(WAKING_MAX_MS + 10);
    page.dispatchEvent(pointer('pointerdown', 2));
    expect(heard).toEqual(['pointerdown']);
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

describe('the screensaver on the kitchen screen (0.11.1, from the Pi)', () => {
  const element = src('shell/pv-screensaver.ts');

  it("draws in PlanaVista's own rounded face, which it installs itself (the Pi has only DejaVu)", () => {
    expect(element).toMatch(/font-family: '\$\{unsafeCSS\(HEADING_FONT\)\}', ui-rounded, 'SF Pro Rounded', system-ui, sans-serif;/);
    expect(element).toMatch(/\.ring text \{ font: 800 15px '\$\{unsafeCSS\(HEADING_FONT\)\}', ui-rounded, system-ui, sans-serif;/);
    expect(element).not.toMatch(/'Nunito'/);
    expect(element).toMatch(/connectedCallback\(\): void \{\n\s+super\.connectedCallback\(\);\n\s+\/\/[^\n]*\n\s+ensurePageStyles\(\);/);
  });

  it('keeps its letters readable over a white paper cloud, with a cut edge', () => {
    expect(element).toMatch(/\.clock \{[^}]*text-shadow:\n\s+0 0 1px rgba\(13, 27, 42, 0\.34\),/);
    expect(element).toMatch(/\.line \{[^}]*text-shadow: 0 0 1px rgba\(13, 27, 42, 0\.4\), 0 1px 0 rgba\(13, 27, 42, 0\.22\), 0 4px 14px rgba\(13, 27, 42, 0\.28\);/);
  });

  it("names each person under their ring, so two people with one initial aren't confused", () => {
    expect(element).toMatch(/<small class="who">\$\{r\.name\}<\/small>\n\s+<small>\$\{r\.done\} of \$\{r\.due\}<\/small>/);
    expect(element).toMatch(/\.ring \.who \{[^}]*text-overflow: ellipsis;/);
  });
});

describe("Settings' screensaver picks (0.11.0 review; Shared screens since 0.12.0)", () => {
  const page = src('shell/settings/screens-page.ts');

  it('draws its selects like every other select, and keeps a stored pick it cannot list', () => {
    expect(page).not.toMatch(/class="pv-select"/);
    expect(page.match(/class="pv-input pv-select"/g)?.length).toBeGreaterThanOrEqual(2);
    expect(page).toMatch(/entityChoices\(this\.hass\?\.states \?\? \{\}, /);
  });

  it('offers a 1-minute wait (the owner, from the kitchen screen)', () => {
    expect(page).toMatch(/\{ value: 1, label: '1 min', spoken: '1 minute' \},/);
    expect(src('core/screensaver.ts')).toMatch(/export const AFTER_CHOICES = \[1, 2, 5, 10, 15, 30\] as const;/);
    // Five fit a phone's Settings in one row; 15 minutes stays for a household that chose it.
    expect(page).toMatch(/const OFFERED_AFTER = \[1, 2, 5, 10, 30\];/);
    expect(page).toMatch(/AFTER_CHOICES\.filter\(c => OFFERED_AFTER\.includes\(c\.value\) \|\| c\.value === saver\.after_minutes\)/);
  });

  it("says the Screen should be the screen's own (in its ?)", () => {
    expect(src('core/help.ts')).toMatch(/Pick this screen's own backlight or plug, not a room's light\./);
  });

  it('turns back a night that starts when it ends, where it was changed, and says why there', () => {
    expect(page).toMatch(/if \(next\.from === next\.to\) \{\n\s+field\.value = night\[part\];\n\s+this\._nightProblem = 'Night needs a start and an end that differ\.';/);
    expect(page).toMatch(/\$\{this\._nightProblem \? html`<p class="message" role="alert">\$\{this\._nightProblem\}<\/p>` : nothing\}/);
    expect(page).toMatch(/@change=\$\{\(e: Event\) => this\._nightPart\('from', e\.target as HTMLInputElement\)\}/);
  });
});

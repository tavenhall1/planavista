import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import type { HouseholdView } from '../src/core/household';
import {
  KIOSK_PARTS,
  KIOSK_SHEETS,
  kioskLook,
  kioskStripAction,
  mayChangeKiosk,
  startStepOut,
  stepOutEndsAt,
  stepOutOver,
  stepOutTouched,
  stepOutWithLimits,
} from '../src/core/kiosk';
import { startSession } from '../src/core/session';

const view = (shared: boolean, kiosk?: { enabled: boolean; top_bar: 'hidden' | 'tabs' }): HouseholdView =>
  ({
    available: true,
    members: [],
    account: { user_id: 'u', name: 'Kitchen', is_admin: false, shared, kind: shared ? 'shared' : 'parent', member_id: null, parent_level: false },
    security: { shuffle_keypad: false, shared_screens: 1, ...(kiosk ? { kiosk } : {}) },
    modules: {},
    setup: { completed: true, step: null },
  }) as HouseholdView;

describe('kioskLook (milestone 9, D1 and D2)', () => {
  it('is off until the household answers, off on a screen that is not shared, and off while the switch is', () => {
    expect(kioskLook(null)).toBe('off');
    expect(kioskLook(view(false, { enabled: true, top_bar: 'hidden' }))).toBe('off');
    expect(kioskLook(view(true, { enabled: false, top_bar: 'hidden' }))).toBe('off');
    // An older backend sends no kiosk setting at all.
    expect(kioskLook(view(true))).toBe('off');
  });

  it('hides the top bar, or keeps only its tabs, on a shared screen', () => {
    expect(kioskLook(view(true, { enabled: true, top_bar: 'hidden' }))).toBe('hidden');
    expect(kioskLook(view(true, { enabled: true, top_bar: 'tabs' }))).toBe('tabs');
  });
});

describe("a step out of kiosk mode lasts by parent mode's own rules (D4)", () => {
  const idleMs = 120_000;
  it('ends after the quiet time without a touch anywhere, or at the cap, whichever comes first', () => {
    const out = startStepOut(0, idleMs, 600_000);
    expect(stepOutEndsAt(out)).toBe(120_000);
    expect(stepOutOver(out, 119_999)).toBe(false);
    expect(stepOutOver(out, 120_000)).toBe(true);
    // A touch at 100 s keeps it going to 220 s.
    const touched = stepOutTouched(out, 100_000);
    expect(stepOutEndsAt(touched)).toBe(220_000);
    // Touches never carry it past the cap.
    const late = stepOutTouched(startStepOut(0, idleMs, 600_000), 550_000);
    expect(stepOutEndsAt(late)).toBe(600_000);
    expect(stepOutOver(late, 600_000)).toBe(true);
  });
});

describe("the style kiosk mode adds to Home Assistant's dashboard header (3.2)", () => {
  it('hides the whole header for Hidden, makes no room for it, and lets the card run under the status bar', () => {
    expect(KIOSK_SHEETS.hidden).toMatch(/\.header \{ display: none !important; \}/);
    expect(KIOSK_SHEETS.hidden).toMatch(/:host \{ --header-height: 0px; --pv-under-status-bar: var\(--safe-area-inset-top, 0px\); \}/);
  });

  it('names the part each look hides, so the controller adds it only where that part is', () => {
    expect(KIOSK_PARTS).toEqual({ hidden: '.header', tabs: '.action-items' });
  });

  it("keeps the tabs for Tabs only and hides only the header's buttons", () => {
    expect(KIOSK_SHEETS.tabs).toMatch(/\.action-items \{ display: none !important; \}/);
    expect(KIOSK_SHEETS.tabs).not.toMatch(/\.header \{/);
    expect(KIOSK_SHEETS.tabs).not.toMatch(/--header-height/);
  });
});

describe('the session remembers whether its parent is an admin (D3)', () => {
  it('takes it from the unlock, and is false when an older backend says nothing', () => {
    expect(startSession({ session: 't', member_id: 'blair', parent: true, admin_parent: true }, 0).adminParent).toBe(true);
    expect(startSession({ session: 't', member_id: 'blair', parent: true }, 0).adminParent).toBe(false);
  });
});


const read = (path: string) =>
  readFileSync(new URL(`../src/${path}`, import.meta.url), 'utf-8').replace(/\r\n/g, '\n');

describe("the strip's kiosk button (D3, D4)", () => {
  const parent = { parent: true, adminParent: true };
  it('offers Exit kiosk mode only to a parent who is an admin, while kiosk mode is on', () => {
    expect(kioskStripAction('hidden', false, parent)).toBe('exit');
    expect(kioskStripAction('tabs', false, parent)).toBe('exit');
    expect(kioskStripAction('hidden', false, { parent: true, adminParent: false })).toBeNull();
    expect(kioskStripAction('hidden', false, { parent: false, adminParent: true })).toBeNull();
    expect(kioskStripAction('off', false, parent)).toBeNull();
  });

  it('offers Exit as soon as kiosk mode turns on, to a session unlocked while it was off (review)', () => {
    const session = startSession({ session: 't', member_id: 'blair', parent: true, admin_parent: true }, 0);
    expect(kioskStripAction('off', false, session)).toBeNull();
    expect(kioskStripAction('hidden', false, session)).toBe('exit');
  });

  it('offers Back to kiosk mode to whoever is at the screen while a step out runs', () => {
    expect(kioskStripAction('hidden', true, { parent: false, adminParent: false })).toBe('back');
  });

  it('draws it as a secondary button before Lock, with words that say what it does', () => {
    const strip = read('shell/pv-parent-strip.ts');
    expect(strip).toMatch(/@property\(\{ attribute: false \}\) kiosk: 'exit' \| 'back' \| null = null;/);
    expect(strip).toMatch(/this\.kiosk === 'back' \? 'Back to kiosk mode' : 'Exit kiosk mode'/);
    expect(strip).toMatch(/class="pv-btn pv-btn-secondary kiosk"[^\n]*@click=\$\{this\._kiosk\}/);
    expect(strip.indexOf('class="pv-btn pv-btn-secondary kiosk"')).toBeLessThan(strip.indexOf('class="pv-btn pv-btn-ghost lock"'));
  });
});

describe('Settings: Shared screens, Kiosk mode and Top bar (D2, D6)', () => {
  const pins = read('shell/settings/pins-page.ts');
  it('shows the switch only once a shared screen exists, and the top bar choice only while it is on', () => {
    expect(pins).toMatch(/\$\{sharedScreens \? html`\s*<section>\s*<h2>Shared screens<\/h2>/);
    expect(pins).toMatch(/this\._switch\('Kiosk mode', 'kiosk-label', kiosk\.enabled, this\._toggleKiosk, !mayChange\)/);
    expect(pins).toMatch(/\$\{kiosk\.enabled \? this\._choices\('Top bar', 'top-bar-label', TOP_BAR_CHOICES, kiosk\.top_bar,/);
    expect(pins).toMatch(/value => this\.api\.saveSecurity\(\{ kiosk_top_bar: value \}\)/);
  });

  it("says plainly what it hides, who can step out, and that it isn't a lock", () => {
    expect(pins).toMatch(/hides Home Assistant's menus/);
    expect(pins).toMatch(/A parent who is a Home Assistant admin can exit it in parent mode/);
    expect(pins).toMatch(/isn't a lock/);
    expect(pins).toMatch(/Guided Access/);
  });
});

describe('the card runs under the status bar when the top bar is hidden (3.3)', () => {
  const card = read('shell/planavista-card.ts');
  it('adds the status bar back to its height, moves up under it, and pads its header by it', () => {
    expect(card).toMatch(/height: calc\(100dvh - var\(--header-height, 56px\) - var\(--safe-area-inset-top, 0px\) - var\(--safe-area-inset-bottom, 0px\) \+ var\(--pv-under-status-bar, 0px\)\);/);
    expect(card).toMatch(/height: calc\(100dvh - var\(--header-height, 56px\) - var\(--safe-area-inset-top, 0px\) \+ var\(--pv-under-status-bar, 0px\)\);/);
    expect(card).toMatch(/margin-top: calc\(-1 \* var\(--pv-under-status-bar, 0px\)\);/);
    expect(card).toMatch(/pv-glance-header \{\s*order: 1;\s*flex-shrink: 0;\s*padding-top: var\(--pv-under-status-bar, 0px\);/);
  });

  it('tells a refused exit in a toast', () => {
    expect(card).toMatch(/<pv-toast \.toast=\$\{this\._toast\}/);
    expect(card).toMatch(/await this\._api\.exitKiosk\(\);\s*kiosk\.lift\(Date\.now\(\), session\.idleMs, session\.capAt, session\.startedAt\);/);
  });
});

describe("Settings' strip has the same kiosk button as the card's (like for like)", () => {
  it('takes it from the card and hands its taps back', () => {
    const settings = read('shell/settings/pv-settings.ts');
    expect(settings).toMatch(/@property\(\{ attribute: false \}\) kioskAction: 'exit' \| 'back' \| null = null;/);
    expect(settings).toMatch(/<pv-parent-strip [^\n]*\.kiosk=\$\{this\.kioskAction\}/);
    const card = read('shell/planavista-card.ts');
    expect(card).toMatch(/\.kioskAction=\$\{this\._kioskAction\(\)\}/);
    expect(card).toMatch(/@pv-kiosk=\$\{this\._onKiosk\}\s*\n\s*@pv-lock=\$\{this\._onSettingsLock\}/);
  });
});

describe("who may change kiosk mode in Settings (review: the owner's rule)", () => {
  it("is an admin's own login, or a parent who is an admin; not a shared admin login without one", () => {
    expect(mayChangeKiosk({ is_admin: true, shared: false }, null)).toBe(true);
    expect(mayChangeKiosk({ is_admin: false, shared: true }, { parent: true, adminParent: true })).toBe(true);
    expect(mayChangeKiosk({ is_admin: true, shared: true }, null)).toBe(false);
    expect(mayChangeKiosk({ is_admin: false, shared: true }, { parent: true, adminParent: false })).toBe(false);
    expect(mayChangeKiosk({ is_admin: false, shared: false }, null)).toBe(false);
  });

  it('locks the switch and the top bar for anyone else, and says who can', () => {
    const pins = read('shell/settings/pins-page.ts');
    expect(pins).toMatch(/const mayChange = mayChangeKiosk\(account, this\.session\);/);
    expect(pins).toMatch(/this\._switch\('Kiosk mode', 'kiosk-label', kiosk\.enabled, this\._toggleKiosk, !mayChange\)/);
    expect(pins).toMatch(/Only a Home Assistant admin, or a parent who is one, can change kiosk mode\./);
    expect(read('shell/settings/pv-settings.ts')).toMatch(/\.session=\$\{this\.session\}\n\s*mode="settings"/);
  });
});

describe('a step out follows a change to the limits (review)', () => {
  it('takes the new quiet time and the new cap, counted from the PIN', () => {
    const out = startStepOut(60_000, 120_000, 600_000, 0);
    // Lock after no touches cut to 30 s and Parent mode ends after to 5 min while stepped out.
    const shorter = stepOutWithLimits(out, 30, 5);
    expect(stepOutEndsAt(shorter)).toBe(90_000);
    expect(shorter.capAt).toBe(300_000);
    // A backend that sends no limits leaves them as they were.
    expect(stepOutWithLimits(out, undefined, undefined)).toBe(out);
  });
});

describe("the card's own toast sits above the bar, as the chores toasts do (review)", () => {
  it('anchors it right after the module area, so the bar never hides under it', () => {
    const card = read('shell/planavista-card.ts');
    expect(card).toMatch(/<div class="toast-anchor"><pv-toast \.toast=\$\{this\._toast\}/);
    expect(card).toMatch(/\.toast-anchor \{\s*order: 3;\s*position: relative;\s*height: 0;/);
  });
});

describe("the strip's kiosk button has an edge on the strip's tint (review)", () => {
  it("mixes its border from the person's color, as the strip's own line is", () => {
    expect(read('shell/pv-parent-strip.ts')).toMatch(/\.kiosk \{\s*border-color: color-mix\(in srgb, var\(--strip-color\) 55%, var\(--pv-border, #E7E7E3\)\);/);
  });
});

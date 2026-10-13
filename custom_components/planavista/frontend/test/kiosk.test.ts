import { describe, expect, it } from 'vitest';
import type { HouseholdView } from '../src/core/household';
import {
  KIOSK_SHEETS,
  kioskLook,
  startStepOut,
  stepOutEndsAt,
  stepOutOver,
  stepOutTouched,
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

  it("keeps the tabs for Tabs only and hides only the header's buttons", () => {
    expect(KIOSK_SHEETS.tabs).toMatch(/\.action-items \{ display: none !important; \}/);
    expect(KIOSK_SHEETS.tabs).not.toMatch(/\.header \{/);
    expect(KIOSK_SHEETS.tabs).not.toMatch(/--header-height/);
  });
});

describe('the session remembers whether its parent may exit kiosk mode (D3)', () => {
  it('takes it from the unlock, and is false when an older backend says nothing', () => {
    expect(startSession({ session: 't', member_id: 'blair', parent: true, may_exit_kiosk: true }, 0).mayExitKiosk).toBe(true);
    expect(startSession({ session: 't', member_id: 'blair', parent: true }, 0).mayExitKiosk).toBe(false);
  });
});

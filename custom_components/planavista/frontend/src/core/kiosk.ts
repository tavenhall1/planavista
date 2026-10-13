/**
 * Kiosk mode (milestone 9, docs/superpowers/specs/2026-10-12-kiosk-mode-design.md).
 * On a shared family screen with the household's switch on, Home Assistant's
 * sidebar is hidden (its own kiosk switch) and so is its dashboard header, or
 * all of it but the tabs. A parent who is a Home Assistant admin may step
 * out for as long as parent mode would last. These rules are pure; the
 * page-wide controller (shell/kiosk-controller.ts) applies them.
 */
import type { HouseholdView } from './household';

export type KioskLook = 'off' | 'hidden' | 'tabs';

/** What this screen looks like: off unless it is a shared screen and the switch is on (D1, D2). */
export function kioskLook(view: HouseholdView | null): KioskLook {
  const kiosk = view?.security.kiosk;
  if (!view?.account.shared || !kiosk?.enabled) return 'off';
  return kiosk.top_bar === 'tabs' ? 'tabs' : 'hidden';
}

/**
 * The style added to the dashboard's root (`hui-root`'s shadow root). For
 * Hidden: no header, no room kept for it, and the card runs up under the
 * status bar. For Tabs only: the header's buttons go, its tabs stay. If Home
 * Assistant renames these parts, the controller adds nothing (KIOSK_PARTS)
 * and the header simply shows: kiosk mode fails open.
 */
export const KIOSK_SHEETS: Record<Exclude<KioskLook, 'off'>, string> = {
  hidden: [
    '.header { display: none !important; }',
    ':host { --header-height: 0px; --pv-under-status-bar: var(--safe-area-inset-top, 0px); }',
  ].join('\n'),
  tabs: '.action-items { display: none !important; }',
};

/**
 * The part of the header each look hides. The controller adds a look's style
 * only where its part is there (review): a Home Assistant that renamed it
 * then just shows its header, instead of losing the header's room under a
 * header still drawn.
 */
export const KIOSK_PARTS: Record<Exclude<KioskLook, 'off'>, string> = {
  hidden: '.header',
  tabs: '.action-items',
};

/**
 * The strip's kiosk button: Exit kiosk mode for a parent who is an admin
 * (D3), as soon as kiosk mode is on, even if it was turned on after the PIN;
 * Back to kiosk mode, for whoever is at the screen, while a step out runs
 * (D4); none otherwise. The backend checks again when Exit is tapped.
 */
export function kioskStripAction(
  look: KioskLook,
  steppedOut: boolean,
  session: { parent: boolean; adminParent?: boolean },
): 'exit' | 'back' | null {
  if (look === 'off') return null;
  if (steppedOut) return 'back';
  return session.parent && session.adminParent ? 'exit' : null;
}

/**
 * The way back once the strip is gone (review): a parent who stepped out and
 * used Home Assistant's pages comes back to a card whose own session ended,
 * so the card says the menus are showing and offers Back to kiosk mode,
 * which anyone may tap (bringing kiosk mode back is harmless).
 */
export function showsKioskReturn(steppedOut: boolean, session: unknown): boolean {
  return steppedOut && !session;
}

/**
 * Who may change kiosk mode in Settings (review, the owner's rule): a parent
 * who is an admin, in parent mode, or an admin's own login; a shared screen
 * signed in as an admin still needs an admin parent. The backend checks too.
 */
export function mayChangeKiosk(
  account: { is_admin: boolean; shared: boolean },
  session: { parent: boolean; adminParent?: boolean } | null,
): boolean {
  return !!(session?.parent && session.adminParent) || (account.is_admin && !account.shared);
}

/** A step out of kiosk mode, by parent mode's own clock (D4). */
export interface StepOut {
  /** The last touch anywhere on the page (ms). */
  lastTouch: number;
  /** Lock after no touches (ms). */
  idleMs: number;
  /** When parent mode would end however busy (ms since the epoch). */
  capAt: number;
  /** When the PIN opened parent mode (ms), so a new cap counts from it. */
  startedAt?: number;
}

export function startStepOut(now: number, idleMs: number, capAt: number, startedAt?: number): StepOut {
  return { lastTouch: now, idleMs, capAt, startedAt };
}

/**
 * New limits saved while stepped out (review): the quiet time at once, and the
 * cap counted from the PIN, as parent mode itself does (core/session.ts withLimits).
 */
export function stepOutWithLimits(out: StepOut, idleSeconds: number | undefined, capMinutes: number | undefined): StepOut {
  const idleMs = idleSeconds ? idleSeconds * 1000 : out.idleMs;
  const capAt = capMinutes && out.startedAt !== undefined ? out.startedAt + capMinutes * 60_000 : out.capAt;
  if (idleMs === out.idleMs && capAt === out.capAt) return out;
  return { ...out, idleMs, capAt };
}

export function stepOutTouched(out: StepOut, now: number): StepOut {
  return { ...out, lastTouch: now };
}

export function stepOutEndsAt(out: StepOut): number {
  return Math.min(out.lastTouch + out.idleMs, out.capAt);
}

export function stepOutOver(out: StepOut, now: number): boolean {
  return now >= stepOutEndsAt(out);
}

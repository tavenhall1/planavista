# Kiosk mode (milestone 9)

**Date:** 2026-10-12
**Release:** 1.6.0
**Status:** approved in conversation with the owner (shared screens only; Top bar Hidden or Tabs only; the assumptions in section 2).

## 1. Why

A shared family screen (the kitchen tablet, signed in with an account marked shared) shows PlanaVista inside Home Assistant, with Home Assistant's sidebar and header around it. Children tap their way into other dashboards, the map, history, or media, and the screen never feels like an app. Kiosk mode hides Home Assistant's menus on shared screens, and a parent who is a Home Assistant admin can step out of it for as long as parent mode would last.

Kiosk mode tidies the screen. It is not a lock: a browser still has an address bar, and anyone can type another address. A real lock is the device's job (Guided Access on an iPad, a kiosk browser on Android). Settings and the README say so plainly. The shared account is not an admin, so Home Assistant's own settings stay out of reach either way.

## 2. Decisions

- **D1. Where:** only on shared family screens (accounts marked shared in Settings, PINs and parent mode). A parent's own phone or laptop, and every admin's login, keep Home Assistant's menus.
- **D2. The setting:** one switch for the household, **Kiosk mode**, in Settings, PINs and parent mode, in its own **Shared screens** section (it applies to every shared screen, not only this one), shown once a shared screen exists. Beside it, **Top bar: Hidden / Tabs only**.
  - **Hidden:** Home Assistant's header is gone and PlanaVista fills the screen. On a phone or tablet its header runs under the status bar, as its bar runs under the home indicator.
  - **Tabs only:** the header keeps the dashboard's tabs (its views: PlanaVista and Chores today, and any the household adds, such as Lights or Cameras); its menu button and the buttons on its right are hidden.
  - In both, the sidebar is gone (Home Assistant's own kiosk switch).
- **D3. Who may step out:** in parent mode, a parent whose own Home Assistant login is an admin (the member's person is linked to a user who is an admin). The strip shows **Exit kiosk mode** to that parent only. Nobody else sees it, and the backend checks it again when it is tapped.
- **D4. How long:** stepping out lasts by parent mode's own rules, counted anywhere on the screen: it ends after the household's Lock after no touches without a touch anywhere on the page, at Parent mode ends after (counted from the PIN), on Lock, when the screen sleeps (the page is hidden), or on a reload. Then kiosk mode is back. Leaving the PlanaVista dashboard does not end it, so the parent can use Home Assistant's pages (the card's own parent mode does end when the card leaves the screen; stepping out of kiosk mode keeps going by the same clock). After Exit, the strip's button reads **Back to kiosk mode**.
- **D5. The way back:** an admin can turn the switch off from their own phone or laptop; every shared screen follows within a second, through the household subscription.
- **D6. Plain words:** Settings' line under the switch and the README say what it hides, who can step out, and that a device lock needs the device's own kiosk feature.

## 3. Design

### 3.1 Storage and commands (backend)

- The household's security settings gain `kiosk: {enabled: bool, top_bar: "hidden" | "tabs"}`, default `{enabled: false, top_bar: "hidden"}`. The normalizer fills missing or unknown values with the defaults and keeps unknown fields (rollback-safe: 1.5.x ignores `kiosk`).
- `planavista/household/settings/save` takes `kiosk_enabled: bool` and `kiosk_top_bar: "hidden" | "tabs"` (parent level, as the other settings).
- The household view's `security` gains `kiosk: {enabled, top_bar}`.
- `planavista/pin/unlock` returns `may_exit_kiosk: bool`: kiosk mode is on, this account is a shared screen, the PIN is a parent's, and that parent's person is linked to an admin.
- New `planavista/kiosk/exit {session}`: the same four conditions checked against a live parent session on this connection; it answers `{}`, or refuses through `send_refusal` with `pin_required` (no live session), `parent_mode_required` (a child's session), `not_admin`, `not_shared`, or `kiosk_off`. A refusal is noted in the diagnostics' recent refusals.
- Diagnostics show `kiosk: {enabled, top_bar}`.

### 3.2 The page-wide controller (card bundle)

PlanaVista's script is loaded on every Home Assistant page, so kiosk mode is applied by a controller the bundle starts at load (`shell/kiosk-controller.ts`), not by the card. Tied to the card, kiosk mode would lift whenever another tab or panel shows.

- It finds `<home-assistant>`, follows its `hass` (connection changes), and subscribes to `planavista/household/subscribe` once per page. An integration that isn't set up, or a refused subscription, leaves the page as it is.
- **Applies** when `account.shared && security.kiosk.enabled` and no step-out is running:
  - fires Home Assistant's `hass-kiosk-mode {enable: true}` on `window` (sidebar gone, menu button hidden on every panel, edit and search buttons hidden);
  - adds one constructed style sheet to the dashboard's `hui-root` shadow root: for Hidden, `.header { display: none }` and `:host { --header-height: 0px; --pv-under-status-bar: var(--safe-area-inset-top, 0px) }`; for Tabs only, `.action-items { display: none }`;
  - re-checks on `location-changed` and every two seconds while kiosk mode is on (a new dashboard root gets the sheet), and fires the kiosk event again when Home Assistant's `hass.kioskMode` reads false.
- **Lifts** (Exit kiosk mode, or the setting off, or the account no longer shared): fires `hass-kiosk-mode {enable: false}` and removes the sheet.
- **Step-out clock:** `lift({idleMs, capAt})` starts it; `pointerdown` and `keydown` anywhere on the document (capture) count as touches; it ends at `lastTouch + idleMs`, at `capAt`, on `visibilitychange` to hidden, or on `restore()` (the strip's Lock or Back to kiosk mode). The rule is pure (`core/kiosk.ts`): `kioskLook(view)` gives off, hidden, or tabs; `stepOutEnds(stepOut, now)` gives when it ends.
- If Home Assistant renames `hui-root`, `.header`, or `.action-items`, the sheet matches nothing and the header simply shows: kiosk mode fails open, never breaks the page. The sidebar part uses Home Assistant's own switch.

### 3.3 The card

- Hidden: the card's height already reads `--header-height` (now 0 under `hui-root`), so it fills the screen. With `--pv-under-status-bar` set, the card adds it back to its height, runs up under the status bar (`margin-top: calc(-1 * var(--pv-under-status-bar, 0px))`), and the glance header pads its top by it.
- The parent strip shows **Exit kiosk mode** when the unlock said `may_exit_kiosk` and kiosk mode is on here and no step-out is running; **Back to kiosk mode** while one is. Exit calls `planavista/kiosk/exit` with the session, then `kiosk.lift(...)` with the household's Lock after no touches and the session's cap. Lock ends the session and calls `kiosk.restore()`. A refusal says why in a toast (refusalText, the M8 pattern).
- Settings, PINs and parent mode: a **Shared screens** section with the **Kiosk mode** switch and its line, and **Top bar** as a segmented control (Hidden, Tabs only) shown while it is on. Shown only when a shared screen exists, since that's where it applies.
- Settings draws its own copy of the strip; it carries the same kiosk button as the card's (found in the prototype's walkthrough: Settings' strip had only Lock).

## 4. Testing

- **Backend (pytest):** normalizing (`kiosk` missing, partial, unknown values), settings save (types, parent level), the view, `may_exit_kiosk` in unlock (each of the four conditions), `kiosk/exit` (admin parent yes; non-admin parent, child, no session, a session from another connection, account not shared, kiosk off: each refused with its code and noted), diagnostics.
- **Card (vitest):** `kioskLook`, `stepOutEnds`, the controller's sheet text for both looks, the strip's buttons, the Settings page's controls (source checks where an element only renders).
- **Dev HA, scripted, red then green:** as Kitchen at 1032 by 1376 (iPad, sidebar showing), 820 by 1180, and 440 by 956 with the insets set (`--app-safe-area-inset-top/bottom`) and the Safari gap (`html` at `calc(100vh + 79px)`): Hidden and Tabs only; another tab; a reload; Exit as a parent linked to an admin (section 4.1), then Lock, Back to kiosk mode, the idle end, and the cap; Dev's own login untouched; no page scroll in any of them.

### 4.1 Dev data

Dev's household: Alex (parent, `person.alex` linked to the user `alex`, not an admin) and Blair (parent with the test PIN 2468, `person.blair` linked to no user). Neither may exit as the household stands, which the checks cover first (no button; `kiosk/exit` refused `not_admin`). For the admin case, a check links Blair's member to `person.dev` (linked to the `dev` admin) for its duration and puts `person.blair` back at its end; every check that changes the household says so and restores it.

## 5. Out of scope

- Locking the device, blocking typed addresses, or the browser's back button (the device's job; said in D6).
- A kiosk for non-shared accounts, or per-device settings.
- Hiding other panels' headers (Home Assistant's own switch already removes their menu button, so they lead nowhere new).

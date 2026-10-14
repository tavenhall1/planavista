# PlanaVista's own dashboard: onboarding without manual setup

Date: 2026-10-14. Approved in chat by the owner ("A", then "looks good").

## Why

After a HACS install, a person had to create a dashboard, add a view, and add the card before PlanaVista showed anything. The owner wants that done for them, then the setup wizard to start.

## What

1. **A dashboard of its own.** When PlanaVista is added (a new config entry from the config flow), it creates a "PlanaVista" dashboard: one panel view holding the card (`custom:planavista-card`). It appears in the sidebar at once, with no reload. The config flow's last screen says so.
2. **How.** The way Home Assistant registers its own storage dashboards: a `LovelaceStorage` in `hass.data[LOVELACE_DATA].dashboards` and a built-in `lovelace` panel (`frontend.async_register_built_in_panel`). It is a real dashboard (edit it, add views and cards, use kiosk mode); its layout lives in `.storage/lovelace.planavista` and survives restarts. It is not in Home Assistant's Dashboards list; PlanaVista manages it.
3. **Its address.** `/planavista`, or `/planavista-home` when that is taken by another dashboard or panel. Nothing else is overwritten; with both taken, no dashboard is made.
4. **The setup wizard starts by itself** the first time an admin opens the card while setup isn't finished (no "Tap to begin setup"). Other logins and shared screens see what they see today.
5. **A switch.** Settings, About: "Show PlanaVista in the sidebar" (admins). Off removes the sidebar entry and keeps the layout; on brings back the same dashboard. Existing installs aren't changed; the switch adds the dashboard there.
6. **Removing the integration** removes the dashboard and its layout.

## Data

A small Store, `planavista.dashboard` (version 1): `{shown: bool, url_path: str | null}`. A new config entry carries `dashboard_offer: true` in its data, so its first setup shows the dashboard; entries without it (existing installs) start hidden. The Store, not the entry, holds the state, so the calendar and display saves (which replace `calendars` and `display`) never touch it.

## Commands

`planavista/dashboard/get` returns `{shown, url_path, available}` (available: Home Assistant's dashboards are loaded); `planavista/dashboard/set` with `{shown}` (admins only) shows or hides it and returns the same.

## Rollback

0.9.x ignores the Store and the entry's `dashboard_offer`; the dashboard's panel is gone after a step back (nothing registers it) and its layout file stays, unused, until it comes back.

## Tests

Backend: a new entry makes the dashboard at `/planavista` with the default layout; an existing entry doesn't; a taken address uses `/planavista-home`; hide, show, and a restart keep the layout; removing the entry deletes it; set refuses non-admins. Card: the first-run wizard opens by itself for an admin, once per page; the About switch. A fresh Home Assistant 2026.10 copy, from adding the integration to the wizard opening.

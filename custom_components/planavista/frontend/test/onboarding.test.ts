import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { opensSetupByItself } from '../src/core/setup-flow';

const read = (path: string) => readFileSync(new URL(`../src/${path}`, import.meta.url), 'utf-8').replace(/\r\n/g, '\n');

// The owner, 2026-10-14: once PlanaVista's own dashboard is there, setup starts by itself.
describe('first-run setup opens by itself', () => {
  it('for a screen that may set up without a PIN, once a page', () => {
    const first = { firstRun: true, access: 'open' as const, admin: true, opened: false, busy: false };
    expect(opensSetupByItself(first)).toBe(true);
    expect(opensSetupByItself({ ...first, opened: true })).toBe(false);
    expect(opensSetupByItself({ ...first, access: 'pin' })).toBe(false);
    expect(opensSetupByItself({ ...first, access: 'none' })).toBe(false);
    expect(opensSetupByItself({ ...first, firstRun: false })).toBe(false);
    // Admins only (a parent's own login asks first), and never over Settings someone has open.
    expect(opensSetupByItself({ ...first, admin: false })).toBe(false);
    expect(opensSetupByItself({ ...first, busy: true })).toBe(false);
  });

  it('the card opens it on first run and remembers it did, for the page', () => {
    const card = read('shell/planavista-card.ts');
    expect(card).toMatch(/let setupOpenedOnPage = false;/);
    expect(card).toMatch(/admin: !!this\.hass\?\.user\?\.is_admin, opened: setupOpenedOnPage, busy: this\._settingsOpen \|\| !!this\._sheet,\n\s+\}\) && !this\._wizardOpen\) \{\n\s+setupOpenedOnPage = true;\n\s+this\._wizardOpen = true;/);
  });
});

describe("Settings, About: PlanaVista's dashboard in the sidebar", () => {
  it('says when both of its addresses belong to other dashboards, and that hidden it stays at its address', () => {
    const about = read('shell/settings/about-page.ts');
    expect(about).toMatch(/if \(dashboard\.taken\) \{\n\s+return "It can't be added: /);
    expect(about).toMatch(/\/planavista and \/planavista-home both belong to other dashboards/);
    expect(about).toMatch(/Hidden, it stays at its address for screens that use it, with your changes\./);
  });

  it('an admin turns it on and off', () => {
    const about = read('shell/settings/about-page.ts');
    expect(about).toMatch(/type: 'planavista\/dashboard\/get'/);
    expect(about).toMatch(/type: 'planavista\/dashboard\/set', shown/);
    expect(about).toMatch(/Show PlanaVista in the sidebar/);
    expect(about).toMatch(/this\.hass\?\.user\?\.is_admin/);
  });
});

import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { opensSetupByItself } from '../src/core/setup-flow';

const read = (path: string) => readFileSync(new URL(`../src/${path}`, import.meta.url), 'utf-8').replace(/\r\n/g, '\n');

// The owner, 2026-10-14: once PlanaVista's own dashboard is there, setup starts by itself.
describe('first-run setup opens by itself', () => {
  it('for a screen that may set up without a PIN, once a page', () => {
    expect(opensSetupByItself(true, 'open', false)).toBe(true);
    expect(opensSetupByItself(true, 'open', true)).toBe(false);
    expect(opensSetupByItself(true, 'pin', false)).toBe(false);
    expect(opensSetupByItself(true, 'none', false)).toBe(false);
    expect(opensSetupByItself(false, 'open', false)).toBe(false);
  });

  it('the card opens it on first run and remembers it did, for the page', () => {
    const card = read('shell/planavista-card.ts');
    expect(card).toMatch(/let setupOpenedOnPage = false;/);
    expect(card).toMatch(/if \(opensSetupByItself\(firstRun, this\._access\(\), setupOpenedOnPage\) && !this\._wizardOpen\) \{\n\s+setupOpenedOnPage = true;\n\s+this\._wizardOpen = true;/);
  });
});

describe("Settings, About: PlanaVista's dashboard in the sidebar", () => {
  it('an admin turns it on and off', () => {
    const about = read('shell/settings/about-page.ts');
    expect(about).toMatch(/type: 'planavista\/dashboard\/get'/);
    expect(about).toMatch(/type: 'planavista\/dashboard\/set', shown/);
    expect(about).toMatch(/Show PlanaVista in the sidebar/);
    expect(about).toMatch(/this\.hass\?\.user\?\.is_admin/);
  });
});

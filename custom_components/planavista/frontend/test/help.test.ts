import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { HELP } from '../src/core/help';

/** Help in Settings (0.12.0, spec D9): every setting's ? has words, and every entry is on a page. */
const SRC = fileURLToPath(new URL('../src/', import.meta.url));
const read = (path: string) => readFileSync(path, 'utf-8').split(String.fromCharCode(13)).join('');
const DASH = String.fromCharCode(0x2014);

function filesUnder(dir: string): string[] {
  return readdirSync(dir).flatMap(name => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? filesUnder(path) : path.endsWith('.ts') ? [path] : [];
  });
}

const SOURCES = filesUnder(SRC)
  .filter(path => !path.endsWith(join('core', 'help.ts')))
  .map(path => ({ path, text: read(path) }));

describe('help in Settings', () => {
  it('uses every entry on some page', () => {
    for (const id of Object.keys(HELP)) {
      const used = SOURCES.some(f => f.text.includes(`'${id}'`));
      expect(used, id).toBe(true);
    }
  });

  it('opens an explainer for every ? a page draws on its own', () => {
    for (const { path, text } of SOURCES) {
      const drawn = [...text.matchAll(/help(?:Label|Button)\(this\._help, '([a-z_]+)'/g)].map(m => m[1]);
      for (const id of drawn) expect(text.includes(`helpBox(this._help, '${id}'`), `${path}: ${id}`).toBe(true);
    }
  });

  it('says what each is for and how it works, in plain sentences', () => {
    for (const [id, entry] of Object.entries(HELP)) {
      for (const part of [entry.what, entry.how]) {
        expect(part.trim(), id).toMatch(/[.?]$/);
        expect(part.includes(DASH), id).toBe(false);
        // A parent's OK is approval (the owner, 2026-10-13).
        expect(part, id).not.toMatch(/\bOK\b/);
      }
    }
  });

  it('gives the Shared screens and PIN pages a ? on every setting', () => {
    const screens = read(join(SRC, 'shell/settings/screens-page.ts'));
    for (const id of ['shared_screen', 'night', 'kiosk', 'kiosk_top_bar', 'screensaver', 'screensaver_after',
      'screensaver_screen', 'screensaver_motion', 'screensaver_try', 'dim_day', 'dim_night']) {
      expect(screens.includes(`'${id}'`), id).toBe(true);
    }
    const pins = read(join(SRC, 'shell/settings/pins-page.ts'));
    for (const id of ['pins', 'shuffle_keypad', 'lock_after', 'parent_mode_ends']) expect(pins.includes(`'${id}'`), id).toBe(true);
  });

  it('puts a ? on every Settings page that has settings', () => {
    const pages = ['shell/settings/about-page.ts', 'shell/settings/person-page.ts', 'shell/settings/pv-appearance-editor.ts',
      'shell/settings/pv-settings-customize.ts', 'modules/calendar/settings/options-page.ts', 'modules/calendar/settings/calendars-page.ts',
      'modules/chores/settings/pv-chore-editor.ts', 'modules/chores/settings/pv-rules-page.ts', 'modules/chores/settings/pv-reminders-page.ts',
      'modules/chores/settings/pv-reward-editor.ts', 'modules/chores/settings/pv-rewards-page.ts', 'modules/chores/settings/pv-chores-list-page.ts',
      'modules/chores/settings/pv-import-export-page.ts', 'modules/chores/settings/pv-person-chores.ts', 'modules/chores/settings/pv-person-sleep.ts',
      'modules/chores/settings/pv-person-phones.ts', 'modules/chores/settings/pv-person-stars.ts'];
    for (const page of pages) {
      const text = read(join(SRC, page));
      expect(text.includes('new HelpState(this)') && text.includes('helpStyles,'), page).toBe(true);
      // Every section head on these pages carries its ?.
      expect(text.match(/<h2 class="section-label">[A-Z]/g), page).toBeNull();
    }
  });

  it('draws the ? as a real button that says what it opens', () => {
    const help = read(join(SRC, 'core/help.ts'));
    expect(help).toMatch(/<button class="pv-q" type="button" aria-label=\$\{`About \$\{name\}`\} aria-expanded=/);
    expect(help).toMatch(/aria-controls=\$\{`help-\$\{key\}`\}/);
    expect(help).toMatch(/width: 44px;\n\s+height: 44px;/);
  });
});

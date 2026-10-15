import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { HELP } from '../src/core/help';

/** Help in Settings (0.12.0, spec D9): every setting's ? has words, and every entry is on a page. */
const SRC = fileURLToPath(new URL('../src/', import.meta.url));

function filesUnder(dir: string): string[] {
  return readdirSync(dir).flatMap(name => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? filesUnder(path) : path.endsWith('.ts') ? [path] : [];
  });
}

const SOURCES = filesUnder(SRC)
  .filter(path => !path.endsWith(join('core', 'help.ts')))
  .map(path => ({ path, text: readFileSync(path, 'utf-8').replace(/\r\n/g, '\n') }));

describe('help in Settings', () => {
  it('uses every entry on some page', () => {
    for (const id of Object.keys(HELP)) {
      const used = SOURCES.some(f => new RegExp(`'${id}'`).test(f.text));
      expect(used, id).toBe(true);
    }
  });

  it('opens an explainer for every ? a page draws on its own', () => {
    for (const { path, text } of SOURCES) {
      const labelled = [...text.matchAll(/helpLabel\(this\._help, '([a-z_]+)'/g)].map(m => m[1]);
      for (const id of labelled) expect(text, `${path}: ${id}`).toMatch(new RegExp(`helpBox\\(this\\._help, '${id}'`));
    }
  });

  it('says what each is for and how it works, in plain sentences', () => {
    for (const [id, entry] of Object.entries(HELP)) {
      for (const part of [entry.what, entry.how]) {
        expect(part.trim(), id).toMatch(/[.?]$/);
        expect(part, id).not.toMatch(/—|&mdash;/);
        // A parent's OK is approval (the owner, 2026-10-13).
        expect(part, id).not.toMatch(/\bOK\b/);
      }
    }
  });

  it('gives the Shared screens and PIN pages a ? on every setting', () => {
    const screens = readFileSync(join(SRC, 'shell/settings/screens-page.ts'), 'utf-8');
    for (const id of ['shared_screen', 'night', 'kiosk', 'kiosk_top_bar', 'screensaver', 'screensaver_after',
      'screensaver_screen', 'screensaver_motion', 'screensaver_try', 'dim_day', 'dim_night']) {
      expect(screens, id).toMatch(new RegExp(`'${id}'`));
    }
    const pins = readFileSync(join(SRC, 'shell/settings/pins-page.ts'), 'utf-8');
    for (const id of ['pins', 'shuffle_keypad', 'lock_after', 'parent_mode_ends']) expect(pins, id).toMatch(new RegExp(`'${id}'`));
  });

  it('draws the ? as a real button that says what it opens', () => {
    const help = readFileSync(join(SRC, 'core/help.ts'), 'utf-8');
    expect(help).toMatch(/<button class="pv-q" type="button" aria-label=\$\{`About \$\{name\}`\} aria-expanded=/);
    expect(help).toMatch(/aria-controls=\$\{`help-\$\{key\}`\}/);
    expect(help).toMatch(/width: 44px;\n\s+height: 44px;/);
  });
});

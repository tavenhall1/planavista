import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { segmentedStyles } from '../src/styles/controls';

const SRC = fileURLToPath(new URL('../src/', import.meta.url));

function sources(dir: string): string[] {
  return readdirSync(dir).flatMap(name => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? sources(path) : path.endsWith('.ts') ? [path] : [];
  });
}

const FILES = sources(SRC).map(path => ({ path: path.slice(SRC.length).replace(/\\/g, '/'), text: readFileSync(path, 'utf-8') }));

describe('one control for each kind of choice (milestone 8, spec 3.9)', () => {
  // The old looks for "pick one of a few": the bar's switcher and views, settings segments, pills, view cards.
  const OLD = [/class="seg\b/, /class="seg-inner/, /class="seg-btn/, /class="segmented/, /class="pill-group/, /class="pill-btn/, /class="view-card/];

  it.each(FILES.map(f => [f.path, f.text]))('%s draws pick-one choices with the shared control', (_path, text) => {
    for (const pattern of OLD) expect(text).not.toMatch(pattern);
  });

  it('the bar puts modules and views in the same control', () => {
    const bar = FILES.find(f => f.path === 'shell/pv-nav-bar.ts')!.text;
    expect(bar).toMatch(/class="pv-seg[^"]*" role="group" aria-label="Modules"/);
    expect(bar).toMatch(/class="views pv-seg[^"]*" role="group" aria-label="Views"/);
  });

  it('every part of the control is a 48 px target', () => {
    const text = segmentedStyles.cssText;
    const button = /\.pv-seg > button \{([^}]*)\}/.exec(text)?.[1] ?? '';
    expect(button).toMatch(/height:\s*48px/);
    expect(button).toMatch(/min-width:\s*48px/);
  });

  it('named choices with a line of explanation are rows with a check, not bare radios', () => {
    const person = FILES.find(f => f.path === 'shell/settings/person-page.ts')!.text;
    const rules = FILES.find(f => f.path === 'modules/chores/settings/pv-rules-page.ts')!.text;
    expect(person).toMatch(/class="pv-choices"/);
    expect(rules).toMatch(/class="pv-choices"/);
    expect(person).not.toMatch(/class="radio"/);
    expect(rules).not.toMatch(/class="row radio"/);
  });
});

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

  it('every button looks like one family, and disabled buttons look disabled', () => {
    const shared = FILES.find(f => f.path === 'styles/shared.ts')!.text;
    const btn = /\n {2}\.pv-btn \{([^}]*)\}/.exec(shared)?.[1] ?? '';
    expect(btn).toMatch(/min-height:\s*48px/);
    expect(btn).toMatch(/font-weight:\s*600/);
    expect(btn).toMatch(/border-radius:\s*var\(--pv-radius,/);
    expect(shared).toMatch(/\.pv-btn:disabled[^{]*\{[^}]*opacity:\s*0\.45/);
    expect(shared).toMatch(/\.pv-btn-danger \{[^}]*var\(--pv-danger,/);
    expect(shared).toMatch(/\.pv-btn\.danger \{[^}]*var\(--pv-danger-ink,/);
  });

  it('one red pair for destructive actions, light and dark', () => {
    const themes = FILES.find(f => f.path === 'styles/theme-pairs.ts')!.text;
    expect(themes.match(/'--pv-danger-ink':/g)?.length).toBeGreaterThanOrEqual(2);
  });

  it('one switch for every on and off setting, a 48 px target', () => {
    for (const f of FILES) expect(f.text, f.path).not.toMatch(/\n\s*\.switch \{/);
    const shared = FILES.find(f => f.path === 'styles/shared.ts')!.text;
    expect(shared).toMatch(/\.pv-toggle::before \{[^}]*inset:\s*-12px/);
    expect(shared).toMatch(/\.pv-toggle\[aria-checked='true'\]/);
  });

  it('one tag, in sentence case', () => {
    for (const f of FILES) if (f.path !== 'styles/controls.ts') expect(f.text, f.path).not.toMatch(/\n\s*\.tag \{/);
    expect(FILES.find(f => f.path === 'styles/controls.ts')!.text).toMatch(/\.pv-tag \{/);
  });

  it('section heads are sentence case everywhere', () => {
    for (const f of FILES) expect(f.text, f.path).not.toMatch(/text-transform:\s*uppercase/);
  });

  // Controls a finger uses that were drawn under 48 px (DESIGN_SYSTEM 11, spec 11.8).
  const TARGETS: Array<[string, string]> = [
    ['core/color-swatch-picker.ts', '.swatch-btn'], ['core/pv-recurrence-picker.ts', '.day'], ['core/pv-recurrence-picker.ts', 'select'],
    ['core/pv-toast.ts', 'button'], ['modules/chores/pv-chore-options.ts', '.chip'], ["modules/chores/pv-chore-options.ts", "input[type='text']"],
    ['modules/chores/pv-chores-day-sheet.ts', '.link'], ['modules/chores/pv-chores-inbox.ts', '.done'], ['modules/chores/pv-chores-inbox.ts', '.link'],
    ['modules/chores/pv-chores-inbox.ts', '.answers button'], ['modules/chores/pv-chores-inbox.ts', '.chip'], ['modules/chores/pv-chores-inbox.ts', 'input'],
    ['modules/chores/pv-chores-my-day.ts', '.tl-row'], ['modules/chores/pv-chores-quick-add.ts', '.text'], ['modules/chores/pv-chores-quick-add.ts', '.chip'],
    ['modules/chores/pv-chores-quick-add.ts', '.stepper button'], ['modules/chores/pv-chores-reward-sheet.ts', '.toggle'],
    ['modules/chores/pv-chores-reward-sheet.ts', '.pictures button'], ['modules/chores/pv-chores-rewards.ts', '.card .action'],
    ['modules/chores/pv-chores-week.ts', '.nav'], ['modules/chores/pv-chores-week.ts', '.highlights .link'],
    ['modules/chores/settings/pv-chore-editor.ts', '.name-row input'], ['modules/chores/settings/pv-chore-editor.ts', '.day'],
    ['modules/chores/settings/pv-chore-editor.ts', '.copy'], ['modules/chores/settings/pv-chores-list-page.ts', '.finished-link'],
    ['modules/chores/settings/pv-import-preview.ts', '.link'], ['modules/chores/settings/pv-person-chores.ts', '.remove'],
    ['modules/chores/settings/pv-person-phones.ts', '.copy'], ['modules/chores/settings/pv-reward-editor.ts', '.name-row input'],
    ['modules/chores/settings/settings-styles.ts', '.chip'], ['modules/chores/settings/settings-styles.ts', '.stepper button'],
    ['modules/chores/setup/pv-setup-common-chores.ts', '.chip'], ['shell/settings/pin-actions.ts', '.buttons button'],
    ['shell/setup/people-step.ts', '.role'], ['shell/setup/pv-setup.ts', '.second'],
  ];

  it.each(TARGETS)('%s %s is at least 48 px', (path, selector) => {
    const text = FILES.find(f => f.path === path)!.text;
    const rule = new RegExp('\\n\\s*' + selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ' \\{([^}]*)\\}').exec(text)?.[1];
    expect(rule, `${path} ${selector}`).toBeDefined();
    const sizes = [...rule!.matchAll(/(?:^|[\s;])(min-height|height|min-width|width):\s*(\d+)px/g)].map(m => Number(m[2]));
    expect(sizes.length).toBeGreaterThan(0);
    for (const size of sizes) expect(size).toBeGreaterThanOrEqual(48);
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

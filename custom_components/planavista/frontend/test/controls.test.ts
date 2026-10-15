import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { chipStyles, segmentedStyles } from '../src/styles/controls';

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
    // A choice never shrinks to cut its word (the bar's views on a phone).
    expect(button).toMatch(/flex:\s*0 0 auto/);
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
    ['core/pv-toast.ts', 'button'], ["modules/chores/pv-chore-options.ts", "input[type='text']"],
    ['modules/chores/pv-chores-day-sheet.ts', '.link'], ['modules/chores/pv-chores-inbox.ts', '.done'], ['modules/chores/pv-chores-inbox.ts', '.link'],
    ['modules/chores/pv-chores-inbox.ts', '.answers button'], ['modules/chores/pv-chores-inbox.ts', 'input'],
    ['modules/chores/pv-chores-my-day.ts', '.tl-row'], ['modules/chores/pv-chores-quick-add.ts', '.text'],
    ['modules/chores/pv-chores-quick-add.ts', '.stepper button'], ['modules/chores/pv-chores-reward-sheet.ts', '.toggle'],
    ['modules/chores/pv-chores-reward-sheet.ts', '.pictures button'], ['modules/chores/pv-chores-rewards.ts', '.card .action'],
    ['modules/chores/pv-chores-week.ts', '.nav'], ['modules/chores/pv-chores-week.ts', '.highlights .link'],
    ['modules/chores/settings/pv-chore-editor.ts', '.name-row input'], ['modules/chores/settings/pv-chore-editor.ts', '.day'],
    ['modules/chores/settings/pv-chore-editor.ts', '.copy'], ['modules/chores/settings/pv-chores-list-page.ts', '.finished-link'],
    ['modules/chores/settings/pv-import-preview.ts', '.link'], ['modules/chores/settings/pv-person-chores.ts', '.remove'],
    ['modules/chores/settings/pv-person-phones.ts', '.copy'], ['modules/chores/settings/pv-reward-editor.ts', '.name-row input'],
    ['modules/chores/settings/settings-styles.ts', '.stepper button'],
    ['shell/settings/pin-actions.ts', '.buttons button'],
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

describe('one chip look, and the tags (review)', () => {
  const sources = ['modules/chores/pv-chores-quick-add.ts', 'modules/chores/settings/settings-styles.ts', 'modules/chores/pv-chore-options.ts',
    'modules/chores/pv-chores-inbox.ts', 'modules/chores/setup/pv-setup-common-chores.ts'];

  it('every chip is a 48 px target', () => {
    const chip = /\.chip \{([^}]*)\}/.exec(chipStyles.cssText)?.[1] ?? '';
    expect(chip).toMatch(/min-height:\s*48px/);
  });

  it('chips that wrap are drawn by the shared chip styles only', () => {
    for (const path of sources) {
      const text = readFileSync(new URL(`../src/${path}`, import.meta.url), 'utf-8');
      expect(text, path).not.toMatch(/^\s*\.chip \{/m);
      expect(text, path).toMatch(/chipStyles/);
    }
  });

  it('Organizer is a tag in the details sheet and the editor', () => {
    for (const path of ['modules/calendar/components/event-popup.ts', 'modules/calendar/components/event-create-dialog.ts']) {
      const text = readFileSync(new URL(`../src/${path}`, import.meta.url), 'utf-8');
      expect(text, path).toMatch(/class="pv-tag[^"]*">Organizer</);
    }
  });
});

describe("Appearance's Automatic rules (review)", () => {
  it('are choice rows around real radios, like Age group', () => {
    const text = readFileSync(new URL('../src/shell/settings/pv-appearance-editor.ts', import.meta.url), 'utf-8');
    expect(text).toMatch(/class="pv-choices" role="radiogroup" aria-labelledby="switch-heading"/);
    expect(text).toMatch(/<input type="radio" name="appearance-switch"/);
    expect(text).not.toMatch(/class="row" type="button" role="radio"/);
  });
});

describe('targets and roles (review)', () => {
  it("every bar button is at least 48 px wide, the short + too", () => {
    const bar = readFileSync(new URL('../src/shell/pv-nav-bar.ts', import.meta.url), 'utf-8');
    expect(/\.action \{([^}]*)\}/.exec(bar)?.[1] ?? '').toMatch(/min-width: 48px/);
  });

  it('every segmented control carries its own role and label', () => {
    const customize = readFileSync(new URL('../src/shell/settings/pv-settings-customize.ts', import.meta.url), 'utf-8');
    expect(customize).not.toMatch(/<div class="pv-seg">/);
  });
});

describe('one section head (review, spec 3.9)', () => {
  const HEADS: Array<[string, string]> = [
    ['styles/shared.ts', '.pv-label'], ['shell/settings/pv-settings.ts', '.group-label'],
    ['shell/settings/person-page.ts', '.field > .label,\n      legend'], ['modules/chores/settings/pv-person-chores.ts', '.legend'],
    ['modules/chores/settings/pv-person-phones.ts', '.legend'], ['modules/chores/settings/pv-person-sleep.ts', '.legend'],
    ['shell/settings/pv-appearance-editor.ts', '.section-heading'], ['shell/settings/pv-settings-customize.ts', '.section-heading'],
    ['shell/settings/pins-page.ts', 'h2'], ['shell/settings/screens-page.ts', 'h2'], ['modules/chores/settings/settings-styles.ts', '.section-label'],
    ['modules/chores/chores-styles.ts', '.section-head'], ['modules/chores/pv-chores-quick-add.ts', '.title'],
  ];

  it.each(HEADS)('%s %s is 0.8125rem 750 in the secondary text color', (path, selector) => {
    const text = readFileSync(new URL(`../src/${path}`, import.meta.url), 'utf-8').replace(/\r\n/g, '\n');
    const at = text.indexOf(`${selector} {`);
    expect(at, `${path} ${selector}`).toBeGreaterThan(-1);
    const rule = text.slice(at, text.indexOf('}', at));
    expect(rule).toMatch(/font-size: 0\.8125rem/);
    expect(rule).toMatch(/font-weight: 750/);
    expect(rule).toMatch(/color: var\(--pv-text-secondary/);
  });

  it("My day's This week head is the same in every layout", () => {
    const text = readFileSync(new URL('../src/modules/chores/pv-chores-my-day.ts', import.meta.url), 'utf-8');
    expect(text).not.toMatch(/<h3[^>]*>This week</);
  });
});

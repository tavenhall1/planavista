import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

// Sheets and editors end the same way everywhere (milestone 8, spec 3.10). Element behavior is checked on
// the dev Home Assistant; these pin the markup rules that check depends on.
const read = (path: string) => readFileSync(new URL(`../src/${path}`, import.meta.url), 'utf-8');

/** Each `.actions=${[ ... ]}` list of a notice sheet, as the kinds and labels in order. */
function confirmations(text: string): Array<Array<{ kind: string; label: string }>> {
  return [...text.matchAll(/\.actions=\$\{\[([\s\S]*?)\]\}/g)].map(m =>
    [...m[1].matchAll(/label: (`[^`]*`|'(?:[^'\\]|\\.)*'), kind: '(\w+)'/g)].map(a => ({ label: a[1], kind: a[2] })));
}

describe('sheets and editors (milestone 8, spec 3.10)', () => {
  it('sheet titles are one style: left aligned, the rounded face at 800', () => {
    const sheet = read('styles/sheet.ts');
    const heading = /\.heading \{([^}]*)\}/.exec(sheet)?.[1] ?? '';
    expect(heading).toMatch(/font-weight:\s*800/);
    expect(heading).toMatch(/text-align:\s*left/);
  });

  it('a sheet opens with focus on its title, so nothing looks chosen', () => {
    expect(read('shell/sheet-controller.ts')).toMatch(/querySelector<HTMLElement>\('h2\[tabindex="-1"\]'\)/);
    for (const [path, id] of [['modules/chores/pv-chores-inbox.ts', 'inbox-title'], ['modules/chores/pv-chore-options.ts', 'options-title'],
      ['modules/chores/pv-chores-people-sheet.ts', 'people-heading'], ['modules/chores/pv-chores-day-sheet.ts', 'day-title']]) {
      const text = read(path);
      expect(text, path).toMatch(new RegExp(`id="${id}" tabindex="-1"`));
      expect(text, path).toMatch(new RegExp(`querySelector<HTMLElement>\\('#${id}'\\)\\?\\.focus\\(\\)`));
    }
  });

  it('read-only sheets end with a full-width secondary Done', () => {
    for (const path of ['modules/chores/pv-chores-inbox.ts', 'modules/chores/pv-chores-reward-sheet.ts']) {
      expect(read(path), path).not.toMatch(/pv-btn-ghost[^\n]{0,160}?>Done</);
    }
  });

  it('editing sheets end with Cancel, then the action', () => {
    const quick = read('modules/chores/pv-chores-quick-add.ts');
    expect(quick).not.toMatch(/class="bar"/);
    const footer = /<div class="sheet-footer">([\s\S]*?)<\/div>/.exec(quick)?.[1] ?? '';
    expect(footer.indexOf('>Cancel<')).toBeGreaterThan(-1);
    expect(footer.indexOf('>Cancel<')).toBeLessThan(footer.indexOf("'Add'"));
    const reward = read('modules/chores/pv-chores-reward-sheet.ts');
    const rewardFooter = /<div class="sheet-footer">([\s\S]*?)<\/div>/.exec(reward)?.[1] ?? '';
    expect(rewardFooter.indexOf('>Cancel<')).toBeLessThan(rewardFooter.indexOf('this._save'));
  });

  it('delete in place is one style: a secondary button in red, set apart', () => {
    expect(read('modules/chores/pv-chores-reward-sheet.ts')).toMatch(/pv-btn pv-btn-secondary danger[^\n]*>Delete reward</);
    expect(read('modules/calendar/components/event-popup.ts')).toMatch(/pv-btn pv-btn-secondary danger apart[\s\S]{0,200}'Delete event'/);
    expect(read('modules/chores/pv-chore-options.ts')).toMatch(/option\.destructive\)\.map[\s\S]{0,120}pv-btn pv-btn-secondary danger/);
  });

  it('confirmations put the named destructive action first', () => {
    for (const path of ['modules/chores/settings/pv-chore-editor.ts', 'modules/chores/settings/pv-reward-editor.ts', 'shell/settings/person-page.ts',
      'shell/settings/pin-actions.ts', 'modules/chores/pv-chores-module.ts', 'modules/calendar/components/event-create-dialog.ts']) {
      for (const actions of confirmations(read(path))) {
        if (!actions.some(a => a.kind === 'destructive')) continue;
        expect(actions[0].kind, `${path}: ${actions.map(a => a.label).join(', ')}`).toBe('destructive');
        expect(actions[0].label, path).not.toMatch(/^'(Delete|Remove|Discard)'$/);
      }
    }
  });

  it('one toast everywhere, its colors from tokens, every message ending with a full stop', () => {
    for (const path of ['shell/settings/pv-settings.ts', 'shell/setup/pv-setup.ts']) {
      const text = read(path);
      expect(text, path).toMatch(/<pv-toast/);
      expect(text, path).not.toMatch(/class="toast"/);
    }
    const toast = read('core/pv-toast.ts');
    expect(toast).toMatch(/var\(--pv-toast-bg,/);
    expect(toast).not.toMatch(/background: #1F2023/);
    const module = read('modules/chores/pv-chores-module.ts');
    expect(module).toMatch(/\?\? 'Done\.'/);
    // Someone else's check-off says who got the credit (and the stars only when they earn them): creditedText, tested with its words.
    expect(module).toMatch(/creditedText\(/);
  });
});

describe('empty states (milestone 8, spec 3.12)', () => {
  it('the inbox and the Day view use the shared designed state', () => {
    for (const path of ['modules/chores/pv-chores-inbox.ts', 'modules/calendar/components/view-day.ts']) {
      const text = read(path);
      expect(text, path).toMatch(/class="state"/);
      expect(text, path).not.toMatch(/class="empty(-state)?"/);
      expect(text, path).toMatch(/statusStyles/);
    }
  });
});

describe('Settings pages share one layout (milestone 8)', () => {
  it('one column, 640 px at most, from the left, on every page', () => {
    const host = read('shell/settings/pv-settings.ts');
    expect(host).toMatch(/\.page-el \{[^}]*max-width: 640px/);
    const shared = read('styles/settings.ts');
    const content = /\.page-content \{([^}]*)\}/.exec(shared)?.[1] ?? '';
    expect(content).not.toMatch(/margin: 0 auto/);
    expect(content).not.toMatch(/max-width: 560px/);
  });
});

describe("Customize shows what applies (milestone 8)", () => {
  it("Corners and Shadows offer the theme's own, chosen until another is picked", () => {
    const text = read('shell/settings/pv-settings-customize.ts');
    expect(text).toMatch(/key: 'corner_style', label: 'Corners', options: \[\['', 'Theme'\]/);
    expect(text).toMatch(/key: 'shadow_depth', label: 'Shadows', options: \[\['', 'Theme'\]/);
  });
});

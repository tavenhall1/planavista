import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const read = (path: string) => readFileSync(new URL(`../src/${path}`, import.meta.url), 'utf-8');

describe('Settings editors keep Save in view (milestone 8, spec 3.10)', () => {
  const EDITORS = ['shell/settings/person-page.ts', 'modules/chores/settings/pv-chore-editor.ts', 'modules/chores/settings/pv-reward-editor.ts'];

  it.each(EDITORS)('%s tells Settings it is an editor, and draws no Cancel and Save of its own', path => {
    const text = read(path);
    expect(text).toMatch(/announceEditor\(this, editor\)/);
    expect(text).not.toMatch(/class="actions">\s*<button class="pv-btn pv-btn-secondary" type="button" @click=\$\{this\._cancel\}>Cancel/);
  });

  it('Settings puts an editor\'s Cancel and Save in its header, and its own Done is a text button', () => {
    const settings = read('shell/settings/pv-settings.ts');
    expect(settings).toMatch(/addEventListener\(PAGE_EDITOR/);
    // A page that left can't send anything, so another page in view clears the editor.
    expect(settings).toMatch(/changed\.has\('_stack'\) \|\| changed\.has\('_selected'\)\) this\._editor = null/);
    expect(settings).toMatch(/class="pv-btn pv-btn-ghost done"/);
    expect(settings).toMatch(/class="pv-btn pv-btn-primary save"/);
  });
});

describe('one name for each action, and one primary per screen (milestone 8, spec 3.10)', () => {
  it('creating something is New ...', () => {
    expect(read('modules/chores/pv-chores-rewards.ts')).toMatch(/\+ New reward/);
    expect(read('modules/chores/pv-chores-rewards.ts')).not.toMatch(/Add a reward/);
    const people = read('shell/settings/people-page.ts');
    expect(people.match(/\+ New person/g)).toHaveLength(1);
    expect(people).not.toMatch(/Add someone/);
    expect(read('modules/chores/pv-chores-module.ts')).toMatch(/>New chore<\/button>/);
  });

  it('inside a sheet, Edit is just Edit', () => {
    expect(read('modules/chores/options-derive.ts')).toMatch(/id: 'edit', label: 'Edit',/);
  });

  it('list rows answer with secondary buttons, and Restore is secondary to Import', () => {
    expect(read('modules/chores/pv-chores-rewards.ts')).toMatch(/pv-btn pv-btn-secondary accent action[^\n]*>Redeem</);
    expect(read('modules/chores/settings/pv-import-export-page.ts')).toMatch(/mode === 'restore' \? 'pv-btn-secondary' : 'pv-btn-primary'/);
  });
});

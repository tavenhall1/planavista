import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { editorExit } from '../src/core/page-host';

const source = (path: string) => readFileSync(fileURLToPath(new URL(`../src/${path}`, import.meta.url)), 'utf-8').replace(/\r\n/g, '\n');

// Round 3 (r3a A4): a parent changed a chore's name, another screen deleted the chore,
// and the editor was a dead end: Cancel asked a question it never drew, Save repeated
// "This chore was deleted on another screen.", and the draft stayed to be "kept".
describe("an editor's Cancel", () => {
  it('leaves at once without changes, and asks first with them', () => {
    expect(editorExit(false, false)).toBe('leave');
    expect(editorExit(true, false)).toBe('ask');
  });

  it('leaves and drops the draft once what it edits was deleted elsewhere', () => {
    expect(editorExit(true, true)).toBe('drop');
    expect(editorExit(false, true)).toBe('drop');
  });

  it.each([
    'modules/chores/settings/pv-chore-editor.ts',
    'modules/chores/settings/pv-reward-editor.ts',
    'shell/settings/person-page.ts',
  ])('%s follows it for Cancel and for leaving, and offers no Save once it is gone', path => {
    const editor = source(path);
    const body = (name: string) => {
      const start = editor.indexOf(`  ${name}`);
      return editor.slice(start, editor.indexOf('\n  }\n', start));
    };
    expect(body('private _cancel(): void {')).toMatch(/editorExit\(/);
    expect(body('confirmLeave(): Promise<boolean> {')).toMatch(/editorExit\(/);
    expect(body('protected updated(): void {')).toMatch(/ready: !\(this\._gone \|\|/);
  });
});

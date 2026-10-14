import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const read = (path: string) =>
  readFileSync(new URL(`../src/${path}`, import.meta.url), 'utf-8').replace(/\r\n/g, '\n');

// The second adversarial review's smaller findings.
describe('round 2 polish', () => {
  // Round 3 (r3c C4) found the opposite: with the dot leading the part after it, a wrapped line
  // started "· 🔥 3 days". Each part draws its dot before it, and the line clips the dot that
  // leads each wrapped line, so neither end of a line shows one.
  it("a column's stats line neither ends nor starts with a dot when it wraps", () => {
    const column = read('modules/chores/pv-chores-column.ts');
    expect(column).toMatch(/<span class="line"><span class="parts">\$\{model\.parts\.map\(part => html`<span class=\$\{part\.kind\}>\$\{part\.text\}<\/span>`\)\}<\/span><\/span>/);
    const rule = (selector: string) => column.slice(column.indexOf(`${selector} {`), column.indexOf('}', column.indexOf(`${selector} {`)));
    expect(rule('      .line')).toMatch(/overflow: hidden;/);
    expect(rule('      .parts')).toMatch(/flex-wrap: wrap;[\s\S]*margin-left: -1em;/);
    expect(rule('      .parts > span::before')).toMatch(/content: '·';[\s\S]*width: 1em;/);
  });

  it("a chore deleted on another screen while its options are open is named in the toast", () => {
    const module = read('modules/chores/pv-chores-module.ts');
    expect(module).toMatch(/this\._optionNames\.set\(sheet, found\.model\.title\);/);
    expect(module).toMatch(/text: `\$\{this\._optionNames\.get\(sheet\) \?\? this\._choreName\(sheet\.key\)\} changed on another screen\.`/);
  });

  // A tap on the board just after Done went to the leaving sheet's faded backdrop (240 ms).
  it('a sheet on its way out takes no taps, and one that opens again does', () => {
    const motion = read('shell/sheet-motion.ts');
    const close = motion.slice(motion.indexOf('async close('));
    expect(close.slice(0, close.indexOf('\n  }\n'))).toMatch(/this\._host\.style\.pointerEvents = 'none';/);
    const open = motion.slice(motion.indexOf('  open('));
    expect(open.slice(0, open.indexOf('\n  }\n'))).toMatch(/this\._host\.style\.pointerEvents = '';/);
  });

  // Settings vanished without a word when parent mode lapsed with an editor's changes unsaved.
  it('Settings says why it closed when parent mode ends, and that changes are kept', () => {
    const card = read('shell/planavista-card.ts');
    const guard = card.slice(card.indexOf('private _guardSettings() {'));
    const body = guard.slice(0, guard.indexOf('\n  }\n'));
    expect(body).toMatch(/const kept = \[\.\.\.this\._drafts\.keys\(\)\]\.some\(key => key !== 'appearance'\);/);
    expect(body).toMatch(/'Parent mode ended, so Settings closed\. Your changes are kept for when you come back\.'/);
    expect(body.indexOf('this._toast = {')).toBeLessThan(body.lastIndexOf('this._onSettingsClose();'));
  });

  // An offline check-off was stamped when it reached Home Assistant, not when it was done.
  it('a queued check-off sends the time it was done', () => {
    expect(read('modules/chores/chores-service.ts')).toMatch(/await this\.api\.complete\(entry\.occurrence, entry\.doneBy, new Date\(entry\.at\)\.toISOString\(\)\);/);
    expect(read('modules/chores/chores-client.ts')).toMatch(/complete\(occurrence: string, doneBy\?: string, at\?: string\): Promise<CompleteResult> \{/);
  });

  it("a long name in a people strip ends in an ellipsis instead of pushing the others off", () => {
    const controls = read('styles/controls.ts');
    expect(controls).toMatch(/\.pv-person \{[^}]*max-width: 88px;/);
    expect(controls).toMatch(/\.pv-person-name \{[^}]*text-overflow: ellipsis;/);
    for (const path of ['modules/chores/pv-chores-board.ts', 'modules/chores/pv-chores-my-day.ts', 'modules/calendar/components/view-day.ts']) {
      expect(read(path), path).toMatch(/<span class="pv-person-name">\$\{[^}]+\}<\/span>/);
    }
  });
});

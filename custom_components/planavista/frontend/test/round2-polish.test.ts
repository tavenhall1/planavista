import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const read = (path: string) =>
  readFileSync(new URL(`../src/${path}`, import.meta.url), 'utf-8').replace(/\r\n/g, '\n');

// The second adversarial review's smaller findings.
describe('round 2 polish', () => {
  it("a column's stats line never ends in a dot: the separator leads the part after it", () => {
    const column = read('modules/chores/pv-chores-column.ts');
    expect(column).toMatch(/model\.parts\.map\(\(part, i\) => html`\$\{i \? ' ' : ''\}<span class=\$\{part\.kind\}>\$\{i \? '· ' : ''\}\$\{part\.text\}<\/span>`\)/);
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

  it("a long name in a people strip ends in an ellipsis instead of pushing the others off", () => {
    const controls = read('styles/controls.ts');
    expect(controls).toMatch(/\.pv-person \{[^}]*max-width: 88px;/);
    expect(controls).toMatch(/\.pv-person-name \{[^}]*text-overflow: ellipsis;/);
    for (const path of ['modules/chores/pv-chores-board.ts', 'modules/chores/pv-chores-my-day.ts', 'modules/calendar/components/view-day.ts']) {
      expect(read(path), path).toMatch(/<span class="pv-person-name">\$\{[^}]+\}<\/span>/);
    }
  });
});

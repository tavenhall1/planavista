import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { pinReason } from '../src/core/pin-gate';
import { reviewQuestion, whenText } from '../src/modules/chores/inbox-derive';
import { itemOptions, type OptionsContext } from '../src/modules/chores/options-derive';
import { MEMBERS, TODAY, activity, item } from './chores-fixtures';

const src = (path: string) => readFileSync(fileURLToPath(new URL(`../src/${path}`, import.meta.url)), 'utf-8').replace(/\r\n/g, '\n');
const block = (source: string, selector: string): string => {
  const start = source.indexOf(`${selector} {`);
  expect(start, `no "${selector}" block`).toBeGreaterThan(-1);
  return source.slice(start, source.indexOf('}', start));
};
const dana = MEMBERS.find(m => m.id === 'dana')!;

// The eleventh adversarial round's screens findings (r11b).
describe('round 11: screens', () => {
  // I1: a double tap on Not done pressed a reason chip that scrolled under the finger.
  it("ignores the burst that opened Send back's reasons", () => {
    const inbox = src('modules/chores/pv-chores-inbox.ts');
    expect(inbox).toMatch(/if \(this\._sendingBack\) \{\n\s+\/\/ [^\n]*\n\s+guardPageTaps\(\);/);
    // Taller than the room below the sticky head, the reasons scrolled under it (found on the dev copy).
    expect(inbox).toMatch(/if \(head\) panel\.style\.scrollPaddingTop = `\$\{head\.offsetHeight \+ 8\}px`;/);
  });

  // I2: a long note crushed the chore's name and pushed Excuse it off the day sheet.
  it("puts a long badge under the name on the day sheet, where it wraps", () => {
    const sheet = src('modules/chores/pv-chores-day-sheet.ts');
    expect(sheet).toMatch(/const below = badgeBelow\(badge, false\);/);
    expect(sheet).toMatch(/<span class="name \$\{below \? 'below' : ''\}">/);
    expect(block(sheet, '      li .name.below .badge')).toMatch(/white-space: normal;/);
    expect(block(sheet, '      li .link')).toMatch(/flex: none;/);
  });

  // I3: a double tap on the bar's To approve opened it and closed it again.
  it("ignores the burst that opened To approve from the bar", () => {
    const module = src('modules/chores/pv-chores-module.ts');
    expect(module).toMatch(/if \(await this\.asParent\("Who's approving\?"\)\) \{\n\s+this\._sheet = \{ kind: 'inbox' \};\n\s+\/\/ [^\n]*\n\s+guardPageTaps\(\);/);
  });

  // M1: Wednesday 1:30 AM, two chore days back, read "Tuesday at 1:30 AM".
  it('names the calendar day for an early-hours check-off two or more days back', () => {
    expect(whenText('2026-10-14T01:30:00-05:00', '2026-10-15', '12h')).toBe('Wednesday at 1:30 AM');
    expect(whenText('2026-10-06T01:30:00-05:00', '2026-10-15', '12h')).toBe('Oct 6 at 1:30 AM');
    expect(whenText('2026-10-15T01:30:00-05:00', '2026-10-15', '12h')).toBe('Last night at 1:30 AM');
  });

  // M2: the keypad said nothing about why it asked.
  it("gives the PIN sheet a reason for counting a check-off as missed", () => {
    expect(pinReason(reviewQuestion({ kind: 'completion', late: true }, false))).toBe('To count it as missed');
  });

  // M3: "Overdue since Wed" was purple in the options sheet, red everywhere else.
  it("colors an overdue chore's note in its options as the board does", () => {
    const fish = item('feed_the_fish|dana|day:2026-10-12|0', { section: 'overdue', overdue_since: '2026-10-12' });
    const model = itemOptions({
      item: fish, activity: activity('feed_the_fish'), owner: dana, members: MEMBERS, today: TODAY, member: 'yes', parent: 'yes',
    } as OptionsContext);
    expect(model.noteTone).toBe('bad');
    const asked = itemOptions({
      item: item('feed_the_fish|dana|day:2026-10-13|0', { request: { id: 'r', kind: 'skip', until: null } as never }),
      activity: activity('feed_the_fish'), owner: dana, members: MEMBERS, today: TODAY, member: 'yes', parent: 'yes',
    } as OptionsContext);
    expect(asked.noteTone).toBe('act');
    expect(src('modules/chores/pv-chore-options.ts')).toMatch(/<span class="badge \$\{model\.noteTone \?\? 'act'\}">/);
  });

  // M4: a short card in a tall window kept the pinned Done over the rows.
  it("follows the card's own short state, not the window's", () => {
    const inbox = src('modules/chores/pv-chores-inbox.ts');
    expect(inbox).not.toMatch(/@media \(max-height: 500px\)/);
    expect(block(inbox, '      :host([short]) .actions')).toMatch(/position: static;/);
    expect(block(inbox, '      :host([short]) .head-done')).toMatch(/display: inline-flex;/);
    expect(inbox).toMatch(/@property\(\{ type: Boolean, reflect: true \}\) short = false;/);
    expect(src('modules/chores/pv-chores-module.ts')).toMatch(/<pv-chores-inbox \.layout=\$\{this\.layout\} \?short=\$\{this\.short\}/);
    expect(src('shell/planavista-card.ts')).toMatch(/class="pv-module"\n\s+layout=\$\{this\._layout\.layout\}\n\s+\?short=\$\{this\._layout\.short\}/);
  });
});

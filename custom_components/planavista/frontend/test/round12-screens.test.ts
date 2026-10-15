import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { guardPageTaps } from '../src/core/press-guard';
import { revealBy, whenText } from '../src/modules/chores/inbox-derive';

const src = (path: string) => readFileSync(fileURLToPath(new URL(`../src/${path}`, import.meta.url)), 'utf-8').replace(/\r\n/g, '\n');
const block = (source: string, selector: string): string => {
  const start = source.indexOf(`${selector} {`);
  expect(start, `no "${selector}" block`).toBeGreaterThan(-1);
  return source.slice(start, source.indexOf('}', start));
};

// The twelfth adversarial round's screens findings (r12b).
describe('round 12: screens', () => {
  // I1: answering from the last row's reasons closed them, the rows slid down, and the burst's second tap opened the row above.
  it("ignores the burst whenever Send back's reasons open or close", () => {
    const inbox = src('modules/chores/pv-chores-inbox.ts');
    expect(inbox).toMatch(/private _setSendingBack\(id: string \| null\): void \{\n\s+if \(id === this\._sendingBack\) return;\n\s+this\._sendingBack = id;\n\s+guardPageTaps\(\);/);
    expect(inbox).toMatch(/private _review\(row: InboxRow, allow: boolean, note\?: string \| null\): void \{\n\s+this\._setSendingBack\(null\);/);
    expect(inbox).toMatch(/this\._setSendingBack\(this\._sendingBack === row\.id \? null : row\.id\);/);
    expect(inbox).not.toMatch(/this\._sendingBack = null;/);
  });

  // I2: in a sections view the sheet fills the window while the card decided it was tall.
  it("decides short by the sheet's own room, not the card's", () => {
    const inbox = src('modules/chores/pv-chores-inbox.ts');
    expect(inbox).toMatch(/const height = this\.getBoundingClientRect\(\)\.height;\n\s+this\.short = height < SHORT_MAX_HEIGHT;/);
    expect(src('modules/chores/pv-chores-module.ts')).not.toMatch(/\?short=\$\{this\.short\}/);
    expect(src('shell/planavista-card.ts')).not.toMatch(/class="pv-module"\n\s+layout=\$\{this\._layout\.layout\}\n\s+\?short=/);
  });

  // M1: the burst's second tap focused the note field, and a phone's keyboard came up.
  it("keeps the burst's taps from focusing a field", () => {
    let now = 0;
    const page = Object.assign(new EventTarget(), { tagName: 'INPUT' });
    const stop = guardPageTaps(page, () => now);
    now = 150;
    const early = new Event('pointerdown', { cancelable: true });
    page.dispatchEvent(early);
    expect(early.defaultPrevented).toBe(true);
    now = 600;
    const later = new Event('pointerdown', { cancelable: true });
    page.dispatchEvent(later);
    expect(later.defaultPrevented).toBe(false);
    stop();
  });

  // M2: the head is sticky; padding the scroll for it made the list jump 100 px when focus moved into it.
  it('brings the reasons in below the head without scroll padding', () => {
    // They fit: nothing moves.
    expect(revealBy({ top: 300, bottom: 400 }, { top: 263, bottom: 419 })).toBe(0);
    // Below the room: up until the bottom shows.
    expect(revealBy({ top: 330, bottom: 450 }, { top: 263, bottom: 419 })).toBe(31);
    // Taller than the room: the top comes first.
    expect(revealBy({ top: 300, bottom: 500 }, { top: 263, bottom: 419 })).toBe(37);
    // Behind the head: down until the top shows.
    expect(revealBy({ top: 200, bottom: 300 }, { top: 263, bottom: 419 })).toBe(-63);
    expect(src('modules/chores/pv-chores-inbox.ts')).not.toMatch(/scrollPaddingTop/);
  });

  // M3: "Oct 8 at 1:30 AM" beside "October 8 at 6:00 PM".
  it('words one calendar day the same way at any hour', () => {
    expect(whenText('2026-10-08T01:30:00-05:00', '2026-10-15', '12h')).toBe('October 8 at 1:30 AM');
    expect(whenText('2026-10-08T18:00:00-05:00', '2026-10-15', '12h')).toBe('October 8 at 6:00 PM');
    expect(whenText('2026-10-14T01:30:00-05:00', '2026-10-15', '12h')).toBe('Wednesday at 1:30 AM');
  });

  // M4 and M5: a long badge squeezed its row's picture, and a wide sheet drew badges in two columns.
  it("keeps the day sheet's pictures whole and its badges in one column", () => {
    const sheet = src('modules/chores/pv-chores-day-sheet.ts');
    expect(block(sheet, '      li .pic')).toMatch(/flex: none;/);
    expect(sheet).toMatch(/const below = items\.some\(item => badgeBelow\(this\._badge\(item\), false\)\);/);
  });

  // M6: turned upright with To approve open, the grab handle didn't drag.
  it('lets the handle drag after turning to a bottom sheet', () => {
    const inbox = src('modules/chores/pv-chores-inbox.ts');
    expect(inbox).toMatch(/this\._detach\?\.\(\);\n\s+this\._detach = this\.layout === 'landscape' \? null : this\._dragFrom\(panel\);/);
  });
});

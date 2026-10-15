import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { tabbable } from '../src/core/focus';
import { pinReason } from '../src/core/pin-gate';
import { excusedRequest, inboxGroups, reviewQuestion } from '../src/modules/chores/inbox-derive';
import { itemOptions, type OptionsContext } from '../src/modules/chores/options-derive';
import { MEMBERS, TODAY, activity, item } from './chores-fixtures';

const src = (path: string) => readFileSync(fileURLToPath(new URL(`../src/${path}`, import.meta.url)), 'utf-8').replace(/\r\n/g, '\n');
const dana = MEMBERS.find(m => m.id === 'dana')!;

// The fourteenth adversarial round's screens findings (r14b).
describe('round 14: screens', () => {
  // I1: Tab went to a Done that wasn't shown, and the press was lost.
  it('keeps Tab on controls that are shown', () => {
    const shown = { getClientRects: () => [{}] } as unknown as HTMLElement;
    const hidden = { getClientRects: () => [] } as unknown as HTMLElement;
    expect(tabbable([hidden, shown, hidden])).toEqual([shown]);
    expect(src('core/focus.ts')).toMatch(/const items = tabbable\(\[\.\.\.root\.querySelectorAll<HTMLElement>\(FOCUSABLE\)\]\);/);
  });

  // I2 and M1: turned while typing, the old height stayed for good; turned with the reasons open, their height stayed.
  it('fits its room again once typing ends, and holds no height while the reasons are open', () => {
    const inbox = src('modules/chores/pv-chores-inbox.ts');
    expect(inbox).toMatch(/panel\.addEventListener\('focusout', \(\) => requestAnimationFrame\(\(\) => this\._fit\?\.\(\)\)\);/);
    expect(inbox).toMatch(/\} else if \(!this\._heldHeight && panel\.offsetHeight > 0 && !this\._sendingBack\) \{/);
  });

  // M2: the excused words reached To approve only.
  it("says an excused check-off stays excused everywhere it's answered", () => {
    expect(reviewQuestion({ kind: 'completion', excused: true }, false)).toBe("Who's checking it?");
    expect(pinReason(reviewQuestion({ kind: 'completion', excused: true }, false))).toBe('To check it');
    const board = { requests: [{ id: 'c1', kind: 'completion', stays_excused: true }] } as never;
    expect(excusedRequest(board, 'c1')).toBe(true);
    expect(excusedRequest(board, 'c2')).toBe(false);
    const pending = item('feed_the_fish|dana|day:2026-10-13|0', {
      status: 'pending', completion: { id: 'c1', done_by: 'dana', by: 'dana', at: '2026-10-13T10:00:00-05:00', source: 'tablet', state: 'pending', review: null, stars: 1 },
    });
    const options = itemOptions({
      item: pending, activity: activity('feed_the_fish'), owner: dana, members: MEMBERS, today: TODAY, member: 'yes', parent: 'yes', excused: true,
    } as OptionsContext);
    expect(options.parent.find(o => o.id === 'send_back')).toMatchObject({ label: 'Not done', hint: 'It stays excused.', late: true, excused: true });
    const module = src('modules/chores/pv-chores-module.ts');
    expect(module).toMatch(/excused: excusedRequest\(board, row\.item\.completion\?\.id\),/);
    expect(module).toMatch(/: excused \? `\$\{name\} stays excused\$\{note\}\.`/);
    expect(src('modules/chores/pv-chore-options.ts')).toMatch(/option\.excused \? 'Not done' : option\.late \? 'Count as missed' : 'Send back'/);
    const away = inboxGroups([
      { id: 'r1', kind: 'completion', member: 'dana', name: 'Feed the fish', at: '2026-10-14T15:30:00-05:00', stars: 1, stays_excused: true, away: true },
    ], MEMBERS, '2026-10-15', '12h');
    expect(away.chores[0].detail).toMatch(/ · Away$/);
  });

  // M3: "asks to skip Cat care this week" for a daily chore.
  it("names the day a daily chore's skip is for", () => {
    const groups = inboxGroups([
      { id: 's1', kind: 'skip', member: 'casey', name: 'Cat care', occurrence: 'cat_care|casey|day:2026-10-15|0', at: '2026-10-15T08:00:00-05:00' },
      { id: 's2', kind: 'skip', member: 'casey', name: 'Laundry', occurrence: 'laundry|casey|week:2026-10-12|0', at: '2026-10-15T08:00:00-05:00' },
    ] as never, MEMBERS, '2026-10-15', '12h');
    expect(groups.requests.map(r => r.tail)).toEqual([' today', ' this week']);
  });
});

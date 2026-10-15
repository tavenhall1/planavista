import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { PRESS_GRACE_MS, PressGuard, watchPagePresses } from '../src/core/press-guard';
import { answeredText, answeredWords, inboxGroups } from '../src/modules/chores/inbox-derive';
import { itemOptions, type OptionsContext } from '../src/modules/chores/options-derive';
import { tileLine } from '../src/modules/chores/hold-state';
import type { RowModel } from '../src/modules/chores/board-derive';
import { MEMBERS, TODAY, activity, item } from './chores-fixtures';

const src = (path: string) => readFileSync(fileURLToPath(new URL(`../src/${path}`, import.meta.url)), 'utf-8').replace(/\r\n/g, '\n');
const block = (source: string, selector: string): string => {
  const start = source.indexOf(`${selector} {`);
  expect(start, `no "${selector}" block`).toBeGreaterThan(-1);
  return source.slice(start, source.indexOf('}', start));
};

class Host extends EventTarget {
  addController() {}
  removeController() {}
  requestUpdate() {}
  get updateComplete() { return Promise.resolve(true); }
}

// The ninth adversarial round's screens findings (r9b) and the card side of r9a's.
describe('round 9: screens', () => {
  // B2: a late send-back said "went back", and under Make it up or Strict the child never saw it.
  it('says when sending a check-off back counts it as missed', () => {
    const dana = MEMBERS.find(m => m.id === 'dana')!;
    const groups = inboxGroups([
      { id: 'r1', kind: 'completion', member: 'dana', name: 'Tidy toys', at: '2026-10-12T10:01:00-05:00', stars: 1, missed_if_sent_back: true },
      { id: 'r2', kind: 'completion', member: 'dana', name: 'Feed the fish', at: '2026-10-13T10:01:00-05:00', stars: 1 },
    ], MEMBERS, TODAY, '12h');
    const [late, fresh] = groups.chores;
    expect(late.member).toBe(dana);
    expect(late.late).toBe(true);
    expect(late.decline).toBe('Not done');
    expect(late.detail).toMatch(/Its day is over$/);
    expect(answeredText(late, false, 'Toys on the stairs')).toBe('Tidy toys counts as missed that day: Toys on the stairs.');
    expect(answeredWords(late, 'declined')).toBe('Counted as missed');
    expect(fresh.decline).toBe('Send back');
    expect(answeredText(fresh, false, null)).toBe('Feed the fish went back.');
    const inbox = src('modules/chores/pv-chores-inbox.ts');
    expect(inbox).toMatch(/row\.late \? 'It counts as missed that day\. Add a note for them\?' : 'Sending back: what should change\?'/);
  });

  // r9a A3: on an overdue chore, Change the due date, Plan it for a day, and more time changed nothing.
  it('offers an overdue chore only what it can take', () => {
    const overdue = item('feed_the_fish|dana|day:2026-10-12|0', { section: 'overdue', overdue_since: '2026-10-12', due_day: '2026-10-12' });
    const ctx: OptionsContext = {
      item: overdue, activity: activity('feed_the_fish'), owner: MEMBERS.find(m => m.id === 'casey')!, members: MEMBERS,
      today: TODAY, member: 'yes', parent: 'pin',
    };
    const options = itemOptions(ctx);
    const ids = [...options.member, ...options.parent].map(o => o.id);
    expect(ids).not.toContain('change_due');
    expect(ids).not.toContain('more_time');
    expect(ids).not.toContain('plan_day');
    expect(ids).toContain('hand_off');
    expect(ids).toContain('excuse');
  });

  // B5: under Carry it over, yesterday's sent-back tile looked like a second copy of today's.
  it("names the day of an overdue tile that was sent back", () => {
    const row = {
      key: 'k', name: 'Feed the fish', icon: null, label: null, meta: '', state: 'sent_back',
      badge: { words: 'Sent back: Not finished' },
      item: item('feed_the_fish|dana|day:2026-10-12|0', { status: 'sent_back', section: 'overdue', overdue_since: '2026-10-12' }),
    } as unknown as RowModel;
    expect(tileLine(row, 0, false, 1)).toEqual({ kind: 'bad', text: '↩ Sent back: Not finished · from Mon' });
    const today = { ...row, item: { ...row.item, overdue_since: null } } as unknown as RowModel;
    expect(tileLine(today, 0, false, 1).text).toBe('↩ Sent back: Not finished');
  });

  // B4: a digit typed in the keypad's first 300 ms, or just after a burst, was dropped.
  it('the keypad counts a press away from the last one at once, and still ignores a burst', () => {
    let now = 1000;
    const page = new EventTarget();
    watchPagePresses(page, () => now);
    const host = new Host();
    const guard = new PressGuard(host as never, { now: () => now, restart: 'same-spot', page });
    guard.hostConnected();
    const clicks: number[] = [];
    host.addEventListener('click', () => clicks.push(now));
    const tap = (x: number, y: number, inside = true) => {
      const down = new Event('pointerdown');
      Object.defineProperties(down, { clientX: { value: x }, clientY: { value: y } });
      page.dispatchEvent(down);
      if (!inside) return;
      host.dispatchEvent(down);
      const click = new Event('click', { cancelable: true });
      Object.defineProperty(click, 'detail', { value: 1 });
      host.dispatchEvent(click);
    };
    tap(288, 894, false); // N to approve opens the keypad
    guard.arm();
    now += 200; tap(288, 894); // the burst's second tap, on whatever is under it now: ignored
    now += 190; tap(120, 500); // the first digit, elsewhere, 190 ms later: it counts
    expect(clicks).toHaveLength(1);
    now += 190; tap(220, 500);
    expect(clicks).toHaveLength(2);
    expect(PRESS_GRACE_MS).toBe(300);
  });

  it('opens Send back reasons above the pinned Done, keeps the head pinned, and lets Done scroll on a short screen', () => {
    const inbox = src('modules/chores/pv-chores-inbox.ts');
    // B1: the reasons scroll into view above the pinned row.
    expect(inbox).toMatch(/panel\.style\.scrollPaddingBottom = `\$\{actions\.offsetHeight \+ 8\}px`;/);
    expect(inbox).toMatch(/if \(this\._sendingBack\) void this\.updateComplete\.then\(\(\) => this\._revealReasons\(\)\);/); // round 12: revealBy
    // M2: the rows' held height doesn't keep the reasons' height once they close.
    expect(inbox).toMatch(/if \(!this\._sendingBack && rows\.offsetHeight > this\._rowsHeight\)/);
    // M3: the grab handle and the title stay pinned together at the very top.
    expect(block(inbox, '      .head')).toMatch(/position: sticky;\n\s+top: 0;/);
    expect(inbox).toMatch(/<div class="head">\n\s+<div class="grab-zone"/);
    // M6: on a short screen Done ends the list instead of covering it.
    expect(inbox).toMatch(/:host\(\[short\]\) \.actions \{\n\s+position: static;/);
  });

  // B3: "Excused X. Y's streak holds." while the day still had another miss.
  it('says the streak holds only when the excused day closes', () => {
    const module = src('modules/chores/pv-chores-module.ts');
    expect(module).toMatch(/const result = await api\.excuseMissed\(occurrence\);/);
    expect(module).toMatch(/result\.streak_holds && who \? ` \$\{who\}'s streak holds\.` : ''/);
  });
});

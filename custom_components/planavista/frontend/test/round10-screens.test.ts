import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { PressGuard, SAME_SPOT_PX, watchPagePresses } from '../src/core/press-guard';
import { pastBadge } from '../src/core/status-map';
import { inboxGroups, reviewQuestion, sendBackReasons, whenText } from '../src/modules/chores/inbox-derive';
import { itemOptions, type OptionsContext } from '../src/modules/chores/options-derive';
import { tileLabel, tileLine } from '../src/modules/chores/hold-state';
import { columnFor, type DeriveContext, type RowModel } from '../src/modules/chores/board-derive';
import { weekHighlights } from '../src/modules/chores/week-derive';
import type { WeekView } from '../src/modules/chores/chores-types';
import { MEMBERS, NOW, TODAY, activity, board, column, item } from './chores-fixtures';

const src = (path: string) => readFileSync(fileURLToPath(new URL(`../src/${path}`, import.meta.url)), 'utf-8').replace(/\r\n/g, '\n');
const [, , casey, dana] = MEMBERS;

class Host extends EventTarget {
  addController() {}
  removeController() {}
  requestUpdate() {}
  get updateComplete() { return Promise.resolve(true); }
}

function ctx(fields: Partial<DeriveContext> = {}): DeriveContext {
  return { today: TODAY, now: NOW, events: [], timeFormat: '12h', activities: new Map(), members: MEMBERS, ...fields };
}

// The tenth adversarial round's screens findings (r10b).
describe('round 10: screens', () => {
  // I1: a burst's second tap, 26 to 30 px from the first, typed a digit into the PIN.
  it("the keypad ignores a burst's taps a finger's width apart, and counts a press on another key", () => {
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
    now += 140; tap(314, 890); // 26 px right: the burst's second tap
    now += 120; tap(330, 870); // and its third, 26 px on
    expect(clicks).toHaveLength(0);
    now += 100; tap(424, 870); // a key away (94 px): typing
    expect(clicks).toHaveLength(1);
    expect(SAME_SPOT_PX).toBe(44);
  });

  // I2: a parent's note on a late Count as missed reached no screen.
  it("shows a parent's note on a missed day, in the day sheet and the week's line", () => {
    expect(pastBadge('missed', 'Lid left open')).toEqual({ words: 'Missed: Lid left open', tone: 'bad', glyph: '×' });
    expect(pastBadge('open', 'Not finished').words).toBe('Not done that day: Not finished');
    expect(src('modules/chores/pv-chores-day-sheet.ts')).toMatch(/const badge = pastBadge\(item\.status, item\.note\);/);
    const view: WeekView = {
      week: { start: '2026-10-12', end: '2026-10-19' }, today: '2026-10-15',
      members: {
        dana: {
          days: [{
            date: '2026-10-14', kind: 'past', away: false, due: 2, done: 1, pending: 0, closed: false, missed: 1,
            missed_items: [{ key: 'feed_the_fish|dana|day:2026-10-14|0', chore: 'feed_the_fish', name: 'Feed the fish', icon: null, status: 'missed', note: 'Lid left open' }],
          }],
          weekly: [], contribution: { minutes: 0, shared_minutes: 0 }, away: [],
        },
      },
    };
    const [line] = weekHighlights(view, [dana]);
    expect(line.text).toMatch(/^Dana missed Feed the fish on .+: Lid left open\.$/);
  });

  // M1: before 3 AM a check-off read "Tomorrow at 12:01 AM"; after it, "Today at 12:01 AM · Its day is over".
  it("words a check-off's time by the chore day", () => {
    expect(whenText('2026-10-15T00:01:00-05:00', '2026-10-14', '12h')).toBe('Tonight at 12:01 AM');
    expect(whenText('2026-10-15T00:01:00-05:00', '2026-10-15', '12h')).toBe('Last night at 12:01 AM');
    expect(whenText('2026-10-14T22:53:00-05:00', '2026-10-15', '12h')).toBe('Yesterday at 10:53 PM');
    expect(whenText('2026-10-14T15:58:00-05:00', '2026-10-14', '12h')).toBe('Today at 3:58 PM');
    expect(whenText('2026-10-15T04:30:00-05:00', '2026-10-14', '12h', '05:00')).toBe('Tonight at 4:30 AM');
    const groups = inboxGroups([
      { id: 'r1', kind: 'completion', member: 'dana', name: 'Brush teeth', at: '2026-10-15T00:01:00-05:00', stars: 1, missed_if_sent_back: true },
    ], MEMBERS, '2026-10-15', '12h', '03:00');
    expect(groups.chores[0].detail).toMatch(/^Last night at 12:01 AM/);
    expect(src('modules/chores/pv-chores-module.ts')).toMatch(/board\.today, this\.display\?\.time_format \?\? '12h', board\.settings\?\.day_starts\)/);
  });

  // M2: an overdue picture tile never done looked like today's copy, and its options didn't say overdue.
  it('says an overdue tile is overdue, in its line, its label, and its options', () => {
    const fish = item('feed_the_fish|dana|day:2026-10-12|0', { section: 'overdue', overdue_since: '2026-10-12' });
    const col = columnFor(dana, column([fish]), board({ dana: column([fish]) }), ctx());
    const row = col.entries.find(e => e.kind === 'row')!;
    const model = (row as { row: RowModel }).row;
    expect(model.overdueDay).toBe('Mon');
    expect(tileLine(model, 0, true, 1)).toEqual({ kind: 'bad', text: 'Overdue since Mon' });
    expect(tileLabel(model)).toBe('Feed the fish, overdue since Mon. Hold to complete');
    const old = item('feed_the_fish|dana|day:2026-09-28|0', { section: 'overdue', overdue_since: '2026-09-28', status: 'sent_back' });
    const oldRow = (columnFor(dana, column([old]), board({ dana: column([old]) }), ctx()).entries.find(e => e.kind === 'row') as { row: RowModel }).row;
    expect(tileLine(oldRow, 0, false, 1).text).toMatch(/ · from Sep 28$/);
    expect(src('modules/chores/pv-chore-tile.ts')).toMatch(/aria-label=\$\{tileLabel\(row\)\}/);
    const options = itemOptions({
      item: fish, activity: activity('feed_the_fish'), owner: dana, members: MEMBERS, today: TODAY, member: 'yes', parent: 'yes',
    } as OptionsContext);
    expect(options.note).toBe('Overdue since Mon');
  });

  // M3: a sent-back session of a two-session chore hid behind the open one, with its note.
  it("shows a one-time chore's sent-back session before its open one", () => {
    const garage = (n: number, fields = {}) => item(`clean_out_the_garage|casey|once|${n}`, {
      band: null, window: 'once', period: 'once', dated: true, due_day: '2026-10-18', counted: false, credit_minutes: 120, ...fields,
    });
    const items = [garage(0), garage(1, { status: 'sent_back', note: 'Sweep the floor too' })];
    const col = columnFor(casey, column(items), board({ casey: column(items) }), ctx());
    const row = col.entries.find(e => e.kind === 'row') as { row: RowModel };
    expect(row.row.key).toBe('clean_out_the_garage|casey|once|1');
    expect(row.row.badge?.words).toBe('Sent back: Sweep the floor too');
  });

  // M4: a late Count as missed still asked "Who's sending it back?" and offered Do it again.
  it('speaks of counting as missed, not sending back, once a check-off is late', () => {
    expect(reviewQuestion({ kind: 'completion', late: true }, false)).toBe("Who's counting it as missed?");
    expect(reviewQuestion({ kind: 'completion' }, false)).toBe("Who's sending it back?");
    expect(sendBackReasons(true)).not.toContain('Do it again');
    expect(sendBackReasons(false)).toEqual(['Not finished', 'Missed a spot', 'Do it again']);
    const pending = item('feed_the_fish|dana|day:2026-10-12|0', {
      status: 'pending', completion: { id: 'c1', done_by: 'dana', by: 'dana', at: '2026-10-12T22:53:00-05:00', source: 'tablet', state: 'pending', review: null, stars: 1 },
    });
    const options = itemOptions({
      item: pending, activity: activity('feed_the_fish'), owner: dana, members: MEMBERS, today: TODAY, member: 'yes', parent: 'yes', late: true,
    } as OptionsContext);
    expect(options.parent.find(o => o.id === 'send_back')).toMatchObject({ label: 'Not done', late: true });
    expect(src('modules/chores/pv-chores-inbox.ts')).toMatch(/sendBackReasons\(!!row\.late\)/);
    expect(src('modules/chores/pv-chore-options.ts')).toMatch(/sendBackReasons\(!!option\.late\)/);
  });

  // M6: sideways on a phone, docked To approve had no way out but Done at the list's end.
  it('closes To approve from the bar, and puts Done in the head on a short screen', () => {
    const inbox = src('modules/chores/pv-chores-inbox.ts');
    expect(inbox).toMatch(/<button class="pv-btn pv-btn-secondary head-done" type="button"/);
    expect(inbox).toMatch(/:host\(\[short\]\) \.actions \{\n\s+position: static;\n\s+\}\n\s+:host\(\[short\]\) \.head-done \{\n\s+display: inline-flex;\n\s+\}\n\s+:host\(\[short\]\) \.actions \.done \{\n\s+display: none;/);
    // The base rule comes first, or it hides the head's Done on a short screen too.
    expect(inbox.search(/\n {6}\.head-done \{\n {8}display: none;/)).toBeGreaterThan(-1);
    expect(inbox.search(/\n {6}\.head-done \{\n {8}display: none;/)).toBeLessThan(inbox.indexOf(':host([short]) .actions'));
    const module = src('modules/chores/pv-chores-module.ts');
    expect(module).toMatch(/if \(this\._sheet\?\.kind === 'inbox'\) void this\.renderRoot\.querySelector<HTMLElement & \{ close\(\): Promise<void> \}>\('pv-chores-inbox'\)\?\.close\(\);/);
  });
});

import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  BOARD_RETURN_MS, boardDate, boardDayTitle, dayColumns, dayItemBadge, longDay,
} from '../src/modules/chores/board-day-derive';
import type { DayView, PastItem } from '../src/modules/chores/chores-types';
import { MEMBERS, TODAY, item } from './chores-fixtures';

// The owner (0.14.0): "just like the Week view has a navigator, I think the Board view should as well."
// Another day's board shows that day: what was done and missed on a past one (a parent can excuse a miss),
// what's planned on one to come, look only. Checking off stays on Today.
const past = (key: string, status: PastItem['status'], fields: Partial<PastItem> = {}): PastItem => {
  const chore = key.split('|')[0];
  return { key, chore, name: chore.replace(/_/g, ' ').replace(/^./, c => c.toUpperCase()), icon: null, status, ...fields };
};
const ctx = { today: TODAY, canExcuse: true, excusing: new Set<string>() };

describe('the Board on another day', () => {
  it('steps a day at a time from the chore day', () => {
    expect(boardDate(TODAY, -1)).toBe('2026-10-12');
    expect(boardDate(TODAY, 0)).toBe(TODAY);
    expect(boardDate(TODAY, 20)).toBe('2026-11-02');
  });

  it('names the day it shows', () => {
    expect(boardDayTitle(0, TODAY)).toBe('Today');
    expect(boardDayTitle(-1, '2026-10-12')).toBe('Yesterday · Monday, October 12');
    expect(boardDayTitle(1, '2026-10-14')).toBe('Tomorrow · Wednesday, October 14');
    expect(boardDayTitle(3, '2026-10-16')).toBe('Friday, October 16');
    expect(longDay('2026-10-18')).toBe('Sunday, October 18');
    // A phone's bar has room for less beside the arrows and Today.
    expect(boardDayTitle(-1, '2026-10-12', true)).toBe('Yesterday');
    expect(boardDayTitle(3, '2026-10-16', true)).toBe('Fri, Oct 16');
    expect(boardDayTitle(0, TODAY, true)).toBe('Today');
  });

  it('comes back to today after two minutes without a touch, so a kitchen screen never sits on another day', () => {
    expect(BOARD_RETURN_MS).toBe(120_000);
  });

  it("shows a past day's record for everyone, in the household's order", () => {
    const view: DayView = {
      date: '2026-10-12', kind: 'past', members: {
        dana: { items: [], summary: { due: 0, done: 0, pending: 0, closed: false }, away: true },
        alex: {
          items: [past('dishes|alex|day:2026-10-12|0', 'done', { done_by: 'blair' }), past('trash|alex|week:2026-10-12|0', 'missed')],
          summary: { due: 2, done: 1, pending: 0, closed: false }, away: false,
        },
        casey: { items: [past('feed_the_cat|casey|day:2026-10-12|0', 'done')], summary: { due: 1, done: 1, pending: 0, closed: true }, away: false },
        blair: { items: [], summary: { due: 0, done: 0, pending: 0, closed: false }, away: false },
      },
    };
    const columns = dayColumns(view, MEMBERS, ctx);
    expect(columns.map(c => c.member.id)).toEqual(['alex', 'blair', 'casey', 'dana']);
    const [alex, blair, casey, dana] = columns;
    expect(alex.line).toBe('1 of 2 done.');
    expect(alex.ring).toEqual({ progress: 0.5, closed: false, label: "Alex: 1 of 2 done" });
    expect(alex.rows.map(r => [r.name, r.badge?.words, r.excuse])).toEqual([
      ['Dishes', 'Done by Blair', false],
      ['Trash', 'Missed', true],
    ]);
    expect(casey.line).toBe('Ring closed: 1 of 1 done.');
    expect(casey.ring.closed).toBe(true);
    expect(blair.empty).toBe('Nothing was on the board.');
    expect(blair.line).toBe('');  // not "0 of 0 done."
    expect(dana.line).toBe('Away: nothing was due, and the streak keeps.');
  });

  it('offers Excuse it only to a parent, and not twice while one is being excused', () => {
    const view: DayView = {
      date: '2026-10-12', kind: 'past', members: {
        alex: { items: [past('trash|alex|week:2026-10-12|0', 'missed')], summary: { due: 1, done: 0, pending: 0, closed: false }, away: false },
      },
    };
    expect(dayColumns(view, MEMBERS, { ...ctx, canExcuse: false })[0].rows[0].excuse).toBe(false);
    expect(dayColumns(view, MEMBERS, { ...ctx, excusing: new Set(['trash|alex|week:2026-10-12|0']) })[0].rows[0].excuse).toBe(false);
  });

  it("shows what's planned on a day to come, look only", () => {
    const view: DayView = {
      date: '2026-10-15', kind: 'future', members: {
        casey: { items: [item('dishes|casey|day:2026-10-15|0'), item('trash|casey|week:2026-10-12|1')], summary: null, away: false },
        alex: { items: [], summary: null, away: false },
      },
    };
    const columns = dayColumns(view, MEMBERS, ctx);
    const casey = columns.find(c => c.member.id === 'casey')!;
    expect(casey.line).toBe('2 planned.');
    expect(casey.ring).toEqual({ progress: 0, closed: false, label: 'Casey: 2 planned' });
    expect(casey.rows.every(r => !r.excuse)).toBe(true);
    expect(columns.find(c => c.member.id === 'alex')!.empty).toBe('Nothing planned.');
  });

  it('keeps rows where they were while the day reloads after Excuse it', () => {
    const view: DayView = {
      date: '2026-10-12', kind: 'past', members: {
        alex: { items: [past('b|alex|day:2026-10-12|0', 'excused'), past('a|alex|day:2026-10-12|0', 'done')], summary: null, away: false },
      },
    };
    const order = { alex: ['a|alex|day:2026-10-12|0', 'b|alex|day:2026-10-12|0'] };
    expect(dayColumns(view, MEMBERS, { ...ctx, order })[0].rows.map(r => r.key)).toEqual(order.alex);
  });

  it("is the day sheet's rule for a row's badge", () => {
    const names = (id: string) => MEMBERS.find(m => m.id === id)?.name ?? id;
    expect(dayItemBadge(past('x|alex|day:2026-10-12|0', 'done', { done_by: 'alex' }), 'alex', TODAY, names)?.words).toBe('Done');
    expect(dayItemBadge(past('x|alex|day:2026-10-12|0', 'excused', { note: 'sick' }), 'alex', TODAY, names)?.words).toBe('Excused: sick');
    expect(dayItemBadge(item('x|alex|day:2026-10-13|0', { status: 'pending' }), 'alex', TODAY, names)?.words).toBe('Waiting for approval');
    const sheet = readFileSync(new URL('../src/modules/chores/pv-chores-day-sheet.ts', import.meta.url), 'utf8');
    expect(sheet).toMatch(/dayItemBadge\(/);
  });

  it('the Board view steps between days with the Week view\'s controls, and another day draws the day board', () => {
    const module = readFileSync(new URL('../src/modules/chores/pv-chores-module.ts', import.meta.url), 'utf8');
    expect(module).toMatch(/aria-label="Previous day"/);
    expect(module).toMatch(/aria-label="Next day"/);
    expect(module).toMatch(/\?disabled=\$\{this\._boardOffset === 0\}[^>]*>Today</);
    expect(module).toMatch(/this\._boardOffset === 0 \? this\._renderLiveBoard\(board\) : this\._renderDayBoard\(board\)/);
    expect(module).toMatch(/BOARD_RETURN_MS/);
  });
});

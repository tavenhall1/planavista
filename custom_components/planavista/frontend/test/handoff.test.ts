import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { Handoffs, REBUILD_MS, TAKE_MS, handoffToast } from '../src/core/handoff';

// Round 3 (r3c C2): when the connection came back, Home Assistant made the card
// again, and what was open went with the old one without a word: an event being
// typed, the PIN keypad half entered, the toast saying parent mode ended.
describe('a card rebuilt after a reconnect picks up where the old one was', () => {
  const KEY = '/wall-calendar/planavista|{}';
  const note = { pin: false, toast: null, modules: { calendar: { mode: 'create', title: 'Dentist for Dana at 3' } } };

  it('hands what was open to the new card for the same place, once', () => {
    const handoffs = new Handoffs();
    handoffs.dropped(1_000);
    handoffs.leave(KEY, note, 2_500);
    expect(handoffs.take('/elsewhere|{}', 2_600)).toBeNull();
    expect(handoffs.take(KEY, 2_600)).toEqual(note);
    expect(handoffs.take(KEY, 2_700)).toBeNull();
  });

  it('leaves nothing when the connection never dropped (a dashboard edited, a page left)', () => {
    const handoffs = new Handoffs();
    handoffs.leave(KEY, note, 2_500);
    expect(handoffs.take(KEY, 2_600)).toBeNull();
  });

  // Round 4 (r4a A7): a drop and its return, then minutes later a page left and come back to,
  // toasted "The connection dropped" and reopened an editor the person had left.
  it('counts only a card leaving while the connection is down, or just after it is back', () => {
    const handoffs = new Handoffs();
    handoffs.dropped(1_000);
    handoffs.leave(KEY, note, 60_000);
    expect(handoffs.take(KEY, 60_100)).toEqual(note);
    handoffs.reconnected(61_000);
    handoffs.leave(KEY, note, 61_000 + REBUILD_MS);
    expect(handoffs.take(KEY, 61_000 + REBUILD_MS + 10)).toEqual(note);
    handoffs.leave(KEY, note, 61_000 + REBUILD_MS + 1);
    expect(handoffs.take(KEY, 61_000 + REBUILD_MS + 20)).toBeNull();
    // Coming back without having dropped changes nothing.
    const quiet = new Handoffs();
    quiet.reconnected(5_000);
    quiet.leave(KEY, note, 5_100);
    expect(quiet.take(KEY, 5_200)).toBeNull();
  });

  it('a card that comes much later (the page left and come back to) starts fresh', () => {
    const handoffs = new Handoffs();
    handoffs.dropped(1_000);
    handoffs.leave(KEY, note, 2_000);
    expect(handoffs.take(KEY, 2_000 + TAKE_MS + 1)).toBeNull();
  });

  it('leaves nothing when nothing was open', () => {
    const handoffs = new Handoffs();
    handoffs.dropped(1_000);
    handoffs.leave(KEY, { pin: false, toast: null, modules: {} }, 2_000);
    expect(handoffs.take(KEY, 2_100)).toBeNull();
  });

  // Round 5 (r5a A6, A7): after a Home Assistant restart the household came after the note's
  // 15 s; and the card's toast and the board's sat on top of each other.
  it('the card keeps module notes until the household answers, and quiets the board when it spoke', () => {
    const card = readFileSync(fileURLToPath(new URL('../src/shell/planavista-card.ts', import.meta.url)), 'utf-8').replace(/\r\n/g, '\n');
    const resume = card.slice(card.indexOf('  private _resumeModule(): void {'));
    const body = resume.slice(0, resume.indexOf('\n  }\n'));
    expect(body).toMatch(/if \(!this\._household\.view\) return;/);
    expect(body).toMatch(/module\.resume\?\.\(mine, \{ quiet: this\._resumeQuiet \}\);/);
  });

  it('says what closed: the keypad first, else the toast that was showing', () => {
    const parentEnded = { id: 't1', text: 'Parent mode ended. Your changes are kept for when you come back.' };
    expect(handoffToast({ pin: true, toast: parentEnded, modules: {} })?.text)
      .toBe('The connection dropped, so the PIN closed. Try again.');
    expect(handoffToast({ pin: false, toast: parentEnded, modules: {} })).toEqual(parentEnded);
    expect(handoffToast({ pin: false, toast: null, modules: { calendar: {} } })).toBeNull();
  });
});

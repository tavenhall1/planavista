import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { focusablesIn } from '../src/core/focus';
import { inboxGroups } from '../src/modules/chores/inbox-derive';
import { itemOptions, skipWords, type OptionsContext } from '../src/modules/chores/options-derive';
import { MEMBERS, TODAY, activity, item } from './chores-fixtures';

const src = (path: string) => readFileSync(fileURLToPath(new URL(`../src/${path}`, import.meta.url)), 'utf-8').replace(/\r\n/g, '\n');
const casey = MEMBERS.find(m => m.id === 'casey')!;

type Fake = { name: string; matches: () => boolean; shadowRoot: { querySelectorAll: () => Fake[] } | null; getClientRects: () => object[] };
const control = (name: string): Fake => ({ name, matches: () => true, shadowRoot: null, getClientRects: () => [{}] });

// The fifteenth adversarial round's screens findings (r15b).
describe('round 15: screens', () => {
  // I1: Tab never reached a date field's own buttons inside a sheet.
  it("walks into a field's own controls, in order", () => {
    const field: Fake = { name: 'field', matches: () => false, shadowRoot: { querySelectorAll: () => [control('open'), control('day')] }, getClientRects: () => [{}] };
    const root = { querySelectorAll: () => [control('a'), field, control('b')] };
    expect(focusablesIn(root as never).map(el => (el as unknown as Fake).name)).toEqual(['a', 'open', 'day', 'b']);
    const focus = src('core/focus.ts');
    expect(focus).toMatch(/const items = tabbable\(focusablesIn\(root\)\);/);
    expect(focus).toMatch(/const index = items\.indexOf\(deepActiveElement\(root\) as HTMLElement\);/);
    expect(src('core/pv-date-field.ts')).toMatch(/root\.querySelector<HTMLElement>\('\.picker-day\.today:not\(\[disabled\]\)'\)/);
  });

  // I2: after a reset with the reasons open, nothing was held, and a row leaving moved them under the finger.
  it('holds its height while the reasons are open, and lets go as they close', () => {
    const inbox = src('modules/chores/pv-chores-inbox.ts');
    expect(inbox).toMatch(/this\._heldForReasons = !!this\._sendingBack;/);
    expect(inbox).toMatch(/if \(!id && this\._heldForReasons\) \{\n\s+this\._heldForReasons = false;\n\s+this\._resetHeld\(\);/);
  });

  // I3 and M1: a skip said "this week" whatever it covered.
  it('words a skip by what it covers', () => {
    expect(skipWords('day:2026-10-13', TODAY)).toBe('today');
    expect(skipWords('day:2026-10-15', TODAY)).toBe('Thursday');
    expect(skipWords('week:2026-10-12', TODAY)).toBe('this week');
    expect(skipWords('rep:2026-10-13', TODAY)).toBe('this time');
    expect(skipWords('once', TODAY)).toBe('it');
    const daily = itemOptions({
      item: item('cat_care|casey|day:2026-10-13|0', { due_day: TODAY }), activity: activity('cat_care'), owner: casey, members: MEMBERS,
      today: TODAY, member: 'yes', parent: 'no',
    } as OptionsContext);
    expect(daily.member.find(o => o.id === 'skip')?.label).toBe('Ask to skip today');
    const asked = itemOptions({
      item: item('cat_care|casey|day:2026-10-13|0', { request: { id: 'r', kind: 'skip', until: null } as never }), activity: activity('cat_care'),
      owner: casey, members: MEMBERS, today: TODAY, member: 'yes', parent: 'no',
    } as OptionsContext);
    expect(asked.note).toBe('Waiting for a parent: skip today.');
    expect(src('modules/chores/pv-chores-module.ts')).toMatch(/`Asked to skip \$\{skipWords\(row\.item\.period, board\.today\)\}\. A parent will answer\.`/);
    const groups = inboxGroups([
      { id: 's1', kind: 'skip', member: 'casey', name: 'Clean out the garage', occurrence: 'clean_out_the_garage|casey|once|0', at: '2026-10-15T08:00:00-05:00' },
    ] as never, MEMBERS, TODAY, '12h');
    expect(groups.requests[0].tail).toBe('');
  });

  // M2: the refit after a field let go landed between a mouse press and its release.
  it('waits for a press to end before fitting its room again', () => {
    const inbox = src('modules/chores/pv-chores-inbox.ts');
    expect(inbox).toMatch(/if \(this\._pressing\) this\._fitLater = true;\n\s+else requestAnimationFrame\(\(\) => this\._fit\?\.\(\)\);/);
  });

  // M3: Tab left Settings for the bar beneath it, and Enter pressed it.
  it('makes the card beneath Settings inert while it is open', () => {
    const card = src('shell/planavista-card.ts');
    expect(card.match(/\?inert=\$\{this\._settingsOpen\}/g)?.length).toBe(3);
  });

  // M4 and M6: focus fell to the page after Approve all's question; an excused row had two Not done buttons.
  it("gives focus back after Approve all's question, and names the excused chip apart", () => {
    expect(src('modules/chores/pv-chores-module.ts')).toMatch(/this\.renderRoot\.querySelector<HTMLElement & \{ focusTitle\(\): void \}>\('pv-chores-inbox'\)\?\.focusTitle\(\)/);
    expect(src('modules/chores/pv-chores-inbox.ts')).toMatch(/\$\{row\.excused \? 'Keep it excused' : row\.late \? 'Count as missed' : 'Send back'\}/);
  });
});

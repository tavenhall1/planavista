import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { pinReason } from '../src/core/pin-gate';
import { reviewQuestion, type InboxRow } from '../src/modules/chores/inbox-derive';

const read = (path: string) => readFileSync(new URL(`../src/${path}`, import.meta.url), 'utf-8');

describe('the PIN sheet always says why it is asking (milestone 8, spec 3.12)', () => {
  it('turns the question into the line under "Blair, enter your PIN"', () => {
    expect(pinReason("Who's checking off Cat care?")).toBe('To check off Cat care');
    expect(pinReason("Who's approving?")).toBe('To approve');
    expect(pinReason("Who's handing Laundry over?")).toBe('To hand Laundry over');
    expect(pinReason("Who's opening Settings?")).toBe('To open Settings');
    expect(pinReason("Who's setting up PlanaVista?")).toBe('To set up PlanaVista');
    expect(pinReason("Enter a parent's PIN to keep changing settings")).toBe('To keep changing settings');
    expect(pinReason('Whose day is this?')).toBe('To change their My day');
    expect(pinReason('Whose goal is this?')).toBe('To set their goal');
    expect(pinReason("Who's giving Alex the credit?")).toBe('To give Alex the credit');
    expect(pinReason("Who's declining?")).toBe('To decline');
  });

  // Round 3 (r3a A10): the inbox's Send back and Decline asked "To approve" under the PIN.
  it("asks for the inbox's answer in its own words", () => {
    const row = (kind: InboxRow['kind']) => ({ kind }) as InboxRow;
    expect(reviewQuestion(row('completion'), true)).toBe("Who's approving?");
    expect(reviewQuestion(row('completion'), false)).toBe("Who's sending it back?");
    expect(reviewQuestion(row('redemption'), false)).toBe("Who's declining?");
    expect(reviewQuestion(row('skip'), false)).toBe("Who's declining?");
    expect(reviewQuestion(row('redemption'), true)).toBe("Who's approving?");
  });

  it('has a reason for every question the card asks', () => {
    const sources = ['modules/chores/pv-chores-module.ts', 'modules/chores/setup/pv-setup-shared-screen.ts', 'shell/planavista-card.ts'];
    const headings = sources.flatMap(path => [...read(path).matchAll(/(["`])((?:Who's|Whose|Enter a parent's PIN)[^"`]*?)\1/g)].map(m => m[2]));
    expect(headings.length).toBeGreaterThan(20);
    for (const heading of headings) expect(pinReason(heading), heading).not.toBeNull();
  });
});

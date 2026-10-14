import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

// Round 2: a second PIN request while one was open resolved false without a word
// (a credit pick under the keypad did nothing at all).
describe('a PIN request while another is open', () => {
  it('says to finish the one that is open', () => {
    const card = readFileSync(new URL('../src/shell/planavista-card.ts', import.meta.url), 'utf-8').replace(/\r\n/g, '\n');
    const gate = card.slice(card.indexOf('private readonly _pinGate: PinGate = {'), card.indexOf('constructor() {'));
    expect(gate).toMatch(/if \(this\._sheet\) \{\n\s+this\._toast = \{ id: `pin-busy-\$\{Date\.now\(\)\}`, text: "Finish the PIN that's open first\." \};\n\s+resolve\(false\);/);
  });
});

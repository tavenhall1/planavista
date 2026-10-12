import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { EASY_PIN_MESSAGE, easyPin, pinHint } from '../src/core/keypad';

/** The backend's table (tests/fixtures/easy_pins.json): the card turns the same PINs away before asking twice. */
const TABLE = JSON.parse(readFileSync(new URL('../../../../tests/fixtures/easy_pins.json', import.meta.url), 'utf-8')) as {
  easy: string[];
  fine: string[];
};

describe('easy PINs (milestone 8, D4)', () => {
  it.each(TABLE.easy)('%s is easy to guess', pin => {
    expect(easyPin(pin)).toBe(true);
  });

  it.each(TABLE.fine)('%s is fine', pin => {
    expect(easyPin(pin)).toBe(false);
  });

  it('says why without repeating any PIN', () => {
    expect(EASY_PIN_MESSAGE).toBe('That PIN is easy to guess: the same digit, a run, or straight down the keypad. Try another.');
    expect(EASY_PIN_MESSAGE).not.toMatch(/\d/);
  });

  it('hints parents toward 6 digits', () => {
    expect(pinHint(true)).toBe('4 to 6 digits. 6 is much harder to guess.');
    expect(pinHint(false)).toBe('4 to 6 digits.');
  });
});

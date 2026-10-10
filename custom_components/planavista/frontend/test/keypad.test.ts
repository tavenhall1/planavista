import { describe, expect, it } from 'vitest';
import { DIGITS, canFinishChoosing, isComplete, keypadDigits, pressDelete, pressDigit, startEntry } from '../src/core/keypad';

function seeded(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1103515245 + 12345) % 2147483648;
    return state / 2147483648;
  };
}

describe('keypad', () => {
  it('lays out 1 to 9 then 0 unless shuffled', () => {
    expect(keypadDigits(false)).toEqual([...DIGITS]);
  });

  it('shuffles into a different order that still has every digit once', () => {
    const shuffled = keypadDigits(true, seeded(7));
    expect([...shuffled].sort()).toEqual([...DIGITS].sort());
    expect(shuffled).not.toEqual([...DIGITS]);
  });

  it('collects digits up to the PIN length', () => {
    let entry = startEntry(4);
    for (const digit of '48261') entry = pressDigit(entry, digit);
    expect(entry.digits).toBe('4826');
    expect(isComplete(entry)).toBe(true);
    expect(pressDigit(startEntry(4), 'x').digits).toBe('');
    expect(pressDelete(entry).digits).toBe('482');
    expect(pressDelete(startEntry(4)).digits).toBe('');
  });

  it('collects up to 6 when choosing a new PIN, and allows finishing from 4', () => {
    let entry = startEntry(null);
    expect(entry.length).toBe(6);
    for (const digit of '482') entry = pressDigit(entry, digit);
    expect(canFinishChoosing(entry)).toBe(false);
    entry = pressDigit(entry, '6');
    expect(canFinishChoosing(entry)).toBe(true);
    expect(isComplete(entry)).toBe(false);
  });
});

/** The PIN keypad: which digit sits where, and what has been typed. */
export const DIGITS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'] as const;
export const MIN_PIN = 4;
export const MAX_PIN = 6;

/** Digits in keypad order, or shuffled (Fisher-Yates) when Shuffle the keypad is on. */
export function keypadDigits(shuffle: boolean, random: () => number = Math.random): string[] {
  const digits: string[] = [...DIGITS];
  if (!shuffle) return digits;
  for (let i = digits.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [digits[i], digits[j]] = [digits[j], digits[i]];
  }
  return digits;
}

export interface PinEntry {
  digits: string;
  /** How many digits to collect: the PIN's length, or 6 while choosing a new one. */
  length: number;
}

export function startEntry(length: number | null): PinEntry {
  return { digits: '', length: length ?? MAX_PIN };
}

export function pressDigit(entry: PinEntry, digit: string): PinEntry {
  if (!/^[0-9]$/.test(digit) || entry.digits.length >= entry.length) return entry;
  return { ...entry, digits: entry.digits + digit };
}

export function pressDelete(entry: PinEntry): PinEntry {
  return { ...entry, digits: entry.digits.slice(0, -1) };
}

/** Every digit of a known PIN is in, so it can be checked. */
export function isComplete(entry: PinEntry): boolean {
  return entry.digits.length === entry.length;
}

/** A new PIN can be finished from 4 digits. */
export function canFinishChoosing(entry: PinEntry): boolean {
  return entry.digits.length >= MIN_PIN;
}

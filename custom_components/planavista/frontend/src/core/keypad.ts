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

/** Easy to guess, so turned away when chosen (milestone 8, D4; the backend's rule): all one digit, a straight run, or the keypad's middle column. */
export function easyPin(pin: string): boolean {
  if (new Set(pin).size === 1) return true;
  const steps = new Set([...pin].slice(1).map((digit, i) => Number(digit) - Number(pin[i])));
  if (steps.size === 1 && (steps.has(1) || steps.has(-1))) return true;
  return pin === '2580' || pin === '0852';
}

/** The backend's words for an easy PIN, so either one can say it. */
export const EASY_PIN_MESSAGE = 'That PIN is easy to guess: the same digit, a run, or straight down the keypad. Try another.';

/** Choosing a PIN: parents are nudged toward 6 digits. */
export function pinHint(parent: boolean): string {
  return parent ? '4 to 6 digits. 6 is much harder to guess.' : '4 to 6 digits.';
}

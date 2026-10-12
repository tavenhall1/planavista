import { describe, expect, it } from 'vitest';
import { GONE, Presence, nextPresence } from '../src/core/sheet-presence';

const dentist = { summary: 'Dentist' };
const standup = { summary: 'Team standup' };

describe('nextPresence', () => {
  it('mounts a sheet when something wants it', () => {
    expect(nextPresence(GONE as Presence<typeof dentist>, dentist)).toEqual({ value: dentist, leaving: false });
  });

  it('keeps the same presence while the same thing is wanted, so nothing redraws', () => {
    const shown: Presence<typeof dentist> = { value: dentist, leaving: false };
    expect(nextPresence(shown, dentist)).toBe(shown);
  });

  it('keeps the sheet mounted while it leaves once nothing wants it', () => {
    const shown: Presence<typeof dentist> = { value: dentist, leaving: false };
    const leaving = nextPresence(shown, null);
    expect(leaving).toEqual({ value: dentist, leaving: true });
    expect(nextPresence(leaving, null)).toBe(leaving);
  });

  it('shows the new choice when another is wanted, even mid-exit', () => {
    const shown: Presence<typeof dentist> = { value: dentist, leaving: false };
    expect(nextPresence(shown, standup)).toEqual({ value: standup, leaving: false });
    expect(nextPresence({ value: dentist, leaving: true }, dentist)).toEqual({ value: dentist, leaving: false });
  });

  it('stays gone when nothing was showing', () => {
    expect(nextPresence(GONE as Presence<typeof dentist>, null)).toBe(GONE);
  });
});

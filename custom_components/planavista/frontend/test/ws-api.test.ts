import { describe, expect, it } from 'vitest';
import { errorMessage } from '../src/core/ws-api';

describe('errorMessage', () => {
  it("gives PlanaVista's own refusals their words", () => {
    expect(errorMessage({ code: 'no_surprise', message: "There's no surprise waiting." })).toBe("There's no surprise waiting.");
    expect(errorMessage({ code: 'not_enough_stars', message: 'Not enough stars yet.' })).toBe('Not enough stars yet.');
    expect(errorMessage('nope')).toBeNull();
  });

  it("keeps Home Assistant's technical errors off the screen (round 3, r3a A1)", () => {
    // A schema error repeats what was sent: here a PIN session's token.
    expect(errorMessage({ code: 'invalid_format', message: "extra keys not allowed @ data['session']. Got '0ipu64AeC5wH'" })).toBeNull();
    expect(errorMessage({ code: 'unknown_command', message: 'Unknown command.' })).toBeNull();
    expect(errorMessage({ code: 'unknown_error', message: 'Unknown error' })).toBeNull();
  });
});

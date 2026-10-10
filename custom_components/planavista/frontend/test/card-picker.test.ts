import { describe, expect, it } from 'vitest';
import { CARD_PICKER_ENTRY, registerCardPicker } from '../src/shell/card-picker';

describe('the card picker entry', () => {
  it('offers the 1.1.0 element name, so a household that steps back a release keeps working cards', () => {
    const cards: Array<{ type: string }> = [];
    registerCardPicker(cards);
    expect(cards).toEqual([CARD_PICKER_ENTRY]);
    expect(CARD_PICKER_ENTRY.type).toBe('planavista-calendar-card');
  });

  it('adds nothing when another copy of the bundle already registered either name', () => {
    for (const type of ['planavista-calendar-card', 'planavista-card']) {
      const cards = [{ type }];
      registerCardPicker(cards);
      expect(cards).toEqual([{ type }]);
    }
  });
});

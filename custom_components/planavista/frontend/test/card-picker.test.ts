import { describe, expect, it } from 'vitest';
import { CARD_PICKER_ENTRY, registerCardPicker } from '../src/shell/card-picker';

describe('the card picker entry', () => {
  it('offers the short name, which 1.2.0 (one release back) already knows', () => {
    const cards: Array<{ type: string }> = [];
    registerCardPicker(cards);
    expect(cards).toEqual([CARD_PICKER_ENTRY]);
    expect(CARD_PICKER_ENTRY).toMatchObject({
      type: 'planavista-card', name: 'PlanaVista', description: "Your family's calendar and chores, together on one screen.",
    });
  });

  it('adds nothing when another copy of the bundle already registered either name', () => {
    for (const type of ['planavista-calendar-card', 'planavista-card']) {
      const cards = [{ type }];
      registerCardPicker(cards);
      expect(cards).toEqual([{ type }]);
    }
  });
});

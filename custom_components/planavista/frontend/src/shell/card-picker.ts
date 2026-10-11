/** The card's entry in Home Assistant's card picker. */
export interface CardPickerEntry {
  type: string;
  name: string;
  description: string;
  preview: boolean;
}

/**
 * New cards get the short name, `custom:planavista-card` (spec 6.4). 1.2.0
 * introduced it and is the release a household steps back to from 1.3.0, so a
 * card added now keeps working after a step back. Cards added as
 * `custom:planavista-calendar-card` keep working too.
 */
export const CARD_PICKER_ENTRY: CardPickerEntry = {
  type: 'planavista-card',
  name: 'PlanaVista',
  description: "Your family's calendar and chores, together on one screen.",
  preview: true,
};

const CARD_TYPES = ['planavista-calendar-card', 'planavista-card'];

/** Add the entry once, even if another copy of the bundle ran first. */
export function registerCardPicker(cards: Array<{ type: string }>): void {
  if (!cards.some(card => CARD_TYPES.includes(card.type))) {
    cards.push({ ...CARD_PICKER_ENTRY });
  }
}

/** The card's entry in Home Assistant's card picker. */
export interface CardPickerEntry {
  type: string;
  name: string;
  description: string;
  preview: boolean;
}

/**
 * The picker keeps the 1.1.0 element name for now. A card added as
 * `custom:planavista-card` would break if the household stepped back to
 * 1.1.0, which doesn't know the alias. The picker switches to the alias once
 * the release that introduced it is the oldest one people step back to.
 */
export const CARD_PICKER_ENTRY: CardPickerEntry = {
  type: 'planavista-calendar-card',
  name: 'PlanaVista',
  description: 'All-in-one calendar with clock, weather, toggles, and views',
  preview: true,
};

const CARD_TYPES = ['planavista-calendar-card', 'planavista-card'];

/** Add the entry once, even if another copy of the bundle ran first. */
export function registerCardPicker(cards: Array<{ type: string }>): void {
  if (!cards.some(card => CARD_TYPES.includes(card.type))) {
    cards.push({ ...CARD_PICKER_ENTRY });
  }
}

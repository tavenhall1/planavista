import { describe, expect, it } from 'vitest';
import { LayoutTracker, barFits, barShape, classifyLayout } from '../src/core/layout';

describe('barFits (the bar keeps one row while everything fits, spec 12.2)', () => {
  it('fits a portrait tablet\'s bar, and not a phone\'s with two modules', () => {
    const phone = [146, 287, 35, 48];
    expect(barFits(phone, 12, 390 - 24)).toBe(false);
    const portrait = [146, 287, 145, 100, 48];
    expect(barFits(portrait, 12, 800 - 24)).toBe(true);
    expect(barFits(portrait, 12, 768 - 24)).toBe(false);
    expect(barFits([], 12, 100)).toBe(true);
  });
});

describe("barShape (one row on a phone: the views fold into a pop-up button)", () => {
  // Widths measured on the dev HA at 390 px: the switcher 156, the gear 48, Chores' + 48.
  it("keeps the views' segments when everything fits, as on a portrait tablet", () => {
    expect(barShape([146, 145, 100, 48], 287, 96, 12, 800 - 24)).toBe('row');
  });

  it("folds the views into the pop-up button when the segments don't fit but it does", () => {
    expect(barShape([156, 48], 366, 104, 12, 390 - 24)).toBe('picker');
    expect(barShape([156, 48, 48], 268, 108, 8, 440 - 24)).toBe('picker');
  });

  it('takes a second row only when even the pop-up button leaves no room', () => {
    expect(barShape([156, 62, 48, 48], 268, 108, 12, 320 - 24)).toBe('wrapped');
  });

  it('needs no pop-up button for a module without views', () => {
    expect(barShape([156, 48], 0, 0, 12, 390 - 24)).toBe('row');
  });
});

describe('classifyLayout', () => {
  it('sorts the reference sizes', () => {
    expect(classifyLayout({ width: 800, height: 1280 }, null, null, false)).toBe('portrait');
    expect(classifyLayout({ width: 1280, height: 800 }, null, null, false)).toBe('landscape');
    expect(classifyLayout({ width: 390, height: 844 }, null, null, false)).toBe('phone');
  });

  it('calls anything narrower than 600 px a phone, unless it is wide and short (round 1)', () => {
    expect(classifyLayout({ width: 599, height: 700 }, null, null, false)).toBe('phone');
    expect(classifyLayout({ width: 599, height: 300 }, null, null, false)).toBe('landscape');
    expect(classifyLayout({ width: 600, height: 900 }, null, null, false)).toBe('portrait');
  });

  it('keeps the previous shape when the card is nearly square', () => {
    expect(classifyLayout({ width: 1000, height: 1000 }, null, null, false)).toBe('landscape');
    expect(classifyLayout({ width: 1000, height: 1000 }, 'portrait', null, false)).toBe('portrait');
    expect(classifyLayout({ width: 1040, height: 1000 }, 'portrait', null, false)).toBe('portrait');
    expect(classifyLayout({ width: 960, height: 1000 }, 'landscape', null, false)).toBe('landscape');
    expect(classifyLayout({ width: 1060, height: 1000 }, 'portrait', null, false)).toBe('landscape');
    expect(classifyLayout({ width: 1000, height: 1000 }, 'phone', null, false)).toBe('landscape');
  });

  it('ignores the on-screen keyboard while a text field has focus', () => {
    const tablet = { width: 800, height: 1280 };
    const keyboard = { width: 800, height: 700 };
    expect(classifyLayout(keyboard, 'portrait', tablet, true)).toBe('portrait');
    expect(classifyLayout(keyboard, 'portrait', tablet, false)).toBe('landscape');
    expect(classifyLayout({ width: 1280, height: 800 }, 'portrait', tablet, true)).toBe('landscape');
  });

  it('treats a card with no height as landscape', () => {
    expect(classifyLayout({ width: 900, height: 0 }, null, null, false)).toBe('landscape');
  });
});

describe('LayoutTracker', () => {
  it('keeps portrait while the keyboard opens, changes height, and closes', () => {
    const tracker = new LayoutTracker();
    expect(tracker.measure({ width: 800, height: 1280 })).toBe('portrait');
    tracker.focus(true);
    expect(tracker.measure({ width: 800, height: 560 })).toBe('portrait');
    // The suggestion strip goes away: taller than a moment ago, still below where it began.
    expect(tracker.measure({ width: 800, height: 620 })).toBe('portrait');
    expect(tracker.measure({ width: 800, height: 520 })).toBe('portrait');
    expect(tracker.measure({ width: 800, height: 1280 })).toBe('portrait');
  });

  it('keeps the box from before the keyboard when focus moves to another field', () => {
    const tracker = new LayoutTracker();
    tracker.measure({ width: 800, height: 1280 });
    tracker.focus(true);
    tracker.measure({ width: 800, height: 560 });
    tracker.blur();
    tracker.focus(true);
    expect(tracker.measure({ width: 800, height: 640 })).toBe('portrait');
  });

  it('follows real size changes once the keyboard is gone', () => {
    const tracker = new LayoutTracker();
    tracker.measure({ width: 800, height: 1280 });
    tracker.focus(true);
    tracker.measure({ width: 800, height: 560 });
    tracker.blur();
    expect(tracker.measure({ width: 800, height: 1280 })).toBe('portrait');
    expect(tracker.measure({ width: 800, height: 700 })).toBe('landscape');
  });

  it('follows a rotation even while a field has focus', () => {
    const tracker = new LayoutTracker();
    tracker.measure({ width: 800, height: 1280 });
    tracker.focus(true);
    expect(tracker.measure({ width: 1280, height: 400 })).toBe('landscape');
  });

  it('ignores focus in controls that bring up no keyboard', () => {
    const tracker = new LayoutTracker();
    tracker.measure({ width: 800, height: 1280 });
    tracker.focus(false);
    expect(tracker.measure({ width: 800, height: 700 })).toBe('landscape');
  });
});

// Round 1 of the adversarial review: an iPhone held sideways with Home Assistant's sidebar docked gave
// the card 576 by 384; width alone made it a phone, whose tall header, two-row toolbar, and bottom bar
// left the Day view no hours at all.
describe('a wide, short card takes the landscape arrangement', () => {
  it('is landscape when it is wider than tall and short, even under 600 px wide', () => {
    expect(classifyLayout({ width: 576, height: 384 }, null, null, false)).toBe('landscape');
    expect(classifyLayout({ width: 500, height: 300 }, null, null, false)).toBe('landscape');
  });

  it('stays a phone when it is tall enough, or narrow', () => {
    expect(classifyLayout({ width: 440, height: 956 }, null, null, false)).toBe('phone');
    expect(classifyLayout({ width: 580, height: 520 }, null, null, false)).toBe('phone');
    expect(classifyLayout({ width: 400, height: 380 }, null, null, false)).toBe('phone');
  });
});

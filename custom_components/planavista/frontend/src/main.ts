// PlanaVista v1.0
// Single entry point — imports the unified card and registers it with HA

// Reusable sub-components
import './components/color-swatch-picker';
import './components/onboarding-wizard';
import './components/pv-event-chip';

import './cards/planavista-calendar-card';

// Register card with the HA card picker (once, even if another copy of the bundle ran first)
window.customCards = window.customCards || [];
if (!window.customCards.some(card => card.type === 'planavista-calendar-card')) {
  window.customCards.push({
    type: 'planavista-calendar-card',
    name: 'PlanaVista',
    description: 'All-in-one calendar with clock, weather, toggles, and views',
    preview: true,
  });
}

console.info(
  '%c PLANAVISTA %c v1.0.0 ',
  'color: white; background: #6366F1; font-weight: bold; border-radius: 4px 0 0 4px; padding: 2px 6px;',
  'color: #6366F1; background: #EEF2FF; font-weight: bold; border-radius: 0 4px 4px 0; padding: 2px 6px;',
);

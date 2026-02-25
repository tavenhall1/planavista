// PlanaVista v1.0
// Single entry point — imports all cards and registers them with HA

// Reusable sub-components
import './components/color-swatch-picker';

import './cards/planavista-calendar-card';
import './cards/planavista-grid-card';
import './cards/planavista-agenda-card';
import './cards/planavista-clock-card';
import './cards/planavista-weather-card';
import './cards/planavista-toggles-card';

// Register all cards with the HA card picker
window.customCards = window.customCards || [];
window.customCards.push(
  {
    type: 'planavista-calendar-card',
    name: 'PlanaVista (Unified)',
    description: 'All-in-one calendar with clock, weather, toggles, and views',
    preview: true,
  },
  {
    type: 'planavista-grid-card',
    name: 'PlanaVista Grid',
    description: 'Calendar grid with day, week, and month views',
    preview: true,
  },
  {
    type: 'planavista-agenda-card',
    name: 'PlanaVista Agenda',
    description: 'Upcoming events list',
    preview: true,
  },
  {
    type: 'planavista-clock-card',
    name: 'PlanaVista Clock',
    description: 'Time and date display',
    preview: true,
  },
  {
    type: 'planavista-weather-card',
    name: 'PlanaVista Weather',
    description: 'Weather conditions and forecast',
    preview: true,
  },
  {
    type: 'planavista-toggles-card',
    name: 'PlanaVista Toggles',
    description: 'Calendar visibility toggles',
    preview: true,
  },
);

console.info(
  '%c PLANAVISTA %c v1.0.0 ',
  'color: white; background: #6366F1; font-weight: bold; border-radius: 4px 0 0 4px; padding: 2px 6px;',
  'color: #6366F1; background: #EEF2FF; font-weight: bold; border-radius: 0 4px 4px 0; padding: 2px 6px;',
);

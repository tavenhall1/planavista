// PlanaVista: the single entry point. Modules register themselves first,
// then the card that hosts them.
import './modules/calendar';
import './modules/chores';
import './shell/planavista-card';
import { version } from '../package.json';
import { registerCardPicker } from './shell/card-picker';
import { startKiosk } from './shell/kiosk-controller';
import { startScreensaver } from './shell/screensaver-controller';
import './shell/pv-screensaver';
import { watchPagePresses } from './core/press-guard';

// Register the card with the HA card picker (once, even if another copy of the bundle ran first).
window.customCards = window.customCards || [];
registerCardPicker(window.customCards);

// Kiosk mode on shared screens, on every Home Assistant page (milestone 9).
startKiosk();

// The screensaver on shared screens, over every Home Assistant page (milestone 11).
startScreensaver();

// The page's presses, so a sheet built on a burst's first tap knows the burst (round 8).
watchPagePresses();

console.info(
  `%c PLANAVISTA %c v${version} `,
  'color: white; background: #6366F1; font-weight: bold; border-radius: 4px 0 0 4px; padding: 2px 6px;',
  'color: #6366F1; background: #EEF2FF; font-weight: bold; border-radius: 0 4px 4px 0; padding: 2px 6px;',
);

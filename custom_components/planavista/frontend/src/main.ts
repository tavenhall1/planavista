// PlanaVista: the single entry point. Modules register themselves first,
// then the card that hosts them.
import './modules/calendar';
import './shell/planavista-card';
import { version } from '../package.json';
import { registerCardPicker } from './shell/card-picker';

// Register the card with the HA card picker (once, even if another copy of the bundle ran first).
window.customCards = window.customCards || [];
registerCardPicker(window.customCards);

console.info(
  `%c PLANAVISTA %c v${version} `,
  'color: white; background: #6366F1; font-weight: bold; border-radius: 4px 0 0 4px; padding: 2px 6px;',
  'color: #6366F1; background: #EEF2FF; font-weight: bold; border-radius: 0 4px 4px 0; padding: 2px 6px;',
);

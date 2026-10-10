// The calendar module: its elements, and its entry in the module registry.
import './components/pv-event-chip';
import './calendar-module';
import './settings/options-page';
import './settings/calendars-page';
import { registerCalendarModule, registerCalendarSettings } from './definition';

registerCalendarModule();
registerCalendarSettings();

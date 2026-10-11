// The Chores module: its elements, its Settings pages, and its entry in the module registry.
import './pv-chores-module';
import './settings/pv-chores-list-page';
import './settings/pv-chore-editor';
import './settings/pv-rewards-page';
import './settings/pv-reward-editor';
import './settings/pv-rules-page';
import './settings/pv-reminders-page';
import './settings/pv-person-chores';
import './settings/pv-person-sleep';
import './settings/pv-person-phones';
import './settings/pv-person-stars';
import { registerChoresModule, registerChoresSettings } from './definition';

registerChoresModule();
registerChoresSettings();

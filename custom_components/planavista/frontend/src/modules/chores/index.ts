// The Chores module: its elements, its Settings pages, and its entry in the module registry.
import './pv-chores-module';
import './settings/pv-chores-list-page';
import './settings/pv-chores-off-page';
import './settings/pv-chore-editor';
import './settings/pv-rewards-page';
import './settings/pv-reward-editor';
import './settings/pv-rules-page';
import './settings/pv-reminders-page';
import './settings/pv-person-chores';
import './settings/pv-person-sleep';
import './settings/pv-person-phones';
import './settings/pv-person-stars';
import './settings/pv-import-export-page';
import './settings/pv-import-review';
import './setup/pv-setup-chores-choice';
import './setup/pv-setup-common-chores';
import './setup/pv-setup-file';
import './setup/pv-setup-shared-screen';
import './setup/pv-setup-done-board';
import { registerChoresModule, registerChoresSettings } from './definition';

registerChoresModule();
registerChoresSettings();

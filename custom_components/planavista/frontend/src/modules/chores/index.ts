// The Chores module: its elements, its Settings pages, and its entry in the module registry.
import './pv-chores-module';
import './settings/pv-chores-list-page';
import { registerChoresModule, registerChoresSettings } from './definition';

registerChoresModule();
registerChoresSettings();

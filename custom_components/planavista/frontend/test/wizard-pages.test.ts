import { describe, expect, it } from 'vitest';
import { ModuleRegistry } from '../src/core/module-registry';
import { PageRegistry, type WizardContext } from '../src/core/page-registry';
import { registerCalendarModule } from '../src/modules/calendar/definition';
import { registerShellPages } from '../src/shell/definition';

describe('setup steps and Settings tabs', () => {
  it('are Preferences, Calendars, and Theme, in that order, as before', () => {
    const steps = new PageRegistry<WizardContext>();
    const settings = new PageRegistry<WizardContext>();
    registerShellPages(steps, settings);
    registerCalendarModule(new ModuleRegistry(), steps, settings);
    expect(steps.pages({ mode: 'onboarding' }).map(p => p.label)).toEqual(['Preferences', 'Calendars', 'Theme']);
    expect(settings.pages({ mode: 'settings' }).map(p => p.label)).toEqual(['Preferences', 'Calendars', 'Theme']);
  });
});

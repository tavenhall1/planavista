import { PageRegistry, WizardContext, WizardPage, settingsPages, setupSteps } from '../core/page-registry';

/** Pages the shell itself contributes to setup and Settings. */
export const shellPages: WizardPage<WizardContext>[] = [
  { id: 'theme', label: 'Theme', order: 900 },
];

/** Add the shell's pages to setup and Settings. */
export function registerShellPages(
  steps: PageRegistry<WizardContext> = setupSteps,
  settings: PageRegistry<WizardContext> = settingsPages,
): void {
  for (const page of shellPages) {
    steps.register(page);
    settings.register(page);
  }
}

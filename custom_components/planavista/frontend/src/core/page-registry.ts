/** A step of the setup wizard or a tab of Settings. */
export interface WizardPage<C> {
  id: string;
  label: string;
  /** Position among pages; lower comes first. */
  order: number;
  /** Leave out to always show the page. */
  applies?: (ctx: C) => boolean;
}

/** What the wizard knows when it asks which pages apply. */
export interface WizardContext {
  mode: 'onboarding' | 'settings';
}

/** An ordered list of pages that modules contribute. Registering an id again replaces it. */
export class PageRegistry<C> {
  private readonly _pages = new Map<string, WizardPage<C>>();

  register(page: WizardPage<C>): void {
    this._pages.set(page.id, page);
  }

  pages(ctx: C): WizardPage<C>[] {
    return [...this._pages.values()]
      .filter(page => !page.applies || page.applies(ctx))
      .sort((a, b) => a.order - b.order || a.id.localeCompare(b.id));
  }
}

/** Steps of first-run setup. */
export const setupSteps = new PageRegistry<WizardContext>();

/** Tabs of Settings. */
export const settingsPages = new PageRegistry<WizardContext>();

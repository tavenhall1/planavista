/** A page that modules contribute: a Settings page or a setup step. */
export interface WizardPage<C> {
  id: string;
  label: string;
  /** Position among pages; lower comes first. */
  order: number;
  /** Leave out to always show the page. */
  applies?: (ctx: C) => boolean;
}

/** An ordered list of pages that modules contribute. Registering an id again replaces it. */
export class PageRegistry<C, P extends WizardPage<C> = WizardPage<C>> {
  private readonly _pages = new Map<string, P>();

  register(page: P): void {
    this._pages.set(page.id, page);
  }

  pages(ctx: C): P[] {
    return [...this._pages.values()]
      .filter(page => !page.applies || page.applies(ctx))
      .sort((a, b) => a.order - b.order || a.id.localeCompare(b.id));
  }
}

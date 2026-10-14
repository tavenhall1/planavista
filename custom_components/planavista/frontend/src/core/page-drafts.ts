/**
 * Editors' unsaved changes (a person, a chore, a reward), kept for the page.
 * Home Assistant rebuilds the card after it restarts, so drafts kept on the
 * card went with it (round 2); spec 9.4 keeps them until the page reloads.
 * Each card keeps its own appearance edits, which preview on that card.
 */
const PAGE_DRAFTS = new Map<string, unknown>();
const OWN = new Set(['appearance']);

export class CardDrafts extends Map<string, unknown> {
  constructor(private readonly _page: Map<string, unknown> = PAGE_DRAFTS) {
    super();
  }

  get(key: string): unknown {
    return OWN.has(key) ? super.get(key) : this._page.get(key);
  }

  set(key: string, value: unknown): this {
    if (OWN.has(key)) super.set(key, value);
    else this._page.set(key, value);
    return this;
  }

  has(key: string): boolean {
    return OWN.has(key) ? super.has(key) : this._page.has(key);
  }

  delete(key: string): boolean {
    return OWN.has(key) ? super.delete(key) : this._page.delete(key);
  }

  keys(): IterableIterator<string> {
    return [...super.keys(), ...this._page.keys()].values();
  }
}

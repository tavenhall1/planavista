/**
 * Register a custom element unless the name is already taken.
 *
 * A browser tab can still hold an older PlanaVista bundle (HA keeps pages
 * alive for days on wall tablets). customElements.define throws on a name
 * that's already registered, which would abort this bundle before the card
 * registers. Skipping keeps the page working; a reload picks up the new code.
 *
 * Returns true when this call registered the element.
 */
export function defineElement(tag: string, ctor: CustomElementConstructor): boolean {
  if (customElements.get(tag)) return false;
  customElements.define(tag, ctor);
  return true;
}

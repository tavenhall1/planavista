/**
 * Register a custom element unless the name is already taken.
 *
 * A browser tab can still hold an older PlanaVista bundle (HA keeps pages
 * alive for days on wall tablets). customElements.define throws on a name
 * that's already registered, which would abort this bundle before the card
 * registers. Skipping keeps the page working; a reload picks up the new code.
 *
 * Home Assistant's page imports its app bundle and this one in parallel, and
 * the app replaces window.customElements with a scoped-registry polyfill. An
 * element defined in the browser's own registry before that happens is
 * invisible to the polyfill, so the dashboard shows "Configuration error".
 * While the page's <home-assistant> element isn't defined yet, the
 * definition waits for it and then goes to the registry in use by then.
 *
 * Returns true when this call registered the element right away.
 */
export function defineElement(tag: string, ctor: CustomElementConstructor): boolean {
  if (homeAssistantStarting()) {
    customElements.whenDefined('home-assistant').then(() => register(tag, ctor));
    return false;
  }
  return register(tag, ctor);
}

/** True on Home Assistant's page before its app has defined the root element. */
function homeAssistantStarting(): boolean {
  return typeof document !== 'undefined'
    && document.querySelector('home-assistant') !== null
    && !customElements.get('home-assistant');
}

function register(tag: string, ctor: CustomElementConstructor): boolean {
  if (customElements.get(tag)) return false;
  customElements.define(tag, ctor);
  return true;
}

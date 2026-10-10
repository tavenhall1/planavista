import { afterEach, describe, expect, it, vi } from 'vitest';
import { defineElement, defineElementAlias } from '../src/utils/define';

/** Minimal stand-in for window.customElements, which throws on a second define like the real one. */
class FakeRegistry {
  private readonly _defs = new Map<string, CustomElementConstructor>();
  private readonly _waiting = new Map<string, Array<() => void>>();
  get(name: string): CustomElementConstructor | undefined {
    return this._defs.get(name);
  }
  define(name: string, ctor: CustomElementConstructor): void {
    if (this._defs.has(name)) {
      throw new DOMException(`the name "${name}" has already been used with this registry`, 'NotSupportedError');
    }
    this._defs.set(name, ctor);
    for (const resolve of this._waiting.get(name) ?? []) resolve();
    this._waiting.delete(name);
  }
  whenDefined(name: string): Promise<void> {
    if (this._defs.has(name)) return Promise.resolve();
    return new Promise(resolve => {
      this._waiting.set(name, [...(this._waiting.get(name) ?? []), resolve]);
    });
  }
}

/** A Home Assistant page: the markup has <home-assistant>, whether or not it is defined yet. */
const onHomeAssistantPage = () => {
  vi.stubGlobal('document', { querySelector: (selector: string) => (selector === 'home-assistant' ? {} : null) });
};

const settle = () => new Promise(resolve => setTimeout(resolve, 0));

const OldChip = class {} as unknown as CustomElementConstructor;
const NewChip = class {} as unknown as CustomElementConstructor;

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('defineElement', () => {
  it('registers a new tag', () => {
    const registry = new FakeRegistry();
    vi.stubGlobal('customElements', registry);
    expect(defineElement('pv-event-chip', NewChip)).toBe(true);
    expect(registry.get('pv-event-chip')).toBe(NewChip);
  });

  it('waits for Home Assistant to define its root, then defines into the registry in use by then', async () => {
    // Home Assistant's page imports its app and this bundle in parallel. The
    // app replaces window.customElements with a scoped-registry polyfill; an
    // element defined natively before that is invisible to the polyfill.
    onHomeAssistantPage();
    const native = new FakeRegistry();
    vi.stubGlobal('customElements', native);
    expect(defineElement('planavista-calendar-card', NewChip)).toBe(false);
    expect(native.get('planavista-calendar-card')).toBeUndefined();

    const polyfilled = new FakeRegistry();
    vi.stubGlobal('customElements', polyfilled);
    polyfilled.define('home-assistant', OldChip);
    native.define('home-assistant', OldChip); // the polyfill also defines a stand-in natively
    await settle();
    expect(polyfilled.get('planavista-calendar-card')).toBe(NewChip);
    expect(native.get('planavista-calendar-card')).toBeUndefined();
  });

  it('defines right away once Home Assistant has defined its root', () => {
    onHomeAssistantPage();
    const registry = new FakeRegistry();
    registry.define('home-assistant', OldChip);
    vi.stubGlobal('customElements', registry);
    expect(defineElement('pv-event-chip', NewChip)).toBe(true);
    expect(registry.get('pv-event-chip')).toBe(NewChip);
  });

  it('defines right away on a page without Home Assistant', () => {
    vi.stubGlobal('document', { querySelector: () => null });
    const registry = new FakeRegistry();
    vi.stubGlobal('customElements', registry);
    expect(defineElement('pv-event-chip', NewChip)).toBe(true);
  });

  it('skips a tag another bundle already defined instead of throwing', () => {
    const registry = new FakeRegistry();
    registry.define('pv-event-chip', OldChip);
    vi.stubGlobal('customElements', registry);
    expect(() => defineElement('pv-event-chip', NewChip)).not.toThrow();
    expect(defineElement('pv-event-chip', NewChip)).toBe(false);
    expect(registry.get('pv-event-chip')).toBe(OldChip);
  });
});

describe('defineElementAlias', () => {
  it('registers the alias as a subclass, even when an older bundle took the original name', () => {
    const registry = new FakeRegistry();
    registry.define('planavista-calendar-card', OldChip);
    vi.stubGlobal('customElements', registry);
    const Card = class {} as unknown as CustomElementConstructor;
    expect(defineElement('planavista-calendar-card', Card)).toBe(false);
    expect(defineElementAlias('planavista-card', Card)).toBe(true);
    expect(Object.getPrototypeOf(registry.get('planavista-card'))).toBe(Card);
  });

  it('skips an alias that another bundle already defined', () => {
    const registry = new FakeRegistry();
    registry.define('planavista-card', OldChip);
    vi.stubGlobal('customElements', registry);
    expect(defineElementAlias('planavista-card', NewChip)).toBe(false);
    expect(registry.get('planavista-card')).toBe(OldChip);
  });
});

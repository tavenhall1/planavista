import { afterEach, describe, expect, it, vi } from 'vitest';
import { defineElement } from '../src/utils/define';

/** Minimal stand-in for window.customElements, which throws on a second define like the real one. */
class FakeRegistry {
  private readonly _defs = new Map<string, CustomElementConstructor>();
  get(name: string): CustomElementConstructor | undefined {
    return this._defs.get(name);
  }
  define(name: string, ctor: CustomElementConstructor): void {
    if (this._defs.has(name)) {
      throw new DOMException(`the name "${name}" has already been used with this registry`, 'NotSupportedError');
    }
    this._defs.set(name, ctor);
  }
}

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

  it('skips a tag another bundle already defined instead of throwing', () => {
    const registry = new FakeRegistry();
    registry.define('pv-event-chip', OldChip);
    vi.stubGlobal('customElements', registry);
    expect(() => defineElement('pv-event-chip', NewChip)).not.toThrow();
    expect(defineElement('pv-event-chip', NewChip)).toBe(false);
    expect(registry.get('pv-event-chip')).toBe(OldChip);
  });
});

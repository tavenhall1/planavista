import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { CARD_PICKER_ENTRY } from '../src/shell/card-picker';

const read = (path: string) => readFileSync(new URL(path, import.meta.url), 'utf-8');

describe('the docs', () => {
  // A card added from an example has to survive a step back one release, as the card picker's does.
  it.each(['../../../../README.md', '../../../../DESIGN_SYSTEM.md'])('%s shows the card type the card picker writes', path => {
    const types = [...read(path).matchAll(/type:\s*custom:([a-z-]+)/g)].map(match => match[1]);
    expect(types.length).toBeGreaterThan(0);
    expect([...new Set(types)]).toEqual([CARD_PICKER_ENTRY.type]);
  });
});

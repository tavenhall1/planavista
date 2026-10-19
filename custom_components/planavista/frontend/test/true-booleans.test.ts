import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

// The owner (0.13.3): the Week view moved to another week, then another view and back, had no This week
// button. Coming back makes a new pv-chores-week, and `?current=${false}` on a new element only leaves the
// attribute off, so `current` kept its default of true and This week stayed disabled. A Boolean property
// that starts out true can only be told false through a property binding.
describe('Boolean properties that start out true', () => {
  const src = fileURLToPath(new URL('../src', import.meta.url));
  const files = (dir: string): string[] =>
    readdirSync(dir).flatMap(name => {
      const path = join(dir, name);
      return statSync(path).isDirectory() ? files(path) : path.endsWith('.ts') ? [path] : [];
    });
  const sources = files(src).map(path => ({ path, text: readFileSync(path, 'utf8') }));
  const trueByDefault = sources.flatMap(({ text }) =>
    [...text.matchAll(/@property\(\{[^}]*type: Boolean[^}]*\}\)\s*(?:declare\s+)?(\w+)\s*=\s*true/g)].map(m => m[1]),
  );

  it('are found (the scan still sees them)', () => {
    expect(trueByDefault).toContain('current');
    expect(trueByDefault).toContain('showStripes');
  });

  it('are never bound as attributes, which a new element would ignore when false', () => {
    const bound = sources.flatMap(({ path, text }) =>
      trueByDefault.filter(name => new RegExp(`\\?${name}=\\$\\{`).test(text)).map(name => `${path}: ?${name}=`),
    );
    expect(bound).toEqual([]);
  });

  it('the Week view is told which week it shows through its property', () => {
    const module = readFileSync(join(src, 'modules/chores/pv-chores-module.ts'), 'utf8');
    expect(module).toMatch(/\.current=\$\{this\._weekOffset === 0\}/);
  });
});

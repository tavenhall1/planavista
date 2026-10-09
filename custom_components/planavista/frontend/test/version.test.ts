import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('release version', () => {
  it('package.json matches the integration manifest', () => {
    const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
    const manifest = JSON.parse(readFileSync(new URL('../../manifest.json', import.meta.url), 'utf8'));
    expect(pkg.version).toBe(manifest.version);
  });
});

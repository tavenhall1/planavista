import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const src = (path: string) => readFileSync(new URL(`../src/${path}`, import.meta.url), 'utf8').replace(/\r\n/g, '\n');

describe("a missed chore's options sheet (missed-and-urgency spec 6)", () => {
  it('the client sends clear_missed with the chore and holder, and excuse_missed with keys', () => {
    const client = src('modules/chores/chores-client.ts');
    expect(client).toMatch(/clearMissed\(chore: string, member: string\)[^\n]*\n\s*return this\.call\('planavista\/chores\/clear_missed', \{ chore, member \}\);/);
    expect(client).toMatch(/excuseMissedAll\(keys: string\[\]/);
    expect(client).toMatch(/'planavista\/chores\/excuse_missed', \{ keys \}/);
  });

  it('both actions ask a parent, and "already taken care of" closes the sheet quietly', () => {
    const module = src('modules/chores/pv-chores-module.ts');
    expect(module).toMatch(/case 'clear_missed':/);
    expect(module).toMatch(/case 'excuse_missed':/);
    const body = module.slice(module.indexOf("case 'clear_missed':"), module.indexOf("case 'approve':"));
    expect(body).toMatch(/asParent\(clearing \? `Who's taking \$\{name\} off the board\?`/);
    expect(body).toMatch(/Who's excusing/);
    expect(body).toMatch(/errorCode\(err\) === 'not_missed'/);
    // Excuse the misses sends exactly the keys the feed's flag names.
    expect(body).toMatch(/const keys = item\.missed\?\.keys \?\? \[\];/);
    expect(body).toMatch(/api\.excuseMissedAll\(keys\)/);
  });

  it('the sheet draws the red note above the options', () => {
    const sheet = src('modules/chores/pv-chore-options.ts');
    expect(sheet).toMatch(/model\.missed \? html`<div class="missed-note"/);
  });

  it("final review B-I3: the sheet's Done checks it off as a hold does, and the closer says Close beside it", () => {
    const sheet = src('modules/chores/pv-chore-options.ts');
    expect(sheet).toMatch(/model\.done \? html`[\s\S]*?this\._choose\('done'\)/);
    expect(sheet).toMatch(/\$\{model\.closeLabel\}<\/button>/);
    const module = src('modules/chores/pv-chores-module.ts');
    const body = module.slice(module.indexOf("case 'done':"), module.indexOf("case 'undo':"));
    expect(body).toMatch(/asMember\(owner\.id, `Who's checking off \$\{name\}\?`\)/);
    expect(body).toMatch(/this\._checkOff\(row, owner\.id, fresh\)/);
  });
});

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { beginRewardDraft, rebaseReward, rewardStale } from '../src/modules/chores/settings/reward-draft';
import type { Reward } from '../src/modules/chores/chores-types';

const DINNER: Reward = { id: 'friday_dinner', name: 'Choose Friday dinner', icon: '🍕', cost: 30, needs_ok: true, who: [] };

// Round 4 (r4a A2): a reward draft kept across parent mode loaded over another parent's
// change (★ 35) with no word, and Save wrote ★ 30 back; rewards carry no revision.
describe('a kept reward draft knows when its reward changed elsewhere', () => {
  const kept = () => {
    const record = beginRewardDraft(DINNER);
    return { ...record, draft: { ...record.draft, name: 'Choose Saturday dinner' } };
  };

  it('is stale once the live reward differs from where the draft started', () => {
    expect(rewardStale(kept(), DINNER)).toBe(false);
    expect(rewardStale(kept(), { ...DINNER, cost: 35 })).toBe(true);
    expect(rewardStale(kept(), { ...DINNER, who: ['casey'] })).toBe(true);
    // Deleted and added again under the same name (the same id), at another price.
    expect(rewardStale(kept(), { ...DINNER, cost: 99 })).toBe(true);
  });

  it("Keep editing puts the person's own changes on the new version", () => {
    const rebased = rebaseReward(kept(), { ...DINNER, cost: 35, who: ['casey'] });
    expect(rebased.draft).toEqual({ name: 'Choose Saturday dinner', icon: '🍕', cost: 35, needs_ok: true, who: ['casey'] });
    expect(rewardStale(rebased, { ...DINNER, cost: 35, who: ['casey'] })).toBe(false);
  });

  it('the editor asks on opening a stale draft and before saving over a newer reward', () => {
    const editor = readFileSync(fileURLToPath(new URL('../src/modules/chores/settings/pv-reward-editor.ts', import.meta.url)), 'utf-8')
      .replace(/\r\n/g, '\n');
    expect(editor).toMatch(/heading="This changed on another screen\."/);
    const willUpdate = editor.slice(editor.indexOf('  protected willUpdate(): void {'));
    expect(willUpdate.slice(0, willUpdate.indexOf('\n  }\n'))).toMatch(/rewardStale\(/);
    const save = editor.slice(editor.indexOf('  private async _save(): Promise<void> {'));
    expect(save.slice(0, save.indexOf('\n  }\n'))).toMatch(/rewardStale\(this\._record, this\._reward\)/);
  });
});

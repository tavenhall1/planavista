import { describe, expect, it } from 'vitest';
import { pushedTitle, saveErrorMessage } from '../src/core/page-host';

describe('saveErrorMessage', () => {
  it('says what happened and what to do', () => {
    expect(saveErrorMessage('parent_mode_required')).toBe("Parent mode ended. Enter a parent's PIN to keep changing settings.");
    expect(saveErrorMessage('not_allowed')).toBe('Only a parent can change this.');
    expect(saveErrorMessage('unavailable')).toBe('Update PlanaVista to change people and PINs.');
    expect(saveErrorMessage('anything else')).toBe("Couldn't save. Check the connection and try again.");
  });
});

// Round 2: after "This changed on another screen" and Load the new version, a person's
// page kept the old name in its heading while the field showed the new one.
describe('pushedTitle', () => {
  const page = { tag: 'pv-settings-person', title: 'Blair', back: 'People', props: { memberId: 'blair' } };

  it("follows a person page's member as they are now", () => {
    expect(pushedTitle(page, [{ id: 'blair', name: 'Blair B' }])).toBe('Blair B');
    expect(pushedTitle(page, [])).toBe('Blair');
    expect(pushedTitle({ ...page, title: 'New person', props: { memberId: null } }, [{ id: 'blair', name: 'Blair B' }])).toBe('New person');
    expect(pushedTitle({ tag: 'pv-reward-editor', title: 'Movie night', back: 'Rewards' }, [{ id: 'blair', name: 'Blair B' }])).toBe('Movie night');
  });
});

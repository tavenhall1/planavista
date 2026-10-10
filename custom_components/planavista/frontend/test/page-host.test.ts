import { describe, expect, it } from 'vitest';
import { saveErrorMessage } from '../src/core/page-host';

describe('saveErrorMessage', () => {
  it('says what happened and what to do', () => {
    expect(saveErrorMessage('parent_mode_required')).toBe("Parent mode ended. Enter a parent's PIN to keep changing settings.");
    expect(saveErrorMessage('not_allowed')).toBe('Only a parent can change this.');
    expect(saveErrorMessage('unavailable')).toBe('Update PlanaVista to change people and PINs.');
    expect(saveErrorMessage('anything else')).toBe("Couldn't save. Check the connection and try again.");
  });
});

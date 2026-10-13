import { css } from 'lit';

/**
 * The one look for each kind of choice (DESIGN_SYSTEM section 11, milestone 8).
 *
 * - Pick one of a few: `.pv-seg`, a grey track whose chosen button carries a
 *   white chip. Buttons mark the choice with aria-pressed (or aria-checked in a
 *   radiogroup). Every button is 48 px tall; the chip is drawn inside it, so
 *   the whole button is the target. `.stretch` fills the row with equal parts.
 * - Pick one of a list of named choices with a line of explanation:
 *   `.pv-choices` holding `label.pv-choice` rows around a real radio input; the
 *   chosen row shows a check, as in a phone's settings.
 */
export const segmentedStyles = css`
  .pv-seg {
    display: inline-flex;
    align-items: stretch;
    gap: 2px;
    max-width: 100%;
    height: 48px;
    padding: 0 4px;
    box-sizing: border-box;
    border-radius: 13px;
    background: var(--pv-seg, #ECECE8);
  }

  .pv-seg.stretch {
    display: flex;
    width: 100%;
  }

  .pv-seg.stretch > button {
    flex: 1 1 0;
    min-width: 0;
  }

  .pv-seg > button {
    position: relative;
    isolation: isolate;
    /* Each choice keeps its width, so a long list scrolls (or wraps the bar) instead of cutting words. */
    flex: 0 0 auto;
    min-width: 48px;
    height: 48px;
    padding: 0 14px;
    border: none;
    background: none;
    color: var(--pv-text-secondary, #5F6670);
    font: inherit;
    font-size: 0.875rem;
    font-weight: 650;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }

  .pv-seg > button::before {
    content: '';
    position: absolute;
    inset: 5px 0;
    z-index: -1;
    border-radius: 9px;
  }

  .pv-seg > button[aria-pressed='true'],
  .pv-seg > button[aria-checked='true'] {
    color: var(--pv-text, #1A1B1E);
  }

  .pv-seg > button[aria-pressed='true']::before,
  .pv-seg > button[aria-checked='true']::before {
    background: var(--pv-seg-on, #FFFFFF);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.12);
  }

  .pv-seg > button:not([aria-pressed='true']):not([aria-checked='true']):not(:disabled):hover {
    color: var(--pv-text, #1A1B1E);
  }

  .pv-seg > button:focus-visible {
    outline: none;
  }

  .pv-seg > button:focus-visible::before {
    outline: 2px solid var(--pv-accent-ink, #5B5BD6);
    outline-offset: -1px;
  }

  .pv-seg > button:disabled {
    opacity: 0.45;
    cursor: default;
  }
`;

export const choiceStyles = css`
  .pv-choices {
    display: flex;
    flex-direction: column;
    border: 1px solid var(--pv-border, #E7E7E3);
    border-radius: 12px;
    background: var(--pv-card-bg, #FFFFFF);
    overflow: hidden;
  }

  .pv-choice {
    position: relative;
    display: flex;
    align-items: center;
    gap: 12px;
    min-height: 56px;
    padding: 10px 14px;
    box-sizing: border-box;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }

  .pv-choice + .pv-choice {
    border-top: 1px solid var(--pv-border, #E7E7E3);
  }

  .pv-choice input {
    position: absolute;
    opacity: 0;
    width: 1px;
    height: 1px;
    margin: 0;
    pointer-events: none;
  }

  .pv-choice .choice-text {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .pv-choice .choice-title {
    font-weight: 600;
    color: var(--pv-text, #1A1B1E);
  }

  .pv-choice .choice-sub {
    font-size: 0.8125rem;
    line-height: 1.4;
    color: var(--pv-text-secondary, #5F6670);
  }

  .pv-choice .choice-check {
    flex: none;
    width: 22px;
    text-align: center;
    font-weight: 800;
    color: var(--pv-accent-ink, #5B5BD6);
    visibility: hidden;
  }

  .pv-choice:has(input:checked) .choice-check {
    visibility: visible;
  }

  .pv-choice:has(input:focus-visible) {
    outline: 2px solid var(--pv-accent-ink, #5B5BD6);
    outline-offset: -2px;
  }
`;

export const tagStyles = css`
  .pv-tag {
    display: inline-flex;
    align-items: center;
    flex-shrink: 0;
    padding: 3px 9px;
    border-radius: 999px;
    font-size: 0.75rem;
    font-weight: 600;
    line-height: 1.3;
    white-space: nowrap;
    background: color-mix(in srgb, var(--pv-accent, #5B5BD6) 12%, transparent);
    color: var(--pv-accent-ink, #5B5BD6);
  }

  .pv-tag.muted {
    background: color-mix(in srgb, var(--pv-text, #1A1B1E) 7%, transparent);
    color: var(--pv-text-secondary, #5F6670);
  }

  .pv-tag.muted.ok {
    color: var(--pv-text, #1A1B1E);
  }

  .pv-tag.ask,
  .pv-tag.attention {
    background: var(--pv-warn-bg, #FDF1DC);
    color: var(--pv-warn-ink, #8A5A00);
  }
`;

/**
 * Two people patterns, by job (milestone 8):
 * - `.pv-people` holding `.pv-person` buttons chooses whose view you're looking
 *   at (the phone board, Day on a phone, My day). The one shown is filled with
 *   its person's color (`--member` on the button). The strip never shrinks.
 * - `.pv-person-chips` holding `.pv-person-chip` buttons chooses who something
 *   is for (New event's Who, quick add, a chore's people, a reward's who): an
 *   avatar chip that, chosen, takes a ring in the person's color and a check.
 */
export const peopleStripStyles = css`
  .pv-people {
    display: flex;
    flex: 0 0 auto;
    gap: 6px;
    padding: 8px 12px 0;
    overflow-x: auto;
    scrollbar-width: none;
  }

  .pv-people::-webkit-scrollbar {
    display: none;
  }

  .pv-person {
    flex: 0 0 auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    min-width: 56px;
    min-height: 56px;
    padding: 4px 6px;
    border: none;
    border-radius: 14px;
    background: transparent;
    color: var(--pv-text-secondary, #5F6670);
    font: inherit;
    font-size: 0.75rem;
    font-weight: 700;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }

  .pv-person[aria-selected='true'],
  .pv-person[aria-pressed='true'] {
    color: var(--pv-text, #1A1B1E);
    background: color-mix(in srgb, var(--member, var(--pv-accent, #5B5BD6)) 16%, var(--pv-card-bg, #FFFFFF));
  }

  .pv-person:focus-visible {
    outline: 2px solid var(--pv-accent-ink, #5B5BD6);
    outline-offset: -2px;
  }
`;

export const personChipStyles = css`
  .pv-person-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .pv-person-chip {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    min-height: 48px;
    padding: 4px 14px 4px 6px;
    box-sizing: border-box;
    border: 1.5px solid var(--pv-border, #E7E7E3);
    border-radius: 999px;
    background: var(--pv-card-bg, #FFFFFF);
    color: var(--pv-text, #1A1B1E);
    font: inherit;
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }

  .pv-person-chip .dot {
    width: 28px;
    height: 28px;
    flex: none;
    border-radius: 50%;
    background: var(--member, var(--pv-accent, #5B5BD6));
  }

  .pv-person-chip[aria-pressed='true'] {
    border-color: var(--member, var(--pv-accent, #5B5BD6));
    background: color-mix(in srgb, var(--member, var(--pv-accent, #5B5BD6)) 12%, var(--pv-card-bg, #FFFFFF));
  }

  .pv-person-chip[aria-pressed='true']::after {
    content: '✓';
    font-weight: 800;
  }

  .pv-person-chip:focus-visible {
    outline: 2px solid var(--pv-accent-ink, #5B5BD6);
    outline-offset: 2px;
  }

  .pv-person-chip:disabled {
    opacity: 0.45;
    cursor: default;
  }
`;

/**
 * Chips (review): pick one or several of a row that may wrap (quick add's
 * When and minutes, the editor's estimate, setup's rhythms, the options
 * sheet's days, the inbox's reasons). One look everywhere: 48 px pills,
 * the chosen one on the accent tint; a chip with a face starts closer to it.
 */
export const chipStyles = css`
  .chips {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
  }

  .chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    min-height: 48px;
    padding: 0 14px;
    box-sizing: border-box;
    border-radius: 999px;
    border: 1px solid var(--pv-border, #E7E7E3);
    background: var(--pv-card-bg, #FFFFFF);
    color: var(--pv-text, #1A1B1E);
    font: inherit;
    font-size: 0.9375rem;
    font-weight: 650;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }

  .chip:has(pv-member-avatar) {
    padding-left: 6px;
  }

  .chip:hover,
  .chip:focus-visible {
    border-color: var(--pv-accent, #5B5BD6);
    outline: none;
  }

  .chip[aria-pressed='true'] {
    border-color: var(--pv-accent, #5B5BD6);
    background: var(--pv-accent-tint, #EEEEFC);
    color: var(--pv-accent-tint-ink, #3B3BB0);
  }
`;

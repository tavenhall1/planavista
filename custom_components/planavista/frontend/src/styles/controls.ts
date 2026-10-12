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

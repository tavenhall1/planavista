import { css } from 'lit';
import { chipStyles, tagStyles } from '../../../styles/controls';

/**
 * The chores Settings pages' look (the approved settings-editors mockup):
 * small headings over grouped cards of rows, tags as pills, person chips,
 * steppers, and segmented controls. Built on the card's theme tokens.
 */
export const choresSettingsStyles = [
  chipStyles,
  tagStyles,
  css`
  :host {
    display: block;
  }

  .section-label {
    margin: 22px 4px 8px;
    font-size: 0.8125rem;
    font-weight: 750;
    color: var(--pv-text-secondary, #6B7280);
  }

  .section-label:first-child {
    margin-top: 4px;
  }

  .group {
    margin: 0;
    padding: 0;
    list-style: none;
    border-radius: 14px;
    background: var(--pv-card-bg, #FFFFFF);
    box-shadow: inset 0 0 0 1px var(--pv-border-subtle, #E5E7EB);
    overflow: hidden;
  }

  .group > li + li,
  .group > .row + .row {
    border-top: 1px solid var(--pv-border-subtle, #E5E7EB);
  }

  .row {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
    min-height: 56px;
    padding: 8px 14px;
    box-sizing: border-box;
    border: none;
    background: transparent;
    color: inherit;
    font: inherit;
    text-align: left;
  }

  button.row {
    cursor: pointer;
  }

  button.row:hover {
    background: color-mix(in srgb, var(--pv-text, #1A1B1E) 4%, transparent);
  }

  .row-text {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .row-title {
    font-weight: 600;
  }

  .row-sub {
    font-size: 0.8125rem;
    color: var(--pv-text-secondary, #6B7280);
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .row-value {
    color: var(--pv-text-secondary, #6B7280);
    white-space: nowrap;
  }

  .chevron {
    color: var(--pv-text-secondary, #6B7280);
    font-size: 1.25rem;
  }

  .picture {
    flex-shrink: 0;
    width: 40px;
    height: 40px;
    display: grid;
    place-items: center;
    border-radius: 10px;
    background: color-mix(in srgb, var(--pv-text, #1A1B1E) 5%, transparent);
    font-size: 1.375rem;
  }

  /* Tags sit under a row's name, so a long name keeps the row's width. */
  .row-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    margin-top: 2px;
  }




  .stars {
    flex-shrink: 0;
    font-weight: 700;
    color: var(--pv-star-ink, #8A6A00);
    white-space: nowrap;
  }

  .avatars {
    display: flex;
    flex-shrink: 0;
  }

  .avatars > * + * {
    margin-left: -8px;
  }

  .hint {
    margin: 8px 4px 0;
    font-size: 0.8125rem;
    line-height: 1.45;
    color: var(--pv-text-secondary, #6B7280);
  }






  .row > .pv-seg {
    flex: 1;
  }



  .stepper {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    margin-left: auto;
  }

  .stepper output {
    min-width: 72px;
    text-align: right;
    font-weight: 700;
  }

  .stepper button {
    width: 48px;
    height: 48px;
    border: 1px solid var(--pv-border-subtle, #E5E7EB);
    border-radius: 10px;
    background: var(--pv-card-bg, #FFFFFF);
    color: inherit;
    font: inherit;
    font-size: 1.25rem;
    cursor: pointer;
  }

  .stepper button:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .toggle-row .pv-toggle {
    margin-left: auto;
    flex-shrink: 0;
  }

  .problem {
    margin: 0 0 16px;
    padding: 10px 14px;
    border-radius: 12px;
    background: color-mix(in srgb, var(--pv-danger, #DC2626) 10%, transparent);
    color: var(--pv-danger, #DC2626);
  }

  .ok {
    color: var(--pv-success-ink, #2F7D4F);
  }

  /* The one delete in place (the sheets' danger button), across the end of an editor (review). */
  .end-delete {
    width: 100%;
    margin-top: 24px;
  }

  .empty {
    margin: 24px 4px;
    color: var(--pv-text-secondary, #6B7280);
    line-height: 1.5;
  }

  .skeleton {
    height: 56px;
    border-radius: 14px;
    margin-bottom: 8px;
    background: color-mix(in srgb, var(--pv-text, #1A1B1E) 6%, transparent);
  }

  @media (prefers-reduced-motion: no-preference) {
    .skeleton {
      animation: pv-pulse 1.4s ease-in-out infinite;
    }
  }

  @keyframes pv-pulse {
    50% {
      opacity: 0.5;
    }
  }
`,
];

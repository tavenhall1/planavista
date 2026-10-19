import { css } from 'lit';
import { statusStyles } from '../../styles/status';

/**
 * Styles every chores screen shares: the status styles every module uses
 * (badges, designed states, banners, the skeleton), section headings, and
 * the rounded face for headings and numbers.
 */
export const choresStyles = css`
  ${statusStyles}

  /* A dimmed shared screen (0.12.0): emoji by the level, words by the text rule. */
  .emo {
    filter: var(--pv-media-filter, none);
  }

  :host {
    --pv-chores-gap: 12px;
    font-family: var(--pv-font-family, system-ui, sans-serif);
    color: var(--pv-text, #1A1B1E);
  }

  .heading {
    font-family: var(--pv-font-heading, ui-rounded, 'SF Pro Rounded', 'PlanaVista Rounded', system-ui, sans-serif);
    font-weight: 800;
    letter-spacing: 0.1px;
  }

  .num {
    font-family: var(--pv-font-heading, ui-rounded, 'SF Pro Rounded', 'PlanaVista Rounded', system-ui, sans-serif);
    font-variant-numeric: tabular-nums;
  }

  .section-head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 8px;
    margin: 14px 4px 6px;
    font-size: 0.8125rem;
    font-weight: 750;
    color: var(--pv-text-secondary, #5F6670);
  }

  .section-head .right {
    font-weight: 700;
  }

  .meta {
    color: var(--pv-text-secondary, #5F6670);
    font-size: 0.875rem;
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }

  .sr {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
  }
`;

/**
 * The Week view's and the Board's stepper (0.14.0): the calendar's toolbar
 * grammar, the day or week on the left, then round arrows around This week
 * or Today.
 */
export const stepperStyles = css`
  .top {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .top h2 {
    margin: 0 6px;
    min-width: 0;
    font-family: var(--pv-font-heading, ui-rounded, 'SF Pro Rounded', 'PlanaVista Rounded', system-ui, sans-serif);
    font-size: 1.125rem;
    font-weight: 800;
    font-variant-numeric: tabular-nums;
  }

  .steps {
    display: flex;
    align-items: center;
    gap: 4px;
    margin-left: auto;
  }

  .nav {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    border: none;
    border-radius: 50%;
    background: transparent;
    color: var(--pv-text-secondary, #5F6670);
    cursor: pointer;
  }

  .nav:hover {
    background: var(--pv-event-hover, rgba(0, 0, 0, 0.04));
  }
`;

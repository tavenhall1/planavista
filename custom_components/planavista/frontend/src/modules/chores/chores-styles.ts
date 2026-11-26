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
 * The top panels (missed and urgency, 0.15.0): Missed in red with a red line,
 * due soon in amber, its last day in red with a red line. A panel is drawn
 * around a run of the one keyed list (its heading has `start`, its last row
 * `end`), so a row keeps its element, and its check-off's pop, as it moves
 * between a panel and its place. The colors are theme tokens, already dimmed
 * on a dimmed shared screen.
 */
export const panelStyles = css`
  .in-panel {
    --panel-bg: var(--pv-warn-bg, #FDF1DC);
    --panel-line: transparent;
    display: block;
    margin-inline: -6px;
    padding-inline: 4px;
    background: var(--panel-bg);
    border-inline: 2px solid var(--panel-line);
  }

  .in-panel.missed,
  .in-panel.last {
    --panel-bg: var(--pv-bad-bg, #FBE4E4);
    --panel-line: var(--pv-danger, #C62828);
  }

  .in-panel.start {
    margin-top: 8px;
    margin-bottom: 0;
    padding-top: 10px;
    padding-bottom: 4px;
    border-top: 2px solid var(--panel-line);
    border-radius: 16px 16px 0 0;
  }

  .in-panel.end {
    margin-bottom: 4px;
    padding-bottom: 6px;
    border-bottom: 2px solid var(--panel-line);
    border-radius: 0 0 16px 16px;
  }

  /* Over a heading's own margins (the column's styles come later). */
  .head-row.in-panel {
    margin-inline: -6px;
    padding-inline: 10px;
  }

  .head-row.missed {
    color: var(--pv-bad-ink, #A12828);
    font-size: 0.9375rem;
  }

  .head-row.soon {
    color: var(--pv-warn-ink, #8A5A00);
  }

  .head-row.last {
    color: var(--pv-bad-ink, #A12828);
  }

  /* "3 days left" in amber, with a dot (missed-and-urgency spec 5). */
  .head-row .right.warn,
  .head-row.soon .right {
    color: var(--pv-warn-ink, #8A5A00);
  }

  .head-row .right.warn::before,
  .head-row.soon .right::before {
    content: '';
    display: inline-block;
    width: 8px;
    height: 8px;
    margin-right: 6px;
    border-radius: 50%;
    background: currentColor;
    vertical-align: 1px;
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

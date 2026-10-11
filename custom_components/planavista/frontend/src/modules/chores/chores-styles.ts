import { css } from 'lit';

/**
 * Styles every chores screen shares: badges in the status map's color jobs
 * (spec 11.3, 11.4), section headings, designed states (spec 11.6), and the
 * neutral skeleton (no spinners).
 */
export const choresStyles = css`
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

  /* Status badges: words always, color confirms (spec 11.3). */
  .badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    flex-shrink: 0;
    max-width: 100%;
    padding: 3px 8px;
    border-radius: 8px;
    font-size: 0.8125rem;
    font-weight: 700;
    line-height: 1.2;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    background: var(--pv-chip, #F1F1EE);
    color: var(--pv-text-secondary, #5F6670);
  }

  .badge.act {
    background: var(--pv-accent-tint, #EEEEFC);
    color: var(--pv-accent-tint-ink, #3B3BB0);
  }

  .badge.time {
    background: var(--pv-warn-bg, #FDF1DC);
    color: var(--pv-warn-ink, #8A5A00);
  }

  .badge.bad {
    background: var(--pv-bad-bg, #FBE4E4);
    color: var(--pv-bad-ink, #A12828);
  }

  .badge.muted {
    background: transparent;
    color: var(--pv-text-muted, #8E949C);
    padding-left: 0;
    padding-right: 0;
  }

  .section-head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 8px;
    margin: 14px 4px 6px;
    font-size: 0.8125rem;
    font-weight: 700;
    color: var(--pv-text-muted, #8E949C);
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

  /* Designed states (spec 13.1). */
  .state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-height: 260px;
    padding: 32px 24px;
    text-align: center;
  }

  .state .art {
    font-size: 40px;
    line-height: 1;
  }

  .state h2 {
    margin: 6px 0 0;
    font-family: var(--pv-font-heading, ui-rounded, 'SF Pro Rounded', 'PlanaVista Rounded', system-ui, sans-serif);
    font-size: 1.25rem;
    font-weight: 800;
  }

  .state p {
    margin: 0;
    max-width: 420px;
    color: var(--pv-text-secondary, #5F6670);
    line-height: 1.5;
  }

  .state .buttons {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    justify-content: center;
    margin-top: 10px;
  }

  .banner {
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 10px 12px 0;
    padding: 8px 8px 8px 14px;
    border-radius: 12px;
    background: var(--pv-warn-bg, #FDF1DC);
    color: var(--pv-warn-ink, #8A5A00);
    font-size: 0.9375rem;
  }

  .banner.info {
    background: var(--pv-accent-tint, #EEEEFC);
    color: var(--pv-accent-tint-ink, #3B3BB0);
  }

  .banner .text {
    flex: 1 1 auto;
  }

  .banner button {
    min-height: 40px;
  }

  /* Skeletons stay neutral: a tint of the text color, never a brand fill (spec 11.6). */
  .bone {
    background: color-mix(in srgb, var(--pv-text, #1A1B1E) 7%, transparent);
    border-radius: 8px;
  }

  .bone.round {
    border-radius: 50%;
  }

  @media (prefers-reduced-motion: no-preference) {
    .bone {
      animation: pv-bone 1.6s ease-in-out infinite;
    }
  }

  @keyframes pv-bone {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.55; }
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

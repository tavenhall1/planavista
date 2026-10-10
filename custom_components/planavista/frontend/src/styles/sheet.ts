import { css } from 'lit';

/**
 * Sheets (spec 12.3): a centered card in landscape; in portrait and on
 * phones they rise from the bottom, only as tall as their content. The host
 * element reflects its `layout` property as an attribute.
 */
export const sheetStyles = css`
  :host {
    position: fixed;
    inset: 0;
    z-index: 100;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    font-family: var(--pv-font-family, -apple-system, system-ui, sans-serif);
  }

  :host([layout='landscape']) {
    align-items: center;
  }

  .backdrop {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.4);
  }

  .panel {
    position: relative;
    box-sizing: border-box;
    width: 100%;
    max-height: 92vh;
    overflow: auto;
    background: var(--pv-card-bg, #FFFFFF);
    color: var(--pv-text, #1A1B1E);
    border-radius: 20px 20px 0 0;
    padding: 20px 20px calc(20px + env(safe-area-inset-bottom, 0px));
    box-shadow: 0 -8px 32px rgba(0, 0, 0, 0.18);
  }

  :host([layout='landscape']) .panel {
    width: min(400px, calc(100vw - 32px));
    border-radius: 20px;
    padding: 24px;
    box-shadow: 0 16px 48px rgba(0, 0, 0, 0.24);
  }

  .heading {
    margin: 0 0 6px;
    font-size: 1.25rem;
    font-weight: 700;
    text-align: center;
  }

  .body {
    margin: 0 0 16px;
    color: var(--pv-text-secondary, #6B7280);
    line-height: 1.5;
    text-align: center;
  }

  .actions {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-top: 12px;
  }

  .actions button {
    min-height: 48px;
    width: 100%;
  }

  .sr {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
  }

  @media (prefers-reduced-motion: no-preference) {
    .panel {
      animation: pv-sheet-rise 220ms ease-out;
    }

    :host([layout='landscape']) .panel {
      animation: pv-sheet-pop 180ms ease-out;
    }
  }

  @keyframes pv-sheet-rise {
    from { transform: translateY(24px); opacity: 0; }
    to { transform: none; opacity: 1; }
  }

  @keyframes pv-sheet-pop {
    from { transform: scale(0.96); opacity: 0; }
    to { transform: none; opacity: 1; }
  }
`;

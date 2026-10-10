import { css } from 'lit';

/**
 * Base styles shared across all PlanaVista cards.
 */
export const baseStyles = css`
  :host {
    display: block;
    font-family: var(--pv-font-family, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, system-ui, sans-serif);
    color: var(--pv-text, #1A1B1E);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  ha-card {
    background: var(--pv-card-bg, #FFFFFF);
    border-radius: var(--pv-radius, 12px);
    box-shadow: var(--pv-shadow);
    overflow: hidden;
    transition: box-shadow var(--pv-transition, 200ms ease);
    border: none;
  }

  ha-card:hover {
    box-shadow: var(--pv-shadow-lg);
  }
`;

/**
 * Typography scale.
 */
export const typographyStyles = css`
  .pv-display {
    font-family: var(--pv-font-heading, ui-rounded, 'SF Pro Rounded', 'PlanaVista Rounded', system-ui, sans-serif);
    font-variant-numeric: tabular-nums;
    font-size: 3.5rem;
    font-weight: 300;
    line-height: 1.1;
    letter-spacing: -0.02em;
  }

  .pv-heading-1 {
    font-family: var(--pv-font-heading, ui-rounded, 'SF Pro Rounded', 'PlanaVista Rounded', system-ui, sans-serif);
    font-size: 1.5rem;
    font-weight: 600;
    line-height: 1.3;
    letter-spacing: -0.01em;
  }

  .pv-heading-2 {
    font-family: var(--pv-font-heading, ui-rounded, 'SF Pro Rounded', 'PlanaVista Rounded', system-ui, sans-serif);
    font-size: 1.125rem;
    font-weight: 600;
    line-height: 1.4;
  }

  .pv-body {
    font-size: 0.9375rem;
    font-weight: 400;
    line-height: 1.5;
  }

  .pv-caption {
    font-size: 0.8125rem;
    font-weight: 400;
    line-height: 1.4;
    color: var(--pv-text-secondary);
  }

  .pv-overline {
    font-size: 0.6875rem;
    font-weight: 600;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: var(--pv-text-muted);
  }
`;

/**
 * Button styles.
 */
export const buttonStyles = css`
  .pv-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.625rem 1.25rem;
    border: none;
    border-radius: var(--pv-radius-sm, 8px);
    font-family: inherit;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all var(--pv-transition, 200ms ease);
    min-height: 48px;
    min-width: 48px;
    -webkit-tap-highlight-color: transparent;
    user-select: none;
  }

  .pv-btn-primary {
    background: var(--pv-accent);
    color: var(--pv-accent-text);
  }

  .pv-btn-primary:hover {
    opacity: 0.9;
    transform: translateY(-1px);
    box-shadow: var(--pv-shadow);
  }

  .pv-btn-primary:active {
    transform: translateY(0);
  }

  .pv-btn-secondary {
    background: transparent;
    color: var(--pv-text);
    border: 1px solid var(--pv-border);
  }

  .pv-btn-secondary:hover {
    background: var(--pv-event-hover);
  }

  .pv-btn-ghost {
    background: transparent;
    color: var(--pv-text-secondary);
    padding: 0.5rem;
  }

  .pv-btn-ghost:hover {
    background: var(--pv-event-hover);
    color: var(--pv-text);
  }

  .pv-btn-icon {
    background: transparent;
    color: var(--pv-text-secondary);
    padding: 0.5rem;
    border-radius: 50%;
    min-height: 48px;
    min-width: 48px;
  }

  .pv-btn-icon:hover {
    background: var(--pv-event-hover);
    color: var(--pv-text);
  }

  .pv-btn-pill {
    border-radius: 9999px;
    padding: 0.5rem 1rem;
  }
`;

/**
 * Event chip styles (for day/week/month views).
 */
export const eventStyles = css`
  .pv-event {
    position: relative;
    padding: 0.375rem 0.5rem 0.375rem 0.75rem;
    border-radius: var(--pv-radius-sm, 4px);
    border-left: 3px solid var(--event-color, var(--pv-accent));
    background: var(--event-color-light, color-mix(in srgb, var(--event-color, var(--pv-accent)) 12%, white));
    cursor: pointer;
    transition: all var(--pv-transition, 200ms ease);
    min-height: 28px;
    overflow: hidden;
  }

  .pv-event:hover {
    background: color-mix(in srgb, var(--event-color, var(--pv-accent)) 16%, white);
    transform: translateY(-1px);
  }

  .pv-event:active {
    transform: scale(0.98);
  }

  .pv-event-title {
    font-size: 0.8125rem;
    font-weight: 500;
    line-height: 1.3;
    color: var(--event-text, var(--pv-text));
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .pv-event-time {
    font-size: 0.6875rem;
    color: var(--event-text, var(--pv-text-secondary));
    margin-top: 1px;
  }

  .pv-event-pill {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 0.125rem 0.5rem;
    border-radius: var(--pv-radius-sm, 4px);
    border-left: 2px solid var(--event-color, var(--pv-accent));
    background: var(--event-color-light, color-mix(in srgb, var(--event-color, var(--pv-accent)) 12%, white));
    color: var(--event-text, var(--pv-text));
    font-size: 0.6875rem;
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
  }
`;

/**
 * Dialog/popup styles.
 */
export const dialogStyles = css`
  .pv-overlay {
    position: fixed;
    inset: 0;
    background: var(--pv-backdrop, rgba(0, 0, 0, 0.3));
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 999;
    animation: pv-fadeIn var(--pv-transition, 200ms ease) forwards;
  }

  .pv-dialog {
    background: var(--pv-card-bg-elevated, #FFFFFF);
    border-radius: var(--pv-radius-lg, 16px);
    box-shadow: var(--pv-shadow-xl);
    max-width: 480px;
    width: calc(100% - 2rem);
    max-height: 85vh;
    overflow-y: auto;
    animation: pv-scaleIn var(--pv-transition, 200ms ease) forwards;
  }

  .pv-dialog-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.25rem 1.5rem;
    border-bottom: 1px solid var(--pv-border-subtle);
  }

  .pv-dialog-body {
    padding: 1.5rem;
  }

  .pv-dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
    padding: 1rem 1.5rem;
    border-top: 1px solid var(--pv-border-subtle);
  }

  .pv-popup {
    background: var(--pv-card-bg-elevated, #FFFFFF);
    border-radius: var(--pv-radius-lg, 16px);
    box-shadow: var(--pv-shadow-xl);
    max-width: 360px;
    width: calc(100% - 2rem);
    animation: pv-scaleIn var(--pv-transition, 200ms ease) forwards;
  }
`;

/**
 * Form input styles.
 */
export const formStyles = css`
  .pv-input {
    width: 100%;
    padding: 0.75rem 1rem;
    border: 1px solid var(--pv-border);
    border-radius: var(--pv-radius-sm, 8px);
    background: var(--pv-card-bg);
    color: var(--pv-text);
    font-family: inherit;
    font-size: 0.9375rem;
    transition: border-color var(--pv-transition, 200ms ease);
    box-sizing: border-box;
    min-height: 48px;
  }

  .pv-input:focus {
    outline: none;
    border-color: var(--pv-accent);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--pv-accent) 15%, transparent);
  }

  .pv-input::placeholder {
    color: var(--pv-text-muted);
  }

  .pv-label {
    display: block;
    font-size: 0.8125rem;
    font-weight: 500;
    color: var(--pv-text-secondary);
    margin-bottom: 0.375rem;
  }

  .pv-select {
    appearance: none;
    background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236B7280' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 0.75rem center;
    padding-right: 2.5rem;
  }

  .pv-toggle {
    position: relative;
    width: 44px;
    height: 24px;
    background: var(--pv-border);
    border-radius: var(--pv-radius, 12px);
    cursor: pointer;
    transition: background var(--pv-transition, 200ms ease);
  }

  .pv-toggle.active {
    background: var(--pv-accent);
  }

  .pv-toggle::after {
    content: '';
    position: absolute;
    top: 2px;
    left: 2px;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: white;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
    transition: transform var(--pv-transition, 200ms ease);
  }

  .pv-toggle.active::after {
    transform: translateX(20px);
  }
`;

/**
 * Now indicator styles.
 */
export const nowIndicatorStyles = css`
  .pv-now-line {
    position: absolute;
    left: 0;
    right: 0;
    height: 2px;
    background: var(--pv-now-color, #EF4444);
    z-index: 10;
    pointer-events: none;
  }

  .pv-now-line::before {
    content: '';
    position: absolute;
    left: -4px;
    top: -4px;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: var(--pv-now-color, #EF4444);
  }

  @keyframes pv-nowPulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.6; }
  }

  .pv-now-line {
    animation: pv-nowPulse 3s ease-in-out infinite;
  }
`;

/**
 * Animation keyframes.
 */
export const animationStyles = css`
  @keyframes pv-fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes pv-fadeOut {
    from { opacity: 1; }
    to { opacity: 0; }
  }

  @keyframes pv-slideUp {
    from { transform: translateY(16px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }

  @keyframes pv-slideDown {
    from { transform: translateY(-16px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }

  @keyframes pv-scaleIn {
    from { transform: scale(0.95); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
  }

  @keyframes pv-slideLeft {
    from { transform: translateX(24px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }

  @keyframes pv-slideRight {
    from { transform: translateX(-24px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
`;

/**
 * Scrollbar styling.
 */
export const scrollbarStyles = css`
  ::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }

  ::-webkit-scrollbar-track {
    background: transparent;
  }

  ::-webkit-scrollbar-thumb {
    background: var(--pv-border);
    border-radius: 3px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: var(--pv-text-muted);
  }
`;

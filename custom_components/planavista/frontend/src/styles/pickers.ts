import { css } from 'lit';

/**
 * The one month grid and the one time list (milestone 8, spec 3.11): the
 * event editor's pickers, shared with the date and time fields. The field
 * button matches the event editor's date and time buttons.
 */
export const pickerStyles = css`
  .picker-field {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    max-width: 100%;
    min-height: 48px;
    padding: 0 14px;
    box-sizing: border-box;
    border: 1px solid var(--pv-border, #E7E7E3);
    border-radius: var(--pv-radius-sm, 8px);
    background: var(--pv-card-bg, #FFFFFF);
    color: var(--pv-text, #1A1B1E);
    font: inherit;
    font-size: 0.9375rem;
    font-variant-numeric: tabular-nums;
    cursor: pointer;
  }

  .picker-field:hover:not(:disabled) {
    border-color: var(--pv-text-muted, #8E949C);
  }

  .picker-field:disabled {
    opacity: 0.45;
    cursor: default;
  }

  .picker-field ha-icon {
    --mdc-icon-size: 20px;
    color: var(--pv-text-muted, #8E949C);
  }

  .picker-field .placeholder {
    color: var(--pv-text-muted, #8E949C);
  }

  .picker-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
  }

  .picker-month-label {
    font-size: 0.9375rem;
    font-weight: 600;
    color: var(--pv-text);
  }

  .picker-nav {
    display: flex;
    gap: 2px;
  }

  .picker-nav-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    border: none;
    border-radius: 50%;
    background: transparent;
    color: var(--pv-text-secondary);
    cursor: pointer;
    font-family: inherit;
    transition: background 150ms;
  }

  .picker-nav-btn:hover {
    background: var(--pv-event-hover, rgba(0,0,0,0.05));
  }

  .picker-nav-btn ha-icon {
    --mdc-icon-size: 18px;
  }

  .picker-weekdays {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    text-align: center;
    margin-bottom: 4px;
  }

  .picker-weekday {
    font-size: 0.6875rem;
    font-weight: 600;
    color: var(--pv-text-muted);
    padding: 4px 0;
  }

  .picker-days {
    display: grid;
    grid-template-columns: repeat(7, 48px);
  }

  /* A 48 px target with the day drawn smaller inside (spec 11.8). */
  .picker-day {
    display: grid;
    place-items: center;
    width: 48px;
    height: 48px;
    padding: 0;
    border: none;
    background: transparent;
    color: var(--pv-text);
    font-family: var(--pv-font-heading, inherit);
    font-size: 0.875rem;
    font-variant-numeric: tabular-nums;
    cursor: pointer;
  }

  .picker-day span {
    display: grid;
    place-items: center;
    box-sizing: border-box;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    transition: background 150ms;
  }

  .picker-day:hover span {
    background: var(--pv-event-hover, rgba(0,0,0,0.05));
  }

  .picker-day:focus-visible {
    outline: none;
  }

  .picker-day:focus-visible span {
    outline: 2px solid var(--pv-accent-ink, #5B5BD6);
    outline-offset: 1px;
  }

  .picker-day.other-month {
    color: var(--pv-text-muted);
    opacity: 0.4;
  }

  .picker-day.today span {
    border: 2px solid var(--pv-accent);
    font-weight: 700;
  }

  .picker-day.selected span {
    background: var(--pv-accent);
    color: var(--pv-accent-text, #fff);
    font-weight: 700;
  }

  .picker-day:disabled {
    opacity: 0.3;
    cursor: default;
  }

  .time-slot {
    display: block;
    width: 100%;
    min-height: 48px;
    padding: 0 16px;
    border: none;
    background: transparent;
    text-align: left;
    font-family: inherit;
    font-size: 0.9375rem;
    font-variant-numeric: tabular-nums;
    color: var(--pv-text);
    cursor: pointer;
    transition: background 120ms ease;
  }

  .time-slot:hover {
    background: var(--pv-event-hover, rgba(0, 0, 0, 0.04));
  }

  .time-slot.selected {
    background: var(--pv-accent);
    color: var(--pv-accent-text, #fff);
    font-weight: 600;
  }
`;

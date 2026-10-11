import { LitElement, html, css } from 'lit';
import { property } from 'lit/decorators.js';
import { defineElement } from '../../../utils/define';
import { baseStyles, buttonStyles } from '../../../styles/shared';
import type { Layout } from '../../../core/layout';
import { RUN_SETUP, RunSetupDetail } from '../../../core/settings-registry';
import { CHORES_SETUP_FLOW } from '../definition';
import { choresSettingsStyles } from './settings-styles';

const FEATURES: Array<[string, string, string]> = [
  ['🧺', 'One board for everyone', "Today's chores in a column for each person, with a ring that closes when they're done."],
  ['⭐', 'Stars and rewards', 'If your family wants them. Kids save up for what they pick.'],
  ['📋', 'Start any way you like', 'From a few common chores, your household plan, or nothing at all.'],
];

/**
 * pv-chores-off-page: Settings' Chores row while chores are off (spec 14.7:
 * a calendar-only home gets a Chores row that runs a short version of
 * setup). Set up chores runs setup's chores steps.
 */
export class PvChoresOffPage extends LitElement {
  @property({ type: String }) layout: Layout = 'landscape';

  static styles = [
    baseStyles,
    buttonStyles,
    choresSettingsStyles,
    css`
      :host {
        max-width: 640px;
      }

      .lead {
        margin: 0 0 16px;
        color: var(--pv-text-secondary, #6B7280);
        font-size: 1.0625rem;
        line-height: 1.5;
      }

      .group li {
        display: flex;
        gap: 12px;
        align-items: flex-start;
        padding: 14px 16px;
      }

      .icon {
        flex-shrink: 0;
        width: 28px;
        font-size: 1.375rem;
        line-height: 1.2;
        text-align: center;
      }

      .title {
        display: block;
        font-weight: 700;
      }

      .text {
        display: block;
        margin-top: 2px;
        color: var(--pv-text-secondary, #6B7280);
        line-height: 1.4;
      }

      .start {
        width: 100%;
        min-height: 52px;
        margin-top: 20px;
        font-size: 1.0625rem;
      }

      .note {
        margin: 10px 0 0;
        color: var(--pv-text-secondary, #6B7280);
        font-size: 0.875rem;
        text-align: center;
      }
    `,
  ];

  render() {
    return html`
      <p class="lead">Chores sit next to the calendar. Kids hold a chore's circle to finish it and earn stars.</p>
      <ul class="group">
        ${FEATURES.map(([icon, title, text]) => html`
          <li><span class="icon" aria-hidden="true">${icon}</span><span><span class="title">${title}</span><span class="text">${text}</span></span></li>
        `)}
      </ul>
      <button class="pv-btn pv-btn-primary start" type="button" @click=${this._start}>Set up chores</button>
      <p class="note">A few questions. The calendar stays as it is.</p>
    `;
  }

  private _start = (): void => {
    const detail: RunSetupDetail = { steps: CHORES_SETUP_FLOW };
    this.dispatchEvent(new CustomEvent(RUN_SETUP, { detail, bubbles: true, composed: true }));
  };
}

defineElement('pv-chores-off-page', PvChoresOffPage);

import { LitElement, html, css, nothing } from 'lit';
import { property, state } from 'lit/decorators.js';
import type { HomeAssistant } from 'custom-card-helpers';
import { defineElement } from '../../../utils/define';
import { baseStyles, buttonStyles } from '../../../styles/shared';
import { HouseholdView, inOrder } from '../../../core/household';
import type { Layout } from '../../../core/layout';
import type { ModuleService } from '../../../core/module-registry';
import { PAGE_ERROR, POP_PAGE } from '../../../core/page-host';
import { errorMessage } from '../../../core/ws-api';
import type { PlanaVistaData } from '../../../types';
import type { ChoresService } from '../chores-service';
import { ImportChoices, ImportPreview, emptyChoices, fileLine, importNote, importSummary, importedText, missingAges } from './import-derive';
import { choresSettingsStyles } from './settings-styles';
import './pv-import-preview';

/**
 * pv-import-review: Review the import (spec 14.6), inside Settings. The file
 * card, the preview, and the Import bar pinned at the bottom with a plain
 * summary. Nothing is saved until Import.
 */
export class PvImportReview extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ attribute: false }) data!: PlanaVistaData;
  @property({ attribute: false }) household: HouseholdView | null = null;
  @property({ type: String, reflect: true }) layout: Layout = 'landscape';
  @property({ attribute: false }) pageProps: Record<string, unknown> = {};
  @property({ attribute: false }) services: Record<string, ModuleService> = {};
  @property({ type: Number }) revision = 0;

  @state() private _choices: ImportChoices = emptyChoices();
  @state() private _problems: string[] = [];
  @state() private _importing = false;

  private get _preview(): ImportPreview {
    return this.pageProps.preview as ImportPreview;
  }

  static styles = [
    baseStyles,
    buttonStyles,
    choresSettingsStyles,
    css`
      :host {
        display: block;
      }

      .file {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 8px;
        padding: 12px 14px;
        border-radius: 14px;
        background: var(--pv-card-bg, #FFFFFF);
        box-shadow: inset 0 0 0 1px var(--pv-border-subtle, #E5E7EB);
      }

      .file .badge {
        flex-shrink: 0;
        padding: 8px 6px;
        border-radius: 8px;
        background: color-mix(in srgb, var(--pv-text, #1A1B1E) 6%, transparent);
        font-size: 0.6875rem;
        font-weight: 700;
      }

      .bar {
        position: sticky;
        /* Flush with the bottom: a sticky box keeps clear of the Settings page's 40 px bottom padding otherwise. */
        bottom: -40px;
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 12px;
        margin: 20px -20px -40px;
        padding: 14px 20px calc(14px + env(safe-area-inset-bottom, 0px));
        background: var(--pv-card-bg, #FFFFFF);
        border-top: 1px solid var(--pv-border-subtle, #E5E7EB);
        box-shadow: 0 -6px 18px rgba(0, 0, 0, 0.06);
      }

      .bar .text {
        flex: 1;
        min-width: 200px;
      }

      .bar .sub {
        display: block;
        font-size: 0.8125rem;
        color: var(--pv-text-secondary, #6B7280);
      }

      .bar button {
        min-height: 48px;
        min-width: 96px;
      }

      .problems {
        margin: 0 0 16px;
        padding: 12px 16px;
        border-radius: 12px;
        background: color-mix(in srgb, var(--pv-danger, #DC2626) 10%, transparent);
      }

      .problems ul {
        margin: 6px 0 0;
        padding-left: 18px;
      }
    `,
  ];

  render() {
    const preview = this._preview;
    if (!preview) return nothing;
    const name = String(this.pageProps.name ?? 'Pasted text');
    const missing = missingAges(preview, this._choices);
    return html`
      <div class="file">
        <span class="badge" aria-hidden="true">JSON</span>
        <span class="row-text"><span class="row-title">${name}</span><span class="row-sub">${fileLine(preview)}</span></span>
        <button class="pv-btn pv-btn-secondary" type="button" @click=${this._pop}>Choose another</button>
      </div>
      ${this._problems.length ? html`
        <div class="problems" role="alert">
          <strong>This file has problems, so nothing was imported.</strong>
          <ul>${this._problems.map(p => html`<li>${p}</li>`)}</ul>
        </div>
      ` : nothing}
      <pv-import-preview
        .hass=${this.hass}
        .preview=${preview}
        .members=${inOrder(this.household?.members ?? [])}
        .choices=${this._choices}
        .layout=${this.layout}
        .timeFormat=${this.data?.display?.time_format ?? '12h'}
        @pv-import-choices=${(e: CustomEvent<ImportChoices>) => { this._choices = e.detail; }}
      ></pv-import-preview>
      <div class="bar">
        <span class="text">
          ${missing.length ? `Pick an age group for ${missing.map(p => p.name).join(' and ')} to import.` : importSummary(preview, this._choices)}
          <span class="sub">${importNote(preview)}</span>
        </span>
        <button class="pv-btn pv-btn-secondary" type="button" @click=${this._pop}>Cancel</button>
        <button class="pv-btn pv-btn-primary" type="button" ?disabled=${this._importing || missing.length > 0}
          @click=${this._import}>Import</button>
      </div>
    `;
  }

  private _pop = (): void => {
    this.dispatchEvent(new CustomEvent(POP_PAGE, { bubbles: true, composed: true }));
  };

  private _import = async (): Promise<void> => {
    const chores = this.services?.chores as ChoresService | undefined;
    if (!chores) return;
    this._importing = true;
    this._problems = [];
    try {
      const result = await chores.api.importApply(String(this.pageProps.text ?? ''), this._choices);
      if (result.problem) {
        this._problems = result.problem.problems.length ? result.problem.problems : [result.problem.message];
        return;
      }
      if (result.summary) {
        this.dispatchEvent(new CustomEvent(PAGE_ERROR, { detail: { message: importedText(result.summary) }, bubbles: true, composed: true }));
      }
      this._pop();
    } catch (err) {
      this._problems = [errorMessage(err) ?? "Couldn't import. Check the connection and try again."];
    } finally {
      this._importing = false;
    }
  };
}

defineElement('pv-import-review', PvImportReview);

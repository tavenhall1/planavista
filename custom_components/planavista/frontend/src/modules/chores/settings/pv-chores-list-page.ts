import { LitElement, html, css, nothing } from 'lit';
import { property, state } from 'lit/decorators.js';
import type { HomeAssistant } from 'custom-card-helpers';
import { defineElement } from '../../../utils/define';
import { baseStyles, buttonStyles, formStyles } from '../../../styles/shared';
import { HouseholdView, Member, inOrder } from '../../../core/household';
import type { Layout } from '../../../core/layout';
import type { ModuleService } from '../../../core/module-registry';
import { OPEN_TARGET, PUSH_PAGE, PushPageDetail } from '../../../core/page-host';
import { choreEditor } from './targets';
import type { PlanaVistaData } from '../../../types';
import type { ChoresService } from '../chores-service';
import { ChoreRow, choresList } from './chores-list-derive';
import { choresSettingsStyles } from './settings-styles';
import '../../../core/pv-member-avatar';

/**
 * pv-chores-list-page: every chore, grouped by rhythm (spec 14.3), with a
 * search, person filter chips, two columns in landscape, and for a young
 * child a preview of how they see their chores. Rows open the chore editor.
 */
export class PvChoresListPage extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ attribute: false }) data!: PlanaVistaData;
  @property({ attribute: false }) household: HouseholdView | null = null;
  @property({ type: String, reflect: true }) layout: Layout = 'landscape';
  @property({ attribute: false }) services: Record<string, ModuleService> = {};
  @property({ type: Number }) revision = 0;

  @state() private _member: string | null = null;
  @state() private _search = '';
  @state() private _showFinished = false;

  static styles = [
    baseStyles,
    buttonStyles,
    formStyles,
    choresSettingsStyles,
    css`
      .head {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 14px;
      }

      .count {
        flex: 1;
        margin: 0;
        color: var(--pv-text-secondary, #6B7280);
      }

      .new {
        min-height: 48px;
        white-space: nowrap;
      }

      .search {
        width: 100%;
        margin-bottom: 12px;
      }

      .filters {
        margin-bottom: 8px;
      }

      .groups {
        display: grid;
        gap: 0 20px;
      }

      :host([layout='landscape']) .groups {
        grid-template-columns: repeat(2, minmax(0, 1fr));
        align-items: start;
      }

      .rhythm-group {
        min-width: 0;
      }

      .tiles {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(96px, 1fr));
        gap: 10px;
        margin-top: 4px;
      }

      .tile {
        display: grid;
        justify-items: center;
        gap: 6px;
        padding: 12px 8px;
        border-radius: 14px;
        background: var(--pv-card-bg, #FFFFFF);
        box-shadow: inset 0 0 0 1px var(--pv-border-subtle, #E5E7EB);
        text-align: center;
        font-size: 0.875rem;
        font-weight: 600;
      }

      .tile .emoji {
        font-size: 2rem;
      }

      .finished-link {
        margin: 16px 4px 0;
        border: none;
        background: transparent;
        color: var(--pv-accent-ink, var(--pv-accent, #6366F1));
        font: inherit;
        font-weight: 600;
        cursor: pointer;
        min-height: 48px;
      }
    `,
  ];

  private get _chores(): ChoresService | undefined {
    return this.services?.chores as ChoresService | undefined;
  }

  render() {
    const board = this._chores?.board();
    const members = inOrder(this.household?.members ?? []);
    if (!board) {
      return html`<div class="skeleton"></div><div class="skeleton"></div><div class="skeleton"></div>`;
    }
    const list = choresList(board.chores, members, board.settings, {
      member: this._member, search: this._search, today: board.today, timeFormat: this.data?.display?.time_format,
      items: Object.values(board.members).flatMap(m => m.items),
    });
    const filtered = members.find(m => m.id === this._member) ?? null;
    return html`
      <div class="head">
        <p class="count">${list.total} ${list.total === 1 ? 'chore' : 'chores'} · ${list.onBoard} on the board</p>
        <button class="pv-btn pv-btn-primary new" type="button" @click=${() => this._open(null)}>+ New chore</button>
      </div>
      <input class="pv-input search" type="search" placeholder="Search chores" aria-label="Search chores"
        .value=${this._search} @input=${(e: Event) => { this._search = (e.target as HTMLInputElement).value; }} />
      <div class="chips filters" role="group" aria-label="Whose chores">
        <button class="chip chip--plain" type="button" aria-pressed=${this._member === null ? 'true' : 'false'}
          @click=${() => { this._member = null; }}>Everyone</button>
        ${members.map(member => html`
          <button class="chip" type="button" aria-pressed=${this._member === member.id ? 'true' : 'false'}
            @click=${() => { this._member = member.id; }}>
            <pv-member-avatar .member=${member} .hass=${this.hass} size="28"></pv-member-avatar>${member.name}
          </button>
        `)}
      </div>
      ${list.groups.length === 0 ? this._renderEmpty(list.total > 0) : nothing}
      <div class="groups">
        ${list.groups.map(group => html`
          <section class="rhythm-group" aria-label=${group.label}>
            <h2 class="section-label">${group.label} · ${group.rows.length}</h2>
            <ul class="group">${group.rows.map(row => html`<li>${this._renderRow(row, !this._member)}</li>`)}</ul>
            ${group.id === 'off_board'
              ? html`<p class="hint">Plan only: part of the household plan, but not checked off. Turn on Show on the board in the chore to add it.</p>`
              : nothing}
          </section>
        `)}
      </div>
      ${filtered ? this._renderFor(filtered, list.groups.flatMap(g => g.rows)) : nothing}
      ${list.finished.length ? html`
        <button class="finished-link" type="button" aria-expanded=${this._showFinished ? 'true' : 'false'}
          @click=${() => { this._showFinished = !this._showFinished; }}>
          ${this._showFinished ? 'Hide finished' : `Show ${list.finished.length} finished`} ›
        </button>
        ${this._showFinished
          ? html`<ul class="group">${list.finished.map(row => html`<li>${this._renderRow(row, true)}</li>`)}</ul>`
          : nothing}
      ` : nothing}
    `;
  }

  private _renderEmpty(filtered: boolean) {
    return filtered
      ? html`<p class="empty">No chores match.</p>`
      : html`<p class="empty">No chores yet. Tap + New chore, or import a plan in Import and export.</p>`;
  }

  private _renderRow(row: ChoreRow, showPeople: boolean) {
    return html`
      <button class="row" type="button" @click=${() => this._open(row)}>
        <span class="picture" aria-hidden="true">${row.picture}</span>
        <span class="row-text">
          <span class="row-title">${row.name}</span>
          <span class="row-sub">${row.rhythm}</span>
          ${row.tags.length ? html`
            <span class="row-tags">
              ${row.tags.map(tag => html`<span class="pv-tag ${tag === 'Plan only' ? 'muted' : tag === 'No one yet' ? 'attention' : ''}">${tag}</span>`)}
            </span>
          ` : nothing}
        </span>
        ${row.stars !== null ? html`<span class="stars" aria-label="${row.stars} stars each">★ ${row.stars}</span>` : nothing}
        ${showPeople ? html`
          <span class="avatars">
            ${row.people.map(member => html`<pv-member-avatar .member=${member} .hass=${this.hass} size="28"></pv-member-avatar>`)}
          </span>
        ` : nothing}
        <span class="chevron" aria-hidden="true">›</span>
      </button>
    `;
  }

  /** Filtered to one person: why their chores need approval, and for a young child, how they see them. */
  private _renderFor(member: Member, rows: ChoreRow[]) {
    const tiles = rows.filter(row => !row.tags.includes('Plan only') && !row.tags.includes('No one yet'));
    return html`
      ${member.needs_ok_for === 'all' && !member.parent
        ? html`<p class="hint">Every chore of ${member.name}'s needs approval${member.age_group === 'young_child' ? `, because ${member.name} is a young child` : ''}.</p>`
        : nothing}
      ${member.age_group === 'young_child' && tiles.length ? html`
        <h2 class="section-label">How ${member.name} sees them</h2>
        <div class="tiles">
          ${tiles.map(row => html`<div class="tile"><span class="emoji" aria-hidden="true">${row.picture}</span>${row.name}</div>`)}
        </div>
        <ul class="group" style="margin-top: 12px">
          <li>
            <button class="row" type="button" @click=${() => this._openDay(member)}>
              <span class="row-text">
                <span class="row-title">Open ${member.name}'s day</span>
                <span class="row-sub">My day, the way ${member.name} sees it</span>
              </span>
              <span class="chevron" aria-hidden="true">›</span>
            </button>
          </li>
        </ul>
      ` : nothing}
    `;
  }

  private _open(row: ChoreRow | null): void {
    const detail: PushPageDetail = row
      ? choreEditor(row)
      : { tag: 'pv-chore-editor', title: 'New chore', back: 'Chores', props: { choreId: null, assignees: this._member ? [this._member] : [] } };
    this.dispatchEvent(new CustomEvent(PUSH_PAGE, { detail, bubbles: true, composed: true }));
  }

  private _openDay(member: Member): void {
    this.dispatchEvent(new CustomEvent(OPEN_TARGET, {
      detail: { module: 'chores', view: 'my_day', member: member.id }, bubbles: true, composed: true,
    }));
  }
}

defineElement('pv-chores-list-page', PvChoresListPage);

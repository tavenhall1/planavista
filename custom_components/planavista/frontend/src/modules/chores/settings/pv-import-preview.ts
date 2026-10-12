import { LitElement, html, css, nothing } from 'lit';
import { property, state } from 'lit/decorators.js';
import type { HomeAssistant } from 'custom-card-helpers';
import { defineElement } from '../../../utils/define';
import { baseStyles, buttonStyles, formStyles } from '../../../styles/shared';
import { AGE_GROUP_CHOICES, AgeGroup, Member } from '../../../core/household';
import type { Layout } from '../../../core/layout';
import {
  CATEGORY_ICONS, ImportChoices, ImportPreview, PreviewActivity, RESTORE_FORMAT, activityLine, ageOf, byCategory, peopleHint,
  emptyChoices, lookLines, matchOf, onBoardOf, personLine, sections, tiles,
} from './import-derive';
import { pictureFor } from '../picture-words';
import { choresSettingsStyles } from './settings-styles';

/**
 * pv-import-preview: where everything in a file would go (spec 14.6):
 * People (matched by name; tap to rematch; new people pick an age group),
 * Needs a look, On the board by category with a switch each, Plan only, and
 * Set times. Used by Settings' review page and by setup. The parent's picks
 * go out in pv-import-choices.
 *
 * @fires pv-import-choices - detail: ImportChoices
 */
export class PvImportPreview extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ attribute: false }) preview!: ImportPreview;
  @property({ attribute: false }) members: Member[] = [];
  @property({ attribute: false }) choices: ImportChoices = emptyChoices();
  @property({ type: String, reflect: true }) layout: Layout = 'landscape';
  @property({ type: String }) timeFormat = '12h';

  @state() private _open = new Set<string>();
  @state() private _assigning: string | null = null;
  @state() private _showUpdates = false;

  static styles = [
    baseStyles,
    buttonStyles,
    formStyles,
    choresSettingsStyles,
    css`
      .columns {
        display: grid;
        gap: 0 20px;
      }

      :host([layout='landscape']) .columns {
        grid-template-columns: repeat(2, minmax(0, 1fr));
        align-items: start;
      }

      .tiles {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 8px;
        margin-bottom: 4px;
      }

      :host([layout='landscape']) .tiles {
        display: none;
      }

      .tile {
        padding: 10px 12px;
        border-radius: 12px;
        background: var(--pv-card-bg, #FFFFFF);
        box-shadow: inset 0 0 0 1px var(--pv-border-subtle, #E5E7EB);
      }

      .tile strong {
        display: block;
        font-size: 1.25rem;
      }

      .tile span {
        font-size: 0.75rem;
        color: var(--pv-text-secondary, #6B7280);
      }

      .dot {
        flex-shrink: 0;
        width: 36px;
        height: 36px;
        display: grid;
        place-items: center;
        border-radius: 50%;
        color: #FFFFFF;
        font-weight: 700;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.35);
      }

      .stack {
        display: grid;
        gap: 8px;
        width: 100%;
      }

      .row .pv-select {
        flex: 0 0 150px;
        max-width: 150px;
        margin-left: auto;
      }

      .mark {
        flex-shrink: 0;
        width: 24px;
        height: 24px;
        display: grid;
        place-items: center;
        border-radius: 50%;
        font-weight: 800;
        background: color-mix(in srgb, var(--pv-accent, #6366F1) 14%, transparent);
        color: var(--pv-accent-ink, var(--pv-accent, #6366F1));
      }

      .mark--attention {
        background: color-mix(in srgb, #F59E0B 22%, transparent);
        color: var(--pv-text, #1A1B1E);
      }

      .link {
        border: none;
        background: transparent;
        color: var(--pv-accent-ink, var(--pv-accent, #6366F1));
        font: inherit;
        font-weight: 600;
        cursor: pointer;
        min-height: 40px;
        white-space: nowrap;
      }

      .nested {
        padding-left: 18px;
      }

      .warning {
        margin: 0 0 12px;
        padding: 12px 14px;
        border-radius: 12px;
        background: color-mix(in srgb, #F59E0B 16%, transparent);
      }
    `,
  ];

  private _set(choices: ImportChoices): void {
    this.choices = choices;
    this.dispatchEvent(new CustomEvent('pv-import-choices', { detail: choices, bubbles: true, composed: true }));
  }

  private _pickPerson(ref: string, value: string): void {
    const pick = value === '' ? { match: null } : { match: value };
    this._set({ ...this.choices, people: { ...this.choices.people, [ref]: { ...this.choices.people[ref], ...pick } } });
  }

  private _pickAge(ref: string, age: AgeGroup): void {
    this._set({ ...this.choices, people: { ...this.choices.people, [ref]: { ...this.choices.people[ref], age_group: age } } });
  }

  private _switch(activity: PreviewActivity): void {
    this._set({ ...this.choices, on_board: { ...this.choices.on_board, [activity.ref]: !onBoardOf(activity, this.choices) } });
  }

  private _toggleOpen(key: string): void {
    const open = new Set(this._open);
    if (open.has(key)) open.delete(key);
    else open.add(key);
    this._open = open;
  }

  render() {
    const p = this.preview;
    if (!p) return nothing;
    const s = sections(p, this.choices);
    const restoring = p.file.format === RESTORE_FORMAT;
    return html`
      ${p.fills_in ? html`<p class="warning" role="note">Chores need a look, so this restore fills in the chores files that couldn't be read. What could still be read, such as stars and history, stays.</p>` : nothing}
      <div class="tiles">
        ${tiles(p, this.choices).map(t => html`<div class="tile"><strong>${t.value}</strong><span>${t.label}</span></div>`)}
      </div>
      <div class="columns">
        <div>
          ${this._renderPeople()}
          ${this._renderLook()}
          ${restoring && (p.rewards.length || p.settings) ? html`
            <h2 class="section-label">Rewards and rules</h2>
            <div class="group">
              ${p.rewards.length ? html`<div class="row"><span class="row-text">${p.rewards.length} ${p.rewards.length === 1 ? 'reward' : 'rewards'}<span class="row-sub">${p.rewards.map(r => r.name).slice(0, 3).join(', ')}${p.rewards.length > 3 ? ', and more' : ''}</span></span></div>` : nothing}
              ${p.settings ? html`<div class="row"><span class="row-text">Rules<span class="row-sub">Come from the file.</span></span></div>` : nothing}
            </div>
          ` : nothing}
        </div>
        <div>
          ${this._renderBoard(s.board)}
          ${this._renderPlanOnly(s.planOnly)}
          ${this._renderSetTimes(s.setTimes)}
        </div>
      </div>
    `;
  }

  private _renderPeople() {
    const p = this.preview;
    const taken = new Set(p.people.map(person => matchOf(person, this.choices)).filter(Boolean));
    return html`
      <h2 class="section-label">People · ${p.people.length}</h2>
      <div class="group">
        ${p.people.map(person => {
          const match = matchOf(person, this.choices);
          const isNew = !match;
          const age = ageOf(person, this.choices);
          return html`
            <div class="row">
              <div class="stack">
                <div style="display: flex; align-items: center; gap: 12px">
                  <span class="dot" style="background:${person.color ?? '#8E949C'}" aria-hidden="true">${person.name[0]?.toUpperCase()}</span>
                  <span class="row-text">
                    <span class="row-title">${person.name}</span>
                    <span class="row-sub">${personLine(person, this.choices, this.members, this.timeFormat)}</span>
                  </span>
                  ${isNew ? html`<span class="tag">New</span>` : nothing}
                  <select class="pv-input pv-select" aria-label="Who ${person.name} is" .value=${match ?? ''}
                    @change=${(e: Event) => this._pickPerson(person.ref, (e.target as HTMLSelectElement).value)}>
                    <option value="" ?selected=${!match}>New person</option>
                    ${this.members.filter(m => m.id === match || !taken.has(m.id)).map(m => html`
                      <option value=${m.id} ?selected=${m.id === match}>${m.name}</option>
                    `)}
                  </select>
                </div>
                ${isNew ? html`
                  <div class="chips" role="group" aria-label="${person.name}'s age group">
                    ${AGE_GROUP_CHOICES.map(choice => html`
                      <button class="chip chip--plain" type="button" aria-pressed=${age === choice.id ? 'true' : 'false'}
                        @click=${() => this._pickAge(person.ref, choice.id)}>${choice.label}</button>
                    `)}
                  </div>
                ` : nothing}
              </div>
            </div>
          `;
        })}
      </div>
      <p class="hint">${peopleHint(this.preview.file.format)}</p>
    `;
  }

  private _renderLook() {
    const lines = lookLines(this.preview);
    if (!lines.length) return nothing;
    const updates = this.preview.needs_a_look.find(l => l.kind === 'updates');
    return html`
      <h2 class="section-label">Needs a look · ${lines.length}</h2>
      <div class="group">
        ${lines.map(line => html`
          <div class="row">
            <div class="stack">
              <div style="display: flex; align-items: flex-start; gap: 12px">
                <span class="mark ${line.kind === 'updates' ? '' : 'mark--attention'}" aria-hidden="true">${line.kind === 'updates' ? 'i' : '!'}</span>
                <span class="row-text"><span>${line.title}</span><span class="row-sub">${line.detail}</span></span>
                ${line.kind === 'unassigned' ? html`
                  <button class="link" type="button" @click=${() => { this._assigning = this._assigning === line.ref ? null : line.ref ?? null; }}>Assign</button>
                ` : line.kind === 'updates' ? html`
                  <button class="link" type="button" @click=${() => { this._showUpdates = !this._showUpdates; }}>${this._showUpdates ? 'Hide them' : 'See them'}</button>
                ` : nothing}
              </div>
              ${line.kind === 'unassigned' && this._assigning === line.ref ? this._renderAssign(line.ref!) : nothing}
              ${line.kind === 'updates' && this._showUpdates && updates?.kind === 'updates' ? html`
                <span class="row-sub">${updates.names.join(', ')}</span>
              ` : nothing}
            </div>
          </div>
        `)}
      </div>
    `;
  }

  private _renderAssign(ref: string) {
    const picked = this.choices.assignees[ref] ?? [];
    return html`
      <div class="chips" role="group" aria-label="Who does it">
        ${this.preview.people.map(person => html`
          <button class="chip chip--plain" type="button" aria-pressed=${picked.includes(person.ref) ? 'true' : 'false'}
            @click=${() => {
              const next = picked.includes(person.ref) ? picked.filter(r => r !== person.ref) : [...picked, person.ref];
              this._set({ ...this.choices, assignees: { ...this.choices.assignees, [ref]: next } });
            }}>${person.name}</button>
        `)}
      </div>
    `;
  }

  private _renderActivity(activity: PreviewActivity, withSwitch = true) {
    const on = onBoardOf(activity, this.choices);
    return html`
      <div class="row toggle-row nested">
        <span class="picture" aria-hidden="true">${activity.icon || pictureFor(activity.name)}</span>
        <span class="row-text">
          <span class="row-title">${activity.name}</span>
          <span class="row-sub">${activityLine(activity, this.preview.people, this.choices, this.timeFormat)}</span>
        </span>
        ${withSwitch ? html`
          <div class="pv-toggle ${on ? 'active' : ''}" role="switch" tabindex="0" aria-checked=${on ? 'true' : 'false'}
            aria-label="${activity.name} on the board" @click=${() => this._switch(activity)}
            @keydown=${(e: KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this._switch(activity); } }}></div>
        ` : nothing}
      </div>
    `;
  }

  private _renderGroups(activities: PreviewActivity[], prefix: string) {
    return byCategory(activities).map(group => {
      const key = `${prefix}:${group.category}`;
      const open = this._open.has(key);
      return html`
        <button class="row" type="button" aria-expanded=${open ? 'true' : 'false'} @click=${() => this._toggleOpen(key)}>
          <span class="picture" aria-hidden="true">${CATEGORY_ICONS[group.category] ?? '📋'}</span>
          <span class="row-text"><span class="row-title">${group.label}</span></span>
          <span class="row-value">${group.items.length}</span>
          <span class="chevron" aria-hidden="true">${open ? '⌄' : '›'}</span>
        </button>
        ${open ? group.items.map(activity => this._renderActivity(activity)) : nothing}
      `;
    });
  }

  private _renderBoard(board: PreviewActivity[]) {
    return html`
      <h2 class="section-label">On the board · ${board.length}</h2>
      ${board.length ? html`<div class="group">${this._renderGroups(board, 'board')}</div>` : html`<p class="hint">Nothing goes on the board yet. Turn on an activity under Plan only.</p>`}
    `;
  }

  private _renderPlanOnly(planOnly: PreviewActivity[]) {
    if (!planOnly.length) return nothing;
    const counts = byCategory(planOnly).map(g => `${g.label} ${g.items.length}`).join(' · ');
    return html`
      <h2 class="section-label">Plan only · ${planOnly.length}</h2>
      <div class="group">
        <button class="row" type="button" aria-expanded=${this._open.has('plan') ? 'true' : 'false'} @click=${() => this._toggleOpen('plan')}>
          <span class="row-text"><span>${counts}</span></span>
          <span class="chevron" aria-hidden="true">${this._open.has('plan') ? '⌄' : '›'}</span>
        </button>
        ${this._open.has('plan') ? this._renderGroups(planOnly, 'plan') : nothing}
      </div>
      <p class="hint">Kept in the plan, not checked off. Turn one on to add it.</p>
    `;
  }

  private _renderSetTimes(setTimes: PreviewActivity[]) {
    if (!setTimes.length) return nothing;
    const names = setTimes.map(a => a.name);
    const text = names.length > 2 ? `${names.slice(0, 2).join(', ')}, and ${names.length - 2} more` : names.join(' and ');
    return html`
      <h2 class="section-label">Set times · ${setTimes.length}</h2>
      <div class="group">
        <button class="row" type="button" aria-expanded=${this._open.has('set') ? 'true' : 'false'} @click=${() => this._toggleOpen('set')}>
          <span class="row-text"><span>${text}</span></span>
          <span class="chevron" aria-hidden="true">${this._open.has('set') ? '⌄' : '›'}</span>
        </button>
        ${this._open.has('set') ? setTimes.map(activity => this._renderActivity(activity, false)) : nothing}
      </div>
      <p class="hint">They belong on a calendar, so they never become chores.</p>
    `;
  }
}

defineElement('pv-import-preview', PvImportPreview);

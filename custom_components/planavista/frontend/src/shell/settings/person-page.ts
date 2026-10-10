import { LitElement, html, css, nothing } from 'lit';
import { property, state } from 'lit/decorators.js';
import type { HomeAssistant } from 'custom-card-helpers';
import { defineElement } from '../../utils/define';
import { baseStyles, buttonStyles, formStyles } from '../../styles/shared';
import {
  AGE_GROUP_CHOICES,
  HouseholdView,
  Member,
  Picture,
  calendarsOf,
  initialOf,
  takenColors,
} from '../../core/household';
import { HouseholdApi, errorCode } from '../../core/household-client';
import type { Layout } from '../../core/layout';
import { POP_PAGE, saveErrorMessage } from '../../core/page-host';
import { DraftRecord, PersonDraft, beginDraft, draftChanges, draftProblem, isDirty, rebaseDraft } from '../../core/person-draft';
import { PvColorSwatchPicker } from '../../core/color-swatch-picker';
import type { PlanaVistaData } from '../../types';
import '../../core/pv-member-avatar';
import '../pv-notice-sheet';
import './pin-actions';

const PALETTE = PvColorSwatchPicker.PRESETS.map(preset => preset.color);

type Notice = 'discard' | 'remove' | 'changed';

/**
 * pv-settings-person: one person's page (spec 14.2, without the chores rows).
 * An editor: Cancel and Save, so a half-made change never reaches anyone.
 * The draft lives in the card's memory, so it survives the end of parent mode.
 */
export class PvSettingsPerson extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ attribute: false }) data!: PlanaVistaData;
  @property({ attribute: false }) household: HouseholdView | null = null;
  @property({ attribute: false }) api!: HouseholdApi;
  @property({ type: String }) layout: Layout = 'landscape';
  @property({ type: String }) mode: 'settings' | 'setup' = 'settings';
  @property({ attribute: false }) pageProps: Record<string, unknown> = {};
  @property({ attribute: false }) drafts: Map<string, unknown> = new Map();

  @state() private _draft!: PersonDraft;
  @state() private _start!: PersonDraft;
  /** The revision the edit began from (null for someone new); Save sends it. */
  private _rev: number | null = null;
  @state() private _problem = '';
  @state() private _saving = false;
  @state() private _notice: Notice | null = null;
  private _loaded = false;
  private _leave?: (ok: boolean) => void;

  private get _memberId(): string | null {
    return (this.pageProps.memberId as string | null | undefined) ?? null;
  }

  private get _member(): Member | null {
    return this.household?.members.find(m => m.id === this._memberId) ?? null;
  }

  private get _draftKey(): string {
    return this._memberId ?? 'new';
  }

  protected willUpdate(): void {
    if (!this._loaded && this.household) {
      const kept = this.drafts.get(this._draftKey) as DraftRecord | undefined;
      this._use(kept ?? beginDraft(this._member, this.household.members, PALETTE));
      this._loaded = true;
    }
  }

  private _use(record: DraftRecord): void {
    this._draft = record.draft;
    this._start = record.start;
    this._rev = record.rev;
  }

  private get _record(): DraftRecord {
    return { draft: this._draft, start: this._start, rev: this._rev };
  }

  /** Settings asks before leaving a page with changes (spec 14.1). */
  confirmLeave(): Promise<boolean> {
    if (!this._loaded || !isDirty(this._draft, this._start)) return Promise.resolve(true);
    this._notice = 'discard';
    return new Promise(resolve => {
      this._leave = resolve;
    });
  }

  static styles = [
    baseStyles,
    buttonStyles,
    formStyles,
    css`
      :host {
        display: block;
        max-width: 640px;
      }

      .top {
        display: flex;
        align-items: center;
        gap: 16px;
        margin-bottom: 20px;
      }

      .top .actions {
        display: flex;
        gap: 8px;
        margin-left: auto;
      }

      .top .actions button {
        min-height: 48px;
        min-width: 88px;
      }

      .problem {
        margin: 0 0 16px;
        padding: 10px 14px;
        border-radius: 12px;
        background: color-mix(in srgb, var(--pv-danger, #DC2626) 10%, transparent);
        color: var(--pv-danger, #DC2626);
      }

      .field {
        margin: 0 0 22px;
        padding: 0;
        border: none;
      }

      .field > .label,
      legend {
        display: block;
        margin-bottom: 8px;
        font-weight: 600;
        font-size: 0.9375rem;
      }

      .hint {
        margin: 6px 0 0;
        font-size: 0.875rem;
        color: var(--pv-text-secondary, #6B7280);
      }

      .swatches {
        display: grid;
        grid-template-columns: repeat(auto-fill, 48px);
        gap: 8px;
      }

      .swatch {
        position: relative;
        width: 48px;
        height: 48px;
        border-radius: 50%;
        border: 3px solid transparent;
        cursor: pointer;
        font: inherit;
        font-weight: 700;
        color: #FFFFFF;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
      }

      .swatch[aria-pressed='true'] {
        border-color: var(--pv-text, #1A1B1E);
        box-shadow: inset 0 0 0 2px var(--pv-card-bg, #FFFFFF);
      }

      .swatch:disabled {
        cursor: not-allowed;
        opacity: 0.45;
      }

      .segmented {
        display: inline-flex;
        gap: 4px;
        padding: 4px;
        border-radius: 12px;
        background: color-mix(in srgb, var(--pv-text, #1A1B1E) 6%, transparent);
      }

      .segmented button {
        min-height: 44px;
        padding: 0 16px;
        border: none;
        border-radius: 9px;
        background: transparent;
        color: inherit;
        font: inherit;
        cursor: pointer;
      }

      .segmented button[aria-pressed='true'] {
        background: var(--pv-card-bg, #FFFFFF);
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
        font-weight: 600;
      }

      .segmented button:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }

      .emoji {
        margin-top: 10px;
        max-width: 240px;
      }

      .radios {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .radio {
        display: flex;
        align-items: center;
        gap: 10px;
        min-height: 48px;
        cursor: pointer;
      }

      .radio input {
        width: 20px;
        height: 20px;
        accent-color: var(--pv-accent, #6366F1);
      }

      .radio .age-hint {
        color: var(--pv-text-secondary, #6B7280);
        font-size: 0.875rem;
      }

      .toggle-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        min-height: 48px;
      }

      .calendars {
        margin: 6px 0 0;
        padding-left: 18px;
      }

      .remove {
        min-height: 48px;
        margin-top: 8px;
        background: transparent;
        border: 1.5px solid var(--pv-danger, #DC2626);
        color: var(--pv-danger, #DC2626);
      }

      .gone {
        color: var(--pv-text-secondary, #6B7280);
      }
    `,
  ];

  render() {
    if (!this._loaded || !this.household) return nothing;
    const member = this._member;
    const isNew = this._memberId === null;
    if (!isNew && !member) {
      return html`<p class="gone">This person was removed on another screen.</p>`;
    }
    const draft = this._draft;
    const dirty = isDirty(draft, this._start);
    return html`
      <div class="top">
        <pv-member-avatar
          .member=${{ name: draft.name || '?', color: draft.color, picture: draft.picture, person: draft.person }}
          .hass=${this.hass}
          size="64"
        ></pv-member-avatar>
        <div class="actions">
          <button class="pv-btn pv-btn-secondary" type="button" @click=${this._cancel}>Cancel</button>
          <button class="pv-btn pv-btn-primary" type="button"
            ?disabled=${this._saving || (!isNew && !dirty)}
            @click=${this._save}>${isNew ? 'Add' : 'Save'}</button>
        </div>
      </div>
      ${this._problem ? html`<p class="problem" role="alert">${this._problem}</p>` : nothing}
      ${this._renderName()}
      ${this._renderColor()}
      ${this._renderPicture()}
      ${this._renderAgeGroup()}
      ${this._renderParent()}
      ${this._renderPin(member)}
      ${this._renderHomeAssistant()}
      ${member ? html`
        <button class="pv-btn remove" type="button" @click=${() => { this._notice = 'remove'; }}>Remove ${member.name}</button>
      ` : nothing}
      ${this._renderNotice(member)}
    `;
  }

  private _renderName() {
    return html`
      <label class="field">
        <span class="label">Name</span>
        <input
          class="pv-input"
          type="text"
          maxlength="40"
          autocomplete="off"
          .value=${this._draft.name}
          @input=${(e: Event) => this._change({ name: (e.target as HTMLInputElement).value })}
        />
      </label>
    `;
  }

  private _renderColor() {
    const taken = takenColors(this.household!.members, this._memberId ?? undefined);
    return html`
      <fieldset class="field">
        <legend>Color</legend>
        <div class="swatches">
          ${PvColorSwatchPicker.PRESETS.map(preset => {
            const owner = taken.get(preset.color.toUpperCase());
            const selected = this._draft.color.toUpperCase() === preset.color.toUpperCase();
            return html`
              <button
                class="swatch"
                type="button"
                style="background:${preset.color}"
                aria-pressed=${selected ? 'true' : 'false'}
                aria-label=${owner ? `${preset.name}, used by ${owner.name}` : preset.name}
                ?disabled=${!!owner}
                @click=${() => this._change({ color: preset.color })}
              >${owner ? initialOf(owner.name) : ''}</button>
            `;
          })}
        </div>
      </fieldset>
    `;
  }

  private _personPicture(): string | null {
    const person = this._draft.person;
    return person ? ((this.hass?.states?.[person]?.attributes?.entity_picture as string | undefined) ?? null) : null;
  }

  private _renderPicture() {
    const picture = this._draft.picture as Record<string, unknown>;
    const kind = typeof picture.emoji === 'string' ? 'emoji' : picture.person ? 'photo' : 'initial';
    const photo = this._personPicture();
    // Photo means "their Home Assistant person's photo": it needs a linked
    // person, and shows the initial until that person has a photo.
    const linked = !!this._draft.person;
    const choose = (next: Picture) => this._change({ picture: next });
    return html`
      <fieldset class="field">
        <legend>Picture</legend>
        <div class="segmented" role="group" aria-label="Picture">
          <button type="button" aria-pressed=${kind === 'initial' ? 'true' : 'false'}
            @click=${() => choose({ initial: true })}>Initial</button>
          <button type="button" aria-pressed=${kind === 'emoji' ? 'true' : 'false'}
            @click=${() => choose({ emoji: typeof picture.emoji === 'string' ? picture.emoji : '🙂' })}>Emoji</button>
          <button type="button" aria-pressed=${kind === 'photo' ? 'true' : 'false'} ?disabled=${!linked}
            @click=${() => choose({ person: true })}>Photo</button>
        </div>
        ${kind === 'emoji' ? html`
          <input class="pv-input emoji" type="text" maxlength="16" placeholder="Type or paste an emoji"
            aria-label="Emoji"
            .value=${String(picture.emoji ?? '')}
            @input=${(e: Event) => choose({ emoji: (e.target as HTMLInputElement).value })} />
        ` : nothing}
        ${!linked
          ? html`<p class="hint">Link a Home Assistant person to use their photo.</p>`
          : kind === 'photo' && !photo
            ? html`<p class="hint">Their Home Assistant person has no photo yet, so their initial shows.</p>`
            : nothing}
      </fieldset>
    `;
  }

  private _renderAgeGroup() {
    return html`
      <fieldset class="field">
        <legend>Age group</legend>
        <div class="radios">
          ${AGE_GROUP_CHOICES.map(choice => html`
            <label class="radio">
              <input type="radio" name="age-group" .checked=${this._draft.age_group === choice.id}
                @change=${() => this._change({ age_group: choice.id })} />
              <span>${choice.label}</span>
              ${choice.hint ? html`<span class="age-hint">${choice.hint}</span>` : nothing}
            </label>
          `)}
        </div>
      </fieldset>
    `;
  }

  private _renderParent() {
    const on = this._draft.parent;
    const toggle = () => this._change({ parent: !on });
    return html`
      <div class="field">
        <div class="toggle-row">
          <span class="label" id="parent-label">Parent</span>
          <div
            class="pv-toggle ${on ? 'active' : ''}"
            role="switch"
            tabindex="0"
            aria-checked=${on ? 'true' : 'false'}
            aria-labelledby="parent-label"
            @click=${toggle}
            @keydown=${(e: KeyboardEvent) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggle();
              }
            }}
          ></div>
        </div>
        <p class="hint">Parents open Settings. On a shared screen they need a PIN.</p>
      </div>
    `;
  }

  private _renderPin(member: Member | null) {
    return html`
      <div class="field">
        <span class="label">PIN</span>
        ${member ? html`
          <pv-pin-actions
            .hass=${this.hass}
            .api=${this.api}
            .layout=${this.layout}
            .member=${member}
            .shuffle=${!!this.household?.security.shuffle_keypad}
            .sharedScreens=${(this.household?.security.shared_screens ?? 0) > 0}
          ></pv-pin-actions>
        ` : html`
          <p class="hint">You can set a PIN after adding ${this._draft.name.trim() || 'them'}.</p>
        `}
      </div>
    `;
  }

  private _renderHomeAssistant() {
    const members = this.household!.members;
    const linkedElsewhere = new Set(members.filter(m => m.id !== this._memberId && m.person).map(m => m.person));
    const persons = Object.keys(this.hass?.states ?? {})
      .filter(id => id.startsWith('person.') && !linkedElsewhere.has(id))
      .sort();
    const own = this._memberId ? calendarsOf(this._memberId, this.data?.calendars ?? []) : [];
    return html`
      <fieldset class="field">
        <legend>Home Assistant</legend>
        <label class="field">
          <span class="label">Person</span>
          <select class="pv-input pv-select" .value=${this._draft.person ?? ''}
            @change=${(e: Event) => this._linkPerson((e.target as HTMLSelectElement).value)}>
            <option value="" ?selected=${!this._draft.person}>None</option>
            ${persons.map(id => html`
              <option value=${id} ?selected=${this._draft.person === id}>${this.hass.states[id]?.attributes?.friendly_name ?? id}</option>
            `)}
          </select>
        </label>
        <span class="label">Calendars</span>
        ${own.length
          ? html`<ul class="calendars">${own.map(cal => html`<li>${cal.display_name}</li>`)}</ul>`
          : html`<p class="hint">No calendars yet. Choose who each calendar belongs to in Calendars.</p>`}
      </fieldset>
    `;
  }

  private _renderNotice(member: Member | null) {
    if (!this._notice) return nothing;
    if (this._notice === 'discard') {
      return html`
        <pv-notice-sheet .layout=${this.layout} heading="Discard changes?"
          .actions=${[
            { id: 'keep', label: 'Keep editing', kind: 'secondary' },
            { id: 'discard', label: 'Discard', kind: 'destructive' },
          ]}
          @pv-sheet-action=${this._onDiscardChoice}></pv-notice-sheet>
      `;
    }
    if (this._notice === 'remove' && member) {
      return html`
        <pv-notice-sheet .layout=${this.layout} heading="Remove ${member.name}?"
          body="Their calendars stay, and won't belong to anyone."
          .actions=${[
            { id: 'cancel', label: 'Cancel', kind: 'secondary' },
            { id: 'remove', label: 'Remove', kind: 'destructive' },
          ]}
          @pv-sheet-action=${this._onRemoveChoice}></pv-notice-sheet>
      `;
    }
    return html`
      <pv-notice-sheet .layout=${this.layout} heading="This changed on another screen."
        .actions=${[
          { id: 'keep', label: 'Keep editing', kind: 'secondary' },
          { id: 'load', label: 'Load the new version', kind: 'primary' },
        ]}
        @pv-sheet-action=${this._onChangedChoice}></pv-notice-sheet>
    `;
  }

  private _change(patch: Partial<PersonDraft>): void {
    this._draft = { ...this._draft, ...patch };
    this._problem = '';
    this.drafts.set(this._draftKey, this._record);
  }

  private _linkPerson(person: string): void {
    const picture = this._draft.picture as Record<string, unknown>;
    // Without a person there is no photo, so the picture falls back to the initial.
    this._change({
      person: person || null,
      picture: !person && picture.person ? { initial: true } : this._draft.picture,
    });
  }

  private _pop(): void {
    this.dispatchEvent(new CustomEvent(POP_PAGE, { bubbles: true, composed: true }));
  }

  private _cancel(): void {
    if (isDirty(this._draft, this._start)) {
      this._notice = 'discard';
      return;
    }
    this._pop();
  }

  private async _save(): Promise<void> {
    const problem = draftProblem(this._draft, this.household?.members ?? [], this._memberId);
    if (problem) {
      this._problem = problem;
      return;
    }
    const member = this._member;
    if (this._rev !== null && !member) {
      this._problem = 'That person was removed on another screen.';
      return;
    }
    this._saving = true;
    try {
      // The revision the edit began from: a newer one means another screen saved meanwhile.
      const existing = member && this._rev !== null ? { id: member.id, rev: this._rev } : undefined;
      await this.api.saveMember(draftChanges(this._record), existing);
      this.drafts.delete(this._draftKey);
      this._start = this._draft;
      this._pop();
    } catch (err) {
      const code = errorCode(err);
      if (code === 'changed') {
        this._notice = 'changed';
      } else {
        this._problem = (err as { message?: string })?.message || saveErrorMessage(code);
      }
    } finally {
      this._saving = false;
    }
  }

  private _onDiscardChoice(event: CustomEvent<{ id: string }>): void {
    event.stopPropagation();
    this._notice = null;
    const discard = event.detail.id === 'discard';
    if (discard) {
      this.drafts.delete(this._draftKey);
      this._draft = this._start;
    }
    if (this._leave) {
      const leave = this._leave;
      this._leave = undefined;
      leave(discard);
    } else if (discard) {
      this._pop();
    }
  }

  private async _onRemoveChoice(event: CustomEvent<{ id: string }>): Promise<void> {
    event.stopPropagation();
    this._notice = null;
    const member = this._member;
    if (event.detail.id !== 'remove' || !member) return;
    try {
      await this.api.deleteMember(member.id);
      this.drafts.delete(this._draftKey);
      this._start = this._draft;
      this._pop();
    } catch (err) {
      this._problem = (err as { message?: string })?.message || saveErrorMessage(errorCode(err));
    }
  }

  private _onChangedChoice(event: CustomEvent<{ id: string }>): void {
    event.stopPropagation();
    this._notice = null;
    const member = this._member;
    if (!this.household || !member) return;
    if (event.detail.id === 'load') {
      this._use(beginDraft(member, this.household.members, PALETTE));
      this.drafts.delete(this._draftKey);
    } else {
      // Keep editing: this screen's changes on top of the version saved on the other screen.
      this._use(rebaseDraft(this._record, member, this.household.members, PALETTE));
      this.drafts.set(this._draftKey, this._record);
    }
  }
}

defineElement('pv-settings-person', PvSettingsPerson);

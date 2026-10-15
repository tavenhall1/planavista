import { LitElement, html, css, nothing } from 'lit';
import { choiceStyles, segmentedStyles } from '../../styles/controls';
import { property, state } from 'lit/decorators.js';
import { html as staticHtml, unsafeStatic } from 'lit/static-html.js';
import type { HomeAssistant } from 'custom-card-helpers';
import { defineElement } from '../../utils/define';
import { baseStyles, buttonStyles, formStyles } from '../../styles/shared';
import {
  AGE_GROUP_CHOICES,
  AGE_GROUP_CHORES_HINTS,
  AgeGroup,
  HouseholdView,
  Member,
  Picture,
  calendarsOf,
  initialOf,
  takenColors,
} from '../../core/household';
import { HouseholdApi, errorCode } from '../../core/household-client';
import type { Layout } from '../../core/layout';
import { POP_PAGE, announceEditor, editorExit, saveErrorMessage } from '../../core/page-host';
import {
  DraftRecord, PersonDraft, ageGroupNote, beginDraft, draftChanges, draftProblem, isDirty, rebaseDraft, withAgeGroup,
} from '../../core/person-draft';
import type { ModuleService } from '../../core/module-registry';
import { PERSON_CHANGE, PersonSection, personSections } from '../../core/settings-registry';
import { PvColorSwatchPicker } from '../../core/color-swatch-picker';
import type { PlanaVistaData } from '../../types';
import '../../core/pv-member-avatar';
import '../pv-notice-sheet';
import './pin-actions';
import { HelpState, helpBox, helpFor, helpLabel, helpStyles } from '../../core/help';

const PALETTE = PvColorSwatchPicker.PRESETS.map(preset => preset.color);

type Notice = 'discard' | 'remove' | 'changed';

/**
 * pv-settings-person: one person's page (spec 14.2). An editor: Cancel and
 * Save, so a half-made change never reaches anyone. The draft lives in the
 * card's memory, so it survives the end of parent mode. Modules add their
 * own parts (the chores rows, sleep, phones) through personSections.
 */
export class PvSettingsPerson extends LitElement {
  /** Which settings' explainers are open (0.12.0, core/help.ts). */
  private readonly _help = new HelpState(this);
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ attribute: false }) data!: PlanaVistaData;
  @property({ attribute: false }) household: HouseholdView | null = null;
  @property({ attribute: false }) api!: HouseholdApi;
  @property({ type: String }) layout: Layout = 'landscape';
  @property({ type: String }) mode: 'settings' | 'setup' = 'settings';
  @property({ attribute: false }) pageProps: Record<string, unknown> = {};
  @property({ attribute: false }) drafts: Map<string, unknown> = new Map();
  @property({ attribute: false }) services: Record<string, ModuleService> = {};
  @property({ type: Number }) revision = 0;

  @state() private _draft!: PersonDraft;
  /** What the last age group change changed. */
  @state() private _ageNote: string | null = null;
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

  connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener(PERSON_CHANGE, this._onSectionChange as EventListener);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this._announced = '';
    this.removeEventListener(PERSON_CHANGE, this._onSectionChange as EventListener);
  }

  private _onSectionChange = (event: CustomEvent<Partial<PersonDraft>>): void => {
    event.stopPropagation();
    this._change(event.detail);
  };

  /** Removed on another screen while open. */
  private get _gone(): boolean {
    return this._memberId !== null && !!this.household && !this._member;
  }

  /** Settings asks before leaving a page with changes (spec 14.1). */
  confirmLeave(): Promise<boolean> {
    const exit = editorExit(this._loaded && isDirty(this._draft, this._start), this._gone);
    if (exit === 'drop') this.drafts.delete(this._draftKey);
    if (exit !== 'ask') return Promise.resolve(true);
    this._notice = 'discard';
    return new Promise(resolve => {
      this._leave = resolve;
    });
  }

  static styles = [
    helpStyles,
    segmentedStyles,
    choiceStyles,
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
        font-size: 0.8125rem;
        font-weight: 750;
        color: var(--pv-text-secondary, #5F6670);
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





      .emoji {
        margin-top: 10px;
        max-width: 240px;
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

      /* The one delete in place (the sheets' danger button), across the end of the page (review). */
      .end-delete {
        width: 100%;
        margin-top: 24px;
      }

      .gone {
        color: var(--pv-text-secondary, #6B7280);
      }
    `,
  ];

  /** The editor's Cancel and Save, held in the Settings header (milestone 8). */
  private _announced = '';

  protected updated(): void {
    const isNew = this._memberId === null;
    const editor = {
      label: isNew ? 'Add' : 'Save',
      ready: !(this._gone || this._saving || (!isNew && !isDirty(this._draft, this._start))),
      save: () => void this._save(),
      cancel: () => this._cancel(),
    };
    const said = `${editor.label}|${editor.ready}`;
    if (said === this._announced) return;
    this._announced = said;
    announceEditor(this, editor);
  }

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
      </div>
      ${this._problem ? html`<p class="problem" role="alert">${this._problem}</p>` : nothing}
      ${this._renderName()}
      ${this._renderColor()}
      ${this._renderPicture()}
      ${this._renderAgeGroup()}
      ${this._renderParent()}
      ${this._renderSections('role', member)}
      ${this._renderPin(member)}
      ${this._renderSections('pin', member)}
      ${this._renderHomeAssistant()}
      ${this._renderSections('links', member)}
      ${member ? html`
        <button class="pv-btn pv-btn-secondary danger apart end-delete" type="button" @click=${() => { this._notice = 'remove'; }}>Remove from household</button>
      ` : nothing}
      ${this._renderNotice(member)}
    `;
  }

  private _renderName() {
    return html`
      <div class="field">
        ${helpFor(this._help, 'person_name', 'Name', 'person-name')}
        <input
          id="person-name"
          class="pv-input"
          type="text"
          maxlength="40"
          autocomplete="off"
          .value=${this._draft.name}
          @input=${(e: Event) => this._change({ name: (e.target as HTMLInputElement).value })}
        />
      </div>
      ${helpBox(this._help, 'person_name')}
    `;
  }

  private _renderColor() {
    const taken = takenColors(this.household!.members, this._memberId ?? undefined);
    // A color from before the palette grew (or from a file) stays shown, chosen, first (2026-10-14).
    const current = PvColorSwatchPicker.PRESETS.some(p => p.color.toUpperCase() === this._draft.color.toUpperCase())
      || !this._draft.color;
    return html`
      <fieldset class="field">
        <legend>${helpLabel(this._help, 'person_color', 'Color')}</legend>
        ${helpBox(this._help, 'person_color')}
        <div class="swatches">
          ${current ? nothing : html`
            <button class="swatch" type="button" style="background:${this._draft.color}" aria-pressed="true"
              aria-label="Current color"></button>
          `}
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
    // person who has one, so it can't be picked before (milestone 8). A Photo
    // saved before the photo exists shows the initial until it does.
    const linked = !!this._draft.person;
    const usable = linked && !!photo;
    const shown = kind === 'photo' && !usable ? 'initial' : kind;
    const choose = (next: Picture) => this._change({ picture: next });
    return html`
      <fieldset class="field">
        <legend>${helpLabel(this._help, 'person_picture', 'Picture')}</legend>
        ${helpBox(this._help, 'person_picture')}
        <div class="pv-seg stretch" role="group" aria-label="Picture">
          <button type="button" aria-pressed=${shown === 'initial' ? 'true' : 'false'}
            @click=${() => choose({ initial: true })}>Initial</button>
          <button type="button" aria-pressed=${shown === 'emoji' ? 'true' : 'false'}
            @click=${() => choose({ emoji: typeof picture.emoji === 'string' ? picture.emoji : '🙂' })}>Emoji</button>
          <button type="button" aria-pressed=${shown === 'photo' ? 'true' : 'false'} ?disabled=${!usable}
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
          : !photo
            ? html`<p class="hint">Their Home Assistant person has no photo yet. Add one there to use it here.</p>`
            : nothing}
      </fieldset>
    `;
  }

  private get _choresOn(): boolean {
    const chores = (this.household?.modules as { chores?: { enabled?: boolean } } | undefined)?.chores;
    return chores?.enabled === true;
  }

  private _renderAgeGroup() {
    return html`
      <fieldset class="field">
        <legend>${helpLabel(this._help, 'person_age_group', 'Age group')}</legend>
        ${helpBox(this._help, 'person_age_group')}
        <div class="pv-choices">
          ${AGE_GROUP_CHOICES.map(choice => {
            const hint = this._choresOn ? AGE_GROUP_CHORES_HINTS[choice.id] : choice.hint;
            return html`
              <label class="pv-choice">
                <input type="radio" name="age-group" .checked=${this._draft.age_group === choice.id}
                  @change=${() => this._pickAgeGroup(choice.id)} />
                <span class="choice-text"><span class="choice-title">${choice.label}</span>${hint ? html`<span class="choice-sub">${hint}</span>` : nothing}</span>
                <span class="choice-check" aria-hidden="true">✓</span>
              </label>
            `;
          })}
        </div>
        ${this._choresOn && this._ageNote ? html`<p class="hint" role="status">${this._ageNote}</p>` : nothing}
      </fieldset>
    `;
  }

  /** A new age group brings its defaults, and says what they changed (milestone 8). */
  private _pickAgeGroup(age: AgeGroup): void {
    const next = withAgeGroup(this._draft, age);
    this._ageNote = ageGroupNote(this._draft, next);
    this._changeDraft(next);
  }

  /** The parts modules add at one slot of the page, such as the chores rows. */
  private _renderSections(slot: PersonSection['slot'], member: Member | null) {
    const context = { household: this.household, data: this.data, services: this.services };
    return personSections.pages(context).filter(section => section.slot === slot).map(section => {
      const tag = unsafeStatic(section.tag);
      return staticHtml`
        <${tag}
          .hass=${this.hass}
          .data=${this.data}
          .household=${this.household}
          .member=${member}
          .draft=${this._draft}
          .services=${this.services}
          .revision=${this.revision}
          .layout=${this.layout}
        ></${tag}>
      `;
    });
  }

  private _renderParent() {
    const on = this._draft.parent;
    const toggle = () => this._change({ parent: !on });
    return html`
      <div class="field">
        <div class="toggle-row">
          ${helpLabel(this._help, 'person_parent', 'Parent', 'parent-label')}
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
        ${helpBox(this._help, 'person_parent')}
      </div>
    `;
  }

  private _renderPin(member: Member | null) {
    return html`
      <div class="field">
        ${helpLabel(this._help, 'person_pin', 'PIN')}
        ${helpBox(this._help, 'person_pin')}
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
        <div class="field">
          ${helpFor(this._help, 'person_ha_person', 'Person', 'person-ha-person')}
          <select id="person-ha-person" class="pv-input pv-select" .value=${this._draft.person ?? ''}
            @change=${(e: Event) => this._linkPerson((e.target as HTMLSelectElement).value)}>
            <option value="" ?selected=${!this._draft.person}>None</option>
            ${persons.map(id => html`
              <option value=${id} ?selected=${this._draft.person === id}>${this.hass.states[id]?.attributes?.friendly_name ?? id}</option>
            `)}
          </select>
        </div>
        ${helpBox(this._help, 'person_ha_person')}
        ${helpLabel(this._help, 'person_calendars', 'Calendars')}
        ${helpBox(this._help, 'person_calendars')}
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
            { id: 'discard', label: 'Discard changes', kind: 'destructive' },
            { id: 'keep', label: 'Keep editing', kind: 'secondary' },
          ]}
          @pv-sheet-action=${this._onDiscardChoice}></pv-notice-sheet>
      `;
    }
    if (this._notice === 'remove' && member) {
      return html`
        <pv-notice-sheet .layout=${this.layout} heading="Remove ${member.name}?"
          body="Their calendars stay, and won't belong to anyone."
          .actions=${[
            { id: 'remove', label: `Remove ${member.name}`, kind: 'destructive' },
            { id: 'cancel', label: 'Cancel', kind: 'secondary' },
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
    this._changeDraft({ ...this._draft, ...patch });
  }

  private _changeDraft(draft: PersonDraft): void {
    this._draft = draft;
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
    const exit = editorExit(isDirty(this._draft, this._start), this._gone);
    if (exit === 'ask') {
      this._notice = 'discard';
      return;
    }
    if (exit === 'drop') this.drafts.delete(this._draftKey);
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

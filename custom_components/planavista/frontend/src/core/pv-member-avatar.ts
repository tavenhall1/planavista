import { LitElement, html, css, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import type { HomeAssistant } from 'custom-card-helpers';
import { defineElement } from '../utils/define';
import { Member, pictureOf } from './household';
import { contrastText } from '../styles/themes';

/**
 * pv-member-avatar: a person's photo, emoji, or initial on their color
 * (spec 11.3: the member color says who).
 */
export class PvMemberAvatar extends LitElement {
  @property({ attribute: false }) member?: Pick<Member, 'name' | 'color' | 'picture' | 'person'>;
  @property({ attribute: false }) hass?: HomeAssistant;
  @property({ type: Number }) size = 40;

  static styles = css`
    :host {
      display: inline-block;
      flex-shrink: 0;
      line-height: 0;
    }

    .avatar {
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      overflow: hidden;
      font-weight: 700;
      line-height: 1;
      user-select: none;
    }

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  `;

  render() {
    const member = this.member;
    if (!member) return nothing;
    const view = pictureOf(
      member,
      id => (this.hass?.states?.[id]?.attributes?.entity_picture as string | undefined) ?? null,
    );
    const fontSize = Math.round(this.size * (view.kind === 'emoji' ? 0.55 : 0.42));
    const style =
      `width:${this.size}px;height:${this.size}px;font-size:${fontSize}px;` +
      `background:${member.color};color:${contrastText(member.color)}`;
    return html`
      <div class="avatar" role="img" aria-label=${member.name} style=${style}>
        ${view.kind === 'photo' ? html`<img src=${view.url} alt="" />` : view.text}
      </div>
    `;
  }
}

defineElement('pv-member-avatar', PvMemberAvatar);

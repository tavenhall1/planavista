import { html, TemplateResult } from 'lit';

/** U+FE0F, the emoji presentation selector. */
const VS16 = String.fromCharCode(0xfe0f);
/** U+200D, the joiner in sequences like a cook or a family. */
const ZWJ = String.fromCharCode(0x200d);
/** One emoji picture: a pictograph drawn as emoji, with its modifiers and joined parts. */
const PICTURE = `(?:\\p{Emoji_Presentation}|\\p{Extended_Pictographic}${VS16})(?:${VS16}|\\p{Emoji_Modifier}|${ZWJ}\\p{Extended_Pictographic}${VS16}?)*`;
const ONE = new RegExp(PICTURE, 'u');
const ALL = new RegExp(`(${PICTURE})`, 'gu');

/**
 * Words with their emoji in `<span class="emo">`, so a dimmed shared screen
 * can dim the pictures by the media filter while the words keep the text rule
 * (review m12 B). Plain text comes back as it was.
 */
export function withEmoji(text: string): TemplateResult | string {
  if (!ONE.test(text)) return text;
  return html`${text.split(ALL).map((part, i) => (i % 2 ? html`<span class="emo">${part}</span>` : part))}`;
}

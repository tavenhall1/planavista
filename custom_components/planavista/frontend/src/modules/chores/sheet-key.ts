/** What a board sheet is about, as far as its element is concerned. */
export interface SheetLike {
  kind: string;
  key?: string;
  id?: string | null;
  row?: { key: string };
  member?: string;
  date?: string;
  heading?: string;
}

/**
 * Which sheet is open, for its element (round 3, r3a A8): a different sheet
 * gets an element of its own, so one leaving can't close the next one (its
 * close fired through the reused element); the same sheet changing (busy, its
 * history loading) keeps its element and whatever was typed in it.
 */
/** What a sheet is called in "The connection dropped, so ... closed." (round 4). */
export function sheetName(sheet: SheetLike): string {
  switch (sheet.kind) {
    case 'quick_add':
      return 'New chore';
    case 'inbox':
      return 'the approvals';
    case 'options':
      return "the chore's options";
    case 'reward':
      return 'the reward';
    case 'day':
      return "the day's chores";
    case 'people':
      return 'the list of people';
    case 'delete':
    case 'delete_reward':
      return 'the question';
    default:
      return 'that';
  }
}

export function sheetKey(sheet: SheetLike | null): string {
  if (!sheet) return '';
  switch (sheet.kind) {
    case 'options':
      return `options:${sheet.key}`;
    case 'delete':
      return `delete:${sheet.row?.key}`;
    case 'reward':
    case 'delete_reward':
      return `${sheet.kind}:${sheet.id ?? 'new'}`;
    case 'day':
      return `day:${sheet.member}:${sheet.date}`;
    case 'people':
    case 'no_pin':
      return `${sheet.kind}:${sheet.heading}`;
    default:
      return sheet.kind;
  }
}

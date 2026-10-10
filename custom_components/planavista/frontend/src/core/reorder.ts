/** The list with the item at `from` moved to `to`; out-of-range moves change nothing. */
export function moveItem<T>(list: readonly T[], from: number, to: number): T[] {
  const result = [...list];
  if (from < 0 || from >= result.length || to < 0 || to >= result.length || from === to) return result;
  const [item] = result.splice(from, 1);
  result.splice(to, 0, item);
  return result;
}

/** The row a dragged pointer at `y` is over: the first whose middle is below it. */
export function rowIndexAt(y: number, rows: Array<{ top: number; height: number }>): number {
  if (rows.length === 0) return -1;
  const index = rows.findIndex(row => y < row.top + row.height / 2);
  return index >= 0 ? index : rows.length - 1;
}

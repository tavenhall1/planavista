/**
 * The keys inside a menu (the ARIA menu pattern, as iOS menus answer a
 * keyboard): arrows move and wrap, Home and End jump, Enter or Space
 * chooses, Escape or Tab closes. Anything else is left alone.
 */
export function menuStep(key: string, index: number, count: number): number | 'choose' | 'close' | null {
  if (count <= 0) return key === 'Escape' || key === 'Tab' ? 'close' : null;
  switch (key) {
    case 'ArrowDown': return (index + 1) % count;
    case 'ArrowUp': return (index - 1 + count) % count;
    case 'Home': return 0;
    case 'End': return count - 1;
    case 'Enter':
    case ' ': return 'choose';
    case 'Escape':
    case 'Tab': return 'close';
    default: return null;
  }
}

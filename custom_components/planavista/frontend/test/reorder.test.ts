import { describe, expect, it } from 'vitest';
import { moveItem, rowIndexAt } from '../src/core/reorder';

describe('reorder', () => {
  it('moves an item to a new place', () => {
    expect(moveItem(['a', 'b', 'c', 'd'], 0, 2)).toEqual(['b', 'c', 'a', 'd']);
    expect(moveItem(['a', 'b', 'c', 'd'], 3, 0)).toEqual(['d', 'a', 'b', 'c']);
    expect(moveItem(['a', 'b'], 0, 5)).toEqual(['a', 'b']);
  });

  it('finds the row a dragged pointer is over', () => {
    const rows = [{ top: 0, height: 60 }, { top: 60, height: 60 }, { top: 120, height: 60 }];
    expect(rowIndexAt(-10, rows)).toBe(0);
    expect(rowIndexAt(29, rows)).toBe(0);
    expect(rowIndexAt(31, rows)).toBe(1);
    expect(rowIndexAt(500, rows)).toBe(2);
    expect(rowIndexAt(10, [])).toBe(-1);
  });
});

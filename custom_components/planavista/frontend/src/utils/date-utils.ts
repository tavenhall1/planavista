import { ViewType } from '../types';

/**
 * Format a time string from ISO datetime.
 */
export function formatTime(isoString: string, format: '12h' | '24h' = '12h'): string {
  const date = new Date(isoString);
  if (format === '24h') {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  }
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

/**
 * Format a date for display.
 */
export function formatDate(date: Date, format: 'long' | 'medium' | 'short' | 'weekday' = 'medium'): string {
  switch (format) {
    case 'long':
      return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    case 'medium':
      return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    case 'short':
      return date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' });
    case 'weekday':
      return date.toLocaleDateString('en-US', { weekday: 'long' });
  }
}

export function isToday(date: Date): boolean {
  const today = new Date();
  return date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate();
}

export function isTomorrow(date: Date): boolean {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return date.getFullYear() === tomorrow.getFullYear() &&
    date.getMonth() === tomorrow.getMonth() &&
    date.getDate() === tomorrow.getDate();
}

export function isPast(date: Date): boolean {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d < now;
}

/**
 * Get the start of the week containing the given date.
 */
export function getStartOfWeek(date: Date, firstDay: 'monday' | 'sunday' = 'sunday'): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = firstDay === 'monday' ? (day === 0 ? -6 : 1 - day) : -day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Get a 6-week grid for month view (array of 42 dates).
 */
export function getMonthGrid(date: Date, firstDay: 'monday' | 'sunday' = 'sunday'): Date[] {
  const firstOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  const start = getStartOfWeek(firstOfMonth, firstDay);
  const grid: Date[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    grid.push(d);
  }
  return grid;
}

/**
 * Get the date range for a given view.
 */
export function getDateRange(
  view: ViewType,
  currentDate: Date,
  firstDay: 'monday' | 'sunday' = 'sunday'
): { start: Date; end: Date } {
  const start = new Date(currentDate);
  const end = new Date(currentDate);

  switch (view) {
    case 'day':
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;
    case 'week': {
      const weekStart = getStartOfWeek(currentDate, firstDay);
      start.setTime(weekStart.getTime());
      start.setHours(0, 0, 0, 0);
      end.setTime(weekStart.getTime());
      end.setDate(end.getDate() + 6);
      end.setHours(23, 59, 59, 999);
      break;
    }
    case 'month': {
      const grid = getMonthGrid(currentDate, firstDay);
      start.setTime(grid[0].getTime());
      start.setHours(0, 0, 0, 0);
      end.setTime(grid[41].getTime());
      end.setHours(23, 59, 59, 999);
      break;
    }
    case 'agenda':
      start.setHours(0, 0, 0, 0);
      end.setDate(end.getDate() + 14);
      end.setHours(23, 59, 59, 999);
      break;
  }
  return { start, end };
}

/**
 * Get relative label for a date.
 */
export function getRelativeLabel(date: Date): string {
  if (isToday(date)) return 'Today';
  if (isTomorrow(date)) return 'Tomorrow';
  const now = new Date();
  const diffDays = Math.floor((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 7 && diffDays >= 0) {
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  }
  return formatDate(date, 'medium');
}

/**
 * Get a date key string (YYYY-MM-DD) for grouping.
 */
export function getDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

/**
 * Navigate a date by offset based on view type.
 */
export function navigateDate(date: Date, view: ViewType, direction: 'prev' | 'next'): Date {
  const d = new Date(date);
  const offset = direction === 'next' ? 1 : -1;
  switch (view) {
    case 'day':
      d.setDate(d.getDate() + offset);
      break;
    case 'week':
      d.setDate(d.getDate() + offset * 7);
      break;
    case 'month':
      d.setMonth(d.getMonth() + offset);
      break;
    case 'agenda':
      d.setDate(d.getDate() + offset * 7);
      break;
  }
  return d;
}

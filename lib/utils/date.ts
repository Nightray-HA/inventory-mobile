import { format, parseISO, isToday, isYesterday, startOfDay, endOfDay } from 'date-fns';
import { id as localeId } from 'date-fns/locale';

/**
 * Format a date string (ISO or YYYY-MM-DD) to a localized display string
 */
export function formatDate(dateStr: string, pattern: string = 'dd MMM yyyy'): string {
  try {
    const date = dateStr.includes('T') ? parseISO(dateStr) : parseISO(dateStr + 'T00:00:00');
    return format(date, pattern, { locale: localeId });
  } catch {
    return dateStr;
  }
}

/**
 * Format a Date object to YYYY-MM-DD string for DB storage
 */
export function toDbDate(date: Date = new Date()): string {
  return format(date, 'yyyy-MM-dd');
}

/**
 * Get today's date as YYYY-MM-DD
 */
export function today(): string {
  return toDbDate(new Date());
}

/**
 * Get relative date label: "Hari ini", "Kemarin", or formatted date
 */
export function relativeDate(dateStr: string): string {
  try {
    const date = parseISO(dateStr + 'T00:00:00');
    if (isToday(date)) return 'Hari ini';
    if (isYesterday(date)) return 'Kemarin';
    return formatDate(dateStr, 'dd MMM yyyy');
  } catch {
    return dateStr;
  }
}

/**
 * Format datetime string for display (with time)
 */
export function formatDateTime(dateTimeStr: string): string {
  try {
    const date = parseISO(dateTimeStr);
    return format(date, 'dd MMM yyyy, HH:mm', { locale: localeId });
  } catch {
    return dateTimeStr;
  }
}

/**
 * Get start of day as ISO string for queries
 */
export function startOfDayStr(dateStr: string): string {
  try {
    const date = parseISO(dateStr + 'T00:00:00');
    return format(startOfDay(date), "yyyy-MM-dd'T'HH:mm:ss");
  } catch {
    return dateStr;
  }
}

/**
 * Get end of day as ISO string for queries
 */
export function endOfDayStr(dateStr: string): string {
  try {
    const date = parseISO(dateStr + 'T00:00:00');
    return format(endOfDay(date), "yyyy-MM-dd'T'HH:mm:ss");
  } catch {
    return dateStr;
  }
}

/**
 * Check if two date strings are the same day
 */
export function isSameDay(a: string, b: string): boolean {
  return a.substring(0, 10) === b.substring(0, 10);
}

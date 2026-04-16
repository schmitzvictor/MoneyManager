import { format, parseISO, startOfMonth, endOfMonth, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Format a date string or Date object for display.
 */
export function formatDate(date: string | Date, pattern = 'dd/MM/yyyy'): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(d)) return '';
  return format(d, pattern, { locale: ptBR });
}

/**
 * Format a date as a relative month string: "Abril 2026"
 */
export function formatMonth(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(d)) return '';
  return format(d, 'MMMM yyyy', { locale: ptBR });
}

/**
 * Get the YYYY-MM string for a given date.
 */
export function toMonthKey(date: Date): string {
  return format(date, 'yyyy-MM');
}

/**
 * Get start and end of a month from a YYYY-MM string.
 */
export function getMonthRange(monthKey: string): { start: Date; end: Date } {
  const date = parseISO(`${monthKey}-01`);
  return {
    start: startOfMonth(date),
    end: endOfMonth(date),
  };
}

/**
 * Get today's date as an ISO string (date part only).
 */
export function todayISO(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

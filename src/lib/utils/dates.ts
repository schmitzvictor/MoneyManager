/**
 * Date utility functions for MoneyManager.
 *
 * Wraps common date-fns operations with locale defaults and
 * app-specific helpers. All functions are pure (no side effects).
 */

import {
  format,
  formatDistanceToNow,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  subMonths,
  addMonths,
  isToday,
  isYesterday,
  isSameMonth,
  isSameYear,
  parseISO,
  differenceInDays,
  differenceInCalendarMonths,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';

// ─── Locale default ───────────────────────────────────────────────────────────

export const DEFAULT_LOCALE = ptBR;

// ─── Format helpers ───────────────────────────────────────────────────────────

/**
 * Format a date as "dd/MM/yyyy" (Brazilian default).
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'dd/MM/yyyy', { locale: DEFAULT_LOCALE });
}

/**
 * Format a date as "dd MMM yyyy" → "10 mai. 2026"
 */
export function formatDateShort(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'dd MMM yyyy', { locale: DEFAULT_LOCALE });
}

/**
 * Format a date as "MMMM yyyy" → "maio 2026"
 */
export function formatMonthYear(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'MMMM yyyy', { locale: DEFAULT_LOCALE });
}

/**
 * Format a date as "MMM yyyy" → "mai. 2026"
 */
export function formatMonthYearShort(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'MMM yyyy', { locale: DEFAULT_LOCALE });
}

/**
 * Relative time label: "today", "yesterday", or formatted date.
 * Useful for transaction lists.
 */
export function formatRelativeDate(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (isToday(d)) return 'Hoje';
  if (isYesterday(d)) return 'Ontem';
  return formatDate(d);
}

/**
 * Human-readable distance, e.g. "há 3 dias".
 */
export function formatTimeAgo(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return formatDistanceToNow(d, { addSuffix: true, locale: DEFAULT_LOCALE });
}

// ─── Range helpers ────────────────────────────────────────────────────────────

/**
 * Returns the ISO string start and end of the current month.
 */
export function currentMonthRange(): { from: string; to: string } {
  const now = new Date();
  return {
    from: startOfMonth(now).toISOString().split('T')[0],
    to: endOfMonth(now).toISOString().split('T')[0],
  };
}

/**
 * Returns the ISO string start and end of the current year.
 */
export function currentYearRange(): { from: string; to: string } {
  const now = new Date();
  return {
    from: startOfYear(now).toISOString().split('T')[0],
    to: endOfYear(now).toISOString().split('T')[0],
  };
}

/**
 * Returns start and end of N months ago.
 */
export function monthRangeNMonthsAgo(n: number): { from: string; to: string } {
  const target = subMonths(new Date(), n);
  return {
    from: startOfMonth(target).toISOString().split('T')[0],
    to: endOfMonth(target).toISOString().split('T')[0],
  };
}

/**
 * Returns the YYYY-MM-DD string for the first day of a month offset.
 * offset=0 → current month, offset=-1 → last month, offset=1 → next month.
 */
export function monthStart(offset = 0): string {
  return startOfMonth(addMonths(new Date(), offset)).toISOString().split('T')[0];
}

/**
 * Returns the YYYY-MM-DD string for the last day of a month offset.
 */
export function monthEnd(offset = 0): string {
  return endOfMonth(addMonths(new Date(), offset)).toISOString().split('T')[0];
}

// ─── Comparison helpers ────────────────────────────────────────────────────────

export function isCurrentMonth(date: Date | string): boolean {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return isSameMonth(d, new Date());
}

export function isCurrentYear(date: Date | string): boolean {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return isSameYear(d, new Date());
}

/**
 * Number of days between two ISO date strings. Always positive.
 */
export function daysBetween(from: string, to: string): number {
  return Math.abs(differenceInDays(parseISO(to), parseISO(from)));
}

/**
 * Number of calendar months between two ISO date strings.
 */
export function monthsBetween(from: string, to: string): number {
  return Math.abs(differenceInCalendarMonths(parseISO(to), parseISO(from)));
}

// ─── YYYY-MM helpers (budget key) ────────────────────────────────────────────

/**
 * Returns "YYYY-MM" string for the current month. Used as budget month key.
 */
export function currentYearMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

/**
 * Parse a "YYYY-MM" string into { year, month } numbers.
 */
export function parseYearMonth(ym: string): { year: number; month: number } {
  const [year, month] = ym.split('-').map(Number);
  return { year, month };
}

/**
 * Returns the display label for a "YYYY-MM" string, e.g. "maio 2026".
 */
export function labelYearMonth(ym: string): string {
  const { year, month } = parseYearMonth(ym);
  const d = new Date(year, month - 1, 1);
  return formatMonthYear(d);
}

// ─── Today ISO ────────────────────────────────────────────────────────────────

/**
 * Returns today's date as "YYYY-MM-DD".
 */
export function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}

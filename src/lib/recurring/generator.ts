/**
 * Recurring Transaction Generator
 *
 * Utility to generate transaction instances from a recurring series.
 * This runs server-side and is used by both the dashboard (upcoming widget)
 * and the recurring page (mark-as-posted flow).
 */

import { addDays, addWeeks, addMonths, addYears, isBefore, isEqual } from 'date-fns';

export type RecurringFrequency =
  | 'daily'
  | 'weekly'
  | 'biweekly'
  | 'monthly'
  | 'yearly';

export interface RecurringSeries {
  id: string;
  frequency: RecurringFrequency;
  start_date: string;
  end_date: string | null;
  next_occurrence: string;
  amount: number;
  description: string;
  type: 'income' | 'expense';
  account_id: string;
  category_id: string | null;
  is_archived: boolean;
}

export interface PlannedOccurrence {
  seriesId: string;
  date: string;
  amount: number;
  description: string;
  type: 'income' | 'expense';
  accountId: string;
  categoryId: string | null;
}

/**
 * Advance a date string by one interval according to frequency.
 */
export function advanceByFrequency(dateStr: string, frequency: RecurringFrequency): string {
  const d = new Date(dateStr + 'T00:00:00');
  let next: Date;

  switch (frequency) {
    case 'daily':
      next = addDays(d, 1);
      break;
    case 'weekly':
      next = addWeeks(d, 1);
      break;
    case 'biweekly':
      next = addWeeks(d, 2);
      break;
    case 'monthly':
      next = addMonths(d, 1);
      break;
    case 'yearly':
      next = addYears(d, 1);
      break;
    default:
      next = addMonths(d, 1);
  }

  return next.toISOString().split('T')[0];
}

/**
 * Generate all upcoming occurrences for a single series within a date window.
 *
 * @param series  The recurring series record
 * @param until   The end date of the window (inclusive)
 * @param from    The start date of the window (defaults to next_occurrence)
 * @param maxCount Safety limit to avoid infinite loops (default: 90)
 */
export function generateOccurrences(
  series: RecurringSeries,
  until: string,
  from?: string,
  maxCount = 90
): PlannedOccurrence[] {
  if (series.is_archived) return [];

  const occurrences: PlannedOccurrence[] = [];
  let currentDate = from ?? series.next_occurrence;

  const untilDate = new Date(until + 'T00:00:00');
  const endDate = series.end_date
    ? new Date(series.end_date + 'T00:00:00')
    : null;

  let count = 0;

  while (count < maxCount) {
    const current = new Date(currentDate + 'T00:00:00');

    // Stop if past the until window
    if (!isBefore(current, untilDate) && !isEqual(current, untilDate)) break;

    // Stop if past the series end date
    if (endDate && !isBefore(current, endDate) && !isEqual(current, endDate)) break;

    occurrences.push({
      seriesId: series.id,
      date: currentDate,
      amount: series.amount,
      description: series.description,
      type: series.type,
      accountId: series.account_id,
      categoryId: series.category_id,
    });

    currentDate = advanceByFrequency(currentDate, series.frequency);
    count++;
  }

  return occurrences;
}

/**
 * Generate upcoming occurrences for multiple series within a window.
 * Returns a flat array sorted by date ascending.
 */
export function generateUpcomingOccurrences(
  seriesList: RecurringSeries[],
  until: string,
  from?: string
): PlannedOccurrence[] {
  const all = seriesList.flatMap((s) => generateOccurrences(s, until, from));
  return all.sort((a, b) => a.date.localeCompare(b.date));
}

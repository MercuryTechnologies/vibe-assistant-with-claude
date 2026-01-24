// =============================================================================
// Insights Utilities
// =============================================================================
// Ported from vibe-assistant-with-claude for the Insights page

import type { Transaction } from '@/types';

export type DateRange = { start: Date; end: Date };

export type CashFlowRecord = {
  date: string; // ISO format YYYY-MM-DD
  moneyIn: number;
  moneyOut: number;
};

export type AggregatedData = {
  period: string; // Format depends on cadence
  label: string; // Display label
  moneyIn: number;
  moneyOut: number;
};

export type Cadence = 'days' | 'monthly' | 'quarterly' | 'yearly';

/**
 * Parse an ISO date string (YYYY-MM-DD) as local time, not UTC.
 */
function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day || 1);
}

export function clampRange(
  range: DateRange,
  minDate: Date,
  maxDate: Date
): DateRange {
  let { start, end } = range;
  
  if (start > end) {
    [start, end] = [end, start];
  }
  
  const clampedStart = new Date(
    Math.max(minDate.getTime(), Math.min(maxDate.getTime(), start.getTime()))
  );
  const clampedEnd = new Date(
    Math.max(minDate.getTime(), Math.min(maxDate.getTime(), end.getTime()))
  );
  
  return { start: clampedStart, end: clampedEnd };
}

export function normalizeRange(range: DateRange): DateRange {
  if (range.start <= range.end) {
    return range;
  }
  return { start: range.end, end: range.start };
}

export function aggregateDaily(
  data: CashFlowRecord[],
  range: DateRange | null
): AggregatedData[] {
  const filtered = range
    ? data.filter((r) => {
        const t = parseLocalDate(r.date).getTime();
        return t >= range.start.getTime() && t <= range.end.getTime();
      })
    : data;

  const map = new Map<string, { moneyIn: number; moneyOut: number }>();
  
  for (const record of filtered) {
    const d = parseLocalDate(record.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    
    if (!map.has(key)) {
      map.set(key, { moneyIn: 0, moneyOut: 0 });
    }
    
    const bucket = map.get(key)!;
    bucket.moneyIn += record.moneyIn;
    bucket.moneyOut += record.moneyOut;
  }

  const result = Array.from(map.entries())
    .map(([period, values]) => {
      const date = parseLocalDate(period);
      return {
        period,
        label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        ...values,
      };
    })
    .sort((a, b) => (a.period < b.period ? -1 : 1));

  return result;
}

export function aggregateMonthly(
  data: CashFlowRecord[],
  range: DateRange | null
): AggregatedData[] {
  const filtered = range
    ? data.filter((r) => {
        const t = parseLocalDate(r.date).getTime();
        return t >= range.start.getTime() && t <= range.end.getTime();
      })
    : data;

  const map = new Map<string, { moneyIn: number; moneyOut: number }>();
  
  for (const record of filtered) {
    const d = parseLocalDate(record.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    
    if (!map.has(key)) {
      map.set(key, { moneyIn: 0, moneyOut: 0 });
    }
    
    const bucket = map.get(key)!;
    bucket.moneyIn += record.moneyIn;
    bucket.moneyOut += record.moneyOut;
  }

  const result = Array.from(map.entries())
    .map(([month, values]) => ({
      month,
      ...values,
    }))
    .sort((a, b) => (a.month < b.month ? -1 : 1));

  const years = new Set(result.map(item => item.month.substring(0, 4)));
  const showYear = years.size > 1;

  return result.map(item => {
    const date = parseLocalDate(item.month + '-01');
    const label = showYear 
      ? date.toLocaleDateString('en-US', { month: 'short' }) + " '" + date.getFullYear().toString().slice(-2)
      : date.toLocaleDateString('en-US', { month: 'short' });
    
    return {
      period: item.month,
      label,
      moneyIn: item.moneyIn,
      moneyOut: item.moneyOut,
    };
  });
}

export function aggregateQuarterly(
  data: CashFlowRecord[],
  range: DateRange | null
): AggregatedData[] {
  const filtered = range
    ? data.filter((r) => {
        const t = parseLocalDate(r.date).getTime();
        return t >= range.start.getTime() && t <= range.end.getTime();
      })
    : data;

  const map = new Map<string, { moneyIn: number; moneyOut: number }>();
  
  for (const record of filtered) {
    const d = parseLocalDate(record.date);
    const quarter = Math.floor(d.getMonth() / 3) + 1;
    const key = `${d.getFullYear()}-Q${quarter}`;
    
    if (!map.has(key)) {
      map.set(key, { moneyIn: 0, moneyOut: 0 });
    }
    
    const bucket = map.get(key)!;
    bucket.moneyIn += record.moneyIn;
    bucket.moneyOut += record.moneyOut;
  }

  const result = Array.from(map.entries())
    .map(([period, values]) => ({
      period,
      label: period,
      ...values,
    }))
    .sort((a, b) => (a.period < b.period ? -1 : 1));

  return result;
}

export function aggregateYearly(
  data: CashFlowRecord[],
  range: DateRange | null
): AggregatedData[] {
  const filtered = range
    ? data.filter((r) => {
        const t = parseLocalDate(r.date).getTime();
        return t >= range.start.getTime() && t <= range.end.getTime();
      })
    : data;

  const map = new Map<string, { moneyIn: number; moneyOut: number }>();
  
  for (const record of filtered) {
    const d = parseLocalDate(record.date);
    const key = `${d.getFullYear()}`;
    
    if (!map.has(key)) {
      map.set(key, { moneyIn: 0, moneyOut: 0 });
    }
    
    const bucket = map.get(key)!;
    bucket.moneyIn += record.moneyIn;
    bucket.moneyOut += record.moneyOut;
  }

  const result = Array.from(map.entries())
    .map(([period, values]) => ({
      period,
      label: period,
      ...values,
    }))
    .sort((a, b) => (a.period < b.period ? -1 : 1));

  return result;
}

export function aggregateByCadence(
  data: CashFlowRecord[],
  range: DateRange | null,
  cadence: Cadence
): AggregatedData[] {
  switch (cadence) {
    case 'days':
      return aggregateDaily(data, range);
    case 'monthly':
      return aggregateMonthly(data, range);
    case 'quarterly':
      return aggregateQuarterly(data, range);
    case 'yearly':
      return aggregateYearly(data, range);
    default:
      return aggregateMonthly(data, range);
  }
}

/**
 * Convert Transaction[] to CashFlowRecord[] format.
 */
export function transactionsToCashFlow(transactions: Transaction[]): CashFlowRecord[] {
  const byDate = new Map<string, { moneyIn: number; moneyOut: number }>();
  
  for (const t of transactions) {
    if (t.status === 'failed') continue;
    
    const dateKey = t.date;
    
    if (!byDate.has(dateKey)) {
      byDate.set(dateKey, { moneyIn: 0, moneyOut: 0 });
    }
    
    const bucket = byDate.get(dateKey)!;
    if (t.amount >= 0) {
      bucket.moneyIn += t.amount;
    } else {
      bucket.moneyOut += Math.abs(t.amount);
    }
  }
  
  const records: CashFlowRecord[] = Array.from(byDate.entries()).map(([date, values]) => ({
    date,
    moneyIn: values.moneyIn,
    moneyOut: values.moneyOut,
  }));
  
  records.sort((a, b) => a.date.localeCompare(b.date));
  
  return records;
}

/**
 * Filter transactions by date range.
 */
export function filterTransactionsByDateRange(
  transactions: Transaction[],
  range: DateRange | null
): Transaction[] {
  if (!range) return transactions;
  
  const startTime = range.start.getTime();
  const endTime = range.end.getTime();
  
  return transactions.filter((t) => {
    const transactionDate = parseLocalDate(t.date);
    const transactionTime = transactionDate.getTime();
    
    return transactionTime >= startTime && transactionTime <= endTime;
  });
}

/**
 * Calculate summary values from transactions.
 */
export function calculateTransactionsSummary(transactions: Transaction[]): {
  moneyIn: number;
  moneyOut: number;
  netChange: number;
} {
  let moneyIn = 0;
  let moneyOut = 0;
  
  for (const t of transactions) {
    if (t.status === 'failed') continue;
    
    if (t.amount >= 0) {
      moneyIn += t.amount;
    } else {
      moneyOut += Math.abs(t.amount);
    }
  }
  
  return {
    moneyIn,
    moneyOut,
    netChange: moneyIn - moneyOut,
  };
}

/**
 * Format currency for display
 */
export function insightsFormatCurrency(value: number, showSign = false): string {
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(value));
  
  if (showSign && value < 0) {
    return `–${formatted}`;
  }
  return formatted;
}

/**
 * Get the latest transaction date from a list of transactions.
 */
export function getLatestTransactionDate(transactions: Transaction[]): Date | null {
  if (transactions.length === 0) return null;
  
  let latest = new Date(transactions[0].date);
  for (const t of transactions) {
    const d = new Date(t.date);
    if (d > latest) {
      latest = d;
    }
  }
  return latest;
}

/**
 * Get the earliest transaction date from a list of transactions.
 */
export function getEarliestTransactionDate(transactions: Transaction[]): Date | null {
  if (transactions.length === 0) return null;
  
  let earliest = new Date(transactions[0].date);
  for (const t of transactions) {
    const d = new Date(t.date);
    if (d < earliest) {
      earliest = d;
    }
  }
  return earliest;
}

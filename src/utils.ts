import { DateRange } from "./store";
import { type Transaction } from "./transactions/mockData";
import { type DateShortcut } from "./transactions";

/**
 * Convert a DateShortcut to an actual DateRange.
 * Returns null for 'all-time' (no filtering).
 * 
 * @param shortcut - The date shortcut to convert
 * @param referenceDate - Optional reference date to use as "today" (defaults to actual current date).
 *                        Pass the latest transaction date to make filters relative to your data.
 */
export function dateShortcutToRange(shortcut: DateShortcut, referenceDate?: Date): DateRange | null {
  const now = referenceDate || new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const currentQuarter = Math.floor(currentMonth / 3);

  switch (shortcut) {
    case 'all-time':
      return null;
    
    case 'this-month': {
      const start = new Date(currentYear, currentMonth, 1);
      const end = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59, 999);
      return { start, end };
    }
    
    case 'last-month': {
      const start = new Date(currentYear, currentMonth - 1, 1);
      const end = new Date(currentYear, currentMonth, 0, 23, 59, 59, 999);
      return { start, end };
    }
    
    case 'this-quarter': {
      const quarterStartMonth = currentQuarter * 3;
      const start = new Date(currentYear, quarterStartMonth, 1);
      const end = new Date(currentYear, quarterStartMonth + 3, 0, 23, 59, 59, 999);
      return { start, end };
    }
    
    case 'last-quarter': {
      const lastQuarter = currentQuarter === 0 ? 3 : currentQuarter - 1;
      const lastQuarterYear = currentQuarter === 0 ? currentYear - 1 : currentYear;
      const quarterStartMonth = lastQuarter * 3;
      const start = new Date(lastQuarterYear, quarterStartMonth, 1);
      const end = new Date(lastQuarterYear, quarterStartMonth + 3, 0, 23, 59, 59, 999);
      return { start, end };
    }
    
    case 'this-year': {
      const start = new Date(currentYear, 0, 1);
      const end = new Date(currentYear, 11, 31, 23, 59, 59, 999);
      return { start, end };
    }
    
    case 'custom':
      // Custom ranges are handled separately with from/to dates
      return null;
    
    default:
      return null;
  }
}

/**
 * Get the latest transaction date from a list of transactions.
 * Returns null if no transactions exist.
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
 * Convert custom from/to month strings (YYYY-MM) to a DateRange.
 * Returns null if either date is missing.
 */
export function customDateRangeToRange(from: string, to: string): DateRange | null {
  if (!from || !to) return null;
  
  // Parse YYYY-MM format
  const [fromYear, fromMonth] = from.split('-').map(Number);
  const [toYear, toMonth] = to.split('-').map(Number);
  
  if (isNaN(fromYear) || isNaN(fromMonth) || isNaN(toYear) || isNaN(toMonth)) {
    return null;
  }
  
  const start = new Date(fromYear, fromMonth - 1, 1);
  const end = new Date(toYear, toMonth, 0, 23, 59, 59, 999); // Last day of the month
  
  return { start, end };
}

export function clampRange(
  range: DateRange,
  minDate: Date,
  maxDate: Date
): DateRange {
  let { start, end } = range;
  
  // Normalize: ensure start <= end
  if (start > end) {
    [start, end] = [end, start];
  }
  
  // Clamp to domain
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

export type CashFlowRecord = {
  date: string; // ISO format YYYY-MM-DD
  moneyIn: number;
  moneyOut: number;
};

/**
 * Parse an ISO date string (YYYY-MM-DD) as local time, not UTC.
 * This fixes timezone issues when comparing dates.
 */
function parseLocalDate(dateStr: string): Date {
  // Split the date string and create date in local timezone
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day || 1);
}

export type AggregatedData = {
  period: string; // Format depends on cadence: "2025-01" for monthly, "2025-Q1" for quarterly, "2025" for yearly, "2025-01-15" for daily
  label: string; // Display label: "Jan", "Q1 2025", "2025", "Jan 15"
  moneyIn: number;
  moneyOut: number;
};

export type MonthlyData = AggregatedData; // Keep for backward compatibility

export function aggregateMonthly(
  data: CashFlowRecord[],
  range: DateRange | null
): MonthlyData[] {
  // Filter by range if provided
  const filtered = range
    ? data.filter((r) => {
        const t = parseLocalDate(r.date).getTime();
        return t >= range.start.getTime() && t <= range.end.getTime();
      })
    : data;

  // Group by year-month
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

  // Convert to array and sort
  const result = Array.from(map.entries())
    .map(([month, values]) => ({
      month,
      ...values,
    }))
    .sort((a, b) => (a.month < b.month ? -1 : 1));

  // Determine if we need to show years (data spans multiple years)
  const years = new Set(result.map(item => item.month.substring(0, 4)));
  const showYear = years.size > 1;

  return result.map(item => {
    const date = parseLocalDate(item.month + '-01');
    // Show "Jan '24" format when spanning multiple years, otherwise just "Jan"
    const label = showYear 
      ? date.toLocaleDateString('en-US', { month: 'short' }) + " '" + date.getFullYear().toString().slice(-2)
      : date.toLocaleDateString('en-US', { month: 'short' });
    
    return {
      ...item,
      period: item.month,
      label
    };
  });
}

export function aggregateDaily(
  data: CashFlowRecord[],
  range: DateRange | null
): AggregatedData[] {
  // Filter by range if provided
  const filtered = range
    ? data.filter((r) => {
        const t = parseLocalDate(r.date).getTime();
        return t >= range.start.getTime() && t <= range.end.getTime();
      })
    : data;

  // Group by date
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

  // Convert to array and sort
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

export function aggregateQuarterly(
  data: CashFlowRecord[],
  range: DateRange | null
): AggregatedData[] {
  // Filter by range if provided
  const filtered = range
    ? data.filter((r) => {
        const t = parseLocalDate(r.date).getTime();
        return t >= range.start.getTime() && t <= range.end.getTime();
      })
    : data;

  // Group by year-quarter
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

  // Convert to array and sort
  const result = Array.from(map.entries())
    .map(([period, values]) => ({
      period,
      label: period, // "2025-Q1" format
      ...values,
    }))
    .sort((a, b) => (a.period < b.period ? -1 : 1));

  return result;
}

export function aggregateYearly(
  data: CashFlowRecord[],
  range: DateRange | null
): AggregatedData[] {
  // Filter by range if provided
  const filtered = range
    ? data.filter((r) => {
        const t = parseLocalDate(r.date).getTime();
        return t >= range.start.getTime() && t <= range.end.getTime();
      })
    : data;

  // Group by year
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

  // Convert to array and sort
  const result = Array.from(map.entries())
    .map(([period, values]) => ({
      period,
      label: period, // "2025" format
      ...values,
    }))
    .sort((a, b) => (a.period < b.period ? -1 : 1));

  return result;
}

export function aggregateByCadence(
  data: CashFlowRecord[],
  range: DateRange | null,
  cadence: 'days' | 'monthly' | 'quarterly' | 'yearly'
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

// Generate sample data covering 18 months (legacy - use transactionsToCashFlow instead)
export function generateSampleData(): CashFlowRecord[] {
  const out: CashFlowRecord[] = [];
  const start = new Date("2024-01-01");
  
  for (let i = 0; i < 550; i++) {
    const d = new Date(start.getTime() + i * 24 * 3600 * 1000);
    out.push({
      date: d.toISOString(),
      moneyIn: (Math.sin(i / 20) + 1.2) * 200 + (i % 7 === 0 ? 800 : 0),
      moneyOut: (Math.cos(i / 18) + 1.1) * 180 + (i % 5 === 0 ? 600 : 0),
    });
  }
  
  return out;
}

// ============================================================================
// Transaction-based utilities for binding Transactions and Insights pages
// ============================================================================

/**
 * Convert Transaction[] to CashFlowRecord[] format for use with aggregation functions.
 * Each transaction becomes a daily cash flow record (aggregated by date).
 * Failed transactions are excluded.
 */
export function transactionsToCashFlow(transactions: Transaction[]): CashFlowRecord[] {
  // Group transactions by date
  const byDate = new Map<string, { moneyIn: number; moneyOut: number }>();
  
  for (const t of transactions) {
    // Skip failed transactions
    if (t.status === 'failed') continue;
    
    const dateKey = t.date; // Already in ISO format YYYY-MM-DD
    
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
  
  // Convert to CashFlowRecord array
  const records: CashFlowRecord[] = Array.from(byDate.entries()).map(([date, values]) => ({
    date,
    moneyIn: values.moneyIn,
    moneyOut: values.moneyOut,
  }));
  
  // Sort by date ascending
  records.sort((a, b) => a.date.localeCompare(b.date));
  
  return records;
}

/**
 * Filter transactions by date range.
 * Transaction dates are in ISO format (YYYY-MM-DD).
 */
export function filterTransactionsByDateRange(
  transactions: Transaction[],
  range: DateRange | null
): Transaction[] {
  if (!range) return transactions;
  
  const startTime = range.start.getTime();
  const endTime = range.end.getTime();
  
  return transactions.filter((t) => {
    // Parse the ISO date string as local time to match range comparison
    const transactionDate = parseLocalDate(t.date);
    const transactionTime = transactionDate.getTime();
    
    return transactionTime >= startTime && transactionTime <= endTime;
  });
}

/**
 * Calculate summary values from transactions (moneyIn, moneyOut, netChange).
 * Failed transactions are excluded.
 */
export function calculateTransactionsSummary(transactions: Transaction[]): {
  moneyIn: number;
  moneyOut: number;
  netChange: number;
} {
  let moneyIn = 0;
  let moneyOut = 0;
  
  for (const t of transactions) {
    // Skip failed transactions
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
export function formatCurrency(value: number, showSign = false): string {
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


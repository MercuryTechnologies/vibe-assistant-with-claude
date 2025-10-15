import { DateRange } from "./store";

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
  date: string; // ISO format
  moneyIn: number;
  moneyOut: number;
};

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
        const t = new Date(r.date).getTime();
        return t >= range.start.getTime() && t <= range.end.getTime();
      })
    : data;

  // Group by year-month
  const map = new Map<string, { moneyIn: number; moneyOut: number }>();
  
  for (const record of filtered) {
    const d = new Date(record.date);
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

  return result.map(item => ({
    ...item,
    period: item.month,
    label: new Date(item.month + '-01').toLocaleDateString('en-US', { month: 'short' })
  }));
}

export function aggregateDaily(
  data: CashFlowRecord[],
  range: DateRange | null
): AggregatedData[] {
  // Filter by range if provided
  const filtered = range
    ? data.filter((r) => {
        const t = new Date(r.date).getTime();
        return t >= range.start.getTime() && t <= range.end.getTime();
      })
    : data;

  // Group by date
  const map = new Map<string, { moneyIn: number; moneyOut: number }>();
  
  for (const record of filtered) {
    const d = new Date(record.date);
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
      const date = new Date(period);
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
        const t = new Date(r.date).getTime();
        return t >= range.start.getTime() && t <= range.end.getTime();
      })
    : data;

  // Group by year-quarter
  const map = new Map<string, { moneyIn: number; moneyOut: number }>();
  
  for (const record of filtered) {
    const d = new Date(record.date);
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
        const t = new Date(r.date).getTime();
        return t >= range.start.getTime() && t <= range.end.getTime();
      })
    : data;

  // Group by year
  const map = new Map<string, { moneyIn: number; moneyOut: number }>();
  
  for (const record of filtered) {
    const d = new Date(record.date);
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

// Generate sample data covering 18 months
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


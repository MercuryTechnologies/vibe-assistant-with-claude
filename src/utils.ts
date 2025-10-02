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

export type MonthlyData = {
  month: string; // "2025-01" format
  moneyIn: number;
  moneyOut: number;
};

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

  return result;
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


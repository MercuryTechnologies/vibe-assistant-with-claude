import { create } from "zustand";
import { type LegacyTransaction as Transaction } from "./shared/mockData";

export type DateRange = { start: Date; end: Date };

// Chart display options
export type ChartOptions = {
  showCashflowLine: boolean;
  showBars: boolean;
};

// Combined store for time range and transactions
type AppStore = {
  // Time range state
  timeRange: DateRange | null;
  setTimeRange: (r: DateRange | null) => void;
  
  // Transactions state (single source of truth)
  transactions: Transaction[];
  setTransactions: (t: Transaction[]) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  
  // Chart display options
  chartOptions: ChartOptions;
  setChartOptions: (options: Partial<ChartOptions>) => void;
};

export const useAppStore = create<AppStore>((set) => ({
  // Time range
  timeRange: null,
  setTimeRange: (r) => set({ timeRange: r }),
  
  // Transactions
  transactions: [],
  setTransactions: (t) => set({ transactions: t }),
  updateTransaction: (id, updates) => set((state) => ({
    transactions: state.transactions.map((t) =>
      t.id === id ? { ...t, ...updates } : t
    ),
  })),
  
  // Chart display options (default both visible)
  chartOptions: {
    showCashflowLine: true,
    showBars: true,
  },
  setChartOptions: (options) => set((state) => ({
    chartOptions: { ...state.chartOptions, ...options },
  })),
}));

// Alias for backward compatibility
export const useTimeRangeStore = useAppStore;


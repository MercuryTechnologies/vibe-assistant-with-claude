import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

// ============================================================================
// Types
// ============================================================================

export interface DataSettings {
  // Total balance across all accounts ($100 to $10,000,000)
  totalBalance: number;
  // Cash flow direction: -1 (negative), 0 (neutral), 1 (positive)
  // Stored as -100 to 100 for slider, mapped to transaction generation
  cashFlowDirection: number;
}

interface DataContextValue {
  settings: DataSettings;
  updateSettings: (updates: Partial<DataSettings>) => void;
  // Derived values
  formattedTotalBalance: string;
  cashFlowLabel: string;
  // Account distribution (always adds up to totalBalance)
  getAccountBalances: () => AccountBalance[];
}

export interface AccountBalance {
  id: string;
  name: string;
  balance: number;
  type: 'checking' | 'savings' | 'treasury' | 'credit';
}

// ============================================================================
// Default Values
// ============================================================================

const DEFAULT_SETTINGS: DataSettings = {
  totalBalance: 5000000, // $5M default
  cashFlowDirection: 0, // Neutral
};

// Account distribution percentages (must sum to 1)
const ACCOUNT_DISTRIBUTION = [
  { id: 'treasury', name: 'Treasury', percentage: 0.04, type: 'treasury' as const },
  { id: 'ops-payroll', name: 'Ops / Payroll', percentage: 0.40, type: 'checking' as const },
  { id: 'ap', name: 'AP', percentage: 0.045, type: 'checking' as const },
  { id: 'ar', name: 'AR', percentage: 0.015, type: 'checking' as const },
  { id: 'checking-0297', name: 'Checking ••0297', percentage: 0.27, type: 'checking' as const },
  { id: 'savings-7658', name: 'Savings ••7658', percentage: 0.23, type: 'savings' as const },
];

// ============================================================================
// Context
// ============================================================================

const DataContext = createContext<DataContextValue | null>(null);

// ============================================================================
// Provider
// ============================================================================

export function DataProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<DataSettings>(DEFAULT_SETTINGS);

  const updateSettings = useCallback((updates: Partial<DataSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  }, []);

  // Format balance for display
  const formattedTotalBalance = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(settings.totalBalance);

  // Get cash flow label based on direction
  const getCashFlowLabel = (direction: number): string => {
    if (direction < -33) return 'Negative';
    if (direction > 33) return 'Positive';
    return 'Neutral';
  };

  const cashFlowLabel = getCashFlowLabel(settings.cashFlowDirection);

  // Calculate account balances based on total balance
  const getAccountBalances = useCallback((): AccountBalance[] => {
    return ACCOUNT_DISTRIBUTION.map(account => ({
      id: account.id,
      name: account.name,
      balance: Math.round(settings.totalBalance * account.percentage * 100) / 100,
      type: account.type,
    }));
  }, [settings.totalBalance]);

  const value: DataContextValue = {
    settings,
    updateSettings,
    formattedTotalBalance,
    cashFlowLabel,
    getAccountBalances,
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}

// ============================================================================
// Hook
// ============================================================================

export function useDataSettings() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useDataSettings must be used within a DataProvider');
  }
  return context;
}

// ============================================================================
// Utility Functions
// ============================================================================

// Format a number as currency
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

// Format balance with dollars and cents split
export function formatBalanceParts(amount: number): { dollars: string; cents: string } {
  const totalCents = Math.round(amount * 100);
  const dollars = Math.floor(totalCents / 100).toLocaleString('en-US');
  const cents = String(Math.abs(totalCents % 100)).padStart(2, '0');
  return { dollars, cents };
}

// Format balance for compact display (e.g., "$5.2M")
export function formatCompactBalance(amount: number): string {
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;
  }
  if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(0)}K`;
  }
  return `$${amount.toFixed(0)}`;
}

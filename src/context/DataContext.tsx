import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from 'react';
import accountsData from '@/data/accounts.json';

// ============================================================================
// Types
// ============================================================================

interface Account {
  id: string;
  name: string;
  type: 'checking' | 'savings' | 'treasury';
  balance: number;
  currency: string;
  accountNumber: string;
  routingNumber: string;
  status: string;
  apy?: number;
  purpose?: string;
}

export interface DataSettings {
  // Total balance across all accounts (calculated from actual data)
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
  // Account distribution (from actual data)
  getAccountBalances: () => AccountBalance[];
}

export interface AccountBalance {
  id: string;
  name: string;
  balance: number;
  type: 'checking' | 'savings' | 'treasury' | 'credit';
}

// ============================================================================
// Load Real Account Data
// ============================================================================

const accounts = accountsData.accounts as Account[];
const calculatedTotalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);

// ============================================================================
// Default Values
// ============================================================================

const DEFAULT_SETTINGS: DataSettings = {
  totalBalance: calculatedTotalBalance, // Use actual total from data
  cashFlowDirection: 0, // Neutral
};

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
  const formattedTotalBalance = useMemo(() => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(settings.totalBalance);
  }, [settings.totalBalance]);

  // Get cash flow label based on direction
  const getCashFlowLabel = (direction: number): string => {
    if (direction < -33) return 'Negative';
    if (direction > 33) return 'Positive';
    return 'Neutral';
  };

  const cashFlowLabel = getCashFlowLabel(settings.cashFlowDirection);

  // Return actual account balances from data
  const getAccountBalances = useCallback((): AccountBalance[] => {
    return accounts.map(account => ({
      id: account.id,
      name: account.name,
      balance: account.balance,
      type: account.type,
    }));
  }, []);

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

// =============================================================================
// Shared Data Helpers
// =============================================================================
// Helper functions for working with shared data across the app

import type { Transaction, Card } from '@/types';

/**
 * Calculate total spending for a card based on linked transactions
 * Only counts transactions from the current month
 */
export function getCardSpendingThisMonth(cardId: string, transactions: Transaction[]): number {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  
  return transactions
    .filter(t => {
      if (t.cardId !== cardId) return false;
      if (t.amount >= 0) return false; // Only count debits
      const txDate = new Date(t.date);
      return txDate >= startOfMonth;
    })
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);
}

/**
 * Get transactions for a specific card
 */
export function getCardTransactions(cardId: string, transactions: Transaction[]): Transaction[] {
  return transactions
    .filter(t => t.cardId === cardId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

/**
 * Aggregate transactions by category
 * Returns sorted array of [category, totalAmount] pairs
 */
export function aggregateByCategory(
  transactions: Transaction[],
  direction: 'in' | 'out' | 'all' = 'out'
): Array<{ category: string; amount: number }> {
  const byCategory = transactions.reduce((acc, t) => {
    // Filter by direction
    if (direction === 'in' && t.amount <= 0) return acc;
    if (direction === 'out' && t.amount >= 0) return acc;
    
    const amount = Math.abs(t.amount);
    acc[t.category] = (acc[t.category] || 0) + amount;
    return acc;
  }, {} as Record<string, number>);
  
  return Object.entries(byCategory)
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount);
}

/**
 * Calculate money in, money out, and net change
 */
export function calculateCashflow(transactions: Transaction[]): {
  moneyIn: number;
  moneyOut: number;
  netChange: number;
} {
  const moneyIn = transactions
    .filter(t => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);
  
  const moneyOut = transactions
    .filter(t => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  
  return {
    moneyIn,
    moneyOut,
    netChange: moneyIn - moneyOut,
  };
}

/**
 * Filter transactions by date range
 */
export function filterByDateRange(
  transactions: Transaction[],
  startDate: Date,
  endDate: Date = new Date()
): Transaction[] {
  return transactions.filter(t => {
    const txDate = new Date(t.date);
    return txDate >= startDate && txDate <= endDate;
  });
}

/**
 * Get transactions from the last N days
 */
export function getRecentTransactions(
  transactions: Transaction[],
  days: number
): Transaction[] {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  return filterByDateRange(transactions, startDate);
}

/**
 * Search transactions by merchant, description, or category
 */
export function searchTransactions(
  transactions: Transaction[],
  query: string,
  limit: number = 10
): Transaction[] {
  const q = query.toLowerCase();
  
  const results = transactions.filter(t =>
    t.merchant.toLowerCase().includes(q) ||
    t.description.toLowerCase().includes(q) ||
    t.category.toLowerCase().includes(q)
  );
  
  return results
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);
}

/**
 * Get account name from account ID
 */
export function getAccountName(accountId: string): string {
  const accountNames: Record<string, string> = {
    'acc_001': 'Mercury Checking',
    'acc_002': 'Mercury Treasury',
    'acc_003': 'Operating Expenses',
    'treasury': 'Treasury',
    'ops-payroll': 'Ops / Payroll',
    'ap': 'AP',
    'ar': 'AR',
    'checking-0297': 'Checking ••0297',
    'savings-7658': 'Savings ••7658',
  };
  return accountNames[accountId] || accountId;
}

/**
 * Enrich cards with spending data from transactions
 */
export function enrichCardsWithSpending(
  cards: Card[],
  transactions: Transaction[]
): Array<Card & { spentThisMonth: number }> {
  return cards.map(card => ({
    ...card,
    spentThisMonth: getCardSpendingThisMonth(card.id, transactions),
  }));
}

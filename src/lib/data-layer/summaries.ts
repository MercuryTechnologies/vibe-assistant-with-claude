// =============================================================================
// Data Layer - Summary Functions
// =============================================================================
// Functions for calculating cashflow, runway, spending summaries for AI context

import {
  getTransactions,
  getEmployees,
  getCardsWithSpending,
  getTotalBalance,
} from './index';

import type {
  CashflowSummary,
  CategorySpend,
  MerchantSpend,
  RunwayInfo,
  PayrollSummary,
  CardSpendingSummary,
  RevenueSummary,
  Transaction,
} from './types';

// =============================================================================
// Date Helpers
// =============================================================================

function getDateNDaysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split('T')[0];
}

function getStartOfMonth(date: Date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`;
}

function getStartOfYear(date: Date = new Date()): string {
  return `${date.getFullYear()}-01-01`;
}

// =============================================================================
// Cashflow Summaries
// =============================================================================

/**
 * Get cashflow summary for a given period
 */
export function getCashflowSummary(period: '7d' | '30d' | '90d' | 'mtd' | 'ytd' | 'all'): CashflowSummary {
  let startDate: string;
  let endDate: string = new Date().toISOString().split('T')[0];
  let periodLabel: string;

  switch (period) {
    case '7d':
      startDate = getDateNDaysAgo(7);
      periodLabel = 'Last 7 days';
      break;
    case '30d':
      startDate = getDateNDaysAgo(30);
      periodLabel = 'Last 30 days';
      break;
    case '90d':
      startDate = getDateNDaysAgo(90);
      periodLabel = 'Last 90 days';
      break;
    case 'mtd':
      startDate = getStartOfMonth();
      periodLabel = 'Month to date';
      break;
    case 'ytd':
      startDate = getStartOfYear();
      periodLabel = 'Year to date';
      break;
    case 'all':
    default:
      startDate = '2000-01-01';
      periodLabel = 'All time';
      break;
  }

  const transactions = getTransactions({ startDate, endDate });
  
  const moneyIn = transactions
    .filter(t => t.amount > 0 && t.type !== 'transfer')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const moneyOut = transactions
    .filter(t => t.amount < 0 && t.type !== 'transfer')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  return {
    period: periodLabel,
    startDate,
    endDate,
    moneyIn,
    moneyOut,
    net: moneyIn - moneyOut,
    transactionCount: transactions.filter(t => t.type !== 'transfer').length,
  };
}

/**
 * Get cashflow for a custom date range
 */
export function getCashflowForDateRange(startDate: string, endDate: string): CashflowSummary {
  const transactions = getTransactions({ startDate, endDate });
  
  const moneyIn = transactions
    .filter(t => t.amount > 0 && t.type !== 'transfer')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const moneyOut = transactions
    .filter(t => t.amount < 0 && t.type !== 'transfer')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  return {
    period: `${startDate} to ${endDate}`,
    startDate,
    endDate,
    moneyIn,
    moneyOut,
    net: moneyIn - moneyOut,
    transactionCount: transactions.filter(t => t.type !== 'transfer').length,
  };
}

// =============================================================================
// Spending Analysis
// =============================================================================

/**
 * Get top spending categories
 */
export function getTopSpendingCategories(limit: number = 10, period: '30d' | '90d' | 'ytd' | 'all' = '30d'): CategorySpend[] {
  let startDate: string;
  
  switch (period) {
    case '30d':
      startDate = getDateNDaysAgo(30);
      break;
    case '90d':
      startDate = getDateNDaysAgo(90);
      break;
    case 'ytd':
      startDate = getStartOfYear();
      break;
    default:
      startDate = '2000-01-01';
  }

  const transactions = getTransactions({ startDate })
    .filter(t => t.amount < 0 && t.type !== 'transfer');

  const totalSpend = transactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const categoryMap = new Map<string, { amount: number; count: number }>();

  for (const t of transactions) {
    const category = t.category || 'Uncategorized';
    const current = categoryMap.get(category) || { amount: 0, count: 0 };
    categoryMap.set(category, {
      amount: current.amount + Math.abs(t.amount),
      count: current.count + 1,
    });
  }

  return Array.from(categoryMap.entries())
    .map(([category, data]) => ({
      category,
      amount: data.amount,
      transactionCount: data.count,
      percentOfTotal: totalSpend > 0 ? (data.amount / totalSpend) * 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, limit);
}

/**
 * Get top merchants by spend
 */
export function getTopMerchants(limit: number = 10, period: '30d' | '90d' | 'ytd' | 'all' = '30d'): MerchantSpend[] {
  let startDate: string;
  
  switch (period) {
    case '30d':
      startDate = getDateNDaysAgo(30);
      break;
    case '90d':
      startDate = getDateNDaysAgo(90);
      break;
    case 'ytd':
      startDate = getStartOfYear();
      break;
    default:
      startDate = '2000-01-01';
  }

  const transactions = getTransactions({ startDate })
    .filter(t => t.amount < 0 && t.type !== 'transfer');

  const merchantMap = new Map<string, { amount: number; count: number; category: string }>();

  for (const t of transactions) {
    const current = merchantMap.get(t.merchant) || { amount: 0, count: 0, category: t.category };
    merchantMap.set(t.merchant, {
      amount: current.amount + Math.abs(t.amount),
      count: current.count + 1,
      category: t.category,
    });
  }

  return Array.from(merchantMap.entries())
    .map(([merchant, data]) => ({
      merchant,
      amount: data.amount,
      transactionCount: data.count,
      category: data.category,
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, limit);
}

/**
 * Get spending for a specific merchant
 */
export function getMerchantSpending(merchantName: string): {
  total: number;
  transactions: Transaction[];
  averageTransaction: number;
  lastTransaction: Transaction | null;
} {
  const transactions = getTransactions()
    .filter(t => t.merchant.toLowerCase().includes(merchantName.toLowerCase()))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const total = transactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);

  return {
    total,
    transactions,
    averageTransaction: transactions.length > 0 ? total / transactions.length : 0,
    lastTransaction: transactions[0] || null,
  };
}

// =============================================================================
// Runway & Burn Rate
// =============================================================================

/**
 * Calculate runway (months of cash remaining)
 */
export function getRunwayEstimate(): RunwayInfo {
  const totalBalance = getTotalBalance();
  
  // Calculate average monthly burn over last 3 months
  const threeMonthsAgo = getDateNDaysAgo(90);
  const transactions = getTransactions({ startDate: threeMonthsAgo })
    .filter(t => t.amount < 0 && t.type !== 'transfer');

  const totalSpend = transactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
  const monthlyBurn = totalSpend / 3;

  // Compare to previous 3 months for trend
  const sixMonthsAgo = getDateNDaysAgo(180);
  const prevTransactions = getTransactions({ 
    startDate: sixMonthsAgo, 
    endDate: threeMonthsAgo 
  }).filter(t => t.amount < 0 && t.type !== 'transfer');

  const prevTotalSpend = prevTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
  const prevMonthlyBurn = prevTotalSpend / 3;

  let burnTrend: 'increasing' | 'stable' | 'decreasing';
  if (monthlyBurn > prevMonthlyBurn * 1.1) {
    burnTrend = 'increasing';
  } else if (monthlyBurn < prevMonthlyBurn * 0.9) {
    burnTrend = 'decreasing';
  } else {
    burnTrend = 'stable';
  }

  return {
    totalBalance,
    monthlyBurn,
    monthsRemaining: monthlyBurn > 0 ? Math.floor(totalBalance / monthlyBurn) : 999,
    burnTrend,
    lastCalculated: new Date().toISOString(),
  };
}

// =============================================================================
// Payroll
// =============================================================================

/**
 * Get payroll summary
 */
export function getPayrollSummary(): PayrollSummary {
  const payrollTransactions = getTransactions({ categories: ['Payroll'] })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const ytdTransactions = payrollTransactions.filter(t => 
    t.date >= getStartOfYear()
  );

  const totalYTD = ytdTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
  const averagePayroll = payrollTransactions.length > 0
    ? payrollTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0) / payrollTransactions.length
    : 0;

  const employees = getEmployees();

  return {
    lastPayrollDate: payrollTransactions[0]?.date || '',
    lastPayrollAmount: payrollTransactions[0] ? Math.abs(payrollTransactions[0].amount) : 0,
    averagePayroll,
    totalYTD,
    employeeCount: employees.length,
  };
}

// =============================================================================
// Card Spending
// =============================================================================

/**
 * Get card spending summaries
 */
export function getCardSpendingSummaries(): CardSpendingSummary[] {
  const cardsWithSpending = getCardsWithSpending();

  return cardsWithSpending.map(card => ({
    cardId: card.id,
    cardholder: card.cardholder,
    cardName: card.cardName,
    spentThisMonth: card.spentThisMonth,
    monthlyLimit: card.monthlyLimit,
    percentUsed: card.monthlyLimit > 0 ? (card.spentThisMonth / card.monthlyLimit) * 100 : 0,
    isOverBudget: card.spentThisMonth > card.monthlyLimit,
  }));
}

/**
 * Get cards that are over budget
 */
export function getOverBudgetCards(): CardSpendingSummary[] {
  return getCardSpendingSummaries().filter(c => c.isOverBudget);
}

/**
 * Get cards sorted by spending (highest first)
 */
export function getCardsBySpending(): CardSpendingSummary[] {
  return getCardSpendingSummaries().sort((a, b) => b.spentThisMonth - a.spentThisMonth);
}

// =============================================================================
// Revenue
// =============================================================================

/**
 * Get revenue summary
 */
export function getRevenueSummary(): RevenueSummary {
  const now = new Date();
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const lastMonth = now.getMonth() === 0
    ? `${now.getFullYear() - 1}-12`
    : `${now.getFullYear()}-${String(now.getMonth()).padStart(2, '0')}`;

  const revenueTransactions = getTransactions({ categories: ['Revenue'] });

  const thisMonthRevenue = revenueTransactions
    .filter(t => t.date.startsWith(thisMonth))
    .reduce((sum, t) => sum + t.amount, 0);

  const lastMonthRevenue = revenueTransactions
    .filter(t => t.date.startsWith(lastMonth))
    .reduce((sum, t) => sum + t.amount, 0);

  const last30DaysRevenue = revenueTransactions
    .filter(t => t.date >= getDateNDaysAgo(30))
    .reduce((sum, t) => sum + t.amount, 0);

  const ytdRevenue = revenueTransactions
    .filter(t => t.date >= getStartOfYear())
    .reduce((sum, t) => sum + t.amount, 0);

  // Calculate top customers from enterprise deals
  const customerMap = new Map<string, number>();
  for (const t of revenueTransactions) {
    if (t.merchant !== 'Stripe') { // Skip aggregated Stripe payouts
      const current = customerMap.get(t.merchant) || 0;
      customerMap.set(t.merchant, current + t.amount);
    }
  }

  const topCustomers = Array.from(customerMap.entries())
    .map(([name, amount]) => ({ name, amount }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  return {
    currentMRR: thisMonthRevenue,
    previousMRR: lastMonthRevenue,
    mrrGrowth: thisMonthRevenue - lastMonthRevenue,
    mrrGrowthPercent: lastMonthRevenue > 0 ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0,
    totalRevenueLast30Days: last30DaysRevenue,
    totalRevenueYTD: ytdRevenue,
    topCustomers,
  };
}

// =============================================================================
// Wire Transfers
// =============================================================================

/**
 * Get wire transfer transactions
 */
export function getWireTransactions(limit: number = 20): Transaction[] {
  // In our data, wire transfers are typically large enterprise payments
  // We'll identify them by amount threshold or specific merchants
  return getTransactions()
    .filter(t => 
      t.type === 'credit' && 
      t.amount >= 50000 && 
      t.category === 'Revenue'
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);
}

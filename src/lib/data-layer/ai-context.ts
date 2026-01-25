// =============================================================================
// Data Layer - AI Context Builder
// =============================================================================
// Functions to build context strings for Claude to understand the financial data

import {
  getCompany,
  getAccounts,
  getTotalBalance,
  getRecentTransactions,
  getCardsWithSpending,
  getEmployees,
  getIncompleteTasks,
} from './index';

import {
  getCashflowSummary,
  getTopSpendingCategories,
  getRunwayEstimate,
  getPayrollSummary,
  getCardSpendingSummaries,
  getRevenueSummary,
  getTopMerchants,
} from './summaries';

// =============================================================================
// Formatting Helpers
// =============================================================================

function formatCurrency(amount: number): string {
  const prefix = amount < 0 ? '-' : '';
  const absAmount = Math.abs(amount);
  
  if (absAmount >= 1000000) {
    return `${prefix}$${(absAmount / 1000000).toFixed(2)}M`;
  }
  if (absAmount >= 1000) {
    return `${prefix}$${(absAmount / 1000).toFixed(1)}K`;
  }
  return `${prefix}$${absAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// =============================================================================
// Full AI Context
// =============================================================================

/**
 * Build comprehensive AI context with all available data
 * Use this for complex queries that may need deep data access
 */
export function buildAIContext(): string {
  const company = getCompany();
  const accounts = getAccounts();
  const totalBalance = getTotalBalance();
  const recentTxns = getRecentTransactions(15);
  const cashflow30d = getCashflowSummary('30d');
  const cashflowYTD = getCashflowSummary('ytd');
  const runway = getRunwayEstimate();
  const topCategories = getTopSpendingCategories(8, '30d');
  const topMerchants = getTopMerchants(10, '30d');
  const payroll = getPayrollSummary();
  const cardSpending = getCardSpendingSummaries();
  const revenue = getRevenueSummary();
  const employees = getEmployees();
  const tasks = getIncompleteTasks();

  return `
=== COMPANY PROFILE ===
Company: ${company.name} (${company.legalName})
Industry: ${company.industry}
EIN: ${company.ein}
Founded: ${formatDate(company.founded)}
Location: ${company.address.city}, ${company.address.state}

=== FUNDING ===
Stage: ${company.funding.stage}
Total Raised: ${formatCurrency(company.funding.totalRaised)}
Last Round: ${formatCurrency(company.funding.lastRoundAmount)} on ${formatDate(company.funding.lastRoundDate)}
Lead Investor: ${company.funding.investors.find(i => i.type === 'Lead')?.name || 'N/A'}

=== KEY METRICS ===
Employees: ${company.metrics.employeeCount}
Current MRR: ${formatCurrency(company.metrics.currentMRR)}
MRR Growth Rate: ${(company.metrics.mrrGrowthRate * 100).toFixed(0)}%
Monthly Burn Rate: ${formatCurrency(company.metrics.monthlyBurnRate)}
Customers: ${company.metrics.customersCount}

=== ACCOUNTS (Total: ${formatCurrency(totalBalance)}) ===
${accounts.map(a => `• ${a.name} (${a.type}): ${formatCurrency(a.balance)}${a.apy ? ` @ ${a.apy}% APY` : ''}`).join('\n')}

=== RUNWAY ===
Months Remaining: ${runway.monthsRemaining} months
Monthly Burn: ${formatCurrency(runway.monthlyBurn)}
Burn Trend: ${runway.burnTrend}

=== CASHFLOW (Last 30 Days) ===
Money In: ${formatCurrency(cashflow30d.moneyIn)}
Money Out: ${formatCurrency(cashflow30d.moneyOut)}
Net: ${formatCurrency(cashflow30d.net)}
Transactions: ${cashflow30d.transactionCount}

=== CASHFLOW (Year to Date) ===
Money In: ${formatCurrency(cashflowYTD.moneyIn)}
Money Out: ${formatCurrency(cashflowYTD.moneyOut)}
Net: ${formatCurrency(cashflowYTD.net)}

=== REVENUE ===
Current Month: ${formatCurrency(revenue.currentMRR)}
Previous Month: ${formatCurrency(revenue.previousMRR)}
MRR Growth: ${formatCurrency(revenue.mrrGrowth)} (${revenue.mrrGrowthPercent.toFixed(1)}%)
YTD Revenue: ${formatCurrency(revenue.totalRevenueYTD)}
Top Customers: ${revenue.topCustomers.map(c => `${c.name} (${formatCurrency(c.amount)})`).join(', ')}

=== TOP SPENDING CATEGORIES (30 Days) ===
${topCategories.map(c => `• ${c.category}: ${formatCurrency(c.amount)} (${c.percentOfTotal.toFixed(1)}%, ${c.transactionCount} txns)`).join('\n')}

=== TOP MERCHANTS (30 Days) ===
${topMerchants.map(m => `• ${m.merchant}: ${formatCurrency(m.amount)} (${m.category})`).join('\n')}

=== PAYROLL ===
Last Payroll: ${formatDate(payroll.lastPayrollDate)} - ${formatCurrency(payroll.lastPayrollAmount)}
Average Payroll: ${formatCurrency(payroll.averagePayroll)}
YTD Total: ${formatCurrency(payroll.totalYTD)}
Employees: ${payroll.employeeCount}

=== CARD SPENDING (This Month) ===
${cardSpending.map(c => `• ${c.cardholder} (${c.cardName}): ${formatCurrency(c.spentThisMonth)} of ${formatCurrency(c.monthlyLimit)} limit (${c.percentUsed.toFixed(0)}%)${c.isOverBudget ? ' ⚠️ OVER BUDGET' : ''}`).join('\n')}

=== RECENT TRANSACTIONS ===
${recentTxns.map(t => `• ${formatDate(t.date)}: ${t.merchant} ${t.amount >= 0 ? '+' : ''}${formatCurrency(t.amount)} (${t.category})`).join('\n')}

=== EMPLOYEES (${employees.length} total) ===
Departments: ${[...new Set(employees.map(e => e.department))].join(', ')}
With Cards: ${employees.filter(e => e.cardId).length}
Admins: ${employees.filter(e => e.isAdmin).length}

=== PENDING TASKS (${tasks.length}) ===
${tasks.slice(0, 5).map(t => `• [${t.type}] ${t.description}`).join('\n')}
${tasks.length > 5 ? `... and ${tasks.length - 5} more` : ''}
`.trim();
}

// =============================================================================
// Compact AI Context
// =============================================================================

/**
 * Build a compact AI context for simpler queries
 * Uses less tokens while still providing key information
 */
export function buildCompactAIContext(): string {
  const company = getCompany();
  const accounts = getAccounts();
  const totalBalance = getTotalBalance();
  const cashflow30d = getCashflowSummary('30d');
  const runway = getRunwayEstimate();
  const topCategories = getTopSpendingCategories(5, '30d');
  const recentTxns = getRecentTransactions(5);

  return `
COMPANY: ${company.name} | ${company.funding.stage} ($${(company.funding.totalRaised / 1000000).toFixed(0)}M raised) | ${company.metrics.employeeCount} employees

ACCOUNTS (Total: ${formatCurrency(totalBalance)}):
${accounts.map(a => `${a.name}: ${formatCurrency(a.balance)}`).join(' | ')}

RUNWAY: ${runway.monthsRemaining} months (burn: ${formatCurrency(runway.monthlyBurn)}/mo, trend: ${runway.burnTrend})

CASHFLOW (30d): In ${formatCurrency(cashflow30d.moneyIn)} | Out ${formatCurrency(cashflow30d.moneyOut)} | Net ${formatCurrency(cashflow30d.net)}

TOP SPEND: ${topCategories.map(c => `${c.category} ${formatCurrency(c.amount)}`).join(', ')}

RECENT:
${recentTxns.map(t => `${t.date}: ${t.merchant} ${formatCurrency(t.amount)}`).join('\n')}
`.trim();
}

// =============================================================================
// Topic-Specific Context Builders
// =============================================================================

/**
 * Build context specifically for balance/account queries
 */
export function buildAccountsContext(): string {
  const accounts = getAccounts();
  const totalBalance = getTotalBalance();

  return `
ACCOUNTS SUMMARY (Total: ${formatCurrency(totalBalance)}):
${accounts.map(a => `• ${a.name}
  Type: ${a.type}
  Balance: ${formatCurrency(a.balance)}
  Account: ${a.accountNumber}
  ${a.apy ? `APY: ${a.apy}%` : ''}
  Purpose: ${a.purpose || 'General'}
`).join('\n')}
`.trim();
}

/**
 * Build context specifically for transaction queries
 */
export function buildTransactionsContext(limit: number = 20): string {
  const recentTxns = getRecentTransactions(limit);
  const cashflow30d = getCashflowSummary('30d');
  const topCategories = getTopSpendingCategories(5, '30d');

  return `
RECENT TRANSACTIONS (Last ${limit}):
${recentTxns.map(t => `${t.date} | ${t.merchant} | ${formatCurrency(t.amount)} | ${t.category} | ${t.status}`).join('\n')}

30-DAY SUMMARY:
Money In: ${formatCurrency(cashflow30d.moneyIn)}
Money Out: ${formatCurrency(cashflow30d.moneyOut)}
Net: ${formatCurrency(cashflow30d.net)}
Transaction Count: ${cashflow30d.transactionCount}

TOP SPENDING CATEGORIES:
${topCategories.map(c => `${c.category}: ${formatCurrency(c.amount)} (${c.transactionCount} transactions)`).join('\n')}
`.trim();
}

/**
 * Build context specifically for card spending queries
 */
export function buildCardsContext(): string {
  const cards = getCardsWithSpending();
  const cardSummaries = getCardSpendingSummaries();
  const overBudget = cardSummaries.filter(c => c.isOverBudget);

  return `
CARDS (${cards.length} total):
${cards.map(c => `• ${c.cardholder} - ${c.cardName} (••${c.cardNumber})
  Spent: ${formatCurrency(c.spentThisMonth)} of ${formatCurrency(c.monthlyLimit)} limit
  Account: ${c.accountId}
  Status: ${c.status}
  ${c.spentThisMonth > c.monthlyLimit ? '⚠️ OVER BUDGET' : ''}
`).join('\n')}

${overBudget.length > 0 ? `
OVER BUDGET CARDS:
${overBudget.map(c => `• ${c.cardholder}: ${formatCurrency(c.spentThisMonth)} spent (limit: ${formatCurrency(c.monthlyLimit)})`).join('\n')}
` : 'No cards are currently over budget.'}
`.trim();
}

/**
 * Build context specifically for payroll queries
 */
export function buildPayrollContext(): string {
  const payroll = getPayrollSummary();
  const employees = getEmployees();
  const byDept = new Map<string, number>();
  
  for (const emp of employees) {
    const current = byDept.get(emp.department) || 0;
    byDept.set(emp.department, current + 1);
  }

  return `
PAYROLL SUMMARY:
Last Payroll: ${formatDate(payroll.lastPayrollDate)}
Last Amount: ${formatCurrency(payroll.lastPayrollAmount)}
Average Payroll: ${formatCurrency(payroll.averagePayroll)}
YTD Total: ${formatCurrency(payroll.totalYTD)}

EMPLOYEES (${employees.length} total):
${Array.from(byDept.entries()).map(([dept, count]) => `• ${dept}: ${count} employees`).join('\n')}

SALARY RANGE:
Highest: ${formatCurrency(Math.max(...employees.map(e => e.salary)))}
Lowest: ${formatCurrency(Math.min(...employees.map(e => e.salary)))}
Average: ${formatCurrency(employees.reduce((sum, e) => sum + e.salary, 0) / employees.length)}
`.trim();
}

/**
 * Build context specifically for runway/burn rate queries
 */
export function buildRunwayContext(): string {
  const runway = getRunwayEstimate();
  const cashflow30d = getCashflowSummary('30d');
  const cashflow90d = getCashflowSummary('90d');
  const topCategories = getTopSpendingCategories(5, '30d');

  return `
RUNWAY ANALYSIS:
Total Balance: ${formatCurrency(runway.totalBalance)}
Monthly Burn Rate: ${formatCurrency(runway.monthlyBurn)}
Months Remaining: ${runway.monthsRemaining} months
Burn Trend: ${runway.burnTrend}

CASHFLOW COMPARISON:
Last 30 Days: Net ${formatCurrency(cashflow30d.net)} (In: ${formatCurrency(cashflow30d.moneyIn)}, Out: ${formatCurrency(cashflow30d.moneyOut)})
Last 90 Days: Net ${formatCurrency(cashflow90d.net)} (In: ${formatCurrency(cashflow90d.moneyIn)}, Out: ${formatCurrency(cashflow90d.moneyOut)})

TOP EXPENSE CATEGORIES:
${topCategories.map(c => `• ${c.category}: ${formatCurrency(c.amount)}/mo`).join('\n')}
`.trim();
}

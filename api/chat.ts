// =============================================================================
// Chat API Endpoint with SSE Streaming - Using Unified Data Layer
// =============================================================================
// Vercel Serverless Function with two-tier model routing and real-time streaming
// Data is imported from the unified data layer JSON files

import type { VercelRequest, VercelResponse } from '@vercel/node'
import Anthropic from '@anthropic-ai/sdk'

// Import unified data from JSON files
import companyData from '../src/data/company.json' with { type: 'json' }
import accountsData from '../src/data/accounts.json' with { type: 'json' }
import transactionsData from '../src/data/transactions.json' with { type: 'json' }
import cardsData from '../src/data/cards.json' with { type: 'json' }
import employeesData from '../src/data/employees.json' with { type: 'json' }
import recipientsData from '../src/data/recipients.json' with { type: 'json' }
import tasksData from '../src/data/tasks.json' with { type: 'json' }

// =============================================================================
// Type Definitions
// =============================================================================

interface Company {
  id: string
  name: string
  legalName: string
  type: string
  ein: string
  industry: string
  website: string
  founded: string
  address: {
    street: string
    city: string
    state: string
    zip: string
    country: string
  }
  funding: {
    stage: string
    totalRaised: number
    lastRoundAmount: number
    lastRoundDate: string
    investors: Array<{ name: string; amount: number; type: string }>
  }
  metrics: {
    employeeCount: number
    monthlyBurnRate: number
    currentMRR: number
    mrrGrowthRate: number
    customersCount: number
  }
  bankingStartDate: string
}

interface Account {
  id: string
  name: string
  type: 'checking' | 'savings' | 'treasury'
  balance: number
  currency: string
  accountNumber: string
  routingNumber: string
  status: 'active' | 'inactive' | 'pending'
  apy?: number
  purpose?: string
}

interface Transaction {
  id: string
  description: string
  merchant: string
  amount: number
  type: 'credit' | 'debit' | 'transfer'
  date: string
  category: string
  status: 'completed' | 'pending' | 'failed'
  accountId: string
  cardId?: string
  hasAttachment?: boolean
}

interface Card {
  id: string
  cardholder: string
  employeeId: string
  cardName: string
  cardNumber: string
  nickname?: string
  monthlyLimit: number
  type: string
  accountId: string
  status: 'active' | 'frozen' | 'cancelled'
  billingAddress: {
    street: string
    city: string
    state: string
    zip: string
  }
}

interface Employee {
  id: string
  firstName: string
  lastName: string
  email: string
  role: string
  department: string
  startDate: string
  salary: number
  cardId: string | null
  isAdmin: boolean
}

interface Recipient {
  id: string
  name: string
  initials: string
  type: 'vendor' | 'client' | 'contractor' | 'investor' | 'internal'
  category: string
  status: 'active' | 'inactive' | 'pending'
  lastPaid?: string
  totalPaid?: number
  totalReceived?: number
}

// =============================================================================
// DATA ACCESS FUNCTIONS
// =============================================================================

function getCompany(): Company {
  return companyData.company as Company
}

function getAccounts(): Account[] {
  return accountsData.accounts as Account[]
}

function getTotalBalance(): number {
  return getAccounts().reduce((sum, a) => sum + a.balance, 0)
}

function getTransactions(filters?: { 
  startDate?: string
  endDate?: string
  categories?: string[]
  merchants?: string[]
  type?: string
  cardId?: string
  status?: 'completed' | 'pending' | 'failed'
  limit?: number
}): Transaction[] {
  let txns = transactionsData.transactions as Transaction[]

  if (filters?.startDate) {
    txns = txns.filter(t => t.date >= filters.startDate!)
  }
  if (filters?.endDate) {
    txns = txns.filter(t => t.date <= filters.endDate!)
  }
  if (filters?.categories && filters.categories.length > 0) {
    const cats = filters.categories.map(c => c.toLowerCase())
    txns = txns.filter(t => cats.includes(t.category.toLowerCase()))
  }
  if (filters?.merchants && filters.merchants.length > 0) {
    const merchants = filters.merchants.map(m => m.toLowerCase())
    txns = txns.filter(t => merchants.some(m => t.merchant.toLowerCase().includes(m)))
  }
  if (filters?.type) {
    txns = txns.filter(t => t.type === filters.type)
  }
  if (filters?.cardId) {
    txns = txns.filter(t => t.cardId === filters.cardId)
  }
  if (filters?.status) {
    txns = txns.filter(t => t.status === filters.status)
  }
  if (filters?.limit) {
    txns = txns.slice(0, filters.limit)
  }

  return txns
}

function getRecentTransactions(limit: number = 10): Transaction[] {
  return [...getTransactions()]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit)
}

function searchTransactions(query: string, limit: number = 20): Transaction[] {
  const q = query.toLowerCase()
  return getTransactions()
    .filter(t =>
      t.merchant.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q)
    )
    .slice(0, limit)
}

function getCards(): Card[] {
  return cardsData.cards as Card[]
}

function getCardsWithSpending(): Array<Card & { spentThisMonth: number; spentLastMonth: number }> {
  const cards = getCards()
  const now = new Date()
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const lastMonth = now.getMonth() === 0
    ? `${now.getFullYear() - 1}-12`
    : `${now.getFullYear()}-${String(now.getMonth()).padStart(2, '0')}`

  return cards.map(card => {
    const cardTxns = getTransactions({ cardId: card.id })
    const thisMonthTxns = cardTxns.filter(t => t.date.startsWith(thisMonth))
    const lastMonthTxns = cardTxns.filter(t => t.date.startsWith(lastMonth))

    const spentThisMonth = thisMonthTxns
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0)

    const spentLastMonth = lastMonthTxns
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0)

    return { ...card, spentThisMonth, spentLastMonth }
  })
}

function getEmployees(): Employee[] {
  return employeesData.employees as Employee[]
}

function getRecipients(): Recipient[] {
  return recipientsData.recipients as Recipient[]
}

// =============================================================================
// SUMMARY FUNCTIONS
// =============================================================================

function getDateNDaysAgo(days: number): string {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return date.toISOString().split('T')[0]
}

function getCashflowSummary(period: '7d' | '30d' | '90d'): {
  moneyIn: number
  moneyOut: number
  net: number
  transactionCount: number
} {
  const days = period === '7d' ? 7 : period === '30d' ? 30 : 90
  const startDate = getDateNDaysAgo(days)
  const txns = getTransactions({ startDate })
    .filter(t => t.type !== 'transfer')

  const moneyIn = txns
    .filter(t => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0)

  const moneyOut = txns
    .filter(t => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0)

  return {
    moneyIn,
    moneyOut,
    net: moneyIn - moneyOut,
    transactionCount: txns.length,
  }
}

function getTopSpendingCategories(limit: number = 5, period: '30d' | '90d' = '30d'): Array<{
  category: string
  amount: number
  count: number
  percentOfTotal: number
}> {
  const days = period === '30d' ? 30 : 90
  const startDate = getDateNDaysAgo(days)
  const txns = getTransactions({ startDate })
    .filter(t => t.amount < 0 && t.type !== 'transfer')

  const totalSpend = txns.reduce((sum, t) => sum + Math.abs(t.amount), 0)
  const categoryMap = new Map<string, { amount: number; count: number }>()

  for (const t of txns) {
    const current = categoryMap.get(t.category) || { amount: 0, count: 0 }
    categoryMap.set(t.category, {
      amount: current.amount + Math.abs(t.amount),
      count: current.count + 1,
    })
  }

  return Array.from(categoryMap.entries())
    .map(([category, data]) => ({ 
      category, 
      amount: data.amount, 
      count: data.count,
      percentOfTotal: totalSpend > 0 ? (data.amount / totalSpend) * 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, limit)
}

function getRunwayEstimate(): { monthsRemaining: number; monthlyBurn: number } {
  const totalBalance = getTotalBalance()
  const cashflow = getCashflowSummary('90d')
  const monthlyBurn = cashflow.moneyOut / 3

  return {
    monthsRemaining: monthlyBurn > 0 ? Math.floor(totalBalance / monthlyBurn) : 999,
    monthlyBurn,
  }
}

function getWireTransactions(limit: number = 10): Transaction[] {
  // Wire transactions are typically large enterprise payments
  return getTransactions()
    .filter(t => t.type === 'credit' && t.amount >= 50000 && t.category === 'Revenue')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit)
}

function getMerchantSpending(merchantName: string): { 
  total: number
  transactions: Transaction[]
  averageTransaction: number
  lastTransaction: Transaction | null 
} {
  const txns = searchTransactions(merchantName, 50)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  const total = txns.reduce((sum, t) => sum + Math.abs(t.amount), 0)
  return { 
    total, 
    transactions: txns, 
    averageTransaction: txns.length > 0 ? total / txns.length : 0,
    lastTransaction: txns[0] || null
  }
}

function getTopMerchants(limit: number = 10, period: '30d' | '90d' = '30d'): Array<{
  merchant: string
  amount: number
  transactionCount: number
  category: string
}> {
  const startDate = getDateNDaysAgo(period === '30d' ? 30 : 90)
  const transactions = getTransactions({ startDate })
    .filter(t => t.amount < 0)

  const merchantMap = new Map<string, { amount: number; count: number; category: string }>()

  for (const t of transactions) {
    const current = merchantMap.get(t.merchant) || { amount: 0, count: 0, category: t.category }
    merchantMap.set(t.merchant, {
      amount: current.amount + Math.abs(t.amount),
      count: current.count + 1,
      category: t.category,
    })
  }

  return Array.from(merchantMap.entries())
    .map(([merchant, data]) => ({
      merchant,
      amount: data.amount,
      transactionCount: data.count,
      category: data.category,
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, limit)
}

function getRevenueSummary(): {
  currentMRR: number
  previousMRR: number
  mrrGrowth: number
  mrrGrowthPercent: number
  totalRevenueLast30Days: number
  totalRevenueYTD: number
  topCustomers: Array<{ name: string; amount: number }>
} {
  const now = new Date()
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const lastMonth = now.getMonth() === 0
    ? `${now.getFullYear() - 1}-12`
    : `${now.getFullYear()}-${String(now.getMonth()).padStart(2, '0')}`
  const yearStart = `${now.getFullYear()}-01-01`
  const thirtyDaysAgo = getDateNDaysAgo(30)

  const allRevenue = getTransactions({ categories: ['Revenue'] })

  const thisMonthRevenue = allRevenue
    .filter(t => t.date.startsWith(thisMonth))
    .reduce((sum, t) => sum + t.amount, 0)

  const lastMonthRevenue = allRevenue
    .filter(t => t.date.startsWith(lastMonth))
    .reduce((sum, t) => sum + t.amount, 0)

  const last30DaysRevenue = allRevenue
    .filter(t => t.date >= thirtyDaysAgo)
    .reduce((sum, t) => sum + t.amount, 0)

  const ytdRevenue = allRevenue
    .filter(t => t.date >= yearStart)
    .reduce((sum, t) => sum + t.amount, 0)

  // Get top customers
  const customerMap = new Map<string, number>()
  for (const t of allRevenue) {
    if (t.merchant !== 'Stripe') {
      const current = customerMap.get(t.merchant) || 0
      customerMap.set(t.merchant, current + t.amount)
    }
  }

  const topCustomers = Array.from(customerMap.entries())
    .map(([name, amount]) => ({ name, amount }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5)

  return {
    currentMRR: thisMonthRevenue,
    previousMRR: lastMonthRevenue,
    mrrGrowth: thisMonthRevenue - lastMonthRevenue,
    mrrGrowthPercent: lastMonthRevenue > 0 ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0,
    totalRevenueLast30Days: last30DaysRevenue,
    totalRevenueYTD: ytdRevenue,
    topCustomers,
  }
}

interface Task {
  id: string
  description: string
  status: 'incomplete' | 'completed'
  type: string
  received?: string
  completedOn?: string
  completedBy?: string
  actionLabel?: string
  actionHref?: string
}

function getTasks(): Task[] {
  return (tasksData as { tasks: Task[] }).tasks || []
}

// =============================================================================
// AI CONTEXT BUILDER
// =============================================================================

function formatCurrency(amount: number): string {
  const prefix = amount < 0 ? '-' : ''
  const absAmount = Math.abs(amount)
  if (absAmount >= 1000000) {
    return `${prefix}$${(absAmount / 1000000).toFixed(2)}M`
  }
  if (absAmount >= 1000) {
    return `${prefix}$${(absAmount / 1000).toFixed(1)}K`
  }
  return `${prefix}$${absAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function buildAIContext(): string {
  const company = getCompany()
  const accounts = getAccounts()
  const totalBalance = getTotalBalance()
  const recentTxns = getRecentTransactions(15)
  const cashflow30d = getCashflowSummary('30d')
  const runway = getRunwayEstimate()
  const topCategories = getTopSpendingCategories(8)
  const cards = getCardsWithSpending()
  const employees = getEmployees()

  return `
=== COMPANY PROFILE ===
Company: ${company.name} (${company.legalName})
Industry: ${company.industry}
EIN: ${company.ein}
Founded: ${company.founded}
Employees: ${company.metrics.employeeCount}

=== FUNDING ===
Stage: ${company.funding.stage}
Total Raised: ${formatCurrency(company.funding.totalRaised)}
Lead Investor: ${company.funding.investors.find(i => i.type === 'Lead')?.name || 'N/A'}

=== KEY METRICS ===
Current MRR: ${formatCurrency(company.metrics.currentMRR)}
MRR Growth Rate: ${(company.metrics.mrrGrowthRate * 100).toFixed(0)}%
Monthly Burn Rate: ${formatCurrency(company.metrics.monthlyBurnRate)}
Customers: ${company.metrics.customersCount}

=== ACCOUNTS (Total: ${formatCurrency(totalBalance)}) ===
${accounts.map(a => `• ${a.name} (${a.type}): ${formatCurrency(a.balance)}${a.apy ? ` @ ${a.apy}% APY` : ''}`).join('\n')}

=== RUNWAY ===
Months Remaining: ${runway.monthsRemaining} months
Monthly Burn: ${formatCurrency(runway.monthlyBurn)}

=== CASHFLOW (Last 30 Days) ===
Money In: ${formatCurrency(cashflow30d.moneyIn)}
Money Out: ${formatCurrency(cashflow30d.moneyOut)}
Net: ${formatCurrency(cashflow30d.net)}
Transactions: ${cashflow30d.transactionCount}

=== TOP SPENDING CATEGORIES (30 Days) ===
${topCategories.map(c => `• ${c.category}: ${formatCurrency(c.amount)} (${c.count} transactions)`).join('\n')}

=== CARDS (${cards.length} total) ===
${cards.map(c => `• ${c.cardholder} (${c.cardName}): Spent ${formatCurrency(c.spentThisMonth)} of ${formatCurrency(c.monthlyLimit)} limit${c.spentThisMonth > c.monthlyLimit ? ' ⚠️ OVER BUDGET' : ''}`).join('\n')}

=== RECENT TRANSACTIONS ===
${recentTxns.map(t => `• ${t.date}: ${t.merchant} ${t.amount >= 0 ? '+' : ''}${formatCurrency(t.amount)} (${t.category})`).join('\n')}

=== EMPLOYEES (${employees.length} total) ===
Departments: ${[...new Set(employees.map(e => e.department))].join(', ')}
With Cards: ${employees.filter(e => e.cardId).length}
Admins: ${employees.filter(e => e.isAdmin).length}
`.trim()
}

// =============================================================================
// FLAGGED TRANSACTIONS (Demo Data)
// =============================================================================

interface FlaggedTransaction {
  counterparty: string
  amount: number
  alertType: 'subscription-increase' | 'possible-duplicate' | 'new-vendor'
  reason: string
}

function getFlaggedTransactions(): FlaggedTransaction[] {
  // Find unusual transactions from real data
  const recentTxns = getRecentTransactions(50)
  const flagged: FlaggedTransaction[] = []

  // Check for large new vendors
  const vendorSpend = new Map<string, number>()
  for (const t of getTransactions()) {
    if (t.amount < 0) {
      const current = vendorSpend.get(t.merchant) || 0
      vendorSpend.set(t.merchant, current + 1)
    }
  }

  for (const t of recentTxns.slice(0, 10)) {
    if (t.amount < 0 && vendorSpend.get(t.merchant) === 1 && Math.abs(t.amount) > 1000) {
      flagged.push({
        counterparty: t.merchant,
        amount: t.amount,
        alertType: 'new-vendor',
        reason: 'First transaction with this vendor.'
      })
      if (flagged.length >= 3) break
    }
  }

  // If we don't have enough, add some demo data
  if (flagged.length < 2) {
    flagged.push({
      counterparty: 'LinkedIn',
      amount: -2500,
      alertType: 'subscription-increase',
      reason: 'This charge is 25% higher than last month.'
    })
  }

  return flagged.slice(0, 3)
}

// =============================================================================
// BOUNDARY HANDLING - Pivot to helpful alternatives when declining
// =============================================================================

interface PivotSuggestion {
  cannotDo: string | null
  canDo: string[]
  showData?: 'treasury' | 'payroll' | 'vendors' | 'limits' | 'documents' | 'cards' | 'balances' | 'transactions' | 'team'
}

const BOUNDARY_PIVOTS: Record<string, PivotSuggestion> = {
  // Advisory/Out-of-scope
  investment_advice: {
    cannotDo: "provide investment advice",
    canDo: [
      "show your Treasury account balance and APY",
      "explain how Treasury works",
      "show your current cash allocation across accounts"
    ],
    showData: 'treasury'
  },
  tax_advice: {
    cannotDo: "provide tax advice or file taxes",
    canDo: [
      "export transactions for your accountant",
      "show your 1099 forms and tax documents",
      "provide quarterly transaction summaries"
    ],
    showData: 'documents'
  },
  salary_advice: {
    cannotDo: "recommend employee salaries or compensation levels",
    canDo: [
      "show your current payroll spending",
      "break down compensation you've paid by employee",
      "show payroll trends over time"
    ],
    showData: 'payroll'
  },
  vendor_recommendation: {
    cannotDo: "recommend specific vendors",
    canDo: [
      "show which vendors you currently pay",
      "break down spending by vendor category",
      "show your top vendors by spend"
    ],
    showData: 'vendors'
  },
  loan_origination: {
    cannotDo: "provide loans directly",
    canDo: [
      "show Mercury credit line options",
      "explain available financing products",
      "show your current credit products"
    ]
  },
  insurance: {
    cannotDo: "provide business insurance directly",
    canDo: [
      "show you Mercury Perks partners who offer insurance",
      "show your current insurance-related spending",
      "connect you with our perks program"
    ]
  },
  
  // Compliance/Legal
  sanctions: {
    cannotDo: null,  // Don't say "can't" - just explain policy
    canDo: [
      "explain Mercury's compliance with U.S. sanctions regulations",
      "show your recent international payments",
      "connect you with our compliance team for specific guidance"
    ],
    showData: 'transactions'
  },
  
  // Vague requests
  vague_fix_request: {
    cannotDo: null,
    canDo: [
      "help with card issues (frozen, declined, lost)",
      "investigate payment problems (failed, pending)",
      "check balance questions (missing money, discrepancies)",
      "resolve access issues (permissions, login)"
    ],
    showData: 'cards'
  },
  
  // Partial capability
  cancel_payment: {
    cannotDo: "cancel payments that have already been sent",
    canDo: [
      "show the payment status and details",
      "explain ACH recall options",
      "connect you with support to attempt a recall"
    ],
    showData: 'transactions'
  },
  increase_limits: {
    cannotDo: "change account limits directly",
    canDo: [
      "show your current transfer limits",
      "connect you with support to request an increase",
      "explain the limit increase process"
    ],
    showData: 'limits'
  },
  add_admin: {
    cannotDo: "modify user permissions directly",
    canDo: [
      "show current team members and roles",
      "explain the admin invitation process",
      "link you to Team Settings"
    ],
    showData: 'team'
  },
  close_account: {
    cannotDo: "close accounts directly",
    canDo: [
      "show the account balance to transfer first",
      "explain the closure process",
      "connect you with support"
    ],
    showData: 'balances'
  },
  
  // Real-time limits
  forex_rates: {
    cannotDo: "provide real-time exchange rates",
    canDo: [
      "show your recent international transactions",
      "explain Mercury's forex fees",
      "initiate an international payment (rate shown at confirmation)"
    ],
    showData: 'transactions'
  },
  pending_deposit_status: {
    cannotDo: "see real-time deposit status from sending banks",
    canDo: [
      "show your recent incoming transactions",
      "explain typical ACH timing (1-3 business days)",
      "connect you with support for urgent deposits"
    ],
    showData: 'transactions'
  },
  
  // Security operations
  bulk_permissions: {
    cannotDo: "grant bulk admin access (security risk)",
    canDo: [
      "show current team permissions",
      "explain the security implications",
      "link to Team Settings for individual changes"
    ],
    showData: 'team'
  },
  
  // Creative problem-solving (we CAN actually help)
  balance_discrepancy: {
    cannotDo: null,
    canDo: [
      "show recent transactions",
      "highlight pending items and holds",
      "show account reconciliation"
    ],
    showData: 'transactions'
  },
  investor_verification: {
    cannotDo: null,
    canDo: [
      "show your current account balances",
      "help you find verification letters in Documents",
      "show your latest account statement"
    ],
    showData: 'balances'
  },
  
  // Urgent security (we CAN help immediately)
  urgent_card_security: {
    cannotDo: null,
    canDo: [
      "freeze all your cards immediately",
      "freeze specific cards you select",
      "connect you with Mercury support"
    ],
    showData: 'cards'
  }
}

/**
 * Detect if a query falls into a boundary case
 */
function detectBoundaryType(query: string): string | null {
  const q = query.toLowerCase()
  const patterns: [RegExp, string][] = [
    [/invest(ment)?|stocks?|bonds?|portfolio|etf|mutual fund/i, 'investment_advice'],
    [/tax(es)?|1099|file.*quarterly|irs|deduction/i, 'tax_advice'],
    [/how much.*pay.*employee|salary|compensation|wage|pay rate/i, 'salary_advice'],
    [/recommend.*vendor|which.*vendor|what.*use for|best.*provider/i, 'vendor_recommendation'],
    [/\b(loan|borrow|financing|credit line|line of credit)\b/i, 'loan_origination'],
    [/\binsurance\b/i, 'insurance'],
    [/cancel.*payment|stop.*payment|reverse.*payment|undo.*payment/i, 'cancel_payment'],
    [/increase.*limit|raise.*limit|higher.*limit|more.*limit/i, 'increase_limits'],
    [/add.*admin|make.*admin|give.*access|grant.*permission/i, 'add_admin'],
    [/close.*account|shut.*account|terminate.*account/i, 'close_account'],
    [/exchange rate|forex rate|eur.*rate|usd.*rate|currency rate/i, 'forex_rates'],
    [/deposit.*taking|pending.*deposit|where.*deposit|when.*deposit/i, 'pending_deposit_status'],
    [/everyone.*admin|all.*admin|bulk.*access|mass.*permission/i, 'bulk_permissions'],
    [/something.*wrong.*balance|balance.*off|balance.*incorrect|discrepancy/i, 'balance_discrepancy'],
    [/prove.*investor|verification.*letter|show.*bank.*balance|verify.*funds/i, 'investor_verification'],
    [/card.*stolen|stolen.*card|freeze.*everything|freeze.*all|hacked|compromised/i, 'urgent_card_security'],
    [/sanction(ed)?|embargo|ofac|restricted.*country|iran|north korea|cuba|syria/i, 'sanctions'],
    [/^fix it\.?$|^fix this\.?$|^fix$|^help$|^help me$/i, 'vague_fix_request']
  ]
  
  for (const [pattern, boundaryType] of patterns) {
    if (pattern.test(q)) return boundaryType
  }
  return null
}

/**
 * Detect urgency level from query
 */
function detectUrgency(query: string): 'critical' | 'urgent' | 'normal' {
  if (/HELP|!!!|stolen|hacked|fraud|NOW|immediately|emergency|urgent/i.test(query)) {
    return 'critical'
  }
  if (/asap|quickly|wrong person|mistake|error|problem/i.test(query)) {
    return 'urgent'
  }
  return 'normal'
}

/**
 * Adjust response tone based on urgency
 */
function adjustToneForUrgency(response: string, urgency: 'critical' | 'urgent' | 'normal'): string {
  if (urgency === 'critical') {
    return `I understand this is urgent—let's act fast.\n\n${response}`
  }
  if (urgency === 'urgent') {
    return `I can help with this right away.\n\n${response}`
  }
  return response
}

/**
 * Generate a helpful boundary response with pivot to available alternatives
 */
function generateBoundaryResponse(
  boundaryType: string,
  urgency: 'critical' | 'urgent' | 'normal'
): { responseText: string; metadata: Record<string, unknown> } | null {
  const pivot = BOUNDARY_PIVOTS[boundaryType]
  if (!pivot) return null
  
  // Special handling for urgent card security
  if (boundaryType === 'urgent_card_security') {
    const cards = getCardsWithSpending()
    const activeCards = cards.filter(c => c.status === 'active')
    
    const parts: string[] = [
      `I understand this is urgent—let's secure your account right away.`,
      '',
      `**${activeCards.length} active cards found:**`
    ]
    
    activeCards.forEach(c => {
      const lastFour = c.cardNumber.slice(-4)
      parts.push(`• ${c.cardName} (••${lastFour}) - ${c.cardholder}`)
    })
    
    parts.push('')
    parts.push(`**Quick actions:**`)
    parts.push(`• **Freeze all cards** — I can do this immediately`)
    parts.push(`• **Freeze specific card** — Select from above`)
    parts.push(`• **Contact support** — For urgent assistance`)
    parts.push('')
    parts.push(`Which would you like?`)
    
    return {
      responseText: parts.join('\n'),
      metadata: {
        cardsTable: {
          title: 'Active Cards',
          cards: activeCards.map(c => ({
            id: c.id,
            cardName: c.cardName,
            cardholder: c.cardholder,
            status: c.status,
            lastFour: c.cardNumber.slice(-4),
            spent: c.spentThisMonth,
            limit: c.monthlyLimit
          })),
          allowFreeze: true
        }
      }
    }
  }
  
  // Special handling for sanctions queries
  if (boundaryType === 'sanctions') {
    const recentTx = getRecentTransactions(5)
    const intlTx = recentTx.filter(t => t.category === 'International' || t.description.includes('Wire'))
    
    const parts: string[] = [
      `Mercury complies with U.S. sanctions regulations (OFAC). Payments to certain countries are restricted by federal law.`,
      '',
      `**What I can help with:**`,
      `• Connect you with our compliance team for guidance`,
      `• Show your recent international payments`,
      `• Explain which countries have restrictions`,
      ''
    ]
    
    if (intlTx.length > 0) {
      parts.push(`**Your recent international payments:**`)
      intlTx.slice(0, 3).forEach(t => {
        parts.push(`• ${t.merchant}: ${formatCurrency(t.amount)} (${t.date})`)
      })
      parts.push('')
    }
    
    parts.push(`Would you like me to connect you with support for specific guidance?`)
    
    return {
      responseText: parts.join('\n'),
      metadata: {
        transactionTable: intlTx.length > 0 ? {
          title: 'International Payments',
          rows: intlTx.map(t => ({
            id: t.id,
            counterparty: t.merchant,
            amount: t.amount,
            date: t.date,
            status: t.status
          }))
        } : undefined
      }
    }
  }
  
  // Special handling for vague "fix it" requests
  if (boundaryType === 'vague_fix_request') {
    const cards = getCardsWithSpending()
    const frozenCards = cards.filter(c => c.status === 'frozen')
    const pendingTx = getTransactions({ status: 'pending', limit: 5 })
    
    const parts: string[] = [
      `I'd be happy to help! What would you like me to look into?`,
      '',
      `**Common things I can help fix:**`,
      `• **Card issues** — Frozen, declined, or lost cards`,
      `• **Payment problems** — Failed or pending payments`,
      `• **Balance questions** — Missing money or discrepancies`,
      `• **Access issues** — Team permissions or login help`,
      ''
    ]
    
    // Add context about current state
    if (frozenCards.length > 0) {
      parts.push(`*I notice you have ${frozenCards.length} frozen card${frozenCards.length > 1 ? 's' : ''}.*`)
      parts.push('')
    }
    if (pendingTx.length > 0) {
      parts.push(`*You have ${pendingTx.length} pending transaction${pendingTx.length > 1 ? 's' : ''}.*`)
      parts.push('')
    }
    
    parts.push(`Just describe what's wrong and I'll investigate.`)
    
    return {
      responseText: parts.join('\n'),
      metadata: {
        cardsTable: frozenCards.length > 0 ? {
          title: 'Frozen Cards',
          cards: frozenCards.map(c => ({
            id: c.id,
            cardName: c.cardName,
            cardholder: c.cardholder,
            status: c.status,
            lastFour: c.cardNumber.slice(-4),
            spent: c.spentThisMonth,
            limit: c.monthlyLimit
          })),
          allowFreeze: true
        } : undefined
      }
    }
  }
  
  // Special handling for insurance - clean response without internal reasoning
  if (boundaryType === 'insurance') {
    const parts: string[] = [
      `I understand you're looking for business insurance! While Mercury doesn't offer insurance directly, here are some options:`,
      '',
      `• **Mercury Perks** — Partner discounts on business services including insurance providers`,
      `• **Your insurance spending** — I can show you your current insurance-related transactions`,
      '',
      `Would you like me to show your Perks options or insurance spending?`
    ]
    
    return {
      responseText: parts.join('\n'),
      metadata: {
        navigation: { target: 'Perks', url: '/perks', countdown: true }
      }
    }
  }
  
  // Special handling for tax advice - offer tax documents and exports
  if (boundaryType === 'tax_advice') {
    const parts: string[] = [
      `I can't file taxes directly, but I can help you prepare:`,
      '',
      `**Available for your accountant:**`,
      `• **Tax documents** — 1099s, annual statements`,
      `• **Transaction export** — CSV/PDF for any date range`,
      `• **Quarterly summary** — Income and expenses breakdown`,
      '',
      `Would you like me to show your tax documents or export transactions?`
    ]
    
    return {
      responseText: parts.join('\n'),
      metadata: {
        documents: {
          title: 'Tax Documents',
          documents: [
            { id: 'doc-1', name: '2025 1099-INT', type: 'tax', date: '2026-01-10' },
            { id: 'doc-2', name: '2024 1099-INT', type: 'tax', date: '2025-01-10' }
          ]
        },
        navigation: { target: 'Documents', url: '/documents', countdown: true }
      }
    }
  }
  
  // Special handling for account closure - offer to help transfer funds first
  if (boundaryType === 'close_account') {
    const accounts = getAccounts()
    const total = getTotalBalance()
    
    const parts: string[] = [
      `I can't close accounts directly, but I can help you prepare.`,
      '',
      `**Your total balance:** ${formatCurrency(total)}`,
      '',
      `**Before closing, you'll need to:**`,
      `1. **Transfer funds** — Move your balance to another account`,
      `2. **Contact support** — They'll process the closure`,
      '',
      `Would you like me to help transfer the funds first, or connect you with support?`
    ]
    
    return {
      responseText: parts.join('\n'),
      metadata: {
        accountBalances: {
          accounts: accounts.map(a => ({ id: a.id, name: a.name, type: a.type, balance: a.balance })),
          totalBalance: total
        }
      }
    }
  }
  
  // Special handling for investment advice - highlight Treasury
  if (boundaryType === 'investment_advice') {
    const accounts = getAccounts()
    const treasury = accounts.find(a => a.type === 'treasury')
    
    const parts: string[] = [
      `I can't provide investment advice, but Mercury does offer **Treasury** — a cash management account earning competitive yields.`,
      ''
    ]
    
    if (treasury) {
      parts.push(`**Your Treasury account:** ${formatCurrency(treasury.balance)} at ${treasury.apy || 4.5}% APY`)
      parts.push('')
    }
    
    parts.push(`This isn't investing in stocks/bonds, but it's a way to earn yield on idle cash.`)
    parts.push('')
    parts.push(`Would you like to learn more about Treasury or move funds?`)
    
    return {
      responseText: parts.join('\n'),
      metadata: {
        accountBalances: treasury ? {
          accounts: [{ id: treasury.id, name: treasury.name, type: treasury.type, balance: treasury.balance, apy: treasury.apy }],
          totalBalance: treasury.balance
        } : undefined,
        navigation: { target: 'Accounts', url: '/accounts', countdown: true }
      }
    }
  }
  
  // Special handling for balance verification (investor proof)
  if (boundaryType === 'investor_verification') {
    const accounts = getAccounts()
    const total = getTotalBalance()
    
    const parts: string[] = [
      `I can help you verify your balance for investors.`,
      '',
      `**Current total:** ${formatCurrency(total)}`,
      '',
      `**Verification options:**`,
      `• **Balance Verification Letter** — Official Mercury document (Settings → Documents)`,
      `• **Account Statement** — PDF of your latest statement`,
      `• **Screenshot** — I can display your current balances right here`,
      '',
      `Which would work best for your investor?`
    ]
    
    return {
      responseText: parts.join('\n'),
      metadata: {
        accountBalances: {
          accounts: accounts.map(a => ({ id: a.id, name: a.name, type: a.type, balance: a.balance })),
          totalBalance: total
        }
      }
    }
  }
  
  const parts: string[] = []
  
  // 1. Acknowledge what we can't do (if applicable)
  if (pivot.cannotDo) {
    parts.push(`I'm not able to ${pivot.cannotDo}.`)
    parts.push('')
  }
  
  // 2. Pivot to what we CAN do
  if (pivot.cannotDo) {
    parts.push(`However, I can help you with:`)
  } else {
    parts.push(`I can help you with this:`)
  }
  for (const option of pivot.canDo) {
    parts.push(`• ${option.charAt(0).toUpperCase() + option.slice(1)}`)
  }
  
  // 3. Add call to action
  parts.push('')
  parts.push(`Would you like me to show you any of these?`)
  
  // Build metadata based on showData type
  const metadata: Record<string, unknown> = {}
  
  if (pivot.showData === 'treasury') {
    const accounts = getAccounts()
    const treasury = accounts.find(a => a.type === 'treasury')
    if (treasury) {
      parts.splice(-2, 0, '')
      parts.splice(-2, 0, `**Your Treasury account:** ${formatCurrency(treasury.balance)} at ${treasury.apy || 4.5}% APY`)
      metadata.accountBalances = {
        accounts: [{ id: treasury.id, name: treasury.name, type: treasury.type, balance: treasury.balance, apy: treasury.apy }],
        totalBalance: treasury.balance
      }
    }
  }
  
  if (pivot.showData === 'balances') {
    const accounts = getAccounts()
    const total = getTotalBalance()
    parts.splice(-2, 0, '')
    parts.splice(-2, 0, `**Your total balance:** ${formatCurrency(total)} across ${accounts.length} accounts`)
    metadata.accountBalances = {
      accounts: accounts.map(a => ({ id: a.id, name: a.name, type: a.type, balance: a.balance, apy: a.apy })),
      totalBalance: total
    }
  }
  
  if (pivot.showData === 'limits') {
    // Show mock limits data
    parts.splice(-2, 0, '')
    parts.splice(-2, 0, `**Your current limits:**`)
    parts.splice(-2, 0, `• Daily wire: **$250,000**`)
    parts.splice(-2, 0, `• Daily ACH: **$500,000**`)
    parts.splice(-2, 0, `• Single transaction: **$100,000**`)
  }
  
  if (pivot.showData === 'documents') {
    metadata.documents = {
      title: 'Available Documents',
      documents: [
        { id: 'doc-1', name: 'January 2026 Statement', type: 'statement', date: '2026-01-15' },
        { id: 'doc-2', name: '2025 1099-INT', type: 'tax', date: '2026-01-10' },
        { id: 'doc-3', name: 'December 2025 Statement', type: 'statement', date: '2025-12-15' }
      ]
    }
  }
  
  if (pivot.showData === 'transactions') {
    const recent = getRecentTransactions(5)
    metadata.transactionTable = {
      title: 'Recent Transactions',
      rows: recent.map(t => ({
        id: t.id,
        counterparty: t.merchant,
        amount: t.amount,
        date: t.date,
        status: t.status
      }))
    }
  }
  
  if (pivot.showData === 'cards') {
    const cards = getCardsWithSpending()
    metadata.cardsTable = {
      title: 'Your Cards',
      cards: cards.slice(0, 5).map(c => ({
        id: c.id,
        cardName: c.cardName,
        cardholder: c.cardholder,
        status: c.status,
        lastFour: c.cardNumber.slice(-4),
        spent: c.spentThisMonth,
        limit: c.monthlyLimit
      }))
    }
  }
  
  if (pivot.showData === 'vendors') {
    // Show top vendors from transactions
    const transactions = getTransactions({ limit: 100 })
    const vendorSpend: Record<string, number> = {}
    transactions.forEach(t => {
      if (t.amount < 0) {
        vendorSpend[t.merchant] = (vendorSpend[t.merchant] || 0) + Math.abs(t.amount)
      }
    })
    const topVendors = Object.entries(vendorSpend)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
    
    if (topVendors.length > 0) {
      parts.splice(-2, 0, '')
      parts.splice(-2, 0, `**Your top vendors by spend:**`)
      topVendors.forEach(([vendor, amount]) => {
        parts.splice(-2, 0, `• ${vendor}: ${formatCurrency(amount)}`)
      })
    }
  }
  
  if (pivot.showData === 'payroll') {
    // Estimate payroll from transactions
    const transactions = getTransactions({ limit: 200 })
    const payrollTx = transactions.filter(t => 
      t.category === 'payroll' || t.description.toLowerCase().includes('payroll')
    )
    const monthlyPayroll = payrollTx.reduce((sum, t) => sum + Math.abs(t.amount), 0)
    const employees = getEmployees()
    
    parts.splice(-2, 0, '')
    parts.splice(-2, 0, `**Your payroll summary:**`)
    parts.splice(-2, 0, `• Employees: **${employees.length}**`)
    if (monthlyPayroll > 0) {
      parts.splice(-2, 0, `• Recent payroll total: **${formatCurrency(monthlyPayroll)}**`)
    }
  }
  
  if (pivot.showData === 'team') {
    const employees = getEmployees()
    parts.splice(-2, 0, '')
    parts.splice(-2, 0, `**Your team:** ${employees.length} members`)
    metadata.navigation = { target: 'Team Settings', url: '/settings/team', countdown: true }
  }
  
  let responseText = parts.join('\n')
  responseText = adjustToneForUrgency(responseText, urgency)
  
  return { responseText, metadata }
}

// =============================================================================
// CHAT API LOGIC
// =============================================================================

const ROUTER_MODEL = 'claude-sonnet-4-5-20250929'
const SMART_MODEL = 'claude-opus-4-5-20251101'

function createEventSender(res: VercelResponse) {
  return (event: string, data: object) => {
    res.write(`event: ${event}\n`)
    res.write(`data: ${JSON.stringify(data)}\n\n`)
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function generateConversationId(): string {
  return `conv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

interface ClassificationResult {
  intent: string
  needsSmartModel: boolean
  handoffMessage?: string
  quickResponse?: string
  navigationTarget?: string
}

async function classifyQuery(
  client: Anthropic,
  message: string,
): Promise<ClassificationResult> {
  const company = getCompany()

  const classificationPrompt = `You are Mercury Assistant, a friendly and helpful assistant for Mercury.

CRITICAL COMPLIANCE:
- Mercury is a FINTECH COMPANY, not a bank.
- Say "Mercury account" NOT "bank account"
- The company you are assisting is: ${company.name}

MESSAGE: "${message}"

INTENTS (choose the BEST match):
- SEND_PAYMENT: User wants to send money, pay someone, make a payment, schedule a payment, transfer to a vendor, pay an invoice (PRIORITY: if message contains "send" + amount or recipient name, use this)
- CARD_QUERY: User asks about cards, card spending, card limits, who has cards, what cards they have, cards overview, who is over their limit, card utilization
- CARD_ACTION: User wants to freeze, unfreeze, lock, or cancel a specific card
- MISSING_RECEIPTS: User asks about transactions missing receipts, expenses without documentation, unattached receipts
- FLAGGED_TRANSACTIONS: User asks about suspicious, flagged, or unusual transactions
- PAYMENT_LIMITS: User asks about payment limits
- EIN_QUERY: User asks about their EIN
- COMPANY_QUERY: User asks about company info, funding, founding date, metrics
- EMPLOYEE_QUERY: User asks about employees, team size, who works here, departments, salaries
- CASHFLOW_QUESTION: User asks about cashflow, money in/out, spending trends, burn rate, runway
- SPENDING_ANALYSIS: User asks about spending by category, vendor, or period (how much on AWS, marketing spend, etc)
- REVENUE_QUERY: User asks about revenue, MRR, income, top customers
- WIRE_TRANSACTIONS: User asks about wire transfers
- RECIPIENT_BANK_DETAILS: User asks for bank details, routing number, or account number FOR A SPECIFIC RECIPIENT/VENDOR (e.g., "bank details for AWS", "routing number for Stripe")
- RECIPIENT_QUERY: User asks about recipients list, top recipients, who they paid, vendors they paid most
- NAVIGATE: User wants to go to a page
- BALANCE: User asks about account balances
- ACCOUNT_QUERY: User asks about specific accounts, account types, account details
- TRANSACTION_SEARCH: User asks about specific transactions, recent transactions, transaction history
- TASK_QUERY: User asks about tasks, pending items, what needs attention
- DOCUMENT_QUERY: User asks about documents, statements, bank statements, tax documents
- FEATURE_DISCOVERY: User asks what Mercury can do, what features are available, what products we offer, or wants personalized feature recommendations
- AGENT_MODE: Multi-step workflow that requires multiple actions
- SUPPORT: User explicitly asks for human support
- COMPLEX_QUESTION: Requires deep analysis, comparisons, forecasting
- SIMPLE_QUESTION: General product questions
- CHITCHAT: Casual conversation
- CREATE_RECIPIENT: User wants to add a new recipient, add a vendor, add a payee
- CREATE_INVOICE: User wants to create an invoice, bill a client (NOT pay an invoice - that's SEND_PAYMENT)
- UPLOAD_BILL: User wants to upload a bill image/document for processing
- ISSUE_CARD: User wants to issue a new card, create a card, get a card for someone
- CREATE_EMPLOYEE: User wants to invite a team member, add an employee, add a user

Respond with JSON:
{"intent":"...", "needsSmartModel":true/false, "handoffMessage":"...", "quickResponse":"...", "navigationTarget":"..."}`

  try {
    const response = await client.messages.create({
      model: ROUTER_MODEL,
      max_tokens: 256,
      temperature: 0.3,
      messages: [{ role: 'user', content: classificationPrompt }],
    })

    if (response.stop_reason === 'refusal') {
      return {
        intent: 'COMPLEX_QUESTION',
        needsSmartModel: true,
        handoffMessage: 'Let me look into that...'
      }
    }

    const textBlock = response.content.find(b => b.type === 'text')
    const text = textBlock && 'text' in textBlock ? textBlock.text : ''
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
  } catch (e) {
    console.error('Classification error:', e)
  }

  return {
    intent: 'COMPLEX_QUESTION',
    needsSmartModel: true,
    handoffMessage: 'Let me think about that...'
  }
}

async function handleWithRouter(
  sendEvent: (event: string, data: object) => void,
  message: string,
  classification: ClassificationResult,
  conversationId: string
): Promise<void> {
  let responseText = ''
  let metadata: Record<string, unknown> | undefined

  const company = getCompany()
  
  // Note: Boundary handling now happens at the top level in the main handler
  // before classification, so boundary cases won't reach this point

  switch (classification.intent) {
    case 'FLAGGED_TRANSACTIONS': {
      const flagged = getFlaggedTransactions()

      if (flagged.length > 0) {
        responseText = `I found **${flagged.length} transactions** that need your attention:\n\n`

        flagged.forEach((t, i) => {
          const amount = t.amount < 0 ? `-$${Math.abs(t.amount).toLocaleString()}` : `+$${t.amount.toLocaleString()}`
          const alertLabels: Record<string, string> = {
            'possible-duplicate': 'Possible Duplicate',
            'subscription-increase': 'Subscription Increase',
            'new-vendor': 'New Vendor',
          }
          const label = alertLabels[t.alertType] || 'Flagged'
          responseText += `${i + 1}. **${t.counterparty}** - ${amount}\n`
          responseText += `   ${label}: ${t.reason}\n\n`
        })
      } else {
        responseText = `Good news! I don't see any transactions that need your attention.`
      }
      break
    }

    case 'PAYMENT_LIMITS': {
      responseText = `Here's how to increase your payment limits:\n\n`
      responseText += `**Current Limits:**\n`
      responseText += `- ACH: Up to $500,000 per transfer\n`
      responseText += `- Wire: Up to $1,000,000 per transfer\n\n`
      responseText += `Go to **Settings > Payment Limits** to request higher limits.`
      break
    }

    case 'EIN_QUERY': {
      responseText = `Your company's **EIN** is:\n\n**${company.ein}**\n\nFor **${company.name}**`
      break
    }

    case 'CASHFLOW_QUESTION': {
      const cashflow = getCashflowSummary('30d')
      const runway = getRunwayEstimate()
      const topCategories = getTopSpendingCategories(5)

      responseText = `Here's your financial overview:\n\n`
      responseText += `**Last 30 Days:**\n`
      responseText += `- Money In: ${formatCurrency(cashflow.moneyIn)}\n`
      responseText += `- Money Out: ${formatCurrency(cashflow.moneyOut)}\n`
      responseText += `- Net: ${formatCurrency(cashflow.net)}\n\n`
      responseText += `**Runway:** ${runway.monthsRemaining} months at ${formatCurrency(runway.monthlyBurn)}/month burn\n\n`
      responseText += `**Top Spending:**\n`
      responseText += topCategories.map(c => `- ${c.category}: ${formatCurrency(c.amount)}`).join('\n')

      metadata = {
        navigation: {
          target: 'Insights',
          url: '/dashboard',
          countdown: true,
          followUpAction: 'answer_with_page_data',
          pageData: {
            totalBalance: getTotalBalance(),
            moneyIn: cashflow.moneyIn,
            moneyOut: cashflow.moneyOut,
            netChange: cashflow.net,
            runway: runway.monthsRemaining,
            topCategories: topCategories,
          }
        }
      }
      break
    }

    case 'WIRE_TRANSACTIONS': {
      const wires = getWireTransactions(20)
      const wireCount = wires.length
      const totalAmount = wires.reduce((sum, t) => sum + t.amount, 0)

      responseText = `Found **${wireCount} wire transfers** totaling ${formatCurrency(totalAmount)}:`

      metadata = {
        transactionTable: {
          title: 'Wire Transfers',
          rows: wires.map(t => ({
            id: t.id,
            description: t.description,
            merchant: t.merchant,
            amount: t.amount,
            date: t.date,
            status: t.status,
            category: t.category,
          })),
        },
        navigation: {
          target: 'Transactions',
          url: '/transactions?filter=wire',
          countdown: true
        }
      }
      break
    }

    case 'RECIPIENT_BANK_DETAILS': {
      const recipients = getRecipients()
      const query = message.toLowerCase()
      
      // Try to find the recipient by name in the query
      const matchedRecipient = recipients.find(r => 
        query.includes(r.name.toLowerCase())
      )
      
      if (matchedRecipient) {
        // Generate mock bank details for the recipient
        // In a real app, this would come from the recipient data
        const routingNumber = '021000021' // Mock routing
        const accountNumber = `****${Math.floor(1000 + Math.random() * 9000)}` // Mock last 4
        const bankName = 'Chase Bank' // Mock bank
        
        responseText = `**Bank Details for ${matchedRecipient.name}:**\n\n`
        responseText += `• **Bank:** ${bankName}\n`
        responseText += `• **Routing Number:** ${routingNumber}\n`
        responseText += `• **Account Number:** ${accountNumber}\n`
        responseText += `• **Account Type:** Checking\n\n`
        responseText += `Last paid: ${matchedRecipient.lastPaid || 'Never'}`
        if (matchedRecipient.totalPaid) {
          responseText += ` (Total: ${formatCurrency(matchedRecipient.totalPaid)})`
        }
        
        metadata = {
          navigation: {
            target: 'Recipients',
            url: '/payments/recipients',
            countdown: true
          }
        }
      } else {
        // Recipient not found - show list of recipients
        responseText = `I couldn't find that recipient. Here are your saved recipients:`
        
        const topRecipients = [...recipients]
          .filter(r => r.totalPaid && r.totalPaid > 0)
          .sort((a, b) => (b.totalPaid || 0) - (a.totalPaid || 0))
          .slice(0, 8)
        
        metadata = {
          recipients: {
            title: 'Select a recipient to view bank details',
            rows: topRecipients.map(r => ({
              id: r.id,
              name: r.name,
              lastPaidDate: r.lastPaid || undefined,
              lastPaidAmount: r.totalPaid || undefined,
            })),
            allowPayment: false,
          },
          navigation: {
            target: 'Recipients',
            url: '/payments/recipients',
            countdown: true
          }
        }
      }
      break
    }

    case 'RECIPIENT_QUERY': {
      const recipients = getRecipients()
      
      // Get top recipients by amount paid
      const topByPaid = [...recipients]
        .filter(r => r.totalPaid && r.totalPaid > 0)
        .sort((a, b) => (b.totalPaid || 0) - (a.totalPaid || 0))
        .slice(0, 5)
      
      if (topByPaid.length > 0) {
        responseText = `Here are your **top recipients** by amount paid. Click "Send" to make a payment.`
      } else {
        responseText = `You have **${recipients.length} recipients** set up.`
      }
      
      // Build recipients metadata for the UI
      metadata = {
        recipients: {
          title: '',
          rows: topByPaid.map(r => ({
            id: r.id,
            name: r.name,
            lastPaidDate: r.lastPaid || undefined,
            lastPaidAmount: r.totalPaid || undefined,
          })),
          allowPayment: true,
        },
        navigation: {
          target: 'Recipients',
          url: '/payments/recipients',
          countdown: true
        }
      }
      break
    }

    case 'COMPANY_QUERY': {
      responseText = `Here's information about **${company.name}**:\n\n`
      responseText += `**Company Details:**\n`
      responseText += `- Legal Name: ${company.legalName}\n`
      responseText += `- Industry: ${company.industry}\n`
      responseText += `- Founded: ${company.founded}\n`
      responseText += `- EIN: ${company.ein}\n`
      responseText += `- Website: ${company.website}\n\n`
      
      responseText += `**Funding:**\n`
      responseText += `- Stage: ${company.funding.stage}\n`
      responseText += `- Total Raised: ${formatCurrency(company.funding.totalRaised)}\n`
      responseText += `- Last Round: ${formatCurrency(company.funding.lastRoundAmount)} (${company.funding.lastRoundDate})\n\n`
      
      responseText += `**Current Metrics:**\n`
      responseText += `- Employees: ${company.metrics.employeeCount}\n`
      responseText += `- Monthly Burn: ${formatCurrency(company.metrics.monthlyBurnRate)}\n`
      responseText += `- MRR: ${formatCurrency(company.metrics.currentMRR)}\n`
      responseText += `- Customers: ${company.metrics.customersCount}\n`
      break
    }

    case 'EMPLOYEE_QUERY': {
      const employees = getEmployees()
      const departments = new Map<string, { count: number; totalSalary: number }>()
      
      // Group by department
      for (const emp of employees) {
        const dept = departments.get(emp.department) || { count: 0, totalSalary: 0 }
        departments.set(emp.department, {
          count: dept.count + 1,
          totalSalary: dept.totalSalary + emp.salary,
        })
      }
      
      responseText = `**Team Overview** (${employees.length} employees):\n\n`
      
      // Sort departments by headcount
      const sortedDepts = Array.from(departments.entries())
        .sort((a, b) => b[1].count - a[1].count)
      
      responseText += `**By Department:**\n`
      for (const [dept, data] of sortedDepts) {
        const avgSalary = data.totalSalary / data.count
        responseText += `- **${dept}**: ${data.count} people (avg ${formatCurrency(avgSalary)}/yr)\n`
      }
      
      // Total payroll
      const totalAnnualPayroll = employees.reduce((sum, e) => sum + e.salary, 0)
      responseText += `\n**Total Annual Payroll**: ${formatCurrency(totalAnnualPayroll)}\n`
      responseText += `**Monthly Payroll**: ~${formatCurrency(totalAnnualPayroll / 12)}\n`
      
      // List a few key people (executives/leadership)
      const leadership = employees.filter(e => 
        e.role.includes('CEO') || e.role.includes('CTO') || e.role.includes('CFO') || 
        e.role.includes('Head') || e.role.includes('Director') || e.role.includes('VP')
      ).slice(0, 5)
      
      if (leadership.length > 0) {
        responseText += `\n**Leadership:**\n`
        leadership.forEach(e => {
          responseText += `- **${e.firstName} ${e.lastName}** - ${e.role}\n`
        })
      }
      break
    }

    case 'SPENDING_ANALYSIS': {
      const query = message.toLowerCase()
      const topCategories = getTopSpendingCategories(10, '30d')
      const topMerchants = getTopMerchants(10, '30d')
      
      // Check if asking about a specific merchant/vendor
      const mentionedMerchant = topMerchants.find(m => 
        query.includes(m.merchant.toLowerCase())
      )
      
      if (mentionedMerchant) {
        const spending = getMerchantSpending(mentionedMerchant.merchant)
        responseText = `**${mentionedMerchant.merchant}** Spending:\n\n`
        responseText += `- Total: ${formatCurrency(spending.total)}\n`
        responseText += `- Transactions: ${spending.transactions.length}\n`
        responseText += `- Average: ${formatCurrency(spending.averageTransaction)}\n`
        if (spending.lastTransaction) {
          responseText += `- Last: ${spending.lastTransaction.date} (${formatCurrency(Math.abs(spending.lastTransaction.amount))})\n`
        }
        responseText += `\n**Recent transactions:**\n`
        spending.transactions.slice(0, 5).forEach((t, i) => {
          responseText += `${i + 1}. ${t.date} - ${formatCurrency(Math.abs(t.amount))}\n`
        })
      } else {
        // General spending overview
        const totalSpend = topCategories.reduce((sum, c) => sum + c.amount, 0)
        
        responseText = `**Spending Analysis (Last 30 Days)**\n\n`
        responseText += `**Total Spend**: ${formatCurrency(totalSpend)}\n\n`
        
        responseText += `**By Category:**\n`
        topCategories.slice(0, 7).forEach((c, i) => {
          responseText += `${i + 1}. **${c.category}**: ${formatCurrency(c.amount)} (${c.percentOfTotal.toFixed(1)}%)\n`
        })
        
        responseText += `\n**Top Merchants:**\n`
        topMerchants.slice(0, 5).forEach((m, i) => {
          responseText += `${i + 1}. **${m.merchant}**: ${formatCurrency(m.amount)} (${m.transactionCount} txns)\n`
        })
      }
      break
    }

    case 'REVENUE_QUERY': {
      const revenue = getRevenueSummary()
      
      responseText = `**Revenue Overview:**\n\n`
      responseText += `**Monthly Revenue:**\n`
      responseText += `- Current MRR: ${formatCurrency(revenue.currentMRR)}\n`
      responseText += `- Previous MRR: ${formatCurrency(revenue.previousMRR)}\n`
      responseText += `- MRR Growth: ${formatCurrency(revenue.mrrGrowth)} (${revenue.mrrGrowthPercent.toFixed(1)}%)\n\n`
      
      responseText += `**Period Totals:**\n`
      responseText += `- Last 30 Days: ${formatCurrency(revenue.totalRevenueLast30Days)}\n`
      responseText += `- Year to Date: ${formatCurrency(revenue.totalRevenueYTD)}\n\n`
      
      if (revenue.topCustomers.length > 0) {
        responseText += `**Top Customers:**\n`
        revenue.topCustomers.forEach((c, i) => {
          responseText += `${i + 1}. **${c.name}**: ${formatCurrency(c.amount)}\n`
        })
      }
      break
    }

    case 'ACCOUNT_QUERY': {
      const accounts = getAccounts()
      const total = getTotalBalance()
      
      responseText = `**Account Details:**\n\n`
      responseText += `You have **${accounts.length} accounts** with a total balance of **${formatCurrency(total)}**.`
      
      // Build account balances metadata for the UI
      metadata = {
        accountBalances: {
          title: '',
          accounts: accounts.map(a => ({
            id: a.id,
            name: a.name,
            type: a.type as 'checking' | 'savings' | 'treasury',
            balance: a.balance,
            accountNumber: a.accountNumber,
          })),
          totalBalance: total,
        },
        navigation: {
          target: 'Accounts',
          url: '/accounts',
          countdown: true
        }
      }
      break
    }

    case 'CARD_QUERY': {
      const allCards = getCardsWithSpending()
      const query = message.toLowerCase()
      
      // Detect card status filter
      let filteredCards = allCards
      let statusFilter: 'frozen' | 'active' | 'cancelled' | undefined
      
      if (query.includes('frozen')) {
        filteredCards = allCards.filter(c => c.status === 'frozen')
        statusFilter = 'frozen'
      } else if (query.includes('active')) {
        filteredCards = allCards.filter(c => c.status === 'active')
        statusFilter = 'active'
      } else if (query.includes('cancelled') || query.includes('canceled')) {
        filteredCards = allCards.filter(c => c.status === 'cancelled')
        statusFilter = 'cancelled'
      }
      
      // Handle empty filter results
      if (filteredCards.length === 0 && statusFilter) {
        responseText = `You don't have any **${statusFilter}** cards.`
        metadata = {
          emptyState: {
            message: `No ${statusFilter} cards found`,
            suggestion: statusFilter === 'frozen' 
              ? 'All your cards are currently active.' 
              : `Try asking about your ${statusFilter === 'active' ? 'frozen' : 'active'} cards instead.`
          }
        }
        break
      }
      
      const cards = filteredCards
      const totalSpent = cards.reduce((sum, c) => sum + c.spentThisMonth, 0)
      const totalLimit = cards.reduce((sum, c) => sum + c.monthlyLimit, 0)
      const overBudget = cards.filter(c => c.spentThisMonth > c.monthlyLimit)
      
      if (statusFilter) {
        responseText = `You have **${cards.length} ${statusFilter} card${cards.length !== 1 ? 's' : ''}**:`
      } else {
        responseText = `**Card Overview** (${cards.length} cards):\n\n`
        responseText += `**Total This Month**: ${formatCurrency(totalSpent)} of ${formatCurrency(totalLimit)} (${((totalSpent/totalLimit)*100).toFixed(0)}% used)`
        
        if (overBudget.length > 0) {
          responseText += `\n\n⚠️ **${overBudget.length} card${overBudget.length > 1 ? 's' : ''} over limit** - click to freeze if needed.`
        }
      }
      
      // Build cards table metadata for the UI
      const cardRows = cards.map(c => ({
        id: c.id,
        cardholder: c.cardholder,
        cardLast4: c.cardNumber,
        cardName: c.nickname || c.cardName,
        spent: c.spentThisMonth,
        limit: c.monthlyLimit,
        status: c.status as 'active' | 'frozen' | 'cancelled',
      }))
      
      // Sort by over-limit first, then by spent
      cardRows.sort((a, b) => {
        const aOver = a.spent > a.limit ? 1 : 0
        const bOver = b.spent > b.limit ? 1 : 0
        if (aOver !== bOver) return bOver - aOver
        return b.spent - a.spent
      })
      
      // Build navigation URL with optional status filter
      const navUrl = statusFilter ? `/cards?status=${statusFilter}` : '/cards'
      
      metadata = {
        cardsTable: {
          title: statusFilter ? `${statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)} Cards` : '',
          rows: cardRows,
          showDetailFor: overBudget.length > 0 ? overBudget[0].id : undefined,
        },
        navigation: {
          target: 'Cards',
          url: navUrl,
          countdown: true
        }
      }
      break
    }

    case 'TASK_QUERY': {
      const tasks = getTasks()
      const query = message.toLowerCase()
      
      // Detect status filter from query
      const wantsIncomplete = /incomplete|pending|open|todo|need|outstanding/i.test(query)
      const wantsCompleted = /completed?|done|finished/i.test(query)
      
      let filteredTasks = tasks
      let statusLabel = ''
      
      if (wantsIncomplete) {
        filteredTasks = tasks.filter(t => t.status === 'incomplete')
        statusLabel = 'incomplete '
      } else if (wantsCompleted) {
        filteredTasks = tasks.filter(t => t.status === 'completed')
        statusLabel = 'completed '
      }
      
      if (filteredTasks.length > 0) {
        responseText = `Found **${filteredTasks.length} ${statusLabel}tasks**:`
      } else {
        responseText = wantsIncomplete 
          ? `Great news! You have no incomplete tasks.`
          : wantsCompleted 
          ? `No completed tasks found.`
          : `You have no tasks.`
      }
      
      // Build task table metadata
      metadata = {
        taskTable: {
          title: statusLabel 
            ? `${statusLabel.charAt(0).toUpperCase() + statusLabel.slice(1).trim()} Tasks` 
            : 'All Tasks',
          rows: filteredTasks.map(t => ({
            id: t.id,
            description: t.description,
            status: t.status,
            type: t.type,
            received: t.received,
            actionLabel: t.actionLabel,
            actionHref: t.actionHref,
          })),
        },
        navigation: {
          target: 'Tasks',
          url: '/tasks',
          countdown: true
        }
      }
      break
    }

    case 'DOCUMENT_QUERY': {
      // Generate mock document data
      const accounts = getAccounts()
      const currentDate = new Date()
      const currentMonth = currentDate.toLocaleString('default', { month: 'long' })
      const currentYear = currentDate.getFullYear()
      
      // Generate last 3 months of statements
      const mockDocuments = []
      for (let i = 0; i < 3; i++) {
        const docDate = new Date(currentDate)
        docDate.setMonth(docDate.getMonth() - i)
        const monthName = docDate.toLocaleString('default', { month: 'long' })
        const year = docDate.getFullYear()
        
        for (const account of accounts.slice(0, 2)) {
          mockDocuments.push({
            id: `stmt-${account.id}-${year}-${docDate.getMonth()}`,
            name: `${monthName} ${year} Statement`,
            type: 'statement' as const,
            date: docDate.toISOString().split('T')[0],
            accountName: account.name,
          })
        }
      }
      
      responseText = `Here are your recent statements and documents:`
      
      metadata = {
        documents: {
          title: '',
          documents: mockDocuments.slice(0, 6),
        }
      }
      break
    }

    case 'FEATURE_DISCOVERY': {
      // Feature cards for showcasing Mercury's capabilities
      const allFeatureCards = [
        {
          id: 'feature-payments',
          title: 'Payments',
          subtitle: 'Send money anywhere',
          description: 'ACH, wires, international transfers to 100+ countries. Same-day ACH and free domestic wires on Plus/Pro.',
          icon: 'arrow-right-arrow-left',
          color: 'purple-magic' as const,
          stats: [{ label: 'Countries', value: '100+' }, { label: 'Domestic wire', value: 'Same day' }],
          cta: { label: 'Send a payment', action: '/payments/recipients' },
        },
        {
          id: 'feature-cards',
          title: 'Cards',
          subtitle: 'Virtual & physical cards',
          description: 'Unlimited virtual cards instantly. Physical debit cards. IO credit card with 1.5% cashback and no personal guarantee.',
          icon: 'credit-card',
          color: 'purple-magic' as const,
          stats: [{ label: 'Virtual cards', value: 'Unlimited' }, { label: 'Cashback', value: '1.5%' }],
          cta: { label: 'Manage cards', action: '/cards' },
        },
        {
          id: 'feature-insights',
          title: 'Insights',
          subtitle: 'Understand your finances',
          description: 'Track runway, burn rate, and cash flow trends. Compare spending across periods and forecast future cash position.',
          icon: 'chart-line',
          color: 'purple-magic' as const,
          stats: [{ label: 'Runway tracking', value: 'Real-time' }, { label: 'Cash flow', value: 'Daily/Monthly' }],
          cta: { label: 'View insights', action: '/insights' },
        },
        {
          id: 'feature-treasury',
          title: 'Treasury',
          subtitle: 'Maximize yield on cash',
          description: 'Earn up to 3.80% APY on idle cash. Government money market funds, T-Bills, and automated sweep strategies.',
          icon: 'piggy-bank',
          color: 'green' as const,
          stats: [{ label: 'Yield', value: 'Up to 3.80%' }, { label: 'Min investment', value: '$250K' }],
          cta: { label: 'Explore treasury', action: '/accounts/treasury' },
        },
        {
          id: 'feature-billpay',
          title: 'Bill Pay',
          subtitle: 'Pay bills efficiently',
          description: 'Upload invoices, schedule payments, and set up approval workflows. Automated vendor payment reminders.',
          icon: 'file-invoice-dollar',
          color: 'neutral' as const,
          stats: [{ label: 'Invoice capture', value: 'AI-powered' }, { label: 'Approval workflows', value: 'Multi-level' }],
          cta: { label: 'Pay a bill', action: '/workflows/bill-pay' },
        },
        {
          id: 'feature-invoicing',
          title: 'Invoicing',
          subtitle: 'Get paid faster',
          description: 'Send professional invoices with payment links. Automated reminders and recurring billing for subscriptions.',
          icon: 'file-invoice',
          color: 'green' as const,
          stats: [{ label: 'Payment links', value: 'ACH & Card' }, { label: 'Reminders', value: 'Automated' }],
          cta: { label: 'Create invoice', action: '/workflows/invoicing' },
        },
        {
          id: 'feature-accounts',
          title: 'Accounts',
          subtitle: 'Organize your money',
          description: 'Multiple checking and savings accounts. Up to $5M FDIC insurance through sweep network. No monthly fees.',
          icon: 'building-columns',
          color: 'purple-magic' as const,
          stats: [{ label: 'FDIC coverage', value: 'Up to $5M' }, { label: 'Monthly fee', value: '$0' }],
          cta: { label: 'View accounts', action: '/dashboard' },
        },
        {
          id: 'feature-employee-cards',
          title: 'Employee Cards',
          subtitle: 'Empower your team',
          description: 'Issue cards to employees with custom limits. Track spending in real-time. Require receipts and categorization.',
          icon: 'id-card',
          color: 'neutral' as const,
          stats: [{ label: 'Cards per employee', value: 'Unlimited' }, { label: 'Spending alerts', value: 'Real-time' }],
          cta: { label: 'Issue cards', action: '/cards' },
        },
        {
          id: 'feature-accounting',
          title: 'Accounting Sync',
          subtitle: 'Automate bookkeeping',
          description: 'Two-way sync with QuickBooks, Xero, and NetSuite. Auto-categorize transactions and reconcile in real-time.',
          icon: 'arrows-rotate',
          color: 'neutral' as const,
          stats: [{ label: 'Integrations', value: 'QBO, Xero, NetSuite' }, { label: 'Sync', value: 'Real-time' }],
          cta: { label: 'Connect accounting', action: '/workflows/accounting' },
        },
        {
          id: 'feature-io-credit',
          title: 'IO Credit Card',
          subtitle: 'Credit without the PG',
          description: 'No personal guarantee required. 1.5% unlimited cashback. Extended monthly payment terms with $15K+ balance.',
          icon: 'credit-card',
          color: 'green' as const,
          highlight: 'No personal guarantee',
          stats: [{ label: 'Cashback', value: '1.5%' }, { label: 'Annual fee', value: '$0' }],
          cta: { label: 'Apply for IO', action: '/capital' },
        },
        {
          id: 'feature-venture-debt',
          title: 'Venture Debt',
          subtitle: 'Extend your runway',
          description: 'Up to 48-month terms with 18-month interest-only period. No prepayment penalties. Complement your equity.',
          icon: 'hand-holding-dollar',
          color: 'purple-magic' as const,
          stats: [{ label: 'Term', value: 'Up to 48 mo' }, { label: 'Prepayment', value: 'No penalty' }],
          cta: { label: 'Learn more', action: '/capital' },
        },
        {
          id: 'feature-approvals',
          title: 'Approvals',
          subtitle: 'Control who can spend',
          description: 'Multi-level approval workflows for payments and cards. Set thresholds, required approvers, and escalation paths.',
          icon: 'check-double',
          color: 'purple-magic' as const,
          stats: [{ label: 'Approval levels', value: 'Multi-tier' }, { label: 'Thresholds', value: 'Custom' }],
          cta: { label: 'Configure approvals', action: '/tasks' },
        },
      ]
      
      // Randomly select 6 cards
      const shuffled = [...allFeatureCards].sort(() => Math.random() - 0.5)
      const selectedCards = shuffled.slice(0, 6)
      
      responseText = `Based on your activity, here are some Mercury features that could help ${company.name}:`
      
      metadata = {
        featureCards: {
          cards: selectedCards,
        }
      }
      break
    }

    case 'NAVIGATE': {
      const page = classification.navigationTarget || 'home'
      const pageUrls: Record<string, string> = {
        home: '/dashboard', transactions: '/transactions', accounts: '/accounts',
        cards: '/cards', payments: '/payments/recipients', insights: '/insights',
        recipients: '/payments/recipients', tasks: '/tasks', capital: '/capital',
        explore: '/explore', command: '/command'
      }
      const targetUrl = pageUrls[page.toLowerCase()] || '/dashboard'
      const pageName = page.charAt(0).toUpperCase() + page.slice(1)
      responseText = `Navigating to **${pageName}** (${targetUrl})...`
      metadata = {
        navigation: {
          target: pageName,
          url: targetUrl,
          countdown: true,
          action: 'navigate'
        }
      }
      break
    }

    case 'BALANCE': {
      const accounts = getAccounts()
      const total = getTotalBalance()
      const query = message.toLowerCase()
      
      // Check for Treasury-specific query
      if (query.includes('treasury')) {
        const treasury = accounts.find(a => a.type === 'treasury')
        if (treasury) {
          responseText = `Your **Treasury** balance is **${formatCurrency(treasury.balance)}**`
          if (treasury.apy) {
            responseText += ` earning **${treasury.apy}% APY**.`
          } else {
            responseText += `.`
          }
          
          // Return with single-account metadata including APY
          metadata = {
            accountBalances: {
              title: 'Treasury Account',
              accounts: [{
                id: treasury.id,
                name: treasury.name,
                type: 'treasury' as const,
                balance: treasury.balance,
                accountNumber: treasury.accountNumber,
                apy: treasury.apy,
              }],
              totalBalance: treasury.balance,
            },
            navigation: {
              target: 'Treasury',
              url: '/accounts/treasury',
              countdown: true
            }
          }
          break
        }
      }
      
      // Check for specific account type queries (Operating, Payroll, Savings)
      const accountTypeMatch = query.match(/\b(operating|payroll|savings|checking)\b/i)
      if (accountTypeMatch) {
        const searchTerm = accountTypeMatch[1].toLowerCase()
        const matchedAccount = accounts.find(a => 
          a.name.toLowerCase().includes(searchTerm) || 
          a.type.toLowerCase() === searchTerm
        )
        if (matchedAccount) {
          responseText = `Your **${matchedAccount.name}** account balance is **${formatCurrency(matchedAccount.balance)}**`
          if (matchedAccount.apy) {
            responseText += ` earning **${matchedAccount.apy}% APY**.`
          } else {
            responseText += `.`
          }
          
          metadata = {
            accountBalances: {
              title: `${matchedAccount.name} Account`,
              accounts: [{
                id: matchedAccount.id,
                name: matchedAccount.name,
                type: matchedAccount.type as 'checking' | 'savings' | 'treasury',
                balance: matchedAccount.balance,
                accountNumber: matchedAccount.accountNumber,
                apy: matchedAccount.apy,
              }],
              totalBalance: matchedAccount.balance,
            }
          }
          break
        }
      }
      
      // Default: show all accounts
      responseText = `Here are your account balances:`
      
      // Build account balances metadata for the UI
      metadata = {
        accountBalances: {
          title: '',
          accounts: accounts.map(a => ({
            id: a.id,
            name: a.name,
            type: a.type as 'checking' | 'savings' | 'treasury',
            balance: a.balance,
            accountNumber: a.accountNumber,
            apy: a.apy,
          })),
          totalBalance: total,
        }
      }
      break
    }

    case 'CARD_ACTION': {
      const cards = getCardsWithSpending()
      const query = message.toLowerCase()
      
      // Detect action type
      const isFreezeAction = query.includes('freeze') || query.includes('lock') || query.includes('disable')
      const isUnfreezeAction = query.includes('unfreeze') || query.includes('unlock') || query.includes('enable') || query.includes('activate')
      
      // Try to find a matching card by name
      const matchedCard = cards.find(c => {
        const cardName = (c.nickname || c.cardName).toLowerCase()
        const cardholder = c.cardholder.toLowerCase()
        return query.includes(cardName) || query.includes(cardholder)
      })
      
      if (matchedCard) {
        const cardDisplayName = matchedCard.nickname || matchedCard.cardName
        
        if (isFreezeAction) {
          if (matchedCard.status === 'frozen') {
            responseText = `The **${cardDisplayName}** card is already frozen.`
            metadata = {
              emptyState: {
                message: 'Card already frozen',
                suggestion: `This card held by ${matchedCard.cardholder} is currently frozen. Would you like to unfreeze it?`
              }
            }
          } else {
            responseText = `Ready to freeze the **${cardDisplayName}** card for ${matchedCard.cardholder}. This will immediately block all transactions.`
            metadata = {
              confirmationRequest: {
                id: `freeze-${matchedCard.id}`,
                action: 'freeze_card',
                targetId: matchedCard.id,
                targetName: cardDisplayName,
                currentValue: 'Active',
                newValue: 'Frozen',
              }
            }
          }
        } else if (isUnfreezeAction) {
          if (matchedCard.status === 'active') {
            responseText = `The **${cardDisplayName}** card is already active.`
          } else {
            responseText = `Ready to unfreeze the **${cardDisplayName}** card for ${matchedCard.cardholder}.`
            metadata = {
              confirmationRequest: {
                id: `unfreeze-${matchedCard.id}`,
                action: 'unfreeze_card',
                targetId: matchedCard.id,
                targetName: cardDisplayName,
                currentValue: 'Frozen',
                newValue: 'Active',
              }
            }
          }
        } else {
          // General card action - show card details
          responseText = `Here's the **${cardDisplayName}** card:\n\n`
          responseText += `- Cardholder: ${matchedCard.cardholder}\n`
          responseText += `- Status: ${matchedCard.status}\n`
          responseText += `- Spent: ${formatCurrency(matchedCard.spentThisMonth)} of ${formatCurrency(matchedCard.monthlyLimit)} limit\n`
        }
      } else {
        // No card matched - show all cards with actions
        responseText = `Which card would you like to ${isFreezeAction ? 'freeze' : isUnfreezeAction ? 'unfreeze' : 'manage'}? Here are your cards:`
        
        // Build cards table with action capability
        const cardRows = cards.map(c => ({
          id: c.id,
          cardholder: c.cardholder,
          cardLast4: c.cardNumber,
          cardName: c.nickname || c.cardName,
          spent: c.spentThisMonth,
          limit: c.monthlyLimit,
          status: c.status as 'active' | 'frozen' | 'cancelled',
        }))
        
        metadata = {
          cardsTable: {
            title: '',
            rows: cardRows,
            allowFreeze: true,
          },
          navigation: {
            target: 'Cards',
            url: '/cards',
            countdown: true
          }
        }
      }
      break
    }

    case 'TRANSACTION_SEARCH': {
      const query = message.toLowerCase()
      
      // Check for "recent transactions" query - return recent transactions
      const isRecentQuery = /\b(recent|latest|last|newest)\s*(transactions?|txns?|payments?)?\s*$/i.test(query) ||
        query === 'transactions' || query === 'txns' || query === 'recent transactions'
      
      // Detect if query asks for pending/completed/failed status
      const statusMatch = query.match(/\b(pending|completed|failed)\b/)
      const status = statusMatch ? statusMatch[1] as 'pending' | 'completed' | 'failed' : undefined
      
      // Detect amount filter (e.g., "over $5,000", "more than $1000", "$5000+")
      const overMatch = query.match(/(?:over|more than|above|greater than|exceeds?)\s*\$?([\d,]+)/i)
        || query.match(/\$([\d,]+)\s*\+/)
      const minAmount = overMatch ? parseInt(overMatch[1].replace(/,/g, ''), 10) : undefined
      
      // Detect "under" amount filter (e.g., "under $100", "less than $50", "below $200")
      const underMatch = query.match(/(?:under|less than|below|smaller than)\s*\$?([\d,]+)/i)
      const maxAmount = underMatch ? parseInt(underMatch[1].replace(/,/g, ''), 10) : undefined
      
      // Detect date filter
      let startDate: string | undefined
      let dateLabel = ''
      if (query.includes('last week') || query.includes('past week')) {
        startDate = getDateNDaysAgo(7)
        dateLabel = 'last week'
      } else if (query.includes('yesterday')) {
        startDate = getDateNDaysAgo(1)
        dateLabel = 'yesterday'
      } else if (query.includes('this month')) {
        const now = new Date()
        startDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
        dateLabel = 'this month'
      } else if (query.includes('last month') || query.includes('past month')) {
        startDate = getDateNDaysAgo(30)
        dateLabel = 'last 30 days'
      } else if (query.includes('this year')) {
        startDate = `${new Date().getFullYear()}-01-01`
        dateLabel = 'this year'
      }
      
      // Extract merchant/counterparty name from query (e.g., "transactions with Stripe", "txns from AWS")
      const merchantMatch = query.match(/(?:with|from|to|for|by)\s+([a-z0-9\s]+?)(?:\s+(?:over|above|last|this|in|during)|$)/i)
      const merchantFilter = merchantMatch ? merchantMatch[1].trim() : undefined
      
      // Build filters object
      const hasFilters = status || minAmount || maxAmount || startDate || merchantFilter
      let results: Transaction[]
      
      if (isRecentQuery && !hasFilters) {
        // "Recent transactions" - return the most recent 20 transactions
        results = getRecentTransactions(20)
      } else if (hasFilters) {
        // Apply filters via getTransactions
        results = getTransactions({ 
          status, 
          startDate,
          limit: 50 
        })
        
        // Apply merchant filter (case-insensitive)
        if (merchantFilter) {
          const filterLower = merchantFilter.toLowerCase()
          results = results.filter(t => 
            t.merchant.toLowerCase().includes(filterLower) ||
            t.description.toLowerCase().includes(filterLower)
          )
        }
        
        // Apply amount filter - minimum (over $X)
        if (minAmount) {
          results = results.filter(t => Math.abs(t.amount) >= minAmount)
        }
        
        // Apply amount filter - maximum (under $X)
        if (maxAmount) {
          results = results.filter(t => Math.abs(t.amount) < maxAmount)
        }
        
        // Sort by date (newest first) and limit results
        results = results
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 20)
      } else {
        // No filters and not "recent" - do text search on remaining query words
        // Extract meaningful search terms (remove common words)
        const stopWords = ['show', 'me', 'all', 'my', 'the', 'transactions', 'txns', 'transaction', 'please', 'find', 'get', 'list']
        const searchTerms = query.split(/\s+/).filter(w => !stopWords.includes(w) && w.length > 2)
        
        if (searchTerms.length > 0) {
          // Search for each term
          const allTxns = getTransactions()
          results = allTxns.filter(t => 
            searchTerms.some(term => 
              t.merchant.toLowerCase().includes(term) ||
              t.description.toLowerCase().includes(term) ||
              t.category.toLowerCase().includes(term)
            )
          ).slice(0, 20)
        } else {
          // No search terms - default to recent transactions
          results = getRecentTransactions(20)
        }
      }

      if (results.length > 0) {
        const total = results.reduce((sum, t) => sum + Math.abs(t.amount), 0)
        
        // Build description based on filters applied
        const filterParts: string[] = []
        if (merchantFilter) filterParts.push(`with ${merchantFilter}`)
        if (status) filterParts.push(status)
        if (minAmount) filterParts.push(`over ${formatCurrency(minAmount)}`)
        if (maxAmount) filterParts.push(`under ${formatCurrency(maxAmount)}`)
        if (dateLabel) filterParts.push(`from ${dateLabel}`)
        
        const filterDesc = filterParts.length > 0 ? filterParts.join(', ') + ' ' : ''
        const isRecent = isRecentQuery && !hasFilters
        responseText = isRecent 
          ? `Here are your **${results.length} most recent transactions** (${formatCurrency(total)} total):`
          : `I found **${results.length} ${filterDesc}transactions** (${formatCurrency(total)} total):`
        
        // Build navigation URL with query params
        const urlParams = new URLSearchParams()
        if (status) urlParams.set('status', status)
        if (minAmount) urlParams.set('minAmount', minAmount.toString())
        if (maxAmount) urlParams.set('maxAmount', maxAmount.toString())
        if (startDate) urlParams.set('startDate', startDate)
        if (merchantFilter) urlParams.set('merchant', merchantFilter)
        const navUrl = urlParams.toString() ? `/transactions?${urlParams.toString()}` : '/transactions'
        
        // Build transaction table metadata for UI rendering
        metadata = {
          transactionTable: {
            title: '',
            rows: results.map(t => ({
              id: t.id,
              description: t.description,
              merchant: t.merchant,
              amount: t.amount,
              date: t.date,
              status: t.status,
              category: t.category,
            })),
          },
          navigation: {
            target: 'Transactions',
            url: navUrl,
            countdown: true
          }
        }
      } else {
        const filterDesc = merchantFilter ? `with "${merchantFilter}"` : 
          (minAmount ? `over ${formatCurrency(minAmount)}` : 
          (maxAmount ? `under ${formatCurrency(maxAmount)}` : 
          (dateLabel ? `from ${dateLabel}` : '')))
        responseText = `I couldn't find any ${status ? status + ' ' : ''}transactions${filterDesc ? ' ' + filterDesc : ''}.`
        metadata = {
          emptyState: {
            message: 'No transactions found',
            suggestion: 'Try adjusting your filters or search for a different merchant name.'
          }
        }
      }
      break
    }

    case 'MISSING_RECEIPTS': {
      // Find transactions that are expenses (negative amount) and don't have attachments
      const txns = getTransactions()
        .filter(t => t.amount < 0 && !t.hasAttachment)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 20)
      
      if (txns.length > 0) {
        const total = txns.reduce((sum, t) => sum + Math.abs(t.amount), 0)
        responseText = `Found **${txns.length} transactions** (${formatCurrency(total)} total) missing receipts:`
        metadata = {
          transactionTable: {
            title: 'Missing Receipts',
            rows: txns.map(t => ({
              id: t.id,
              description: t.description,
              merchant: t.merchant,
              amount: t.amount,
              date: t.date,
              category: t.category,
              status: t.status,
            })),
          },
          navigation: {
            target: 'Transactions',
            url: '/transactions?filter=missing-receipt',
            countdown: true
          }
        }
      } else {
        responseText = `Great news! All your transactions have receipts attached.`
        metadata = {
          emptyState: {
            message: 'All receipts attached',
            suggestion: 'Your expense documentation is complete.'
          }
        }
      }
      break
    }

    case 'SEND_PAYMENT': {
      // Extract payment intent from message
      const paymentQuery = message.toLowerCase()
      const amountMatch = paymentQuery.match(/\$?([\d,]+(?:\.\d{2})?)/i)
      const amount = amountMatch ? parseFloat(amountMatch[1].replace(/,/g, '')) : undefined
      
      // Check for wire vs ACH
      const wireKeywords = ['wire', 'same day', 'urgent', 'immediately']
      const paymentType = wireKeywords.some(k => paymentQuery.includes(k)) ? 'wire' : 'ach'
      
      // Try to find recipient
      const recipients = getRecipients()
      const matchedRecipient = recipients.find(r => 
        paymentQuery.includes(r.name.toLowerCase())
      )
      
      if (matchedRecipient) {
        responseText = `Ready to send${amount ? ` **${formatCurrency(amount)}**` : ''} to **${matchedRecipient.name}**. Complete the details below:`
        metadata = {
          paymentForm: {
            recipientId: matchedRecipient.id,
            recipientName: matchedRecipient.name,
            suggestedAmount: amount,
            paymentType,
          }
        }
      } else {
        responseText = `Who would you like to send money to? Here are your recent recipients:`
        const topRecipients = recipients.slice(0, 8)
        metadata = {
          recipients: {
            title: 'Select a recipient',
            rows: topRecipients.map(r => ({
              id: r.id,
              name: r.name,
              lastPaidDate: r.lastPaid,
              lastPaidAmount: r.totalPaid ? r.totalPaid / 10 : undefined,
            })),
            allowPayment: true,
          }
        }
      }
      break
    }
    
    case 'CREATE_RECIPIENT': {
      // Extract recipient name from message
      const forMatch = message.match(/(?:for|add|create|new recipient)\s+([A-Z][a-zA-Z\s]+?)(?:\s*$|\s+with|\s+bank)/i)
      const suggestedName = forMatch ? forMatch[1].trim() : undefined
      
      responseText = suggestedName 
        ? `Let's add **${suggestedName}** as a new recipient. Enter their bank details below:`
        : `Let's add a new recipient. Enter their details below:`
      
      metadata = {
        recipientCreate: {
          suggestedName,
        }
      }
      break
    }
    
    case 'CREATE_INVOICE': {
      // Extract invoice details from message
      const invoiceQuery = message.toLowerCase()
      const amountMatch = invoiceQuery.match(/\$?([\d,]+(?:\.\d{2})?)/i)
      const amount = amountMatch ? parseFloat(amountMatch[1].replace(/,/g, '')) : undefined
      
      // Try to find client name
      const forMatch = message.match(/(?:for|to|invoice)\s+([A-Z][a-zA-Z\s]+?)(?:\s+for|\s+\$|\s*$)/i)
      const clientName = forMatch ? forMatch[1].trim() : undefined
      
      responseText = `Let's create an invoice${clientName ? ` for **${clientName}**` : ''}${amount ? ` for **${formatCurrency(amount)}**` : ''}. Fill in the details below:`
      
      metadata = {
        invoiceForm: {
          suggestedClient: clientName,
          suggestedAmount: amount,
        }
      }
      break
    }
    
    case 'UPLOAD_BILL': {
      responseText = `Upload a bill or invoice to schedule a payment. You can drag and drop a PDF or image, or click to select a file.`
      metadata = {
        billUpload: {
          acceptedFormats: ['pdf', 'png', 'jpg', 'jpeg'],
        }
      }
      break
    }
    
    case 'ISSUE_CARD': {
      // Extract card details from message
      const cardQuery = message.toLowerCase()
      const limitMatch = cardQuery.match(/\$?([\d,]+)/i)
      const limit = limitMatch ? parseFloat(limitMatch[1].replace(/,/g, '')) : undefined
      
      // Card type
      const isPhysical = cardQuery.includes('physical')
      const cardType = isPhysical ? 'physical' : 'virtual'
      
      // Try to find employee name
      const employees = getEmployees()
      const matchedEmployee = employees.find(e => 
        cardQuery.includes(`${e.firstName} ${e.lastName}`.toLowerCase()) ||
        cardQuery.includes(e.firstName.toLowerCase())
      )
      
      const matchedEmployeeName = matchedEmployee ? `${matchedEmployee.firstName} ${matchedEmployee.lastName}` : undefined
      
      responseText = matchedEmployee
        ? `Let's issue a ${cardType} card to **${matchedEmployeeName}**${limit ? ` with a **${formatCurrency(limit)}** monthly limit` : ''}. Confirm the details below:`
        : `Who should receive the new card? Select an employee below:`
      
      metadata = {
        cardIssue: {
          employeeId: matchedEmployee?.id,
          employeeName: matchedEmployeeName,
          cardType,
          suggestedLimit: limit || 2000,
          employees: employees.map(e => ({
            id: e.id,
            name: `${e.firstName} ${e.lastName}`,
            email: e.email,
            role: e.role,
          })),
        }
      }
      break
    }
    
    case 'CREATE_EMPLOYEE': {
      // Extract employee details from message
      const empMatch = message.match(/(?:invite|add|create)\s+([A-Z][a-zA-Z\s]+?)(?:\s+as|\s+with|\s+to|\s*$)/i)
      const suggestedName = empMatch ? empMatch[1].trim() : undefined
      
      const emailMatch = message.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i)
      const suggestedEmail = emailMatch ? emailMatch[1] : undefined
      
      responseText = suggestedName
        ? `Let's invite **${suggestedName}** to your Mercury account. Complete their details below:`
        : `Let's add a new team member. Enter their details below:`
      
      metadata = {
        employeeCreate: {
          suggestedName,
          suggestedEmail,
          roles: ['Admin', 'Bookkeeper', 'Card Only', 'Custom'],
        }
      }
      break
    }

    case 'CHITCHAT':
      responseText = classification.quickResponse || `I'm here to help with your ${company.name} Mercury account. What can I assist you with?`
      break

    default:
      responseText = classification.quickResponse || "I can help with accounts, transactions, payments, cards, and financial insights. What would you like to know?"
  }

  for (let i = 0; i < responseText.length; i += 3) {
    sendEvent('chunk', { text: responseText.slice(i, i + 3) })
    await sleep(15)
  }
  sendEvent('done', { metadata, conversationId })
}

async function handleWithSmartModel(
  client: Anthropic,
  sendEvent: (event: string, data: object) => void,
  message: string,
  history: Array<{ role: string; content: string }> | undefined,
  conversationId: string
): Promise<void> {
  const aiContext = buildAIContext()

  const systemPrompt = `You are Mercury Assistant, a warm and helpful AI assistant for Mercury banking.

You have access to the following financial data for this company. Use it to answer questions accurately.

${aiContext}

GUIDELINES:
- Be concise (2-4 sentences for simple questions, more for complex analysis)
- Use **bold** for important numbers and names
- When asked about spending, look at the transaction data
- When asked about runway, use the runway calculation provided
- For trends, compare recent periods
- If you're unsure, say so rather than making up data
- Mercury is a fintech company, not a bank. Say "Mercury account" not "bank account"`

  const messages: Anthropic.MessageParam[] = []
  if (history) {
    for (const h of history) {
      messages.push({ role: h.role as 'user' | 'assistant', content: h.content })
    }
  }
  messages.push({ role: 'user', content: message })

  try {
    const response = await client.messages.create({
      model: SMART_MODEL,
      max_tokens: 512,
      temperature: 0.7,
      system: systemPrompt,
      messages,
    })

    let responseText = ''
    for (const block of response.content) {
      if (block.type === 'text') {
        responseText += block.text
      }
    }

    for (let i = 0; i < responseText.length; i += 3) {
      sendEvent('chunk', { text: responseText.slice(i, i + 3) })
      await sleep(15)
    }
  } catch (e) {
    console.error('Smart model error:', e)
    sendEvent('chunk', { text: "I encountered an issue. Please try again." })
  }

  sendEvent('done', { conversationId })
}

async function handleSupportMode(
  client: Anthropic,
  sendEvent: (event: string, data: object) => void,
  message: string,
  history: Array<{ role: string; content: string }> | undefined,
  conversationId: string
): Promise<void> {
  const aiContext = buildAIContext()

  const systemPrompt = `You are Mercury Support, a friendly and knowledgeable support agent for Mercury banking.

Your role is to help users with:
- Account questions and troubleshooting
- Understanding their transactions and statements
- Card issues (freezing, limits, replacements)
- Payment problems and recipient management
- General questions about Mercury features

You have access to the following account data to help resolve issues:

${aiContext}

GUIDELINES:
- Be warm, empathetic, and patient
- Acknowledge the user's concern before providing solutions
- Use **bold** for important information and action items
- Provide step-by-step guidance when explaining processes
- If you can see the issue in their data, proactively mention it
- If you cannot resolve an issue, explain what the next steps would be
- Always ask if there's anything else you can help with
- Sign off as "Mercury Support" or just "Support"`

  const messages: Anthropic.MessageParam[] = []
  if (history) {
    for (const h of history) {
      messages.push({ role: h.role as 'user' | 'assistant', content: h.content })
    }
  }
  messages.push({ role: 'user', content: message })

  try {
    const response = await client.messages.create({
      model: SMART_MODEL,
      max_tokens: 512,
      temperature: 0.7,
      system: systemPrompt,
      messages,
    })

    let responseText = ''
    for (const block of response.content) {
      if (block.type === 'text') {
        responseText += block.text
      }
    }

    for (let i = 0; i < responseText.length; i += 3) {
      sendEvent('chunk', { text: responseText.slice(i, i + 3) })
      await sleep(15)
    }
  } catch (e) {
    console.error('Support mode error:', e)
    sendEvent('chunk', { text: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment." })
  }

  sendEvent('done', { conversationId, metadata: { supportMode: true } })
}

async function handleAgentMode(
  sendEvent: (event: string, data: object) => void,
  message: string,
  history: Array<{ role: string; content: string }> | undefined,
  conversationId: string
): Promise<void> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    sendEvent('chunk', { text: "I need an API key to run agent mode workflows." })
    sendEvent('done', { conversationId })
    return
  }

  try {
    const client = new Anthropic({ apiKey })

    sendEvent('block', {
      type: 'thinking_chain',
      data: {
        steps: [{ id: 'step-1', label: 'Looking up employees...', status: 'pending', tool: 'get_employees' }],
        status: 'thinking'
      }
    })
    await sleep(500)

    const employees = getEmployees()
    const employeesNeedingCards = employees.filter(e => !e.cardId)

    sendEvent('block', {
      type: 'thinking_chain',
      data: {
        steps: [{ id: 'step-1', label: 'Found employees', status: 'complete', tool: 'get_employees' }],
        status: 'complete'
      }
    })

    sendEvent('block', {
      type: 'employee_table',
      data: {
        title: 'Employees Needing Cards',
        rows: employeesNeedingCards.map(e => ({
          id: e.id,
          name: `${e.firstName} ${e.lastName}`,
          email: e.email,
          department: e.department,
          salary: e.salary,
          hasCard: !!e.cardId
        })),
        selectable: true
      }
    })

    const response = await client.messages.create({
      model: ROUTER_MODEL,
      max_tokens: 512,
      temperature: 0.7,
      system: `You are Mercury Assistant helping with card issuance. Be helpful and concise.`,
      messages: [
        { role: 'user', content: message },
        { role: 'assistant', content: `I found ${employeesNeedingCards.length} employees who don't have cards yet:\n\n${employeesNeedingCards.map(e => `- **${e.firstName} ${e.lastName}** (${e.department}) - ${e.email}`).join('\n')}\n\nWould you like me to issue cards to all of them, or would you prefer to select specific employees?` }
      ]
    })

    let responseText = ''
    for (const block of response.content) {
      if (block.type === 'text') {
        responseText = block.text
      }
    }

    if (!responseText) {
      responseText = `I found ${employeesNeedingCards.length} employees who don't have cards yet. Would you like me to issue cards to all of them?`
    }

    for (let i = 0; i < responseText.length; i += 3) {
      sendEvent('chunk', { text: responseText.slice(i, i + 3) })
      await sleep(15)
    }

  } catch (error) {
    console.error('Agent mode error:', error)
    sendEvent('chunk', { text: "I'd be happy to help you issue cards! Let me take you to the Cards page." })
    sendEvent('block', {
      type: 'navigation',
      data: { target: 'cards', url: '/cards' }
    })
  }

  sendEvent('done', { conversationId })
}

async function streamMockResponse(
  sendEvent: (event: string, data: object) => void,
  message: string,
  conversationId: string
): Promise<void> {
  const lowerMessage = message.toLowerCase()
  let responseText = "I can help with accounts, transactions, payments, cards, and financial insights."

  if (lowerMessage.includes('balance')) {
    const accounts = getAccounts()
    const list = accounts.map(a => `**${a.name}**: ${formatCurrency(a.balance)}`).join('\n')
    responseText = `Your account balances:\n\n${list}`
  } else if (lowerMessage.includes('transaction')) {
    const txns = getRecentTransactions(5)
    responseText = 'Recent transactions:\n' + txns.map(t => `- ${t.merchant}: ${formatCurrency(t.amount)}`).join('\n')
  } else if (lowerMessage.includes('runway') || lowerMessage.includes('burn')) {
    const runway = getRunwayEstimate()
    responseText = `Your runway is **${runway.monthsRemaining} months** at ${formatCurrency(runway.monthlyBurn)}/month burn rate.`
  }

  for (let i = 0; i < responseText.length; i += 3) {
    sendEvent('chunk', { text: responseText.slice(i, i + 3) })
    await sleep(20)
  }
  sendEvent('done', { conversationId })
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.setHeader('X-Accel-Buffering', 'no')

  const sendEvent = createEventSender(res)

  try {
    const { message, conversationId, history, agentMode } = req.body || {}

    const convId = conversationId || generateConversationId()
    
    // Handle empty or missing message with a friendly greeting
    if (!message || typeof message !== 'string' || message.trim() === '') {
      const greetingText = `Hi! I'm Mercury Assistant. How can I help you today?\n\n` +
        `I can help with:\n\n` +
        `• **Balances** — Check your account balances\n` +
        `• **Transactions** — Search and filter transactions\n` +
        `• **Cards** — View and manage your cards\n` +
        `• **Payments** — Send payments to recipients\n` +
        `• **Documents** — Access statements and tax docs\n\n` +
        `Just ask me anything about your Mercury account!`
      
      for (let i = 0; i < greetingText.length; i += 3) {
        sendEvent('chunk', { text: greetingText.slice(i, i + 3) })
        await sleep(10)
      }
      sendEvent('done', { conversationId: convId })
      res.end()
      return
    }

    const apiKey = process.env.ANTHROPIC_API_KEY
    const isSupportMode = agentMode === 'support'

    if (apiKey) {
      try {
        const client = new Anthropic({ apiKey })

        // Check for boundary case FIRST - before any LLM classification
        // This ensures boundary responses are always used for out-of-scope queries
        const boundaryType = detectBoundaryType(message)
        if (boundaryType && !isSupportMode) {
          sendEvent('ack', { message: 'Let me help with that...' })
          const urgency = detectUrgency(message)
          const boundaryResponse = generateBoundaryResponse(boundaryType, urgency)
          if (boundaryResponse) {
            sendEvent('text_delta', { content: boundaryResponse.responseText })
            sendEvent('done', { 
              conversationId: convId,
              metadata: boundaryResponse.metadata 
            })
            return
          }
        }

        sendEvent('ack', { message: isSupportMode ? 'Connecting to support...' : 'Understanding your request...' })

        // In support mode, skip classification and go straight to support handler
        if (isSupportMode) {
          await sleep(300)
          await handleSupportMode(client, sendEvent, message, history, convId)
        } else {
          const classification = await classifyQuery(client, message)

          if (classification.intent === 'AGENT_MODE') {
            sendEvent('ack', { message: classification.handoffMessage || 'Starting workflow...' })
            await handleAgentMode(sendEvent, message, history, convId)
          } else if (classification.needsSmartModel) {
            sendEvent('ack', { message: classification.handoffMessage || 'Looking into that...' })
            await sleep(300)
            await handleWithSmartModel(client, sendEvent, message, history, convId)
          } else {
            await handleWithRouter(sendEvent, message, classification, convId)
          }
        }
      } catch (apiError) {
        console.error('API error:', apiError)
        await streamMockResponse(sendEvent, message, convId)
      }
    } else {
      sendEvent('ack', { message: 'Processing...' })
      await streamMockResponse(sendEvent, message, convId)
    }

    res.end()
  } catch (error) {
    console.error('Chat API error:', error)
    sendEvent('error', { error: error instanceof Error ? error.message : 'Unknown error' })
    res.end()
  }
}

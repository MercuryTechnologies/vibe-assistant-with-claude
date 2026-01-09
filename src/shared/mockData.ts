// =============================================================================
// Unified Mock Data - Single Source of Truth
// =============================================================================
// This is the ONLY mock data file for the entire app.
// Both frontend pages and the chat agent use this data.

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export interface Merchant {
  name: string
  initials: string
  category: string
  icon?: string
}

export interface Account {
  id: string
  name: string
  balance: number
  type: 'checking' | 'savings'
  accountNumber: string
}

export interface Card {
  id: string
  name: string
  last4: string
  status: 'active' | 'frozen' | 'cancelled'
  limit: number
  spent: number
}

/**
 * Unified Transaction type used across the entire app.
 * This works for both the frontend UI and the chat agent.
 */
export interface Transaction {
  id: string
  date: string // ISO format: YYYY-MM-DD
  
  // Counterparty info (works as toFrom in UI)
  counterparty: string
  counterpartyInitials: string
  counterpartyIcon?: string
  
  amount: number // Positive = incoming, Negative = outgoing
  account: string
  
  // Method details
  method: 'ach' | 'wire' | 'card' | 'stripe' | 'check' | 'transfer' | 'loan' | 'invoice'
  methodDirection?: 'in' | 'out'
  cardHolder?: string
  cardLast4?: string
  
  // Categorization
  category?: string
  categoryAutoApplied?: boolean
  
  // Additional metadata
  description?: string | null
  hasAttachment?: boolean
  status: 'completed' | 'pending' | 'failed'
  
  // Dashboard link for chat agent
  dashboardLink?: string
  
  // Suspicious transaction alert
  alert?: TransactionAlert
}

// Alert types for suspicious transactions
export type AlertType = 'possible-duplicate' | 'subscription-increase' | 'new-vendor'

export interface TransactionAlert {
  type: AlertType
  reason: string
  details?: {
    previousAmount?: number
    previousDate?: string
    percentChange?: number
    comparisonPeriod?: string
  }
}

export interface CategoryBreakdown {
  category: string
  amount: number
}

export interface CashflowData {
  moneyIn: number
  moneyOut: number
  netChange: number
  trend: 'positive' | 'negative' | 'neutral'
  period: string
}

export interface InsightsData {
  totalBalance: number
  cashflow: CashflowData
  accounts: Array<{ name: string; balance: number; type: string }>
  topSpendingCategories: CategoryBreakdown[]
  transactionCount: number
}

export interface TransactionsSummary {
  last30Days: {
    moneyIn: number
    moneyOut: number
    netChange: number
    transactionCount: number
  }
}

// -----------------------------------------------------------------------------
// Static Data
// -----------------------------------------------------------------------------

export const merchants: Merchant[] = [
  { name: 'AWS', initials: 'AW', category: 'Software & Subscriptions' },
  { name: 'Google Cloud', initials: 'GC', category: 'Software & Subscriptions' },
  { name: 'Stripe', initials: 'S', category: 'Revenue' },
  { name: 'Shopify', initials: 'SH', category: 'Revenue' },
  { name: 'Gusto', initials: 'G', category: 'Payroll' },
  { name: 'Rippling', initials: 'R', category: 'Payroll' },
  { name: 'Slack', initials: 'SL', category: 'Software & Subscriptions' },
  { name: 'Figma', initials: 'FI', category: 'Software & Subscriptions' },
  { name: 'Notion', initials: 'N', category: 'Software & Subscriptions' },
  { name: 'Vercel', initials: 'V', category: 'Software & Subscriptions' },
  { name: 'GitHub', initials: 'GH', category: 'Software & Subscriptions' },
  { name: 'Linear', initials: 'LN', category: 'Software & Subscriptions' },
  { name: 'Cursor', initials: 'CU', category: 'Software & Subscriptions' },
  { name: 'OpenAI', initials: 'OA', category: 'Software & Subscriptions' },
  { name: 'Anthropic', initials: 'AN', category: 'Software & Subscriptions' },
  { name: 'WeWork', initials: 'WW', category: 'Rent & Utilities' },
  { name: 'PG&E', initials: 'PG', category: 'Rent & Utilities' },
  { name: 'Comcast Business', initials: 'CB', category: 'Rent & Utilities' },
  { name: 'Delta Airlines', initials: 'DA', category: 'Travel & Transportation' },
  { name: 'United Airlines', initials: 'UA', category: 'Travel & Transportation' },
  { name: 'Uber', initials: 'UB', category: 'Travel & Transportation' },
  { name: 'Lyft', initials: 'LY', category: 'Travel & Transportation' },
  { name: 'Blue Bottle Coffee', initials: 'BB', category: 'Business Meals' },
  { name: 'Sweetgreen', initials: 'SG', category: 'Business Meals' },
  { name: "Lily's Eatery", initials: 'LE', category: 'Business Meals' },
  { name: 'Office Depot', initials: 'OD', category: 'Office Supplies & Equipment' },
  { name: 'Apple', initials: 'AP', category: 'Office Supplies & Equipment' },
  { name: 'Best Buy', initials: 'BB', category: 'Office Supplies & Equipment' },
  { name: 'Acme Corp', initials: 'AC', category: 'Revenue' },
  { name: 'TechStart Inc', initials: 'TS', category: 'Revenue' },
  { name: 'GlobalTech Solutions', initials: 'GT', category: 'Revenue' },
  { name: 'Mercury Working Capital', initials: 'M', icon: 'mercury', category: 'Credit & Loan Payments' },
  { name: 'NASA', initials: 'N', category: 'Revenue' },
  { name: 'Payment from NASA', initials: 'P', category: 'Revenue' },
  { name: 'Payment from Acme Corp', initials: 'P', category: 'Revenue' },
  { name: 'Deli 77', initials: 'D7', category: 'Business Meals' },
  { name: 'Office Stop Co.', initials: 'OS', category: 'Office Supplies & Equipment' },
  { name: "Trader John's", initials: 'TJ', category: 'Business Meals' },
  { name: 'Milgram Brokerage', initials: 'MB', category: 'Revenue' },
  { name: 'Monarch Books', initials: 'MB', category: 'Office Supplies & Equipment' },
  { name: 'The Plant Organic Cafe', initials: 'P', category: 'Business Meals' },
]

export const accounts: Account[] = [
  { id: 'acct-1', name: 'Mercury Checking', balance: 2459832.17, type: 'checking', accountNumber: '****4521' },
  { id: 'acct-2', name: 'Mercury Savings', balance: 500000.00, type: 'savings', accountNumber: '****8834' },
  { id: 'acct-3', name: 'Ops / Payroll', balance: 145000.00, type: 'checking', accountNumber: '****2211' },
  { id: 'acct-4', name: 'Treasury', balance: 1200000.00, type: 'savings', accountNumber: '****9900' },
]

export const cards: Card[] = [
  { id: 'card-1', name: 'Sarah Chen', last4: '4532', status: 'active', limit: 25000, spent: 12450 },
  { id: 'card-2', name: 'John Smith', last4: '7891', status: 'active', limit: 15000, spent: 3200 },
  { id: 'card-3', name: 'Jane Baker', last4: '1234', status: 'active', limit: 10000, spent: 8900 },
  { id: 'card-4', name: 'Mike Johnson', last4: '5555', status: 'frozen', limit: 5000, spent: 0 },
]

// Account name aliases (for frontend display)
export const accountNames = ['Mercury Checking', 'Ops / Payroll', 'Mercury Savings', 'Treasury', 'AR', 'Credit account']

// Card holders for transaction generation
export const cardHolders = [
  { name: 'Jane B.', last4: '1234' },
  { name: 'Jane B.', last4: '5555' },
  { name: 'Landon S.', last4: '4929' },
  { name: 'Jessica A.', last4: '9914' },
  { name: 'Landon S.', last4: '0331' },
  { name: 'Jane B.', last4: '2345' },
  { name: 'Aluna T.', last4: '7840' },
  { name: 'Sarah Chen', last4: '4532' },
  { name: 'John Smith', last4: '7891' },
]

// Categories for GL codes
export const categories = [
  'Bank Fees',
  'Business Meals',
  'COGS',
  'Credit & Loan Payments',
  'Employee Benefits',
  'Entertainment',
  'Financing Proceeds',
  'Insurance',
  'Interest Earned',
  'Inventory & Materials',
  'Legal & Professional Services',
  'Marketing & Advertising',
  'Office Supplies & Equipment',
  'Payment Processing Fees',
  'Payroll',
  'Rent & Utilities',
  'Revenue',
  'Shipping & Postage',
  'Software & Subscriptions',
  'Taxes',
  'Transfer',
  'Travel & Transportation',
]

// -----------------------------------------------------------------------------
// Transaction Generation
// -----------------------------------------------------------------------------

// Seeded random for consistent data across page loads
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

interface RecurringTransaction {
  merchant: string
  amount: number
  day: number
  account: string
  method: Transaction['method']
  cardHolder?: string
  cardLast4?: string
  description?: string
}

function generateTransactions(): Transaction[] {
  const transactions: Transaction[] = []
  let seed = 12345 // Fixed seed for consistency
  
  // Recurring transactions (predictable)
  // Note: Cursor spend increases each month to match the insight about +15% MoM growth
  const recurring: RecurringTransaction[] = [
    { merchant: 'AWS', amount: -2847.32, day: 1, account: 'Mercury Checking', method: 'ach' },
    { merchant: 'Google Cloud', amount: -1243.50, day: 1, account: 'Mercury Checking', method: 'ach' },
    { merchant: 'Slack', amount: -1250.00, day: 1, account: 'Mercury Checking', method: 'card', cardHolder: 'Sarah Chen', cardLast4: '4532' },
    { merchant: 'Gusto', amount: -89500.00, day: 15, account: 'Ops / Payroll', method: 'ach', description: 'Payroll' },
    { merchant: 'Gusto', amount: -89500.00, day: 30, account: 'Ops / Payroll', method: 'ach', description: 'Payroll' },
    { merchant: 'WeWork', amount: -15000.00, day: 1, account: 'Mercury Checking', method: 'ach', description: 'Office rent' },
    { merchant: 'Figma', amount: -450.00, day: 5, account: 'Mercury Checking', method: 'card', cardHolder: 'Sarah Chen', cardLast4: '4532' },
    { merchant: 'GitHub', amount: -525.00, day: 7, account: 'Mercury Checking', method: 'card', cardHolder: 'John Smith', cardLast4: '7891' },
    { merchant: 'Notion', amount: -960.00, day: 10, account: 'Mercury Checking', method: 'card', cardHolder: 'Sarah Chen', cardLast4: '4532' },
    { merchant: 'OpenAI', amount: -2100.00, day: 12, account: 'Mercury Checking', method: 'card', cardHolder: 'Sarah Chen', cardLast4: '4532' },
    { merchant: 'Vercel', amount: -320.00, day: 15, account: 'Mercury Checking', method: 'card', cardHolder: 'John Smith', cardLast4: '7891' },
  ]
  
  // Add recurring transactions for each month
  let txnId = 1
  for (let monthOffset = 0; monthOffset < 3; monthOffset++) {
    for (const r of recurring) {
      const date = new Date()
      date.setMonth(date.getMonth() - monthOffset)
      date.setDate(Math.min(r.day, 28)) // Avoid invalid dates
      
      if (date <= new Date()) {
        const merchantData = merchants.find(m => m.name === r.merchant) || { name: r.merchant, initials: r.merchant[0], category: 'Other' }
        transactions.push({
          id: `txn-${txnId++}`,
          date: date.toISOString().split('T')[0],
          counterparty: merchantData.name,
          counterpartyInitials: merchantData.initials,
          counterpartyIcon: (merchantData as Merchant).icon,
          amount: r.amount,
          account: r.account,
          method: r.method,
          methodDirection: r.amount > 0 ? 'in' : 'out',
          cardHolder: r.cardHolder,
          cardLast4: r.cardLast4,
          category: merchantData.category,
          description: r.description || null,
          status: 'completed',
          dashboardLink: '/transactions',
        })
      }
    }
  }
  
  // Add Cursor transactions with increasing spend pattern (for the insight)
  // September: $5,987, August: $5,009, July: $4,356
  const cursorTransactions: { monthOffset: number; amount: number }[] = [
    { monthOffset: 0, amount: -5987.00 },  // Current month (September in the insight)
    { monthOffset: 1, amount: -5009.00 },  // August
    { monthOffset: 2, amount: -4356.00 },  // July
  ]
  
  for (const cursor of cursorTransactions) {
    const date = new Date()
    date.setMonth(date.getMonth() - cursor.monthOffset)
    date.setDate(18) // Mid-month billing
    
    if (date <= new Date()) {
      const merchantData = merchants.find(m => m.name === 'Cursor')!
      transactions.push({
        id: `txn-${txnId++}`,
        date: date.toISOString().split('T')[0],
        counterparty: 'Cursor',
        counterpartyInitials: merchantData.initials,
        amount: cursor.amount,
        account: 'Mercury Checking',
        method: 'card',
        methodDirection: 'out',
        cardHolder: 'Sarah Chen',
        cardLast4: '4532',
        category: 'Software & Subscriptions',
        description: 'Cursor Pro Team subscription',
        status: 'completed',
        dashboardLink: '/transactions',
      })
    }
  }
  
  // Add revenue transactions (incoming)
  const revenueClients = ['Stripe', 'Acme Corp', 'TechStart Inc', 'GlobalTech Solutions', 'Shopify']
  for (let i = 0; i < 25; i++) {
    const date = new Date()
    date.setDate(date.getDate() - Math.floor(seededRandom(seed++) * 60))
    const client = revenueClients[Math.floor(seededRandom(seed++) * revenueClients.length)]
    const merchantData = merchants.find(m => m.name === client)
    const amount = Math.round((5000 + seededRandom(seed++) * 45000) * 100) / 100
    
    transactions.push({
      id: `txn-${txnId++}`,
      date: date.toISOString().split('T')[0],
      counterparty: client,
      counterpartyInitials: merchantData?.initials || client[0],
      amount: amount, // Positive = incoming
      account: 'Mercury Checking',
      method: client === 'Stripe' ? 'stripe' : 'wire',
      methodDirection: 'in',
      category: 'Revenue',
      description: client === 'Stripe' ? 'Stripe payout' : `Payment from ${client}`,
      status: 'completed',
      dashboardLink: '/transactions',
    })
  }
  
  // Add miscellaneous card transactions
  const miscMerchants = ['Blue Bottle Coffee', 'Sweetgreen', "Lily's Eatery", 'Uber', 'Lyft', 'Office Depot', 'Apple', 'Best Buy', 'Deli 77', "Trader John's", 'The Plant Organic Cafe']
  for (let i = 0; i < 40; i++) {
    const date = new Date()
    date.setDate(date.getDate() - Math.floor(seededRandom(seed++) * 45))
    const merchant = miscMerchants[Math.floor(seededRandom(seed++) * miscMerchants.length)]
    const merchantData = merchants.find(m => m.name === merchant)
    const cardIndex = Math.floor(seededRandom(seed++) * cardHolders.length)
    const card = cardHolders[cardIndex]
    const amount = -Math.round((10 + seededRandom(seed++) * 500) * 100) / 100
    
    transactions.push({
      id: `txn-${txnId++}`,
      date: date.toISOString().split('T')[0],
      counterparty: merchant,
      counterpartyInitials: merchantData?.initials || merchant[0],
      amount: amount,
      account: seededRandom(seed++) > 0.7 ? 'Credit account' : 'Ops / Payroll',
      method: 'card',
      methodDirection: 'out',
      cardHolder: card.name,
      cardLast4: card.last4,
      category: merchantData?.category,
      categoryAutoApplied: seededRandom(seed++) > 0.6,
      status: 'completed',
      dashboardLink: '/transactions',
    })
  }
  
  // Add invoice transactions
  const invoiceClients = ['NASA', 'Acme Corp', 'Milgram Brokerage']
  for (let i = 0; i < 10; i++) {
    const date = new Date()
    date.setDate(date.getDate() - Math.floor(seededRandom(seed++) * 60))
    const client = invoiceClients[Math.floor(seededRandom(seed++) * invoiceClients.length)]
    const amount = Math.round((1000 + seededRandom(seed++) * 20000) * 100) / 100
    
    transactions.push({
      id: `txn-${txnId++}`,
      date: date.toISOString().split('T')[0],
      counterparty: `Payment from ${client}`,
      counterpartyInitials: 'P',
      amount: amount,
      account: 'AR',
      method: 'invoice',
      methodDirection: 'in',
      category: 'Revenue',
      description: `Invoice payment from ${client}`,
      status: seededRandom(seed++) > 0.9 ? 'failed' : 'completed',
      dashboardLink: '/transactions',
    })
  }
  
  // Add internal transfers
  for (let i = 0; i < 5; i++) {
    const date = new Date()
    date.setDate(date.getDate() - Math.floor(seededRandom(seed++) * 30))
    const amount = Math.round((10000 + seededRandom(seed++) * 50000) * 100) / 100
    
    // Transfer out
    transactions.push({
      id: `txn-${txnId++}`,
      date: date.toISOString().split('T')[0],
      counterparty: 'To Ops / Payroll',
      counterpartyInitials: 'M',
      counterpartyIcon: 'mercury',
      amount: -amount,
      account: 'AR',
      method: 'transfer',
      methodDirection: 'out',
      category: 'Transfer',
      status: 'completed',
      dashboardLink: '/transactions',
    })
    
    // Transfer in
    transactions.push({
      id: `txn-${txnId++}`,
      date: date.toISOString().split('T')[0],
      counterparty: 'From AR',
      counterpartyInitials: 'M',
      counterpartyIcon: 'mercury',
      amount: amount,
      account: 'Ops / Payroll',
      method: 'transfer',
      methodDirection: 'in',
      category: 'Transfer',
      status: 'completed',
      dashboardLink: '/transactions',
    })
  }
  
  // Add loan payments
  for (let i = 0; i < 3; i++) {
    const date = new Date()
    date.setMonth(date.getMonth() - i)
    date.setDate(8)
    
    transactions.push({
      id: `txn-${txnId++}`,
      date: date.toISOString().split('T')[0],
      counterparty: 'Mercury Working Capital',
      counterpartyInitials: 'M',
      counterpartyIcon: 'mercury',
      amount: -2200.00,
      account: 'Ops / Payroll',
      method: 'loan',
      methodDirection: 'out',
      category: 'Credit & Loan Payments',
      status: 'completed',
      dashboardLink: '/transactions',
    })
  }
  
  // Add a few recent specific transactions for demo purposes
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const twoDaysAgo = new Date(today)
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)
  
  transactions.push({
    id: `txn-${txnId++}`,
    date: yesterday.toISOString().split('T')[0],
    counterparty: 'AWS',
    counterpartyInitials: 'AW',
    amount: -3421.89,
    account: 'Mercury Checking',
    method: 'ach',
    methodDirection: 'out',
    category: 'Software & Subscriptions',
    description: 'AWS usage charges',
    status: 'completed',
    dashboardLink: '/transactions',
  })
  
  transactions.push({
    id: `txn-${txnId++}`,
    date: today.toISOString().split('T')[0],
    counterparty: 'Stripe',
    counterpartyInitials: 'S',
    amount: 28450.00,
    account: 'Mercury Checking',
    method: 'stripe',
    methodDirection: 'in',
    category: 'Revenue',
    description: 'Stripe payout - Weekly',
    status: 'completed',
    dashboardLink: '/transactions',
  })
  
  transactions.push({
    id: `txn-${txnId++}`,
    date: twoDaysAgo.toISOString().split('T')[0],
    counterparty: 'Delta Airlines',
    counterpartyInitials: 'DA',
    amount: -1847.50,
    account: 'Mercury Checking',
    method: 'card',
    methodDirection: 'out',
    cardHolder: 'Sarah Chen',
    cardLast4: '4532',
    category: 'Travel & Transportation',
    description: 'Flight to NYC - Team offsite',
    status: 'completed',
    dashboardLink: '/transactions',
  })
  
  // Add Blue Bottle Coffee for the new vendor alert
  const threeDaysAgo = new Date()
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)
  transactions.push({
    id: `txn-${txnId++}`,
    date: threeDaysAgo.toISOString().split('T')[0],
    counterparty: 'Blue Bottle Coffee',
    counterpartyInitials: 'BB',
    amount: -127.50,
    account: 'Mercury Checking',
    method: 'card',
    methodDirection: 'out',
    cardHolder: 'Jane Baker',
    cardLast4: '1234',
    category: 'Business Meals',
    description: 'Team coffee meeting',
    status: 'completed',
    dashboardLink: '/transactions',
  })
  
  // Sort by date descending
  transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  
  // Flag suspicious transactions by row index (rows 1, 6, 9, 14 = indices 0, 5, 8, 13)
  const alertConfigs: Array<{ index: number; alert: TransactionAlert }> = [
    {
      index: 0,
      alert: {
        type: 'subscription-increase',
        reason: 'This charge is 25% higher than last month. The increase appears to correlate with new team members added this billing cycle.',
        details: { percentChange: 25, comparisonPeriod: 'last month' }
      }
    },
    {
      index: 5,
      alert: {
        type: 'possible-duplicate',
        reason: 'A similar charge was posted 3 days ago. This may be a duplicate or a mid-cycle adjustment. Worth verifying with the vendor.',
        details: { previousDate: '3 days ago' }
      }
    },
    {
      index: 8,
      alert: {
        type: 'new-vendor',
        reason: 'First transaction with this vendor. New vendors are flagged for visibility since they haven\'t been used before.',
      }
    },
    {
      index: 13,
      alert: {
        type: 'subscription-increase',
        reason: 'This charge is 40% higher than your 3-month average. This likely reflects increased usage or a plan upgrade.',
        details: { percentChange: 40, comparisonPeriod: '3-month average' }
      }
    }
  ]
  
  alertConfigs.forEach(({ index, alert }) => {
    if (transactions[index]) {
      transactions[index].alert = alert
    }
  })
  
  return transactions
}

// Generate the data once - this is the single source of truth
export const MOCK_TRANSACTIONS: Transaction[] = generateTransactions()

// -----------------------------------------------------------------------------
// Query Functions
// -----------------------------------------------------------------------------

/**
 * Search transactions by query string
 */
export function searchTransactions(query?: string, limit: number = 10): Transaction[] {
  const q = (query || '').toLowerCase()
  
  let results = MOCK_TRANSACTIONS
  
  if (q) {
    results = MOCK_TRANSACTIONS.filter(txn => {
      return (
        txn.counterparty.toLowerCase().includes(q) ||
        (txn.description && txn.description.toLowerCase().includes(q)) ||
        (txn.category && txn.category.toLowerCase().includes(q)) ||
        (txn.cardHolder && txn.cardHolder.toLowerCase().includes(q))
      )
    })
  }
  
  return results.slice(0, limit)
}

/**
 * Get transaction by ID
 */
export function getTransactionById(id: string): Transaction | undefined {
  return MOCK_TRANSACTIONS.find(txn => txn.id === id)
}

/**
 * Get all flagged/suspicious transactions
 */
export function getFlaggedTransactions(): LegacyTransaction[] {
  return getLegacyTransactions().filter(txn => txn.alert)
}

/**
 * Get transactions summary for last 30 days
 */
export function getTransactionsSummary(): TransactionsSummary {
  const now = new Date()
  const thirtyDaysAgo = new Date(now)
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  
  const recentTxns = MOCK_TRANSACTIONS.filter(txn => new Date(txn.date) >= thirtyDaysAgo)
  
  const moneyIn = recentTxns.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0)
  const moneyOut = recentTxns.filter(t => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0)
  
  return {
    last30Days: {
      moneyIn,
      moneyOut,
      netChange: moneyIn - moneyOut,
      transactionCount: recentTxns.length,
    }
  }
}

/**
 * Get insights page data (cash flow, balances, trends)
 * This is the main function that should be used by both frontend and agent
 */
export function getInsightsData(): InsightsData {
  const summary = getTransactionsSummary()
  const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0)
  
  // Calculate category breakdown for last 30 days
  const now = new Date()
  const thirtyDaysAgo = new Date(now)
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const recentTxns = MOCK_TRANSACTIONS.filter(txn => new Date(txn.date) >= thirtyDaysAgo)
  
  const categoryBreakdown: Record<string, number> = {}
  recentTxns.filter(t => t.amount < 0).forEach(t => {
    const cat = t.category || 'Uncategorized'
    categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + Math.abs(t.amount)
  })
  
  // Sort by amount descending
  const topCategories: CategoryBreakdown[] = Object.entries(categoryBreakdown)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([category, amount]) => ({ category, amount }))
  
  // Calculate net cash flow trend (positive = more money in than out)
  const netCashflow = summary.last30Days.moneyIn - summary.last30Days.moneyOut
  const cashflowTrend: 'positive' | 'negative' | 'neutral' = 
    netCashflow > 0 ? 'positive' : netCashflow < -10000 ? 'negative' : 'neutral'
  
  return {
    totalBalance,
    cashflow: {
      moneyIn: summary.last30Days.moneyIn,
      moneyOut: summary.last30Days.moneyOut,
      netChange: netCashflow,
      trend: cashflowTrend,
      period: 'last 30 days',
    },
    accounts: accounts.map(a => ({ name: a.name, balance: a.balance, type: a.type })),
    topSpendingCategories: topCategories,
    transactionCount: summary.last30Days.transactionCount,
  }
}

/**
 * Get wire transactions
 */
export function getWireTransactions(limit: number = 20): Transaction[] {
  return MOCK_TRANSACTIONS
    .filter(txn => txn.method === 'wire')
    .slice(0, limit)
}

/**
 * Get top transactions by amount
 */
export function getTopTransactions(
  direction: 'in' | 'out' | 'all' = 'out',
  limit: number = 5
): Transaction[] {
  let results = [...MOCK_TRANSACTIONS]
  
  // Filter by direction
  if (direction === 'out') {
    results = results.filter(t => t.amount < 0)
  } else if (direction === 'in') {
    results = results.filter(t => t.amount > 0)
  }
  
  // Sort by absolute amount (biggest first)
  results.sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount))
  
  return results.slice(0, limit)
}

/**
 * Filter transactions by type/method
 */
export function filterTransactionsByType(type: string, limit: number = 50): Transaction[] {
  const typeMapping: Record<string, string[]> = {
    'wire': ['wire'],
    'ach': ['ach'],
    'card': ['card'],
    'stripe': ['stripe'],
    'transfer': ['transfer'],
    'loan': ['loan'],
    'invoice': ['invoice'],
  }
  
  const methods = typeMapping[type.toLowerCase()] || [type.toLowerCase()]
  
  return MOCK_TRANSACTIONS
    .filter(txn => methods.includes(txn.method))
    .slice(0, limit)
}

/**
 * Filter transactions by date range
 */
export function filterTransactionsByDateRange(startDate: Date, endDate: Date): Transaction[] {
  return MOCK_TRANSACTIONS.filter(txn => {
    const txnDate = new Date(txn.date)
    return txnDate >= startDate && txnDate <= endDate
  })
}

// -----------------------------------------------------------------------------
// Legacy Format Adapters (for backward compatibility with existing components)
// -----------------------------------------------------------------------------

/**
 * Legacy Transaction format used by some frontend components
 * This is provided for backward compatibility during migration
 */
export interface LegacyTransaction {
  id: string
  date: string
  toFrom: {
    name: string
    initials: string
    icon?: string
  }
  amount: number
  account: string
  method: {
    type: 'loan' | 'invoice' | 'transfer' | 'card'
    direction?: 'in' | 'out'
    cardLast4?: string
    cardHolder?: string
  }
  glCode?: string
  glCodeAutoApplied?: boolean
  hasAttachment?: boolean
  status?: 'completed' | 'failed' | 'pending'
  alert?: TransactionAlert
}

/**
 * Convert unified Transaction to legacy format for backward compatibility
 */
export function toLegacyFormat(txn: Transaction): LegacyTransaction {
  // Map method to legacy type
  let methodType: 'loan' | 'invoice' | 'transfer' | 'card' = 'transfer'
  if (txn.method === 'card') methodType = 'card'
  else if (txn.method === 'loan') methodType = 'loan'
  else if (txn.method === 'invoice') methodType = 'invoice'
  else methodType = 'transfer'
  
  return {
    id: txn.id,
    date: txn.date,
    toFrom: {
      name: txn.counterparty,
      initials: txn.counterpartyInitials,
      icon: txn.counterpartyIcon,
    },
    amount: txn.amount,
    account: txn.account,
    method: {
      type: methodType,
      direction: txn.amount > 0 ? 'in' : 'out',
      cardLast4: txn.cardLast4,
      cardHolder: txn.cardHolder,
    },
    glCode: txn.category,
    glCodeAutoApplied: txn.categoryAutoApplied,
    hasAttachment: txn.hasAttachment,
    status: txn.status,
    alert: txn.alert,
  }
}

/**
 * Convert legacy Transaction to unified format
 */
export function fromLegacyFormat(legacy: LegacyTransaction): Transaction {
  // Map legacy type to method
  let method: Transaction['method'] = 'transfer'
  if (legacy.method.type === 'card') method = 'card'
  else if (legacy.method.type === 'loan') method = 'loan'
  else if (legacy.method.type === 'invoice') method = 'invoice'
  else method = legacy.amount > 0 ? 'wire' : 'ach'
  
  return {
    id: legacy.id,
    date: legacy.date,
    counterparty: legacy.toFrom.name,
    counterpartyInitials: legacy.toFrom.initials,
    counterpartyIcon: legacy.toFrom.icon,
    amount: legacy.amount,
    account: legacy.account,
    method,
    methodDirection: legacy.method.direction,
    cardHolder: legacy.method.cardHolder,
    cardLast4: legacy.method.cardLast4,
    category: legacy.glCode,
    categoryAutoApplied: legacy.glCodeAutoApplied,
    hasAttachment: legacy.hasAttachment,
    status: legacy.status || 'completed',
    dashboardLink: '/transactions',
  }
}

/**
 * Get all transactions in legacy format
 * Use this in components that still expect the old format
 */
export function getLegacyTransactions(): LegacyTransaction[] {
  const transactions = MOCK_TRANSACTIONS.map(toLegacyFormat)
  
  // Add alerts to specific rows (1, 6, 9, 14 = indices 0, 5, 8, 13)
  const alertConfigs: Array<{ index: number; alert: TransactionAlert }> = [
    {
      index: 0,
      alert: {
        type: 'subscription-increase',
        reason: 'This charge is 25% higher than last month. The increase appears to correlate with new team members added this billing cycle.',
        details: { percentChange: 25, comparisonPeriod: 'last month' }
      }
    },
    {
      index: 5,
      alert: {
        type: 'possible-duplicate',
        reason: 'A similar charge was posted 3 days ago. This may be a duplicate or a mid-cycle adjustment. Worth verifying with the vendor.',
        details: { previousDate: '3 days ago' }
      }
    },
    {
      index: 8,
      alert: {
        type: 'new-vendor',
        reason: 'First transaction with this vendor. New vendors are flagged for visibility since they haven\'t been used before.',
      }
    },
    {
      index: 13,
      alert: {
        type: 'subscription-increase',
        reason: 'This charge is 40% higher than your 3-month average. This likely reflects increased usage or a plan upgrade.',
        details: { percentChange: 40, comparisonPeriod: '3-month average' }
      }
    }
  ]
  
  alertConfigs.forEach(({ index, alert }) => {
    if (transactions[index]) {
      transactions[index].alert = alert
    }
  })
  
  return transactions
}

// Chart data helpers
export const lineChartData = [
  { date: 'Dec 1', moneyIn: 72000, moneyOut: 71500 },
  { date: 'Dec 2', moneyIn: 85000, moneyOut: 84000 },
  { date: 'Dec 3', moneyIn: 95000, moneyOut: 94500 },
  { date: 'Dec 4', moneyIn: 120000, moneyOut: 119000 },
  { date: 'Dec 5', moneyIn: 145000, moneyOut: 144500 },
  { date: 'Dec 6', moneyIn: 160000, moneyOut: 159000 },
  { date: 'Dec 7', moneyIn: 170000, moneyOut: 169500 },
]

// GL Code options for category dropdowns
export const glCodeOptions = [
  { value: '', label: '' },
  { value: 'bank-fees', label: 'Bank Fees' },
  { value: 'business-meals', label: 'Business Meals' },
  { value: 'cogs', label: 'COGS' },
  { value: 'credit-loan-payments', label: 'Credit & Loan Payments' },
  { value: 'employee-benefits', label: 'Employee Benefits' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'financing-proceeds', label: 'Financing Proceeds' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'interest-earned', label: 'Interest Earned' },
  { value: 'inventory-materials', label: 'Inventory & Materials' },
  { value: 'legal-professional', label: 'Legal & Professional Services' },
  { value: 'marketing-advertising', label: 'Marketing & Advertising' },
  { value: 'office-supplies-equipment', label: 'Office Supplies & Equipment' },
  { value: 'payment-processing-fees', label: 'Payment Processing Fees' },
  { value: 'payroll', label: 'Payroll' },
  { value: 'rent-utilities', label: 'Rent & Utilities' },
  { value: 'revenue', label: 'Revenue' },
  { value: 'shipping-postage', label: 'Shipping & Postage' },
  { value: 'software-subscriptions', label: 'Software & Subscriptions' },
  { value: 'taxes', label: 'Taxes' },
  { value: 'transfer', label: 'Transfer' },
  { value: 'travel-transportation', label: 'Travel & Transportation' },
]

// Summary data computed from transactions
export function getSummaryData() {
  const summary = getTransactionsSummary()
  return {
    netChange: summary.last30Days.netChange,
    netChangeDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    moneyIn: summary.last30Days.moneyIn,
    moneyOut: summary.last30Days.moneyOut,
  }
}

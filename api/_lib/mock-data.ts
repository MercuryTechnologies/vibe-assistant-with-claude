// =============================================================================
// Mock Mercury API Data - Self-contained for Vercel Serverless
// =============================================================================
// This file contains all mock data needed for the API.
// It's self-contained so it works in Vercel's serverless environment.

import { Account, Transaction, Recipient, Card, Organization, Category, CreditAccount, Employee } from './types'

// -----------------------------------------------------------------------------
// Types (duplicated from shared for serverless isolation)
// -----------------------------------------------------------------------------

interface Merchant {
  name: string
  initials: string
  category: string
  icon?: string
}

interface SharedAccount {
  id: string
  name: string
  balance: number
  type: 'checking' | 'savings'
  accountNumber: string
}

interface SharedCard {
  id: string
  name: string
  last4: string
  status: 'active' | 'frozen' | 'cancelled'
  limit: number
  spent: number
}

interface SharedTransaction {
  id: string
  date: string
  counterparty: string
  counterpartyInitials: string
  counterpartyIcon?: string
  amount: number
  account: string
  method: 'ach' | 'wire' | 'card' | 'stripe' | 'check' | 'transfer' | 'loan' | 'invoice'
  methodDirection?: 'in' | 'out'
  cardHolder?: string
  cardLast4?: string
  category?: string
  categoryAutoApplied?: boolean
  description?: string | null
  hasAttachment?: boolean
  status: 'completed' | 'pending' | 'failed'
  dashboardLink?: string
}

// -----------------------------------------------------------------------------
// Static Data
// -----------------------------------------------------------------------------

const merchants: Merchant[] = [
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
  { name: 'Deli 77', initials: 'D7', category: 'Business Meals' },
  { name: "Trader John's", initials: 'TJ', category: 'Business Meals' },
  { name: 'Milgram Brokerage', initials: 'MB', category: 'Revenue' },
  { name: 'The Plant Organic Cafe', initials: 'P', category: 'Business Meals' },
]

const sharedAccounts: SharedAccount[] = [
  { id: 'acct-1', name: 'Mercury Checking', balance: 2459832.17, type: 'checking', accountNumber: '****4521' },
  { id: 'acct-2', name: 'Mercury Savings', balance: 500000.00, type: 'savings', accountNumber: '****8834' },
  { id: 'acct-3', name: 'Ops / Payroll', balance: 145000.00, type: 'checking', accountNumber: '****2211' },
  { id: 'acct-4', name: 'Treasury', balance: 1200000.00, type: 'savings', accountNumber: '****9900' },
]

const sharedCards: SharedCard[] = [
  { id: 'card-1', name: 'Sarah Chen', last4: '4532', status: 'active', limit: 25000, spent: 12450 },
  { id: 'card-2', name: 'John Smith', last4: '7891', status: 'active', limit: 15000, spent: 3200 },
  { id: 'card-3', name: 'Jane Baker', last4: '1234', status: 'active', limit: 10000, spent: 8900 },
  { id: 'card-4', name: 'Mike Johnson', last4: '5555', status: 'frozen', limit: 5000, spent: 0 },
]

const cardHolders = [
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

// -----------------------------------------------------------------------------
// Transaction Generation
// -----------------------------------------------------------------------------

function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

function generateTransactions(): SharedTransaction[] {
  const transactions: SharedTransaction[] = []
  let seed = 12345

  interface RecurringTransaction {
    merchant: string
    amount: number
    day: number
    account: string
    method: SharedTransaction['method']
    cardHolder?: string
    cardLast4?: string
    description?: string
  }

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

  let txnId = 1
  for (let monthOffset = 0; monthOffset < 3; monthOffset++) {
    for (const r of recurring) {
      const date = new Date()
      date.setMonth(date.getMonth() - monthOffset)
      date.setDate(Math.min(r.day, 28))

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

  // Revenue transactions
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
      amount: amount,
      account: 'Mercury Checking',
      method: client === 'Stripe' ? 'stripe' : 'wire',
      methodDirection: 'in',
      category: 'Revenue',
      description: client === 'Stripe' ? 'Stripe payout' : `Payment from ${client}`,
      status: 'completed',
      dashboardLink: '/transactions',
    })
  }

  // Misc card transactions
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

  // Invoice transactions
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

  // Internal transfers
  for (let i = 0; i < 5; i++) {
    const date = new Date()
    date.setDate(date.getDate() - Math.floor(seededRandom(seed++) * 30))
    const amount = Math.round((10000 + seededRandom(seed++) * 50000) * 100) / 100

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

  // Loan payments
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

  // Recent specific transactions
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

  // Sort by date descending
  transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return transactions
}

// Generate the data once
const sharedTransactions = generateTransactions()

// -----------------------------------------------------------------------------
// Organization
// -----------------------------------------------------------------------------

export const MOCK_ORGANIZATION: Organization = {
  id: '6fed2e60-6ad2-11e9-9a84-b72b96aa9ad3',
  legalBusinessName: 'Mercury Technologies, Inc.',
  ein: '82-2557284',
  kind: 'business'
}

// -----------------------------------------------------------------------------
// Accounts - Transform to API format
// -----------------------------------------------------------------------------

export const MOCK_ACCOUNTS: Account[] = sharedAccounts.map((acc) => ({
  id: acc.id,
  name: `${acc.name} ••${acc.accountNumber.slice(-4)}`,
  nickname: acc.name,
  kind: acc.type as 'checking' | 'savings',
  currentBalance: acc.balance,
  availableBalance: acc.balance,
  status: 'active' as const,
  accountNumber: `20223320${acc.accountNumber.slice(-4)}`,
  routingNumber: '091311229',
  dashboardLink: '/accounts'
}))

// -----------------------------------------------------------------------------
// Transactions - Transform to API format
// -----------------------------------------------------------------------------

function transformTransaction(txn: SharedTransaction): Transaction {
  const kindMap: Record<string, string> = {
    'ach': 'externalTransfer',
    'wire': 'domesticWire',
    'card': 'debitCardTransaction',
    'stripe': 'externalTransfer',
    'check': 'check',
    'transfer': 'internalTransfer',
    'loan': 'externalTransfer',
    'invoice': 'externalTransfer',
  }

  return {
    id: txn.id,
    amount: txn.amount,
    postedAt: `${txn.date}T12:00:00.000000Z`,
    status: txn.status === 'completed' ? 'sent' : 'pending',
    counterpartyName: txn.counterparty,
    kind: kindMap[txn.method] || 'externalTransfer',
    bankDescription: `${txn.counterparty.toUpperCase()} ${txn.method.toUpperCase()}`,
    note: txn.description || null,
    mercuryCategory: txn.category || null,
    dashboardLink: '/transactions'
  }
}

export const MOCK_TRANSACTIONS: Transaction[] = sharedTransactions.map(transformTransaction)

// -----------------------------------------------------------------------------
// Recipients
// -----------------------------------------------------------------------------

export const MOCK_RECIPIENTS: Recipient[] = [
  {
    id: 'c49439c8-6c70-11e9-af16-3b128d02dd2f',
    name: 'Gusto',
    status: 'active',
    defaultPaymentMethod: 'ach',
    dateLastPaid: new Date().toISOString(),
    emails: ['payroll@gusto.com']
  },
  {
    id: 'd5a5a4b9-7d81-11e9-bf27-4c239e13ee40',
    name: 'Amazon Web Services',
    status: 'active',
    defaultPaymentMethod: 'ach',
    dateLastPaid: new Date().toISOString(),
    emails: ['aws-billing@amazon.com']
  },
  {
    id: 'e6b6b5ca-8e92-11e9-c038-5d34af24ff51',
    name: 'Stripe',
    status: 'active',
    defaultPaymentMethod: 'ach',
    dateLastPaid: new Date().toISOString(),
    emails: ['billing@stripe.com']
  },
  {
    id: 'f7c7c6db-9fa3-11e9-d149-6e45b035a062',
    name: 'WeWork',
    status: 'active',
    defaultPaymentMethod: 'ach',
    dateLastPaid: new Date().toISOString(),
    emails: ['invoices@wework.com']
  },
  {
    id: 'a8d8d7ec-a0b4-11e9-e25a-7f56c146b173',
    name: 'Acme Corp',
    status: 'active',
    defaultPaymentMethod: 'domesticWire',
    dateLastPaid: new Date().toISOString(),
    emails: ['payments@acmecorp.com']
  },
]

// -----------------------------------------------------------------------------
// Cards - Transform to API format
// -----------------------------------------------------------------------------

export const MOCK_CARDS: Card[] = sharedCards.map(card => ({
  cardId: card.id,
  nameOnCard: card.name,
  lastFourDigits: card.last4,
  status: card.status as 'active' | 'frozen' | 'cancelled' | 'expired',
  network: 'mastercard' as const,
}))

// -----------------------------------------------------------------------------
// Categories
// -----------------------------------------------------------------------------

export const MOCK_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'Software & Subscriptions' },
  { id: 'cat-2', name: 'Payroll' },
  { id: 'cat-3', name: 'Rent & Utilities' },
  { id: 'cat-4', name: 'Travel & Transportation' },
  { id: 'cat-5', name: 'Business Meals' },
  { id: 'cat-6', name: 'Office Supplies & Equipment' },
  { id: 'cat-7', name: 'Revenue' },
  { id: 'cat-8', name: 'Credit & Loan Payments' },
]

// -----------------------------------------------------------------------------
// Employees (for card issuance demo)
// -----------------------------------------------------------------------------

export const MOCK_EMPLOYEES: Employee[] = [
  {
    id: 'emp-1',
    name: 'Sarah Chen',
    email: 'sarah.chen@mercury.com',
    department: 'Engineering',
    salary: 145000,
    hasCard: true,
    cardId: 'card-1'
  },
  {
    id: 'emp-2',
    name: 'John Smith',
    email: 'john.smith@mercury.com',
    department: 'Engineering',
    salary: 125000,
    hasCard: true,
    cardId: 'card-2'
  },
  {
    id: 'emp-3',
    name: 'John Martinez',
    email: 'john.martinez@mercury.com',
    department: 'Sales',
    salary: 95000,
    hasCard: false
  },
  {
    id: 'emp-4',
    name: 'Jane Baker',
    email: 'jane.baker@mercury.com',
    department: 'Marketing',
    salary: 110000,
    hasCard: true,
    cardId: 'card-3'
  },
  {
    id: 'emp-5',
    name: 'Mike Johnson',
    email: 'mike.johnson@mercury.com',
    department: 'Operations',
    salary: 85000,
    hasCard: true,
    cardId: 'card-4'
  },
  {
    id: 'emp-6',
    name: 'Emily Rodriguez',
    email: 'emily.rodriguez@mercury.com',
    department: 'Finance',
    salary: 130000,
    hasCard: false
  },
]

// -----------------------------------------------------------------------------
// Credit Accounts
// -----------------------------------------------------------------------------

export const MOCK_CREDIT_ACCOUNTS: CreditAccount[] = [
  {
    id: 'fd72de30-c63a-11ec-8ab8-eb5d6f13523b',
    status: 'active',
    createdAt: '2022-04-27T15:01:59.31152Z',
    availableBalance: -1183928.74,
    currentBalance: -1159463.03,
    creditLimit: 2000000.00
  }
]

// -----------------------------------------------------------------------------
// Navigation URLs
// -----------------------------------------------------------------------------

export const NAVIGATION_URLS: Record<string, { url: string; displayName: string }> = {
  home: { url: '/home', displayName: 'Home' },
  dashboard: { url: '/home', displayName: 'Home' },
  accounts: { url: '/accounts', displayName: 'Accounts' },
  transactions: { url: '/transactions', displayName: 'Transactions' },
  insights: { url: '/insights', displayName: 'Insights' },
  cards: { url: '/cards', displayName: 'Cards' },
  payments: { url: '/payments', displayName: 'Payments' },
  'send-money': { url: '/payments', displayName: 'Send Money' },
  tasks: { url: '/tasks', displayName: 'Tasks' },
  'bill-pay': { url: '/workflows/bill-pay', displayName: 'Bill Pay' },
  invoicing: { url: '/workflows/invoicing', displayName: 'Invoicing' },
  accounting: { url: '/workflows/accounting', displayName: 'Accounting' },
}

export const FORM_URLS = {
  payment: '/payments',
  card_create: '/cards',
  user_invite: '/settings/team/invite',
  recipient_create: '/recipients'
}

// -----------------------------------------------------------------------------
// Query Functions (for chat API)
// -----------------------------------------------------------------------------

interface CategoryBreakdown {
  category: string
  amount: number
}

interface CashflowData {
  moneyIn: number
  moneyOut: number
  netChange: number
  trend: 'positive' | 'negative' | 'neutral'
  period: string
}

interface InsightsData {
  totalBalance: number
  cashflow: CashflowData
  accounts: Array<{ name: string; balance: number; type: string }>
  topSpendingCategories: CategoryBreakdown[]
  transactionCount: number
}

interface TransactionsSummary {
  last30Days: {
    moneyIn: number
    moneyOut: number
    netChange: number
    transactionCount: number
  }
}

export function getSharedTransactionsSummary(): TransactionsSummary {
  const now = new Date()
  const thirtyDaysAgo = new Date(now)
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const recentTxns = sharedTransactions.filter(txn => new Date(txn.date) >= thirtyDaysAgo)

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

export function getSharedInsightsData(): InsightsData {
  const summary = getSharedTransactionsSummary()
  const totalBalance = sharedAccounts.reduce((sum, a) => sum + a.balance, 0)

  const now = new Date()
  const thirtyDaysAgo = new Date(now)
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const recentTxns = sharedTransactions.filter(txn => new Date(txn.date) >= thirtyDaysAgo)

  const categoryBreakdown: Record<string, number> = {}
  recentTxns.filter(t => t.amount < 0).forEach(t => {
    const cat = t.category || 'Uncategorized'
    categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + Math.abs(t.amount)
  })

  const topCategories: CategoryBreakdown[] = Object.entries(categoryBreakdown)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([category, amount]) => ({ category, amount }))

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
    accounts: sharedAccounts.map(a => ({ name: a.name, balance: a.balance, type: a.type })),
    topSpendingCategories: topCategories,
    transactionCount: summary.last30Days.transactionCount,
  }
}

export function getSharedWireTransactions(limit: number = 20): SharedTransaction[] {
  return sharedTransactions
    .filter(txn => txn.method === 'wire')
    .slice(0, limit)
}

export function searchSharedTransactions(query?: string, limit: number = 10): SharedTransaction[] {
  const q = (query || '').toLowerCase()

  let results = sharedTransactions

  if (q) {
    results = sharedTransactions.filter(txn => {
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

export function getSharedTopTransactions(
  direction: 'in' | 'out' | 'all' = 'out',
  limit: number = 5
): SharedTransaction[] {
  let results = [...sharedTransactions]

  if (direction === 'out') {
    results = results.filter(t => t.amount < 0)
  } else if (direction === 'in') {
    results = results.filter(t => t.amount > 0)
  }

  results.sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount))

  return results.slice(0, limit)
}

export function filterSharedTransactionsByType(type: string, limit: number = 50): SharedTransaction[] {
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

  return sharedTransactions
    .filter(txn => methods.includes(txn.method))
    .slice(0, limit)
}

// Helper to transform shared transactions to API format
export function transformSharedTransactions(txns: SharedTransaction[]): Transaction[] {
  return txns.map(transformTransaction)
}

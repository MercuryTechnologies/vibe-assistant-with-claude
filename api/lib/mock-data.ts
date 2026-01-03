// =============================================================================
// Mock Mercury API Data
// =============================================================================
// This file bridges the shared mock data to the API's expected format.
// All transaction/insights data comes from src/shared/mockData.ts for consistency.

import { Account, Transaction, Recipient, Card, Organization, Category, CreditAccount } from './types'

// Import shared data - this is the single source of truth
import {
  accounts as sharedAccounts,
  cards as sharedCards,
  MOCK_TRANSACTIONS as sharedTransactions,
  getInsightsData as getSharedInsightsData,
  getTransactionsSummary as getSharedTransactionsSummary,
  getTopTransactions as getSharedTopTransactions,
  getWireTransactions as getSharedWireTransactions,
  searchTransactions as searchSharedTransactions,
  filterTransactionsByType as filterSharedTransactionsByType,
  type Transaction as SharedTransaction,
} from '../../src/shared/mockData'

// -----------------------------------------------------------------------------
// Organization (static, not from shared data)
// -----------------------------------------------------------------------------

export const MOCK_ORGANIZATION: Organization = {
  id: '6fed2e60-6ad2-11e9-9a84-b72b96aa9ad3',
  legalBusinessName: 'Mercury Technologies, Inc.',
  ein: '82-2557284',
  kind: 'business'
}

// -----------------------------------------------------------------------------
// Accounts - Transform from shared format to API format
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
// Transactions - Transform from shared format to API format
// -----------------------------------------------------------------------------

function transformTransaction(txn: SharedTransaction): Transaction {
  // Map method to kind
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
// Recipients (static, not from shared data yet)
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
// Cards - Transform from shared format to API format
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
// Credit Accounts (static)
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
// Re-export shared data functions for the tool executor
// These compute data dynamically from the shared transactions
// -----------------------------------------------------------------------------

export { getSharedInsightsData, getSharedTransactionsSummary, getSharedTopTransactions }
export { getSharedWireTransactions, searchSharedTransactions, filterSharedTransactionsByType }

// Helper to transform shared transactions to API format
export function transformSharedTransactions(txns: SharedTransaction[]): Transaction[] {
  return txns.map(transformTransaction)
}

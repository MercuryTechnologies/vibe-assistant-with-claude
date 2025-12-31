// =============================================================================
// Mock Mercury API Data
// =============================================================================
// Realistic test data for development and demos

import { Account, Transaction, Recipient, Card, Organization, Category, CreditAccount } from './types'

export const MOCK_ORGANIZATION: Organization = {
  id: '6fed2e60-6ad2-11e9-9a84-b72b96aa9ad3',
  legalBusinessName: 'Mercury Technologies, Inc.',
  ein: '82-2557284',
  kind: 'business'
}

export const MOCK_ACCOUNTS: Account[] = [
  {
    id: '341c0d7a-941e-11ec-94e4-87a43665ec7a',
    name: 'Mercury Checking ••0689',
    nickname: 'Main Operating',
    kind: 'checking',
    currentBalance: 2847293.45,
    availableBalance: 2834521.12,
    status: 'active',
    accountNumber: '202233200689',
    routingNumber: '091311229',
    dashboardLink: '/accounts'
  },
  {
    id: '8a2b4f30-b12c-11ec-a45e-2b3c4d5e6f70',
    name: 'Mercury Savings ••1234',
    nickname: 'Runway Reserve',
    kind: 'savings',
    currentBalance: 15000000.00,
    availableBalance: 15000000.00,
    status: 'active',
    accountNumber: '202233201234',
    routingNumber: '091311229',
    dashboardLink: '/accounts'
  },
  {
    id: 'c3d4e5f6-c23d-11ec-b56f-3c4d5e6f7a81',
    name: 'Mercury Checking ••5678',
    nickname: 'Payroll Account',
    kind: 'checking',
    currentBalance: 425000.00,
    availableBalance: 425000.00,
    status: 'active',
    accountNumber: '202233205678',
    routingNumber: '091311229',
    dashboardLink: '/accounts'
  }
]

export const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: '85c7d4c0-e5d1-11f0-853a-3b6a67604580',
    amount: -55000.00,
    postedAt: '2025-12-30T22:47:30.356686Z',
    status: 'sent',
    counterpartyName: 'Deel, Inc.',
    kind: 'externalTransfer',
    bankDescription: 'Deel, Inc.; Deel Inc.; MERCURY TECHNOLOGIES I',
    note: 'December contractor payments',
    mercuryCategory: 'Payroll',
    dashboardLink: '/transactions'
  },
  {
    id: 'a1b2c3d4-f6e5-11f0-964b-4c7d8e9f0a12',
    amount: -12500.00,
    postedAt: '2025-12-29T15:30:00.000000Z',
    status: 'sent',
    counterpartyName: 'Amazon Web Services',
    kind: 'externalTransfer',
    bankDescription: 'AWS EMEA aws.amazon.co AMAZON WEB SERVIC',
    note: 'AWS December invoice',
    mercuryCategory: 'Software',
    dashboardLink: '/transactions'
  },
  {
    id: 'b2c3d4e5-a7b8-11f0-a75c-5d8e9f0a1b23',
    amount: -4299.00,
    postedAt: '2025-12-28T10:15:00.000000Z',
    status: 'sent',
    counterpartyName: 'Stripe',
    kind: 'externalTransfer',
    bankDescription: 'STRIPE TRANSFER',
    note: null,
    mercuryCategory: 'Software',
    dashboardLink: '/transactions'
  },
  {
    id: 'c3d4e5f6-b8c9-11f0-b86d-6e9f0a1b2c34',
    amount: 250000.00,
    postedAt: '2025-12-27T09:00:00.000000Z',
    status: 'sent',
    counterpartyName: 'Sequoia Capital',
    kind: 'externalTransfer',
    bankDescription: 'WIRE TRANSFER FROM SEQUOIA CAPITAL',
    note: 'Series B tranche 2',
    mercuryCategory: null,
    dashboardLink: '/transactions'
  },
  {
    id: 'd4e5f6a7-c9d0-11f0-c97e-7f0a1b2c3d45',
    amount: -2150.00,
    postedAt: '2025-12-26T14:22:00.000000Z',
    status: 'sent',
    counterpartyName: 'WeWork',
    kind: 'externalTransfer',
    bankDescription: 'WEWORK COMPANIES ACH',
    note: 'January office rent',
    mercuryCategory: 'Rent',
    dashboardLink: '/transactions'
  },
  {
    id: 'e5f6a7b8-d0e1-11f0-da8f-8a1b2c3d4e56',
    amount: -89.99,
    postedAt: '2025-12-25T18:45:00.000000Z',
    status: 'sent',
    counterpartyName: 'Notion',
    kind: 'debitCardTransaction',
    bankDescription: 'NOTION LABS INC',
    note: null,
    mercuryCategory: 'Software',
    dashboardLink: '/transactions'
  },
  {
    id: 'f6a7b8c9-e1f2-11f0-eba0-9b2c3d4e5f67',
    amount: -15000.00,
    postedAt: '2025-12-24T11:00:00.000000Z',
    status: 'pending',
    counterpartyName: 'Gusto',
    kind: 'externalTransfer',
    bankDescription: 'GUSTO PAYROLL',
    note: 'Bi-weekly payroll',
    mercuryCategory: 'Payroll',
    dashboardLink: '/transactions'
  },
  {
    id: 'a7b8c9d0-f2a3-11f0-fcb1-ac3d4e5f6a78',
    amount: -342.50,
    postedAt: '2025-12-23T16:30:00.000000Z',
    status: 'sent',
    counterpartyName: 'Uber',
    kind: 'creditCardTransaction',
    bankDescription: 'UBER TRIP',
    note: 'Team dinner transportation',
    mercuryCategory: 'Travel',
    dashboardLink: '/transactions'
  },
  {
    id: 'b8c9d0e1-a3b4-11f0-adcc-bd4e5f6a7b89',
    amount: -1500.00,
    postedAt: '2025-12-22T09:00:00.000000Z',
    status: 'sent',
    counterpartyName: 'Figma',
    kind: 'externalTransfer',
    bankDescription: 'FIGMA INC',
    note: 'Annual subscription',
    mercuryCategory: 'Software',
    dashboardLink: '/transactions'
  },
  {
    id: 'c9d0e1f2-b4c5-11f0-bedd-ce5f6a7b8c9a',
    amount: 75000.00,
    postedAt: '2025-12-20T14:00:00.000000Z',
    status: 'sent',
    counterpartyName: 'Acme Corp',
    kind: 'externalTransfer',
    bankDescription: 'WIRE FROM ACME CORP',
    note: 'Invoice #1234 payment',
    mercuryCategory: null,
    dashboardLink: '/transactions'
  }
]

export const MOCK_RECIPIENTS: Recipient[] = [
  {
    id: 'c49439c8-6c70-11e9-af16-3b128d02dd2f',
    name: 'Deel, Inc.',
    status: 'active',
    defaultPaymentMethod: 'ach',
    dateLastPaid: '2025-12-30T22:47:30.356686Z',
    emails: ['payments@deel.com']
  },
  {
    id: 'd5a5a4b9-7d81-11e9-bf27-4c239e13ee40',
    name: 'Amazon Web Services',
    status: 'active',
    defaultPaymentMethod: 'ach',
    dateLastPaid: '2025-12-29T15:30:00.000000Z',
    emails: ['aws-billing@amazon.com']
  },
  {
    id: 'e6b6b5ca-8e92-11e9-c038-5d34af24ff51',
    name: 'Stripe',
    status: 'active',
    defaultPaymentMethod: 'ach',
    dateLastPaid: '2025-12-28T10:15:00.000000Z',
    emails: ['billing@stripe.com']
  },
  {
    id: 'f7c7c6db-9fa3-11e9-d149-6e45b035a062',
    name: 'WeWork',
    status: 'active',
    defaultPaymentMethod: 'ach',
    dateLastPaid: '2025-12-26T14:22:00.000000Z',
    emails: ['invoices@wework.com']
  },
  {
    id: 'a8d8d7ec-a0b4-11e9-e25a-7f56c146b173',
    name: 'Gusto',
    status: 'active',
    defaultPaymentMethod: 'ach',
    dateLastPaid: '2025-12-24T11:00:00.000000Z',
    emails: ['payroll@gusto.com']
  },
  {
    id: 'b9e9e8fd-b1c5-11e9-f36b-8a67d257c284',
    name: 'John Smith (Contractor)',
    status: 'active',
    defaultPaymentMethod: 'ach',
    dateLastPaid: '2025-12-15T09:00:00.000000Z',
    emails: ['john.smith@gmail.com']
  },
  {
    id: 'cafaf90e-c2d6-11e9-a47c-9b78e368d395',
    name: 'Acme Consulting LLC',
    status: 'inactive',
    defaultPaymentMethod: 'domesticWire',
    dateLastPaid: '2025-06-01T12:00:00.000000Z',
    emails: ['billing@acmeconsulting.com']
  }
]

export const MOCK_CARDS: Card[] = [
  {
    cardId: '6fef97b8-9c16-11ec-824c-a747053b8d03',
    nameOnCard: 'Ryan Chen',
    lastFourDigits: '6952',
    status: 'active',
    network: 'mastercard'
  },
  {
    cardId: '7a0fa8c9-ad27-11ec-935d-b858064c14e4',
    nameOnCard: 'Sarah Johnson',
    lastFourDigits: '4521',
    status: 'active',
    network: 'mastercard'
  },
  {
    cardId: '8b1ab9da-be38-11ec-a46e-c969175d25f5',
    nameOnCard: 'Mike Williams',
    lastFourDigits: '7834',
    status: 'frozen',
    network: 'mastercard'
  },
  {
    cardId: '9c2bcaeb-cf49-11ec-b57f-da7a286e36a6',
    nameOnCard: 'Marketing Team',
    lastFourDigits: '2198',
    status: 'active',
    network: 'mastercard'
  },
  {
    cardId: 'ad3cdbfc-e05a-11ec-c680-eb8b397f47b7',
    nameOnCard: 'Emily Davis',
    lastFourDigits: '5567',
    status: 'cancelled',
    network: 'mastercard'
  }
]

export const MOCK_CATEGORIES: Category[] = [
  { id: 'a94f8aaf-ec26-41ab-b8f9-710f9c78262c', name: 'Accidental Personal Charge' },
  { id: '7673dc43-9452-4756-b208-8fd972d0b8c1', name: 'Advertising - Awareness' },
  { id: '49e3ea00-5ef5-4b24-a031-a3aab7f44acc', name: 'Advertising - Conversion' },
  { id: 'b05f9bb0-fd37-42bc-c9fa-821fa8d79d3d', name: 'Software' },
  { id: 'c16a0cc1-0e48-43cd-dafb-932ab9e8ae4e', name: 'Payroll' },
  { id: 'd27b1dd2-1f59-44de-ebfc-a43bca0fbf5f', name: 'Rent' },
  { id: 'e38c2ee3-2a6a-45ef-fcad-b54cdb1acaf0', name: 'Travel' },
  { id: 'f49d3ff4-3b7b-46fa-adbe-c65dec2bdbf1', name: 'Meals & Entertainment' },
  { id: 'a5ae4005-4c8c-47fb-becd-d76efd3cecf2', name: 'Office Supplies' },
  { id: 'b6bf5116-5d9d-48fc-cfde-e87f0e4dede3', name: 'Professional Services' }
]

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

// Navigation URL mapping (page name -> app route)
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

// Form URLs with prefill support
export const FORM_URLS = {
  payment: '/payments',
  card_create: '/cards',
  user_invite: '/settings/team/invite',
  recipient_create: '/recipients'
}


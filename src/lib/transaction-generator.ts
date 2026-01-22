import type { Transaction } from '@/types';

// Global state for generated transactions
let generatedTransactions: Transaction[] | null = null;

// Event emitter for transaction updates
const listeners = new Set<() => void>();

export function onTransactionUpdate(callback: () => void): () => void {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function notifyListeners(): void {
  listeners.forEach(callback => callback());
}

export interface TransactionGeneratorSettings {
  count: number;
  minAmount: number;
  maxAmount: number;
  cashFlowDirection: 'positive' | 'negative' | 'mixed';
}

// Categories for variety
const CATEGORIES = [
  'Revenue',
  'Software',
  'Infrastructure',
  'Payroll',
  'Office',
  'Marketing',
  'Professional Services',
  'Travel',
  'Meals',
  'Equipment',
  'Interest',
  'Transfer',
];

// Random merchant names for variety
const MERCHANT_NAMES = [
  'Stripe Payments',
  'Amazon Web Services',
  'Gusto',
  'Figma Inc',
  'Notion Labs',
  'Slack Technologies',
  'Acme Corp',
  'Google Cloud',
  'Microsoft Azure',
  'Shopify Payments',
  'Vercel Inc',
  'Netlify',
  'GitHub',
  'Atlassian',
  'Zoom Video',
  'DataDog Inc',
  'HubSpot Inc',
  'Mailchimp',
  'Cloudflare Inc',
  'MongoDB Inc',
  'Twilio Inc',
  'PagerDuty Inc',
  'New Relic Inc',
  'Sentry.io',
  'Intercom Inc',
  'Linear Inc',
  'Retool Inc',
  'Snowflake Inc',
  'Postman Inc',
  'Miro',
  'Airtable',
  'Loom Inc',
  'Calendly',
  'OpenAI',
  'Anthropic',
  'Supabase Inc',
  'CircleCI',
  'LaunchDarkly',
  'Amplitude Inc',
  'Mixpanel Inc',
  'Segment',
  'Redis Labs',
  'Webflow Inc',
  'Elastic NV',
  'Adobe Inc',
  '1Password',
  'Contentful GmbH',
  'Algolia Inc',
  'SendGrid',
  'Sanity.io',
  'Railway Corp',
  'Render Services',
];

const ACCOUNT_IDS = ['acc_001', 'acc_002', 'acc_003'];

// Generate a random date within the last 90 days
function getRandomDate(): string {
  const today = new Date();
  const daysAgo = Math.floor(Math.random() * 90);
  const date = new Date(today);
  date.setDate(today.getDate() - daysAgo);
  return date.toISOString().split('T')[0];
}

// Generate a random amount within range
function getRandomAmount(min: number, max: number, direction: 'positive' | 'negative' | 'mixed'): number {
  const baseAmount = min + Math.random() * (max - min);
  
  if (direction === 'positive') {
    return Math.abs(baseAmount);
  } else if (direction === 'negative') {
    return -Math.abs(baseAmount);
  } else {
    // Mixed: 60% negative (expenses), 40% positive (revenue)
    return Math.random() < 0.6 ? -Math.abs(baseAmount) : Math.abs(baseAmount);
  }
}

// Generate fake transactions based on settings
export function generateTransactions(settings: TransactionGeneratorSettings): Transaction[] {
  const transactions: Transaction[] = [];
  const { count, minAmount, maxAmount, cashFlowDirection } = settings;

  for (let i = 0; i < count; i++) {
    const amount = getRandomAmount(minAmount, maxAmount, cashFlowDirection);
    const isCredit = amount >= 0;
    
    // Random merchant name
    const merchant = MERCHANT_NAMES[Math.floor(Math.random() * MERCHANT_NAMES.length)];
    const description = isCredit 
      ? `Payment from ${merchant}`
      : `Payment to ${merchant}`;

    transactions.push({
      id: `gen_txn_${Date.now()}_${i}`,
      description,
      merchant,
      amount: Math.round(amount * 100) / 100, // Round to 2 decimals
      type: isCredit ? 'credit' : 'debit',
      date: getRandomDate(),
      category: CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)],
      status: 'completed',
      accountId: ACCOUNT_IDS[Math.floor(Math.random() * ACCOUNT_IDS.length)],
      hasAttachment: Math.random() < 0.2, // 20% chance
    });
  }

  // Sort by date descending (most recent first)
  transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return transactions;
}

// Set generated transactions
export function setGeneratedTransactions(transactions: Transaction[] | null): void {
  generatedTransactions = transactions;
  notifyListeners();
}

// Get generated transactions
export function getGeneratedTransactions(): Transaction[] | null {
  return generatedTransactions;
}

// Clear generated transactions (restore to original data)
export function clearGeneratedTransactions(): void {
  generatedTransactions = null;
  notifyListeners();
}

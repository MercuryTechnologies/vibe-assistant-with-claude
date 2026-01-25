// =============================================================================
// Feature Cards Data
// =============================================================================
// Feature discovery cards that showcase Mercury's product capabilities

export interface FeatureCard {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: string;  // FontAwesome icon name
  color: 'purple-magic' | 'green' | 'neutral';
  highlight?: string;  // Optional badge text
  stats: Array<{
    label: string;
    value: string;
  }>;
  cta: {
    label: string;
    action: string;  // URL path
  };
}

export const FEATURE_CARDS: FeatureCard[] = [
  // 1. Payments
  {
    id: 'feature-payments',
    title: 'Payments',
    subtitle: 'Send money anywhere',
    description: 'ACH, wires, international transfers to 100+ countries. Same-day ACH and free domestic wires on Plus/Pro.',
    icon: 'arrow-right-arrow-left',
    color: 'purple-magic',
    stats: [
      { label: 'Countries', value: '100+' },
      { label: 'Domestic wire', value: 'Same day' },
    ],
    cta: { label: 'Send a payment', action: '/payments/recipients' },
  },

  // 2. Cards
  {
    id: 'feature-cards',
    title: 'Cards',
    subtitle: 'Virtual & physical cards',
    description: 'Unlimited virtual cards instantly. Physical debit cards. IO credit card with 1.5% cashback and no personal guarantee.',
    icon: 'credit-card',
    color: 'purple-magic',
    stats: [
      { label: 'Virtual cards', value: 'Unlimited' },
      { label: 'Cashback', value: '1.5%' },
    ],
    cta: { label: 'Manage cards', action: '/cards' },
  },

  // 3. Recipients
  {
    id: 'feature-recipients',
    title: 'Recipients',
    subtitle: 'Manage who you pay',
    description: 'Store vendor details, payment preferences, and bank info. Batch payments to multiple recipients at once.',
    icon: 'users',
    color: 'neutral',
    stats: [
      { label: 'Payment methods', value: 'ACH, Wire, Check' },
      { label: 'Batch payments', value: 'Unlimited' },
    ],
    cta: { label: 'View recipients', action: '/payments/recipients' },
  },

  // 4. Spend Management
  {
    id: 'feature-spend',
    title: 'Spend Management',
    subtitle: 'Control company spending',
    description: 'Set card limits, merchant restrictions, and approval workflows. AI-powered receipt matching and expense categorization.',
    icon: 'shield-check',
    color: 'green',
    stats: [
      { label: 'Per-card limits', value: 'Custom' },
      { label: 'Receipt matching', value: 'AI-powered' },
    ],
    cta: { label: 'Set spend controls', action: '/cards' },
  },

  // 5. Insights
  {
    id: 'feature-insights',
    title: 'Insights',
    subtitle: 'Understand your finances',
    description: 'Track runway, burn rate, and cash flow trends. Compare spending across periods and forecast future cash position.',
    icon: 'chart-line',
    color: 'purple-magic',
    stats: [
      { label: 'Runway tracking', value: 'Real-time' },
      { label: 'Cash flow', value: 'Daily/Monthly' },
    ],
    cta: { label: 'View insights', action: '/insights' },
  },

  // 6. Treasury
  {
    id: 'feature-treasury',
    title: 'Treasury',
    subtitle: 'Maximize yield on cash',
    description: 'Earn up to 3.80% APY on idle cash. Government money market funds, T-Bills, and automated sweep strategies.',
    icon: 'piggy-bank',
    color: 'green',
    stats: [
      { label: 'Yield', value: 'Up to 3.80%' },
      { label: 'Min investment', value: '$250K' },
    ],
    cta: { label: 'Explore treasury', action: '/accounts/treasury' },
  },

  // 7. Bill Pay
  {
    id: 'feature-billpay',
    title: 'Bill Pay',
    subtitle: 'Pay bills efficiently',
    description: 'Upload invoices, schedule payments, and set up approval workflows. Automated vendor payment reminders.',
    icon: 'file-invoice-dollar',
    color: 'neutral',
    stats: [
      { label: 'Invoice capture', value: 'AI-powered' },
      { label: 'Approval workflows', value: 'Multi-level' },
    ],
    cta: { label: 'Pay a bill', action: '/workflows/bill-pay' },
  },

  // 8. Invoicing
  {
    id: 'feature-invoicing',
    title: 'Invoicing',
    subtitle: 'Get paid faster',
    description: 'Send professional invoices with payment links. Automated reminders and recurring billing for subscriptions.',
    icon: 'file-invoice',
    color: 'green',
    stats: [
      { label: 'Payment links', value: 'ACH & Card' },
      { label: 'Reminders', value: 'Automated' },
    ],
    cta: { label: 'Create invoice', action: '/workflows/invoicing' },
  },

  // 9. Accounts
  {
    id: 'feature-accounts',
    title: 'Accounts',
    subtitle: 'Organize your money',
    description: 'Multiple checking and savings accounts. Up to $5M FDIC insurance through sweep network. No monthly fees.',
    icon: 'building-columns',
    color: 'purple-magic',
    stats: [
      { label: 'FDIC coverage', value: 'Up to $5M' },
      { label: 'Monthly fee', value: '$0' },
    ],
    cta: { label: 'View accounts', action: '/dashboard' },
  },

  // 10. Employee Cards
  {
    id: 'feature-employee-cards',
    title: 'Employee Cards',
    subtitle: 'Empower your team',
    description: 'Issue cards to employees with custom limits. Track spending in real-time. Require receipts and categorization.',
    icon: 'id-card',
    color: 'neutral',
    stats: [
      { label: 'Cards per employee', value: 'Unlimited' },
      { label: 'Spending alerts', value: 'Real-time' },
    ],
    cta: { label: 'Issue cards', action: '/cards' },
  },

  // 11. Accounting Sync
  {
    id: 'feature-accounting',
    title: 'Accounting Sync',
    subtitle: 'Automate bookkeeping',
    description: 'Two-way sync with QuickBooks, Xero, and NetSuite. Auto-categorize transactions and reconcile in real-time.',
    icon: 'arrows-rotate',
    color: 'neutral',
    stats: [
      { label: 'Integrations', value: 'QBO, Xero, NetSuite' },
      { label: 'Sync', value: 'Real-time' },
    ],
    cta: { label: 'Connect accounting', action: '/workflows/accounting' },
  },

  // 12. Categorization
  {
    id: 'feature-categorization',
    title: 'Categorization',
    subtitle: 'Organize transactions',
    description: 'AI-powered auto-categorization. Custom rules and GL codes. Bulk editing for efficient bookkeeping.',
    icon: 'tags',
    color: 'purple-magic',
    stats: [
      { label: 'Auto-categorization', value: 'AI-powered' },
      { label: 'Custom rules', value: 'Unlimited' },
    ],
    cta: { label: 'Set up rules', action: '/transactions' },
  },

  // 13. IO Credit
  {
    id: 'feature-io-credit',
    title: 'IO Credit Card',
    subtitle: 'Credit without the PG',
    description: 'No personal guarantee required. 1.5% unlimited cashback. Extended monthly payment terms with $15K+ balance.',
    icon: 'credit-card',
    color: 'green',
    highlight: 'No personal guarantee',
    stats: [
      { label: 'Cashback', value: '1.5%' },
      { label: 'Annual fee', value: '$0' },
    ],
    cta: { label: 'Apply for IO', action: '/capital' },
  },

  // 14. Venture Debt
  {
    id: 'feature-venture-debt',
    title: 'Venture Debt',
    subtitle: 'Extend your runway',
    description: 'Up to 48-month terms with 18-month interest-only period. No prepayment penalties. Complement your equity.',
    icon: 'hand-holding-dollar',
    color: 'purple-magic',
    stats: [
      { label: 'Term', value: 'Up to 48 mo' },
      { label: 'Prepayment', value: 'No penalty' },
    ],
    cta: { label: 'Learn more', action: '/capital' },
  },

  // 15. Working Capital
  {
    id: 'feature-working-capital',
    title: 'Working Capital',
    subtitle: 'Fuel your growth',
    description: 'Revenue-based financing for ecommerce. Flat-fee pricing with fixed weekly payments. Min $250K annual sales.',
    icon: 'chart-simple',
    color: 'green',
    stats: [
      { label: 'Pricing', value: 'Flat fee' },
      { label: 'Min revenue', value: '$250K/yr' },
    ],
    cta: { label: 'Check eligibility', action: '/capital' },
  },

  // 16. API & Integrations
  {
    id: 'feature-api',
    title: 'API & Integrations',
    subtitle: 'Build on Mercury',
    description: 'Full REST API for accounts, transactions, and payments. Webhooks for real-time events. 334+ partner perks.',
    icon: 'code',
    color: 'neutral',
    stats: [
      { label: 'Partner perks', value: '334+' },
      { label: 'API access', value: 'All plans' },
    ],
    cta: { label: 'View docs', action: '/dashboard' },
  },

  // 17. 1099 Filing
  {
    id: 'feature-1099',
    title: '1099 Filing',
    subtitle: 'Contractor compliance',
    description: 'Track contractor payments, collect W-9s, and e-file 1099s. Automatic threshold monitoring.',
    icon: 'file-contract',
    color: 'neutral',
    stats: [
      { label: 'W-9 collection', value: 'Automated' },
      { label: 'E-filing', value: 'Included' },
    ],
    cta: { label: 'Manage contractors', action: '/payments/recipients' },
  },

  // 18. Approvals
  {
    id: 'feature-approvals',
    title: 'Approvals',
    subtitle: 'Control who can spend',
    description: 'Multi-level approval workflows for payments and cards. Set thresholds, required approvers, and escalation paths.',
    icon: 'check-double',
    color: 'purple-magic',
    stats: [
      { label: 'Approval levels', value: 'Multi-tier' },
      { label: 'Thresholds', value: 'Custom' },
    ],
    cta: { label: 'Configure approvals', action: '/tasks' },
  },
];

/**
 * Select N random feature cards
 */
export function selectRandomFeatureCards(count: number = 6): FeatureCard[] {
  const shuffled = [...FEATURE_CARDS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

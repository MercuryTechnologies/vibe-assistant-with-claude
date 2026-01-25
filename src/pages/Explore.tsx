import { useNavigate } from 'react-router-dom';
import { FeatureCardsBlock } from '@/components/chat/FeatureCardsBlock';
import type { FeatureCardsMetadata } from '@/chat/types';
import { useMobileLayout } from '@/hooks';

// All available feature cards
const allFeatureCards: FeatureCardsMetadata['cards'] = [
  {
    id: 'feature-payments',
    title: 'Payments',
    subtitle: 'Send money anywhere',
    description: 'ACH, wires, international transfers to 100+ countries. Same-day ACH and free domestic wires on Plus/Pro.',
    icon: 'arrow-right-arrow-left',
    color: 'purple-magic',
    stats: [{ label: 'Countries', value: '100+' }, { label: 'Domestic wire', value: 'Same day' }],
    cta: { label: 'Send a payment', action: '/payments/recipients' },
  },
  {
    id: 'feature-cards',
    title: 'Cards',
    subtitle: 'Virtual & physical cards',
    description: 'Unlimited virtual cards instantly. Physical debit cards. IO credit card with 1.5% cashback and no personal guarantee.',
    icon: 'credit-card',
    color: 'purple-magic',
    stats: [{ label: 'Virtual cards', value: 'Unlimited' }, { label: 'Cashback', value: '1.5%' }],
    cta: { label: 'Manage cards', action: '/cards' },
  },
  {
    id: 'feature-insights',
    title: 'Insights',
    subtitle: 'Understand your finances',
    description: 'Track runway, burn rate, and cash flow trends. Compare spending across periods and forecast future cash position.',
    icon: 'chart-line',
    color: 'purple-magic',
    stats: [{ label: 'Runway tracking', value: 'Real-time' }, { label: 'Cash flow', value: 'Daily/Monthly' }],
    cta: { label: 'View insights', action: '/insights' },
  },
  {
    id: 'feature-treasury',
    title: 'Treasury',
    subtitle: 'Maximize yield on cash',
    description: 'Earn up to 3.80% APY on idle cash. Government money market funds, T-Bills, and automated sweep strategies.',
    icon: 'piggy-bank',
    color: 'green',
    stats: [{ label: 'Yield', value: 'Up to 3.80%' }, { label: 'Min investment', value: '$250K' }],
    cta: { label: 'Explore treasury', action: '/accounts/treasury' },
  },
  {
    id: 'feature-billpay',
    title: 'Bill Pay',
    subtitle: 'Pay bills efficiently',
    description: 'Upload invoices, schedule payments, and set up approval workflows. Automated vendor payment reminders.',
    icon: 'file-invoice-dollar',
    color: 'neutral',
    stats: [{ label: 'Invoice capture', value: 'AI-powered' }, { label: 'Approval workflows', value: 'Multi-level' }],
    cta: { label: 'Pay a bill', action: '/workflows/bill-pay' },
  },
  {
    id: 'feature-invoicing',
    title: 'Invoicing',
    subtitle: 'Get paid faster',
    description: 'Send professional invoices with payment links. Automated reminders and recurring billing for subscriptions.',
    icon: 'file-invoice',
    color: 'green',
    stats: [{ label: 'Payment links', value: 'ACH & Card' }, { label: 'Reminders', value: 'Automated' }],
    cta: { label: 'Create invoice', action: '/workflows/invoicing' },
  },
  {
    id: 'feature-accounts',
    title: 'Accounts',
    subtitle: 'Organize your money',
    description: 'Multiple checking and savings accounts. Up to $5M FDIC insurance through sweep network. No monthly fees.',
    icon: 'building-columns',
    color: 'purple-magic',
    stats: [{ label: 'FDIC coverage', value: 'Up to $5M' }, { label: 'Monthly fee', value: '$0' }],
    cta: { label: 'View accounts', action: '/dashboard' },
  },
  {
    id: 'feature-employee-cards',
    title: 'Employee Cards',
    subtitle: 'Empower your team',
    description: 'Issue cards to employees with custom limits. Track spending in real-time. Require receipts and categorization.',
    icon: 'id-card',
    color: 'neutral',
    stats: [{ label: 'Cards per employee', value: 'Unlimited' }, { label: 'Spending alerts', value: 'Real-time' }],
    cta: { label: 'Issue cards', action: '/cards' },
  },
  {
    id: 'feature-accounting',
    title: 'Accounting Sync',
    subtitle: 'Automate bookkeeping',
    description: 'Two-way sync with QuickBooks, Xero, and NetSuite. Auto-categorize transactions and reconcile in real-time.',
    icon: 'arrows-rotate',
    color: 'neutral',
    stats: [{ label: 'Integrations', value: 'QBO, Xero, NetSuite' }, { label: 'Sync', value: 'Real-time' }],
    cta: { label: 'Connect accounting', action: '/workflows/accounting' },
  },
  {
    id: 'feature-io-credit',
    title: 'IO Credit Card',
    subtitle: 'Credit without the PG',
    description: 'No personal guarantee required. 1.5% unlimited cashback. Extended monthly payment terms with $15K+ balance.',
    icon: 'credit-card',
    color: 'green',
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
    color: 'purple-magic',
    stats: [{ label: 'Term', value: 'Up to 48 mo' }, { label: 'Prepayment', value: 'No penalty' }],
    cta: { label: 'Learn more', action: '/capital' },
  },
  {
    id: 'feature-approvals',
    title: 'Approvals',
    subtitle: 'Control who can spend',
    description: 'Multi-level approval workflows for payments and cards. Set thresholds, required approvers, and escalation paths.',
    icon: 'check-double',
    color: 'purple-magic',
    stats: [{ label: 'Approval levels', value: 'Multi-tier' }, { label: 'Thresholds', value: 'Custom' }],
    cta: { label: 'Configure approvals', action: '/tasks' },
  },
];

export function Explore() {
  const navigate = useNavigate();
  const { isMobile } = useMobileLayout();

  const handleNavigate = (url: string) => {
    navigate(url);
  };

  return (
    <div className="explore-page" style={{ padding: isMobile ? '0 16px' : 0 }}>
      <div style={{ marginBottom: isMobile ? 16 : 24 }}>
        <h1 
          className={isMobile ? "text-title-secondary" : "text-title-main"} 
          style={{ color: 'var(--ds-text-default)', margin: 0 }}
        >
          Explore Mercury
        </h1>
        <p className="text-body" style={{ color: 'var(--ds-text-secondary)', marginTop: 8 }}>
          Discover features and tools to help your business grow.
        </p>
      </div>
      
      <FeatureCardsBlock 
        data={{ cards: allFeatureCards }}
        context={isMobile ? "rhc" : "command"}
        onNavigate={handleNavigate}
      />
    </div>
  );
}

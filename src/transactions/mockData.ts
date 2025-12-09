// Mock data for Transactions page

export interface Transaction {
  id: string;
  date: string;
  toFrom: {
    name: string;
    initials: string;
    icon?: string;
  };
  amount: number;
  account: string;
  method: {
    type: 'loan' | 'invoice' | 'transfer' | 'card';
    direction?: 'in' | 'out';
    cardLast4?: string;
    cardHolder?: string;
  };
  glCode?: string;
  glCodeAutoApplied?: boolean; // true if category was automatically applied by the system
  hasAttachment?: boolean;
  status?: 'completed' | 'failed' | 'pending';
}

export const transactions: Transaction[] = [
  {
    id: '1',
    date: 'Dec 8',
    toFrom: { name: 'Mercury Working Capital', initials: 'M', icon: 'mercury' },
    amount: -2200.00,
    account: 'Ops / Payroll',
    method: { type: 'loan', direction: 'out' },
    status: 'completed',
  },
  {
    id: '2',
    date: 'Dec 8',
    toFrom: { name: 'Payment from NASA', initials: 'P' },
    amount: 418.00,
    account: 'AR',
    method: { type: 'invoice', direction: 'in' },
    status: 'failed',
  },
  {
    id: '3',
    date: 'Dec 8',
    toFrom: { name: 'Payment from Acme Corp', initials: 'P' },
    amount: 200.00,
    account: 'AR',
    method: { type: 'invoice', direction: 'in' },
    status: 'completed',
  },
  {
    id: '4',
    date: 'Dec 8',
    toFrom: { name: 'To Ops / Payroll', initials: 'M', icon: 'mercury' },
    amount: -54810.16,
    account: 'AR',
    method: { type: 'transfer', direction: 'out' },
    status: 'completed',
  },
  {
    id: '5',
    date: 'Dec 8',
    toFrom: { name: 'From AR', initials: 'M', icon: 'mercury' },
    amount: 54810.16,
    account: 'Ops / Payroll',
    method: { type: 'transfer', direction: 'in' },
    status: 'completed',
  },
  {
    id: '6',
    date: 'Dec 8',
    toFrom: { name: "Lily's Eatery", initials: 'LE' },
    amount: 0.93,
    account: 'Ops / Payroll',
    method: { type: 'card', cardLast4: '1234', cardHolder: 'Jane B.' },
    glCode: 'Business Meals',
    glCodeAutoApplied: true,
    status: 'completed',
  },
  {
    id: '7',
    date: 'Dec 8',
    toFrom: { name: 'Deli 77', initials: 'D7' },
    amount: 6.91,
    account: 'Credit account',
    method: { type: 'card', cardLast4: '5555', cardHolder: 'Jane B.' },
    status: 'completed',
  },
  {
    id: '8',
    date: 'Dec 8',
    toFrom: { name: 'Deli 77', initials: 'D7' },
    amount: 23.28,
    account: 'Ops / Payroll',
    method: { type: 'card', cardLast4: '4929', cardHolder: 'Landon S.' },
    status: 'completed',
  },
  {
    id: '9',
    date: 'Dec 8',
    toFrom: { name: 'Office Stop Co.', initials: 'OS' },
    amount: -287.89,
    account: 'Ops / Payroll',
    method: { type: 'card', cardLast4: '9914', cardHolder: 'Jessica A.' },
    hasAttachment: true,
    status: 'completed',
  },
  {
    id: '10',
    date: 'Dec 8',
    toFrom: { name: "Trader John's", initials: 'TJ' },
    amount: 53.49,
    account: 'Credit account',
    method: { type: 'card', cardLast4: '0331', cardHolder: 'Landon S.' },
    status: 'completed',
  },
  {
    id: '11',
    date: 'Dec 8',
    toFrom: { name: 'Office Stop Co.', initials: 'OS' },
    amount: -662.70,
    account: 'Credit account',
    method: { type: 'card', cardLast4: '0330', cardHolder: 'Jane B.' },
    status: 'completed',
  },
  {
    id: '12',
    date: 'Dec 8',
    toFrom: { name: 'Office Stop Co.', initials: 'OS' },
    amount: 563.94,
    account: 'Credit account',
    method: { type: 'card', cardLast4: '0330', cardHolder: 'Jane B.' },
    status: 'completed',
  },
  {
    id: '13',
    date: 'Dec 8',
    toFrom: { name: 'The Plant Organic Cafe', initials: 'P' },
    amount: -14.21,
    account: 'Ops / Payroll',
    method: { type: 'card', cardLast4: '4928', cardHolder: 'Jane B.' },
    glCode: 'Business Meals',
    glCodeAutoApplied: true,
    status: 'completed',
  },
  {
    id: '14',
    date: 'Dec 8',
    toFrom: { name: "Trader John's", initials: 'TJ' },
    amount: -11.82,
    account: 'Ops / Payroll',
    method: { type: 'card', cardLast4: '3745', cardHolder: 'Jane B.' },
    status: 'completed',
  },
  {
    id: '15',
    date: 'Dec 8',
    toFrom: { name: 'Milgram Brokerage', initials: 'MB' },
    amount: 2760.75,
    account: 'Ops / Payroll',
    method: { type: 'card', cardLast4: '2345', cardHolder: 'Jane B.' },
    status: 'completed',
  },
  {
    id: '16',
    date: 'Dec 8',
    toFrom: { name: 'Monarch Books', initials: 'MB' },
    amount: 49.36,
    account: 'Ops / Payroll',
    method: { type: 'card', cardLast4: '7840', cardHolder: 'Aluna T.' },
    glCode: 'Office Supplies & Equipment',
    glCodeAutoApplied: true,
    status: 'completed',
  },
];

// Chart data for the line chart
export const lineChartData = [
  { date: 'Dec 1', moneyIn: 72000, moneyOut: 71500 },
  { date: 'Dec 2', moneyIn: 85000, moneyOut: 84000 },
  { date: 'Dec 3', moneyIn: 95000, moneyOut: 94500 },
  { date: 'Dec 4', moneyIn: 120000, moneyOut: 119000 },
  { date: 'Dec 5', moneyIn: 145000, moneyOut: 144500 },
  { date: 'Dec 6', moneyIn: 160000, moneyOut: 159000 },
  { date: 'Dec 7', moneyIn: 170000, moneyOut: 169500 },
];

// Bar chart data for To/From breakdown
export const barChartData = [
  { name: 'Mercury Savi...', value: 65000 },
  { name: 'AR', value: 58000 },
  { name: 'Jameson Acco...', value: 45000 },
  { name: 'Google', value: 38000 },
  { name: 'Treasury', value: 33000 },
];

// Category options
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
];

// Summary data
export const summaryData = {
  netChange: 44.62,
  netChangeDate: 'Dec 5',
  moneyIn: 25165.42,
  moneyOut: 25120.80,
};

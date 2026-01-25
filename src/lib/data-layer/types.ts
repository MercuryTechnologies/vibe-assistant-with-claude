// =============================================================================
// Data Layer Types
// =============================================================================
// Unified TypeScript interfaces for all data entities

// -----------------------------------------------------------------------------
// Company
// -----------------------------------------------------------------------------

export interface Address {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface Investor {
  name: string;
  amount: number;
  type: 'Lead' | 'Participant';
}

export interface Funding {
  stage: string;
  totalRaised: number;
  lastRoundAmount: number;
  lastRoundDate: string;
  investors: Investor[];
}

export interface CompanyMetrics {
  employeeCount: number;
  monthlyBurnRate: number;
  currentMRR: number;
  mrrGrowthRate: number;
  customersCount: number;
}

export interface Company {
  id: string;
  name: string;
  legalName: string;
  type: string;
  ein: string;
  industry: string;
  website: string;
  founded: string;
  address: Address;
  funding: Funding;
  metrics: CompanyMetrics;
  bankingStartDate: string;
}

// -----------------------------------------------------------------------------
// Accounts
// -----------------------------------------------------------------------------

export interface Account {
  id: string;
  name: string;
  type: 'checking' | 'savings' | 'treasury';
  balance: number;
  currency: string;
  accountNumber: string;
  routingNumber: string;
  status: 'active' | 'inactive' | 'pending';
  apy?: number;
  purpose?: string;
}

// -----------------------------------------------------------------------------
// Transactions
// -----------------------------------------------------------------------------

export interface Transaction {
  id: string;
  description: string;
  merchant: string;
  amount: number;
  type: 'credit' | 'debit' | 'transfer';
  date: string;
  category: string;
  status: 'completed' | 'pending' | 'failed';
  accountId: string;
  cardId?: string;
  hasAttachment?: boolean;
  [key: string]: unknown;
}

export type TransactionCategory =
  | 'Revenue'
  | 'Investment'
  | 'Payroll'
  | 'Infrastructure'
  | 'Software'
  | 'Office'
  | 'Equipment'
  | 'Marketing'
  | 'Professional Services'
  | 'Insurance'
  | 'Benefits'
  | 'Travel'
  | 'Meals'
  | 'Contractor'
  | 'Interest'
  | 'Transfer'
  | 'Refund';

// -----------------------------------------------------------------------------
// Cards
// -----------------------------------------------------------------------------

export interface BillingAddress {
  street: string;
  city: string;
  state: string;
  zip: string;
}

export interface Card {
  id: string;
  cardholder: string;
  employeeId: string;
  cardName: string;
  cardNumber: string;
  nickname?: string;
  monthlyLimit: number;
  type: 'Virtual Debit' | 'Physical Debit';
  accountId: string;
  status: 'active' | 'frozen' | 'cancelled';
  billingAddress: BillingAddress;
}

export interface CardWithSpending extends Card {
  spentThisMonth: number;
  spentLastMonth: number;
  transactionCount: number;
}

// -----------------------------------------------------------------------------
// Employees
// -----------------------------------------------------------------------------

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  department: string;
  startDate: string;
  salary: number;
  cardId: string | null;
  isAdmin: boolean;
}

// -----------------------------------------------------------------------------
// Recipients
// -----------------------------------------------------------------------------

export interface Recipient {
  id: string;
  name: string;
  initials: string;
  type: 'vendor' | 'client' | 'contractor' | 'investor' | 'internal';
  category: string;
  status: 'active' | 'inactive' | 'pending';
  lastPaid?: string;
  totalPaid?: number;
  totalReceived?: number;
}

// -----------------------------------------------------------------------------
// Tasks
// -----------------------------------------------------------------------------

export interface Task {
  id: string;
  status: 'incomplete' | 'completed';
  type: 'email' | 'team_invite' | 'payment' | 'recurring_payment' | 'policy' | 'security' | 'other';
  description: string;
  dueBy?: string;
  received?: string;
  completedOn?: string;
  completedBy?: string;
  actionLabel?: string;
  actionHref?: string;
}

// -----------------------------------------------------------------------------
// Summary Types (for AI context)
// -----------------------------------------------------------------------------

export interface CashflowSummary {
  period: string;
  startDate: string;
  endDate: string;
  moneyIn: number;
  moneyOut: number;
  net: number;
  transactionCount: number;
}

export interface CategorySpend {
  category: string;
  amount: number;
  transactionCount: number;
  percentOfTotal: number;
}

export interface MerchantSpend {
  merchant: string;
  amount: number;
  transactionCount: number;
  category: string;
}

export interface RunwayInfo {
  totalBalance: number;
  monthlyBurn: number;
  monthsRemaining: number;
  burnTrend: 'increasing' | 'stable' | 'decreasing';
  lastCalculated: string;
}

export interface PayrollSummary {
  lastPayrollDate: string;
  lastPayrollAmount: number;
  averagePayroll: number;
  totalYTD: number;
  employeeCount: number;
}

export interface CardSpendingSummary {
  cardId: string;
  cardholder: string;
  cardName: string;
  spentThisMonth: number;
  monthlyLimit: number;
  percentUsed: number;
  isOverBudget: boolean;
}

export interface RevenueSummary {
  currentMRR: number;
  previousMRR: number;
  mrrGrowth: number;
  mrrGrowthPercent: number;
  totalRevenueLast30Days: number;
  totalRevenueYTD: number;
  topCustomers: Array<{ name: string; amount: number }>;
}

// -----------------------------------------------------------------------------
// Filter Types
// -----------------------------------------------------------------------------

export interface TransactionFilters {
  startDate?: string;
  endDate?: string;
  categories?: string[];
  accountIds?: string[];
  merchants?: string[];
  minAmount?: number;
  maxAmount?: number;
  type?: 'credit' | 'debit' | 'transfer';
  status?: 'completed' | 'pending' | 'failed';
  cardId?: string;
}

export interface DateRange {
  start: Date;
  end: Date;
}

// -----------------------------------------------------------------------------
// Data Store Types (for complete data access)
// -----------------------------------------------------------------------------

export interface DataStore {
  company: Company;
  accounts: Account[];
  transactions: Transaction[];
  cards: Card[];
  employees: Employee[];
  recipients: Recipient[];
  tasks: Task[];
}

// Account types
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
}

// Transaction types
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
  hasAttachment?: boolean;
  [key: string]: unknown;
}

// User types
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'Admin' | 'Finance' | 'Viewer';
  avatar: string | null;
  company?: Company;
}

export interface Company {
  id: string;
  name: string;
  type: string;
  industry: string;
  website: string;
}

export interface TeamMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'Admin' | 'Finance' | 'Viewer';
  avatar: string | null;
}

// Task types
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

// Recipient types
export interface Recipient {
  id: string;
  name: string;
  initials?: string;
  status: 'active' | 'inactive' | 'pending';
  lastPaid?: string;
}
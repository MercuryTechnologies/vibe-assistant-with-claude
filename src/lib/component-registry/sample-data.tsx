import type { DSTableColumn } from '@/components/ui/ds-table';
import { Badge } from '@/components/ui/badge';
import type { Transaction } from '@/types';
import type { ComboboxOption } from '@/components/ui/ds-combobox';

// Sample data for DSTable demos
export interface Person {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive' | 'pending';
  amount: number;
}

export const samplePeople: Person[] = [
  { id: '1', name: 'Alice Johnson', email: 'alice@company.com', role: 'Admin', status: 'active', amount: 12500.00 },
  { id: '2', name: 'Bob Smith', email: 'bob@company.com', role: 'Finance', status: 'active', amount: 8750.50 },
  { id: '3', name: 'Carol White', email: 'carol@company.com', role: 'Viewer', status: 'pending', amount: 3200.00 },
  { id: '4', name: 'David Brown', email: 'david@company.com', role: 'Finance', status: 'inactive', amount: 15000.00 },
  { id: '5', name: 'Eve Davis', email: 'eve@company.com', role: 'Admin', status: 'active', amount: 9800.25 },
];

export const personColumns: DSTableColumn<Person>[] = [
  { id: 'name', header: 'Name', accessor: 'name', sortable: true },
  { id: 'email', header: 'Email', accessor: 'email' },
  { id: 'role', header: 'Role', accessor: 'role', sortable: true },
  { 
    id: 'status', 
    header: 'Status', 
    accessor: 'status',
    cell: (value) => (
      <Badge 
        type={value === 'active' ? 'success' : value === 'pending' ? 'warning' : 'neutral'}
      >
        {String(value)}
      </Badge>
    )
  },
  { 
    id: 'amount', 
    header: 'Amount', 
    accessor: 'amount',
    align: 'right',
    sortable: true,
    cell: (value) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value as number)
  },
];

// InlineCombobox Demo Options
export const categoryOptions = [
  { value: 'other-travel', label: 'Other Travel' },
  { value: 'software', label: 'Software' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'payroll', label: 'Payroll' },
  { value: 'office-supplies', label: 'Office Supplies' },
];

// GroupedTable sample data
export interface DemoTransaction {
  id: string;
  amount: number;
  merchant: string;
  date: string;
}

export const sampleGroupItems: DemoTransaction[] = [
  { id: '1', amount: 500, merchant: 'Acme Corp', date: '2024-01-15' },
  { id: '2', amount: -150, merchant: 'Office Supplies Inc', date: '2024-01-14' },
  { id: '3', amount: 1200, merchant: 'Client Payment', date: '2024-01-13' },
];

// DSCombobox Demo Options
export const comboboxDemoOptions = [
  { value: 'option-1', label: 'Option 1' },
  { value: 'option-2', label: 'Option 2' },
  { value: 'option-3', label: 'Option 3' },
  { value: 'option-4', label: 'Option 4' },
  { value: 'option-5', label: 'Option 5' },
];

export const categoryDemoOptions = [
  { value: 'software', label: 'Software' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'payroll', label: 'Payroll' },
  { value: 'travel', label: 'Travel' },
  { value: 'office-supplies', label: 'Office Supplies' },
  { value: 'utilities', label: 'Utilities' },
];

// DSRadioGroup Demo Options
export const radioOptions = [
  { value: 'option1', label: 'First option' },
  { value: 'option2', label: 'Second option' },
  { value: 'option3', label: 'Third option' },
];

export const radioOptionsWithDescription = [
  { value: 'any', label: 'Any' },
  { value: 'in', label: 'In', description: '(e.g. deposits, refunds)' },
  { value: 'out', label: 'Out', description: '(e.g. purchases, charges)' },
];

// Sample transaction data for DSTable demos with detail panel
export const sampleTransactions: Transaction[] = [
  { 
    id: 'txn-1', 
    description: 'GOOGLE*CLOUD', 
    merchant: 'Google Cloud', 
    amount: -2500.00, 
    type: 'debit', 
    date: '2024-01-15T10:30:00Z', 
    category: 'Software', 
    status: 'completed', 
    accountId: 'checking-1',
    hasAttachment: true,
  },
  { 
    id: 'txn-2', 
    description: 'ACH CREDIT FROM CLIENT', 
    merchant: 'Acme Corp', 
    amount: 15000.00, 
    type: 'credit', 
    date: '2024-01-14T14:22:00Z', 
    category: 'Income', 
    status: 'completed', 
    accountId: 'checking-1',
    hasAttachment: false,
  },
  { 
    id: 'txn-3', 
    description: 'OFFICE DEPOT #1234', 
    merchant: 'Office Depot', 
    amount: -342.50, 
    type: 'debit', 
    date: '2024-01-13T09:15:00Z', 
    category: 'Office Supplies', 
    status: 'completed', 
    accountId: 'checking-1',
    hasAttachment: true,
  },
  { 
    id: 'txn-4', 
    description: 'AWS*AMAZON WEB SERVICES', 
    merchant: 'Amazon Web Services', 
    amount: -1899.99, 
    type: 'debit', 
    date: '2024-01-12T16:45:00Z', 
    category: 'Software', 
    status: 'completed', 
    accountId: 'checking-1',
    hasAttachment: false,
  },
  { 
    id: 'txn-5', 
    description: 'TRANSFER TO SAVINGS', 
    merchant: 'Internal Transfer', 
    amount: -5000.00, 
    type: 'transfer', 
    date: '2024-01-11T08:00:00Z', 
    category: 'Transfer', 
    status: 'completed', 
    accountId: 'savings-1',
    hasAttachment: false,
  },
];

// Helper functions for transaction demos
export function getAccountType(accountId: string): string {
  const accountMap: Record<string, string> = {
    'checking-1': 'Mercury Checking',
    'savings-1': 'Treasury',
    'checking-2': 'Payroll Account',
  };
  return accountMap[accountId] || 'Unknown Account';
}

export function getMethod(transaction: Transaction): string {
  if (transaction.type === 'transfer') return 'Transfer';
  if (transaction.description.includes('ACH')) return 'ACH';
  if (transaction.description.includes('WIRE')) return 'Wire';
  return 'Card';
}

// Category options for transaction detail panel
export const transactionCategoryOptions: ComboboxOption[] = [
  { value: 'Software', label: 'Software' },
  { value: 'Income', label: 'Income' },
  { value: 'Office Supplies', label: 'Office Supplies' },
  { value: 'Marketing', label: 'Marketing' },
  { value: 'Payroll', label: 'Payroll' },
  { value: 'Transfer', label: 'Transfer' },
  { value: 'Utilities', label: 'Utilities' },
  { value: 'Professional Services', label: 'Professional Services' },
  { value: 'Equipment', label: 'Equipment' },
  { value: 'Other Travel', label: 'Other Travel' },
];

// Transaction columns for demo tables
export const transactionColumns: DSTableColumn<Transaction>[] = [
  {
    id: 'date',
    header: 'Date',
    accessor: 'date',
    sortable: true,
    width: '100px',
    cell: (value) => {
      const date = new Date(value as string);
      return (
        <span className="text-body">
          {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </span>
      );
    },
  },
  {
    id: 'merchant',
    header: 'To/From',
    accessor: 'merchant',
    sortable: true,
    cell: (value) => (
      <span className="text-body">{value as string}</span>
    ),
  },
  {
    id: 'amount',
    header: 'Amount',
    accessor: 'amount',
    align: 'right',
    sortable: true,
    width: '120px',
  },
  {
    id: 'account',
    header: 'Account',
    accessor: (row) => getAccountType(row.accountId),
    sortable: true,
    cell: (value) => (
      <span className="text-body">{value as string}</span>
    ),
  },
  {
    id: 'category',
    header: 'Category',
    accessor: 'category',
    sortable: true,
    cell: (value) => (
      <span className="text-body">{value as string}</span>
    ),
  },
];

// =============================================================================
// Data Layer - Core Module
// =============================================================================
// Unified data access layer for the application and AI context

import companyData from '@/data/company.json';
import accountsData from '@/data/accounts.json';
import transactionsData from '@/data/transactions.json';
import cardsData from '@/data/cards.json';
import employeesData from '@/data/employees.json';
import recipientsData from '@/data/recipients.json';
import tasksData from '@/data/tasks.json';

import type {
  Company,
  Account,
  Transaction,
  Card,
  CardWithSpending,
  Employee,
  Recipient,
  Task,
  TransactionFilters,
  DataStore,
} from './types';

// Re-export types
export * from './types';

// Re-export summary functions
export * from './summaries';

// Re-export AI context builder
export { buildAIContext, buildCompactAIContext } from './ai-context';

// =============================================================================
// Data Accessors
// =============================================================================

/**
 * Get company profile
 */
export function getCompany(): Company {
  return companyData.company as Company;
}

/**
 * Get all accounts
 */
export function getAccounts(): Account[] {
  return accountsData.accounts as Account[];
}

/**
 * Get account by ID
 */
export function getAccountById(accountId: string): Account | undefined {
  return getAccounts().find(a => a.id === accountId);
}

/**
 * Get total balance across all accounts
 */
export function getTotalBalance(): number {
  return getAccounts().reduce((sum, account) => sum + account.balance, 0);
}

/**
 * Get all transactions with optional filtering
 */
export function getTransactions(filters?: TransactionFilters): Transaction[] {
  let transactions = transactionsData.transactions as Transaction[];

  if (!filters) return transactions;

  if (filters.startDate) {
    transactions = transactions.filter(t => t.date >= filters.startDate!);
  }
  if (filters.endDate) {
    transactions = transactions.filter(t => t.date <= filters.endDate!);
  }
  if (filters.categories && filters.categories.length > 0) {
    const cats = filters.categories.map(c => c.toLowerCase());
    transactions = transactions.filter(t => 
      cats.includes(t.category.toLowerCase())
    );
  }
  if (filters.accountIds && filters.accountIds.length > 0) {
    transactions = transactions.filter(t => 
      filters.accountIds!.includes(t.accountId)
    );
  }
  if (filters.merchants && filters.merchants.length > 0) {
    const merchants = filters.merchants.map(m => m.toLowerCase());
    transactions = transactions.filter(t => 
      merchants.some(m => t.merchant.toLowerCase().includes(m))
    );
  }
  if (filters.minAmount !== undefined) {
    transactions = transactions.filter(t => Math.abs(t.amount) >= filters.minAmount!);
  }
  if (filters.maxAmount !== undefined) {
    transactions = transactions.filter(t => Math.abs(t.amount) <= filters.maxAmount!);
  }
  if (filters.type) {
    transactions = transactions.filter(t => t.type === filters.type);
  }
  if (filters.status) {
    transactions = transactions.filter(t => t.status === filters.status);
  }
  if (filters.cardId) {
    transactions = transactions.filter(t => t.cardId === filters.cardId);
  }

  return transactions;
}

/**
 * Get transactions for a specific account
 */
export function getTransactionsByAccount(accountId: string): Transaction[] {
  return getTransactions({ accountIds: [accountId] });
}

/**
 * Get transactions by merchant name (partial match)
 */
export function getTransactionsByMerchant(merchantName: string): Transaction[] {
  return getTransactions({ merchants: [merchantName] });
}

/**
 * Get transactions by category
 */
export function getTransactionsByCategory(category: string): Transaction[] {
  return getTransactions({ categories: [category] });
}

/**
 * Get recent transactions (sorted by date descending)
 */
export function getRecentTransactions(limit: number = 10): Transaction[] {
  return [...getTransactions()]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);
}

/**
 * Get all cards
 */
export function getCards(): Card[] {
  return cardsData.cards as Card[];
}

/**
 * Get card by ID
 */
export function getCardById(cardId: string): Card | undefined {
  return getCards().find(c => c.id === cardId);
}

/**
 * Get cards with spending data calculated from transactions
 */
export function getCardsWithSpending(): CardWithSpending[] {
  const cards = getCards();
  const now = new Date();
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const lastMonth = now.getMonth() === 0
    ? `${now.getFullYear() - 1}-12`
    : `${now.getFullYear()}-${String(now.getMonth()).padStart(2, '0')}`;

  return cards.map(card => {
    const cardTransactions = getTransactions({ cardId: card.id });
    
    const thisMonthTxns = cardTransactions.filter(t => t.date.startsWith(thisMonth));
    const lastMonthTxns = cardTransactions.filter(t => t.date.startsWith(lastMonth));

    const spentThisMonth = thisMonthTxns
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const spentLastMonth = lastMonthTxns
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    return {
      ...card,
      spentThisMonth,
      spentLastMonth,
      transactionCount: thisMonthTxns.length,
    };
  });
}

/**
 * Get all employees
 */
export function getEmployees(): Employee[] {
  return employeesData.employees as Employee[];
}

/**
 * Get employee by ID
 */
export function getEmployeeById(employeeId: string): Employee | undefined {
  return getEmployees().find(e => e.id === employeeId);
}

/**
 * Get employees by department
 */
export function getEmployeesByDepartment(department: string): Employee[] {
  return getEmployees().filter(e => 
    e.department.toLowerCase() === department.toLowerCase()
  );
}

/**
 * Get all recipients
 */
export function getRecipients(): Recipient[] {
  return recipientsData.recipients as Recipient[];
}

/**
 * Get recipient by ID
 */
export function getRecipientById(recipientId: string): Recipient | undefined {
  return getRecipients().find(r => r.id === recipientId);
}

/**
 * Get recipients by type
 */
export function getRecipientsByType(type: Recipient['type']): Recipient[] {
  return getRecipients().filter(r => r.type === type);
}

/**
 * Get all tasks
 */
export function getTasks(): Task[] {
  return tasksData.tasks as Task[];
}

/**
 * Get incomplete tasks
 */
export function getIncompleteTasks(): Task[] {
  return getTasks().filter(t => t.status === 'incomplete');
}

/**
 * Get complete data store (all data at once)
 */
export function getDataStore(): DataStore {
  return {
    company: getCompany(),
    accounts: getAccounts(),
    transactions: getTransactions(),
    cards: getCards(),
    employees: getEmployees(),
    recipients: getRecipients(),
    tasks: getTasks(),
  };
}

// =============================================================================
// Search Functions
// =============================================================================

/**
 * Search transactions by query string
 */
export function searchTransactions(query: string, limit: number = 20): Transaction[] {
  const q = query.toLowerCase();
  return getTransactions()
    .filter(t => 
      t.merchant.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q)
    )
    .slice(0, limit);
}

/**
 * Search recipients by name
 */
export function searchRecipients(query: string): Recipient[] {
  const q = query.toLowerCase();
  return getRecipients().filter(r => 
    r.name.toLowerCase().includes(q)
  );
}

/**
 * Search employees by name
 */
export function searchEmployees(query: string): Employee[] {
  const q = query.toLowerCase();
  return getEmployees().filter(e => 
    `${e.firstName} ${e.lastName}`.toLowerCase().includes(q) ||
    e.email.toLowerCase().includes(q)
  );
}

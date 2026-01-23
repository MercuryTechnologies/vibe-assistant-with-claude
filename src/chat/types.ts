// =============================================================================
// Chat Types
// =============================================================================
// TypeScript interfaces for chat messages, metadata, and agent responses

/**
 * Metadata for navigation actions
 */
export interface NavigationMetadata {
  target: string       // Display name, e.g., "Transactions"
  url: string          // App route, e.g., "/transactions"
  countdown?: boolean  // Whether to show countdown before navigating
  followUpAction?: 'answer_with_page_data' | 'apply_filters'  // What to do after navigation
  filters?: TransactionFilters  // Filters to apply (for transactions page)
  pageData?: InsightsPageData | TransactionsPageData  // Data to use for follow-up answer
}

/**
 * Data from the insights page for follow-up answers
 */
export interface InsightsPageData {
  totalBalance: number
  moneyIn: number
  moneyOut: number
  netChange: number
  trend: 'positive' | 'negative' | 'neutral'
  topCategories: Array<{ category: string; amount: number }>
  transactionCount: number
}

/**
 * Data from the transactions page for follow-up answers
 */
export interface TransactionsPageData {
  wireCount?: number
  totalAmount?: number
  recentWires?: Array<{
    id: string
    date: string
    counterparty: string
    amount: number
  }>
}

/**
 * Transaction filter configuration
 */
export interface TransactionFilters {
  keywords?: string[]      // Search keywords
  categories?: string[]    // Category filters
  types?: string[]         // Transaction types (wire, ach, etc.)
  dateRange?: { from: string; to: string }
  amount?: { min?: number; max?: number; direction?: 'in' | 'out' }
}

/**
 * Metadata for form prefill actions
 */
export interface FormPrefillMetadata {
  formType: 'payment' | 'card_create' | 'user_invite' | 'recipient_create'
  data: Record<string, unknown>
  url: string
}

/**
 * Metadata for action execution (freeze card, update transaction, etc.)
 */
export interface ActionMetadata {
  actionType: string
  targetId: string
  completed: boolean
  undoAvailable: boolean
}

/**
 * Metadata for link display
 */
export interface LinkMetadata {
  url: string
  label: string
}

/**
 * Metadata for support handoff
 */
export interface SupportHandoffMetadata {
  reason: string
  ticketId: string
}

/**
 * A transaction row in a table
 */
export interface TransactionTableRow {
  id: string
  counterparty: string
  amount: number
  date: string
  category?: string
  type?: string
  dashboardLink: string
}

/**
 * Metadata for transaction table display
 */
export interface TransactionTableMetadata {
  title?: string           // e.g., "Your top expenses this month"
  rows: TransactionTableRow[]
  showCategory?: boolean   // Whether to show category column
  showType?: boolean       // Whether to show transaction type column
}

/**
 * An employee row in a table
 */
export interface EmployeeTableRow {
  id: string
  name: string
  email: string
  department: string
  salary: number
  hasCard: boolean
}

/**
 * Metadata for employee table display
 */
export interface EmployeeTableMetadata {
  title?: string           // e.g., "Employees (6)"
  rows: EmployeeTableRow[]
  selectable?: boolean     // Whether to show checkboxes for selection
}

/**
 * A step in the thinking chain
 */
export interface ThinkingStep {
  id: string
  label: string
  status: 'pending' | 'in_progress' | 'done' | 'error'
}

/**
 * A clarification request for ambiguity resolution
 */
export interface ClarificationRequest {
  id: string
  question: string
  options: Array<{ id: string; label: string; subtitle?: string }>
}

/**
 * An entity card (for drafts, scheduled items, etc.)
 */
export interface EntityCard {
  entityType: 'card' | 'payment' | 'employee'
  entityId: string
  data: Record<string, unknown>
  status: 'draft' | 'scheduled' | 'void'
}

/**
 * Combined metadata that can be attached to assistant messages
 */
export interface MessageMetadata {
  navigation?: NavigationMetadata
  formPrefill?: FormPrefillMetadata
  action?: ActionMetadata
  link?: LinkMetadata
  supportHandoff?: SupportHandoffMetadata
  transactionTable?: TransactionTableMetadata
  employeeTable?: EmployeeTableMetadata
  thinkingChain?: ThinkingStep[]
  clarificationRequest?: ClarificationRequest
  entityCards?: EntityCard[]
}

/**
 * A single message in the chat conversation
 */
export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  metadata?: MessageMetadata
  isThinking?: boolean
}

/**
 * Response from the agent API
 */
export interface AgentResponse {
  message: string
  metadata?: MessageMetadata
  toolsUsed?: string[]
  conversationId?: string
}

/**
 * Request body for the chat API
 */
export interface ChatRequest {
  message: string
  conversationId?: string
  history?: Array<{
    role: 'user' | 'assistant'
    content: string
  }>
}

/**
 * Thinking status messages for the UI
 */
export type ThinkingStatus = 
  | 'Thinking'
  | 'Checking your accounts...'
  | 'Searching transactions...'
  | 'Looking up your cards...'
  | 'Finding recipients...'
  | 'Preparing navigation...'
  | 'Setting up form...'
  | 'Processing action...'
  | 'Connecting you to support...'
  | 'Looking up employees...'
  | 'Creating card drafts...'
  | 'Processing cards...'

/**
 * Navigation URL mapping (page name -> app route)
 */
export const NAVIGATION_URLS: Record<string, { url: string; displayName: string }> = {
  home: { url: '/dashboard', displayName: 'Home' },
  dashboard: { url: '/dashboard', displayName: 'Dashboard' },
  accounts: { url: '/accounts', displayName: 'Accounts' },
  transactions: { url: '/transactions', displayName: 'Transactions' },
  insights: { url: '/dashboard', displayName: 'Insights' },
  cards: { url: '/cards', displayName: 'Cards' },
  payments: { url: '/payments/recipients', displayName: 'Payments' },
  tasks: { url: '/tasks', displayName: 'Tasks' },
  'bill-pay': { url: '/workflows/bill-pay', displayName: 'Bill Pay' },
  invoicing: { url: '/workflows/invoicing', displayName: 'Invoicing' },
  accounting: { url: '/workflows/accounting', displayName: 'Accounting' },
}

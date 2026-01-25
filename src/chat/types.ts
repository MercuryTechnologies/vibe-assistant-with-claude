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
  counterparty?: string
  merchant?: string
  description?: string
  amount: number
  date: string
  category?: string
  type?: string
  status?: 'completed' | 'pending' | 'failed'
  dashboardLink?: string
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
 * A card row in a table
 */
export interface CardTableRow {
  id: string
  cardholder: string
  cardLast4: string
  cardName?: string
  spent: number
  limit: number
  status: 'active' | 'frozen' | 'cancelled'
}

/**
 * Metadata for cards table display
 */
export interface CardsTableMetadata {
  title?: string
  rows: CardTableRow[]
  showDetailFor?: string  // Card ID to show expanded details for
}

/**
 * A recipient row in a list
 */
export interface RecipientRow {
  id: string
  name: string
  bankName?: string
  accountLast4?: string
  lastPaidDate?: string
  lastPaidAmount?: number
}

/**
 * Metadata for recipients display
 */
export interface RecipientsMetadata {
  title?: string
  rows: RecipientRow[]
  allowPayment?: boolean  // Whether to show "Send Payment" action
}

/**
 * Metadata for inline payment form
 */
export interface PaymentFormMetadata {
  recipientId?: string
  recipientName?: string
  suggestedAmount?: number
  paymentType: 'ach' | 'wire'
  memo?: string
}

/**
 * A document row in a list
 */
export interface DocumentRow {
  id: string
  name: string
  type: 'statement' | 'tax' | 'receipt' | 'other'
  date: string
  accountName?: string
  url?: string
}

/**
 * Metadata for documents display
 */
export interface DocumentsMetadata {
  title?: string
  documents: DocumentRow[]
}

/**
 * Metadata for inline invoice form
 */
export interface InvoiceFormMetadata {
  clientId?: string
  clientName?: string
  draftItems?: Array<{ description: string; amount: number }>
  dueDate?: string
}

/**
 * Metadata for bill upload display
 */
export interface BillUploadMetadata {
  billId?: string
  vendorName?: string
  extractedAmount?: number
  extractedDueDate?: string
  status: 'uploading' | 'extracted' | 'confirmed'
}

/**
 * Account balance information
 */
export interface AccountBalanceRow {
  id: string
  name: string
  type: 'checking' | 'savings' | 'treasury'
  balance: number
  accountNumber?: string
}

/**
 * Metadata for account balances display
 */
export interface AccountBalancesMetadata {
  title?: string
  accounts: AccountBalanceRow[]
  totalBalance?: number
}

/**
 * A feature discovery card
 */
export interface FeatureCard {
  id: string
  title: string
  subtitle: string
  description: string
  icon: string  // FontAwesome icon name
  color: 'purple-magic' | 'green' | 'neutral'
  highlight?: string  // Optional badge text
  stats: Array<{ label: string; value: string }>
  cta: { label: string; action: string }
}

/**
 * Metadata for feature cards display
 */
export interface FeatureCardsMetadata {
  cards: FeatureCard[]
}

/**
 * Metadata for empty state display
 */
export interface EmptyStateMetadata {
  message: string
  suggestion?: string
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
  // New metadata types for extended chat capabilities
  cardsTable?: CardsTableMetadata
  recipients?: RecipientsMetadata
  paymentForm?: PaymentFormMetadata
  documents?: DocumentsMetadata
  invoiceForm?: InvoiceFormMetadata
  billUpload?: BillUploadMetadata
  accountBalances?: AccountBalancesMetadata
  featureCards?: FeatureCardsMetadata
  // Empty state for zero-result queries
  emptyState?: EmptyStateMetadata
  // Support mode indicator
  supportMode?: boolean
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
  explore: { url: '/explore', displayName: 'Explore' },
  cards: { url: '/cards', displayName: 'Cards' },
  payments: { url: '/payments/recipients', displayName: 'Payments' },
  tasks: { url: '/tasks', displayName: 'Tasks' },
  'bill-pay': { url: '/workflows/bill-pay', displayName: 'Bill Pay' },
  invoicing: { url: '/workflows/invoicing', displayName: 'Invoicing' },
  accounting: { url: '/workflows/accounting', displayName: 'Accounting' },
}

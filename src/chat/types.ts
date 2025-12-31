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
 * Combined metadata that can be attached to assistant messages
 */
export interface MessageMetadata {
  navigation?: NavigationMetadata
  formPrefill?: FormPrefillMetadata
  action?: ActionMetadata
  link?: LinkMetadata
  supportHandoff?: SupportHandoffMetadata
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

/**
 * All possible thinking status messages
 */
export const THINKING_MESSAGES: ThinkingStatus[] = [
  'Thinking',
  'Checking your accounts...',
  'Searching transactions...',
  'Looking up your cards...',
  'Finding recipients...',
  'Preparing navigation...',
  'Setting up form...',
  'Processing action...',
  'Connecting you to support...',
]

/**
 * Tool-specific thinking messages
 */
export const TOOL_THINKING_MESSAGES: Record<string, ThinkingStatus[]> = {
  get_accounts: ['Checking your accounts...'],
  get_account_details: ['Checking your accounts...'],
  search_transactions: ['Searching transactions...'],
  get_transaction_details: ['Searching transactions...'],
  get_recipients: ['Finding recipients...'],
  search_recipients: ['Finding recipients...'],
  get_cards: ['Looking up your cards...'],
  navigate_to_page: ['Preparing navigation...'],
  prefill_payment_form: ['Setting up form...'],
  prefill_card_form: ['Setting up form...'],
  prefill_user_invite: ['Setting up form...'],
  prefill_recipient_form: ['Setting up form...'],
  freeze_card: ['Processing action...'],
  unfreeze_card: ['Processing action...'],
  update_transaction_note: ['Processing action...'],
  update_transaction_category: ['Processing action...'],
  handoff_to_support: ['Connecting you to support...'],
}

/**
 * Navigation URL mapping (page name -> app route)
 */
export const NAVIGATION_URLS: Record<string, { url: string; displayName: string }> = {
  home: { url: '/home', displayName: 'Home' },
  dashboard: { url: '/home', displayName: 'Home' },
  accounts: { url: '/accounts', displayName: 'Accounts' },
  transactions: { url: '/transactions', displayName: 'Transactions' },
  insights: { url: '/insights', displayName: 'Insights' },
  cards: { url: '/cards', displayName: 'Cards' },
  payments: { url: '/payments', displayName: 'Payments' },
  tasks: { url: '/tasks', displayName: 'Tasks' },
  'bill-pay': { url: '/workflows/bill-pay', displayName: 'Bill Pay' },
  invoicing: { url: '/workflows/invoicing', displayName: 'Invoicing' },
  accounting: { url: '/workflows/accounting', displayName: 'Accounting' },
}

/**
 * Prefill option from the AskAnythingInput
 */
export interface PrefillOption {
  title: string
  subtitle: string
  icon: 'square' | 'rounded'
  initialMessage: string
}

/**
 * The 4 default prefill options
 */
export const DEFAULT_PREFILL_OPTIONS: PrefillOption[] = [
  {
    title: "What's my Cashflow?",
    subtitle: 'Ask about your financial insights',
    icon: 'square',
    initialMessage: "What's my cashflow?",
  },
  {
    title: 'Canceling a payment you just sent',
    subtitle: 'Mercury Help Center',
    icon: 'square',
    initialMessage: 'How do I cancel a payment I just sent?',
  },
  {
    title: 'Recent wire transactions',
    subtitle: '/transactions',
    icon: 'rounded',
    initialMessage: 'Show me my recent wire transactions',
  },
  {
    title: 'Send a wire',
    subtitle: '/send-money',
    icon: 'rounded',
    initialMessage: 'I want to send a wire payment',
  },
]


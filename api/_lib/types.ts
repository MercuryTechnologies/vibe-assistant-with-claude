// =============================================================================
// API Types
// =============================================================================
// Shared TypeScript types for the Mercury Agent API

/**
 * Bank account
 */
export interface Account {
  id: string
  name: string
  nickname: string | null
  kind: 'checking' | 'savings'
  currentBalance: number
  availableBalance: number
  status: 'active' | 'closed'
  accountNumber: string
  routingNumber: string
  dashboardLink: string
}

/**
 * Transaction
 */
export interface Transaction {
  id: string
  amount: number
  postedAt: string | null
  status: 'pending' | 'sent' | 'cancelled' | 'failed' | 'reversed' | 'blocked'
  counterpartyName: string
  kind: string
  bankDescription: string
  note: string | null
  mercuryCategory: string | null
  dashboardLink: string
}

/**
 * Payment recipient
 */
export interface Recipient {
  id: string
  name: string
  status: 'active' | 'inactive'
  defaultPaymentMethod: 'ach' | 'domesticWire' | 'internationalWire' | 'check'
  dateLastPaid: string | null
  emails: string[]
}

/**
 * Debit/credit card
 */
export interface Card {
  cardId: string
  nameOnCard: string
  lastFourDigits: string
  status: 'active' | 'frozen' | 'cancelled' | 'expired'
  network: 'mastercard' | 'visa'
}

/**
 * Organization
 */
export interface Organization {
  id: string
  legalBusinessName: string
  ein: string
  kind: 'business' | 'personal'
}

/**
 * Expense category
 */
export interface Category {
  id: string
  name: string
}

/**
 * Credit account
 */
export interface CreditAccount {
  id: string
  status: 'active' | 'closed'
  createdAt: string
  availableBalance: number
  currentBalance: number
  creditLimit: number
}

/**
 * Employee for card issuance
 */
export interface Employee {
  id: string
  name: string
  email: string
  department: string
  salary: number
  hasCard: boolean
  cardId?: string
}

/**
 * Employee table row for display
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
 * Employee table metadata for displaying employees in chat
 */
export interface EmployeeTableMetadata {
  title?: string
  rows: EmployeeTableRow[]
  selectable?: boolean
}

/**
 * Thinking step in agentic flow
 */
export interface ThinkingStep {
  id: string
  label: string
  status: 'pending' | 'in_progress' | 'done' | 'error'
}

/**
 * Clarification request for ambiguity resolution
 */
export interface ClarificationRequest {
  id: string
  question: string
  options: Array<{ id: string; label: string; subtitle?: string }>
}

/**
 * Entity card for draft/scheduled/void states
 */
export interface EntityCard {
  entityType: 'card' | 'payment' | 'employee'
  entityId: string
  data: Record<string, unknown>
  status: 'draft' | 'scheduled' | 'void'
}

/**
 * Transaction filter configuration
 */
export interface TransactionFilters {
  keywords?: string[]
  categories?: string[]
  types?: string[]
  dateRange?: { from: string; to: string }
  amount?: { min?: number; max?: number; direction?: 'in' | 'out' }
}

/**
 * Navigation metadata in agent responses
 */
export interface NavigationMetadata {
  target: string
  url: string
  countdown?: boolean
  followUpAction?: 'answer_with_page_data' | 'apply_filters'
  filters?: TransactionFilters
}

/**
 * Form prefill metadata in agent responses
 */
export interface FormPrefillMetadata {
  formType: 'payment' | 'card_create' | 'user_invite' | 'recipient_create'
  data: Record<string, unknown>
  url: string
}

/**
 * Action metadata in agent responses
 */
export interface ActionMetadata {
  actionType: string
  targetId: string
  completed: boolean
  undoAvailable: boolean
}

/**
 * Link metadata in agent responses
 */
export interface LinkMetadata {
  url: string
  label: string
}

/**
 * Support handoff metadata
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
 * Transaction table metadata for displaying transactions in chat
 */
export interface TransactionTableMetadata {
  title?: string
  rows: TransactionTableRow[]
  showCategory?: boolean
  showType?: boolean
}

/**
 * Combined message metadata
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
 * Chat message in conversation history
 */
export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

/**
 * Agent response
 */
export interface AgentResponse {
  message: string
  metadata?: MessageMetadata
  toolsUsed?: string[]
  conversationId?: string
}

/**
 * Chat API request body
 */
export interface ChatRequest {
  message: string
  conversationId?: string
  history?: ChatMessage[]
}


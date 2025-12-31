// =============================================================================
// Mercury Agent Tool Executor
// =============================================================================
// Executes tool calls and returns structured results

import {
  MOCK_ACCOUNTS,
  MOCK_TRANSACTIONS,
  MOCK_RECIPIENTS,
  MOCK_CARDS,
  MOCK_CATEGORIES,
  MOCK_ORGANIZATION,
  NAVIGATION_URLS,
  FORM_URLS
} from './mock-data'
import { MessageMetadata } from './types'

export interface ToolResult {
  success: boolean
  data?: unknown
  error?: string
  metadata?: MessageMetadata
}

type ToolInput = Record<string, unknown>

export async function executeTool(
  toolName: string,
  input: ToolInput
): Promise<ToolResult> {
  switch (toolName) {
    // -------------------------------------------------------------------------
    // Data Query Tools
    // -------------------------------------------------------------------------
    case 'get_accounts':
      return {
        success: true,
        data: MOCK_ACCOUNTS
      }

    case 'get_account_details': {
      const account = MOCK_ACCOUNTS.find(a => a.id === input.account_id)
      if (!account) {
        return { success: false, error: `Account not found: ${input.account_id}` }
      }
      return { success: true, data: account }
    }

    case 'search_transactions': {
      let results = [...MOCK_TRANSACTIONS]

      // Apply filters
      if (input.counterparty_name) {
        const search = (input.counterparty_name as string).toLowerCase()
        results = results.filter(t =>
          t.counterpartyName.toLowerCase().includes(search)
        )
      }
      if (input.min_amount !== undefined) {
        results = results.filter(t => Math.abs(t.amount) >= (input.min_amount as number))
      }
      if (input.max_amount !== undefined) {
        results = results.filter(t => Math.abs(t.amount) <= (input.max_amount as number))
      }
      if (input.status) {
        results = results.filter(t => t.status === input.status)
      }
      if (input.kind) {
        results = results.filter(t => t.kind === input.kind)
      }
      if (input.start_date) {
        const start = new Date(input.start_date as string)
        results = results.filter(t => t.postedAt && new Date(t.postedAt) >= start)
      }
      if (input.end_date) {
        const end = new Date(input.end_date as string)
        results = results.filter(t => t.postedAt && new Date(t.postedAt) <= end)
      }

      // Apply limit
      const limit = (input.limit as number) || 20
      results = results.slice(0, limit)

      return { success: true, data: results }
    }

    case 'get_transaction_details': {
      const transaction = MOCK_TRANSACTIONS.find(t => t.id === input.transaction_id)
      if (!transaction) {
        return { success: false, error: `Transaction not found: ${input.transaction_id}` }
      }
      return {
        success: true,
        data: transaction,
        metadata: {
          link: {
            url: transaction.dashboardLink,
            label: 'View in Mercury'
          }
        }
      }
    }

    case 'get_recipients': {
      let results = [...MOCK_RECIPIENTS]
      if (input.status) {
        results = results.filter(r => r.status === input.status)
      }
      return { success: true, data: results }
    }

    case 'search_recipients': {
      const search = (input.name as string).toLowerCase()
      const results = MOCK_RECIPIENTS.filter(r =>
        r.name.toLowerCase().includes(search)
      )
      return { success: true, data: results }
    }

    case 'get_cards': {
      return { success: true, data: MOCK_CARDS }
    }

    case 'get_organization':
      return { success: true, data: MOCK_ORGANIZATION }

    case 'get_categories':
      return { success: true, data: MOCK_CATEGORIES }

    // -------------------------------------------------------------------------
    // Navigation Tools
    // -------------------------------------------------------------------------
    case 'navigate_to_page': {
      const page = input.page as string
      const navInfo = NAVIGATION_URLS[page]

      if (!navInfo) {
        return { success: false, error: `Unknown page: ${page}` }
      }

      let url = navInfo.url
      let displayName = navInfo.displayName

      // Handle specific resource navigation
      if (input.account_id) {
        url = `/accounts/${input.account_id}`
        displayName = 'Account Details'
      }
      if (input.transaction_id) {
        url = `/transactions/${input.transaction_id}`
        displayName = 'Transaction Details'
      }

      return {
        success: true,
        data: { page, url, displayName },
        metadata: {
          navigation: {
            target: displayName,
            url,
            countdown: true
          }
        }
      }
    }

    // -------------------------------------------------------------------------
    // Form Pre-fill Tools
    // -------------------------------------------------------------------------
    case 'prefill_payment_form': {
      const prefillData: Record<string, unknown> = {}

      // Find recipient if name provided
      if (input.recipient_name && !input.recipient_id) {
        const search = (input.recipient_name as string).toLowerCase()
        const recipient = MOCK_RECIPIENTS.find(r =>
          r.name.toLowerCase().includes(search)
        )
        if (recipient) {
          prefillData.recipient_id = recipient.id
          prefillData.recipient_name = recipient.name
        }
      } else if (input.recipient_id) {
        prefillData.recipient_id = input.recipient_id
      }

      if (input.amount) prefillData.amount = input.amount
      if (input.memo) prefillData.memo = input.memo
      if (input.payment_method) prefillData.payment_method = input.payment_method

      return {
        success: true,
        data: prefillData,
        metadata: {
          formPrefill: {
            formType: 'payment',
            data: prefillData,
            url: FORM_URLS.payment
          }
        }
      }
    }

    case 'prefill_card_form': {
      const prefillData: Record<string, unknown> = {}
      if (input.cardholder_name) prefillData.cardholder_name = input.cardholder_name
      if (input.card_type) prefillData.card_type = input.card_type
      if (input.spending_limit) prefillData.spending_limit = input.spending_limit

      return {
        success: true,
        data: prefillData,
        metadata: {
          formPrefill: {
            formType: 'card_create',
            data: prefillData,
            url: FORM_URLS.card_create
          }
        }
      }
    }

    case 'prefill_user_invite': {
      const prefillData: Record<string, unknown> = {}
      if (input.email) prefillData.email = input.email
      if (input.role) prefillData.role = input.role
      if (input.name) prefillData.name = input.name

      return {
        success: true,
        data: prefillData,
        metadata: {
          formPrefill: {
            formType: 'user_invite',
            data: prefillData,
            url: FORM_URLS.user_invite
          }
        }
      }
    }

    case 'prefill_recipient_form': {
      const prefillData: Record<string, unknown> = {}
      if (input.name) prefillData.name = input.name
      if (input.email) prefillData.email = input.email
      if (input.payment_method) prefillData.payment_method = input.payment_method
      if (input.account_number) prefillData.account_number = input.account_number
      if (input.routing_number) prefillData.routing_number = input.routing_number

      return {
        success: true,
        data: prefillData,
        metadata: {
          formPrefill: {
            formType: 'recipient_create',
            data: prefillData,
            url: FORM_URLS.recipient_create
          }
        }
      }
    }

    // -------------------------------------------------------------------------
    // Action Tools
    // -------------------------------------------------------------------------
    case 'freeze_card': {
      let card = null

      if (input.card_id) {
        card = MOCK_CARDS.find(c => c.cardId === input.card_id)
      } else if (input.card_last_four) {
        card = MOCK_CARDS.find(c => c.lastFourDigits === input.card_last_four)
      } else if (input.cardholder_name) {
        const search = (input.cardholder_name as string).toLowerCase()
        card = MOCK_CARDS.find(c => c.nameOnCard.toLowerCase().includes(search))
      }

      if (!card) {
        return { success: false, error: 'Card not found' }
      }

      if (card.status === 'frozen') {
        return { success: false, error: `Card ••${card.lastFourDigits} is already frozen` }
      }

      if (card.status !== 'active') {
        return { success: false, error: `Cannot freeze card with status: ${card.status}` }
      }

      // In real implementation, would call Mercury API
      return {
        success: true,
        data: { cardId: card.cardId, newStatus: 'frozen', cardName: card.nameOnCard, lastFour: card.lastFourDigits },
        metadata: {
          action: {
            actionType: 'freeze_card',
            targetId: card.cardId,
            completed: true,
            undoAvailable: true
          }
        }
      }
    }

    case 'unfreeze_card': {
      let card = null

      if (input.card_id) {
        card = MOCK_CARDS.find(c => c.cardId === input.card_id)
      } else if (input.card_last_four) {
        card = MOCK_CARDS.find(c => c.lastFourDigits === input.card_last_four)
      }

      if (!card) {
        return { success: false, error: 'Card not found' }
      }

      if (card.status !== 'frozen') {
        return { success: false, error: `Card is not frozen (current status: ${card.status})` }
      }

      return {
        success: true,
        data: { cardId: card.cardId, newStatus: 'active', cardName: card.nameOnCard, lastFour: card.lastFourDigits },
        metadata: {
          action: {
            actionType: 'unfreeze_card',
            targetId: card.cardId,
            completed: true,
            undoAvailable: true
          }
        }
      }
    }

    case 'update_transaction_note': {
      const transaction = MOCK_TRANSACTIONS.find(t => t.id === input.transaction_id)
      if (!transaction) {
        return { success: false, error: `Transaction not found: ${input.transaction_id}` }
      }

      return {
        success: true,
        data: {
          transactionId: transaction.id,
          previousNote: transaction.note,
          newNote: input.note,
          counterpartyName: transaction.counterpartyName
        },
        metadata: {
          action: {
            actionType: 'update_transaction_note',
            targetId: transaction.id,
            completed: true,
            undoAvailable: true
          }
        }
      }
    }

    case 'update_transaction_category': {
      const transaction = MOCK_TRANSACTIONS.find(t => t.id === input.transaction_id)
      if (!transaction) {
        return { success: false, error: `Transaction not found: ${input.transaction_id}` }
      }

      let categoryId = input.category_id as string
      let categoryName = input.category_name as string

      // Look up category by name if ID not provided
      if (!categoryId && categoryName) {
        const search = categoryName.toLowerCase()
        const category = MOCK_CATEGORIES.find(c =>
          c.name.toLowerCase().includes(search)
        )
        if (category) {
          categoryId = category.id
          categoryName = category.name
        } else {
          return { success: false, error: `Category not found: ${categoryName}` }
        }
      }

      return {
        success: true,
        data: {
          transactionId: transaction.id,
          previousCategory: transaction.mercuryCategory,
          newCategoryId: categoryId,
          newCategoryName: categoryName,
          counterpartyName: transaction.counterpartyName
        },
        metadata: {
          action: {
            actionType: 'update_transaction_category',
            targetId: transaction.id,
            completed: true,
            undoAvailable: true
          }
        }
      }
    }

    // -------------------------------------------------------------------------
    // Support Handoff
    // -------------------------------------------------------------------------
    case 'handoff_to_support': {
      const ticketId = `MERC-${Date.now().toString().slice(-6)}`
      
      return {
        success: true,
        data: {
          reason: input.reason,
          category: input.category || 'other',
          urgency: input.urgency || 'medium',
          ticketId
        },
        metadata: {
          supportHandoff: {
            reason: input.reason as string,
            ticketId
          }
        }
      }
    }

    default:
      return { success: false, error: `Unknown tool: ${toolName}` }
  }
}

/**
 * Format tool results for Claude context
 */
export function formatToolResultForContext(
  toolName: string,
  result: ToolResult
): string {
  if (!result.success) {
    return `Error: ${result.error}`
  }

  // Format data nicely for Claude to understand
  return JSON.stringify(result.data, null, 2)
}


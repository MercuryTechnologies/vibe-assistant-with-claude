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
  MOCK_EMPLOYEES,
  NAVIGATION_URLS,
  FORM_URLS,
  // Shared data functions (from src/shared/mockData.ts)
  getSharedInsightsData,
  getSharedTopTransactions,
  transformSharedTransactions
} from './mock-data'
import { MessageMetadata, Employee, EntityCard } from './types'

// In-memory storage for card drafts (simulating database)
const cardDrafts: Map<string, {
  id: string
  employeeId: string
  employeeName: string
  employeeEmail: string
  cardType: 'virtual' | 'physical'
  spendingLimit: number
  status: 'draft' | 'scheduled' | 'void'
  createdAt: Date
}> = new Map()

export interface ToolResult {
  success: boolean
  data?: unknown
  error?: string
  metadata?: MessageMetadata
}

type ToolInput = Record<string, unknown>

/**
 * Format transaction type for display
 */
function formatTransactionType(kind: string): string {
  const typeMap: Record<string, string> = {
    domesticWire: 'Wire',
    internationalWire: 'Intl Wire',
    externalTransfer: 'Transfer',
    debitCardTransaction: 'Debit',
    creditCardTransaction: 'Credit',
    ach: 'ACH',
    check: 'Check',
    internalTransfer: 'Internal',
  }
  return typeMap[kind] || kind
}

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
        const kindFilter = (input.kind as string).toLowerCase()
        // Handle wire-related queries by matching both domesticWire and internationalWire
        if (kindFilter === 'wire' || kindFilter.includes('wire')) {
          results = results.filter(t => 
            t.kind === 'domesticWire' || 
            t.kind === 'internationalWire' ||
            (t.bankDescription && t.bankDescription.toLowerCase().includes('wire'))
          )
        } else {
          results = results.filter(t => t.kind === input.kind)
        }
      }
      if (input.start_date) {
        const start = new Date(input.start_date as string)
        results = results.filter(t => t.postedAt && new Date(t.postedAt) >= start)
      }
      if (input.end_date) {
        const end = new Date(input.end_date as string)
        results = results.filter(t => t.postedAt && new Date(t.postedAt) <= end)
      }

      // Apply limit (default 5 for table display)
      const limit = (input.limit as number) || 5
      const displayResults = results.slice(0, limit)

      // Build transaction table for display
      const transactionTableRows = displayResults.map(t => ({
        id: t.id,
        counterparty: t.counterpartyName,
        amount: t.amount,
        date: t.postedAt || new Date().toISOString(),
        category: t.mercuryCategory || undefined,
        type: formatTransactionType(t.kind),
        dashboardLink: `/transactions?highlight=${t.id}`
      }))

      // Determine table title based on filters
      let tableTitle = 'Recent transactions'
      if (input.kind) {
        const kindStr = input.kind as string
        if (kindStr.toLowerCase().includes('wire')) {
          tableTitle = 'Recent wire transactions'
        } else {
          tableTitle = `Recent ${kindStr} transactions`
        }
      }
      if (input.counterparty_name) {
        tableTitle = `Transactions with ${input.counterparty_name}`
      }

      return { 
        success: true, 
        data: displayResults,
        metadata: displayResults.length > 0 ? {
          transactionTable: {
            title: tableTitle,
            rows: transactionTableRows,
            showType: !!(input.kind && (input.kind as string).toLowerCase().includes('wire'))
          }
        } : undefined
      }
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

    case 'get_insights_data': {
      // Use the shared insights data function - this computes data from actual transactions
      // ensuring consistency with what the frontend displays
      const insights = getSharedInsightsData()
      
      return {
        success: true,
        data: {
          period: insights.cashflow.period,
          totalBalance: insights.totalBalance,
          moneyIn: insights.cashflow.moneyIn,
          moneyOut: insights.cashflow.moneyOut,
          cashflow: insights.cashflow.netChange,
          trend: insights.cashflow.trend,
          transactionCount: insights.transactionCount,
          
          // Account breakdown
          accounts: insights.accounts,
          
          // Top spending by category (computed from actual transactions)
          topSpendingCategories: insights.topSpendingCategories.map(cat => ({
            category: cat.category,
            amount: cat.amount
          }))
        }
      }
    }

    case 'get_top_transactions': {
      const direction = (input.direction as 'in' | 'out' | 'all') || 'out'
      const limit = Math.min((input.limit as number) || 5, 10)
      
      // Use the shared function to get top transactions
      const sharedResults = getSharedTopTransactions(direction, limit)
      
      // Transform to API format for display
      const results = transformSharedTransactions(sharedResults)
      
      // Build transaction table
      const transactionTableRows = results.map(t => ({
        id: t.id,
        counterparty: t.counterpartyName,
        amount: t.amount,
        date: t.postedAt || new Date().toISOString(),
        category: t.mercuryCategory || undefined,
        type: formatTransactionType(t.kind),
        dashboardLink: `/transactions?highlight=${t.id}`
      }))
      
      // Determine title
      let tableTitle = 'Top transactions'
      if (direction === 'out') {
        tableTitle = 'Your biggest expenses'
      } else if (direction === 'in') {
        tableTitle = 'Your largest deposits'
      }
      
      return {
        success: true,
        data: results,
        metadata: {
          transactionTable: {
            title: tableTitle,
            rows: transactionTableRows,
            showCategory: true
          }
        }
      }
    }

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

    // -------------------------------------------------------------------------
    // Agentic Card Issuance Tools
    // -------------------------------------------------------------------------
    case 'get_employees': {
      let results = [...MOCK_EMPLOYEES]

      // Apply department filter
      if (input.department) {
        const dept = (input.department as string).toLowerCase()
        results = results.filter(e => e.department.toLowerCase().includes(dept))
      }

      // Apply hasCard filter
      if (input.has_card !== undefined) {
        results = results.filter(e => e.hasCard === input.has_card)
      }

      // Build employee table for display
      const employeeTableRows = results.map(e => ({
        id: e.id,
        name: e.name,
        email: e.email,
        department: e.department,
        salary: e.salary,
        hasCard: e.hasCard
      }))

      return {
        success: true,
        data: results,
        metadata: {
          employeeTable: {
            title: `Employees (${results.length})`,
            rows: employeeTableRows,
            selectable: true
          }
        }
      }
    }

    case 'search_employees': {
      const searchName = (input.name as string).toLowerCase()
      const results = MOCK_EMPLOYEES.filter(e =>
        e.name.toLowerCase().includes(searchName)
      )

      // Build employee table for display
      const employeeTableRows = results.map(e => ({
        id: e.id,
        name: e.name,
        email: e.email,
        department: e.department,
        salary: e.salary,
        hasCard: e.hasCard
      }))

      return {
        success: true,
        data: {
          employees: results,
          count: results.length,
          hasMultipleMatches: results.length > 1
        },
        metadata: results.length > 0 ? {
          employeeTable: {
            title: `Found ${results.length} employee${results.length > 1 ? 's' : ''} matching "${input.name}"`,
            rows: employeeTableRows,
            selectable: false
          }
        } : undefined
      }
    }

    case 'request_clarification': {
      const question = input.question as string
      const options = input.options as Array<{ id: string; label: string; subtitle?: string }>

      return {
        success: true,
        data: {
          question,
          options,
          waitingForInput: true
        },
        metadata: {
          clarificationRequest: {
            id: `clarify-${Date.now()}`,
            question,
            options
          }
        }
      }
    }

    case 'create_card_drafts': {
      const employeeIds = input.employee_ids as string[]
      const cardType = (input.card_type as 'virtual' | 'physical') || 'virtual'
      const dryRun = input.dry_run !== false // Default to true

      const drafts: EntityCard[] = []
      const draftDetails: Array<{
        id: string
        employeeId: string
        employeeName: string
        employeeEmail: string
        cardType: string
        spendingLimit: number
        status: string
      }> = []

      for (const empId of employeeIds) {
        const employee = MOCK_EMPLOYEES.find(e => e.id === empId)
        if (!employee) continue

        // Calculate spending limit based on salary (10% of annual salary / 12 months)
        const spendingLimit = input.spending_limit 
          ? (input.spending_limit as number)
          : Math.round(employee.salary * 0.1 / 12 / 100) * 100

        const draftId = `draft-${empId}-${Date.now()}`

        const draft = {
          id: draftId,
          employeeId: employee.id,
          employeeName: employee.name,
          employeeEmail: employee.email,
          cardType,
          spendingLimit,
          status: 'draft' as const,
          createdAt: new Date()
        }

        // Store in memory if not dry run
        if (!dryRun) {
          cardDrafts.set(draftId, draft)
        } else {
          // For dry run, still store temporarily so they can be committed
          cardDrafts.set(draftId, draft)
        }

        drafts.push({
          entityType: 'card',
          entityId: draftId,
          data: {
            employeeName: employee.name,
            employeeEmail: employee.email,
            cardType,
            spendingLimit,
            last4: Math.floor(1000 + Math.random() * 9000).toString()
          },
          status: 'draft'
        })

        draftDetails.push({
          id: draftId,
          employeeId: employee.id,
          employeeName: employee.name,
          employeeEmail: employee.email,
          cardType,
          spendingLimit,
          status: 'draft'
        })
      }

      return {
        success: true,
        data: {
          drafts: draftDetails,
          count: drafts.length,
          dryRun,
          message: dryRun 
            ? `Created ${drafts.length} draft card proposal${drafts.length > 1 ? 's' : ''}. Waiting for confirmation.`
            : `${drafts.length} card${drafts.length > 1 ? 's' : ''} ready for issuance.`
        },
        metadata: {
          entityCards: drafts
        }
      }
    }

    case 'commit_card_drafts': {
      const draftIds = input.draft_ids as string[]
      const committedCards: EntityCard[] = []
      const committedDetails: Array<{
        id: string
        employeeName: string
        status: string
      }> = []

      for (const draftId of draftIds) {
        const draft = cardDrafts.get(draftId)
        if (!draft) continue

        // Update status to scheduled
        draft.status = 'scheduled'
        cardDrafts.set(draftId, draft)

        committedCards.push({
          entityType: 'card',
          entityId: draftId,
          data: {
            employeeName: draft.employeeName,
            employeeEmail: draft.employeeEmail,
            cardType: draft.cardType,
            spendingLimit: draft.spendingLimit
          },
          status: 'scheduled'
        })

        committedDetails.push({
          id: draftId,
          employeeName: draft.employeeName,
          status: 'scheduled'
        })
      }

      return {
        success: true,
        data: {
          committed: committedDetails,
          count: committedCards.length,
          message: `Successfully issued ${committedCards.length} card${committedCards.length > 1 ? 's' : ''}. Cards will be delivered within 5-7 business days.`
        },
        metadata: {
          entityCards: committedCards
        }
      }
    }

    case 'cancel_card_drafts': {
      const draftIds = input.draft_ids as string[]
      const cancelledCards: EntityCard[] = []
      const cancelledDetails: Array<{
        id: string
        employeeName: string
        status: string
      }> = []

      for (const draftId of draftIds) {
        const draft = cardDrafts.get(draftId)
        if (!draft) continue

        // Update status to void
        draft.status = 'void'
        cardDrafts.set(draftId, draft)

        cancelledCards.push({
          entityType: 'card',
          entityId: draftId,
          data: {
            employeeName: draft.employeeName,
            employeeEmail: draft.employeeEmail,
            cardType: draft.cardType,
            spendingLimit: draft.spendingLimit
          },
          status: 'void'
        })

        cancelledDetails.push({
          id: draftId,
          employeeName: draft.employeeName,
          status: 'void'
        })
      }

      return {
        success: true,
        data: {
          cancelled: cancelledDetails,
          count: cancelledCards.length,
          message: `Cancelled ${cancelledCards.length} card draft${cancelledCards.length > 1 ? 's' : ''}.`
        },
        metadata: {
          entityCards: cancelledCards
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


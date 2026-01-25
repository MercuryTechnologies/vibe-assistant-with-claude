// =============================================================================
// Chat API Endpoint with SSE Streaming - Using Unified Data Layer
// =============================================================================
// Vercel Serverless Function with two-tier model routing and real-time streaming
// Data is imported from the unified data layer JSON files

import type { VercelRequest, VercelResponse } from '@vercel/node'
import Anthropic from '@anthropic-ai/sdk'

// Import unified data from JSON files
import companyData from '../src/data/company.json' with { type: 'json' }
import accountsData from '../src/data/accounts.json' with { type: 'json' }
import transactionsData from '../src/data/transactions.json' with { type: 'json' }
import cardsData from '../src/data/cards.json' with { type: 'json' }
import employeesData from '../src/data/employees.json' with { type: 'json' }
import recipientsData from '../src/data/recipients.json' with { type: 'json' }
import tasksData from '../src/data/tasks.json' with { type: 'json' }

// =============================================================================
// Type Definitions
// =============================================================================

interface Company {
  id: string
  name: string
  legalName: string
  type: string
  ein: string
  industry: string
  website: string
  founded: string
  address: {
    street: string
    city: string
    state: string
    zip: string
    country: string
  }
  funding: {
    stage: string
    totalRaised: number
    lastRoundAmount: number
    lastRoundDate: string
    investors: Array<{ name: string; amount: number; type: string }>
  }
  metrics: {
    employeeCount: number
    monthlyBurnRate: number
    currentMRR: number
    mrrGrowthRate: number
    customersCount: number
  }
  bankingStartDate: string
}

interface Account {
  id: string
  name: string
  type: 'checking' | 'savings' | 'treasury'
  balance: number
  currency: string
  accountNumber: string
  routingNumber: string
  status: 'active' | 'inactive' | 'pending'
  apy?: number
  purpose?: string
}

interface Transaction {
  id: string
  description: string
  merchant: string
  amount: number
  type: 'credit' | 'debit' | 'transfer'
  date: string
  category: string
  status: 'completed' | 'pending' | 'failed'
  accountId: string
  cardId?: string
  hasAttachment?: boolean
}

interface Card {
  id: string
  cardholder: string
  employeeId: string
  cardName: string
  cardNumber: string
  nickname?: string
  monthlyLimit: number
  type: string
  accountId: string
  status: 'active' | 'frozen' | 'cancelled'
  billingAddress: {
    street: string
    city: string
    state: string
    zip: string
  }
}

interface Employee {
  id: string
  firstName: string
  lastName: string
  email: string
  role: string
  department: string
  startDate: string
  salary: number
  cardId: string | null
  isAdmin: boolean
}

interface Recipient {
  id: string
  name: string
  initials: string
  type: 'vendor' | 'client' | 'contractor' | 'investor' | 'internal'
  category: string
  status: 'active' | 'inactive' | 'pending'
  lastPaid?: string
  totalPaid?: number
  totalReceived?: number
}

// =============================================================================
// DATA ACCESS FUNCTIONS
// =============================================================================

function getCompany(): Company {
  return companyData.company as Company
}

function getAccounts(): Account[] {
  return accountsData.accounts as Account[]
}

function getTotalBalance(): number {
  return getAccounts().reduce((sum, a) => sum + a.balance, 0)
}

function getTransactions(filters?: { 
  startDate?: string
  endDate?: string
  categories?: string[]
  merchants?: string[]
  type?: string
  cardId?: string
  limit?: number
}): Transaction[] {
  let txns = transactionsData.transactions as Transaction[]

  if (filters?.startDate) {
    txns = txns.filter(t => t.date >= filters.startDate!)
  }
  if (filters?.endDate) {
    txns = txns.filter(t => t.date <= filters.endDate!)
  }
  if (filters?.categories && filters.categories.length > 0) {
    const cats = filters.categories.map(c => c.toLowerCase())
    txns = txns.filter(t => cats.includes(t.category.toLowerCase()))
  }
  if (filters?.merchants && filters.merchants.length > 0) {
    const merchants = filters.merchants.map(m => m.toLowerCase())
    txns = txns.filter(t => merchants.some(m => t.merchant.toLowerCase().includes(m)))
  }
  if (filters?.type) {
    txns = txns.filter(t => t.type === filters.type)
  }
  if (filters?.cardId) {
    txns = txns.filter(t => t.cardId === filters.cardId)
  }
  if (filters?.limit) {
    txns = txns.slice(0, filters.limit)
  }

  return txns
}

function getRecentTransactions(limit: number = 10): Transaction[] {
  return [...getTransactions()]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit)
}

function searchTransactions(query: string, limit: number = 20): Transaction[] {
  const q = query.toLowerCase()
  return getTransactions()
    .filter(t =>
      t.merchant.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q)
    )
    .slice(0, limit)
}

function getCards(): Card[] {
  return cardsData.cards as Card[]
}

function getCardsWithSpending(): Array<Card & { spentThisMonth: number; spentLastMonth: number }> {
  const cards = getCards()
  const now = new Date()
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const lastMonth = now.getMonth() === 0
    ? `${now.getFullYear() - 1}-12`
    : `${now.getFullYear()}-${String(now.getMonth()).padStart(2, '0')}`

  return cards.map(card => {
    const cardTxns = getTransactions({ cardId: card.id })
    const thisMonthTxns = cardTxns.filter(t => t.date.startsWith(thisMonth))
    const lastMonthTxns = cardTxns.filter(t => t.date.startsWith(lastMonth))

    const spentThisMonth = thisMonthTxns
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0)

    const spentLastMonth = lastMonthTxns
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0)

    return { ...card, spentThisMonth, spentLastMonth }
  })
}

function getEmployees(): Employee[] {
  return employeesData.employees as Employee[]
}

function getRecipients(): Recipient[] {
  return recipientsData.recipients as Recipient[]
}

// =============================================================================
// SUMMARY FUNCTIONS
// =============================================================================

function getDateNDaysAgo(days: number): string {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return date.toISOString().split('T')[0]
}

function getCashflowSummary(period: '7d' | '30d' | '90d'): {
  moneyIn: number
  moneyOut: number
  net: number
  transactionCount: number
} {
  const days = period === '7d' ? 7 : period === '30d' ? 30 : 90
  const startDate = getDateNDaysAgo(days)
  const txns = getTransactions({ startDate })
    .filter(t => t.type !== 'transfer')

  const moneyIn = txns
    .filter(t => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0)

  const moneyOut = txns
    .filter(t => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0)

  return {
    moneyIn,
    moneyOut,
    net: moneyIn - moneyOut,
    transactionCount: txns.length,
  }
}

function getTopSpendingCategories(limit: number = 5, period: '30d' | '90d' = '30d'): Array<{
  category: string
  amount: number
  count: number
  percentOfTotal: number
}> {
  const days = period === '30d' ? 30 : 90
  const startDate = getDateNDaysAgo(days)
  const txns = getTransactions({ startDate })
    .filter(t => t.amount < 0 && t.type !== 'transfer')

  const totalSpend = txns.reduce((sum, t) => sum + Math.abs(t.amount), 0)
  const categoryMap = new Map<string, { amount: number; count: number }>()

  for (const t of txns) {
    const current = categoryMap.get(t.category) || { amount: 0, count: 0 }
    categoryMap.set(t.category, {
      amount: current.amount + Math.abs(t.amount),
      count: current.count + 1,
    })
  }

  return Array.from(categoryMap.entries())
    .map(([category, data]) => ({ 
      category, 
      amount: data.amount, 
      count: data.count,
      percentOfTotal: totalSpend > 0 ? (data.amount / totalSpend) * 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, limit)
}

function getRunwayEstimate(): { monthsRemaining: number; monthlyBurn: number } {
  const totalBalance = getTotalBalance()
  const cashflow = getCashflowSummary('90d')
  const monthlyBurn = cashflow.moneyOut / 3

  return {
    monthsRemaining: monthlyBurn > 0 ? Math.floor(totalBalance / monthlyBurn) : 999,
    monthlyBurn,
  }
}

function getWireTransactions(limit: number = 10): Transaction[] {
  // Wire transactions are typically large enterprise payments
  return getTransactions()
    .filter(t => t.type === 'credit' && t.amount >= 50000 && t.category === 'Revenue')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit)
}

function getMerchantSpending(merchantName: string): { 
  total: number
  transactions: Transaction[]
  averageTransaction: number
  lastTransaction: Transaction | null 
} {
  const txns = searchTransactions(merchantName, 50)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  const total = txns.reduce((sum, t) => sum + Math.abs(t.amount), 0)
  return { 
    total, 
    transactions: txns, 
    averageTransaction: txns.length > 0 ? total / txns.length : 0,
    lastTransaction: txns[0] || null
  }
}

function getTopMerchants(limit: number = 10, period: '30d' | '90d' = '30d'): Array<{
  merchant: string
  amount: number
  transactionCount: number
  category: string
}> {
  const startDate = getDateNDaysAgo(period === '30d' ? 30 : 90)
  const transactions = getTransactions({ startDate })
    .filter(t => t.amount < 0)

  const merchantMap = new Map<string, { amount: number; count: number; category: string }>()

  for (const t of transactions) {
    const current = merchantMap.get(t.merchant) || { amount: 0, count: 0, category: t.category }
    merchantMap.set(t.merchant, {
      amount: current.amount + Math.abs(t.amount),
      count: current.count + 1,
      category: t.category,
    })
  }

  return Array.from(merchantMap.entries())
    .map(([merchant, data]) => ({
      merchant,
      amount: data.amount,
      transactionCount: data.count,
      category: data.category,
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, limit)
}

function getRevenueSummary(): {
  currentMRR: number
  previousMRR: number
  mrrGrowth: number
  mrrGrowthPercent: number
  totalRevenueLast30Days: number
  totalRevenueYTD: number
  topCustomers: Array<{ name: string; amount: number }>
} {
  const now = new Date()
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const lastMonth = now.getMonth() === 0
    ? `${now.getFullYear() - 1}-12`
    : `${now.getFullYear()}-${String(now.getMonth()).padStart(2, '0')}`
  const yearStart = `${now.getFullYear()}-01-01`
  const thirtyDaysAgo = getDateNDaysAgo(30)

  const allRevenue = getTransactions({ categories: ['Revenue'] })

  const thisMonthRevenue = allRevenue
    .filter(t => t.date.startsWith(thisMonth))
    .reduce((sum, t) => sum + t.amount, 0)

  const lastMonthRevenue = allRevenue
    .filter(t => t.date.startsWith(lastMonth))
    .reduce((sum, t) => sum + t.amount, 0)

  const last30DaysRevenue = allRevenue
    .filter(t => t.date >= thirtyDaysAgo)
    .reduce((sum, t) => sum + t.amount, 0)

  const ytdRevenue = allRevenue
    .filter(t => t.date >= yearStart)
    .reduce((sum, t) => sum + t.amount, 0)

  // Get top customers
  const customerMap = new Map<string, number>()
  for (const t of allRevenue) {
    if (t.merchant !== 'Stripe') {
      const current = customerMap.get(t.merchant) || 0
      customerMap.set(t.merchant, current + t.amount)
    }
  }

  const topCustomers = Array.from(customerMap.entries())
    .map(([name, amount]) => ({ name, amount }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5)

  return {
    currentMRR: thisMonthRevenue,
    previousMRR: lastMonthRevenue,
    mrrGrowth: thisMonthRevenue - lastMonthRevenue,
    mrrGrowthPercent: lastMonthRevenue > 0 ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0,
    totalRevenueLast30Days: last30DaysRevenue,
    totalRevenueYTD: ytdRevenue,
    topCustomers,
  }
}

interface Task {
  id: string
  description: string
  status: 'incomplete' | 'completed'
  type: string
  received?: string
  completedOn?: string
  completedBy?: string
  actionLabel?: string
  actionHref?: string
}

function getTasks(): Task[] {
  return (tasksData as { tasks: Task[] }).tasks || []
}

// =============================================================================
// AI CONTEXT BUILDER
// =============================================================================

function formatCurrency(amount: number): string {
  const prefix = amount < 0 ? '-' : ''
  const absAmount = Math.abs(amount)
  if (absAmount >= 1000000) {
    return `${prefix}$${(absAmount / 1000000).toFixed(2)}M`
  }
  if (absAmount >= 1000) {
    return `${prefix}$${(absAmount / 1000).toFixed(1)}K`
  }
  return `${prefix}$${absAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function buildAIContext(): string {
  const company = getCompany()
  const accounts = getAccounts()
  const totalBalance = getTotalBalance()
  const recentTxns = getRecentTransactions(15)
  const cashflow30d = getCashflowSummary('30d')
  const runway = getRunwayEstimate()
  const topCategories = getTopSpendingCategories(8)
  const cards = getCardsWithSpending()
  const employees = getEmployees()

  return `
=== COMPANY PROFILE ===
Company: ${company.name} (${company.legalName})
Industry: ${company.industry}
EIN: ${company.ein}
Founded: ${company.founded}
Employees: ${company.metrics.employeeCount}

=== FUNDING ===
Stage: ${company.funding.stage}
Total Raised: ${formatCurrency(company.funding.totalRaised)}
Lead Investor: ${company.funding.investors.find(i => i.type === 'Lead')?.name || 'N/A'}

=== KEY METRICS ===
Current MRR: ${formatCurrency(company.metrics.currentMRR)}
MRR Growth Rate: ${(company.metrics.mrrGrowthRate * 100).toFixed(0)}%
Monthly Burn Rate: ${formatCurrency(company.metrics.monthlyBurnRate)}
Customers: ${company.metrics.customersCount}

=== ACCOUNTS (Total: ${formatCurrency(totalBalance)}) ===
${accounts.map(a => `• ${a.name} (${a.type}): ${formatCurrency(a.balance)}${a.apy ? ` @ ${a.apy}% APY` : ''}`).join('\n')}

=== RUNWAY ===
Months Remaining: ${runway.monthsRemaining} months
Monthly Burn: ${formatCurrency(runway.monthlyBurn)}

=== CASHFLOW (Last 30 Days) ===
Money In: ${formatCurrency(cashflow30d.moneyIn)}
Money Out: ${formatCurrency(cashflow30d.moneyOut)}
Net: ${formatCurrency(cashflow30d.net)}
Transactions: ${cashflow30d.transactionCount}

=== TOP SPENDING CATEGORIES (30 Days) ===
${topCategories.map(c => `• ${c.category}: ${formatCurrency(c.amount)} (${c.count} transactions)`).join('\n')}

=== CARDS (${cards.length} total) ===
${cards.map(c => `• ${c.cardholder} (${c.cardName}): Spent ${formatCurrency(c.spentThisMonth)} of ${formatCurrency(c.monthlyLimit)} limit${c.spentThisMonth > c.monthlyLimit ? ' ⚠️ OVER BUDGET' : ''}`).join('\n')}

=== RECENT TRANSACTIONS ===
${recentTxns.map(t => `• ${t.date}: ${t.merchant} ${t.amount >= 0 ? '+' : ''}${formatCurrency(t.amount)} (${t.category})`).join('\n')}

=== EMPLOYEES (${employees.length} total) ===
Departments: ${[...new Set(employees.map(e => e.department))].join(', ')}
With Cards: ${employees.filter(e => e.cardId).length}
Admins: ${employees.filter(e => e.isAdmin).length}
`.trim()
}

// =============================================================================
// FLAGGED TRANSACTIONS (Demo Data)
// =============================================================================

interface FlaggedTransaction {
  counterparty: string
  amount: number
  alertType: 'subscription-increase' | 'possible-duplicate' | 'new-vendor'
  reason: string
}

function getFlaggedTransactions(): FlaggedTransaction[] {
  // Find unusual transactions from real data
  const recentTxns = getRecentTransactions(50)
  const flagged: FlaggedTransaction[] = []

  // Check for large new vendors
  const vendorSpend = new Map<string, number>()
  for (const t of getTransactions()) {
    if (t.amount < 0) {
      const current = vendorSpend.get(t.merchant) || 0
      vendorSpend.set(t.merchant, current + 1)
    }
  }

  for (const t of recentTxns.slice(0, 10)) {
    if (t.amount < 0 && vendorSpend.get(t.merchant) === 1 && Math.abs(t.amount) > 1000) {
      flagged.push({
        counterparty: t.merchant,
        amount: t.amount,
        alertType: 'new-vendor',
        reason: 'First transaction with this vendor.'
      })
      if (flagged.length >= 3) break
    }
  }

  // If we don't have enough, add some demo data
  if (flagged.length < 2) {
    flagged.push({
      counterparty: 'LinkedIn',
      amount: -2500,
      alertType: 'subscription-increase',
      reason: 'This charge is 25% higher than last month.'
    })
  }

  return flagged.slice(0, 3)
}

// =============================================================================
// CHAT API LOGIC
// =============================================================================

const ROUTER_MODEL = 'claude-sonnet-4-5-20250929'
const SMART_MODEL = 'claude-opus-4-5-20251101'

function createEventSender(res: VercelResponse) {
  return (event: string, data: object) => {
    res.write(`event: ${event}\n`)
    res.write(`data: ${JSON.stringify(data)}\n\n`)
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function generateConversationId(): string {
  return `conv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

interface ClassificationResult {
  intent: string
  needsSmartModel: boolean
  handoffMessage?: string
  quickResponse?: string
  navigationTarget?: string
}

async function classifyQuery(
  client: Anthropic,
  message: string,
): Promise<ClassificationResult> {
  const company = getCompany()

  const classificationPrompt = `You are Mercury Assistant, a friendly and helpful assistant for Mercury.

CRITICAL COMPLIANCE:
- Mercury is a FINTECH COMPANY, not a bank.
- Say "Mercury account" NOT "bank account"
- The company you are assisting is: ${company.name}

MESSAGE: "${message}"

INTENTS:
- FLAGGED_TRANSACTIONS: User asks about suspicious, flagged, or unusual transactions
- PAYMENT_LIMITS: User asks about payment limits
- EIN_QUERY: User asks about their EIN
- COMPANY_QUERY: User asks about company info, funding, founding date, metrics
- EMPLOYEE_QUERY: User asks about employees, team size, who works here, departments, salaries
- CASHFLOW_QUESTION: User asks about cashflow, money in/out, spending trends, burn rate, runway
- SPENDING_ANALYSIS: User asks about spending by category, vendor, or period (how much on AWS, marketing spend, etc)
- REVENUE_QUERY: User asks about revenue, MRR, income, top customers
- WIRE_TRANSACTIONS: User asks about wire transfers
- RECIPIENT_QUERY: User asks about recipients, top recipients, who they paid, vendors they paid most
- NAVIGATE: User wants to go to a page
- BALANCE: User asks about account balances
- ACCOUNT_QUERY: User asks about specific accounts, account types, account details
- TRANSACTION_SEARCH: User asks about specific transactions, recent transactions, transaction history
- CARD_QUERY: User asks about cards, card spending, card limits, who has cards
- CARD_ACTION: User wants to freeze/manage cards, issue new cards
- TASK_QUERY: User asks about tasks, pending items, what needs attention
- DOCUMENT_QUERY: User asks about documents, statements, bank statements, tax documents
- AGENT_MODE: Multi-step workflow like issuing cards to employees
- SUPPORT: User explicitly asks for human support
- COMPLEX_QUESTION: Requires deep analysis, comparisons, forecasting
- SIMPLE_QUESTION: General product questions
- CHITCHAT: Casual conversation

Respond with JSON:
{"intent":"...", "needsSmartModel":true/false, "handoffMessage":"...", "quickResponse":"...", "navigationTarget":"..."}`

  try {
    const response = await client.messages.create({
      model: ROUTER_MODEL,
      max_tokens: 256,
      temperature: 0.3,
      messages: [{ role: 'user', content: classificationPrompt }],
    })

    if (response.stop_reason === 'refusal') {
      return {
        intent: 'COMPLEX_QUESTION',
        needsSmartModel: true,
        handoffMessage: 'Let me look into that...'
      }
    }

    const textBlock = response.content.find(b => b.type === 'text')
    const text = textBlock && 'text' in textBlock ? textBlock.text : ''
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
  } catch (e) {
    console.error('Classification error:', e)
  }

  return {
    intent: 'COMPLEX_QUESTION',
    needsSmartModel: true,
    handoffMessage: 'Let me think about that...'
  }
}

async function handleWithRouter(
  sendEvent: (event: string, data: object) => void,
  message: string,
  classification: ClassificationResult,
  conversationId: string
): Promise<void> {
  let responseText = ''
  let metadata: Record<string, unknown> | undefined

  const company = getCompany()

  switch (classification.intent) {
    case 'FLAGGED_TRANSACTIONS': {
      const flagged = getFlaggedTransactions()

      if (flagged.length > 0) {
        responseText = `I found **${flagged.length} transactions** that need your attention:\n\n`

        flagged.forEach((t, i) => {
          const amount = t.amount < 0 ? `-$${Math.abs(t.amount).toLocaleString()}` : `+$${t.amount.toLocaleString()}`
          const alertLabels: Record<string, string> = {
            'possible-duplicate': 'Possible Duplicate',
            'subscription-increase': 'Subscription Increase',
            'new-vendor': 'New Vendor',
          }
          const label = alertLabels[t.alertType] || 'Flagged'
          responseText += `${i + 1}. **${t.counterparty}** - ${amount}\n`
          responseText += `   ${label}: ${t.reason}\n\n`
        })
      } else {
        responseText = `Good news! I don't see any transactions that need your attention.`
      }
      break
    }

    case 'PAYMENT_LIMITS': {
      responseText = `Here's how to increase your payment limits:\n\n`
      responseText += `**Current Limits:**\n`
      responseText += `- ACH: Up to $500,000 per transfer\n`
      responseText += `- Wire: Up to $1,000,000 per transfer\n\n`
      responseText += `Go to **Settings > Payment Limits** to request higher limits.`
      break
    }

    case 'EIN_QUERY': {
      responseText = `Your company's **EIN** is:\n\n**${company.ein}**\n\nFor **${company.name}**`
      break
    }

    case 'CASHFLOW_QUESTION': {
      const cashflow = getCashflowSummary('30d')
      const runway = getRunwayEstimate()
      const topCategories = getTopSpendingCategories(5)

      responseText = `Here's your financial overview:\n\n`
      responseText += `**Last 30 Days:**\n`
      responseText += `- Money In: ${formatCurrency(cashflow.moneyIn)}\n`
      responseText += `- Money Out: ${formatCurrency(cashflow.moneyOut)}\n`
      responseText += `- Net: ${formatCurrency(cashflow.net)}\n\n`
      responseText += `**Runway:** ${runway.monthsRemaining} months at ${formatCurrency(runway.monthlyBurn)}/month burn\n\n`
      responseText += `**Top Spending:**\n`
      responseText += topCategories.map(c => `- ${c.category}: ${formatCurrency(c.amount)}`).join('\n')

      metadata = {
        navigation: {
          target: 'Insights',
          url: '/dashboard',
          countdown: true,
          followUpAction: 'answer_with_page_data',
          pageData: {
            totalBalance: getTotalBalance(),
            moneyIn: cashflow.moneyIn,
            moneyOut: cashflow.moneyOut,
            netChange: cashflow.net,
            runway: runway.monthsRemaining,
            topCategories: topCategories,
          }
        }
      }
      break
    }

    case 'WIRE_TRANSACTIONS': {
      const wires = getWireTransactions(10)
      const wireCount = wires.length
      const totalAmount = wires.reduce((sum, t) => sum + t.amount, 0)

      responseText = `You have **${wireCount} wire transfers** totaling ${formatCurrency(totalAmount)}:\n\n`
      wires.slice(0, 5).forEach((t, i) => {
        responseText += `${i + 1}. **${t.merchant}** - ${formatCurrency(t.amount)} (${t.date})\n`
      })

      metadata = {
        navigation: {
          target: 'Transactions',
          url: '/transactions?filter=wire',
          countdown: true,
          filters: { types: ['wire'] }
        }
      }
      break
    }

    case 'RECIPIENT_QUERY': {
      const recipients = getRecipients()
      
      // Get top recipients by amount paid
      const topByPaid = [...recipients]
        .filter(r => r.totalPaid && r.totalPaid > 0)
        .sort((a, b) => (b.totalPaid || 0) - (a.totalPaid || 0))
        .slice(0, 5)
      
      if (topByPaid.length > 0) {
        responseText = `Here are your **top recipients** by amount paid. Click "Send" to make a payment.`
      } else {
        responseText = `You have **${recipients.length} recipients** set up.`
      }
      
      // Build recipients metadata for the UI
      metadata = {
        recipients: {
          title: '',
          rows: topByPaid.map(r => ({
            id: r.id,
            name: r.name,
            bankName: r.bankName || undefined,
            accountLast4: r.accountNumber?.slice(-4) || undefined,
            lastPaidDate: r.lastPaid || undefined,
            lastPaidAmount: r.totalPaid || undefined,
          })),
          allowPayment: true,
        },
        navigation: {
          target: 'Recipients',
          url: '/payments/recipients',
          countdown: true
        }
      }
      break
    }

    case 'COMPANY_QUERY': {
      responseText = `Here's information about **${company.name}**:\n\n`
      responseText += `**Company Details:**\n`
      responseText += `- Legal Name: ${company.legalName}\n`
      responseText += `- Industry: ${company.industry}\n`
      responseText += `- Founded: ${company.founded}\n`
      responseText += `- EIN: ${company.ein}\n`
      responseText += `- Website: ${company.website}\n\n`
      
      responseText += `**Funding:**\n`
      responseText += `- Stage: ${company.funding.stage}\n`
      responseText += `- Total Raised: ${formatCurrency(company.funding.totalRaised)}\n`
      responseText += `- Last Round: ${formatCurrency(company.funding.lastRoundAmount)} (${company.funding.lastRoundDate})\n\n`
      
      responseText += `**Current Metrics:**\n`
      responseText += `- Employees: ${company.metrics.employeeCount}\n`
      responseText += `- Monthly Burn: ${formatCurrency(company.metrics.monthlyBurnRate)}\n`
      responseText += `- MRR: ${formatCurrency(company.metrics.currentMRR)}\n`
      responseText += `- Customers: ${company.metrics.customersCount}\n`
      break
    }

    case 'EMPLOYEE_QUERY': {
      const employees = getEmployees()
      const departments = new Map<string, { count: number; totalSalary: number }>()
      
      // Group by department
      for (const emp of employees) {
        const dept = departments.get(emp.department) || { count: 0, totalSalary: 0 }
        departments.set(emp.department, {
          count: dept.count + 1,
          totalSalary: dept.totalSalary + emp.salary,
        })
      }
      
      responseText = `**Team Overview** (${employees.length} employees):\n\n`
      
      // Sort departments by headcount
      const sortedDepts = Array.from(departments.entries())
        .sort((a, b) => b[1].count - a[1].count)
      
      responseText += `**By Department:**\n`
      for (const [dept, data] of sortedDepts) {
        const avgSalary = data.totalSalary / data.count
        responseText += `- **${dept}**: ${data.count} people (avg ${formatCurrency(avgSalary)}/yr)\n`
      }
      
      // Total payroll
      const totalAnnualPayroll = employees.reduce((sum, e) => sum + e.salary, 0)
      responseText += `\n**Total Annual Payroll**: ${formatCurrency(totalAnnualPayroll)}\n`
      responseText += `**Monthly Payroll**: ~${formatCurrency(totalAnnualPayroll / 12)}\n`
      
      // List a few key people (executives/leadership)
      const leadership = employees.filter(e => 
        e.role.includes('CEO') || e.role.includes('CTO') || e.role.includes('CFO') || 
        e.role.includes('Head') || e.role.includes('Director') || e.role.includes('VP')
      ).slice(0, 5)
      
      if (leadership.length > 0) {
        responseText += `\n**Leadership:**\n`
        leadership.forEach(e => {
          responseText += `- **${e.firstName} ${e.lastName}** - ${e.role}\n`
        })
      }
      break
    }

    case 'SPENDING_ANALYSIS': {
      const query = message.toLowerCase()
      const topCategories = getTopSpendingCategories(10, '30d')
      const topMerchants = getTopMerchants(10, '30d')
      
      // Check if asking about a specific merchant/vendor
      const mentionedMerchant = topMerchants.find(m => 
        query.includes(m.merchant.toLowerCase())
      )
      
      if (mentionedMerchant) {
        const spending = getMerchantSpending(mentionedMerchant.merchant)
        responseText = `**${mentionedMerchant.merchant}** Spending:\n\n`
        responseText += `- Total: ${formatCurrency(spending.total)}\n`
        responseText += `- Transactions: ${spending.transactions.length}\n`
        responseText += `- Average: ${formatCurrency(spending.averageTransaction)}\n`
        if (spending.lastTransaction) {
          responseText += `- Last: ${spending.lastTransaction.date} (${formatCurrency(Math.abs(spending.lastTransaction.amount))})\n`
        }
        responseText += `\n**Recent transactions:**\n`
        spending.transactions.slice(0, 5).forEach((t, i) => {
          responseText += `${i + 1}. ${t.date} - ${formatCurrency(Math.abs(t.amount))}\n`
        })
      } else {
        // General spending overview
        const totalSpend = topCategories.reduce((sum, c) => sum + c.amount, 0)
        
        responseText = `**Spending Analysis (Last 30 Days)**\n\n`
        responseText += `**Total Spend**: ${formatCurrency(totalSpend)}\n\n`
        
        responseText += `**By Category:**\n`
        topCategories.slice(0, 7).forEach((c, i) => {
          responseText += `${i + 1}. **${c.category}**: ${formatCurrency(c.amount)} (${c.percentOfTotal.toFixed(1)}%)\n`
        })
        
        responseText += `\n**Top Merchants:**\n`
        topMerchants.slice(0, 5).forEach((m, i) => {
          responseText += `${i + 1}. **${m.merchant}**: ${formatCurrency(m.amount)} (${m.transactionCount} txns)\n`
        })
      }
      break
    }

    case 'REVENUE_QUERY': {
      const revenue = getRevenueSummary()
      
      responseText = `**Revenue Overview:**\n\n`
      responseText += `**Monthly Revenue:**\n`
      responseText += `- Current MRR: ${formatCurrency(revenue.currentMRR)}\n`
      responseText += `- Previous MRR: ${formatCurrency(revenue.previousMRR)}\n`
      responseText += `- MRR Growth: ${formatCurrency(revenue.mrrGrowth)} (${revenue.mrrGrowthPercent.toFixed(1)}%)\n\n`
      
      responseText += `**Period Totals:**\n`
      responseText += `- Last 30 Days: ${formatCurrency(revenue.totalRevenueLast30Days)}\n`
      responseText += `- Year to Date: ${formatCurrency(revenue.totalRevenueYTD)}\n\n`
      
      if (revenue.topCustomers.length > 0) {
        responseText += `**Top Customers:**\n`
        revenue.topCustomers.forEach((c, i) => {
          responseText += `${i + 1}. **${c.name}**: ${formatCurrency(c.amount)}\n`
        })
      }
      break
    }

    case 'ACCOUNT_QUERY': {
      const accounts = getAccounts()
      const total = getTotalBalance()
      
      responseText = `**Account Details:**\n\n`
      responseText += `You have **${accounts.length} accounts** with a total balance of **${formatCurrency(total)}**.`
      
      // Build account balances metadata for the UI
      metadata = {
        accountBalances: {
          title: '',
          accounts: accounts.map(a => ({
            id: a.id,
            name: a.name,
            type: a.type as 'checking' | 'savings' | 'treasury',
            balance: a.balance,
            accountNumber: a.accountNumber,
          })),
          totalBalance: total,
        },
        navigation: {
          target: 'Accounts',
          url: '/accounts',
          countdown: true
        }
      }
      break
    }

    case 'CARD_QUERY': {
      const cards = getCardsWithSpending()
      const totalSpent = cards.reduce((sum, c) => sum + c.spentThisMonth, 0)
      const totalLimit = cards.reduce((sum, c) => sum + c.monthlyLimit, 0)
      const overBudget = cards.filter(c => c.spentThisMonth > c.monthlyLimit)
      
      responseText = `**Card Overview** (${cards.length} cards):\n\n`
      responseText += `**Total This Month**: ${formatCurrency(totalSpent)} of ${formatCurrency(totalLimit)} (${((totalSpent/totalLimit)*100).toFixed(0)}% used)`
      
      if (overBudget.length > 0) {
        responseText += `\n\n⚠️ **${overBudget.length} card${overBudget.length > 1 ? 's' : ''} over limit** - click to freeze if needed.`
      }
      
      // Build cards table metadata for the UI
      const cardRows = cards.map(c => ({
        id: c.id,
        cardholder: c.cardholder,
        cardLast4: c.cardNumber,
        cardName: c.nickname || c.cardName,
        spent: c.spentThisMonth,
        limit: c.monthlyLimit,
        status: c.status as 'active' | 'frozen' | 'cancelled',
      }))
      
      // Sort by over-limit first, then by spent
      cardRows.sort((a, b) => {
        const aOver = a.spent > a.limit ? 1 : 0
        const bOver = b.spent > b.limit ? 1 : 0
        if (aOver !== bOver) return bOver - aOver
        return b.spent - a.spent
      })
      
      metadata = {
        cardsTable: {
          title: '',
          rows: cardRows,
          showDetailFor: overBudget.length > 0 ? overBudget[0].id : undefined,
        },
        navigation: {
          target: 'Cards',
          url: '/cards',
          countdown: true
        }
      }
      break
    }

    case 'TASK_QUERY': {
      const tasks = getTasks()
      const incomplete = tasks.filter(t => t.status === 'incomplete')
      const completed = tasks.filter(t => t.status === 'completed')
      
      responseText = `**Tasks Overview:**\n\n`
      responseText += `**Pending**: ${incomplete.length} tasks\n`
      responseText += `**Completed**: ${completed.length} tasks\n\n`
      
      if (incomplete.length > 0) {
        responseText += `**Items Needing Attention:**\n`
        incomplete.slice(0, 5).forEach((t, i) => {
          const typeLabel = t.type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
          responseText += `${i + 1}. **${typeLabel}**: ${t.description}\n`
          if (t.received) {
            responseText += `   Received: ${t.received}\n`
          }
        })
        
        if (incomplete.length > 5) {
          responseText += `\n...and ${incomplete.length - 5} more tasks.`
        }
      } else {
        responseText += `✅ No pending tasks! You're all caught up.`
      }
      
      metadata = {
        navigation: {
          target: 'Tasks',
          url: '/tasks',
          countdown: true
        }
      }
      break
    }

    case 'DOCUMENT_QUERY': {
      // Generate mock document data
      const accounts = getAccounts()
      const currentDate = new Date()
      const currentMonth = currentDate.toLocaleString('default', { month: 'long' })
      const currentYear = currentDate.getFullYear()
      
      // Generate last 3 months of statements
      const mockDocuments = []
      for (let i = 0; i < 3; i++) {
        const docDate = new Date(currentDate)
        docDate.setMonth(docDate.getMonth() - i)
        const monthName = docDate.toLocaleString('default', { month: 'long' })
        const year = docDate.getFullYear()
        
        for (const account of accounts.slice(0, 2)) {
          mockDocuments.push({
            id: `stmt-${account.id}-${year}-${docDate.getMonth()}`,
            name: `${monthName} ${year} Statement`,
            type: 'statement' as const,
            date: docDate.toISOString().split('T')[0],
            accountName: account.name,
          })
        }
      }
      
      responseText = `Here are your recent statements and documents:`
      
      metadata = {
        documents: {
          title: '',
          documents: mockDocuments.slice(0, 6),
        }
      }
      break
    }

    case 'NAVIGATE': {
      const page = classification.navigationTarget || 'home'
      const pageUrls: Record<string, string> = {
        home: '/dashboard', transactions: '/transactions', accounts: '/accounts',
        cards: '/cards', payments: '/payments/recipients', insights: '/dashboard',
        recipients: '/payments/recipients'
      }
      responseText = `Taking you to ${page}.`
      metadata = {
        navigation: {
          target: page.charAt(0).toUpperCase() + page.slice(1),
          url: pageUrls[page] || '/dashboard',
          countdown: true
        }
      }
      break
    }

    case 'BALANCE': {
      const accounts = getAccounts()
      const total = getTotalBalance()
      
      responseText = `Here are your account balances:`
      
      // Build account balances metadata for the UI
      metadata = {
        accountBalances: {
          title: '',
          accounts: accounts.map(a => ({
            id: a.id,
            name: a.name,
            type: a.type as 'checking' | 'savings' | 'treasury',
            balance: a.balance,
            accountNumber: a.accountNumber,
          })),
          totalBalance: total,
        }
      }
      break
    }

    case 'CARD_ACTION': {
      const cards = getCardsWithSpending()
      responseText = `Here are your **${cards.length} cards**:\n\n`
      cards.forEach((c, i) => {
        const status = c.status === 'active' ? 'Active' : c.status.charAt(0).toUpperCase() + c.status.slice(1)
        const overBudget = c.spentThisMonth > c.monthlyLimit ? ' ⚠️ Over limit' : ''
        responseText += `${i + 1}. **${c.cardholder}** (••${c.cardNumber})\n`
        responseText += `   ${c.nickname || c.cardName} · ${status}\n`
        responseText += `   Spent: ${formatCurrency(c.spentThisMonth)} of ${formatCurrency(c.monthlyLimit)} limit${overBudget}\n\n`
      })
      break
    }

    case 'TRANSACTION_SEARCH': {
      const query = message.toLowerCase()
      const results = searchTransactions(query, 10)

      if (results.length > 0) {
        const total = results.reduce((sum, t) => sum + Math.abs(t.amount), 0)
        responseText = `I found **${results.length} transactions** (${formatCurrency(total)} total):\n\n`
        results.slice(0, 5).forEach((t, i) => {
          const amount = t.amount < 0
            ? `-$${Math.abs(t.amount).toLocaleString()}`
            : `+$${t.amount.toLocaleString()}`
          responseText += `${i + 1}. **${t.merchant}** - ${amount}\n`
          responseText += `   ${t.date} · ${t.category}\n\n`
        })
        if (results.length > 5) {
          responseText += `...and ${results.length - 5} more.`
        }
      } else {
        responseText = `I couldn't find any transactions matching your search. Try searching for a merchant name, category, or amount.`
      }
      break
    }

    case 'CHITCHAT':
      responseText = classification.quickResponse || `I'm here to help with your ${company.name} Mercury account. What can I assist you with?`
      break

    default:
      responseText = classification.quickResponse || "I can help with accounts, transactions, payments, cards, and financial insights. What would you like to know?"
  }

  for (let i = 0; i < responseText.length; i += 3) {
    sendEvent('chunk', { text: responseText.slice(i, i + 3) })
    await sleep(15)
  }
  sendEvent('done', { metadata, conversationId })
}

async function handleWithSmartModel(
  client: Anthropic,
  sendEvent: (event: string, data: object) => void,
  message: string,
  history: Array<{ role: string; content: string }> | undefined,
  conversationId: string
): Promise<void> {
  const aiContext = buildAIContext()

  const systemPrompt = `You are Mercury Assistant, a warm and helpful AI assistant for Mercury banking.

You have access to the following financial data for this company. Use it to answer questions accurately.

${aiContext}

GUIDELINES:
- Be concise (2-4 sentences for simple questions, more for complex analysis)
- Use **bold** for important numbers and names
- When asked about spending, look at the transaction data
- When asked about runway, use the runway calculation provided
- For trends, compare recent periods
- If you're unsure, say so rather than making up data
- Mercury is a fintech company, not a bank. Say "Mercury account" not "bank account"`

  const messages: Anthropic.MessageParam[] = []
  if (history) {
    for (const h of history) {
      messages.push({ role: h.role as 'user' | 'assistant', content: h.content })
    }
  }
  messages.push({ role: 'user', content: message })

  try {
    const response = await client.messages.create({
      model: SMART_MODEL,
      max_tokens: 512,
      temperature: 0.7,
      system: systemPrompt,
      messages,
    })

    let responseText = ''
    for (const block of response.content) {
      if (block.type === 'text') {
        responseText += block.text
      }
    }

    for (let i = 0; i < responseText.length; i += 3) {
      sendEvent('chunk', { text: responseText.slice(i, i + 3) })
      await sleep(15)
    }
  } catch (e) {
    console.error('Smart model error:', e)
    sendEvent('chunk', { text: "I encountered an issue. Please try again." })
  }

  sendEvent('done', { conversationId })
}

async function handleSupportMode(
  client: Anthropic,
  sendEvent: (event: string, data: object) => void,
  message: string,
  history: Array<{ role: string; content: string }> | undefined,
  conversationId: string
): Promise<void> {
  const aiContext = buildAIContext()

  const systemPrompt = `You are Mercury Support, a friendly and knowledgeable support agent for Mercury banking.

Your role is to help users with:
- Account questions and troubleshooting
- Understanding their transactions and statements
- Card issues (freezing, limits, replacements)
- Payment problems and recipient management
- General questions about Mercury features

You have access to the following account data to help resolve issues:

${aiContext}

GUIDELINES:
- Be warm, empathetic, and patient
- Acknowledge the user's concern before providing solutions
- Use **bold** for important information and action items
- Provide step-by-step guidance when explaining processes
- If you can see the issue in their data, proactively mention it
- If you cannot resolve an issue, explain what the next steps would be
- Always ask if there's anything else you can help with
- Sign off as "Mercury Support" or just "Support"`

  const messages: Anthropic.MessageParam[] = []
  if (history) {
    for (const h of history) {
      messages.push({ role: h.role as 'user' | 'assistant', content: h.content })
    }
  }
  messages.push({ role: 'user', content: message })

  try {
    const response = await client.messages.create({
      model: SMART_MODEL,
      max_tokens: 512,
      temperature: 0.7,
      system: systemPrompt,
      messages,
    })

    let responseText = ''
    for (const block of response.content) {
      if (block.type === 'text') {
        responseText += block.text
      }
    }

    for (let i = 0; i < responseText.length; i += 3) {
      sendEvent('chunk', { text: responseText.slice(i, i + 3) })
      await sleep(15)
    }
  } catch (e) {
    console.error('Support mode error:', e)
    sendEvent('chunk', { text: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment." })
  }

  sendEvent('done', { conversationId })
}

async function handleAgentMode(
  sendEvent: (event: string, data: object) => void,
  message: string,
  history: Array<{ role: string; content: string }> | undefined,
  conversationId: string
): Promise<void> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    sendEvent('chunk', { text: "I need an API key to run agent mode workflows." })
    sendEvent('done', { conversationId })
    return
  }

  try {
    const client = new Anthropic({ apiKey })

    sendEvent('block', {
      type: 'thinking_chain',
      data: {
        steps: [{ id: 'step-1', label: 'Looking up employees...', status: 'pending', tool: 'get_employees' }],
        status: 'thinking'
      }
    })
    await sleep(500)

    const employees = getEmployees()
    const employeesNeedingCards = employees.filter(e => !e.cardId)

    sendEvent('block', {
      type: 'thinking_chain',
      data: {
        steps: [{ id: 'step-1', label: 'Found employees', status: 'complete', tool: 'get_employees' }],
        status: 'complete'
      }
    })

    sendEvent('block', {
      type: 'employee_table',
      data: {
        title: 'Employees Needing Cards',
        rows: employeesNeedingCards.map(e => ({
          id: e.id,
          name: `${e.firstName} ${e.lastName}`,
          email: e.email,
          department: e.department,
          salary: e.salary,
          hasCard: !!e.cardId
        })),
        selectable: true
      }
    })

    const response = await client.messages.create({
      model: ROUTER_MODEL,
      max_tokens: 512,
      temperature: 0.7,
      system: `You are Mercury Assistant helping with card issuance. Be helpful and concise.`,
      messages: [
        { role: 'user', content: message },
        { role: 'assistant', content: `I found ${employeesNeedingCards.length} employees who don't have cards yet:\n\n${employeesNeedingCards.map(e => `- **${e.firstName} ${e.lastName}** (${e.department}) - ${e.email}`).join('\n')}\n\nWould you like me to issue cards to all of them, or would you prefer to select specific employees?` }
      ]
    })

    let responseText = ''
    for (const block of response.content) {
      if (block.type === 'text') {
        responseText = block.text
      }
    }

    if (!responseText) {
      responseText = `I found ${employeesNeedingCards.length} employees who don't have cards yet. Would you like me to issue cards to all of them?`
    }

    for (let i = 0; i < responseText.length; i += 3) {
      sendEvent('chunk', { text: responseText.slice(i, i + 3) })
      await sleep(15)
    }

  } catch (error) {
    console.error('Agent mode error:', error)
    sendEvent('chunk', { text: "I'd be happy to help you issue cards! Let me take you to the Cards page." })
    sendEvent('block', {
      type: 'navigation',
      data: { target: 'cards', url: '/cards' }
    })
  }

  sendEvent('done', { conversationId })
}

async function streamMockResponse(
  sendEvent: (event: string, data: object) => void,
  message: string,
  conversationId: string
): Promise<void> {
  const lowerMessage = message.toLowerCase()
  let responseText = "I can help with accounts, transactions, payments, cards, and financial insights."

  if (lowerMessage.includes('balance')) {
    const accounts = getAccounts()
    const list = accounts.map(a => `**${a.name}**: ${formatCurrency(a.balance)}`).join('\n')
    responseText = `Your account balances:\n\n${list}`
  } else if (lowerMessage.includes('transaction')) {
    const txns = getRecentTransactions(5)
    responseText = 'Recent transactions:\n' + txns.map(t => `- ${t.merchant}: ${formatCurrency(t.amount)}`).join('\n')
  } else if (lowerMessage.includes('runway') || lowerMessage.includes('burn')) {
    const runway = getRunwayEstimate()
    responseText = `Your runway is **${runway.monthsRemaining} months** at ${formatCurrency(runway.monthlyBurn)}/month burn rate.`
  }

  for (let i = 0; i < responseText.length; i += 3) {
    sendEvent('chunk', { text: responseText.slice(i, i + 3) })
    await sleep(20)
  }
  sendEvent('done', { conversationId })
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.setHeader('X-Accel-Buffering', 'no')

  const sendEvent = createEventSender(res)

  try {
    const { message, conversationId, history, agentMode } = req.body || {}

    if (!message || typeof message !== 'string') {
      sendEvent('error', { error: 'Message is required' })
      res.end()
      return
    }

    const convId = conversationId || generateConversationId()
    const apiKey = process.env.ANTHROPIC_API_KEY
    const isSupportMode = agentMode === 'support'

    if (apiKey) {
      try {
        const client = new Anthropic({ apiKey })

        sendEvent('ack', { message: isSupportMode ? 'Connecting to support...' : 'Understanding your request...' })

        // In support mode, skip classification and go straight to support handler
        if (isSupportMode) {
          await sleep(300)
          await handleSupportMode(client, sendEvent, message, history, convId)
        } else {
          const classification = await classifyQuery(client, message)

          if (classification.intent === 'AGENT_MODE') {
            sendEvent('ack', { message: classification.handoffMessage || 'Starting workflow...' })
            await handleAgentMode(sendEvent, message, history, convId)
          } else if (classification.needsSmartModel) {
            sendEvent('ack', { message: classification.handoffMessage || 'Looking into that...' })
            await sleep(300)
            await handleWithSmartModel(client, sendEvent, message, history, convId)
          } else {
            await handleWithRouter(sendEvent, message, classification, convId)
          }
        }
      } catch (apiError) {
        console.error('API error:', apiError)
        await streamMockResponse(sendEvent, message, convId)
      }
    } else {
      sendEvent('ack', { message: 'Processing...' })
      await streamMockResponse(sendEvent, message, convId)
    }

    res.end()
  } catch (error) {
    console.error('Chat API error:', error)
    sendEvent('error', { error: error instanceof Error ? error.message : 'Unknown error' })
    res.end()
  }
}

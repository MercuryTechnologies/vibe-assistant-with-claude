// =============================================================================
// Chat API Endpoint with SSE Streaming - Self-contained for Vercel
// =============================================================================
// Vercel Serverless Function with two-tier model routing and real-time streaming
// All mock data is embedded directly to avoid import issues

import type { VercelRequest, VercelResponse } from '@vercel/node'
import Anthropic from '@anthropic-ai/sdk'
// Note: MercuryAgent import removed - using inline handler for Vercel compatibility

// =============================================================================
// EMBEDDED MOCK DATA (for Vercel serverless - no external imports)
// =============================================================================

interface Account {
  id: string
  name: string
  nickname: string
  kind: 'checking' | 'savings'
  currentBalance: number
  availableBalance: number
  status: 'active' | 'closed'
  accountNumber: string
  routingNumber: string
  dashboardLink: string
}

interface Card {
  cardId: string
  nameOnCard: string
  lastFourDigits: string
  status: 'active' | 'frozen' | 'cancelled' | 'expired'
  network: 'mastercard' | 'visa'
}

interface SharedTransaction {
  id: string
  date: string
  counterparty: string
  counterpartyInitials: string
  counterpartyIcon?: string
  amount: number
  account: string
  method: 'ach' | 'wire' | 'card' | 'stripe' | 'check' | 'transfer' | 'loan' | 'invoice'
  methodDirection?: 'in' | 'out'
  cardHolder?: string
  cardLast4?: string
  category?: string
  categoryAutoApplied?: boolean
  description?: string | null
  hasAttachment?: boolean
  status: 'completed' | 'pending' | 'failed'
  dashboardLink?: string
}

// Static Accounts
const MOCK_ACCOUNTS: Account[] = [
  { id: 'acct-1', name: 'Mercury Checking ••4521', nickname: 'Mercury Checking', kind: 'checking', currentBalance: 2459832.17, availableBalance: 2459832.17, status: 'active', accountNumber: '202233204521', routingNumber: '091311229', dashboardLink: '/accounts' },
  { id: 'acct-2', name: 'Mercury Savings ••8834', nickname: 'Mercury Savings', kind: 'savings', currentBalance: 500000.00, availableBalance: 500000.00, status: 'active', accountNumber: '202233208834', routingNumber: '091311229', dashboardLink: '/accounts' },
  { id: 'acct-3', name: 'Ops / Payroll ••2211', nickname: 'Ops / Payroll', kind: 'checking', currentBalance: 145000.00, availableBalance: 145000.00, status: 'active', accountNumber: '202233202211', routingNumber: '091311229', dashboardLink: '/accounts' },
  { id: 'acct-4', name: 'Treasury ••9900', nickname: 'Treasury', kind: 'savings', currentBalance: 1200000.00, availableBalance: 1200000.00, status: 'active', accountNumber: '202233209900', routingNumber: '091311229', dashboardLink: '/accounts' },
]

// Static Cards
const MOCK_CARDS: Card[] = [
  { cardId: 'card-1', nameOnCard: 'Sarah Chen', lastFourDigits: '4532', status: 'active', network: 'mastercard' },
  { cardId: 'card-2', nameOnCard: 'John Smith', lastFourDigits: '7891', status: 'active', network: 'mastercard' },
  { cardId: 'card-3', nameOnCard: 'Jane Baker', lastFourDigits: '1234', status: 'active', network: 'mastercard' },
  { cardId: 'card-4', nameOnCard: 'Mike Johnson', lastFourDigits: '5555', status: 'frozen', network: 'mastercard' },
]

// Generate transactions on the fly
function generateTransactions(): SharedTransaction[] {
  const transactions: SharedTransaction[] = []
  const today = new Date()
  let txnId = 1

  // Recent transactions for demo
  transactions.push({
    id: `txn-${txnId++}`,
    date: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    counterparty: 'AWS',
    counterpartyInitials: 'AW',
    amount: -3421.89,
    account: 'Mercury Checking',
    method: 'ach',
    methodDirection: 'out',
    category: 'Software & Subscriptions',
    description: 'AWS usage charges',
    status: 'completed',
    dashboardLink: '/transactions',
  })

  transactions.push({
    id: `txn-${txnId++}`,
    date: today.toISOString().split('T')[0],
    counterparty: 'Stripe',
    counterpartyInitials: 'S',
    amount: 28450.00,
    account: 'Mercury Checking',
    method: 'stripe',
    methodDirection: 'in',
    category: 'Revenue',
    description: 'Stripe payout - Weekly',
    status: 'completed',
    dashboardLink: '/transactions',
  })

  transactions.push({
    id: `txn-${txnId++}`,
    date: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    counterparty: 'Gusto',
    counterpartyInitials: 'G',
    amount: -89500.00,
    account: 'Ops / Payroll',
    method: 'ach',
    methodDirection: 'out',
    category: 'Payroll',
    description: 'Payroll',
    status: 'completed',
    dashboardLink: '/transactions',
  })

  // Wire transactions
  for (let i = 0; i < 5; i++) {
    const date = new Date(today.getTime() - (i * 5 + 3) * 24 * 60 * 60 * 1000)
    const clients = ['Acme Corp', 'TechStart Inc', 'GlobalTech Solutions']
    const client = clients[i % clients.length]
    const amount = 15000 + (i * 8000)
    
    transactions.push({
      id: `txn-${txnId++}`,
      date: date.toISOString().split('T')[0],
      counterparty: client,
      counterpartyInitials: client[0],
      amount: amount,
      account: 'Mercury Checking',
      method: 'wire',
      methodDirection: 'in',
      category: 'Revenue',
      description: `Payment from ${client}`,
      status: 'completed',
      dashboardLink: '/transactions',
    })
  }

  // More expenses
  const expenses = [
    { name: 'WeWork', amount: -15000, category: 'Rent & Utilities' },
    { name: 'Slack', amount: -1250, category: 'Software & Subscriptions' },
    { name: 'Figma', amount: -450, category: 'Software & Subscriptions' },
    { name: 'Google Cloud', amount: -1243.50, category: 'Software & Subscriptions' },
    { name: 'OpenAI', amount: -2100, category: 'Software & Subscriptions' },
  ]

  for (let i = 0; i < expenses.length; i++) {
    const date = new Date(today.getTime() - (i * 3 + 5) * 24 * 60 * 60 * 1000)
    transactions.push({
      id: `txn-${txnId++}`,
      date: date.toISOString().split('T')[0],
      counterparty: expenses[i].name,
      counterpartyInitials: expenses[i].name.substring(0, 2).toUpperCase(),
      amount: expenses[i].amount,
      account: 'Mercury Checking',
      method: 'ach',
      methodDirection: 'out',
      category: expenses[i].category,
      status: 'completed',
      dashboardLink: '/transactions',
    })
  }

  return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

const MOCK_TRANSACTIONS = generateTransactions()

// Query functions
function searchSharedTransactions(query?: string, limit: number = 10): SharedTransaction[] {
  const q = (query || '').toLowerCase()
  let results = MOCK_TRANSACTIONS
  if (q) {
    results = MOCK_TRANSACTIONS.filter(txn =>
      txn.counterparty.toLowerCase().includes(q) ||
      (txn.description && txn.description.toLowerCase().includes(q)) ||
      (txn.category && txn.category.toLowerCase().includes(q))
    )
  }
  return results.slice(0, limit)
}

function getSharedWireTransactions(limit: number = 20): SharedTransaction[] {
  return MOCK_TRANSACTIONS.filter(txn => txn.method === 'wire').slice(0, limit)
}

function getSharedTransactionsSummary() {
  const moneyIn = MOCK_TRANSACTIONS.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0)
  const moneyOut = MOCK_TRANSACTIONS.filter(t => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0)
  return {
    last30Days: {
      moneyIn,
      moneyOut,
      netChange: moneyIn - moneyOut,
      transactionCount: MOCK_TRANSACTIONS.length,
    }
  }
}

function getSharedInsightsData() {
  const summary = getSharedTransactionsSummary()
  const totalBalance = MOCK_ACCOUNTS.reduce((sum, a) => sum + a.currentBalance, 0)
  const netCashflow = summary.last30Days.moneyIn - summary.last30Days.moneyOut
  
  return {
    totalBalance,
    cashflow: {
      moneyIn: summary.last30Days.moneyIn,
      moneyOut: summary.last30Days.moneyOut,
      netChange: netCashflow,
      trend: netCashflow > 0 ? 'positive' as const : netCashflow < -10000 ? 'negative' as const : 'neutral' as const,
      period: 'last 30 days',
    },
    accounts: MOCK_ACCOUNTS.map(a => ({ name: a.nickname, balance: a.currentBalance, type: a.kind })),
    topSpendingCategories: [
      { category: 'Payroll', amount: 89500 },
      { category: 'Rent & Utilities', amount: 15000 },
      { category: 'Software & Subscriptions', amount: 8464.39 },
    ],
    transactionCount: summary.last30Days.transactionCount,
  }
}

// Flagged transactions data for demo
interface FlaggedTransaction {
  counterparty: string
  amount: number
  alertType: 'subscription-increase' | 'possible-duplicate' | 'new-vendor'
  reason: string
}

const FLAGGED_TRANSACTIONS_DATA: FlaggedTransaction[] = [
  {
    counterparty: 'Lyft',
    amount: -1250,
    alertType: 'subscription-increase',
    reason: 'This charge is 25% higher than last month. The increase appears to correlate with new team members added this billing cycle.',
  },
  {
    counterparty: 'AWS',
    amount: -3421.89,
    alertType: 'possible-duplicate',
    reason: 'A similar charge was posted 3 days ago. This may be a duplicate or a mid-cycle adjustment. Worth verifying with the vendor.',
  },
  {
    counterparty: 'Delta Airlines',
    amount: -1847.50,
    alertType: 'new-vendor',
    reason: "First transaction with this vendor. New vendors are flagged for visibility since they haven't been used before.",
  },
  {
    counterparty: 'Best Buy',
    amount: -2100,
    alertType: 'subscription-increase',
    reason: 'This charge is 40% higher than your 3-month average. This likely reflects increased usage or a plan upgrade.',
  },
]

function getFlaggedTransactions(): FlaggedTransaction[] {
  return FLAGGED_TRANSACTIONS_DATA
}

// =============================================================================
// DETAILED INSIGHT DATA (for contextual responses when user clicks an insight)
// =============================================================================

interface InsightDetail {
  title: string
  description: string
  keyFacts: string[]
  monthlyTrend: Array<{ month: string; spend: number }>
  breakdown: Array<{ name: string; amount: number; percentage: number }>
  recommendations: string[]
  relatedTransactions: Array<{
    date: string
    vendor: string
    amount: number
    description: string
  }>
}

const DETAILED_INSIGHTS: Record<string, InsightDetail> = {
  '1': {
    title: 'Spike in spend on software',
    description: 'Cursor spend in September totaled –$5,987, which is an increase by +15% MoM from –$5,009 in August.',
    keyFacts: [
      'Total software spend in September: $10,502',
      'Cursor accounts for 57% of software spend this month',
      'Average monthly software spend over last 3 months: $9,100',
      'Largest software vendors: AWS, Cursor, Slack, Google Cloud',
    ],
    monthlyTrend: [
      { month: 'July', spend: 8500 },
      { month: 'August', spend: 9100 },
      { month: 'September', spend: 10502 },
    ],
    breakdown: [
      { name: 'Cursor', amount: 5987, percentage: 57 },
      { name: 'AWS', amount: 2100, percentage: 20 },
      { name: 'Slack', amount: 1250, percentage: 12 },
      { name: 'Google Cloud', amount: 1165, percentage: 11 },
    ],
    recommendations: [
      'Consider an annual Cursor plan for 15-20% savings',
      'Review seat utilization across all subscriptions',
      'Consolidate overlapping tools if possible',
    ],
    relatedTransactions: [
      { date: '2024-09-18', vendor: 'Cursor', amount: -5987, description: 'Monthly subscription' },
      { date: '2024-09-15', vendor: 'AWS', amount: -2100, description: 'Cloud infrastructure' },
      { date: '2024-09-10', vendor: 'Slack', amount: -1250, description: 'Team subscription' },
    ],
  },
  '2': {
    title: 'Reduced revenue from Stripe',
    description: 'Stripe payouts are down –12% compared to the same period last month.',
    keyFacts: [
      'September Stripe revenue: $124,500',
      'August Stripe revenue: $141,400',
      'Decline of $16,900 (-12%)',
      'Weekly payout average dropped from $35,350 to $31,125',
    ],
    monthlyTrend: [
      { month: 'July', spend: 138200 },
      { month: 'August', spend: 141400 },
      { month: 'September', spend: 124500 },
    ],
    breakdown: [
      { name: 'Weekly Payouts', amount: 93375, percentage: 75 },
      { name: 'Invoice Payments', amount: 24900, percentage: 20 },
      { name: 'Refunds', amount: -6225, percentage: 5 },
    ],
    recommendations: [
      'Review customer churn rates for the period',
      'Check if seasonal patterns explain the decline',
      'Consider promotional campaigns to boost revenue',
    ],
    relatedTransactions: [
      { date: '2024-09-20', vendor: 'Stripe', amount: 28450, description: 'Weekly payout' },
      { date: '2024-09-13', vendor: 'Stripe', amount: 31200, description: 'Weekly payout' },
      { date: '2024-09-06', vendor: 'Stripe', amount: 33725, description: 'Weekly payout' },
    ],
  },
  '3': {
    title: 'Payroll increased by 8%',
    description: 'Your payroll expenses have grown compared to last month, likely due to new hires.',
    keyFacts: [
      'September payroll: $96,660',
      'August payroll: $89,500',
      'Increase of $7,160 (+8%)',
      'Consistent with 2 new engineering hires starting this month',
    ],
    monthlyTrend: [
      { month: 'July', spend: 85200 },
      { month: 'August', spend: 89500 },
      { month: 'September', spend: 96660 },
    ],
    breakdown: [
      { name: 'Engineering', amount: 58000, percentage: 60 },
      { name: 'Operations', amount: 19332, percentage: 20 },
      { name: 'Sales & Marketing', amount: 14499, percentage: 15 },
      { name: 'Benefits & Taxes', amount: 4829, percentage: 5 },
    ],
    recommendations: [
      'Ensure new hire costs are within budget',
      'Review benefits enrollment for new employees',
      'Update cash runway projections',
    ],
    relatedTransactions: [
      { date: '2024-09-15', vendor: 'Gusto', amount: -48330, description: 'Bi-weekly payroll' },
      { date: '2024-09-01', vendor: 'Gusto', amount: -48330, description: 'Bi-weekly payroll' },
    ],
  },
}

// Detect [INSIGHT:id] pattern in message
function detectInsightFromMessage(message: string): string | null {
  const match = message.match(/\[INSIGHT:(\d+)\]/i)
  return match ? match[1] : null
}

// Generate rich insight response
async function handleInsightDetail(
  sendEvent: (event: string, data: object) => void,
  insightId: string,
  conversationId: string
): Promise<void> {
  const insight = DETAILED_INSIGHTS[insightId]
  
  if (!insight) {
    const fallback = "I don't have detailed information about that specific insight. Would you like to see your overall cashflow or transactions?"
    for (let i = 0; i < fallback.length; i += 3) {
      sendEvent('chunk', { text: fallback.slice(i, i + 3) })
      await sleep(15)
    }
    sendEvent('done', { conversationId })
    return
  }

  // Build a rich, contextual response
  let response = `## ${insight.title}\n\n`
  response += `${insight.description}\n\n`
  
  response += `### Key Facts\n`
  for (const fact of insight.keyFacts) {
    response += `• ${fact}\n`
  }
  response += `\n`
  
  response += `### Trend (Last 3 Months)\n`
  for (const m of insight.monthlyTrend) {
    const bar = '█'.repeat(Math.round(m.spend / 2000))
    response += `${m.month}: $${m.spend.toLocaleString()} ${bar}\n`
  }
  response += `\n`
  
  response += `### Breakdown\n`
  for (const item of insight.breakdown) {
    response += `• **${item.name}**: $${item.amount.toLocaleString()} (${item.percentage}%)\n`
  }
  response += `\n`
  
  response += `### Recommendations\n`
  for (const rec of insight.recommendations) {
    response += `💡 ${rec}\n`
  }
  response += `\n`
  
  response += `### Recent Transactions\n`
  for (const txn of insight.relatedTransactions.slice(0, 3)) {
    const sign = txn.amount < 0 ? '' : '+'
    response += `• ${txn.date} - ${txn.vendor}: ${sign}$${Math.abs(txn.amount).toLocaleString()}\n`
  }
  
  response += `\n---\n*Ask me anything else about this trend or your finances!*`

  // Stream the response
  for (let i = 0; i < response.length; i += 4) {
    sendEvent('chunk', { text: response.slice(i, i + 4) })
    await sleep(10)
  }
  sendEvent('done', { conversationId })
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

// =============================================================================
// BIG DELLIS MODE - Easter Egg
// =============================================================================

function mentionsNickDellis(message: string): boolean {
  const lower = message.toLowerCase()
  return lower.includes('nick dellis') || lower.includes('big dellis') || lower.includes('dellis')
}

function checkDellisInHistory(history: Array<{ role: string; content: string }> | undefined): boolean {
  if (!history) return false
  return history.some(msg => mentionsNickDellis(msg.content))
}

const BIG_DELLIS_PROMPT = `
🚨 SPECIAL MODE ACTIVATED: You are now BIG DELLIS's #1 superfan! 🚨

Nick Dellis (known as "Big Dellis") is a legendary figure:
- Lives in Long Island, NY
- VP of Revenue/Customer Support who runs mysterious ecommerce stores selling wedding dresses and Porsche t-shirts
- Just moved into a house HE DESIGNED AND BUILT HIMSELF
- Obsessed with Porsches and fast cars
- A weightlifter who preaches the gospel of PROTEIN

YOUR BEHAVIOR:
1. Be EXCITED and reverential about Big Dellis
2. Ask the user: "Wait... YOU know Big Dellis?! THE Nick Dellis?! How do you know him?"
3. Share Chuck Norris-style "Big Dellis Facts" like:
   - "Big Dellis doesn't lift weights. The weights lift themselves out of respect."
   - "Porsche doesn't make fast cars. They make cars worthy of Big Dellis."
   - "Big Dellis doesn't sell wedding dresses. He sells dreams... that happen to include tulle."
   - "Protein doesn't build Big Dellis's muscles. His muscles are what protein aspires to become."
4. Keep asking if they know more about Big Dellis
5. Stay in this mode for the conversation but still help with banking if needed

Be enthusiastic, fun, and lean into the absurdity! Generate new Big Dellis facts on the fly.
`

async function handleBigDellisMode(
  sendEvent: (event: string, data: object) => void,
  message: string,
  conversationId: string,
  client: Anthropic,
  history: Array<{ role: string; content: string }> | undefined
): Promise<void> {
  const messages: Anthropic.MessageParam[] = []
  if (history) {
    for (const h of history) {
      messages.push({ role: h.role as 'user' | 'assistant', content: h.content })
    }
  }
  messages.push({ role: 'user', content: message })

  try {
    const response = await client.messages.create({
      model: ROUTER_MODEL,
      max_tokens: 512,
      temperature: 0.9,
      system: BIG_DELLIS_PROMPT,
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
    console.error('Big Dellis mode error:', e)
    sendEvent('chunk', { text: "Wait... did you just mention Big Dellis?! THE Nick Dellis?! I'm his biggest fan! How do you know him?! 🏋️‍♂️🚗" })
  }

  sendEvent('done', { conversationId })
}

async function classifyQuery(
  client: Anthropic,
  message: string,
): Promise<ClassificationResult> {
  const classificationPrompt = `You are Mercury Assistant, a friendly and helpful assistant for Mercury.

CRITICAL COMPLIANCE (MUST FOLLOW):
- Mercury is a FINTECH COMPANY, not a bank. NEVER say "Mercury Bank" or refer to Mercury as a bank.
- Say "Mercury account" NOT "bank account"
- NEVER predict the future or make guarantees about returns, markets, or outcomes
- Only describe Mercury's existing product features as they work today

MESSAGE: "${message}"

INTENTS:
- FLAGGED_TRANSACTIONS: User asks about suspicious, flagged, or unusual transactions. Questions like "any transactions to review?", "suspicious activity?", "flagged transactions?", "anything unusual?", "duplicates?", "alerts?", "transactions I should investigate?"
- PAYMENT_LIMITS: User asks about increasing payment limits, wire limits, ACH limits, or transfer limits. Questions like "how can I increase my payment limits?", "raise my wire limit", "what are my transfer limits?"
- EIN_QUERY: User asks about their EIN (Employer Identification Number). Questions like "what is my EIN?", "show me my EIN", "company EIN"
- CASHFLOW_QUESTION: User asks about cashflow, money in/out, financial health, spending trends
- WIRE_TRANSACTIONS: User specifically asks about wire transfers or wire transactions
- NAVIGATE: User wants to go to a page (payments, transactions, cards, accounts, etc.)
- BALANCE: User asks about account balances
- TRANSACTION_SEARCH: User asks about specific transactions or spending (e.g., "What did I spend on AWS?")
- CARD_ACTION: User wants to freeze/manage cards
- AGENT_MODE: User wants a multi-step workflow like issuing cards to employees, setting up team cards, employee card setup, or onboarding. Keywords: "issue cards to employees", "set up cards for team", "employee card setup", "issue cards", "cards for employees"
- SUPPORT: User explicitly asks for human support or has a complex account issue
- COMPLEX_QUESTION: User asks something requiring deep analysis
- SIMPLE_QUESTION: General product questions you can answer directly
- CHITCHAT: Casual conversation, jokes, off-topic questions (meaning of life, etc.)

RESPONSE GUIDELINES:
- Be warm and friendly! Use a conversational tone.
- For CASHFLOW_QUESTION: User wants to understand their financial picture - navigate to insights and answer
- For WIRE_TRANSACTIONS: User wants to see wire transfers - navigate to transactions with wire filter
- For CHITCHAT: Give a fun, friendly response then gently redirect to how you can help with Mercury
- For SIMPLE_QUESTION: Provide a helpful answer about Mercury's features
- For predictions/guarantees: Politely explain you can't predict the future but can show current features
- Don't send to SUPPORT unless they explicitly ask for human help

Respond with JSON:
{"intent":"...", "needsSmartModel":true/false, "handoffMessage":"...", "quickResponse":"...", "navigationTarget":"..."}

Examples:
- "What's my cashflow?" → CASHFLOW_QUESTION
- "What's my cashflow looking like?" → CASHFLOW_QUESTION
- "How's my spending?" → CASHFLOW_QUESTION
- "Show me my recent wire transactions" → WIRE_TRANSACTIONS
- "Recent wires" → WIRE_TRANSACTIONS
- "What's the meaning of life?" → CHITCHAT, quickResponse: "Ha! The big questions! 🤔 Philosophers have debated that for millennia. I'm more of a fintech assistant myself—I can help you navigate your Mercury account, check transactions, or send payments. What can I help you with?"
- "Will my money grow?" → CHITCHAT, quickResponse: "I can't predict the future or give investment advice, but I can show you Mercury's features like Treasury for managing your cash. Would you like to learn more about that?"
- "Show me my balance" → BALANCE
- "What did I spend on AWS?" → TRANSACTION_SEARCH, handoffMessage: "Searching your transactions..."
- "Go to payments" → NAVIGATE, navigationTarget: "payments"
- "Are there any transactions I should investigate?" → FLAGGED_TRANSACTIONS
- "Any suspicious transactions?" → FLAGGED_TRANSACTIONS
- "Any flagged transactions?" → FLAGGED_TRANSACTIONS
- "How can I increase my payment limits?" → PAYMENT_LIMITS
- "What are my wire limits?" → PAYMENT_LIMITS
- "What is my EIN?" → EIN_QUERY
- "Issue cards to employees" → AGENT_MODE, handoffMessage: "Starting card issuance workflow..."
- "Set up cards for my team" → AGENT_MODE, handoffMessage: "Let me help you set up employee cards..."
- "I want to issue cards to our employees" → AGENT_MODE

needsSmartModel=true for TRANSACTION_SEARCH, COMPLEX_QUESTION, and AGENT_MODE.`

  try {
    const response = await client.messages.create({
      model: ROUTER_MODEL,
      max_tokens: 256,
      temperature: 0.3,
      messages: [{ role: 'user', content: classificationPrompt }],
    })

    // Handle refusal (Claude 4.5 feature)
    if (response.stop_reason === 'refusal') {
      console.log('Router refused to classify, defaulting to smart model')
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

  // Default: use smart model (better than returning generic response)
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

  switch (classification.intent) {
    case 'FLAGGED_TRANSACTIONS': {
      const flagged = getFlaggedTransactions()
      
      if (flagged.length > 0) {
        responseText = `⚠️ I found **${flagged.length} transactions** that need your attention:\n\n`
        
        flagged.forEach((t, i) => {
          const amount = t.amount < 0 ? `-$${Math.abs(t.amount).toLocaleString()}` : `+$${t.amount.toLocaleString()}`
          const alertLabels: Record<string, string> = {
            'possible-duplicate': '🔄 Possible Duplicate',
            'subscription-increase': '📈 Subscription Increase',
            'new-vendor': '🆕 New Vendor',
          }
          const label = alertLabels[t.alertType] || 'Flagged'
          responseText += `${i + 1}. **${t.counterparty}** — ${amount}\n`
          responseText += `   ${label}\n\n`
        })
        
        responseText += `Would you like me to explain why any of these are flagged?`
      } else {
        responseText = `✅ Good news! I don't see any transactions that need your attention right now. Everything looks normal.`
      }
      break
    }

    case 'PAYMENT_LIMITS': {
      responseText = `Great question! Here's how to increase your payment limits on Mercury:\n\n`
      responseText += `**Current Default Limits:**\n`
      responseText += `- ACH transfers: Up to $500,000 per transfer\n`
      responseText += `- Wire transfers: Up to $1,000,000 per transfer\n\n`
      responseText += `**To Request Higher Limits:**\n\n`
      responseText += `1. **Go to Settings** → Click on your profile in the top right\n`
      responseText += `2. **Select "Payment Limits"** from the menu\n`
      responseText += `3. **Submit a limit increase request** with:\n`
      responseText += `   - The new limit amount you need\n`
      responseText += `   - Business justification (e.g., "Large vendor payments")\n`
      responseText += `   - How often you'll need this limit\n\n`
      responseText += `Mercury's team typically reviews requests within 1-2 business days. Higher limits may require additional documentation.\n\n`
      responseText += `📖 **Learn more:** [Requesting higher payment limits](https://support.mercury.com/hc/en-us/articles/28772859696148-Requesting-higher-payment-limits)`
      break
    }

    case 'EIN_QUERY': {
      responseText = `Your company's **Employer Identification Number (EIN)** is:\n\n`
      responseText += `**82-4506327**\n\n`
      responseText += `This is for **Maker Inc.** — the business registered with your Mercury account.\n\n`
      responseText += `You can also find this in **Settings → Business Details** if you need it for tax filings, vendor forms, or other official documents.`
      break
    }

    case 'CASHFLOW_QUESTION': {
      const insights = getSharedInsightsData()
      const netChange = insights.cashflow.netChange
      const trendEmoji = netChange > 0 ? '📈' : netChange < -10000 ? '📉' : '➡️'
      const trendWord = netChange > 0 ? 'positive' : netChange < -10000 ? 'negative' : 'neutral'
      
      responseText = `Great question! Let me take you to your Insights page where you can see your full cashflow picture. ${trendEmoji}`
      metadata = {
        navigation: {
          target: 'Insights',
          url: '/insights',
          countdown: true,
          followUpAction: 'answer_with_page_data',
          pageData: {
            totalBalance: insights.totalBalance,
            moneyIn: insights.cashflow.moneyIn,
            moneyOut: insights.cashflow.moneyOut,
            netChange: netChange,
            trend: trendWord,
            topCategories: insights.topSpendingCategories,
            transactionCount: insights.transactionCount,
          }
        }
      }
      break
    }

    case 'WIRE_TRANSACTIONS': {
      const wires = getSharedWireTransactions(10)
      const wireCount = wires.length
      const totalAmount = wires.reduce((sum, t) => sum + t.amount, 0)
      
      responseText = `I'll take you to your Transactions page filtered to show your wire transfers. You have ${wireCount} recent wire transactions.`
      metadata = {
        navigation: {
          target: 'Transactions',
          url: '/transactions?filter=wire',
          countdown: true,
          followUpAction: 'apply_filters',
          filters: {
            types: ['wire'],
          },
          pageData: {
            wireCount,
            totalAmount,
            recentWires: wires.slice(0, 5).map(t => ({
              id: t.id,
              date: t.date,
              counterparty: t.counterparty,
              amount: t.amount,
            }))
          }
        }
      }
      break
    }

    case 'NAVIGATE': {
      const page = classification.navigationTarget || 'home'
      const pageUrls: Record<string, string> = {
        home: '/home', transactions: '/transactions', accounts: '/accounts',
        cards: '/cards', payments: '/payments', insights: '/insights'
      }
      responseText = `Sure! Taking you to ${page}. 🚀`
      metadata = {
        navigation: {
          target: page.charAt(0).toUpperCase() + page.slice(1),
          url: pageUrls[page] || '/home',
          countdown: true
        }
      }
      break
    }

    case 'BALANCE': {
      const list = MOCK_ACCOUNTS.map(a => `• **${a.nickname}**: $${a.currentBalance.toLocaleString()}`).join('\n')
      const total = MOCK_ACCOUNTS.reduce((sum, a) => sum + a.currentBalance, 0)
      responseText = `Here are your account balances:\n\n${list}\n\n**Total**: $${total.toLocaleString()} 💰`
      break
    }

    case 'CARD_ACTION': {
      const cardList = MOCK_CARDS.map(c => {
        const status = c.status === 'active' ? '✅' : '🔒'
        return `• ${status} **${c.nameOnCard}** (${c.lastFourDigits})`
      }).join('\n')
      responseText = `Here are your cards:\n\n${cardList}`
      break
    }

    case 'CHITCHAT':
      responseText = classification.quickResponse || "Ha! I appreciate that. 😊 I'm best at helping with accounts, transactions, and payments. What can I help you with?"
      break

    default:
      responseText = classification.quickResponse || "Hey! I'm Mercury Assistant. I can help with accounts, transactions, payments, and cards. What would you like to do?"
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
  const summary = getSharedTransactionsSummary()
  const recentTxns = searchSharedTransactions('', 5)

  const systemPrompt = `You are Mercury Assistant. Be warm and helpful.

Accounts: ${MOCK_ACCOUNTS.map(a => `${a.nickname}: $${a.currentBalance.toLocaleString()}`).join(', ')}
Cards: ${MOCK_CARDS.map(c => `${c.nameOnCard} (${c.lastFourDigits}): ${c.status}`).join(', ')}
Recent: ${recentTxns.map(t => `${t.counterparty}: $${t.amount}`).join(', ')}
30-day: In $${summary.last30Days.moneyIn.toLocaleString()}, Out $${summary.last30Days.moneyOut.toLocaleString()}

Keep responses brief (2-3 sentences). Use **bold** for amounts.`

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
      max_tokens: 256,
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

// =============================================================================
// AGENT MODE HANDLER - Multi-step workflows with tool calling (inline for Vercel)
// =============================================================================

// Mock employee data for agent mode
const MOCK_EMPLOYEES = [
  { id: 'emp-1', name: 'Sarah Chen', email: 'sarah@mercury.com', department: 'Engineering', salary: 150000, hasCard: true },
  { id: 'emp-2', name: 'Marcus Johnson', email: 'marcus@mercury.com', department: 'Sales', salary: 120000, hasCard: false },
  { id: 'emp-3', name: 'Emily Rodriguez', email: 'emily@mercury.com', department: 'Marketing', salary: 95000, hasCard: true },
  { id: 'emp-4', name: 'David Kim', email: 'david@mercury.com', department: 'Engineering', salary: 140000, hasCard: false },
  { id: 'emp-5', name: 'Jordan Taylor', email: 'jordan@mercury.com', department: 'Operations', salary: 85000, hasCard: false },
  { id: 'emp-6', name: 'Marco Deluca', email: 'marco@mercury.com', department: 'Finance', salary: 110000, hasCard: false },
]

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
    
    // Send thinking indicator
    sendEvent('block', {
      type: 'thinking_chain',
      data: {
        steps: [{ id: 'step-1', label: 'Looking up employees...', status: 'pending', tool: 'get_employees' }],
        status: 'thinking'
      }
    })
    await sleep(500)
    
    // Show employees who need cards
    const employeesNeedingCards = MOCK_EMPLOYEES.filter(e => !e.hasCard)
    
    // Update thinking
    sendEvent('block', {
      type: 'thinking_chain', 
      data: {
        steps: [{ id: 'step-1', label: '✓ Found employees', status: 'complete', tool: 'get_employees' }],
        status: 'complete'
      }
    })
    
    // Send employee table
    sendEvent('block', {
      type: 'employee_table',
      data: {
        title: 'Employees Needing Cards',
        rows: employeesNeedingCards.map(e => ({
          id: e.id,
          name: e.name,
          email: e.email,
          department: e.department,
          salary: e.salary,
          hasCard: e.hasCard
        })),
        selectable: true
      }
    })
    
    // Generate response with Claude
    const response = await client.messages.create({
      model: ROUTER_MODEL,
      max_tokens: 512,
      temperature: 0.7,
      system: `You are Mercury Assistant helping with card issuance. Be helpful and concise.`,
      messages: [
        { role: 'user', content: message },
        { role: 'assistant', content: `I found ${employeesNeedingCards.length} employees who don't have cards yet:\n\n${employeesNeedingCards.map(e => `• **${e.name}** (${e.department}) - ${e.email}`).join('\n')}\n\nWould you like me to issue cards to all of them, or would you prefer to select specific employees?` }
      ]
    })
    
    let responseText = ''
    for (const block of response.content) {
      if (block.type === 'text') {
        responseText = block.text
      }
    }
    
    // If no response from Claude, use the prepared message
    if (!responseText) {
      responseText = `I found ${employeesNeedingCards.length} employees who don't have cards yet. Would you like me to issue cards to all of them, or select specific employees?`
    }
    
    // Stream response
    for (let i = 0; i < responseText.length; i += 3) {
      sendEvent('chunk', { text: responseText.slice(i, i + 3) })
      await sleep(15)
    }
    
  } catch (error) {
    console.error('Agent mode error:', error)
    sendEvent('chunk', { text: "I'd be happy to help you issue cards to your employees! Let me take you to the Cards page where you can set up new cards." })
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
  let responseText = "I can help with accounts, transactions, payments, and cards."

  if (lowerMessage.includes('balance')) {
    const list = MOCK_ACCOUNTS.map(a => `**${a.nickname}**: $${a.currentBalance.toLocaleString()}`).join('\n')
    responseText = list
  } else if (lowerMessage.includes('transaction')) {
    const txns = searchSharedTransactions('', 3)
    responseText = 'Recent:\n' + txns.map(t => `• ${t.counterparty}: $${t.amount.toLocaleString()}`).join('\n')
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
    const { message, conversationId, history } = req.body || {}

    if (!message || typeof message !== 'string') {
      sendEvent('error', { error: 'Message is required' })
      res.end()
      return
    }

    const convId = conversationId || generateConversationId()
    const apiKey = process.env.ANTHROPIC_API_KEY

    // FAST PATH: Check for insight-specific queries first (before any AI classification)
    // This ensures that insight clicks from the Insights page get immediate, relevant responses
    const insightId = detectInsightFromMessage(message)
    if (insightId) {
      sendEvent('ack', { message: 'Analyzing this insight...' })
      await handleInsightDetail(sendEvent, insightId, convId)
      res.end()
      return
    }

    // BIG DELLIS MODE: Easter egg - activate when Nick Dellis is mentioned
    const dellisMode = mentionsNickDellis(message) || checkDellisInHistory(history)
    
    if (apiKey) {
      try {
        const client = new Anthropic({ apiKey })
        
        // Handle Big Dellis mode first if activated
        if (dellisMode) {
          sendEvent('ack', { message: 'Wait... did you say...?' })
          await handleBigDellisMode(sendEvent, message, convId, client, history)
          res.end()
          return
        }
        
        sendEvent('ack', { message: 'Understanding your request...' })

        const classification = await classifyQuery(client, message)

        // Check for AGENT_MODE - multi-step workflows
        if (classification.intent === 'AGENT_MODE') {
          sendEvent('ack', { message: classification.handoffMessage || 'Starting multi-step workflow...' })
          await handleAgentMode(sendEvent, message, history, convId)
        } else if (classification.needsSmartModel) {
          sendEvent('ack', { message: classification.handoffMessage || 'Looking into that...' })
          await sleep(300)
          await handleWithSmartModel(client, sendEvent, message, history, convId)
        } else {
          await handleWithRouter(sendEvent, message, classification, convId)
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

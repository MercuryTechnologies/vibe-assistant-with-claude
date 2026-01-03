// =============================================================================
// Chat API Endpoint with SSE Streaming - Self-contained for Vercel
// =============================================================================
// Vercel Serverless Function with two-tier model routing and real-time streaming
// All mock data is embedded directly to avoid import issues

import type { VercelRequest, VercelResponse } from '@vercel/node'
import Anthropic from '@anthropic-ai/sdk'

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
  const classificationPrompt = `You are Mercury Assistant, a friendly and helpful assistant for Mercury.

CRITICAL COMPLIANCE (MUST FOLLOW):
- Mercury is a FINTECH COMPANY, not a bank. NEVER say "Mercury Bank" or refer to Mercury as a bank.
- Say "Mercury account" NOT "bank account"
- NEVER predict the future or make guarantees about returns, markets, or outcomes
- Only describe Mercury's existing product features as they work today

MESSAGE: "${message}"

INTENTS:
- CASHFLOW_QUESTION: User asks about cashflow, money in/out, financial health, spending trends
- WIRE_TRANSACTIONS: User specifically asks about wire transfers or wire transactions
- NAVIGATE: User wants to go to a page (payments, transactions, cards, accounts, etc.)
- BALANCE: User asks about account balances
- TRANSACTION_SEARCH: User asks about specific transactions or spending (e.g., "What did I spend on AWS?")
- CARD_ACTION: User wants to freeze/manage cards
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

needsSmartModel=true only for TRANSACTION_SEARCH and COMPLEX_QUESTION.`

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

    if (apiKey) {
      try {
        const client = new Anthropic({ apiKey })
        sendEvent('ack', { message: 'Understanding your request...' })

        const classification = await classifyQuery(client, message)

        if (classification.needsSmartModel) {
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

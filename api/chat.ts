// =============================================================================
// Chat API Endpoint with SSE Streaming
// =============================================================================
// Vercel Serverless Function with two-tier model routing and real-time streaming

import type { VercelRequest, VercelResponse } from '@vercel/node'
import Anthropic from '@anthropic-ai/sdk'
import {
  MOCK_ACCOUNTS,
  MOCK_CARDS,
  getSharedInsightsData,
  getSharedTransactionsSummary,
  getSharedWireTransactions,
  searchSharedTransactions,
} from './_lib/mock-data'

// Model configuration - Claude 4.5 models (latest)
const ROUTER_MODEL = 'claude-sonnet-4-5-20250929'  // Sonnet 4.5: Intelligent router
const SMART_MODEL = 'claude-opus-4-5-20251101'     // Opus 4.5: Maximum capability

// Helper to send SSE events
function createEventSender(res: VercelResponse) {
  return (event: string, data: object) => {
    res.write(`event: ${event}\n`)
    res.write(`data: ${JSON.stringify(data)}\n\n`)
  }
}

// Sleep helper
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Generate a unique conversation ID
function generateConversationId(): string {
  return `conv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// Classification response type
interface ClassificationResult {
  intent: string
  needsSmartModel: boolean
  handoffMessage?: string
  quickResponse?: string
  navigationTarget?: string
}

// Classify query with Sonnet 4.5 (intelligent router)
async function classifyQuery(
  client: Anthropic,
  message: string,
  _history?: Array<{ role: string; content: string }>
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

  const response = await client.messages.create({
    model: ROUTER_MODEL,
    max_tokens: 256,
    temperature: 0.3,
    messages: [{ role: 'user', content: classificationPrompt }],
  })

  // Handle refusal
  if (response.stop_reason === 'refusal') {
    console.log('Router refused to classify, defaulting to smart model')
    return {
      intent: 'COMPLEX_QUESTION',
      needsSmartModel: true,
      handoffMessage: 'Let me look into that...'
    }
  }

  try {
    const textBlock = response.content.find(b => b.type === 'text')
    const text = textBlock && 'text' in textBlock ? textBlock.text : ''
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
  } catch (e) {
    console.error('Failed to parse router response:', e)
  }

  // Default: use smart model
  return {
    intent: 'COMPLEX_QUESTION',
    needsSmartModel: true,
    handoffMessage: 'Let me think about that...'
  }
}

// Handle with fast router model (simple queries)
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
      const wireTransactions = getSharedWireTransactions(10)
      const wireCount = wireTransactions.length
      const totalAmount = wireTransactions.reduce((sum, t) => sum + t.amount, 0)

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
            recentWires: wireTransactions.slice(0, 5).map(t => ({
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
        cards: '/cards', payments: '/payments', recipients: '/recipients',
        settings: '/settings', credit: '/credit', insights: '/insights'
      }
      const pageNames: Record<string, string> = {
        home: 'Home', transactions: 'Transactions', accounts: 'Accounts',
        cards: 'Cards', payments: 'Payments', recipients: 'Recipients',
        settings: 'Settings', credit: 'Credit', insights: 'Insights'
      }
      responseText = `Sure! Taking you to ${pageNames[page] || page}. 🚀`
      metadata = {
        navigation: {
          target: pageNames[page] || page.charAt(0).toUpperCase() + page.slice(1),
          url: pageUrls[page] || '/home',
          countdown: true
        }
      }
      break
    }

    case 'BALANCE': {
      const list = MOCK_ACCOUNTS.map(a => `• **${a.nickname}**: $${a.currentBalance.toLocaleString()}`).join('\n')
      const total = MOCK_ACCOUNTS.reduce((sum, a) => sum + a.currentBalance, 0)
      responseText = `Here are your account balances:\n\n${list}\n\n**Total across all accounts**: $${total.toLocaleString()} 💰`
      break
    }

    case 'CARD_ACTION': {
      const activeCards = MOCK_CARDS.filter(c => c.status === 'active')

      if (message.toLowerCase().includes('freeze')) {
        const cardMatch = activeCards.find(c =>
          message.toLowerCase().includes(c.nameOnCard.toLowerCase().split(' ')[0]) ||
          message.includes(c.lastFourDigits)
        )

        if (cardMatch) {
          responseText = `Done! I've frozen ${cardMatch.nameOnCard}'s card ending in ${cardMatch.lastFourDigits}. 🔒 You can unfreeze it anytime.`
          metadata = {
            action: {
              actionType: 'freeze_card',
              targetId: cardMatch.cardId,
              completed: true,
              undoAvailable: true,
              cardName: `${cardMatch.nameOnCard} (${cardMatch.lastFourDigits})`
            }
          }
        } else {
          responseText = `Sure, I can freeze a card for you! Which one?\n\n${activeCards.map(c => `• **${c.nameOnCard}** — ending in ${c.lastFourDigits}`).join('\n')}`
        }
      } else {
        const cardList = MOCK_CARDS.map(c => {
          const status = c.status === 'active' ? '✅ Active' : c.status === 'frozen' ? '🔒 Frozen' : c.status
          return `• **${c.nameOnCard}** (${c.lastFourDigits}) — ${status}`
        }).join('\n')
        responseText = `Here are your cards:\n\n${cardList}\n\nNeed to freeze or manage a card? Just ask!`
      }
      break
    }

    case 'SUPPORT': {
      const ticketId = 'TICKET-' + Math.floor(Math.random() * 10000)
      responseText = "I understand you'd like to speak with our support team. I'm connecting you now—they'll be able to help with more complex account matters. 🙏"
      metadata = {
        supportHandoff: {
          reason: message,
          ticketId
        }
      }
      break
    }

    case 'CHITCHAT': {
      responseText = classification.quickResponse || "Ha! I appreciate the philosophical question. 😊 I'm Mercury Assistant though, so I'm best at helping with your banking needs—accounts, transactions, payments, and cards. What can I help you with today?"
      break
    }

    case 'SIMPLE_QUESTION':
    default: {
      responseText = classification.quickResponse || "Hey there! I'm Mercury Assistant. I can help you check your accounts, find transactions, send payments, or manage your cards. What would you like to do?"
      break
    }
  }

  // Stream the response character by character
  for (let i = 0; i < responseText.length; i += 3) {
    sendEvent('chunk', { text: responseText.slice(i, i + 3) })
    await sleep(15)
  }

  sendEvent('done', { metadata, conversationId })
}

// Execute tool with mock data
function executeToolLocally(toolName: string, input: Record<string, unknown>): { data: unknown; metadata?: Record<string, unknown> } {
  switch (toolName) {
    case 'navigate_to_page': {
      const pageUrls: Record<string, string> = {
        home: '/home', transactions: '/transactions', accounts: '/accounts',
        cards: '/cards', payments: '/payments', recipients: '/recipients',
        settings: '/settings', credit: '/credit'
      }
      const page = input.page as string
      return {
        data: { success: true, page },
        metadata: {
          navigation: {
            target: page.charAt(0).toUpperCase() + page.slice(1),
            url: pageUrls[page] || '/home',
            countdown: true
          }
        }
      }
    }

    case 'search_transactions': {
      const query = input.query as string
      const limit = (input.limit as number) || 5
      const results = searchSharedTransactions(query, limit)
      return {
        data: {
          query,
          count: results.length,
          transactions: results.map(t => ({
            id: t.id,
            date: t.date,
            counterparty: t.counterparty,
            amount: t.amount,
            category: t.category,
            description: t.description,
            viewUrl: `/transactions?highlight=${t.id}`
          }))
        }
      }
    }

    default:
      return { data: { error: 'Unknown tool' } }
  }
}

// Handle with smart model (complex queries)
async function handleWithSmartModel(
  client: Anthropic,
  sendEvent: (event: string, data: object) => void,
  message: string,
  history: Array<{ role: string; content: string }> | undefined,
  conversationId: string
): Promise<void> {
  const summary = getSharedTransactionsSummary()
  const recentTxns = searchSharedTransactions('', 10)

  const systemPrompt = `You are Mercury Assistant, a friendly and knowledgeable assistant for Mercury. Be warm, helpful, and conversational.

CRITICAL COMPLIANCE RULES (MUST FOLLOW):
1. Mercury is a FINTECH COMPANY, not a bank.
   - NEVER say "Mercury Bank", "our bank", or "the bank"
   - Say "Mercury account" NOT "bank account"
   - If discussing banking services: "provided through our partner banks"

2. NO FUTURE PREDICTIONS:
   - NEVER predict future outcomes, returns, or market behavior
   - NEVER guarantee results ("will definitely", "guaranteed to")
   - Only describe existing Mercury features as they work TODAY

3. NO INVESTMENT/TAX/LEGAL ADVICE:
   - For such questions: "For specific guidance, please consult a qualified professional"

PERSONALITY:
- Warm and approachable (occasional emojis are fine 😊)
- Confident about Mercury's features
- Helpful and proactive
- Brief but friendly—2-3 sentences is ideal

AVAILABLE DATA:
Accounts: ${MOCK_ACCOUNTS.map(a => `${a.nickname}: $${a.currentBalance.toLocaleString()}`).join(', ')}

Cards: ${MOCK_CARDS.map(c => `${c.nameOnCard} (${c.lastFourDigits}): ${c.status}`).join(', ')}

Recent Transactions:
${recentTxns.map(t => `- ${t.date}: ${t.counterparty} ${t.amount > 0 ? '+' : ''}$${t.amount.toLocaleString()} [${t.id}]`).join('\n')}

Last 30 Days: In $${summary.last30Days.moneyIn.toLocaleString()}, Out $${summary.last30Days.moneyOut.toLocaleString()}

TOOLS:
- search_transactions: Search by merchant, category, or description
- navigate_to_page: Go to a page

FORMAT:
- Include markdown links for transactions: [View transaction](/transactions?highlight=txn-id)
- Use **bold** for amounts and key info
- Keep responses warm but concise`

  const tools: Anthropic.Tool[] = [
    {
      name: 'search_transactions',
      description: 'Search transactions by merchant, category, description, or cardholder.',
      input_schema: {
        type: 'object' as const,
        properties: {
          query: { type: 'string', description: 'Search term' },
          limit: { type: 'number', description: 'Max results (default 5)' }
        },
        required: ['query']
      }
    },
    {
      name: 'navigate_to_page',
      description: 'Navigate to a page.',
      input_schema: {
        type: 'object' as const,
        properties: {
          page: { type: 'string', enum: ['home', 'transactions', 'accounts', 'cards', 'payments', 'recipients', 'settings', 'credit'] }
        },
        required: ['page']
      }
    }
  ]

  const messages: Anthropic.MessageParam[] = []
  if (history && Array.isArray(history)) {
    for (const h of history) {
      messages.push({ role: h.role as 'user' | 'assistant', content: h.content })
    }
  }
  messages.push({ role: 'user', content: message })

  // First call to smart model
  const response = await client.messages.create({
    model: SMART_MODEL,
    max_tokens: 512,
    temperature: 0.7,
    system: systemPrompt,
    tools,
    messages,
  })

  // Handle refusal
  if (response.stop_reason === 'refusal') {
    const refusalText = "I can't help with that request. Is there something else I can assist you with?"
    for (let i = 0; i < refusalText.length; i += 3) {
      sendEvent('chunk', { text: refusalText.slice(i, i + 3) })
      await sleep(15)
    }
    sendEvent('done', { conversationId })
    return
  }

  let responseText = ''
  let metadata: Record<string, unknown> | undefined
  const toolUseBlocks: Array<{ type: 'tool_use'; id: string; name: string; input: Record<string, unknown> }> = []

  for (const block of response.content) {
    if (block.type === 'text') {
      responseText += block.text
    } else if (block.type === 'tool_use') {
      toolUseBlocks.push(block as { type: 'tool_use'; id: string; name: string; input: Record<string, unknown> })
    }
  }

  // Execute tools if needed
  if (toolUseBlocks.length > 0) {
    const toolResults: Anthropic.ToolResultBlockParam[] = []

    for (const block of toolUseBlocks) {
      const result = executeToolLocally(block.name, block.input)
      toolResults.push({
        type: 'tool_result',
        tool_use_id: block.id,
        content: JSON.stringify(result.data)
      })
      if (result.metadata) {
        metadata = result.metadata
      }
    }

    // Continue conversation with tool results
    const continueMessages: Anthropic.MessageParam[] = [...messages]
    continueMessages.push({ role: 'assistant', content: response.content })
    continueMessages.push({ role: 'user', content: toolResults })

    const followUp = await client.messages.create({
      model: SMART_MODEL,
      max_tokens: 256,
      temperature: 0.7,
      system: systemPrompt,
      tools,
      messages: continueMessages,
    })

    // Handle refusal in follow-up
    if (followUp.stop_reason === 'refusal') {
      responseText = "I found the information but can't display it. Please check the transactions page directly."
    } else {
      responseText = ''
      for (const block of followUp.content) {
        if (block.type === 'text') {
          responseText += block.text
        }
      }
    }
  }

  // Stream response
  if (responseText) {
    for (let i = 0; i < responseText.length; i += 3) {
      sendEvent('chunk', { text: responseText.slice(i, i + 3) })
      await sleep(15)
    }
  }

  sendEvent('done', { metadata, conversationId })
}

// Mock response fallback when no API key
async function streamMockResponse(
  sendEvent: (event: string, data: object) => void,
  message: string,
  conversationId: string
): Promise<void> {
  const lowerMessage = message.toLowerCase()
  let responseText = "I can help with accounts, transactions, payments, and cards."
  let metadata: Record<string, unknown> | undefined

  if (lowerMessage.includes('aws')) {
    const txns = searchSharedTransactions('AWS', 1)
    if (txns.length > 0) {
      const t = txns[0]
      responseText = `Found AWS charge: **$${Math.abs(t.amount).toLocaleString()}** on ${t.date}.`
      metadata = { link: { url: `/transactions?highlight=${t.id}`, label: 'View transaction' } }
    }
  } else if (lowerMessage.includes('balance')) {
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

  sendEvent('done', { metadata, conversationId })
}

/**
 * Main handler for the chat endpoint with SSE streaming
 */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  // Only allow POST requests
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.setHeader('X-Accel-Buffering', 'no')

  const sendEvent = createEventSender(res)

  try {
    const { message, conversationId, history } = req.body || {}

    // Validate request
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

        // Step 1: Fast router classifies the query
        sendEvent('ack', { message: 'Understanding your request...' })

        const routerResponse = await classifyQuery(client, message, history)

        // Step 2: Handle based on classification
        if (routerResponse.needsSmartModel) {
          // Show handoff message
          sendEvent('ack', { message: routerResponse.handoffMessage || 'Let me look into that...' })
          await sleep(300)

          // Use smart model for complex query
          await handleWithSmartModel(client, sendEvent, message, history, convId)
        } else {
          // Router can handle this directly
          await handleWithRouter(sendEvent, message, routerResponse, convId)
        }
      } catch (apiError) {
        console.error('API error:', apiError)
        await streamMockResponse(sendEvent, message, convId)
      }
    } else {
      // No API key - use mock responses
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

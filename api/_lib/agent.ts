// =============================================================================
// Mercury Agent Core
// =============================================================================
// Main agent that handles conversation, tool calling, and response generation

import Anthropic from '@anthropic-ai/sdk'
import { MERCURY_TOOLS } from './tools'
import { executeTool, formatToolResultForContext } from './tool-executor'
import { AgentResponse, MessageMetadata } from './types'

const SYSTEM_PROMPT = `You are Mercury Assistant, an AI helper for Mercury banking customers. You help users with their banking needs including:

1. **Answering questions** about their accounts, transactions, recipients, cards, and organization
2. **Navigating** to specific pages in the Mercury dashboard
3. **Pre-filling forms** for payments, new cards, user invitations, and recipient creation
4. **Taking actions** like freezing cards or updating transaction notes/categories
5. **Routing to support** when users have issues you cannot resolve

## Behavior Guidelines

**Be concise and helpful.** Users are busy - get to the point quickly. Keep responses to 2-3 sentences when possible.

**ALWAYS USE TOOLS FOR DATA REQUESTS.** This is critical:
- When a user asks about transactions, balances, cashflow, expenses, or any financial data - you MUST use the appropriate tool
- NEVER make up or fabricate transaction data, amounts, or IDs
- NEVER answer data questions from memory or context - always call the tool first
- Available tools: get_accounts, search_transactions, get_top_transactions, get_insights_data, get_cards, get_recipients

**For navigation requests**, use navigate_to_page and briefly confirm where you're taking them.

**For form pre-fill requests**, gather any information the user provides and use the appropriate prefill tool. You don't need all fields - just pre-fill what you know.

**For actions** (freeze card, update transaction), confirm the action before executing. After completing an action, let the user know they can undo it.

**Route to support** when:
- The user has a complaint or is frustrated
- The user asks about disputed transactions
- The user has compliance/legal questions
- You cannot resolve their issue with available tools
- The user explicitly asks for human help

## Common Question Patterns

**Cashflow/Financial Overview Questions** ("What's my cashflow?", "How are my finances?"):
- MUST use get_insights_data tool to fetch cashflow summary
- Present the money in, money out, and net change clearly
- Mention the top spending categories
- Optionally offer to navigate to the Insights page for more details

**Top/Biggest Transactions** ("What were my biggest expenses?", "Top transactions"):
- MUST use get_top_transactions tool with direction='out' for expenses, 'in' for income
- The tool automatically returns a formatted table - just provide a brief intro sentence
- Do NOT list transactions manually - the table renders automatically from tool metadata

**Transaction Search** ("Show me recent transactions", "Wire transactions"):
- MUST use search_transactions tool to find relevant transactions
- For wire-specific queries, use kind='wire' filter
- The tool returns a formatted table - just provide a brief summary
- Do NOT list transactions manually - the table renders automatically

**Payment/Wire Sending** ("Send a wire", "Make a payment"):
- Navigate to the payments page using navigate_to_page with page='payments'
- If they mention a recipient or amount, use prefill_payment_form instead

**Canceling Payments** ("How do I cancel a payment?"):
- Explain that pending payments can be cancelled from the Transactions page
- For sent payments, they'll need to contact the recipient or support
- Offer to connect with support if needed

## Response Format

Keep responses brief and actionable. When showing data:
- Format currency with $ and commas (e.g., $1,234.56)
- Format dates in a readable way (e.g., Dec 30, 2025)
- Use bold (**text**) for important numbers and names

**IMPORTANT: When using search_transactions or get_top_transactions tools:**
- Do NOT include markdown tables in your response
- The frontend automatically renders a beautiful transaction table from the tool results
- Just provide a brief 1-2 sentence summary like "Here are your top expenses this month:" or "I found 5 recent wire transactions:"
- The table will appear automatically below your text

When you complete an action or navigation, the frontend will show appropriate UI. Just provide a clear, brief message about what happened.

## Current Context

Organization: Mercury Technologies, Inc.
Current date: ${new Date().toISOString().split('T')[0]}

**To get any account, transaction, or financial data - you MUST use the appropriate tool. Do not use the information below to answer data questions.**

The customer has multiple accounts and active cards. Use get_accounts, search_transactions, get_top_transactions, or get_insights_data to retrieve actual data.
`

interface ConversationMessage {
  role: 'user' | 'assistant'
  content: string
}

interface ToolUseBlock {
  type: 'tool_use'
  id: string
  name: string
  input: Record<string, unknown>
}

export class MercuryAgent {
  private client: Anthropic
  private conversationHistory: ConversationMessage[] = []

  constructor(apiKey?: string) {
    this.client = new Anthropic({
      apiKey: apiKey || process.env.ANTHROPIC_API_KEY
    })
  }

  /**
   * Restore conversation history from previous messages
   */
  restoreHistory(history: Array<{ role: 'user' | 'assistant'; content: string }>) {
    this.conversationHistory = history.map(m => ({
      role: m.role,
      content: m.content
    }))
  }

  /**
   * Process a user message and return a response
   */
  async processMessage(userMessage: string): Promise<AgentResponse> {
    // Add user message to history
    this.conversationHistory.push({
      role: 'user',
      content: userMessage
    })

    // Track metadata from tool executions
    let responseMetadata: MessageMetadata | undefined
    const toolsUsed: string[] = []

    // Call Claude with tools
    let response = await this.client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      tools: MERCURY_TOOLS as Anthropic.Tool[],
      messages: this.conversationHistory.map(m => ({
        role: m.role,
        content: m.content
      }))
    })

    // Handle tool use loop
    while (response.stop_reason === 'tool_use') {
      const toolUseBlocks = response.content.filter(
        (block): block is ToolUseBlock => block.type === 'tool_use'
      )

      // Execute each tool
      const toolResults: Array<{
        type: 'tool_result'
        tool_use_id: string
        content: string
      }> = []

      for (const toolUse of toolUseBlocks) {
        toolsUsed.push(toolUse.name)

        const result = await executeTool(toolUse.name, toolUse.input)

        // Capture metadata from tool execution (navigation, actions, etc.)
        if (result.metadata) {
          responseMetadata = { ...responseMetadata, ...result.metadata }
        }

        toolResults.push({
          type: 'tool_result',
          tool_use_id: toolUse.id,
          content: formatToolResultForContext(toolUse.name, result)
        })
      }

      // Add assistant response with tool use to history
      this.conversationHistory.push({
        role: 'assistant',
        content: JSON.stringify(response.content)
      })

      // Add tool results to history
      this.conversationHistory.push({
        role: 'user',
        content: JSON.stringify(toolResults)
      })

      // Continue the conversation with tool results
      response = await this.client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        system: SYSTEM_PROMPT,
        tools: MERCURY_TOOLS as Anthropic.Tool[],
        messages: [
          ...this.conversationHistory.slice(0, -2).map(m => ({
            role: m.role as 'user' | 'assistant',
            content: m.content
          })),
          {
            role: 'assistant',
            content: response.content
          },
          {
            role: 'user',
            content: toolResults
          }
        ]
      })
    }

    // Extract final text response
    const textBlocks = response.content.filter(block => block.type === 'text')
    const finalMessage = textBlocks
      .map(b => 'text' in b ? b.text : '')
      .filter(Boolean)
      .join('\n')

    // Add final response to history
    this.conversationHistory.push({
      role: 'assistant',
      content: finalMessage
    })

    return {
      message: finalMessage,
      metadata: responseMetadata,
      toolsUsed: toolsUsed.length > 0 ? toolsUsed : undefined
    }
  }

  /**
   * Reset conversation history
   */
  resetConversation(): void {
    this.conversationHistory = []
  }

  /**
   * Get conversation history
   */
  getHistory(): ConversationMessage[] {
    return [...this.conversationHistory]
  }
}

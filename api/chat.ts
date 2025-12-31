// =============================================================================
// Chat API Endpoint
// =============================================================================
// Vercel Serverless Function for handling chat requests

import type { VercelRequest, VercelResponse } from '@vercel/node'
import { MercuryAgent, MockMercuryAgent } from './lib/agent'
import { ChatRequest, AgentResponse } from './lib/types'

/**
 * Generate a unique conversation ID
 */
function generateConversationId(): string {
  return `conv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Main handler for the chat endpoint
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

  try {
    const body = req.body as ChatRequest
    const { message, conversationId, history } = body

    // Validate request
    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Message is required' })
      return
    }

    // Determine whether to use real agent or mock
    const useRealAgent = !!process.env.ANTHROPIC_API_KEY

    let response: AgentResponse

    if (useRealAgent) {
      // Use real Claude agent
      const agent = new MercuryAgent()

      // Restore conversation history if provided
      if (history && Array.isArray(history)) {
        agent.restoreHistory(history)
      }

      response = await agent.processMessage(message)
    } else {
      // Use mock agent for development
      const mockAgent = new MockMercuryAgent()
      response = await mockAgent.processMessage(message)
    }

    // Return response with conversation ID
    res.status(200).json({
      ...response,
      conversationId: conversationId || generateConversationId()
    })
  } catch (error) {
    console.error('Chat API error:', error)
    
    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        res.status(500).json({ 
          error: 'API configuration error',
          message: 'The chat service is not properly configured. Please try again later.'
        })
        return
      }
    }

    res.status(500).json({ 
      error: 'Internal server error',
      message: 'An unexpected error occurred. Please try again.'
    })
  }
}


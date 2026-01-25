// =============================================================================
// Streaming Chat Hook
// =============================================================================
// Shared hook for sending messages with SSE streaming support

import { useCallback, useRef, useState } from 'react'
import { useChatStore } from './useChatStore'
import type { MessageMetadata } from './types'

// Track if this is the first API request (for cold start handling)
let isFirstRequest = true
const COLD_START_KEY = 'mercury-chat-warmed'

interface UseStreamingChatOptions {
  /** Called when an acknowledgment is received from the API */
  onAcknowledgment?: (message: string) => void
  /** Called when acknowledgment should be cleared */
  onClearAcknowledgment?: () => void
}

interface UseStreamingChatReturn {
  /** Send a message and add it to the conversation */
  sendMessage: (content: string) => Promise<void>
  /** Send a message to the API without adding a user message (for initial messages) */
  sendToApi: (content: string) => Promise<void>
  /** Current acknowledgment message from the API */
  acknowledgment: string | null
  /** Clear the acknowledgment */
  clearAcknowledgment: () => void
  /** Ref to track if initial message was sent (for component use) */
  initialMessageSentRef: React.MutableRefObject<string | null>
}

/**
 * Process a single SSE line and dispatch to appropriate handler
 */
function processSSELine(
  line: string,
  state: { eventType: string; hasStartedStreaming: boolean },
  handlers: {
    onAck: (message: string) => void
    onChunk: (text: string, isFirst: boolean) => void
    onDone: (metadata?: MessageMetadata) => void
    onError: (error: string) => void
  }
): boolean {
  if (line.startsWith('event: ')) {
    state.eventType = line.slice(7).trim()
    return false
  }
  
  if (line.startsWith('data: ')) {
    const data = line.slice(6)
    try {
      const parsed = JSON.parse(data)
      
      switch (state.eventType) {
        case 'ack':
          handlers.onAck(parsed.message)
          break
        case 'chunk':
          handlers.onChunk(parsed.text, !state.hasStartedStreaming)
          state.hasStartedStreaming = true
          break
        case 'done':
          handlers.onDone(parsed.metadata)
          return true
        case 'error':
          handlers.onError(parsed.error || 'Unknown error')
          break
      }
    } catch (e) {
      console.warn('SSE parse error:', e, 'data:', data)
    }
  }
  
  return false
}

/**
 * Parse SSE (Server-Sent Events) stream and handle different event types
 */
async function parseSSEStream(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  handlers: {
    onAck: (message: string) => void
    onChunk: (text: string, isFirst: boolean) => void
    onDone: (metadata?: MessageMetadata) => void
    onError: (error: string) => void
  }
): Promise<{ hasStartedStreaming: boolean; doneReceived: boolean }> {
  const decoder = new TextDecoder()
  let buffer = ''
  const state = {
    eventType: '',
    hasStartedStreaming: false,
  }
  let doneReceived = false
  
  try {
    while (true) {
      const { done, value } = await reader.read()
      
      if (done) {
        buffer += decoder.decode()
        break
      }
      
      buffer += decoder.decode(value, { stream: true })
      
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''
      
      for (const line of lines) {
        if (processSSELine(line, state, handlers)) {
          doneReceived = true
        }
      }
    }
    
    if (buffer.trim()) {
      const remainingLines = buffer.split('\n')
      for (const line of remainingLines) {
        if (processSSELine(line, state, handlers)) {
          doneReceived = true
        }
      }
    }
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : 'Stream error'
    // Only log as error if we haven't received done - network interruptions are common
    if (!doneReceived) {
      console.error('SSE stream error:', errorMessage)
      handlers.onError(errorMessage)
    } else {
      // Stream closed after done was received - this is normal
      console.log('SSE stream closed after completion')
    }
  }
  
  return { hasStartedStreaming: state.hasStartedStreaming, doneReceived }
}

/**
 * Sleep utility for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Check if the API has been warmed (not a cold start)
 */
function checkIsWarmed(): boolean {
  try {
    const warmedAt = sessionStorage.getItem(COLD_START_KEY)
    if (warmedAt) {
      const elapsed = Date.now() - parseInt(warmedAt, 10)
      // Consider warmed if last successful request was within 5 minutes
      return elapsed < 5 * 60 * 1000
    }
  } catch {
    // sessionStorage not available
  }
  return false
}

/**
 * Mark the API as warmed after successful request
 */
function markAsWarmed(): void {
  try {
    sessionStorage.setItem(COLD_START_KEY, Date.now().toString())
  } catch {
    // sessionStorage not available
  }
  isFirstRequest = false
}

/**
 * Fetch with retry logic and exponential backoff for SSE stream reliability
 * Uses more retries and longer delays for cold start scenarios
 */
async function fetchWithRetry(
  url: string, 
  options: RequestInit, 
  maxRetries = 3
): Promise<Response> {
  let lastError: Error | null = null
  
  // Use more retries for cold start
  const isColdStart = isFirstRequest && !checkIsWarmed()
  const retries = isColdStart ? 4 : maxRetries
  const baseDelay = isColdStart ? 1000 : 500 // Longer initial delay for cold start
  
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await fetch(url, options)
      if (response.ok) {
        markAsWarmed()
        return response
      }
      
      // Don't retry on client errors (4xx), only server errors (5xx)
      if (response.status >= 400 && response.status < 500) {
        throw new Error(`Request failed with status ${response.status}`)
      }
      
      lastError = new Error(`Request failed with status ${response.status}`)
    } catch (e) {
      lastError = e instanceof Error ? e : new Error('Network error')
      console.warn(`SSE fetch attempt ${attempt + 1} failed:`, lastError.message)
      
      // Don't wait after the last attempt
      if (attempt < retries - 1) {
        const delay = Math.pow(2, attempt) * baseDelay
        console.log(`Retrying in ${delay}ms...`)
        await sleep(delay)
      }
    }
  }
  
  throw lastError || new Error('Failed to fetch after retries')
}

/**
 * Hook for sending chat messages with streaming support
 */
export function useStreamingChat(options: UseStreamingChatOptions = {}): UseStreamingChatReturn {
  const {
    addUserMessage,
    addAssistantMessage,
    setLoading,
    setThinking,
    startStreamingMessage,
    appendToStreamingMessage,
    finishStreamingMessage,
  } = useChatStore()
  
  const [acknowledgment, setAcknowledgment] = useState<string | null>(null)
  const initialMessageSentRef = useRef<string | null>(null)
  
  const clearAcknowledgment = useCallback(() => {
    setAcknowledgment(null)
    options.onClearAcknowledgment?.()
  }, [options])
  
  /**
   * Core function to call the chat API and handle streaming response
   */
  const callChatApi = useCallback(async (
    content: string,
    history: Array<{ role: string; content: string }>
  ) => {
    const state = useChatStore.getState()
    const currentConversationId = state.conversationId
    const agentMode = state.agentMode
    
    const response = await fetchWithRetry('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: content,
        conversationId: currentConversationId,
        history,
        agentMode,
      }),
    })
    
    if (!response.ok) {
      throw new Error('Failed to get response')
    }
    
    const contentType = response.headers.get('content-type')
    
    if (contentType?.includes('text/event-stream')) {
      const reader = response.body?.getReader()
      if (!reader) throw new Error('No response body')
      
      let metadata: MessageMetadata | undefined
      let streamingStarted = false
      let doneHandled = false
      
      const result = await parseSSEStream(reader, {
        onAck: (message) => {
          setAcknowledgment(message)
          options.onAcknowledgment?.(message)
          setThinking(null)
        },
        onChunk: (text, isFirst) => {
          if (isFirst) {
            setAcknowledgment(null)
            startStreamingMessage()
            streamingStarted = true
          }
          appendToStreamingMessage(text)
        },
        onDone: (meta) => {
          metadata = meta
          finishStreamingMessage(metadata)
          setLoading(false)
          doneHandled = true
        },
        onError: (error) => {
          console.error('SSE error event:', error)
          if (streamingStarted) {
            finishStreamingMessage()
          }
        },
      })
      
      if (result.hasStartedStreaming && !result.doneReceived && !doneHandled) {
        console.warn('Stream ended without done event - finishing message')
        finishStreamingMessage(metadata)
        setLoading(false)
      }
      
      if (!result.hasStartedStreaming && acknowledgment) {
        addAssistantMessage(acknowledgment, metadata)
      }
    } else {
      const data = await response.json()
      addAssistantMessage(data.message, data.metadata)
    }
  }, [
    acknowledgment,
    addAssistantMessage,
    appendToStreamingMessage,
    finishStreamingMessage,
    options,
    setLoading,
    setThinking,
    startStreamingMessage,
  ])
  
  /**
   * Send a message: adds user message to conversation, then calls API
   */
  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return
    
    addUserMessage(content)
    setLoading(true)
    
    // Show cold start message if this is the first request
    const isColdStart = isFirstRequest && !checkIsWarmed()
    if (isColdStart) {
      setThinking('Connecting to Mercury...')
      // Show extended thinking message after a moment if still waiting
      setTimeout(() => {
        if (useChatStore.getState().isLoading) {
          setAcknowledgment('This may take a moment on first connection...')
        }
      }, 2000)
    } else {
      setThinking('Thinking')
    }
    setAcknowledgment(null)
    
    try {
      const messages = useChatStore.getState().messages
      const history = messages.slice(0, -1).map((m) => ({
        role: m.role,
        content: m.content,
      }))
      
      await callChatApi(content, history)
    } catch (error) {
      console.error('Chat error:', error)
      setAcknowledgment(null)
      addAssistantMessage("I'm sorry, I encountered an error processing your request. Please try again.")
    } finally {
      setLoading(false)
      setThinking(null)
    }
  }, [addUserMessage, addAssistantMessage, callChatApi, setLoading, setThinking])
  
  /**
   * Send to API without adding user message (for initial messages already in store)
   */
  const sendToApi = useCallback(async (content: string) => {
    setAcknowledgment(null)
    
    try {
      await callChatApi(content, [])
    } catch (error) {
      console.error('Chat error:', error)
      setAcknowledgment(null)
      addAssistantMessage("I'm sorry, I encountered an error. Please try again.")
    } finally {
      setLoading(false)
      setThinking(null)
    }
  }, [addAssistantMessage, callChatApi, setLoading, setThinking])
  
  return {
    sendMessage,
    sendToApi,
    acknowledgment,
    clearAcknowledgment,
    initialMessageSentRef,
  }
}

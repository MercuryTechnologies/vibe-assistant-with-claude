// =============================================================================
// Streaming Chat Hook
// =============================================================================
// Shared hook for sending messages with SSE streaming support

import { useCallback, useRef, useState } from 'react'
import { useChatStore } from './useChatStore'
import type { MessageMetadata } from './types'

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
    console.error('SSE stream error:', e)
    handlers.onError(e instanceof Error ? e.message : 'Stream error')
  }
  
  return { hasStartedStreaming: state.hasStartedStreaming, doneReceived }
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
    
    const response = await fetch('/api/chat', {
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
    setThinking('Thinking')
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

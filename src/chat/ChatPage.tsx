// =============================================================================
// Chat Page Component
// =============================================================================
// Full conversation page with streaming support, message list, and input

import React, { useEffect, useRef, useState, useCallback } from 'react'
import { useChatStore } from './useChatStore'
import ChatMessage from './ChatMessage'
import ThinkingIndicator from './ThinkingIndicator'
import { MessageMetadata } from './types'

interface ChatPageProps {
  onNavigate: (path: string) => void
}

export default function ChatPage({ onNavigate }: ChatPageProps) {
  const {
    messages,
    conversationNumber,
    isLoading,
    thinkingStatus,
    streamingMessageId,
    addUserMessage,
    addAssistantMessage,
    setLoading,
    setThinking,
    startStreamingMessage,
    appendToStreamingMessage,
    finishStreamingMessage,
  } = useChatStore()
  
  const [inputValue, setInputValue] = useState('')
  const [acknowledgment, setAcknowledgment] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading, streamingMessageId])
  
  // Focus input on mount and capture keystrokes
  useEffect(() => {
    inputRef.current?.focus()
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (e.metaKey || e.ctrlKey || e.altKey) return
      
      if (e.key.length === 1) {
        inputRef.current?.focus()
      }
    }
    
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])
  
  // Simplified streaming - no buffer, just append directly
  const processStreamChunk = useCallback((text: string) => {
    appendToStreamingMessage(text)
  }, [appendToStreamingMessage])
  
  // Send message with streaming support
  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return
    
    // Add user message
    addUserMessage(content)
    setLoading(true)
    setThinking('Thinking')
    setAcknowledgment(null)
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content,
          conversationId: useChatStore.getState().conversationId,
          history: useChatStore.getState().messages.slice(0, -1).map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to get response')
      }
      
      // Check if response is SSE stream
      const contentType = response.headers.get('content-type')
      
      if (contentType?.includes('text/event-stream')) {
        // Handle SSE streaming
        const reader = response.body?.getReader()
        const decoder = new TextDecoder()
        
        if (!reader) {
          throw new Error('No response body')
        }
        
        let buffer = ''
        let hasStartedStreaming = false
        let metadata: MessageMetadata | undefined
        
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          
          buffer += decoder.decode(value, { stream: true })
          
          // Parse SSE events from buffer
          const lines = buffer.split('\n')
          buffer = lines.pop() || '' // Keep incomplete line in buffer
          
          let eventType = ''
          
          for (const line of lines) {
            if (line.startsWith('event: ')) {
              eventType = line.slice(7)
            } else if (line.startsWith('data: ')) {
              const data = line.slice(6)
              try {
                const parsed = JSON.parse(data)
                
                if (eventType === 'ack') {
                  // Show acknowledgment
                  setAcknowledgment(parsed.message)
                  setThinking(null)
                } else if (eventType === 'chunk') {
                  // Start streaming if not already
                  if (!hasStartedStreaming) {
                    setAcknowledgment(null)
                    startStreamingMessage()
                    hasStartedStreaming = true
                  }
                  // Buffer and append chunk
                  processStreamChunk(parsed.text)
                } else if (eventType === 'done') {
                  // Streaming complete
                  metadata = parsed.metadata
                  finishStreamingMessage(metadata)
                  setLoading(false)
                } else if (eventType === 'error') {
                  throw new Error(parsed.error)
                }
              } catch (parseError) {
                // Ignore parse errors for incomplete data
              }
            }
          }
        }
        
        // If we got an acknowledgment but no streaming content, add it as a message
        if (!hasStartedStreaming && acknowledgment) {
          addAssistantMessage(acknowledgment, metadata)
        }
      } else {
        // Handle regular JSON response (fallback)
        const data = await response.json()
        addAssistantMessage(data.message, data.metadata)
      }
    } catch (error) {
      console.error('Chat error:', error)
      setAcknowledgment(null)
      addAssistantMessage(
        "I'm sorry, I encountered an error processing your request. Please try again."
      )
    } finally {
      setLoading(false)
      setThinking(null)
    }
  }, [addUserMessage, addAssistantMessage, setLoading, setThinking, startStreamingMessage, appendToStreamingMessage, finishStreamingMessage, processStreamChunk, acknowledgment])
  
  // Handle initial message on mount
  const initialMessageSentRef = useRef(false)
  useEffect(() => {
    if (messages.length === 1 && messages[0].role === 'user' && isLoading && !initialMessageSentRef.current) {
      initialMessageSentRef.current = true
      const messageContent = messages[0].content
      // Don't add user message again, just send to API
      sendMessageToApi(messageContent)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  
  // Send to API without adding user message (for initial message)
  const sendMessageToApi = useCallback(async (content: string) => {
    setAcknowledgment(null)
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content,
          conversationId: useChatStore.getState().conversationId,
          history: [],
        }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to get response')
      }
      
      const contentType = response.headers.get('content-type')
      
      if (contentType?.includes('text/event-stream')) {
        const reader = response.body?.getReader()
        const decoder = new TextDecoder()
        
        if (!reader) {
          throw new Error('No response body')
        }
        
        let buffer = ''
        let hasStartedStreaming = false
        let metadata: MessageMetadata | undefined
        
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          
          buffer += decoder.decode(value, { stream: true })
          
          const lines = buffer.split('\n')
          buffer = lines.pop() || ''
          
          let eventType = ''
          
          for (const line of lines) {
            if (line.startsWith('event: ')) {
              eventType = line.slice(7)
            } else if (line.startsWith('data: ')) {
              const data = line.slice(6)
              try {
                const parsed = JSON.parse(data)
                
                if (eventType === 'ack') {
                  setAcknowledgment(parsed.message)
                  setThinking(null)
                } else if (eventType === 'chunk') {
                  if (!hasStartedStreaming) {
                    setAcknowledgment(null)
                    startStreamingMessage()
                    hasStartedStreaming = true
                  }
                  processStreamChunk(parsed.text)
                } else if (eventType === 'done') {
                  metadata = parsed.metadata
                  finishStreamingMessage(metadata)
                  setLoading(false)
                } else if (eventType === 'error') {
                  throw new Error(parsed.error)
                }
              } catch {
                // Ignore parse errors
              }
            }
          }
        }
      } else {
        const data = await response.json()
        addAssistantMessage(data.message, data.metadata)
      }
    } catch (error) {
      console.error('Chat error:', error)
      setAcknowledgment(null)
      addAssistantMessage(
        "I'm sorry, I encountered an error processing your request. Please try again."
      )
    } finally {
      setLoading(false)
      setThinking(null)
    }
  }, [addAssistantMessage, setLoading, setThinking, startStreamingMessage, appendToStreamingMessage, finishStreamingMessage, processStreamChunk])
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || isLoading) return
    
    sendMessage(inputValue)
    setInputValue('')
  }
  
  const handleNavigate = useCallback((url: string) => {
    onNavigate(url)
  }, [onNavigate])
  
  const handleUndo = useCallback((actionType: string, _targetId: string) => {
    sendMessage(`Undo the ${actionType.replace(/_/g, ' ')} action`)
  }, [sendMessage])
  
  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-[rgba(112,115,147,0.1)]">
        <div className="flex items-center gap-3">
          {/* Back button */}
          <button
            onClick={() => onNavigate('/home')}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#f2f2f7] transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 12L6 8L10 4" stroke="#707393" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <h1 className="text-[17px] font-medium text-[#1e1e2a]">
            Ask #{conversationNumber}
          </h1>
        </div>
      </header>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-[720px] mx-auto">
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
              onNavigate={handleNavigate}
              onUndo={handleUndo}
            />
          ))}
          
          {/* Acknowledgment message */}
          {acknowledgment && (
            <div className="flex justify-start mb-4">
              <div className="max-w-[80%] bg-[#fafafc] border border-[rgba(112,115,147,0.12)] rounded-[20px] rounded-bl-[4px] px-4 py-3">
                <p className="text-[15px] leading-[22px] text-[#707393] italic">
                  {acknowledgment}
                </p>
              </div>
            </div>
          )}
          
          {/* Thinking indicator */}
          {thinkingStatus && !acknowledgment && (
            <ThinkingIndicator status={thinkingStatus} />
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      {/* Input */}
      <div className="border-t border-[rgba(112,115,147,0.1)] px-6 py-4">
        <form onSubmit={handleSubmit} className="max-w-[720px] mx-auto">
          <div className="flex items-center gap-3 bg-[#f7f7f9] rounded-full px-4 py-2">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask a follow-up..."
              className="flex-1 bg-transparent text-[15px] text-[#1e1e2a] placeholder-[#707393] outline-none"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                inputValue.trim() && !isLoading
                  ? 'bg-[#5266eb] text-white hover:bg-[#4255d9]'
                  : 'bg-[#e5e5ea] text-[#aeaeb2]'
              }`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

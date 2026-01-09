// =============================================================================
// Floating Chat Component
// =============================================================================
// A floating chat window that appears in the bottom right corner when the user
// navigates away from the full chat page while a conversation is active.

import React, { useEffect, useRef, useState, useCallback } from 'react'
import { useChatStore } from './useChatStore'
import { useStreamingChat } from './useStreamingChat'
import ChatMessage from './ChatMessage'
import ThinkingIndicator from './ThinkingIndicator'

interface FloatingChatProps {
  onNavigate: (path: string) => void
  onClose: () => void
  onExpand: () => void
}

export default function FloatingChat({ onNavigate, onClose, onExpand }: FloatingChatProps) {
  const {
    messages,
    conversationNumber,
    conversationId,
    isLoading,
    thinkingStatus,
    streamingMessageId,
  } = useChatStore()
  
  const {
    sendMessage,
    sendToApi,
    acknowledgment,
    initialMessageSentRef,
  } = useStreamingChat()
  
  const [inputValue, setInputValue] = useState('')
  const [isMinimized, setIsMinimized] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (!isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isLoading, streamingMessageId, isMinimized])
  
  // Focus input on mount and capture keystrokes
  useEffect(() => {
    if (!isMinimized) {
      inputRef.current?.focus()
    }
    
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only capture if not in another input and chat is not minimized
      if (isMinimized) return
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (e.metaKey || e.ctrlKey || e.altKey) return
      
      if (e.key.length === 1) {
        inputRef.current?.focus()
      }
    }
    
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isMinimized])
  
  // Reset initialMessageSentRef when conversation changes
  useEffect(() => {
    if (conversationId !== initialMessageSentRef.current) {
      initialMessageSentRef.current = null
    }
  }, [conversationId, initialMessageSentRef])
  
  // Handle initial message when floating chat opens with a pending message
  useEffect(() => {
    if (
      messages.length === 1 && 
      messages[0].role === 'user' && 
      isLoading && 
      initialMessageSentRef.current !== conversationId
    ) {
      initialMessageSentRef.current = conversationId
      const messageContent = messages[0].content
      sendToApi(messageContent)
    }
  }, [messages, isLoading, conversationId, sendToApi, initialMessageSentRef])
  
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    const trimmedValue = inputValue.trim()
    if (!trimmedValue) return
    
    // If already loading, ignore (but don't block - let user see it's processing)
    if (isLoading) {
      console.log('FloatingChat: Already processing, please wait...')
      return
    }
    
    sendMessage(trimmedValue)
    setInputValue('')
  }, [inputValue, isLoading, sendMessage])
  
  const handleNavigate = useCallback((url: string) => {
    onNavigate(url)
  }, [onNavigate])
  
  const handleUndo = useCallback((actionType: string, _targetId: string) => {
    sendMessage(`Undo the ${actionType.replace(/_/g, ' ')} action`)
  }, [sendMessage])
  
  // Minimized state - just show header
  if (isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsMinimized(false)}
          className="flex items-center gap-3 bg-white rounded-full pl-4 pr-3 py-2.5 shadow-lg border border-[rgba(112,115,147,0.15)] hover:shadow-xl transition-shadow"
        >
          <span className="text-[14px] font-medium text-[#1e1e2a]">Ask #{conversationNumber}</span>
          {isLoading && (
            <span className="w-2 h-2 bg-[#5266eb] rounded-full animate-pulse" />
          )}
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M7 8L10 5L13 8" stroke="#707393" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M7 12L10 15L13 12" stroke="#707393" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    )
  }
  
  return (
    <div className="fixed bottom-6 right-6 z-50 w-[400px] h-[500px] bg-white rounded-2xl shadow-2xl border border-[rgba(112,115,147,0.15)] flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-[rgba(112,115,147,0.1)] bg-[#fafafc]">
        <div className="flex items-center gap-2">
          <span className="text-[14px] font-medium text-[#1e1e2a]">Ask #{conversationNumber}</span>
          {isLoading && (
            <span className="w-2 h-2 bg-[#5266eb] rounded-full animate-pulse" />
          )}
        </div>
        <div className="flex items-center gap-1">
          {/* Expand button */}
          <button
            onClick={onExpand}
            className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-[#f2f2f7] transition-colors"
            title="Expand"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M8 1H13V6" stroke="#707393" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M6 13H1V8" stroke="#707393" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M13 1L8 6" stroke="#707393" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M1 13L6 8" stroke="#707393" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          {/* Minimize button */}
          <button
            onClick={() => setIsMinimized(true)}
            className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-[#f2f2f7] transition-colors"
            title="Minimize"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 7H12" stroke="#707393" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
          {/* Close button */}
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-[#f2f2f7] transition-colors"
            title="Close"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 2L12 12M12 2L2 12" stroke="#707393" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      </header>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            message={message}
            onNavigate={handleNavigate}
            onUndo={handleUndo}
          />
        ))}
        
        {/* Acknowledgment */}
        {acknowledgment && (
          <div className="flex justify-start mb-4">
            <div className="max-w-[85%] bg-[#fafafc] border border-[rgba(112,115,147,0.12)] rounded-[16px] rounded-bl-[4px] px-3 py-2">
              <p className="text-[14px] leading-[20px] text-[#707393] italic">
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
      
      {/* Input */}
      <div className="border-t border-[rgba(112,115,147,0.1)] px-3 py-3 bg-[#fafafc]">
        <form onSubmit={handleSubmit}>
          <div className="flex items-center gap-2 bg-white rounded-full px-3 py-1.5 border border-[rgba(112,115,147,0.15)]">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask a follow-up..."
              className="flex-1 bg-transparent text-[14px] text-[#1e1e2a] placeholder-[#707393] outline-none"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                isLoading
                  ? 'bg-[#5266eb] text-white cursor-wait'
                  : inputValue.trim()
                  ? 'bg-[#5266eb] text-white hover:bg-[#4255d9]'
                  : 'bg-[#e5e5ea] text-[#aeaeb2]'
              }`}
            >
              {isLoading ? (
                <svg className="animate-spin" width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25"/>
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                </svg>
              ) : (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

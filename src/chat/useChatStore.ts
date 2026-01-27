// =============================================================================
// Chat Store
// =============================================================================
// Zustand store for managing chat conversation state with streaming support

import { create } from 'zustand'
import type { ChatMessage, MessageMetadata, ThinkingStatus, NavigationMetadata, ClarificationRequest, EntityCard, SavedConversation } from './types'
import mockConversationsData from '@/data/conversations.json'

// Parse mock conversations and convert date strings to proper format
const mockConversations: SavedConversation[] = mockConversationsData.conversations.map(conv => ({
  ...conv,
  messages: conv.messages.map(msg => ({
    ...msg,
    role: msg.role as 'user' | 'assistant',
    timestamp: new Date(msg.timestamp),
  })),
}))

/**
 * Generate a unique ID for messages and conversations
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Generate a conversation number (for display as "Ask #XX")
 */
function generateConversationNumber(): number {
  const stored = localStorage.getItem('mercury-chat-conversation-count')
  const count = stored ? parseInt(stored, 10) + 1 : Math.floor(Math.random() * 50) + 1
  localStorage.setItem('mercury-chat-conversation-count', count.toString())
  return count
}

// Agent modes for different chat personas
export type AgentMode = 'assistant' | 'support'

interface ChatState {
  // Conversation state
  messages: ChatMessage[]
  conversationId: string | null
  conversationNumber: number
  conversationTitle: string | null  // Title of current conversation
  
  // Conversation history
  conversations: SavedConversation[]
  
  // Loading/thinking state
  isLoading: boolean
  thinkingStatus: ThinkingStatus | null
  
  // Streaming state
  streamingMessageId: string | null
  
  // Floating chat state (when navigated away from full chat page)
  isFloating: boolean
  
  // Full-screen chat panel state (for syncing nav highlight to Command)
  isFullScreenChat: boolean
  
  // Track which navigation actions have completed (by message ID)
  completedNavigations: Set<string>
  
  // Pending follow-up action after navigation
  pendingFollowUp: {
    action: 'answer_with_page_data' | 'apply_filters'
    targetPage: string
    filters?: NavigationMetadata['filters']
  } | null

  // Pending clarification request (for agentic flows)
  pendingClarification: ClarificationRequest | null
  
  // Agent mode (assistant or support)
  agentMode: AgentMode
  
  // Actions
  addUserMessage: (content: string) => void
  addAssistantMessage: (content: string, metadata?: MessageMetadata) => string
  setThinking: (status: ThinkingStatus | null) => void
  setLoading: (loading: boolean) => void
  setFloating: (floating: boolean) => void
  setFullScreenChat: (fullScreen: boolean) => void
  markNavigationComplete: (messageId: string, navigationMeta?: NavigationMetadata) => void
  isNavigationComplete: (messageId: string) => boolean
  clearConversation: () => void
  startNewConversation: (initialMessage?: string) => void
  setPendingFollowUp: (followUp: ChatState['pendingFollowUp']) => void
  clearPendingFollowUp: () => void
  
  // Streaming actions
  startStreamingMessage: () => string
  appendToStreamingMessage: (chunk: string) => void
  finishStreamingMessage: (metadata?: MessageMetadata) => void
  updateLastAssistantMessage: (content: string, metadata?: MessageMetadata) => void
  
  // Agentic flow actions
  setPendingClarification: (request: ClarificationRequest | null) => void
  respondToClarification: (requestId: string, optionId: string) => void
  updateEntityCardStatus: (messageId: string, entityId: string, status: EntityCard['status']) => void
  
  // Agent mode actions
  setAgentMode: (mode: AgentMode) => void
  
  // Conversation history actions
  saveCurrentConversation: () => void
  loadConversation: (id: string) => void
  deleteConversation: (id: string) => void
  getConversationTitle: () => string
}

export const useChatStore = create<ChatState>((set, get) => ({
  // Initial state
  messages: [],
  conversationId: null,
  conversationNumber: 0,
  conversationTitle: null,
  conversations: mockConversations,
  isLoading: false,
  thinkingStatus: null,
  streamingMessageId: null,
  isFloating: false,
  isFullScreenChat: false,
  completedNavigations: new Set<string>(),
  pendingFollowUp: null,
  pendingClarification: null,
  agentMode: 'assistant',
  
  // Add a user message to the conversation
  addUserMessage: (content: string) => {
    const message: ChatMessage = {
      id: generateId(),
      role: 'user',
      content,
      timestamp: new Date(),
    }
    
    set((state) => ({
      messages: [...state.messages, message],
    }))
  },
  
  // Add an assistant message to the conversation
  addAssistantMessage: (content: string, metadata?: MessageMetadata) => {
    const message: ChatMessage = {
      id: generateId(),
      role: 'assistant',
      content,
      timestamp: new Date(),
      metadata,
    }
    
    set((state) => ({
      messages: [...state.messages, message],
      isLoading: false,
      thinkingStatus: null,
    }))
    
    return message.id
  },
  
  // Start a new streaming message (creates empty assistant message)
  startStreamingMessage: () => {
    const messageId = generateId()
    const message: ChatMessage = {
      id: messageId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
    }
    
    set((state) => ({
      messages: [...state.messages, message],
      streamingMessageId: messageId,
      thinkingStatus: null, // Clear thinking when streaming starts
    }))
    
    return messageId
  },
  
  // Append text chunk to the streaming message
  appendToStreamingMessage: (chunk: string) => {
    const { streamingMessageId } = get()
    if (!streamingMessageId) return
    
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.id === streamingMessageId
          ? { ...msg, content: msg.content + chunk }
          : msg
      ),
    }))
  },
  
  // Finish streaming and add metadata
  finishStreamingMessage: (metadata?: MessageMetadata) => {
    const { streamingMessageId } = get()
    if (!streamingMessageId) return
    
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.id === streamingMessageId
          ? { ...msg, metadata }
          : msg
      ),
      streamingMessageId: null,
      isLoading: false,
    }))
  },
  
  // Update the last assistant message (for non-streaming updates)
  updateLastAssistantMessage: (content: string, metadata?: MessageMetadata) => {
    set((state) => {
      const messages = [...state.messages]
      const lastIndex = messages.length - 1
      
      if (lastIndex >= 0 && messages[lastIndex].role === 'assistant') {
        messages[lastIndex] = {
          ...messages[lastIndex],
          content,
          metadata: metadata || messages[lastIndex].metadata,
        }
      }
      
      return { messages }
    })
  },
  
  // Set the thinking status
  setThinking: (status: ThinkingStatus | null) => {
    set({ thinkingStatus: status })
  },
  
  // Set loading state
  setLoading: (loading: boolean) => {
    set({ isLoading: loading })
  },
  
  // Set floating state (for when navigated away from chat page)
  setFloating: (floating: boolean) => {
    set({ isFloating: floating })
  },
  
  // Set full-screen chat state (for syncing nav highlight to Command)
  setFullScreenChat: (fullScreen: boolean) => {
    set({ isFullScreenChat: fullScreen })
  },
  
  // Mark a navigation as completed (so countdown doesn't restart)
  markNavigationComplete: (messageId: string, navigationMeta?: NavigationMetadata) => {
    const current = get().completedNavigations
    const currentConversationId = get().conversationId
    const updated = new Set(current)
    updated.add(messageId)
    set({ completedNavigations: updated })
    
    // If there's page data, add a follow-up message after a short delay
    if (navigationMeta?.pageData && navigationMeta?.followUpAction === 'answer_with_page_data') {
      setTimeout(() => {
        // Check if we're still in the same conversation before adding message
        if (get().conversationId !== currentConversationId) {
          return
        }
        
        const pageData = navigationMeta.pageData as Record<string, unknown>
        let followUpContent = ''
        
        // Generate follow-up message based on page data type
        if ('moneyIn' in pageData && 'moneyOut' in pageData) {
          const moneyIn = pageData.moneyIn as number
          const moneyOut = pageData.moneyOut as number
          const netChange = pageData.netChange as number
          const trend = pageData.trend as string
          
          followUpContent = `Here's your cashflow overview:\n\n` +
            `**Money In:** $${moneyIn.toLocaleString()}\n` +
            `**Money Out:** $${moneyOut.toLocaleString()}\n` +
            `**Net Change:** ${netChange >= 0 ? '+' : ''}$${netChange.toLocaleString()}\n\n` +
            `Your cashflow is looking ${trend}! You can see more details in the charts above.`
        } else if ('wireCount' in pageData) {
          const wireCount = pageData.wireCount as number
          const recentWires = pageData.recentWires as Array<{counterparty: string, amount: number, date: string}>
          
          followUpContent = `Here are your recent wire transfers:\n\n`
          if (recentWires && recentWires.length > 0) {
            followUpContent += recentWires.slice(0, 3).map(w => 
              `- **${w.counterparty}**: ${w.amount >= 0 ? '+' : ''}$${w.amount.toLocaleString()} (${w.date})`
            ).join('\n')
            if (wireCount > 3) {
              followUpContent += `\n\n...and ${wireCount - 3} more. The page is now filtered to show all wire transactions.`
            }
          } else {
            followUpContent = `I've filtered the page to show wire transactions. You have ${wireCount} wire transfers in this period.`
          }
        }
        
        if (followUpContent) {
          get().addAssistantMessage(followUpContent)
        }
      }, 800)
    }
  },
  
  // Check if a navigation is complete
  isNavigationComplete: (messageId: string) => {
    return get().completedNavigations.has(messageId)
  },
  
  // Set a pending follow-up action
  setPendingFollowUp: (followUp) => {
    set({ pendingFollowUp: followUp })
  },
  
  // Clear the pending follow-up action
  clearPendingFollowUp: () => {
    set({ pendingFollowUp: null })
  },
  
  // Clear the current conversation
  clearConversation: () => {
    set({
      messages: [],
      conversationId: null,
      conversationNumber: 0,
      isLoading: false,
      thinkingStatus: null,
      streamingMessageId: null,
      isFloating: false,
      completedNavigations: new Set<string>(),
      pendingFollowUp: null,
      pendingClarification: null,
      agentMode: 'assistant',
    })
  },
  
  // Start a new conversation, optionally with an initial message
  startNewConversation: (initialMessage?: string) => {
    // Save current conversation first if it has messages
    const currentMessages = get().messages
    if (currentMessages.length > 0) {
      get().saveCurrentConversation()
    }
    
    const conversationId = generateId()
    const conversationNumber = generateConversationNumber()
    
    const messages: ChatMessage[] = []
    
    if (initialMessage) {
      messages.push({
        id: generateId(),
        role: 'user',
        content: initialMessage,
        timestamp: new Date(),
      })
    }
    
    set({
      messages,
      conversationId,
      conversationNumber,
      conversationTitle: null,
      isLoading: !!initialMessage,
      thinkingStatus: initialMessage ? 'Thinking' : null,
      streamingMessageId: null,
      completedNavigations: new Set<string>(),
      pendingFollowUp: null,
      pendingClarification: null,
    })
  },
  
  // Set a pending clarification request
  setPendingClarification: (request: ClarificationRequest | null) => {
    set({ pendingClarification: request })
  },
  
  // Respond to a clarification request
  respondToClarification: (requestId: string, optionId: string) => {
    const { pendingClarification } = get()
    if (!pendingClarification || pendingClarification.id !== requestId) return
    
    const selectedOption = pendingClarification.options.find(o => o.id === optionId)
    if (!selectedOption) return
    
    get().addUserMessage(selectedOption.label)
    
    set({ 
      pendingClarification: null,
      isLoading: true,
      thinkingStatus: 'Thinking',
    })
  },
  
  // Update an entity card's status in a message
  updateEntityCardStatus: (messageId: string, entityId: string, status: EntityCard['status']) => {
    set((state) => ({
      messages: state.messages.map((msg) => {
        if (msg.id !== messageId || !msg.metadata?.entityCards) return msg
        
        return {
          ...msg,
          metadata: {
            ...msg.metadata,
            entityCards: msg.metadata.entityCards.map((card) =>
              card.entityId === entityId ? { ...card, status } : card
            ),
          },
        }
      }),
    }))
  },
  
  // Set the agent mode (assistant or support)
  setAgentMode: (mode: AgentMode) => {
    set({ agentMode: mode })
  },
  
  // Save the current conversation to history
  saveCurrentConversation: () => {
    const { messages, conversationId, conversations } = get()
    if (messages.length === 0 || !conversationId) return
    
    // Generate title from first user message
    const firstUserMessage = messages.find(m => m.role === 'user')
    const title = firstUserMessage 
      ? firstUserMessage.content.slice(0, 40) + (firstUserMessage.content.length > 40 ? '...' : '')
      : 'New conversation'
    const preview = firstUserMessage?.content.slice(0, 50) || ''
    
    const now = new Date().toISOString()
    
    // Check if this conversation already exists
    const existingIndex = conversations.findIndex(c => c.id === conversationId)
    
    const savedConversation: SavedConversation = {
      id: conversationId,
      title,
      messages: messages.map(m => ({
        ...m,
        timestamp: m.timestamp instanceof Date ? m.timestamp : new Date(m.timestamp),
      })),
      createdAt: existingIndex >= 0 ? conversations[existingIndex].createdAt : now,
      updatedAt: now,
      preview,
    }
    
    if (existingIndex >= 0) {
      // Update existing conversation
      const updatedConversations = [...conversations]
      updatedConversations[existingIndex] = savedConversation
      set({ conversations: updatedConversations })
    } else {
      // Add new conversation at the beginning
      set({ conversations: [savedConversation, ...conversations] })
    }
  },
  
  // Load a conversation from history
  loadConversation: (id: string) => {
    const { conversations } = get()
    const conversation = conversations.find(c => c.id === id)
    if (!conversation) return
    
    // Save current conversation first if it has messages
    const currentMessages = get().messages
    if (currentMessages.length > 0 && get().conversationId !== id) {
      get().saveCurrentConversation()
    }
    
    // Load the conversation
    set({
      messages: conversation.messages.map(m => ({
        ...m,
        timestamp: m.timestamp instanceof Date ? m.timestamp : new Date(m.timestamp),
      })),
      conversationId: conversation.id,
      conversationTitle: conversation.title,
      conversationNumber: 0,
      isLoading: false,
      thinkingStatus: null,
      streamingMessageId: null,
      completedNavigations: new Set<string>(),
      pendingFollowUp: null,
      pendingClarification: null,
    })
  },
  
  // Delete a conversation from history
  deleteConversation: (id: string) => {
    const { conversations, conversationId } = get()
    const updatedConversations = conversations.filter(c => c.id !== id)
    set({ conversations: updatedConversations })
    
    // If we deleted the current conversation, clear it
    if (conversationId === id) {
      get().clearConversation()
    }
  },
  
  // Get the title of the current conversation
  getConversationTitle: () => {
    const { messages, conversationTitle } = get()
    if (conversationTitle) return conversationTitle
    
    const firstUserMessage = messages.find(m => m.role === 'user')
    if (firstUserMessage) {
      return firstUserMessage.content.slice(0, 30) + (firstUserMessage.content.length > 30 ? '...' : '')
    }
    
    return 'New conversation'
  },
}))

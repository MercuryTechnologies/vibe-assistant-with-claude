import { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Icon } from '@/components/ui/icon';
import { DSButton } from '@/components/ui/ds-button';
import { faPlus, faMicrophone, faArrowUp, faChartLine, faCreditCard, faUsers, faClock, faChevronDown, faMessage } from '@/icons';
import { useChatStore, useStreamingChat, type ChatMessage } from '@/chat';
import { ChatBlockRenderer } from '@/components/chat';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';

// Conversation starters - data-relevant prompts based on org metrics
const CONVERSATION_STARTERS: readonly { icon: IconDefinition; title: string; description: string; message: string }[] = [
  {
    icon: faChartLine,
    title: 'Runway & Burn',
    description: 'Check your 43+ month runway',
    message: "What's my current runway and burn rate?"
  },
  {
    icon: faCreditCard,
    title: 'Top Spending',
    description: 'See where your money goes',
    message: 'Show me my top spending categories'
  },
  {
    icon: faUsers,
    title: 'Team Overview',
    description: '28 team members across departments',
    message: 'Who is on my team and what cards do they have?'
  },
] as const;

// Helper to format relative time
function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export function Command() {
  const [inputValue, setInputValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [hasProcessedQuery, setHasProcessedQuery] = useState(false);
  const [showHistoryDropdown, setShowHistoryDropdown] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Chat store and streaming
  const { 
    messages, 
    isLoading, 
    thinkingStatus,
    startNewConversation,
    isNavigationComplete,
    markNavigationComplete,
    conversations,
    conversationId,
    loadConversation,
    getConversationTitle,
    clearConversation,
  } = useChatStore();
  const { sendMessage } = useStreamingChat();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowHistoryDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle ?q= query parameter - auto-send message on mount
  useEffect(() => {
    const queryMessage = searchParams.get('q');
    if (queryMessage && !hasProcessedQuery && !isLoading && messages.length === 0) {
      setHasProcessedQuery(true);
      // Clear the query param from URL
      setSearchParams({}, { replace: true });
      // Start new conversation and send the message
      startNewConversation();
      sendMessage(queryMessage);
    }
  }, [searchParams, hasProcessedQuery, isLoading, messages.length, setSearchParams, startNewConversation, sendMessage]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  // Auto-focus on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  // Handle navigation metadata from assistant messages
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (
      lastMessage?.role === 'assistant' &&
      lastMessage.metadata?.navigation &&
      !isNavigationComplete(lastMessage.id)
    ) {
      const nav = lastMessage.metadata.navigation;
      const targetUrl = nav.url;
      
      // Mark as complete before navigating to prevent re-triggering
      markNavigationComplete(lastMessage.id, nav);
      
      const doNavigate = () => {
        if (targetUrl) {
          navigate(targetUrl);
        }
      };
      
      if (nav.countdown) {
        // Navigate after 2 second delay for countdown
        const timer = setTimeout(doNavigate, 2000);
        return () => clearTimeout(timer);
      } else {
        doNavigate();
      }
    }
  }, [messages, navigate, isNavigationComplete, markNavigationComplete]);

  const handleComposerClick = () => {
    textareaRef.current?.focus();
  };

  // Handle sending a message
  const handleSendMessage = async () => {
    const content = inputValue.trim();
    if (!content || isLoading) return;
    
    // Start a new conversation if this is the first message
    // Don't pass content here - sendMessage will add the user message
    if (messages.length === 0) {
      startNewConversation();
    }
    
    setInputValue('');
    await sendMessage(content);
  };

  // Handle shortcut card click
  const handleShortcutClick = async (message: string) => {
    if (isLoading) return;
    
    // Start a new conversation if this is the first message
    // Don't pass message here - sendMessage will add the user message
    if (messages.length === 0) {
      startNewConversation();
    }
    
    setInputValue('');
    await sendMessage(message);
  };

  // Handle keyboard events
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Handle starting a new conversation
  const handleNewConversation = () => {
    clearConversation();
    setShowHistoryDropdown(false);
    textareaRef.current?.focus();
  };

  // Handle loading a conversation from history
  const handleLoadConversation = (id: string) => {
    loadConversation(id);
    setShowHistoryDropdown(false);
  };

  const hasMessages = messages.length > 0;
  const currentTitle = hasMessages ? getConversationTitle() : 'New conversation';

  return (
    <div className="command-page">
      {/* Main content area with gradient background */}
      <div className="command-content">
        {/* Dot grid background with fade overlays */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{
            zIndex: 0,
            pointerEvents: 'none',
          }}
        >
          {/* Dot grid pattern */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle, var(--neutral-base-300) 1px, transparent 1px)`,
              backgroundSize: '20px 20px',
              opacity: 0.5,
            }}
          />
          {/* Bottom fade overlay */}
          <div
            className="absolute bottom-0 left-0 right-0"
            style={{
              height: 80,
              background: 'linear-gradient(to top, var(--ds-bg-default) 0%, transparent 100%)',
            }}
          />
          {/* Top fade overlay */}
          <div
            className="absolute top-0 left-0 right-0"
            style={{
              height: 120,
              background: 'linear-gradient(to bottom, var(--ds-bg-default) 0%, transparent 100%)',
            }}
          />
        </div>

        {/* Conversation Header - shown when there are messages or conversations */}
        {(hasMessages || conversations.length > 0) && (
          <div className="command-conversation-header">
            {/* New conversation button */}
            <DSButton
              variant="secondary"
              size="small"
              onClick={handleNewConversation}
              disabled={!hasMessages}
            >
              <Icon icon={faPlus} size="small" style={{ marginRight: 6 }} />
              New
            </DSButton>

            {/* Current conversation title with history dropdown */}
            <div className="command-conversation-selector" ref={dropdownRef}>
              <button
                className="command-conversation-title-button"
                onClick={() => setShowHistoryDropdown(!showHistoryDropdown)}
              >
                <Icon icon={faMessage} size="small" style={{ color: 'var(--ds-icon-secondary)' }} />
                <span className="text-label-demi" style={{ color: 'var(--ds-text-default)' }}>
                  {currentTitle}
                </span>
                <Icon icon={faChevronDown} size="small" style={{ color: 'var(--ds-icon-tertiary)' }} />
              </button>

              {/* History Dropdown */}
              {showHistoryDropdown && (
                <div className="command-conversation-dropdown">
                  <div className="command-conversation-dropdown-header">
                    <Icon icon={faClock} size="small" style={{ color: 'var(--ds-icon-secondary)' }} />
                    <span className="text-label-demi" style={{ color: 'var(--ds-text-secondary)' }}>
                      Recent Conversations
                    </span>
                  </div>
                  
                  <div className="command-conversation-dropdown-list">
                    {/* Current conversation (if any) */}
                    {hasMessages && (
                      <button
                        className="command-conversation-item active"
                        onClick={() => setShowHistoryDropdown(false)}
                      >
                        <div className="command-conversation-item-content">
                          <span className="text-label-demi" style={{ color: 'var(--ds-text-default)' }}>
                            {currentTitle}
                          </span>
                          <span className="text-tiny" style={{ color: 'var(--ds-text-tertiary)' }}>
                            Current
                          </span>
                        </div>
                      </button>
                    )}

                    {/* Past conversations */}
                    {conversations
                      .filter(conv => conv.id !== conversationId)
                      .slice(0, 5)
                      .map(conv => (
                        <button
                          key={conv.id}
                          className="command-conversation-item"
                          onClick={() => handleLoadConversation(conv.id)}
                        >
                          <div className="command-conversation-item-content">
                            <span className="text-label" style={{ color: 'var(--ds-text-default)' }}>
                              {conv.title}
                            </span>
                            <span className="text-tiny" style={{ color: 'var(--ds-text-tertiary)' }}>
                              {formatRelativeTime(conv.updatedAt)}
                            </span>
                          </div>
                        </button>
                      ))}
                  </div>

                  {/* Start new action */}
                  <div className="command-conversation-dropdown-footer">
                    <button
                      className="command-conversation-new-btn"
                      onClick={handleNewConversation}
                    >
                      <Icon icon={faPlus} size="small" style={{ color: 'var(--ds-icon-primary)' }} />
                      <span className="text-label" style={{ color: 'var(--ds-text-primary)' }}>
                        Start new conversation
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Messages Area - shown when there are messages */}
        {hasMessages && (
          <div className="command-messages">
            {messages.map((message: ChatMessage) => (
              <div key={message.id} className="command-message">
                {message.role === 'user' ? (
                  <div className="command-message-user">
                    <span className="text-body" style={{ color: 'var(--ds-text-default)' }}>
                      {message.content}
                    </span>
                  </div>
                ) : (
                  <div className="command-message-assistant ds-chat-markdown">
                    <ChatBlockRenderer
                      content={message.content}
                      metadata={message.metadata}
                      context="command"
                      onNavigate={(url) => navigate(url)}
                    />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="command-message-assistant">
                <div className="ds-chat-panel-typing-indicator">
                  <div className="ds-chat-panel-typing-dot" />
                  <div className="ds-chat-panel-typing-dot" />
                  <div className="ds-chat-panel-typing-dot" />
                </div>
                {thinkingStatus && (
                  <span className="text-tiny" style={{ color: 'var(--ds-text-tertiary)', marginLeft: 8 }}>
                    {thinkingStatus}
                  </span>
                )}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Centered Composer */}
        <div className={`command-composer-wrapper ${hasMessages ? 'has-messages' : ''}`}>
          <div 
            className={`command-composer ${isFocused ? 'focused' : ''}`}
            onClick={handleComposerClick}
          >
            {/* Text input area */}
            <div className="command-composer-input">
              <textarea
                ref={textareaRef}
                className="command-composer-textarea text-body"
                placeholder={hasMessages ? "Continue the conversation..." : "What would you like to do today?"}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
                rows={1}
              />
            </div>

            {/* Actions row */}
            <div className="command-composer-actions">
              {/* Left side - attachment and microphone icons */}
              <div className="flex items-center gap-1">
                <DSButton
                  variant="tertiary"
                  size="large"
                  iconOnly
                >
                  <Icon
                    icon={faPlus}
                    style={{ color: 'var(--ds-icon-secondary)' }}
                  />
                </DSButton>
                <DSButton
                  variant="tertiary"
                  size="large"
                  iconOnly
                >
                  <Icon
                    icon={faMicrophone}
                    style={{ color: 'var(--ds-icon-secondary)' }}
                  />
                </DSButton>
              </div>

              {/* Right side - send button */}
              <DSButton
                variant="primary"
                size="small"
                iconOnly
                disabled={!inputValue.trim() || isLoading}
                onClick={handleSendMessage}
              >
                <Icon
                  icon={faArrowUp}
                  size="small"
                  style={{ color: 'var(--ds-icon-on-primary)' }}
                />
              </DSButton>
            </div>
          </div>
        </div>
      </div>

      {/* Conversation starters - shown when no messages */}
      {!hasMessages && (
        <div className="command-starters">
          {CONVERSATION_STARTERS.map(({ icon, title, description, message }) => (
            <button
              key={title}
              className="command-starter-card"
              onClick={() => handleShortcutClick(message)}
              disabled={isLoading}
            >
              <div className="command-starter-icon">
                <Icon icon={icon} style={{ color: 'var(--ds-icon-secondary)' }} />
              </div>
              <div className="command-starter-content">
                <span className="text-label-demi" style={{ color: 'var(--ds-text-default)' }}>
                  {title}
                </span>
                <span className="text-tiny" style={{ color: 'var(--ds-text-tertiary)' }}>
                  {description}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@/components/ui/icon';
import { DSButton } from '@/components/ui/ds-button';
import { faPlus, faMicrophone, faArrowUp } from '@/icons';
import { useChatStore, useStreamingChat, type ChatMessage } from '@/chat';

// Shortcut card labels and their initial messages
const SHORTCUT_CARDS = [
  { label: 'Move Money', message: 'I want to move money' },
  { label: 'Balances', message: 'Show me my account balances' },
  { label: 'Accounts', message: 'Show me my accounts' },
  { label: 'Recent', message: 'Show me my recent transactions' },
  { label: 'Upcoming', message: 'What upcoming payments do I have?' },
] as const;

export function Command() {
  const [inputValue, setInputValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();

  // Chat store and streaming
  const { 
    messages, 
    isLoading, 
    thinkingStatus,
    startNewConversation,
    isNavigationComplete,
    markNavigationComplete,
  } = useChatStore();
  const { sendMessage } = useStreamingChat();

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
      markNavigationComplete(lastMessage.id, nav);
      
      if (nav.countdown) {
        // Navigate after 2 second delay for countdown
        setTimeout(() => navigate(nav.url), 2000);
      } else {
        navigate(nav.url);
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

  const hasMessages = messages.length > 0;

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
                  <div className="command-message-assistant">
                    {message.content.split('\n\n').map((paragraph, idx) => (
                      <p key={idx} className="text-body" style={{ color: 'var(--ds-text-default)' }}>
                        {paragraph}
                      </p>
                    ))}
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

      {/* Bottom shortcut cards - hidden when there are messages */}
      {!hasMessages && (
        <div className="command-shortcuts">
          {SHORTCUT_CARDS.map(({ label, message }) => (
            <button 
              key={label} 
              className="command-shortcut-card"
              onClick={() => handleShortcutClick(message)}
              disabled={isLoading}
            >
              <span
                className="text-body"
                style={{ color: 'var(--ds-text-default)' }}
              >
                {label}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@/components/ui/icon';
import { DSButton } from '@/components/ui/ds-button';
import { faPlus, faMicrophone, faArrowUp, faSparkles } from '@/icons';
import { useChatStore, useStreamingChat, type ChatMessage } from '@/chat';
import { ChatBlockRenderer } from '@/components/chat';
import { FeatureCardsBlock } from '@/components/chat/FeatureCardsBlock';

const EXPLORE_INITIAL_MESSAGE = "What products would be great for me?";

export function Explore() {
  const [inputValue, setInputValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [hasAutoSent, setHasAutoSent] = useState(false);
  const [showMoreCards, setShowMoreCards] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const revealSentinelRef = useRef<HTMLDivElement>(null);

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

  // Auto-send the explore query on mount
  useEffect(() => {
    if (messages.length === 0 && !hasAutoSent && !isLoading) {
      setHasAutoSent(true);
      startNewConversation();
      sendMessage(EXPLORE_INITIAL_MESSAGE);
    }
  }, [messages.length, hasAutoSent, isLoading, startNewConversation, sendMessage]);

  // IntersectionObserver for scroll reveal
  useEffect(() => {
    const sentinel = revealSentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShowMoreCards(true);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, showMoreCards]);

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
      
      markNavigationComplete(lastMessage.id, nav);
      
      const doNavigate = () => {
        if (targetUrl) {
          navigate(targetUrl);
        }
      };
      
      if (nav.countdown) {
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
    
    setInputValue('');
    await sendMessage(content);
  };

  // Handle suggested action click
  const handleSuggestedAction = async (action: string) => {
    if (isLoading) return;

    // Special handling for show_more_features
    if (action === 'show_more_features') {
      setShowMoreCards(true);
      // Scroll to reveal the cards
      setTimeout(() => {
        revealSentinelRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      return;
    }

    // For other actions, send as a message
    let messageToSend = action;
    
    // Convert action IDs to natural language
    if (action.startsWith('setup_')) {
      const featureId = action.replace('setup_', '').replace('feature-', '');
      const featureName = featureId.charAt(0).toUpperCase() + featureId.slice(1).replace(/-/g, ' ');
      messageToSend = `Help me set up ${featureName}`;
    } else if (action === 'explain_recommendations') {
      messageToSend = "Why are these features good for me?";
    }

    await sendMessage(messageToSend);
  };

  // Handle keyboard events
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const hasMessages = messages.length > 0;

  // Get the last assistant message with feature cards for the "more cards" reveal
  const lastAssistantMessage = messages.findLast(m => m.role === 'assistant');
  const moreCards = lastAssistantMessage?.metadata?.featureCards?.moreCards;

  return (
    <div className="explore-command-page">
      {/* Main content area */}
      <div className="explore-command-content">
        {/* Gradient background */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{
            zIndex: 0,
            pointerEvents: 'none',
          }}
        >
          {/* Subtle gradient */}
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(180deg, var(--purple-magic-50) 0%, var(--ds-bg-default) 40%)',
              opacity: 0.5,
            }}
          />
          {/* Top fade overlay */}
          <div
            className="absolute top-0 left-0 right-0"
            style={{
              height: 80,
              background: 'linear-gradient(to bottom, var(--ds-bg-default) 0%, transparent 100%)',
            }}
          />
        </div>

        {/* Messages Area */}
        <div className="explore-command-messages">
          {/* Header */}
          <div className="explore-command-header">
            <div className="flex items-center gap-2">
              <Icon icon={faSparkles} style={{ color: 'var(--purple-magic-600)' }} />
              <h1 className="text-title-main" style={{ color: 'var(--ds-text-default)', margin: 0 }}>
                Explore Mercury
              </h1>
            </div>
            <p className="text-body" style={{ color: 'var(--ds-text-secondary)', marginTop: 8 }}>
              Discover features tailored for your business
            </p>
          </div>

          {/* Chat messages */}
          {messages.map((message: ChatMessage) => (
            <div key={message.id} className="explore-command-message">
              {message.role === 'user' ? (
                <div className="explore-command-message-user">
                  <span className="text-body" style={{ color: 'var(--ds-text-default)' }}>
                    {message.content}
                  </span>
                </div>
              ) : (
                <div className="explore-command-message-assistant ds-chat-markdown">
                  <ChatBlockRenderer
                    content={message.content}
                    metadata={message.metadata}
                    context="command"
                    onNavigate={(url) => navigate(url)}
                    onSuggestedAction={handleSuggestedAction}
                    animateFeatureCards={true}
                  />
                </div>
              )}
            </div>
          ))}

          {/* Loading indicator */}
          {isLoading && (
            <div className="explore-command-message-assistant">
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

          {/* Scroll reveal sentinel and more cards */}
          {moreCards && moreCards.length > 0 && (
            <>
              <div 
                ref={revealSentinelRef}
                className="explore-reveal-sentinel"
                style={{ height: 1, margin: '24px 0' }}
              />
              
              {showMoreCards && (
                <div className="explore-more-cards">
                  <h2 
                    className="text-title-secondary" 
                    style={{ color: 'var(--ds-text-default)', margin: '0 0 16px 0' }}
                  >
                    More from Mercury
                  </h2>
                  <FeatureCardsBlock
                    data={{ cards: moreCards }}
                    context="command"
                    onNavigate={(url) => navigate(url)}
                    animate={true}
                    animationOffset={6}  // Start after the first 6 cards
                  />
                </div>
              )}
            </>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Composer - anchored at bottom */}
        <div className="explore-command-composer-wrapper">
          <div 
            className={`command-composer ${isFocused ? 'focused' : ''}`}
            onClick={handleComposerClick}
          >
            <div className="command-composer-input">
              <textarea
                ref={textareaRef}
                className="command-composer-textarea text-body"
                placeholder="Ask about features, pricing, or how to get started..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
                rows={1}
              />
            </div>

            <div className="command-composer-actions">
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
    </div>
  );
}

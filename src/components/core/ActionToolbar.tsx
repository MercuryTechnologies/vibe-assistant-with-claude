import { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Icon } from '@/components/ui/icon';
import { faArrowRightArrowLeft, faEllipsis, faXmark, faMagnifyingGlass, faClock, faWindowMaximize, faChartLine, faCreditCard, faArrowUpFromLine, faArrowUp, faChevronLeft, faPlus } from '@/icons';
import { cn } from '@/lib/utils';
import { DSButton } from '@/components/ui/ds-button';

// Suggestion types
type SuggestionType = 'action' | 'page';

interface Suggestion {
  icon: typeof faWindowMaximize;
  label: string;
  type: SuggestionType;
  path: string;
  description?: string;
}

// All available suggestions for the command palette search
const SUGGESTIONS: Suggestion[] = [
  // Quick actions (shown at top)
  { icon: faChartLine, label: 'How is my cashflow this quarter', type: 'action', path: '/dashboard', description: 'Side Panel' },
  { icon: faCreditCard, label: 'Create a recurring payment', type: 'action', path: '/cards', description: 'Full Page' },
  // Main navigation
  { icon: faWindowMaximize, label: 'Dashboard', type: 'page', path: '/dashboard' },
  { icon: faWindowMaximize, label: 'Transactions', type: 'page', path: '/transactions' },
  { icon: faWindowMaximize, label: 'Cards', type: 'page', path: '/cards' },
  { icon: faWindowMaximize, label: 'Tasks', type: 'page', path: '/tasks' },
  // Payments section
  { icon: faWindowMaximize, label: 'Recipients', type: 'page', path: '/payments/recipients' },
  { icon: faWindowMaximize, label: 'Bill Pay', type: 'page', path: '/workflows/bill-pay' },
  // Accounts section
  { icon: faWindowMaximize, label: 'Accounts', type: 'page', path: '/accounts' },
  { icon: faWindowMaximize, label: 'Accounting', type: 'page', path: '/accounting' },
];

// Sample recent recipients data for the send button hover menu
const RECENT_RECIPIENTS = [
  { name: 'Acme Corp', date: 'Jan 1' },
  { name: 'Beta LLC', date: 'Feb 15' },
  { name: 'Gamma Inc', date: 'Mar 20' },
  { name: 'Delta Co', date: 'Apr 5' },
  { name: 'Epsilon Ltd', date: 'May 30' },
  { name: 'Zeta Group', date: 'Jun 12' },
];

// Floating action toolbar component
export function ActionToolbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const isCommandPage = location.pathname === '/command';
  const [inputValue, setInputValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isSendHovered, setIsSendHovered] = useState(false);
  const [hoveredRecipientIndex, setHoveredRecipientIndex] = useState<number | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isRecurringPaymentOpen, setIsRecurringPaymentOpen] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [recurringChatInput, setRecurringChatInput] = useState('');
  const toolbarRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelInputRef = useRef<HTMLInputElement>(null);

  // Filter suggestions based on input
  const filteredSuggestions = useMemo(() => {
    if (!inputValue) return SUGGESTIONS;
    const searchTerm = inputValue.toLowerCase();
    return SUGGESTIONS.filter(s => 
      s.label.toLowerCase().includes(searchTerm) ||
      s.path.toLowerCase().includes(searchTerm) ||
      (s.description && s.description.toLowerCase().includes(searchTerm))
    );
  }, [inputValue]);

  // Reset selected index when filtered results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredSuggestions.length]);

  // Handle clicking outside to blur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (toolbarRef.current && !toolbarRef.current.contains(event.target as Node)) {
        if (inputRef.current) {
          inputRef.current.blur();
        }
        setIsFocused(false);
      }
    };

    if (isFocused) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isFocused]);


  useEffect(() => {
    if (isRecurringPaymentOpen) {
      document.body.classList.add('ds-recurring-open');
    } else {
      document.body.classList.remove('ds-recurring-open');
    }
    return () => {
      document.body.classList.remove('ds-recurring-open');
    };
  }, [isRecurringPaymentOpen]);

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleClose = () => {
    setIsFocused(false);
    setInputValue('');
    if (inputRef.current) {
      inputRef.current.blur();
    }
  };

  // Navigate to selected page
  const handleNavigate = (path: string) => {
    navigate(path);
    handleClose();
  };

  // Handle cash flow action - open panel instead of navigating
  const handleCashFlowAction = () => {
    setIsPanelOpen(true);
    setIsFocused(false);
    setInputValue('');
    if (inputRef.current) {
      inputRef.current.blur();
    }
  };

  // Close panel and reset toolbar to default state
  const handleClosePanel = () => {
    setIsPanelOpen(false);
    setIsFocused(false);
    setInputValue('');
    if (inputRef.current) {
      inputRef.current.blur();
    }
  };

  const handleOpenRecurringPayment = () => {
    setIsRecurringPaymentOpen(true);
    setIsPanelOpen(false);
    setIsFocused(false);
    setInputValue('');
    if (inputRef.current) {
      inputRef.current.blur();
    }
    // Prevent navigation
    if (window.event) {
      window.event.preventDefault();
    }
  };

  const handleCloseRecurringPayment = () => {
    setIsRecurringPaymentOpen(false);
    setIsFocused(false);
    setInputValue('');
    if (inputRef.current) {
      inputRef.current.blur();
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isFocused || filteredSuggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < filteredSuggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : filteredSuggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredSuggestions[selectedIndex]) {
          const suggestion = filteredSuggestions[selectedIndex];
          if (suggestion.label === 'How is my cashflow this quarter') {
            handleCashFlowAction();
            break;
          }
          if (suggestion.label === 'Create a recurring payment') {
            handleOpenRecurringPayment();
            break;
          }
          handleNavigate(suggestion.path);
        }
        break;
      case 'Escape':
        e.preventDefault();
        if (isRecurringPaymentOpen) {
          handleCloseRecurringPayment();
        } else if (isPanelOpen) {
          handleClosePanel();
        } else {
          handleClose();
        }
        break;
    }
  };

  return (
    <>
      {isRecurringPaymentOpen && (
        <div className="ds-recurring-overlay">
          <div className="ds-recurring-chat">
            <div className="ds-recurring-chat-header">
              <button className="ds-recurring-back-btn" onClick={handleCloseRecurringPayment}>
                <Icon icon={faChevronLeft} size="small" style={{ color: 'var(--ds-icon-secondary)' }} />
                <div className="flex flex-col">
                  <span className="text-body-demi" style={{ color: 'var(--ds-text-default)' }}>New Conversation</span>
                  <span className="text-label" style={{ color: 'var(--ds-text-tertiary)' }}>Mercury AI</span>
                </div>
              </button>
              <div className="flex items-center gap-2">
                <DSButton variant="tertiary" size="small" iconOnly aria-label="New conversation">
                  <Icon icon={faPlus} size="small" style={{ color: 'var(--ds-icon-secondary)' }} />
                </DSButton>
                <DSButton variant="tertiary" size="small" iconOnly aria-label="History">
                  <Icon icon={faClock} size="small" style={{ color: 'var(--ds-icon-secondary)' }} />
                </DSButton>
              </div>
            </div>

            <div className="ds-recurring-chat-container">
              <div className="ds-recurring-chat-body">
                <div className="ds-recurring-message-bubble">
                <span className="text-body" style={{ color: 'var(--ds-text-default)' }}>
                  set up a recurring payment for my rent, end of month
                </span>
              </div>
              <div className="ds-recurring-ai-response">
                <div className="ds-recurring-chat-copy">
                  <p className="text-body" style={{ color: 'var(--ds-text-default)' }}>
                    Scheduled payments are perfect for handling any regular payments you make! Setting them up is easy: just go to Move Money → Send, then toggle on "Repeat this payment" to pick your frequency and end date. Your payments will process at 9am EST each time.
                  </p>
                  <p className="text-body" style={{ color: 'var(--ds-text-default)' }}>
                    For non-USD wires, keep in mind that exchange rates are applied when the payment processes (not when you schedule it), plus there's a 1% fee. You can view and manage all your scheduled payments anytime from the Scheduled tab.
                  </p>
                  <p className="text-body" style={{ color: 'var(--ds-text-default)' }}>
                    I can help you initiate a schedule payment. "Confirm agent help" "Gather relevant details"
                  </p>
                </div>
                <div className="ds-recurring-chat-note">
                  <span className="text-tiny" style={{ color: 'var(--ds-text-secondary)' }}>
                    * Agent initiated to "Set up recurring payment"
                  </span>
                </div>
                <p className="text-body" style={{ color: 'var(--ds-text-default)' }}>
                  I can help you set up the payment, just let me know the amount, recipient, and how often you'd like it to repeat, and I can walk you through it.
                </p>
                </div>
              </div>

              <div className="ds-recurring-chat-footer">
                <div className="ds-chat-composer">
                  <div className="ds-chat-composer-input">
                    <input
                      type="text"
                      className="ds-chat-composer-field"
                      placeholder="Ask anything"
                      value={recurringChatInput}
                      onChange={(e) => setRecurringChatInput(e.target.value)}
                    />
                  </div>
                  <div className="ds-chat-composer-actions">
                    <DSButton
                      variant="tertiary"
                      size="large"
                      iconOnly
                      aria-label="Upload"
                    >
                      <Icon icon={faArrowUpFromLine} style={{ color: 'var(--ds-icon-secondary)' }} />
                    </DSButton>
                    <DSButton
                      variant="primary"
                      size="small"
                      iconOnly
                      aria-label="Send"
                      disabled={!recurringChatInput.trim()}
                    >
                      <Icon icon={faArrowUp} size="small" style={{ color: 'var(--ds-icon-on-primary)' }} />
                    </DSButton>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {isPanelOpen && (
        <div className="ds-insights-panel">
          {/* Header */}
          <div className="ds-insights-panel-header">
            <div className="flex flex-col gap-1">
              <span className="text-title-secondary" style={{ color: 'var(--ds-text-title)' }}>
                Card Spend Insights
              </span>
              <span className="text-label" style={{ color: 'var(--ds-text-secondary)' }}>
                Mercury Assistant
              </span>
            </div>
            <div className="flex items-center gap-2">
              <DSButton
                className="ds-insights-panel-icon-btn"
                variant="tertiary"
                size="small"
                iconOnly
                aria-label="History"
                onClick={() => {}}
              >
                <Icon 
                  icon={faClock} 
                  size="small"
                  style={{ color: 'var(--ds-icon-secondary)' }} 
                />
              </DSButton>
              <DSButton
                className="ds-insights-panel-icon-btn"
                variant="tertiary"
                size="small"
                iconOnly
                aria-label="Minimize"
                onClick={handleClosePanel}
              >
                <Icon 
                  icon={faXmark} 
                  size="small"
                  style={{ color: 'var(--ds-icon-secondary)' }} 
                />
              </DSButton>
            </div>
          </div>

          {/* Chat Content Area */}
          <div className="ds-insights-panel-content">
            {/* User Message */}
            <div className="ds-insights-user-message">
              <span className="text-body" style={{ color: 'var(--ds-text-default)' }}>
                Show me my monthly card spend
              </span>
            </div>

            {/* Typing Indicator */}
            <div className="ds-insights-typing-indicator">
              <div className="ds-insights-typing-dot" />
              <div className="ds-insights-typing-dot" />
              <div className="ds-insights-typing-dot" />
            </div>
          </div>

          {/* Message Input Area */}
          <div className="ds-insights-panel-input-area">
            <div className="ds-chat-composer">
              <div className="ds-chat-composer-input">
                <input
                  ref={panelInputRef}
                  type="text"
                  className="ds-chat-composer-field"
                  placeholder="Ask anything"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                />
              </div>
              <div className="ds-chat-composer-actions">
                <DSButton
                  variant="tertiary"
                  size="large"
                  iconOnly
                  aria-label="Upload"
                >
                  <Icon icon={faArrowUpFromLine} style={{ color: 'var(--ds-icon-secondary)' }} />
                </DSButton>
                <DSButton
                  variant="primary"
                  size="small"
                  iconOnly
                  aria-label="Send"
                  disabled={!messageInput.trim()}
                >
                  <Icon icon={faArrowUp} size="small" style={{ color: 'var(--ds-icon-on-primary)' }} />
                </DSButton>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className={cn('ds-action-container', isCommandPage && 'hidden-on-command')}>
        {!isPanelOpen && (
          <div 
            ref={toolbarRef}
            className={cn('ds-action-toolbar', isFocused && 'focused')} 
            style={{ width: isFocused ? 672 : 484 }}
          >
            {/* Expanded Results Area - Only visible when focused */}
            {isFocused && (
              <div className="ds-action-results">
                {filteredSuggestions.length > 0 ? (
                  filteredSuggestions.map((suggestion, index) => (
                    <div 
                      key={`${suggestion.type}-${suggestion.label}`}
                      className={cn(
                        'ds-action-result-item',
                        index === selectedIndex && 'selected',
                        suggestion.type === 'action' && 'action-item'
                      )}
                      onMouseEnter={() => setSelectedIndex(index)}
                      onClick={() => {
                        if (suggestion.label === 'How is my cashflow this quarter') {
                          handleCashFlowAction();
                          return;
                        }
                        if (suggestion.label === 'Create a recurring payment') {
                          handleOpenRecurringPayment();
                          return;
                        }
                        handleNavigate(suggestion.path);
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <div className="ds-action-result-icon">
                          <Icon 
                            icon={suggestion.icon} 
                            size="small"
                            style={{ 
                              color: suggestion.type === 'action' 
                                ? 'var(--purple-magic-600)' 
                                : 'var(--ds-icon-secondary)' 
                            }} 
                          />
                        </div>
                        <span 
                          className="text-body"
                          style={{ color: 'var(--ds-text-default)' }}
                        >
                          {suggestion.label}
                        </span>
                      </div>
                      <span 
                        className="text-label"
                        style={{ color: 'var(--ds-text-tertiary)' }}
                      >
                        {suggestion.type === 'action' ? suggestion.description : suggestion.path}
                      </span>
                    </div>
                  ))
                ) : (
                  <div 
                    className="flex items-center justify-center py-4"
                    style={{ color: 'var(--ds-text-tertiary)' }}
                  >
                    <span className="text-body">No pages found</span>
                  </div>
                )}
              </div>
            )}

            {/* Composer Input */}
            <div className={cn('ds-action-composer', isFocused && 'focused')}>
              {/* Search Icon - Only visible when focused */}
              {isFocused && (
                <div className="ds-action-search-icon">
                  <Icon 
                    icon={faMagnifyingGlass} 
                    size="small"
                    style={{ color: 'var(--ds-icon-primary)' }} 
                  />
                </div>
              )}
              
              <input
                ref={inputRef}
                type="text"
                className="ds-action-composer-input"
                placeholder="Ask anything..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onFocus={handleFocus}
                onKeyDown={handleKeyDown}
              />

              {/* Right side buttons when focused */}
              {isFocused && (
                <div className="flex items-center gap-1">
                  <DSButton variant="tertiary" size="small" iconOnly>
                    <Icon 
                      icon={faClock} 
                      size="small"
                      style={{ color: 'var(--ds-icon-secondary)' }} 
                    />
                  </DSButton>
                  <button 
                    className="ds-action-close-btn"
                    onClick={handleClose}
                  >
                    <Icon 
                      icon={faXmark} 
                      style={{ color: 'var(--ds-icon-secondary)' }} 
                    />
                  </button>
                </div>
              )}
            </div>

            {/* Action Buttons - Only visible when NOT focused */}
            {!isFocused && (
              <div className="flex items-center gap-2">
                {/* Send Button with Hover Menu */}
                <div 
                  className="send-button-container"
                  onMouseEnter={() => setIsSendHovered(true)}
                  onMouseLeave={() => {
                    setIsSendHovered(false);
                    setHoveredRecipientIndex(null);
                  }}
                >
                  {/* Hover Menu */}
                  {isSendHovered && (
                    <div className="send-hover-menu">
                      <div className="send-hover-menu-header">
                        <span 
                          className="text-label"
                          style={{ color: 'var(--ds-text-secondary)' }}
                        >
                          Recently paid recipients
                        </span>
                      </div>
                      {RECENT_RECIPIENTS.map((recipient, index) => (
                        <div
                          key={recipient.name}
                          className={cn(
                            'send-hover-menu-item',
                            hoveredRecipientIndex === index && 'hovered'
                          )}
                          onMouseEnter={() => setHoveredRecipientIndex(index)}
                          onMouseLeave={() => setHoveredRecipientIndex(null)}
                        >
                          <span 
                            className="text-body"
                            style={{ 
                              color: hoveredRecipientIndex === index 
                                ? 'var(--ds-text-emphasized)' 
                                : 'var(--ds-text-default)' 
                            }}
                          >
                            {recipient.name}
                          </span>
                          <span 
                            className="text-body"
                            style={{ 
                              color: hoveredRecipientIndex === index 
                                ? 'var(--ds-text-link)' 
                                : 'var(--ds-text-default)' 
                            }}
                          >
                            {hoveredRecipientIndex === index ? 'Pay' : recipient.date}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <DSButton 
                    variant="primary" 
                    size="large"
                  >
                    Send
                  </DSButton>
                </div>

                {/* Transfer Button */}
                <DSButton variant="secondary" size="large" iconOnly>
                  <Icon
                    icon={faArrowRightArrowLeft}
                    size="small"
                    style={{ color: 'var(--ds-icon-secondary)' }}
                  />
                </DSButton>

                {/* More Options Button */}
                <DSButton variant="secondary" size="large" iconOnly>
                  <Icon
                    icon={faEllipsis}
                    style={{ color: 'var(--ds-icon-secondary)' }}
                  />
                </DSButton>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

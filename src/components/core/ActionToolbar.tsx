import { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Icon } from '@/components/ui/icon';
import { faArrowRightArrowLeft, faEllipsis, faXmark, faMagnifyingGlass, faClock, faWindowMaximize, faChartLine, faCreditCard, faArrowUpFromLine, faArrowUp, faChevronLeft, faPlus, faUpRightAndDownLeftFromCenter, faDownLeftAndUpRightToCenter, faUser } from '@/icons';
import { cn } from '@/lib/utils';
import { DSButton } from '@/components/ui/ds-button';
import { DSAvatar } from '@/components/ui/ds-avatar';
import { useRecipients } from '@/hooks';

// Suggestion types
type SuggestionType = 'action' | 'page' | 'recipient' | 'card';

interface Suggestion {
  icon: typeof faWindowMaximize;
  label: string;
  type: SuggestionType;
  path: string;
  description?: string;
  recipientId?: string;
  cardId?: string;
}

// Card data for search (matches Cards.tsx)
interface CardData {
  id: string;
  cardholder: string;
  card: string;
  nickname?: string;
}

const CARDS_DATA: CardData[] = [
  { id: '1', cardholder: 'Sarah Chen', card: '•••• 4521', nickname: 'Office Supplies' },
  { id: '2', cardholder: 'Marcus Johnson', card: '•••• 8934', nickname: 'Ad Spend' },
  { id: '3', cardholder: 'Emily Rodriguez', card: '•••• 2156', nickname: 'Cloud Services' },
  { id: '4', cardholder: 'David Kim', card: '•••• 7743' },
  { id: '5', cardholder: 'Amanda Foster', card: '•••• 3367', nickname: 'Team Expenses' },
  { id: '6', cardholder: 'James Wilson', card: '•••• 9012', nickname: 'Travel & Entertainment' },
  { id: '7', cardholder: 'Lisa Park', card: '•••• 5589' },
  { id: '8', cardholder: 'Michael Torres', card: '•••• 1234', nickname: 'Software Licenses' },
];

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
  // Individual accounts
  { icon: faWindowMaximize, label: 'Treasury', type: 'page', path: '/accounts/treasury', description: 'Account' },
  { icon: faWindowMaximize, label: 'Ops / Payroll', type: 'page', path: '/accounts/ops-payroll', description: 'Account' },
  { icon: faWindowMaximize, label: 'AP', type: 'page', path: '/accounts/ap', description: 'Account' },
  { icon: faWindowMaximize, label: 'AR', type: 'page', path: '/accounts/ar', description: 'Account' },
  { icon: faWindowMaximize, label: 'Checking ••0297', type: 'page', path: '/accounts/checking-0297', description: 'Account' },
  { icon: faWindowMaximize, label: 'Savings ••7658', type: 'page', path: '/accounts/savings-7658', description: 'Account' },
];


// Helper to format date for display
function formatRecipientDate(dateString?: string | null): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Floating action toolbar component
export function ActionToolbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { recipients } = useRecipients();
  const isCommandPage = location.pathname === '/command';
  const [inputValue, setInputValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isSendHovered, setIsSendHovered] = useState(false);
  const [hoveredRecipientIndex, setHoveredRecipientIndex] = useState<number | null>(null);
  const [panelType, setPanelType] = useState<'cashflow' | 'recurring' | null>(null);
  const [isPanelFullScreen, setIsPanelFullScreen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const toolbarRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Panel resize state
  const [panelWidth, setPanelWidth] = useState(400);
  const [isResizing, setIsResizing] = useState(false);
  const resizeStartX = useRef(0);
  const resizeStartWidth = useRef(400);

  // Filter suggestions based on input (includes pages, actions, recipients, and cards)
  const filteredSuggestions = useMemo(() => {
    if (!inputValue) return SUGGESTIONS;
    const searchTerm = inputValue.toLowerCase();
    
    // Filter page/action suggestions
    const filteredPages = SUGGESTIONS.filter(s => 
      s.label.toLowerCase().includes(searchTerm) ||
      s.path.toLowerCase().includes(searchTerm) ||
      (s.description && s.description.toLowerCase().includes(searchTerm))
    );
    
    // Filter recipients and convert to suggestion format
    const filteredRecipientSuggestions: Suggestion[] = recipients
      .filter(r => r.name.toLowerCase().includes(searchTerm))
      .map(r => ({
        icon: faUser,
        label: r.name,
        type: 'recipient' as const,
        path: `/payments/recipients?id=${r.id}`,
        description: 'Recipient',
        recipientId: r.id,
      }));
    
    // Filter cards by cardholder name, card number, or nickname
    const filteredCardSuggestions: Suggestion[] = CARDS_DATA
      .filter(c => 
        c.cardholder.toLowerCase().includes(searchTerm) ||
        c.card.toLowerCase().includes(searchTerm) ||
        (c.nickname && c.nickname.toLowerCase().includes(searchTerm))
      )
      .map(c => ({
        icon: faCreditCard,
        label: c.nickname ? `${c.cardholder} · ${c.nickname}` : c.cardholder,
        type: 'card' as const,
        path: `/cards?id=${c.id}`,
        description: `Card ${c.card}`,
        cardId: c.id,
      }));
    
    return [...filteredPages, ...filteredRecipientSuggestions, ...filteredCardSuggestions];
  }, [inputValue, recipients]);

  // Get recent recipients for send menu (sorted by lastPaid date)
  const recentRecipients = useMemo(() => {
    return [...recipients]
      .filter(r => r.lastPaid)
      .sort((a, b) => {
        const dateA = a.lastPaid ? new Date(a.lastPaid).getTime() : 0;
        const dateB = b.lastPaid ? new Date(b.lastPaid).getTime() : 0;
        return dateB - dateA; // Most recent first
      })
      .slice(0, 6); // Show top 6 recent recipients
  }, [recipients]);

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

  // Handle Cmd+K keyboard shortcut to focus the toolbar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isK = e.key.toLowerCase() === 'k';
      if (!isK) return;
      if (!(e.metaKey || e.ctrlKey)) return;

      e.preventDefault();
      e.stopPropagation();
      
      // Close any open panels first
      setPanelType(null);
      // Focus the toolbar
      setIsFocused(true);
      setInputValue('');
      setSelectedIndex(0);
      // Focus the input after a brief delay to ensure DOM is ready
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 50);
    };

    // Use capture phase to ensure we get the event before other handlers
    window.addEventListener('keydown', handleKeyDown, true);
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, []);

  // Handle Escape key to close panel
  useEffect(() => {
    if (!panelType) return;

    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setPanelType(null);
        setIsPanelFullScreen(false);
        setPanelWidth(400);
        setChatInput('');
      }
    };

    window.addEventListener('keydown', handleEscapeKey);
    return () => {
      window.removeEventListener('keydown', handleEscapeKey);
    };
  }, [panelType]);

  useEffect(() => {
    if (panelType && isPanelFullScreen) {
      document.body.classList.add('ds-panel-open');
    } else {
      document.body.classList.remove('ds-panel-open');
    }
    return () => {
      document.body.classList.remove('ds-panel-open');
    };
  }, [panelType, isPanelFullScreen]);

  // Handle panel resize
  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    resizeStartX.current = e.clientX;
    resizeStartWidth.current = panelWidth;
    document.body.classList.add('ds-panel-resizing');
  };

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const viewportWidth = window.innerWidth;
      // Calculate new width based on drag (dragging left increases width)
      const deltaX = resizeStartX.current - e.clientX;
      let newWidth = resizeStartWidth.current + deltaX;
      
      // Clamp minimum width to 300px
      newWidth = Math.max(300, newWidth);
      
      // Check if we should snap to full screen (60% of viewport)
      const fullScreenThreshold = viewportWidth * 0.6;
      
      if (newWidth >= fullScreenThreshold) {
        setIsPanelFullScreen(true);
      } else {
        setIsPanelFullScreen(false);
        setPanelWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.classList.remove('ds-panel-resizing');
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.classList.remove('ds-panel-resizing');
    };
  }, [isResizing, panelWidth]);

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
    setPanelType('cashflow');
    setIsFocused(false);
    setInputValue('');
    setChatInput('');
    if (inputRef.current) {
      inputRef.current.blur();
    }
  };

  const handleOpenRecurringPayment = () => {
    setPanelType('recurring');
    setIsFocused(false);
    setInputValue('');
    setChatInput('');
    if (inputRef.current) {
      inputRef.current.blur();
    }
  };

  // Close panel and reset toolbar to default state
  const handleClosePanel = () => {
    setPanelType(null);
    setIsFocused(false);
    setInputValue('');
    setIsPanelFullScreen(false);
    setPanelWidth(400);
    setChatInput('');
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
        if (panelType) {
          handleClosePanel();
        } else {
          handleClose();
        }
        break;
    }
  };

  // Panel title based on type
  const panelTitle = panelType === 'cashflow' ? 'Card Spend Insights' : 'Set up Recurring payment';

  return (
    <>
      {panelType && (
        <div 
          className={cn('ds-chat-panel-overlay', !isPanelFullScreen && 'ds-chat-panel-overlay-panel')}
          style={{ 
            width: isPanelFullScreen ? undefined : panelWidth,
            transition: isResizing ? 'none' : 'width 200ms ease-out'
          }}
        >
          {/* Resize Handle - only visible when not full screen */}
          {!isPanelFullScreen && (
            <div 
              className={cn('ds-chat-panel-resize-handle', isResizing && 'active')}
              onMouseDown={handleResizeStart}
            />
          )}
          <div className={cn('ds-chat-panel', !isPanelFullScreen && 'ds-chat-panel-side')}>
            <div className="ds-chat-panel-header">
              <button className="ds-chat-panel-back-btn" onClick={handleClosePanel}>
                <Icon icon={faChevronLeft} size="small" style={{ color: 'var(--ds-icon-secondary)' }} />
                <span className="text-body-demi" style={{ color: 'var(--ds-text-default)' }}>{panelTitle}</span>
              </button>
              <div className="flex items-center gap-2">
                <DSButton variant="tertiary" size="small" iconOnly aria-label="New conversation">
                  <Icon icon={faPlus} size="small" style={{ color: 'var(--ds-icon-secondary)' }} />
                </DSButton>
                <DSButton variant="tertiary" size="small" iconOnly aria-label="History">
                  <Icon icon={faClock} size="small" style={{ color: 'var(--ds-icon-secondary)' }} />
                </DSButton>
                <DSButton 
                  variant="tertiary" 
                  size="small" 
                  iconOnly 
                  aria-label={isPanelFullScreen ? "Minimize to panel" : "Expand to full screen"}
                  onClick={() => setIsPanelFullScreen(!isPanelFullScreen)}
                >
                  <Icon 
                    icon={isPanelFullScreen ? faDownLeftAndUpRightToCenter : faUpRightAndDownLeftFromCenter} 
                    size="small" 
                    style={{ color: 'var(--ds-icon-secondary)' }} 
                  />
                </DSButton>
              </div>
            </div>

            <div className="ds-chat-panel-container">
              <div className="ds-chat-panel-body">
                {panelType === 'cashflow' ? (
                  <>
                    <div className="ds-chat-panel-message-bubble">
                      <span className="text-body" style={{ color: 'var(--ds-text-default)' }}>
                        How is my cashflow this quarter?
                      </span>
                    </div>
                    <div className="ds-chat-panel-ai-response">
                      <div className="ds-chat-panel-typing-indicator">
                        <div className="ds-chat-panel-typing-dot" />
                        <div className="ds-chat-panel-typing-dot" />
                        <div className="ds-chat-panel-typing-dot" />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="ds-chat-panel-message-bubble">
                      <span className="text-body" style={{ color: 'var(--ds-text-default)' }}>
                        set up a recurring payment for my rent, end of month
                      </span>
                    </div>
                    <div className="ds-chat-panel-ai-response">
                      <div className="ds-chat-panel-copy">
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
                      <div className="ds-chat-panel-note">
                        <span className="text-tiny" style={{ color: 'var(--ds-text-secondary)' }}>
                          * Agent initiated to "Set up recurring payment"
                        </span>
                      </div>
                      <p className="text-body" style={{ color: 'var(--ds-text-default)' }}>
                        I can help you set up the payment, just let me know the amount, recipient, and how often you'd like it to repeat, and I can walk you through it.
                      </p>
                    </div>
                  </>
                )}
              </div>

              <div className="ds-chat-panel-footer">
                <div className="ds-chat-composer">
                  <div className="ds-chat-composer-input">
                    <input
                      type="text"
                      className="ds-chat-composer-field"
                      placeholder="Ask anything"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
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
                      disabled={!chatInput.trim()}
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
      <div className={cn('ds-action-container', isCommandPage && 'hidden-on-command')}>
        {!panelType && (
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
                      key={`${suggestion.type}-${suggestion.label}-${suggestion.recipientId || suggestion.cardId || ''}`}
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
                        {suggestion.type === 'recipient' ? (
                          <DSAvatar type="trx" name={suggestion.label} size="small" />
                        ) : (
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
                        )}
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
                        {suggestion.description || suggestion.path}
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
                      {recentRecipients.length > 0 ? (
                        recentRecipients.map((recipient, index) => (
                          <div
                            key={recipient.id}
                            className={cn(
                              'send-hover-menu-item',
                              hoveredRecipientIndex === index && 'hovered'
                            )}
                            onMouseEnter={() => setHoveredRecipientIndex(index)}
                            onMouseLeave={() => setHoveredRecipientIndex(null)}
                          >
                            <div className="flex items-center gap-2">
                              <DSAvatar type="trx" name={recipient.name} size="small" />
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
                            </div>
                            <span 
                              className="text-body"
                              style={{ 
                                color: hoveredRecipientIndex === index 
                                  ? 'var(--ds-text-link)' 
                                  : 'var(--ds-text-default)' 
                              }}
                            >
                              {hoveredRecipientIndex === index ? 'Pay' : formatRecipientDate(recipient.lastPaid)}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div 
                          className="send-hover-menu-empty"
                          style={{ color: 'var(--ds-text-tertiary)' }}
                        >
                          <span className="text-body">No recipients found</span>
                        </div>
                      )}
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

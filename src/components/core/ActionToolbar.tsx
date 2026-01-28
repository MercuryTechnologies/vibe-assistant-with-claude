import { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Icon } from '@/components/ui/icon';
import { faArrowRightArrowLeft, faEllipsis, faXmark, faMagnifyingGlass, faClock, faWindowMaximize, faCreditCard, faArrowUpFromLine, faArrowUp, faChevronLeft, faPlus, faUpRightAndDownLeftFromCenter, faDownLeftAndUpRightToCenter, faUser, faPaperPlane, faFileText, faCalendar, faSparkles, faHeadset, faSnowflake, faChartLine, faPencil, faUsers, faArrowTrendUp, faFileInvoiceDollar, faCircleQuestion } from '@/icons';
import { cn } from '@/lib/utils';
import { DSButton } from '@/components/ui/ds-button';
import { DSAvatar } from '@/components/ui/ds-avatar';
import { useRecipients, useMobileLayout } from '@/hooks';
import { useChatStore, useStreamingChat, type ChatMessage } from '@/chat';
import { ChatBlockRenderer } from '@/components/chat';

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

// Navigation suggestions (shown at top when no search)
const NAV_SUGGESTIONS: Suggestion[] = [
  { icon: faWindowMaximize, label: 'Dashboard', type: 'page', path: '/dashboard' },
  { icon: faWindowMaximize, label: 'Transactions', type: 'page', path: '/transactions' },
  { icon: faWindowMaximize, label: 'Cards', type: 'page', path: '/cards' },
];

// Contextual AI suggestions based on current page
const CONTEXTUAL_SUGGESTIONS: Record<string, Suggestion[]> = {
  // Transactions page
  '/transactions': [
    { icon: faMagnifyingGlass, label: 'Find payments over $5,000 last month', type: 'action', path: '', description: 'AI' },
    { icon: faFileText, label: 'Export transactions for Q4 2025', type: 'action', path: '', description: 'AI' },
    { icon: faCircleQuestion, label: 'Show me transactions missing receipts', type: 'action', path: '', description: 'AI' },
    { icon: faArrowTrendUp, label: 'Which vendor did we spend the most with?', type: 'action', path: '', description: 'AI' },
  ],
  
  // Cards page
  '/cards': [
    { icon: faCreditCard, label: 'Issue a new virtual card for Sarah', type: 'action', path: '', description: 'AI' },
    { icon: faSnowflake, label: 'Freeze the Ad Spend card', type: 'action', path: '', description: 'AI' },
    { icon: faChartLine, label: 'Which cards are over 80% of their limit?', type: 'action', path: '', description: 'AI' },
    { icon: faPencil, label: 'Increase the Cloud Services card limit to $10,000', type: 'action', path: '', description: 'AI' },
  ],
  
  // Recipients page
  '/payments/recipients': [
    { icon: faPaperPlane, label: 'Send $5,000 to AWS', type: 'action', path: '', description: 'AI' },
    { icon: faUser, label: 'Add a new recipient for Acme Corp', type: 'action', path: '', description: 'AI' },
    { icon: faClock, label: 'Who did we pay last week?', type: 'action', path: '', description: 'AI' },
    { icon: faCircleQuestion, label: 'Show recipients we haven\'t paid in 90 days', type: 'action', path: '', description: 'AI' },
  ],
  
  // Accounts page
  '/accounts': [
    { icon: faChartLine, label: 'What\'s my total balance across all accounts?', type: 'action', path: '', description: 'AI' },
    { icon: faArrowTrendUp, label: 'How much interest has Treasury earned this year?', type: 'action', path: '', description: 'AI' },
    { icon: faArrowRightArrowLeft, label: 'Transfer $10,000 from Operating to Treasury', type: 'action', path: '', description: 'AI' },
    { icon: faFileText, label: 'Show me January bank statements', type: 'action', path: '', description: 'AI' },
  ],
  
  // Treasury account
  '/accounts/treasury': [
    { icon: faArrowTrendUp, label: 'What\'s my current APY on Treasury?', type: 'action', path: '', description: 'AI' },
    { icon: faChartLine, label: 'How much interest did I earn this month?', type: 'action', path: '', description: 'AI' },
    { icon: faArrowRightArrowLeft, label: 'Transfer $50,000 to Operating for payroll', type: 'action', path: '', description: 'AI' },
    { icon: faCalendar, label: 'Show Treasury transaction history for last 30 days', type: 'action', path: '', description: 'AI' },
  ],
  
  // Team/Employees page
  '/team': [
    { icon: faUser, label: 'Invite a new team member', type: 'action', path: '', description: 'AI' },
    { icon: faCreditCard, label: 'Issue a card to Marcus with $2,000 limit', type: 'action', path: '', description: 'AI' },
    { icon: faUsers, label: 'Who has admin access?', type: 'action', path: '', description: 'AI' },
    { icon: faCircleQuestion, label: 'Which employees have missing receipts?', type: 'action', path: '', description: 'AI' },
  ],
  
  // Bill Pay page
  '/workflows/bill-pay': [
    { icon: faArrowUpFromLine, label: 'Upload and pay this invoice', type: 'action', path: '', description: 'AI' },
    { icon: faCalendar, label: 'Schedule a payment for next Friday', type: 'action', path: '', description: 'AI' },
    { icon: faClock, label: 'What bills are due this week?', type: 'action', path: '', description: 'AI' },
    { icon: faFileInvoiceDollar, label: 'Show me pending bills over $1,000', type: 'action', path: '', description: 'AI' },
  ],
  
  // Invoicing page
  '/invoicing': [
    { icon: faFileInvoiceDollar, label: 'Create an invoice for Acme Corp for $12,500', type: 'action', path: '', description: 'AI' },
    { icon: faClock, label: 'Which invoices are overdue?', type: 'action', path: '', description: 'AI' },
    { icon: faPaperPlane, label: 'Send a reminder for invoice #1042', type: 'action', path: '', description: 'AI' },
    { icon: faChartLine, label: 'How much revenue did we invoice this quarter?', type: 'action', path: '', description: 'AI' },
  ],
  
  // Tasks page
  '/tasks': [
    { icon: faCircleQuestion, label: 'What tasks need my attention?', type: 'action', path: '', description: 'AI' },
    { icon: faUsers, label: 'Show tasks assigned to my team', type: 'action', path: '', description: 'AI' },
    { icon: faClock, label: 'What receipts are overdue?', type: 'action', path: '', description: 'AI' },
    { icon: faChartLine, label: 'Summary of completed tasks this week', type: 'action', path: '', description: 'AI' },
  ],
};

// Default suggestions when page not in map
const DEFAULT_SUGGESTIONS: Suggestion[] = [
  { icon: faChartLine, label: 'What\'s my current balance?', type: 'action', path: '', description: 'AI' },
  { icon: faPaperPlane, label: 'Send $5,000 to AWS for this month\'s invoice', type: 'action', path: '', description: 'AI' },
  { icon: faCreditCard, label: 'What cards do I have and who is over their limit?', type: 'action', path: '', description: 'AI' },
  { icon: faCalendar, label: 'Show me my January bank statements', type: 'action', path: '', description: 'AI' },
];

// Get contextual suggestions based on current path
function getContextualSuggestions(pathname: string): Suggestion[] {
  // Check for exact match first
  if (CONTEXTUAL_SUGGESTIONS[pathname]) {
    return CONTEXTUAL_SUGGESTIONS[pathname];
  }
  
  // Check for partial path matches (e.g., /accounts/treasury matches /accounts)
  for (const [path, suggestions] of Object.entries(CONTEXTUAL_SUGGESTIONS)) {
    if (pathname.startsWith(path) && path !== '/') {
      return suggestions;
    }
  }
  
  // Fallback to default
  return DEFAULT_SUGGESTIONS;
}

// All searchable suggestions (includes more pages for search)
const ALL_SUGGESTIONS: Suggestion[] = [
  ...NAV_SUGGESTIONS,
  ...DEFAULT_SUGGESTIONS,
  // Additional navigation for search
  { icon: faWindowMaximize, label: 'Tasks', type: 'page', path: '/tasks' },
  { icon: faWindowMaximize, label: 'Recipients', type: 'page', path: '/payments/recipients' },
  { icon: faWindowMaximize, label: 'Bill Pay', type: 'page', path: '/workflows/bill-pay' },
  { icon: faWindowMaximize, label: 'Accounts', type: 'page', path: '/accounts' },
  { icon: faWindowMaximize, label: 'Accounting', type: 'page', path: '/accounting' },
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
  const { isMobile } = useMobileLayout();
  const isCommandPage = location.pathname === '/command';
  const [inputValue, setInputValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isSendHovered, setIsSendHovered] = useState(false);
  const [hoveredRecipientIndex, setHoveredRecipientIndex] = useState<number | null>(null);
  const [panelType, setPanelType] = useState<'chat' | null>(null);
  const [isPanelFullScreen, setIsPanelFullScreen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const toolbarRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Panel resize state
  const [panelWidth, setPanelWidth] = useState(400);
  const [isResizing, setIsResizing] = useState(false);
  const [isPanelExiting, setIsPanelExiting] = useState(false);
  const [isInitialPanelOpen, setIsInitialPanelOpen] = useState(false);
  const [isToggleAnimating, setIsToggleAnimating] = useState(false);
  const [actualSidebarWidth, setActualSidebarWidth] = useState(231);
  const resizeStartX = useRef(0);
  const resizeStartWidth = useRef(400);
  
  // Track window width for responsive behavior
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1440);
  const LARGE_SCREEN_BREAKPOINT = 1440; // 14in MacBook Pro
  const isLargeScreen = windowWidth >= LARGE_SCREEN_BREAKPOINT;

  // Chat store and streaming
  const { 
    messages, 
    isLoading, 
    thinkingStatus, 
    startNewConversation, 
    clearConversation,
    isNavigationComplete,
    markNavigationComplete,
    setFullScreenChat,
    agentMode,
    setAgentMode,
  } = useChatStore();
  const { sendMessage } = useStreamingChat();
  
  // @mention autocomplete state
  const [showMentionDropdown, setShowMentionDropdown] = useState(false);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current && panelType === 'chat') {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, panelType, isLoading]);

  // Get actual sidebar width from DOM and track window width
  useEffect(() => {
    const updateSidebarWidth = () => {
      const sidebar = document.querySelector('.ds-sidebar');
      if (sidebar) {
        const width = sidebar.getBoundingClientRect().width;
        setActualSidebarWidth(width);
      }
    };
    
    const updateWindowWidth = () => {
      setWindowWidth(window.innerWidth);
    };

    updateSidebarWidth();
    updateWindowWidth();
    
    window.addEventListener('resize', updateSidebarWidth);
    window.addEventListener('resize', updateWindowWidth);
    
    return () => {
      window.removeEventListener('resize', updateSidebarWidth);
      window.removeEventListener('resize', updateWindowWidth);
    };
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
        if (targetUrl && targetUrl !== location.pathname) {
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
  }, [messages, navigate, isNavigationComplete, markNavigationComplete, location.pathname]);

  // Handle sending a chat message
  const handleSendChatMessage = async () => {
    const content = chatInput.trim();
    if (!content || isLoading) return;
    
    // Start a new conversation if this is the first message
    // Don't pass content here - sendMessage will add the user message
    if (messages.length === 0) {
      startNewConversation();
    }
    
    setChatInput('');
    await sendMessage(content);
  };

  // Handle chat input change with @mention detection
  const handleChatInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setChatInput(value);
    
    // Check for @ mention pattern
    const atIndex = value.lastIndexOf('@');
    if (atIndex !== -1) {
      const afterAt = value.slice(atIndex + 1);
      // Check if we're in a potential mention (no space after @)
      if (!afterAt.includes(' ')) {
        // Show dropdown immediately on @ or if "support" starts with what user typed
        // Empty string means just @ was typed - show dropdown immediately
        setShowMentionDropdown(afterAt === '' || 'support'.startsWith(afterAt.toLowerCase()));
      } else {
        setShowMentionDropdown(false);
      }
    } else {
      setShowMentionDropdown(false);
    }
  };
  
  // Handle selecting @support mention
  const handleSelectMention = () => {
    // Remove the @query from input and set agent mode
    const atIndex = chatInput.lastIndexOf('@');
    if (atIndex !== -1) {
      setChatInput(chatInput.slice(0, atIndex));
    }
    setAgentMode('support');
    setShowMentionDropdown(false);
    chatInputRef.current?.focus();
  };

  // Handle chat input keydown
  const handleChatKeyDown = (e: React.KeyboardEvent) => {
    // Handle mention dropdown selection
    if (showMentionDropdown) {
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        handleSelectMention();
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        setShowMentionDropdown(false);
        return;
      }
    }
    
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendChatMessage();
    }
  };

  // Filter suggestions based on input (includes pages, actions, recipients, and cards)
  // For no search: show structured sections; for search: filter all suggestions
  // Get contextual AI suggestions based on current page
  const contextualSuggestions = useMemo(() => {
    return getContextualSuggestions(location.pathname);
  }, [location.pathname]);

  const filteredSuggestions = useMemo(() => {
    if (!inputValue) {
      // When not searching, return nav + contextual AI suggestions in order
      return [...NAV_SUGGESTIONS, ...contextualSuggestions];
    }
    const searchTerm = inputValue.toLowerCase();
    
    // Filter page/action suggestions from ALL_SUGGESTIONS
    const filteredPages = ALL_SUGGESTIONS.filter(s => 
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
  }, [inputValue, recipients, contextualSuggestions]);

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

  // Get dynamic CTA label based on current page
  const primaryCTALabel = useMemo(() => {
    const path = location.pathname;
    if (path.startsWith('/payments') || path === '/payments/recipients') {
      return 'Send';
    }
    if (path === '/cards') {
      return 'Create Card';
    }
    return 'Ask';
  }, [location.pathname]);

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

  // Global keyboard listener - auto-focus toolbar when user starts typing
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Don't capture if already focused or panel is open
      if (isFocused || panelType) return;
      
      // Don't capture if we're on the command page
      if (isCommandPage) return;
      
      // Don't capture if already in an input, textarea, or contenteditable
      const target = e.target as HTMLElement;
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target.isContentEditable ||
        target.closest('[contenteditable="true"]')
      ) {
        return;
      }
      
      // Don't capture modifier keys
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      
      // Only capture printable characters (single character keys)
      if (e.key.length !== 1) return;
      
      // Focus the toolbar and inject the key
      setIsFocused(true);
      setInputValue(e.key);
      setSelectedIndex(0);
      
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          // Move cursor to end
          inputRef.current.setSelectionRange(1, 1);
        }
      }, 50);
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => {
      document.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [isFocused, panelType, isCommandPage]);

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

  // Close RHC panel when navigating to /command - Command is the terminal destination
  useEffect(() => {
    if (isCommandPage && panelType) {
      // Close the RHC panel without clearing conversation - let Command take over
      setPanelType(null);
      setIsPanelFullScreen(false);
      setPanelWidth(400);
      setChatInput('');
      setIsPanelExiting(false);
      setIsInitialPanelOpen(false);
    }
  }, [isCommandPage, panelType]);

  useEffect(() => {
    const isFullScreen = panelType && isPanelFullScreen;
    if (isFullScreen) {
      document.body.classList.add('ds-panel-open');
    } else {
      document.body.classList.remove('ds-panel-open');
    }
    
    // Add class for large screen panel mode (panel pushes content)
    if (panelType && isLargeScreen && !isPanelFullScreen) {
      document.body.classList.add('ds-panel-open-side');
      document.body.style.setProperty('--chat-panel-width', `${panelWidth}px`);
    } else {
      document.body.classList.remove('ds-panel-open-side');
      document.body.style.removeProperty('--chat-panel-width');
    }
    
    // Sync full-screen chat state with the store for nav highlighting
    setFullScreenChat(!!isFullScreen);
    return () => {
      document.body.classList.remove('ds-panel-open');
      document.body.classList.remove('ds-panel-open-side');
      document.body.style.removeProperty('--chat-panel-width');
    };
  }, [panelType, isPanelFullScreen, isLargeScreen, panelWidth, setFullScreenChat]);
  
  // Update panel width CSS variable during resize
  useEffect(() => {
    if (isResizing && isLargeScreen && !isPanelFullScreen) {
      document.body.style.setProperty('--chat-panel-width', `${panelWidth}px`);
    }
  }, [panelWidth, isResizing, isLargeScreen, isPanelFullScreen]);

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
      
      // Calculate maximum width (full screen width)
      const maxWidth = viewportWidth - actualSidebarWidth;
      
      // Cap at max width but don't snap to full screen during drag
      newWidth = Math.min(newWidth, maxWidth);
      
      // Keep it in panel mode during drag
      setIsPanelFullScreen(false);
      setPanelWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.classList.remove('ds-panel-resizing');
      
      // Check if we should snap to full screen on release
      const viewportWidth = window.innerWidth;
      const fullScreenThreshold = viewportWidth * 0.6;
      
      // If dragged close to full screen (within 60% threshold), snap to full screen
      if (panelWidth >= fullScreenThreshold) {
        setIsToggleAnimating(true);
        setIsPanelFullScreen(true);
        setTimeout(() => setIsToggleAnimating(false), 400);
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.classList.remove('ds-panel-resizing');
    };
  }, [isResizing, panelWidth, actualSidebarWidth]);

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

  // Open chat panel with an initial message
  const openChatWithMessage = async (initialMessage: string) => {
    setPanelType('chat');
    setIsInitialPanelOpen(true);
    setIsFocused(false);
    setInputValue('');
    setChatInput('');
    if (inputRef.current) {
      inputRef.current.blur();
    }
    
    // Start a new conversation - don't pass message here, sendMessage will add it
    startNewConversation();
    await sendMessage(initialMessage);
    
    // Clear initial open state after animation completes
    setTimeout(() => setIsInitialPanelOpen(false), 350);
  };

  // Close panel and reset toolbar to default state
  const handleClosePanel = () => {
    setIsPanelExiting(true);
    setTimeout(() => {
      setPanelType(null);
      setIsFocused(false);
      setInputValue('');
      setIsPanelFullScreen(false);
      setPanelWidth(400);
      setChatInput('');
      setIsPanelExiting(false);
      setIsInitialPanelOpen(false);
      clearConversation();
      setAgentMode('assistant'); // Reset to default mode
      if (inputRef.current) {
        inputRef.current.blur();
      }
    }, 300);
  };

  // Start a new conversation in the panel
  const handleNewConversation = () => {
    clearConversation();
    setAgentMode('assistant'); // Reset to default mode
    setChatInput('');
    setTimeout(() => {
      chatInputRef.current?.focus();
    }, 50);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isFocused) return;

    switch (e.key) {
      case 'ArrowDown':
        if (filteredSuggestions.length > 0) {
          e.preventDefault();
          setSelectedIndex(prev => 
            prev < filteredSuggestions.length - 1 ? prev + 1 : 0
          );
        }
        break;
      case 'ArrowUp':
        if (filteredSuggestions.length > 0) {
          e.preventDefault();
          setSelectedIndex(prev => 
            prev > 0 ? prev - 1 : filteredSuggestions.length - 1
          );
        }
        break;
      case 'Enter':
        e.preventDefault();
        // If there's a selected suggestion, use it
        if (filteredSuggestions.length > 0 && filteredSuggestions[selectedIndex]) {
          const suggestion = filteredSuggestions[selectedIndex];
          // AI action suggestions open chat with the label as the query
          if (suggestion.type === 'action' && suggestion.description === 'AI') {
            openChatWithMessage(suggestion.label);
            break;
          }
          // Regular navigation
          if (suggestion.path) {
            handleNavigate(suggestion.path);
          }
        } else if (inputValue.trim()) {
          // If input has content but no matching suggestions, open chat with it
          openChatWithMessage(inputValue.trim());
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

  // Panel title
  const panelTitle = 'Mercury Assistant';

  return (
    <>
      {/* RHC panel - never show on Command page (Command is the terminal destination) */}
      {!isCommandPage && (panelType || isPanelExiting) && (
        <div 
          className={cn(
            'ds-chat-panel-overlay',
            // Large screen modes - use same class for both panel and fullscreen
            isLargeScreen && 'ds-chat-panel-as-sidebar',
            // Small screen overlay mode (not full screen)
            !isLargeScreen && !isPanelFullScreen && 'ds-chat-panel-overlay-panel',
            // Add initial-open only on first open for slide-in animation
            isInitialPanelOpen && 'initial-open',
            // States
            isToggleAnimating && 'toggle-animating',
            isResizing && 'resizing',
            isPanelExiting && 'exiting'
          )}
          style={{ 
            width: isPanelFullScreen 
              ? `calc(100vw - ${actualSidebarWidth}px)` 
              : panelWidth,
            right: isPanelFullScreen || isLargeScreen 
              ? 0 
              : 16,
            left: 'auto'
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
              <div className="flex items-center gap-2">
                <button className="ds-chat-panel-back-btn" onClick={handleClosePanel}>
                  <Icon icon={faChevronLeft} size="small" style={{ color: 'var(--ds-icon-secondary)' }} />
                  <span className="text-body-demi" style={{ color: 'var(--ds-text-default)' }}>{panelTitle}</span>
                </button>
                {/* Support mode badge in header */}
                {agentMode === 'support' && (
                  <div
                    className="flex items-center gap-1"
                    style={{
                      backgroundColor: 'var(--ds-bg-primary)',
                      color: 'var(--ds-text-on-primary)',
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-full)',
                      fontSize: 12,
                      fontWeight: 480,
                    }}
                  >
                    <Icon icon={faHeadset} size="small" style={{ color: 'var(--ds-icon-on-primary)' }} />
                    Support
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <DSButton variant="tertiary" size="small" iconOnly aria-label="New conversation" onClick={handleNewConversation}>
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
                  onClick={() => {
                    setIsToggleAnimating(true);
                    setIsPanelFullScreen(!isPanelFullScreen);
                    // When collapsing from full screen, reset to default width
                    if (isPanelFullScreen) {
                      setPanelWidth(400);
                    }
                    setTimeout(() => setIsToggleAnimating(false), 300);
                  }}
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
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <span className="text-body" style={{ color: 'var(--ds-text-tertiary)' }}>
                      Ask me anything about your accounts
                    </span>
                  </div>
                ) : (
                  <>
                    {messages.map((message: ChatMessage) => (
                      <div key={message.id}>
                        {message.role === 'user' ? (
                          <div className="ds-chat-panel-message-bubble">
                            <span className="text-body" style={{ color: 'var(--ds-text-default)' }}>
                              {message.content}
                            </span>
                          </div>
                        ) : (
                          <div className="ds-chat-panel-ai-response">
                            <div className="ds-chat-panel-copy ds-chat-markdown">
                              <ChatBlockRenderer
                                content={message.content}
                                metadata={message.metadata}
                                context="rhc"
                                onNavigate={(url) => {
                                  handleClosePanel();
                                  navigate(url);
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                    {isLoading && (
                      <div className="ds-chat-panel-ai-response">
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
                  </>
                )}
              </div>

              <div className="ds-chat-panel-footer">
                {/* @support mention autocomplete dropdown */}
                {showMentionDropdown && (
                  <div 
                    className="ds-mention-dropdown"
                    style={{
                      position: 'absolute',
                      bottom: 80,
                      left: 0,
                      right: 0,
                      margin: '0 auto',
                      maxWidth: 280,
                      backgroundColor: 'var(--ds-bg-default)',
                      border: '1px solid var(--color-border-default)',
                      borderRadius: 'var(--radius-md)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      padding: 4,
                      zIndex: 100,
                    }}
                  >
                    <div
                      className="ds-mention-option"
                      onClick={handleSelectMention}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '8px 12px',
                        borderRadius: 'var(--radius-sm)',
                        cursor: 'pointer',
                        backgroundColor: 'var(--ds-bg-emphasized)',
                      }}
                    >
                      <Icon icon={faHeadset} size="small" style={{ color: 'var(--ds-icon-primary)' }} />
                      <div className="flex flex-col">
                        <span className="text-body-demi" style={{ color: 'var(--ds-text-default)' }}>
                          @support
                        </span>
                        <span className="text-label" style={{ color: 'var(--ds-text-tertiary)' }}>
                          Connect to Support Agent
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="ds-chat-composer">
                  <div className="ds-chat-composer-input">
                    {/* Agent mode badge */}
                    {agentMode === 'support' && (
                      <div 
                        className="flex items-center gap-1"
                        style={{
                          backgroundColor: 'var(--ds-bg-primary)',
                          color: 'var(--ds-text-on-primary)',
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-full)',
                          marginRight: 8,
                          fontSize: 12,
                          fontWeight: 480,
                        }}
                      >
                        <Icon icon={faHeadset} size="small" style={{ color: 'var(--ds-icon-on-primary)' }} />
                        Support
                      </div>
                    )}
                    <input
                      ref={chatInputRef}
                      type="text"
                      className="ds-chat-composer-field"
                      placeholder={agentMode === 'support' ? 'Describe your issue...' : 'Ask anything'}
                      value={chatInput}
                      onChange={handleChatInputChange}
                      onKeyDown={handleChatKeyDown}
                      disabled={isLoading}
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
                      disabled={!chatInput.trim() || isLoading}
                      onClick={handleSendChatMessage}
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
      <div className={cn('ds-action-container', isCommandPage && 'hidden-on-command', isMobile && 'ds-action-container-mobile')}>
        {!panelType && (
          <div 
            ref={toolbarRef}
            className={cn('ds-action-toolbar', isFocused && 'focused', isMobile && 'ds-action-toolbar-mobile')} 
            style={{ width: isMobile ? (isFocused ? '100%' : 'auto') : (isFocused ? 672 : 484) }}
          >
            {/* Expanded Results Area - Only visible when focused */}
            {isFocused && (
              <div className="ds-action-results">
                {filteredSuggestions.length > 0 ? (
                  <>
                    {/* Section Headers only shown when not searching */}
                    {!inputValue && (
                      <div 
                        className="text-tiny" 
                        style={{ 
                          color: 'var(--ds-text-tertiary)', 
                          padding: '8px 12px 4px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}
                      >
                        Jump to
                      </div>
                    )}
                    {filteredSuggestions.slice(0, !inputValue ? NAV_SUGGESTIONS.length : filteredSuggestions.length).map((suggestion, index) => (
                      <div 
                        key={`${suggestion.type}-${suggestion.label}-${suggestion.recipientId || suggestion.cardId || ''}`}
                        className={cn(
                          'ds-action-result-item',
                          index === selectedIndex && 'selected',
                          suggestion.type === 'action' && 'action-item'
                        )}
                        onMouseEnter={() => setSelectedIndex(index)}
                        onClick={() => {
                          if (suggestion.type === 'action' && suggestion.description === 'AI') {
                            openChatWithMessage(suggestion.label);
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
                          style={{ color: suggestion.description === 'AI' ? 'var(--purple-magic-600)' : 'var(--ds-text-tertiary)' }}
                        >
                          {suggestion.description === 'AI' ? (
                            <span className="flex items-center gap-1">
                              <Icon icon={faSparkles} size="small" style={{ color: 'var(--purple-magic-600)' }} />
                              AI
                            </span>
                          ) : (
                            suggestion.description || suggestion.path
                          )}
                        </span>
                      </div>
                    ))}
                    {/* AI Section Header and items - only when not searching */}
                    {!inputValue && (
                      <>
                        <div 
                          className="text-tiny" 
                          style={{ 
                            color: 'var(--ds-text-tertiary)', 
                            padding: '12px 12px 4px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                          }}
                        >
                          Try asking
                        </div>
                        {contextualSuggestions.map((suggestion, idx) => {
                          const index = NAV_SUGGESTIONS.length + idx;
                          return (
                            <div 
                              key={`ai-${suggestion.label}`}
                              className={cn(
                                'ds-action-result-item',
                                index === selectedIndex && 'selected',
                                'action-item'
                              )}
                              onMouseEnter={() => setSelectedIndex(index)}
                              onClick={() => openChatWithMessage(suggestion.label)}
                            >
                              <div className="flex items-center gap-2">
                                <div className="ds-action-result-icon">
                                  <Icon 
                                    icon={suggestion.icon} 
                                    size="small"
                                    style={{ color: 'var(--purple-magic-600)' }} 
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
                                className="text-label flex items-center gap-1"
                                style={{ color: 'var(--purple-magic-600)' }}
                              >
                                <Icon icon={faSparkles} size="small" style={{ color: 'var(--purple-magic-600)' }} />
                                AI
                              </span>
                            </div>
                          );
                        })}
                      </>
                    )}
                  </>
                ) : inputValue.trim() ? (
                  <div 
                    className="ds-action-result-item ai-mode"
                    onClick={() => openChatWithMessage(inputValue.trim())}
                  >
                    <div className="flex items-center gap-2">
                      <div 
                        className="ds-action-result-icon"
                        style={{ 
                          background: 'linear-gradient(135deg, var(--purple-magic-500), var(--purple-magic-600))',
                          borderRadius: 'var(--radius-sm)'
                        }}
                      >
                        <Icon 
                          icon={faArrowUp} 
                          size="small"
                          style={{ color: 'white' }} 
                        />
                      </div>
                      <span 
                        className="text-body"
                        style={{ color: 'var(--ds-text-default)' }}
                      >
                        Ask Mercury Command: "{inputValue}"
                      </span>
                    </div>
                    <span 
                      className="text-label"
                      style={{ color: 'var(--purple-magic-600)' }}
                    >
                      Press Enter
                    </span>
                  </div>
                ) : (
                  <div 
                    className="flex items-center justify-center py-4"
                    style={{ color: 'var(--ds-text-tertiary)' }}
                  >
                    <span className="text-body">Type to search or ask AI</span>
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
                    {primaryCTALabel}
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

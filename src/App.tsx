import React, { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import PeriodDropdown, { type TimePeriod } from './PeriodDropdown';
import TimelineRange, { type ComparisonMode, type TimeRange } from './TimelineRange';
import { type Cadence } from './Dropdown';
import FinancialSegmentedControl from './FinancialSegmentedControl';
import ComparisonDropdown from './ComparisonDropdown';
import SidebarNav, { type SidebarSection } from './SidebarNav';
import { type Scale } from './SegmentedControl';
import CashFlowBarChart from './CashFlowBarChart';
import GlobalNav from './GlobalNav';
import Scorecard, { type Insight } from './Scorecard';
import DualGradientPlayground from './DualGradientPlayground';
import { type GradientSettings, type GradientSettingsMoneyIn } from './GradientPlayground';
import { useAppStore } from './store';
import { 
  transactionsToCashFlow, 
  aggregateByCadence, 
  filterTransactionsByDateRange,
  calculateTransactionsSummary,
  formatCurrency 
} from './utils';
import TransactionsPage from './TransactionsPage';
import InsightsBreakdown from './InsightsBreakdown';
import HomePage from './HomePage';
import { 
  DataControlPanel, 
  DataControlTrigger, 
  generateInitialTransactions,
  type Transaction 
} from './transactions';
import { ChatPage, FloatingChat, useChatStore } from './chat';

function startOfMonth(d: Date): Date {
  const n = new Date(d);
  n.setDate(1);
  n.setHours(0, 0, 0, 0);
  return n;
}

function startOfQuarter(d: Date): Date {
  const n = startOfMonth(d);
  const qStartMonth = Math.floor(n.getMonth() / 3) * 3;
  n.setMonth(qStartMonth, 1);
  return n;
}

function startOfYear(d: Date): Date {
  const n = new Date(d);
  n.setMonth(0, 1);
  n.setHours(0, 0, 0, 0);
  return n;
}

function getDateRangeForPeriod(period: TimePeriod, referenceDate: Date = new Date()): [Date, Date] {
  const today = new Date(referenceDate);
  today.setHours(23, 59, 59, 999);
  
  switch (period) {
    case 'mtd':
      // Month-to-date: From start of current month to today
      return [startOfMonth(today), today];
    case 'qtd':
      // Quarter-to-date: From start of current quarter to today
      return [startOfQuarter(today), today];
    case 'ytd':
      // Year-to-date: From start of current year to today
      return [startOfYear(today), today];
    case 'lastMonth': {
      // Last month: Full previous month
      const end = new Date(today.getFullYear(), today.getMonth(), 0, 23, 59, 59, 999); // Last day of previous month
      const start = new Date(end.getFullYear(), end.getMonth(), 1, 0, 0, 0, 0);
      return [start, end];
    }
    case 'lastQuarter': {
      // Last quarter: Full previous quarter
      const currentQuarter = Math.floor(today.getMonth() / 3);
      const lastQuarter = currentQuarter === 0 ? 3 : currentQuarter - 1;
      const lastQuarterYear = currentQuarter === 0 ? today.getFullYear() - 1 : today.getFullYear();
      const start = new Date(lastQuarterYear, lastQuarter * 3, 1, 0, 0, 0, 0);
      const end = new Date(lastQuarterYear, lastQuarter * 3 + 3, 0, 23, 59, 59, 999);
      return [start, end];
    }
    case 'last30d': {
      // Last 30 days
      const start30d = new Date(today);
      start30d.setDate(start30d.getDate() - 30);
      start30d.setHours(0, 0, 0, 0);
      return [start30d, today];
    }
    case 'last3m': {
      // Last 3 months: From 3 months ago to today
      const start3m = new Date(today);
      start3m.setMonth(start3m.getMonth() - 3);
      start3m.setHours(0, 0, 0, 0);
      return [start3m, today];
    }
    case 'last6m': {
      // Last 6 months: From 6 months ago to today
      const start6m = new Date(today);
      start6m.setMonth(start6m.getMonth() - 6);
      start6m.setHours(0, 0, 0, 0);
      return [start6m, today];
    }
    case 'last12m': {
      // Last 12 months: From 12 months ago to today
      const start12m = new Date(today);
      start12m.setMonth(start12m.getMonth() - 12);
      start12m.setHours(0, 0, 0, 0);
      return [start12m, today];
    }
    default:
      return [startOfMonth(today), today];
  }
}

function App() {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('ytd');
  const [cadence, setCadence] = useState<Cadence>('monthly');
  const [comparisonMode, setComparisonMode] = useState<ComparisonMode>('Off');
  const [customDateRange, setCustomDateRange] = useState<string>('');
  const [viewportWidth, setViewportWidth] = useState<number>(window.innerWidth);
  const [forceOpenComparison, setForceOpenComparison] = useState<boolean>(false);
  
  // Sidebar state - initialize from URL or default to /home
  const [activePath, setActivePath] = useState(() => {
    const path = window.location.pathname;
    return path && path !== '/' ? path : '/home';
  });
  
  // URL query params for page-specific filters
  const [urlParams, setUrlParams] = useState(() => {
    return new URLSearchParams(window.location.search);
  });
  const [collapsedIds, setCollapsedIds] = useState<string[]>(['payments']);
  
  // Chat store - for managing conversations and floating state
  const startNewConversation = useChatStore((state) => state.startNewConversation);
  const isFloating = useChatStore((state) => state.isFloating);
  const setFloating = useChatStore((state) => state.setFloating);
  const hasActiveConversation = useChatStore((state) => state.messages.length > 0);
  const clearConversation = useChatStore((state) => state.clearConversation);

  // Set initial URL if on root path
  useEffect(() => {
    if (window.location.pathname === '/' || window.location.pathname === '') {
      window.history.replaceState({}, '', activePath);
    }
  }, []);

  // Handle browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      setActivePath(path && path !== '/' ? path : '/home');
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Money Out gradient settings state
  const [gradientSettingsMoneyOut, setGradientSettingsMoneyOut] = useState<GradientSettings>({
    width: 87,
    height: 179,
    baseColor: '#383255',
    topGlowColor: '#FC92B4',
    bottomGlowColor: '#335C6B',
    topGlowOpacity: 0.35,
    bottomGlowOpacity: 1.0,
    topBlurIntensity: 1.0,
    bottomBlurIntensity: 1.0,
    topGlowSize: 0.6,
    bottomGlowSize: 0.8,
    topGlowOffset: 0,
    bottomGlowOffset: 0,
  });

  // Money In gradient settings state
  const [gradientSettingsMoneyIn, setGradientSettingsMoneyIn] = useState<GradientSettingsMoneyIn>({
    width: 88,
    height: 250,
    topGradientColor: '#D1E1E8',
    bottomGradientColor: '#C3C0DF',
    topGlowColor: '#9CB4E8',
    bottomGlowColor: '#77C599',
    topGlowOpacity: 1.0,
    bottomGlowOpacity: 0.8,
    topBlurIntensity: 1.0,
    bottomBlurIntensity: 0.8,
    topGlowSize: 1.0,
    bottomGlowSize: 0.9,
    topGlowOffset: 0,
    bottomGlowOffset: 0,
  });

  const handleMoneyOutChange = useCallback((newSettings: Partial<GradientSettings>) => {
    setGradientSettingsMoneyOut(prev => ({ ...prev, ...newSettings }));
  }, []);

  const handleMoneyInChange = useCallback((newSettings: Partial<GradientSettingsMoneyIn>) => {
    setGradientSettingsMoneyIn(prev => ({ ...prev, ...newSettings }));
  }, []);

  const handleMoneyOutReset = useCallback(() => {
    setGradientSettingsMoneyOut({
      width: 87,
      height: 179,
      baseColor: '#383255',
      topGlowColor: '#FC92B4',
      bottomGlowColor: '#335C6B',
      topGlowOpacity: 0.35,
      bottomGlowOpacity: 1.0,
      topBlurIntensity: 1.0,
      bottomBlurIntensity: 1.0,
      topGlowSize: 0.6,
      bottomGlowSize: 0.8,
      topGlowOffset: 0,
      bottomGlowOffset: 0,
    });
  }, []);

  const handleMoneyInReset = useCallback(() => {
    setGradientSettingsMoneyIn({
      width: 88,
      height: 250,
      topGradientColor: '#D1E1E8',
      bottomGradientColor: '#C3C0DF',
      topGlowColor: '#9CB4E8',
      bottomGlowColor: '#77C599',
      topGlowOpacity: 1.0,
      bottomGlowOpacity: 0.8,
      topBlurIntensity: 1.0,
      bottomBlurIntensity: 0.8,
      topGlowSize: 1.0,
      bottomGlowSize: 0.9,
      topGlowOffset: 0,
      bottomGlowOffset: 0,
    });
  }, []);

  // Use the current date as reference
  const referenceDate = useMemo(() => new Date(), []); // Using actual current date as "today"
  
  // Store access for time range and transactions
  const setCommittedTimeRange = useAppStore((s) => s.setTimeRange);
  const committedTimeRange = useAppStore((s) => s.timeRange);
  const transactions = useAppStore((s) => s.transactions);
  const setTransactions = useAppStore((s) => s.setTransactions);
  
  // Data Control Panel state (shared across pages)
  const [isControlPanelOpen, setIsControlPanelOpen] = useState(false);
  
  // Gradient Playground visibility state (hidden by default)
  const [showGradientPlayground, setShowGradientPlayground] = useState(false);
  
  // Initialize transactions on first mount
  useEffect(() => {
    if (transactions.length === 0) {
      const initialTransactions = generateInitialTransactions();
      setTransactions(initialTransactions);
    }
  }, [transactions.length, setTransactions]);
  
  // Handle applying new transactions from DataControlPanel
  const handleApplyData = useCallback((newTransactions: Transaction[]) => {
    setTransactions(newTransactions);
  }, [setTransactions]);
  
  // Convert transactions to cash flow records for charts
  const cashFlowData = useMemo(() => {
    return transactionsToCashFlow(transactions);
  }, [transactions]);
  
  // Filter transactions by committed time range
  const filteredTransactions = useMemo(() => {
    return filterTransactionsByDateRange(transactions, committedTimeRange);
  }, [transactions, committedTimeRange]);
  
  // Calculate summary values from filtered transactions
  const transactionsSummary = useMemo(() => {
    return calculateTransactionsSummary(filteredTransactions);
  }, [filteredTransactions]);
  
  // Filter and aggregate data based on committed time range and cadence
  const chartData = useMemo(() => {
    const aggregated = aggregateByCadence(cashFlowData, committedTimeRange, cadence);
    
    // Convert to format expected by D3 chart
    return aggregated.map(item => ({
      month: item.label, // Use the label for display
      moneyIn: item.moneyIn,
      moneyOut: -item.moneyOut // D3 chart expects negative values
    }));
  }, [cashFlowData, committedTimeRange, cadence]);

  // Rail dates that can be shifted
  const [railStart, setRailStart] = useState<Date>(() => {
    // Default to January 1st of previous year
    const now = new Date();
    return new Date(now.getFullYear() - 1, 0, 1);
  });
  const [railEnd, setRailEnd] = useState<Date>(() => {
    const threeMonthsAhead = new Date(referenceDate);
    threeMonthsAhead.setMonth(threeMonthsAhead.getMonth() + 3);
    return threeMonthsAhead;
  });
  
  const [valueStart, setValueStart] = useState<Date>(() => {
    // Default to Year to Date (January 1st of current year)
    const now = new Date();
    return new Date(now.getFullYear(), 0, 1);
  });
  const [valueEnd, setValueEnd] = useState<Date>(() => new Date());
  const markerDate = useMemo(() => referenceDate, [referenceDate]);

  // Handle viewport width changes
  useEffect(() => {
    const handleResize = () => {
      setViewportWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Calculate timeline range based on viewport width
  const calculateTimelineRange = useCallback(() => {
    // Determine months to show based on viewport width
    let monthsToShow: number;
    if (viewportWidth >= 1400) {
      monthsToShow = 24; // 2 years
    } else if (viewportWidth >= 1200) {
      monthsToShow = 18; // 1.5 years
    } else if (viewportWidth >= 1000) {
      monthsToShow = 12; // 1 year
    } else if (viewportWidth >= 800) {
      monthsToShow = 9; // 9 months
    } else {
      monthsToShow = 6; // 6 months
    }

    // Calculate start date (going back from current date)
    const startDate = new Date(referenceDate);
    startDate.setMonth(startDate.getMonth() - Math.floor(monthsToShow * 0.7)); // Show more past than future
    
    // Always include January of the start year
    const startYear = startDate.getFullYear();
    const januaryStart = new Date(startYear, 0, 1);
    if (startDate > januaryStart) {
      startDate.setMonth(0, 1); // Set to January 1st of the year
    }

    // Calculate end date
    const endDate = new Date(referenceDate);
    endDate.setMonth(endDate.getMonth() + Math.floor(monthsToShow * 0.3)); // Show less future
    
    // Always include December of the end year
    const endYear = endDate.getFullYear();
    const decemberEnd = new Date(endYear, 11, 31);
    if (endDate < decemberEnd) {
      endDate.setMonth(11, 31); // Set to December 31st of the year
    }

    // Cap at 3 months ahead of reference date
    const maxEndDate = new Date(referenceDate);
    maxEndDate.setMonth(maxEndDate.getMonth() + 3);
    if (endDate > maxEndDate) {
      endDate.setTime(maxEndDate.getTime());
    }

    return { startDate, endDate };
  }, [referenceDate, viewportWidth]);

  // Update rail dates based on viewport width
  useEffect(() => {
    const { startDate, endDate } = calculateTimelineRange();
    setRailStart(startDate);
    setRailEnd(endDate);
  }, [calculateTimelineRange]);

  // Update date range when time period changes (except for custom)
  useEffect(() => {
    if (timePeriod !== 'custom') {
      const [start, end] = getDateRangeForPeriod(timePeriod, referenceDate);
      setValueStart(start);
      setValueEnd(end);
      // Also commit this change to the store immediately for predefined periods
      setCommittedTimeRange({ start, end });
    }
  }, [timePeriod, referenceDate, setCommittedTimeRange]);
  
  // Initialize the store with the initial date range
  useEffect(() => {
    setCommittedTimeRange({ start: valueStart, end: valueEnd });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  const handleTimePeriodChange = useCallback((period: TimePeriod) => {
    setTimePeriod(period);
    // Clear custom date range when switching to a predefined period
    if (period !== 'custom') {
      setCustomDateRange('');
    }
    // Open the comparison dropdown after changing timeframe
    setForceOpenComparison(true);
  }, []);

  const handleCadenceChange = useCallback((newCadence: Cadence) => {
    setCadence(newCadence);
    
    // For days view, we might want to show a more focused range
    if (newCadence === 'days') {
      // Show just the current month for days view for better spacing
      const startOfCurrentMonth = new Date(valueStart);
      startOfCurrentMonth.setDate(1);
      
      const endOfCurrentMonth = new Date(valueStart);
      endOfCurrentMonth.setMonth(endOfCurrentMonth.getMonth() + 1);
      endOfCurrentMonth.setDate(0); // Last day of current month
      
      // Cap at 3 months ahead of reference date
      const maxEndDate = new Date(referenceDate);
      maxEndDate.setMonth(maxEndDate.getMonth() + 3);
      
      setRailStart(startOfCurrentMonth);
      setRailEnd(new Date(Math.min(endOfCurrentMonth.getTime(), maxEndDate.getTime())));
    } else {
      // For monthly and yearly views, use the viewport-based calculation
      const { startDate, endDate } = calculateTimelineRange();
      setRailStart(startDate);
      setRailEnd(endDate);
    }
  }, [referenceDate, valueStart, calculateTimelineRange]);

  // Convert cadence to scale for the timeline
  const timelineScale = useMemo((): Scale => {
    switch (cadence) {
      case 'days':
        return 'month'; // Month scale shows days
      case 'monthly':
        return 'year';  // Year scale shows months
      case 'yearly':
        return 'year';  // Keep year scale for yearly
      default:
        return 'year';
    }
  }, [cadence]);

  const formatDateRange = useCallback((start: Date, end: Date): string => {
    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  }, []);

  const handleChange = useCallback((s: Date, e: Date) => {
    setValueStart(s);
    setValueEnd(e);
    
    // If we're in custom mode, update the custom date range display
    if (timePeriod === 'custom') {
      setCustomDateRange(formatDateRange(s, e));
    }
    
    // eslint-disable-next-line no-console
    console.log('onChange', s.toISOString(), e.toISOString());
  }, [timePeriod, formatDateRange]);

  // Function to match date range to existing time periods
  const matchDateRangeToPeriod = useCallback((start: Date, end: Date): TimePeriod | null => {
    const periods: TimePeriod[] = ['mtd', 'qtd', 'ytd', 'lastMonth', 'lastQuarter', 'last30d', 'last3m', 'last6m', 'last12m'];

    for (const period of periods) {
      const [expectedStart, expectedEnd] = getDateRangeForPeriod(period, referenceDate);

      // Check if dates match (within a day tolerance)
      const startDiff = Math.abs(start.getTime() - expectedStart.getTime());
      const endDiff = Math.abs(end.getTime() - expectedEnd.getTime());
      const dayMs = 24 * 60 * 60 * 1000;

      if (startDiff <= dayMs && endDiff <= dayMs) {
        return period;
      }
    }

    return null;
  }, [referenceDate]);

  const handleCommit = useCallback((s: Date, e: Date) => {
    // eslint-disable-next-line no-console
    console.log('onCommit', s.toISOString(), e.toISOString());
    
    // COMMIT to the global store - this will trigger chart update
    setCommittedTimeRange({ start: s, end: e });
    
    // Check if the dragged range matches any predefined period
    const matchedPeriod = matchDateRangeToPeriod(s, e);
    
    if (matchedPeriod) {
      // Update to the matched period
      setTimePeriod(matchedPeriod);
      setCustomDateRange('');
    } else {
      // Set to custom with the date range
      setTimePeriod('custom');
      setCustomDateRange(formatDateRange(s, e));
    }
    // NOTE: Do NOT open comparison dropdown here - this is for timeline dragging
  }, [matchDateRangeToPeriod, formatDateRange, setCommittedTimeRange]);

  const handleComparisonOpenChange = useCallback((isOpen: boolean) => {
    if (!isOpen) {
      // Reset force open when dropdown closes
      setForceOpenComparison(false);
    }
  }, []);

  const handleSelectionChange = useCallback((selection: TimeRange | null) => {
    // eslint-disable-next-line no-console
    console.log('Selection changed:', selection);
  }, []);

  const handleComparisonChange = useCallback((comparison: TimeRange | null, mode: ComparisonMode) => {
    // eslint-disable-next-line no-console
    console.log('Comparison changed:', { comparison, mode });
    // Update the comparison mode state
    setComparisonMode(mode);
  }, []);

  // Timeline hover state for showing/hiding chevrons
  const [isTimelineHovered, setIsTimelineHovered] = useState(false);
  
  // Scroll state for sticky header transformation
  const [isScrolled, setIsScrolled] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);
  
  // Track scroll position to show/hide minimized header (only on Insights page)
  useEffect(() => {
    if (activePath !== '/home' && activePath !== '/transactions') {
      const handleScroll = () => {
        // Trigger minimized header when scrolled past 80px
        const scrollThreshold = 80;
        setIsScrolled(window.scrollY > scrollThreshold);
      };
      
      window.addEventListener('scroll', handleScroll, { passive: true });
      return () => window.removeEventListener('scroll', handleScroll);
    } else {
      // Reset scroll state when leaving Insights page
      setIsScrolled(false);
    }
  }, [activePath]);

  // Sidebar data - matching Figma design
  const sidebarSections: SidebarSection[] = useMemo(() => [
    {
      id: "main",
      items: [
        { id: "home", label: "Home", href: "/home", icon: "fa-solid fa-house" },
        { id: "tasks", label: "Tasks", href: "/tasks", badgeCount: 3, icon: "fa-solid fa-inbox" },
        { id: "transactions", label: "Transactions", href: "/transactions", icon: "fa-solid fa-list" },
        { id: "insights", label: "Insights", href: "/insights", icon: "fa-solid fa-chart-column" },
        { id: "payments", label: "Payments", href: "/payments", icon: "fa-solid fa-arrow-right-arrow-left" },
        { id: "cards", label: "Cards", href: "/cards", icon: "fa-solid fa-credit-card" },
        { id: "capital", label: "Capital", href: "/capital", icon: "fa-solid fa-chart-line" },
        { id: "accounts", label: "Accounts", href: "/accounts", icon: "fa-solid fa-building-columns" },
      ],
    },
    {
      id: "workflows",
      label: "Workflows",
      items: [
        { id: "bill-pay", label: "Bill Pay", href: "/workflows/bill-pay", icon: "fa-solid fa-envelope-open-text" },
        { id: "invoicing", label: "Invoicing", href: "/workflows/invoicing", icon: "fa-solid fa-file-invoice-dollar" },
        { id: "reimbursements", label: "Reimbursements", href: "/workflows/reimbursements", icon: "fa-solid fa-money-bill-transfer" },
        { id: "accounting", label: "Accounting", href: "/workflows/accounting", icon: "fa-solid fa-book-open" },
      ],
    },
  ], []);

  // Sidebar handlers
  const handleToggleGroup = useCallback((id: string) => {
    setCollapsedIds(prev => 
      prev.includes(id) 
        ? prev.filter(collapsedId => collapsedId !== id)
        : [...prev, id]
    );
  }, []);

  const handleNavigate = useCallback((href: string) => {
    // Parse the href to separate path and query params
    const url = new URL(href, window.location.origin);
    const path = url.pathname;
    const params = url.searchParams;
    
    // If navigating away from chat while there's an active conversation, show floating chat
    if (activePath === '/chat' && path !== '/chat' && hasActiveConversation) {
      setFloating(true);
    }
    // If navigating back to chat, hide floating chat
    if (path === '/chat') {
      setFloating(false);
    }
    setActivePath(path);
    setUrlParams(params);
    window.history.pushState({}, '', href);
  }, [activePath, hasActiveConversation, setFloating]);
  
  // Handle starting a new chat conversation
  const handleStartChat = useCallback((initialMessage: string) => {
    startNewConversation(initialMessage);
    setActivePath('/chat');
    window.history.pushState({}, '', '/chat');
  }, [startNewConversation]);
  
  // Handle clicking on an insight to start a contextual chat
  const handleInsightClick = useCallback((insight: Insight) => {
    // Create a contextual message that the chat will send
    // Include [INSIGHT:id] tag for the router to easily detect
    const contextMessage = `[INSIGHT:${insight.id}] Tell me more about this: "${insight.title}"\n\n${insight.description}`;
    
    // Start a new conversation with this context
    startNewConversation(contextMessage);
    
    // Show floating chat instead of navigating to full chat page
    // This keeps the user on the insights page as requested
    setFloating(true);
  }, [startNewConversation, setFloating]);
  
  // Handle floating chat expand (go back to full chat page)
  const handleExpandChat = useCallback(() => {
    setFloating(false);
    setActivePath('/chat');
    window.history.pushState({}, '', '/chat');
  }, [setFloating]);
  
  // Handle floating chat close (clear conversation)
  const handleCloseChat = useCallback(() => {
    setFloating(false);
    clearConversation();
  }, [setFloating, clearConversation]);

  // Sample data for Scorecard
  const sampleInsights: Insight[] = useMemo(() => [
    {
      id: '1',
      type: 'negative',
      title: 'Spike in spend on software',
      description: 'Cursor spend in September totaled –$5,987, which is an increase by +15% MoM from –$5,009 in August.'
    },
    {
      id: '2',
      type: 'negative',
      title: 'Increased Credit spend',
      description: 'Credit card spend saw an increase of 8% from $3,490 in August to $3,798 in September.'
    },
    {
      id: '3',
      type: 'positive',
      title: '12% revenue growth',
      description: 'From August to September revenue increased from $12,459 to $12,950.'
    }
  ], []);

  return (
    <div className="min-h-screen bg-white">
      {/* Sidebar - always visible */}
      <SidebarNav
        orgName="Maker Inc."
        sections={sidebarSections}
        activePath={activePath}
        collapsedIds={collapsedIds}
        onToggleGroup={handleToggleGroup}
        onNavigate={handleNavigate}
      />
      
      {/* Main content */}
      <div className="ml-[216px]">
        {/* Global Navigation */}
        <GlobalNav 
          initials="EH"
          onMoveMoneyClick={() => console.log('Move Money clicked')}
          onNotificationsClick={() => console.log('Notifications clicked')}
        />
        
        {/* Render page based on activePath */}
        {/* #region agent log */}
        {(() => { fetch('http://127.0.0.1:7242/ingest/fa9275e2-70e9-43ca-a419-11bef518d4c6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'App.tsx:580',message:'Rendering page',data:{activePath},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H4'})}).catch(()=>{}); return null; })()}
        {/* #endregion */}
        {activePath === '/chat' ? (
          <ChatPage onNavigate={handleNavigate} />
        ) : activePath === '/home' ? (
          <HomePage onStartChat={handleStartChat} />
        ) : activePath === '/transactions' ? (
          <TransactionsPage urlFilter={urlParams.get('filter') || undefined} />
        ) : (
        <>
        {/* Sticky Insights Header - transforms layout on scroll, includes timeline */}
        <div 
          ref={headerRef}
          className="sticky top-0 z-40 bg-white transition-all duration-300 ease-out relative"
        >
          {/* Header content - fixed height container for smooth transitions */}
          <div 
            className="px-6 relative transition-[height] duration-300 ease-out"
            style={{
              height: isScrolled ? '56px' : '104px',
            }}
          >
            {/* Title - animates vertical position */}
            <h1 
              className="title-main absolute left-6 transition-all duration-300 ease-out"
              style={{
                top: isScrolled ? '12px' : '24px',
              }}
            >Insights</h1>
            
            {/* Controls row - contains both segmented control and dropdowns, always aligned */}
            <div 
              className="absolute left-6 right-6 flex items-center justify-between transition-all duration-300 ease-out z-20"
              style={{
                top: isScrolled ? '12px' : '64px',
                paddingLeft: isScrolled ? '108px' : '0px',
              }}
            >
              {/* Left: Segmented Control + Settings */}
              <div className="flex items-center gap-2">
                <FinancialSegmentedControl />
                
                {/* Settings button (vertical ellipsis) */}
                <button
                  type="button"
                  className="w-8 h-8 rounded-full bg-[rgba(112,115,147,0.1)] flex items-center justify-center text-[#70707d] hover:bg-[rgba(112,115,147,0.15)] transition-colors"
                  aria-label="More options"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="5" r="1.5" />
                    <circle cx="12" cy="12" r="1.5" />
                    <circle cx="12" cy="19" r="1.5" />
                  </svg>
                </button>
              </div>
              
              {/* Right: Period and Comparison dropdowns */}
              <div className="flex items-center gap-2">
                <PeriodDropdown value={timePeriod} onChange={handleTimePeriodChange} referenceDate={referenceDate} customDateRange={customDateRange} />
                <ComparisonDropdown 
                  value={comparisonMode} 
                  onChange={setComparisonMode} 
                  forceOpen={forceOpenComparison}
                  onOpenChange={handleComparisonOpenChange}
                />
              </div>
            </div>
          </div>

          {/* Timeline section - inside sticky header */}
          <div className="bg-white border-b border-[rgba(112,115,147,0.1)] relative z-10">
          <div 
            className="flex items-center"
            onMouseEnter={() => setIsTimelineHovered(true)}
            onMouseLeave={() => setIsTimelineHovered(false)}
          >
            {/* Left Arrow with padding */}
            <div className="pl-6 relative z-10">
              {/* Always show left arrow since we can always go back in time */}
              <button
              onClick={() => {
                // Shift the timeline by 6 months for monthly cadence, 1 year for yearly
                const shiftAmount = cadence === 'yearly' ? 12 : 6; // months
                const newRailStart = new Date(railStart);
                const newRailEnd = new Date(railEnd);
                newRailStart.setMonth(newRailStart.getMonth() - shiftAmount);
                newRailEnd.setMonth(newRailEnd.getMonth() - shiftAmount);
                
                setRailStart(newRailStart);
                setRailEnd(newRailEnd);
              }}
              className={`w-6 h-6 rounded-full transition-all duration-200 bg-white border border-gray-300 text-gray-600 hover:bg-gray-50 hover:text-gray-900 relative z-50 flex items-center justify-center ${isTimelineHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
              aria-label="Show earlier months"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              </button>
            </div>

            {/* Timeline - full width */}
            <div className="flex-1 min-w-0 relative" style={{ overflowX: 'clip' }}>
              <TimelineRange
                scale={timelineScale}
                startDate={railStart}
                endDate={railEnd}
                valueStart={valueStart}
                valueEnd={valueEnd}
                onChange={handleChange}
                onCommit={handleCommit}
                height={48}
                showMarker
                markerDate={markerDate}
                maxDate={referenceDate}
                comparisonMode={comparisonMode}
                onSelectionChange={handleSelectionChange}
                onComparisonChange={handleComparisonChange}
              />
              {/* Left fade gradient */}
              <div 
                className="absolute left-0 top-0 bottom-0 pointer-events-none z-10"
                style={{
                  width: '40px',
                  background: 'linear-gradient(to right, white, transparent)'
                }}
              />
              {/* Right fade gradient */}
              <div 
                className="absolute right-0 top-0 bottom-0 pointer-events-none z-10"
                style={{
                  width: '40px',
                  background: 'linear-gradient(to left, white, transparent)'
                }}
              />
            </div>

            {/* Right Arrow with padding */}
            <div className="pr-6 relative z-10">
              {/* Right Arrow - Shows later time periods - only show if we can go forward AND hovering */}
              {(() => {
              // Check if clicking the arrow would actually move the timeline
              const shiftAmount = cadence === 'yearly' ? 12 : 6; // months
              const newRailStart = new Date(railStart);
              const newRailEnd = new Date(railEnd);
              newRailStart.setMonth(newRailStart.getMonth() + shiftAmount);
              newRailEnd.setMonth(newRailEnd.getMonth() + shiftAmount);

              // Don't allow going past the current reference date (today)
              const maxDate = new Date(referenceDate);

              // Only show if the new rail end would be within the allowed range
              const canMoveForward = newRailEnd <= maxDate;
              console.log('Arrow visibility check:', {
                currentRailEnd: railEnd.toISOString(),
                newRailEnd: newRailEnd.toISOString(),
                maxDate: maxDate.toISOString(),
                canMoveForward
              });
              return canMoveForward;
            })() && (
              <button
                onClick={() => {
                  // Shift the timeline by 6 months for monthly cadence, 1 year for yearly
                  const shiftAmount = cadence === 'yearly' ? 12 : 6; // months
                  const newRailStart = new Date(railStart);
                  const newRailEnd = new Date(railEnd);
                  newRailStart.setMonth(newRailStart.getMonth() + shiftAmount);
                  newRailEnd.setMonth(newRailEnd.getMonth() + shiftAmount);

                  // Check if the new end would go beyond the current reference date
                  const maxDate = new Date(referenceDate);

                  if (newRailEnd <= maxDate) {
                    setRailStart(newRailStart);
                    setRailEnd(newRailEnd);
                  }
                }}
                className={`w-6 h-6 rounded-full transition-all duration-200 bg-white border border-gray-300 text-gray-600 hover:bg-gray-50 hover:text-gray-900 relative z-50 flex items-center justify-center ${isTimelineHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                aria-label="Show later months"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              )}
            </div>
          </div>
          </div>
          
          {/* Bottom shadow - only visible when scrolled, extends beyond container */}
          <div 
            className={`absolute left-0 right-0 h-3 pointer-events-none transition-opacity duration-300 ${
              isScrolled ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              bottom: '-12px',
              background: 'linear-gradient(to bottom, rgba(4,4,52,0.08) 0%, rgba(4,4,52,0.02) 40%, transparent 100%)',
            }}
          />
        </div>

        {/* Content Section - Side by side layout */}
        <div className="py-8">
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            {/* Scorecard - Left side */}
            <div className="xl:col-span-4 w-full px-0 h-[480px] overflow-auto">
              <Scorecard
                netCashflow={formatCurrency(transactionsSummary.netChange, true)}
                moneyIn={formatCurrency(transactionsSummary.moneyIn)}
                moneyOut={`–${formatCurrency(transactionsSummary.moneyOut)}`}
                insights={sampleInsights}
                onInsightClick={handleInsightClick}
              />
            </div>

            {/* Cash Flow Chart Section - Right side */}
            <div className="xl:col-span-8 pr-6">
              {chartData.length === 0 ? (
                <div className="flex h-96 items-center justify-center text-gray-500 border rounded-xl bg-white">
                  <div className="text-center">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400 mb-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                    <p className="text-lg font-medium tracking-[-0.01em]">No data in the selected range</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Try selecting a different time period on the timeline above
                    </p>
                  </div>
                </div>
              ) : (
                <CashFlowBarChart 
                  data={chartData} 
                  height={480} 
                  cadence={cadence}
                  onCadenceChange={handleCadenceChange}
                  selectionStart={valueStart}
                  selectionEnd={valueEnd}
                  gradientSettingsMoneyOut={gradientSettingsMoneyOut}
                  gradientSettingsMoneyIn={gradientSettingsMoneyIn}
                  categoryLabel={cadence === 'days' ? 'Day' : cadence === 'monthly' ? 'Month' : cadence === 'quarterly' ? 'Quarter' : 'Year'}
                />
              )}
            </div>
          </div>

          {/* Insights Breakdown Section */}
          <InsightsBreakdown
            moneyInTotal={formatCurrency(transactionsSummary.moneyIn)}
            moneyOutTotal={`–${formatCurrency(transactionsSummary.moneyOut)}`}
          />
          
          {/* Interactive Gradient Playground - hidden by default, toggleable via Data Control Panel */}
          {showGradientPlayground && (
            <div className="mt-12 px-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6 tracking-[-0.01em]">Gradient Playground</h2>
              <p className="text-sm text-gray-600 mb-4">Adjust the gradient controls below to modify the appearance of bars in the chart above.</p>
              <DualGradientPlayground
                moneyOutSettings={gradientSettingsMoneyOut}
                moneyInSettings={gradientSettingsMoneyIn}
                onMoneyOutChange={handleMoneyOutChange}
                onMoneyInChange={handleMoneyInChange}
                onMoneyOutReset={handleMoneyOutReset}
                onMoneyInReset={handleMoneyInReset}
              />
            </div>
          )}
        </div>
        </>
        )}
      </div>
      
      {/* Data Control Panel - Available on both pages */}
      {(activePath === '/transactions' || activePath === '/insights') && (
        <>
          <DataControlTrigger onClick={() => setIsControlPanelOpen(true)} />
          <DataControlPanel
            isOpen={isControlPanelOpen}
            onClose={() => setIsControlPanelOpen(false)}
            onApply={handleApplyData}
            currentCount={transactions.length}
            showGradientPlayground={activePath === '/insights' ? showGradientPlayground : undefined}
            onToggleGradientPlayground={activePath === '/insights' ? setShowGradientPlayground : undefined}
          />
        </>
      )}
      
      {/* Floating Chat - shown when navigated away from chat with active conversation */}
      {isFloating && activePath !== '/chat' && (
        <FloatingChat
          onNavigate={handleNavigate}
          onClose={handleCloseChat}
          onExpand={handleExpandChat}
        />
      )}
    </div>
  );
}

export default App;

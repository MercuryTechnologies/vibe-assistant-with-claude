import { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { useTransactions } from '@/hooks';
import { 
  transactionsToCashFlow, 
  aggregateByCadence, 
  filterTransactionsByDateRange, 
  calculateTransactionsSummary, 
  insightsFormatCurrency, 
  getLatestTransactionDate,
  type Cadence,
  type DateRange,
} from '@/lib/insights-utils';
import { 
  TimelineRange, 
  CashFlowBarChart, 
  FinancialSegmentedControl, 
  PeriodDropdown, 
  ComparisonDropdown,
  type Scale,
  type ComparisonMode,
  type TimeRange,
  type TimePeriod,
  type FinancialCategory,
  type GradientSettings,
  type GradientSettingsMoneyIn,
} from '@/components/insights';
import { Scorecard, type Insight } from '@/components/Scorecard';
import { InsightsBreakdown, type BreakdownItem } from '@/components/InsightsBreakdown';
import type { Transaction } from '@/types';

// Date utility functions
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
      return [startOfMonth(today), today];
    case 'qtd':
      return [startOfQuarter(today), today];
    case 'ytd':
      return [startOfYear(today), today];
    case 'lastMonth': {
      const end = new Date(today.getFullYear(), today.getMonth(), 0, 23, 59, 59, 999);
      const start = new Date(end.getFullYear(), end.getMonth(), 1, 0, 0, 0, 0);
      return [start, end];
    }
    case 'lastQuarter': {
      const currentQuarter = Math.floor(today.getMonth() / 3);
      const lastQuarter = currentQuarter === 0 ? 3 : currentQuarter - 1;
      const lastQuarterYear = currentQuarter === 0 ? today.getFullYear() - 1 : today.getFullYear();
      const start = new Date(lastQuarterYear, lastQuarter * 3, 1, 0, 0, 0, 0);
      const end = new Date(lastQuarterYear, lastQuarter * 3 + 3, 0, 23, 59, 59, 999);
      return [start, end];
    }
    case 'last30d': {
      const start30d = new Date(today);
      start30d.setDate(start30d.getDate() - 30);
      start30d.setHours(0, 0, 0, 0);
      return [start30d, today];
    }
    case 'last3m': {
      const start3m = new Date(today);
      start3m.setMonth(start3m.getMonth() - 3);
      start3m.setHours(0, 0, 0, 0);
      return [start3m, today];
    }
    case 'last6m': {
      const start6m = new Date(today);
      start6m.setMonth(start6m.getMonth() - 6);
      start6m.setHours(0, 0, 0, 0);
      return [start6m, today];
    }
    case 'last12m': {
      const start12m = new Date(today);
      start12m.setMonth(start12m.getMonth() - 12);
      start12m.setHours(0, 0, 0, 0);
      return [start12m, today];
    }
    default:
      return [startOfMonth(today), today];
  }
}

// Aggregate transactions by category
function aggregateByCategory(transactions: Transaction[], direction: 'in' | 'out'): { category: string; amount: number }[] {
  const byCategory: Record<string, number> = {};
  
  for (const t of transactions) {
    if (direction === 'in' && t.amount <= 0) continue;
    if (direction === 'out' && t.amount >= 0) continue;
    
    const category = t.category || 'Other';
    byCategory[category] = (byCategory[category] || 0) + Math.abs(t.amount);
  }
  
  return Object.entries(byCategory)
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount);
}

// Aggregate transactions by merchant
function aggregateByMerchant(transactions: Transaction[], direction: 'in' | 'out'): { merchant: string; amount: number }[] {
  const byMerchant: Record<string, number> = {};
  
  for (const t of transactions) {
    if (direction === 'in' && t.amount <= 0) continue;
    if (direction === 'out' && t.amount >= 0) continue;
    
    byMerchant[t.merchant] = (byMerchant[t.merchant] || 0) + Math.abs(t.amount);
  }
  
  return Object.entries(byMerchant)
    .map(([merchant, amount]) => ({ merchant, amount }))
    .sort((a, b) => b.amount - a.amount);
}

// Default gradient settings
const defaultGradientSettingsMoneyOut: GradientSettings = {
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
};

const defaultGradientSettingsMoneyIn: GradientSettingsMoneyIn = {
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
};

export function Insights() {
  const { transactions, isLoading } = useTransactions();
  
  // State
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('ytd');
  const [cadence, setCadence] = useState<Cadence>('monthly');
  const [comparisonMode, setComparisonMode] = useState<ComparisonMode>('Off');
  const [customDateRange, setCustomDateRange] = useState<string>('');
  const [financialCategory, setFinancialCategory] = useState<FinancialCategory>('cashflow');
  const [isTimelineHovered, setIsTimelineHovered] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);
  
  const [chartOptions, setChartOptions] = useState({
    showCashflowLine: true,
    showBars: true,
  });
  
  // Reference date
  const referenceDate = useMemo(() => {
    const latestDate = getLatestTransactionDate(transactions);
    return latestDate || new Date();
  }, [transactions]);
  
  // Rail dates (timeline visible range)
  const [railStart, setRailStart] = useState<Date>(() => {
    const now = new Date();
    return new Date(now.getFullYear() - 1, 0, 1);
  });
  const [railEnd, setRailEnd] = useState<Date>(() => {
    const now = new Date();
    const end = new Date(now);
    end.setMonth(end.getMonth() + 3);
    return end;
  });
  
  // Selected date range
  const [valueStart, setValueStart] = useState<Date>(() => {
    const now = new Date();
    return new Date(now.getFullYear(), 0, 1);
  });
  const [valueEnd, setValueEnd] = useState<Date>(() => new Date());
  
  // Committed time range for charts
  const [committedTimeRange, setCommittedTimeRange] = useState<DateRange | null>(null);
  
  // Initialize committed time range
  useEffect(() => {
    setCommittedTimeRange({ start: valueStart, end: valueEnd });
  }, []);
  
  // Update date range when time period changes
  useEffect(() => {
    if (timePeriod !== 'custom') {
      const [start, end] = getDateRangeForPeriod(timePeriod, referenceDate);
      setValueStart(start);
      setValueEnd(end);
      setCommittedTimeRange({ start, end });
    }
  }, [timePeriod, referenceDate]);
  
  // Scroll tracking
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 80);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Convert transactions to cash flow records
  const cashFlowData = useMemo(() => {
    return transactionsToCashFlow(transactions);
  }, [transactions]);
  
  // Filter transactions by committed time range
  const filteredTransactions = useMemo(() => {
    return filterTransactionsByDateRange(transactions, committedTimeRange);
  }, [transactions, committedTimeRange]);
  
  // Calculate summary values
  const transactionsSummary = useMemo(() => {
    return calculateTransactionsSummary(filteredTransactions);
  }, [filteredTransactions]);
  
  // Chart data
  const chartData = useMemo(() => {
    const aggregated = aggregateByCadence(cashFlowData, committedTimeRange, cadence);
    return aggregated.map(item => ({
      month: item.label,
      moneyIn: item.moneyIn,
      moneyOut: -item.moneyOut,
    }));
  }, [cashFlowData, committedTimeRange, cadence]);
  
  // Convert cadence to scale
  const timelineScale = useMemo((): Scale => {
    switch (cadence) {
      case 'days': return 'month';
      case 'monthly': return 'year';
      default: return 'year';
    }
  }, [cadence]);
  
  // Format date range
  const formatDateRange = useCallback((start: Date, end: Date): string => {
    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  }, []);
  
  // Handle timeline changes
  const handleChange = useCallback((s: Date, e: Date) => {
    setValueStart(s);
    setValueEnd(e);
    if (timePeriod === 'custom') {
      setCustomDateRange(formatDateRange(s, e));
    }
  }, [timePeriod, formatDateRange]);
  
  const handleCommit = useCallback((s: Date, e: Date) => {
    setCommittedTimeRange({ start: s, end: e });
    setTimePeriod('custom');
    setCustomDateRange(formatDateRange(s, e));
  }, [formatDateRange]);
  
  const handleTimePeriodChange = useCallback((period: TimePeriod) => {
    setTimePeriod(period);
    if (period !== 'custom') {
      setCustomDateRange('');
    }
  }, []);
  
  const handleCadenceChange = useCallback((newCadence: Cadence) => {
    setCadence(newCadence);
  }, []);
  
  const handleComparisonChange = useCallback((_comparison: TimeRange | null, mode: ComparisonMode) => {
    setComparisonMode(mode);
  }, []);
  
  const handleChartOptionsChange = useCallback((options: Partial<typeof chartOptions>) => {
    setChartOptions(prev => ({ ...prev, ...options }));
  }, []);
  
  // Generate insights
  const insights = useMemo((): Insight[] => {
    if (filteredTransactions.length === 0) return [];
    
    const categorySpending = aggregateByCategory(filteredTransactions, 'out');
    const topCategory = categorySpending[0];
    
    return [
      {
        id: '1',
        type: 'negative' as const,
        title: `High spend on ${topCategory?.category || 'Software'}`,
        description: `${topCategory?.category || 'Software'} spend totaled ${insightsFormatCurrency(topCategory?.amount || 0)} in this period.`
      },
      {
        id: '2',
        type: transactionsSummary.netChange > 0 ? 'positive' as const : 'negative' as const,
        title: transactionsSummary.netChange > 0 ? 'Positive cash flow' : 'Negative cash flow',
        description: `Net change of ${insightsFormatCurrency(transactionsSummary.netChange)} over this period.`
      },
      {
        id: '3',
        type: 'positive' as const,
        title: `${filteredTransactions.length} transactions processed`,
        description: `Money in: ${insightsFormatCurrency(transactionsSummary.moneyIn)}, Money out: ${insightsFormatCurrency(transactionsSummary.moneyOut)}.`
      }
    ];
  }, [filteredTransactions, transactionsSummary]);
  
  // Generate breakdown data
  const { moneyInItems, moneyOutItems } = useMemo(() => {
    if (filteredTransactions.length === 0) return { moneyInItems: [], moneyOutItems: [] };
    
    // Money in by source
    const moneyInBySource = aggregateByMerchant(filteredTransactions, 'in');
    const topMoneyInSources = moneyInBySource.slice(0, 7);
    const remainingMoneyIn = moneyInBySource.slice(7).reduce((sum, s) => sum + s.amount, 0);
    
    const moneyInTotal = transactionsSummary.moneyIn;
    const moneyInItems: BreakdownItem[] = topMoneyInSources.map(source => ({
      label: source.merchant,
      percentage: moneyInTotal > 0 ? Math.round((source.amount / moneyInTotal) * 100) : 0,
      amount: source.amount,
    }));
    
    if (remainingMoneyIn > 0) {
      moneyInItems.push({
        label: 'Remaining sources',
        percentage: moneyInTotal > 0 ? Math.round((remainingMoneyIn / moneyInTotal) * 100) : 0,
        amount: remainingMoneyIn,
      });
    }
    
    // Money out by category
    const categorySpending = aggregateByCategory(filteredTransactions, 'out');
    const topCategories = categorySpending.slice(0, 7);
    const remainingMoneyOut = categorySpending.slice(7).reduce((sum, c) => sum + c.amount, 0);
    
    const moneyOutTotal = transactionsSummary.moneyOut;
    const moneyOutItems: BreakdownItem[] = topCategories.map(cat => ({
      label: cat.category,
      percentage: moneyOutTotal > 0 ? Math.round((cat.amount / moneyOutTotal) * 100) : 0,
      amount: cat.amount,
    }));
    
    if (remainingMoneyOut > 0) {
      moneyOutItems.push({
        label: 'Remaining categories',
        percentage: moneyOutTotal > 0 ? Math.round((remainingMoneyOut / moneyOutTotal) * 100) : 0,
        amount: remainingMoneyOut,
      });
    }
    
    return { moneyInItems, moneyOutItems };
  }, [filteredTransactions, transactionsSummary]);
  
  const handleInsightClick = (insight: Insight) => {
    console.log('Insight clicked:', insight);
  };
  
  if (isLoading) {
    return (
      <div className="px-4">
        <h1 className="text-title-main mb-3">Insights</h1>
        <div className="flex items-center justify-center py-12">
          <span className="text-body" style={{ color: 'var(--ds-text-tertiary)' }}>Loading...</span>
        </div>
      </div>
    );
  }
  
  return (
    <div className="insights-page">
      {/* Page Title */}
      <div className="px-4 mb-3">
        <h1 className="text-title-main m-0">Insights</h1>
      </div>
      
      {/* Header */}
      <div 
        ref={headerRef}
        className={`insights-header ${isScrolled ? 'scrolled' : ''}`}
      >
        {/* Controls Row */}
        <div className="insights-controls">
          <div className="insights-controls-left">
            <FinancialSegmentedControl 
              value={financialCategory} 
              onChange={setFinancialCategory} 
            />
          </div>
          <div className="insights-controls-right">
            <PeriodDropdown 
              value={timePeriod} 
              onChange={handleTimePeriodChange} 
              referenceDate={referenceDate} 
              customDateRange={customDateRange} 
            />
            <ComparisonDropdown 
              value={comparisonMode} 
              onChange={setComparisonMode} 
            />
          </div>
        </div>
        
        {/* Timeline */}
        <div 
          className="insights-timeline-wrapper"
          onMouseEnter={() => setIsTimelineHovered(true)}
          onMouseLeave={() => setIsTimelineHovered(false)}
        >
          <div className="insights-timeline-arrow left">
            <button
              onClick={() => {
                const shiftAmount = cadence === 'yearly' ? 12 : 6;
                const newRailStart = new Date(railStart);
                const newRailEnd = new Date(railEnd);
                newRailStart.setMonth(newRailStart.getMonth() - shiftAmount);
                newRailEnd.setMonth(newRailEnd.getMonth() - shiftAmount);
                setRailStart(newRailStart);
                setRailEnd(newRailEnd);
              }}
              className={`timeline-nav-button ${isTimelineHovered ? 'visible' : ''}`}
              aria-label="Show earlier months"
            >
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          </div>
          
          <div className="insights-timeline">
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
              markerDate={referenceDate}
              maxDate={referenceDate}
              comparisonMode={comparisonMode}
              onComparisonChange={handleComparisonChange}
            />
            <div className="insights-timeline-fade left" />
            <div className="insights-timeline-fade right" />
          </div>
          
          <div className="insights-timeline-arrow right">
            <button
              onClick={() => {
                const shiftAmount = cadence === 'yearly' ? 12 : 6;
                const newRailStart = new Date(railStart);
                const newRailEnd = new Date(railEnd);
                newRailStart.setMonth(newRailStart.getMonth() + shiftAmount);
                newRailEnd.setMonth(newRailEnd.getMonth() + shiftAmount);
                if (newRailEnd <= referenceDate) {
                  setRailStart(newRailStart);
                  setRailEnd(newRailEnd);
                }
              }}
              className={`timeline-nav-button ${isTimelineHovered ? 'visible' : ''}`}
              aria-label="Show later months"
            >
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Scroll shadow */}
        <div className={`insights-header-shadow ${isScrolled ? 'visible' : ''}`} />
      </div>
      
      {/* Content */}
      <div className="insights-content">
        <div className="insights-main-grid">
          {/* Scorecard */}
          <div className="insights-scorecard">
            <Scorecard
              netCashflow={insightsFormatCurrency(transactionsSummary.netChange, true)}
              moneyIn={insightsFormatCurrency(transactionsSummary.moneyIn)}
              moneyOut={`–${insightsFormatCurrency(transactionsSummary.moneyOut)}`}
              insights={insights}
              onInsightClick={handleInsightClick}
            />
          </div>
          
          {/* Chart */}
          <div className="insights-chart">
            {chartData.length === 0 ? (
              <div className="insights-chart-empty">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <p className="text-body-lg-demi">No data in the selected range</p>
                <p className="text-body" style={{ color: 'var(--ds-text-tertiary)' }}>
                  Try selecting a different time period on the timeline above
                </p>
              </div>
            ) : (
              <CashFlowBarChart
                data={chartData}
                height={480}
                cadence={cadence}
                onCadenceChange={handleCadenceChange}
                selectionStart={valueStart}
                selectionEnd={valueEnd}
                gradientSettingsMoneyOut={defaultGradientSettingsMoneyOut}
                gradientSettingsMoneyIn={defaultGradientSettingsMoneyIn}
                categoryLabel={cadence === 'days' ? 'Day' : cadence === 'monthly' ? 'Month' : cadence === 'quarterly' ? 'Quarter' : 'Year'}
                chartOptions={chartOptions}
                onChartOptionsChange={handleChartOptionsChange}
              />
            )}
          </div>
        </div>
        
        {/* Breakdown */}
        <InsightsBreakdown
          moneyInTotal={insightsFormatCurrency(transactionsSummary.moneyIn)}
          moneyOutTotal={`–${insightsFormatCurrency(transactionsSummary.moneyOut)}`}
          moneyInItems={moneyInItems.length > 0 ? moneyInItems : undefined}
          moneyOutItems={moneyOutItems.length > 0 ? moneyOutItems : undefined}
        />
      </div>
    </div>
  );
}

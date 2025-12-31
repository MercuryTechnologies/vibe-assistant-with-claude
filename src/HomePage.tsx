import React, { useState, useMemo } from 'react';
import { useAppStore } from './store';
import GradientCard from './GradientCard';
import GradientCardMoneyIn from './GradientCardMoneyIn';
import SegmentedControl from './SegmentedControl';
import Dropdown, { type Cadence } from './Dropdown';

// Types
interface Account {
  id: string;
  name: string;
  balance: number;
}

interface FeedItem {
  id: string;
  date: string;
  title: string;
  description: string;
  isPositive?: boolean;
}

// Time period options
type TimePeriod = '7' | '30' | '90' | 'YTD' | 'LastYear';

// Helper to format large numbers
function formatLargeNumber(amount: number): string {
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}M`;
  }
  if (amount >= 1000) {
    return `${(amount / 1000).toFixed(1)}K`;
  }
  return amount.toFixed(0);
}

// Time Period Pills Component
interface TimePeriodPillsProps {
  value: TimePeriod;
  onChange: (value: TimePeriod) => void;
}

function TimePeriodPills({ value, onChange }: TimePeriodPillsProps) {
  const periods: { key: TimePeriod; label: string }[] = [
    { key: '7', label: '7' },
    { key: '30', label: '30' },
    { key: '90', label: '90' },
    { key: 'YTD', label: 'YTD' },
    { key: 'LastYear', label: 'Last year' },
  ];

  return (
    <div className="flex items-center gap-0.5">
      {periods.map(({ key, label }) => (
        <button
          key={key}
          type="button"
          onClick={() => onChange(key)}
          className={`px-2 py-0.5 text-[13px] tracking-[0.1px] rounded-md transition-all ${
            value === key
              ? 'bg-[rgba(112,115,147,0.1)] font-[480] text-black tracking-[0.2px]'
              : 'text-[#70707d] hover:text-[#363644]'
          }`}
        >
          {label}
        </button>
      ))}
      <button
        type="button"
        className="p-0.5 text-[#70707d] hover:text-[#363644]"
        aria-label="More options"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    </div>
  );
}

// Account Row Component
interface AccountRowProps {
  name: string;
  balance: string;
}

function AccountRow({ name, balance }: AccountRowProps) {
  return (
    <div className="flex items-center justify-between p-2 rounded-lg hover:bg-[rgba(112,115,147,0.05)] transition-colors cursor-pointer">
      <span className="text-[14px] text-[#363644] font-[440]">{name}</span>
      <span className="text-[14px] text-[#363644] font-[440] tabular-nums">{balance}</span>
    </div>
  );
}

// Accounts Card Component
interface AccountsCardProps {
  title: string;
  totalBalance: string;
  percentage?: string;
  accounts?: Account[];
  showChart?: boolean;
}

function AccountsCard({ title, totalBalance, percentage, accounts, showChart }: AccountsCardProps) {
  return (
    <div className="bg-white rounded-none pt-6 pb-4 px-6">
      {/* Header */}
      <div className="flex items-start justify-between px-2 mb-1">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5">
            <span className="text-[14px] text-[#363644] font-[440]">{title}</span>
            <button type="button" className="text-[#9d9db0] hover:text-[#70707d]" aria-label="Info">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
              </svg>
            </button>
          </div>
          <span className="font-display text-[24px] font-[440] text-[#1e1e2a] leading-[32px]">{totalBalance}</span>
          {percentage && (
            <span className="text-[12px] text-[#70707d] font-[440]">{percentage}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="w-6 h-6 rounded-full bg-[rgba(112,115,147,0.1)] flex items-center justify-center text-[#70707d] hover:bg-[rgba(112,115,147,0.15)]"
            aria-label="Transfer"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
            </svg>
          </button>
          <button
            type="button"
            className="w-6 h-6 rounded-full bg-[rgba(112,115,147,0.1)] flex items-center justify-center text-[#70707d] hover:bg-[rgba(112,115,147,0.15)]"
            aria-label="Add"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </button>
        </div>
      </div>

      {/* Account List */}
      {accounts && accounts.length > 0 && (
        <div className="mt-4">
          {accounts.map((account) => (
            <AccountRow
              key={account.id}
              name={account.name}
              balance={`$${account.balance.toLocaleString()}`}
            />
          ))}
        </div>
      )}

      {/* Mini Chart (for Treasury) - Figma design spec */}
      {showChart && (
        <div className="mt-4 px-6">
          <div className="flex items-end gap-px h-[56px]">
            {/* Bar heights from Figma design: 23, 16, 23, 16, 23, 16, 23, 16, 16, 23, 16, 23, 23, 12, 12, 12, 16, 16, 23, 23, 34, 23, 40, 51, 56, 51 */}
            {[23, 16, 23, 16, 23, 16, 23, 16, 16, 23, 16, 23, 23, 12, 12, 12, 16, 16, 23, 23, 34, 23, 40, 51, 56, 51].map((height, i) => (
              <div
                key={i}
                className="flex-1 flex flex-col justify-end min-w-0 opacity-50"
                style={{ height: `${height}px` }}
              >
                <div 
                  className="w-full h-full"
                  style={{
                    borderTop: '1px solid #4d68eb',
                    background: `radial-gradient(ellipse 100% ${height * 10}% at 50% 0%, rgba(214,214,255,0.7) 0%, rgba(239,239,253,0.3) 100%)`,
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Feed Item Component (without date - date is handled by parent)
interface FeedItemContentProps {
  title: string;
  description: string;
  isPositive?: boolean;
  showConnector?: boolean;
}

function FeedItemContent({ title, description, isPositive, showConnector }: FeedItemContentProps) {
  return (
    <div className="flex gap-3 flex-1">
      {/* Timeline dot and connector */}
      <div className="flex flex-col items-center">
        <div className="w-[6px] h-[6px] rounded-full bg-[#d9d9e0] mt-1.5" />
        {showConnector && <div className="w-[1px] flex-1 bg-[#e8e8f0] min-h-[32px]" />}
      </div>
      
      {/* Content */}
      <div className="flex-1 pb-3">
        <div className="font-[480] text-[14px] text-[#1e1e2a] leading-[24px]">{title}</div>
        <div className={`text-[14px] leading-[20px] ${isPositive ? 'text-[#188554]' : 'text-[#535461]'}`}>
          {description}
        </div>
      </div>
    </div>
  );
}

// Extended Feed Item with month info
interface ExtendedFeedItem extends FeedItem {
  month: string;
  monthShort: string;
  day: string;
}

// Feed Section Component
interface FeedSectionProps {
  items: ExtendedFeedItem[];
}

function FeedSection({ items }: FeedSectionProps) {
  const [activeTab, setActiveTab] = useState<'Feed' | 'Alerts' | 'Trends'>('Feed');

  // Group items by month
  const groupedItems = useMemo(() => {
    const groups: { month: string; monthShort: string; items: ExtendedFeedItem[] }[] = [];
    let currentMonth = '';
    
    items.forEach((item) => {
      if (item.month !== currentMonth) {
        currentMonth = item.month;
        groups.push({ month: currentMonth, monthShort: item.monthShort, items: [item] });
      } else {
        groups[groups.length - 1].items.push(item);
      }
    });
    
    return groups;
  }, [items]);

  return (
    <div className="bg-white pt-6 pb-4 h-full flex flex-col">
      {/* Tabs */}
      <div className="flex items-center justify-between px-6 mb-6 flex-shrink-0">
        <div className="flex items-center gap-5">
          {(['Feed', 'Alerts', 'Trends'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`text-[14px] font-[440] transition-colors ${
                activeTab === tab ? 'text-[#1e1e2a]' : 'text-[#9d9da8] hover:text-[#70707d]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="w-6 h-6 rounded-full bg-[rgba(112,115,147,0.1)] flex items-center justify-center text-[#70707d] hover:bg-[rgba(112,115,147,0.15)]"
          aria-label="More options"
        >
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="5" r="2" />
            <circle cx="12" cy="12" r="2" />
            <circle cx="12" cy="19" r="2" />
          </svg>
        </button>
      </div>

      {/* Feed Items with scroll and sticky month labels */}
      <div className="relative flex-1 min-h-0">
        <div className="absolute inset-0 px-6 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
          {groupedItems.map((group, groupIndex) => (
            <div key={group.month} className="relative">
              {/* Sticky Month Label - positioned absolutely to stay in place */}
              <div 
                className="sticky top-0 z-10 flex items-start bg-white"
                style={{ 
                  height: '24px',
                  marginBottom: '-24px', // Negative margin so first item overlaps
                }}
              >
                <div className="text-[13px] text-[#535461] w-[28px] shrink-0 pt-[1px]">
                  {group.monthShort}
                </div>
              </div>
              
              {/* Items in this month */}
              {group.items.map((item, itemIndex) => {
                // Determine if we should show connector
                const isLastInGroup = itemIndex === group.items.length - 1;
                const isLastGroup = groupIndex === groupedItems.length - 1;
                const showConnector = !(isLastInGroup && isLastGroup);
                
                return (
                  <div key={item.id} className="flex items-start">
                    {/* Month column spacer */}
                    <div className="w-[28px] shrink-0" />
                    
                    {/* Day column */}
                    <div className="w-[20px] text-[13px] text-[#535461] text-right shrink-0 mr-3">
                      {item.day}
                    </div>
                    
                    {/* Feed item content */}
                    <FeedItemContent
                      title={item.title}
                      description={item.description}
                      isPositive={item.isPositive}
                      showConnector={showConnector}
                    />
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        {/* Fade overlay at bottom */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none z-20"
          style={{
            background: 'linear-gradient(to top, rgba(255,255,255,1) 0%, rgba(255,255,255,0.9) 30%, rgba(255,255,255,0) 100%)',
          }}
        />
      </div>
    </div>
  );
}

// Chart data point - can represent a month or a day
interface ChartDataPoint {
  label: string; // Display label (month name or day number)
  moneyIn: number;
  moneyOut: number;
  xPosition: number; // Position on the chart (0-1000 in viewBox)
  date: Date; // Actual date for the data point
}

// For backward compatibility
type MonthData = ChartDataPoint;

// Base data for all months (assuming current year 2024)
const allChartMonthlyData: ChartDataPoint[] = [
  { label: 'Jan', moneyIn: 12500, moneyOut: 8000, xPosition: 0, date: new Date(2024, 0, 15) },
  { label: 'Feb', moneyIn: 9000, moneyOut: 11000, xPosition: 83, date: new Date(2024, 1, 15) },
  { label: 'Mar', moneyIn: 14000, moneyOut: 7500, xPosition: 166, date: new Date(2024, 2, 15) },
  { label: 'Apr', moneyIn: 8500, moneyOut: 9500, xPosition: 250, date: new Date(2024, 3, 15) },
  { label: 'May', moneyIn: 11000, moneyOut: 12000, xPosition: 333, date: new Date(2024, 4, 15) },
  { label: 'Jun', moneyIn: 10000, moneyOut: 8000, xPosition: 416, date: new Date(2024, 5, 15) },
  { label: 'Jul', moneyIn: 15000, moneyOut: 6000, xPosition: 500, date: new Date(2024, 6, 15) },
  { label: 'Aug', moneyIn: 12000, moneyOut: 9000, xPosition: 583, date: new Date(2024, 7, 15) },
  { label: 'Sep', moneyIn: 9500, moneyOut: 10500, xPosition: 666, date: new Date(2024, 8, 15) },
  { label: 'Oct', moneyIn: 13000, moneyOut: 8500, xPosition: 750, date: new Date(2024, 9, 15) },
  { label: 'Nov', moneyIn: 11500, moneyOut: 7000, xPosition: 833, date: new Date(2024, 10, 15) },
  { label: 'Dec', moneyIn: 10000, moneyOut: 9000, xPosition: 916, date: new Date(2024, 11, 15) },
];

// Generate daily data for a given number of days
function generateDailyData(days: number): ChartDataPoint[] {
  const today = new Date(2024, 11, 17); // Dec 17, 2024
  const data: ChartDataPoint[] = [];
  
  // Generate random but consistent daily data using a seeded approach
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    
    // Generate pseudo-random values based on day of year for consistency
    const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    const seed = dayOfYear * 1234;
    
    // Create varied but reasonable daily values
    const baseIn = 300 + (seed % 500);
    const baseOut = 250 + ((seed * 7) % 450);
    const variance = Math.sin(dayOfYear * 0.3) * 150;
    
    const moneyIn = Math.max(50, baseIn + variance + (dayOfYear % 3 === 0 ? 200 : 0));
    const moneyOut = Math.max(50, baseOut - variance + (dayOfYear % 5 === 0 ? 150 : 0));
    
    // Format label based on day
    const dayNum = date.getDate();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const label = dayNum === 1 || i === days - 1 ? `${monthNames[date.getMonth()]} ${dayNum}` : `${dayNum}`;
    
    data.push({
      label,
      moneyIn,
      moneyOut,
      xPosition: 0, // Will be calculated dynamically
      date,
    });
  }
  
  return data;
}

// Generate quarterly data
function generateQuarterlyData(): ChartDataPoint[] {
  const quarterlyData: ChartDataPoint[] = [
    { label: 'Q1', moneyIn: 35500, moneyOut: 26500, xPosition: 0, date: new Date(2024, 2, 15) },   // Jan-Mar
    { label: 'Q2', moneyIn: 29500, moneyOut: 29500, xPosition: 250, date: new Date(2024, 5, 15) }, // Apr-Jun
    { label: 'Q3', moneyIn: 36500, moneyOut: 20500, xPosition: 500, date: new Date(2024, 8, 15) }, // Jul-Sep
    { label: 'Q4', moneyIn: 34500, moneyOut: 24500, xPosition: 750, date: new Date(2024, 11, 15) }, // Oct-Dec
  ];
  return quarterlyData;
}

// Get the number of days for a time period
function getDaysForPeriod(timePeriod: TimePeriod): number {
  switch (timePeriod) {
    case '7': return 7;
    case '30': return 30;
    case '90': return 90;
    case 'YTD': return 351; // Approx days from Jan 1 to Dec 17
    case 'LastYear': return 365;
    default: return 365;
  }
}

// Get date range for time period
function getDateRangeForPeriod(timePeriod: TimePeriod): { start: Date; end: Date } {
  const today = new Date(2024, 11, 17); // Dec 17, 2024
  const end = new Date(today);
  let start: Date;
  
  switch (timePeriod) {
    case '7':
      start = new Date(today);
      start.setDate(today.getDate() - 7);
      break;
    case '30':
      start = new Date(today);
      start.setDate(today.getDate() - 30);
      break;
    case '90':
      start = new Date(today);
      start.setDate(today.getDate() - 90);
      break;
    case 'YTD':
      start = new Date(2024, 0, 1); // Jan 1, 2024
      break;
    case 'LastYear':
      start = new Date(2023, 0, 1); // Jan 1, 2023
      break;
    default:
      start = new Date(2024, 0, 1);
  }
  
  return { start, end };
}

// Filter data based on time period and cadence
function getFilteredChartData(timePeriod: TimePeriod, cadence: Cadence): ChartDataPoint[] {
  const days = getDaysForPeriod(timePeriod);
  
  switch (cadence) {
    case 'days': {
      // Show daily data
      return generateDailyData(days);
    }
    case 'monthly': {
      // Show monthly data
      if (timePeriod === '7') {
        // For 7 days, just show the current month
        return allChartMonthlyData.filter(d => d.label === 'Dec');
      } else if (timePeriod === '30') {
        // For 30 days, show Nov and Dec
        return allChartMonthlyData.filter(d => ['Nov', 'Dec'].includes(d.label));
      } else if (timePeriod === '90') {
        // For 90 days, show Oct, Nov, Dec
        return allChartMonthlyData.filter(d => ['Oct', 'Nov', 'Dec'].includes(d.label));
      }
      return allChartMonthlyData;
    }
    case 'quarterly': {
      // Show quarterly data
      const quarterlyData = generateQuarterlyData();
      if (timePeriod === '90') {
        return quarterlyData.filter(d => d.label === 'Q4');
      }
      return quarterlyData;
    }
    case 'yearly': {
      // Show yearly data
      return [
        { label: '2024', moneyIn: 136000, moneyOut: 101000, xPosition: 0, date: new Date(2024, 6, 1) },
      ];
    }
    default:
      return allChartMonthlyData;
  }
}

// Gradient settings for bars (matching Insights page)
const gradientSettingsMoneyOut = {
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

const gradientSettingsMoneyIn = {
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

// Desaturated gradient settings for adjacent bars (10% opacity look)
const gradientSettingsMoneyOutDesaturated = {
  baseColor: '#6b6b7a', // Desaturated gray-purple
  topGlowColor: '#c0b0b8', // Desaturated pink
  bottomGlowColor: '#7a8a8f', // Desaturated teal
  topGlowOpacity: 0.2,
  bottomGlowOpacity: 0.5,
  topBlurIntensity: 1.0,
  bottomBlurIntensity: 1.0,
  topGlowSize: 0.6,
  bottomGlowSize: 0.8,
  topGlowOffset: 0,
  bottomGlowOffset: 0,
};

const gradientSettingsMoneyInDesaturated = {
  topGradientColor: '#e0e4e8', // Desaturated light gray
  bottomGradientColor: '#dddce8', // Desaturated light purple-gray
  topGlowColor: '#c8cce0', // Desaturated blue
  bottomGlowColor: '#b8d0c0', // Desaturated green
  topGlowOpacity: 0.5,
  bottomGlowOpacity: 0.4,
  topBlurIntensity: 1.0,
  bottomBlurIntensity: 0.8,
  topGlowSize: 1.0,
  bottomGlowSize: 0.9,
  topGlowOffset: 0,
  bottomGlowOffset: 0,
};

// Area Chart Component with cursor-tracking mask effect
interface BalanceAreaChartProps {
  hoveredMonth: string | null;
  onHoverMonth: (month: string | null) => void;
  data: MonthData[];
  showCashflowLine?: boolean;
  showBars?: boolean;
}

// Calculate dynamic horizontal margin based on container width and data count
function calculateHorizontalMargin(containerWidth: number, dataCount: number): number {
  // Base margin scales with container width
  const baseMargin = Math.min(containerWidth * 0.05, 40); // 5% of width, max 40px
  
  // For wide screens (>1200px), add extra margin up to 200px
  const wideScreenExtra = containerWidth > 1200 
    ? Math.min((containerWidth - 1200) * 0.15, 160) // 15% of extra width, capped at 160px
    : 0;
  
  // For fewer bars, add more margin to keep them centered
  const fewBarsExtra = dataCount <= 4 
    ? Math.min(containerWidth * 0.15, 150) // 15% extra for ≤4 bars
    : dataCount <= 8 
      ? Math.min(containerWidth * 0.08, 80) // 8% extra for ≤8 bars
      : 0;
  
  // Total margin, capped at 200px per side
  return Math.min(baseMargin + wideScreenExtra + fewBarsExtra, 200);
}

function BalanceAreaChart({ hoveredMonth, onHoverMonth, data, showCashflowLine = true, showBars = true }: BalanceAreaChartProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = React.useState<{ x: number; y: number } | null>(null);
  const [isHovering, setIsHovering] = React.useState(false);
  const [containerWidth, setContainerWidth] = React.useState(0);
  
  // Track container width for dynamic margins with debounced resize
  React.useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };
    updateWidth();
    
    // Debounce resize to prevent rapid re-renders
    let resizeTimeout: NodeJS.Timeout;
    const debouncedResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(updateWidth, 150);
    };
    
    window.addEventListener('resize', debouncedResize);
    return () => {
      window.removeEventListener('resize', debouncedResize);
      clearTimeout(resizeTimeout);
    };
  }, []);
  
  // Calculate dynamic horizontal margin
  const horizontalMargin = React.useMemo(() => {
    return calculateHorizontalMargin(containerWidth, data.length);
  }, [containerWidth, data.length]);
  
  // Generate path based on delta values for current data
  const generateDeltaPathForData = () => {
    const chartWidth = 1000;
    const chartHeight = 230;
    const centerY = chartHeight / 2 + 20;
    const maxDelta = 10000;
    const verticalScale = 80;
    
    const points = data.map((d, index) => {
      const delta = d.moneyIn - d.moneyOut;
      const x = (index / (data.length - 1 || 1)) * chartWidth;
      const y = centerY - (delta / maxDelta) * verticalScale;
      return { x, y, delta };
    });
    
    if (points.length === 0) return { linePath: '', areaPath: '' };
    if (points.length === 1) {
      return {
        linePath: `M${points[0].x},${points[0].y}`,
        areaPath: `M${points[0].x},${points[0].y} L${chartWidth},${chartHeight} L0,${chartHeight} Z`
      };
    }
    
    let linePath = `M${points[0].x},${points[0].y}`;
    
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cpX = (p0.x + p1.x) / 2;
      linePath += ` C${cpX},${p0.y} ${cpX},${p1.y} ${p1.x},${p1.y}`;
    }
    
    const areaPath = `${linePath} L${chartWidth},${chartHeight} L0,${chartHeight} Z`;
    
    return { linePath, areaPath };
  };
  
  const { linePath, areaPath } = generateDeltaPathForData();
  
  // Chart dimensions - adjust based on number of data points
  const chartHeight = 230;
  const barAreaHeight = 180;
  
  // Dynamic bar width based on data count - increased sizes
  const barWidth = React.useMemo(() => {
    if (data.length > 60) return 10;   // 90 days: narrow bars
    if (data.length > 20) return 18;   // 30 days: medium bars
    if (data.length > 10) return 40;   // More than 10 items
    if (data.length > 4) return 56;    // 5-10 items (monthly)
    return 70;                          // Few items (quarterly/yearly)
  }, [data.length]);
  
  // Dynamic max value based on whether we're showing daily or monthly data
  const maxValue = React.useMemo(() => {
    if (data.length > 12) {
      // Daily data - find the max value in the data
      const maxInData = Math.max(...data.map(d => Math.max(d.moneyIn, d.moneyOut)));
      return maxInData * 1.2; // Add 20% padding
    }
    return 15000; // Monthly view
  }, [data]);
  
  // Mask radius - adjust for bar density
  const maskRadius = data.length > 30 ? 100 : 160;
  
  // Calculate bar height based on value
  const getBarHeight = (value: number) => {
    return (value / maxValue) * (barAreaHeight / 2);
  };
  
  // Handle mouse movement over the chart
  const handleMouseMove = React.useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePos({ x, y });
    
    // Determine which month is closest to cursor (accounting for dynamic margins)
    const effectiveWidth = rect.width - (horizontalMargin * 2);
    const adjustedX = x - horizontalMargin;
    const barSpacing = effectiveWidth / data.length;
    const monthIndex = Math.floor(adjustedX / barSpacing);
    const clampedIndex = Math.max(0, Math.min(monthIndex, data.length - 1));
    onHoverMonth(data[clampedIndex].label);
  }, [onHoverMonth, data, horizontalMargin]);
  
  const handleMouseEnter = React.useCallback(() => {
    setIsHovering(true);
  }, []);
  
  const handleMouseLeave = React.useCallback(() => {
    setIsHovering(false);
    setMousePos(null);
    onHoverMonth(null);
  }, [onHoverMonth]);
  
  // Render a bar pair (money in + money out) with optional opacity
  const renderBarPair = (barData: MonthData, index: number, barOpacity: number = 1) => {
    const moneyInHeight = getBarHeight(barData.moneyIn);
    const moneyOutHeight = getBarHeight(barData.moneyOut);
    const centerY = chartHeight / 2;
    // Calculate position with dynamic margins on each side
    // The bars should be evenly distributed within the space between the margins
    const totalBars = data.length;
    const xPercent = totalBars > 1 
      ? (index / (totalBars - 1)) * 100  // Distribute from 0% to 100% of inner area
      : 50; // Center single bar
    
    return (
      <div
        key={barData.label}
        className="absolute transition-opacity duration-150"
        style={{
          // Use calc to position within the margin-adjusted area, centered with transform
          left: `calc(${horizontalMargin}px + (100% - ${horizontalMargin * 2}px) * ${xPercent / 100})`,
          transform: 'translateX(-50%)',
          top: 0,
          height: '100%',
          width: `${barWidth}px`,
          opacity: barOpacity,
        }}
      >
        {/* Money In Bar (above center) */}
        <div
          className="absolute overflow-hidden"
          style={{
            bottom: `${centerY}px`,
            left: 0,
            width: `${barWidth}px`,
            height: `${moneyInHeight}px`,
            borderRadius: '6px 6px 0 0',
          }}
        >
          <GradientCardMoneyIn
            width={barWidth}
            height={moneyInHeight}
            topGradientColor={gradientSettingsMoneyIn.topGradientColor}
            bottomGradientColor={gradientSettingsMoneyIn.bottomGradientColor}
            topGlowColor={gradientSettingsMoneyIn.topGlowColor}
            bottomGlowColor={gradientSettingsMoneyIn.bottomGlowColor}
            topGlowOpacity={gradientSettingsMoneyIn.topGlowOpacity}
            bottomGlowOpacity={gradientSettingsMoneyIn.bottomGlowOpacity}
            topBlurIntensity={gradientSettingsMoneyIn.topBlurIntensity}
            bottomBlurIntensity={gradientSettingsMoneyIn.bottomBlurIntensity}
            topGlowSize={gradientSettingsMoneyIn.topGlowSize}
            bottomGlowSize={gradientSettingsMoneyIn.bottomGlowSize}
            topGlowOffset={gradientSettingsMoneyIn.topGlowOffset}
            bottomGlowOffset={gradientSettingsMoneyIn.bottomGlowOffset}
          />
        </div>
        
        {/* Money Out Bar (below center) */}
        <div
          className="absolute overflow-hidden"
          style={{
            top: `${centerY}px`,
            left: 0,
            width: `${barWidth}px`,
            height: `${moneyOutHeight}px`,
            borderRadius: '0 0 6px 6px',
          }}
        >
          <GradientCard
            width={barWidth}
            height={moneyOutHeight}
            baseColor={gradientSettingsMoneyOut.baseColor}
            topGlowColor={gradientSettingsMoneyOut.topGlowColor}
            bottomGlowColor={gradientSettingsMoneyOut.bottomGlowColor}
            topGlowOpacity={gradientSettingsMoneyOut.topGlowOpacity}
            bottomGlowOpacity={gradientSettingsMoneyOut.bottomGlowOpacity}
            topBlurIntensity={gradientSettingsMoneyOut.topBlurIntensity}
            bottomBlurIntensity={gradientSettingsMoneyOut.bottomBlurIntensity}
            topGlowSize={gradientSettingsMoneyOut.topGlowSize}
            bottomGlowSize={gradientSettingsMoneyOut.bottomGlowSize}
            topGlowOffset={gradientSettingsMoneyOut.topGlowOffset}
            bottomGlowOffset={gradientSettingsMoneyOut.bottomGlowOffset}
          />
        </div>
      </div>
    );
  };
  
  // Get the closest bar data for tooltip
  const getClosestBarData = () => {
    if (!mousePos || !containerRef.current || data.length === 0) return null;
    const rect = containerRef.current.getBoundingClientRect();
    // Account for dynamic horizontal margins
    const effectiveWidth = rect.width - (horizontalMargin * 2);
    const adjustedX = mousePos.x - horizontalMargin;
    const barSpacing = effectiveWidth / data.length;
    const monthIndex = Math.floor(adjustedX / barSpacing);
    const clampedIndex = Math.max(0, Math.min(monthIndex, data.length - 1));
    return { data: data[clampedIndex], index: clampedIndex };
  };
  
  const closestBar = getClosestBarData();
  
  return (
    <div 
      ref={containerRef}
      className="relative w-full h-[230px]"
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Bars layer with CSS radial gradient mask - BEHIND the line */}
      {/* Using ellipse shape: wider horizontally, taller vertically to show full bars */}
      {/* Non-hovered bars shown at 10% opacity */}
      {/* Use visibility instead of conditional rendering to avoid DOM manipulation errors */}
      
      <div style={{ display: showBars ? 'block' : 'none' }}>
        {/* Outer blurred layer - very soft, extends far beyond mask */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            opacity: isHovering && mousePos ? 0.2 : 0,
            transition: 'opacity 0.3s ease-out',
            filter: 'blur(28px)',
            maskImage: mousePos 
              ? `radial-gradient(ellipse ${maskRadius * 2.2}px ${maskRadius * 2.8}px at ${mousePos.x}px ${mousePos.y}px, 
                  black 0%, 
                  rgba(0,0,0,0.5) 25%, 
                  rgba(0,0,0,0.3) 40%, 
                  rgba(0,0,0,0.15) 55%,
                  rgba(0,0,0,0.05) 70%,
                  transparent 85%)`
              : 'none',
            WebkitMaskImage: mousePos 
              ? `radial-gradient(ellipse ${maskRadius * 2.2}px ${maskRadius * 2.8}px at ${mousePos.x}px ${mousePos.y}px, 
                  black 0%, 
                  rgba(0,0,0,0.5) 25%, 
                  rgba(0,0,0,0.3) 40%, 
                  rgba(0,0,0,0.15) 55%,
                  rgba(0,0,0,0.05) 70%,
                  transparent 85%)`
              : 'none',
          }}
        >
          {data.map((d, index) => renderBarPair(d, index, closestBar?.index === index ? 1 : 0.1))}
        </div>
        
        {/* Mid blurred layer - medium blur for transition */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            opacity: isHovering && mousePos ? 0.4 : 0,
            transition: 'opacity 0.25s ease-out',
            filter: 'blur(16px)',
            maskImage: mousePos 
              ? `radial-gradient(ellipse ${maskRadius * 1.6}px ${maskRadius * 2.0}px at ${mousePos.x}px ${mousePos.y}px, 
                  black 0%, 
                  black 15%, 
                  rgba(0,0,0,0.7) 30%, 
                  rgba(0,0,0,0.4) 45%, 
                  rgba(0,0,0,0.2) 60%, 
                  rgba(0,0,0,0.08) 75%,
                  transparent 90%)`
              : 'none',
            WebkitMaskImage: mousePos 
              ? `radial-gradient(ellipse ${maskRadius * 1.6}px ${maskRadius * 2.0}px at ${mousePos.x}px ${mousePos.y}px, 
                  black 0%, 
                  black 15%, 
                  rgba(0,0,0,0.7) 30%, 
                  rgba(0,0,0,0.4) 45%, 
                  rgba(0,0,0,0.2) 60%, 
                  rgba(0,0,0,0.08) 75%,
                  transparent 90%)`
              : 'none',
          }}
        >
          {data.map((d, index) => renderBarPair(d, index, closestBar?.index === index ? 1 : 0.1))}
        </div>
        
        {/* Inner soft layer - slight blur for smooth edges */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            opacity: isHovering && mousePos ? 0.65 : 0,
            transition: 'opacity 0.2s ease-out',
            filter: 'blur(6px)',
            maskImage: mousePos 
              ? `radial-gradient(ellipse ${maskRadius * 1.2}px ${maskRadius * 1.5}px at ${mousePos.x}px ${mousePos.y}px, 
                  black 0%, 
                  black 25%, 
                  rgba(0,0,0,0.8) 40%, 
                  rgba(0,0,0,0.5) 55%, 
                  rgba(0,0,0,0.25) 70%, 
                  rgba(0,0,0,0.1) 82%,
                  transparent 95%)`
              : 'none',
            WebkitMaskImage: mousePos 
              ? `radial-gradient(ellipse ${maskRadius * 1.2}px ${maskRadius * 1.5}px at ${mousePos.x}px ${mousePos.y}px, 
                  black 0%, 
                  black 25%, 
                  rgba(0,0,0,0.8) 40%, 
                  rgba(0,0,0,0.5) 55%, 
                  rgba(0,0,0,0.25) 70%, 
                  rgba(0,0,0,0.1) 82%,
                  transparent 95%)`
              : 'none',
          }}
        >
          {data.map((d, index) => renderBarPair(d, index, closestBar?.index === index ? 1 : 0.1))}
        </div>
        
        {/* Main sharp layer - crisp center */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            opacity: isHovering && mousePos ? 1 : 0,
            transition: 'opacity 0.2s ease-out',
            maskImage: mousePos 
              ? `radial-gradient(ellipse ${maskRadius}px ${maskRadius * 1.25}px at ${mousePos.x}px ${mousePos.y}px, 
                  black 0%, 
                  black 30%, 
                  rgba(0,0,0,0.9) 45%, 
                  rgba(0,0,0,0.7) 58%, 
                  rgba(0,0,0,0.45) 70%, 
                  rgba(0,0,0,0.2) 82%,
                  rgba(0,0,0,0.05) 92%,
                  transparent 100%)`
              : 'none',
            WebkitMaskImage: mousePos 
              ? `radial-gradient(ellipse ${maskRadius}px ${maskRadius * 1.25}px at ${mousePos.x}px ${mousePos.y}px, 
                  black 0%, 
                  black 30%, 
                  rgba(0,0,0,0.9) 45%, 
                  rgba(0,0,0,0.7) 58%, 
                  rgba(0,0,0,0.45) 70%, 
                  rgba(0,0,0,0.2) 82%,
                  rgba(0,0,0,0.05) 92%,
                  transparent 100%)`
              : 'none',
          }}
        >
          {data.map((d, index) => renderBarPair(d, index, closestBar?.index === index ? 1 : 0.1))}
        </div>
      </div>
      
      {/* Chart SVG - Line represents delta (moneyIn - moneyOut) - ON TOP of bars */}
      {/* Use display instead of conditional rendering to avoid DOM manipulation errors */}
      <svg 
        className="absolute inset-0 w-full h-full z-10" 
        viewBox="0 0 1000 230" 
        preserveAspectRatio="none"
        style={{ display: showCashflowLine ? 'block' : 'none' }}
      >
        <defs>
          <linearGradient id="areaGradientDelta" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#a8c5e8" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#e8ecf4" stopOpacity="0.1" />
          </linearGradient>
        </defs>
        
        {/* Area fill */}
        <path
          d={areaPath}
          fill="url(#areaGradientDelta)"
        />
        
        {/* Line representing delta */}
        <path
          d={linePath}
          fill="none"
          stroke="#7c9ac7"
          strokeWidth="2"
        />
      </svg>
      
      {/* Tooltip that follows cursor */}
      {isHovering && mousePos && closestBar && (
        <div 
          className="absolute z-50 pointer-events-none"
          style={{
            left: mousePos.x,
            top: Math.max(mousePos.y - maskRadius - 10, 10),
            transform: 'translate(-50%, -100%)',
          }}
        >
          <div className="bg-gray-900 text-white rounded-lg shadow-lg px-3 py-2 text-sm whitespace-nowrap">
            <div className="font-medium text-gray-300 mb-1.5 text-xs uppercase tracking-wide">
              {closestBar.data.label}
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <div 
                  className="w-2 h-2 rounded-sm flex-shrink-0" 
                  style={{ backgroundColor: gradientSettingsMoneyIn.topGradientColor }}
                />
                <span className="text-gray-400">Money In:</span>
                <span className="font-medium text-green-400">
                  ${closestBar.data.moneyIn.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div 
                  className="w-2 h-2 rounded-sm flex-shrink-0" 
                  style={{ backgroundColor: gradientSettingsMoneyOut.baseColor }}
                />
                <span className="text-gray-400">Money Out:</span>
                <span className="font-medium text-red-400">
                  –${closestBar.data.moneyOut.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center gap-2 pt-1 border-t border-gray-700 mt-1">
                <span className="text-gray-400">Net:</span>
                <span className={`font-medium ${closestBar.data.moneyIn - closestBar.data.moneyOut >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {closestBar.data.moneyIn - closestBar.data.moneyOut >= 0 ? '+' : ''}${(closestBar.data.moneyIn - closestBar.data.moneyOut).toLocaleString()}
                </span>
              </div>
            </div>
            {/* Tooltip arrow */}
            <div 
              className="absolute left-1/2 bottom-0 transform -translate-x-1/2 translate-y-full"
              style={{
                width: 0,
                height: 0,
                borderLeft: '6px solid transparent',
                borderRight: '6px solid transparent',
                borderTop: '6px solid #111827'
              }}
            />
          </div>
        </div>
      )}
      
    </div>
  );
}

// X-Axis Component - Shows all months aligned with the chart data
interface ChartXAxisProps {
  hoveredMonth: string | null;
  data: MonthData[];
}

function ChartXAxis({ hoveredMonth, data }: ChartXAxisProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = React.useState(0);
  
  // Track container width for dynamic margins with debounced resize
  React.useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };
    updateWidth();
    
    // Debounce resize to prevent rapid re-renders
    let resizeTimeout: NodeJS.Timeout;
    const debouncedResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(updateWidth, 150);
    };
    
    window.addEventListener('resize', debouncedResize);
    return () => {
      window.removeEventListener('resize', debouncedResize);
      clearTimeout(resizeTimeout);
    };
  }, []);
  
  // Calculate dynamic horizontal margin (same formula as chart)
  const horizontalMargin = React.useMemo(() => {
    return calculateHorizontalMargin(containerWidth, data.length);
  }, [containerWidth, data.length]);
  
  // Determine how many labels to show based on data length
  // For many data points (daily view), show fewer labels to avoid overcrowding
  const labelInterval = data.length > 30 ? Math.ceil(data.length / 10) :
                        data.length > 12 ? Math.ceil(data.length / 8) : 1;

  return (
    <div ref={containerRef} className="relative py-2 h-8">
      {data.map((d, index) => {
        // Show label only at intervals, or if it's first/last, or if it contains month name
        const showLabel = index % labelInterval === 0 ||
                         index === 0 ||
                         index === data.length - 1 ||
                         d.label.includes(' '); // Labels with month names like "Nov 18"

        // Calculate position to match bar positions exactly
        const totalBars = data.length;
        const xPercent = totalBars > 1
          ? (index / (totalBars - 1)) * 100
          : 50;

        return (
          <div
            key={`${d.label}-${index}`}
            className="absolute flex flex-col items-center"
            style={{
              left: `calc(${horizontalMargin}px + (100% - ${horizontalMargin * 2}px) * ${xPercent / 100})`,
              transform: 'translateX(-50%)',
            }}
          >
            <span
              className={`text-[13px] tracking-[0.1px] transition-colors whitespace-nowrap ${
                hoveredMonth === d.label
                  ? 'text-[#1e1e2a] font-[480]'
                  : 'text-[#535461]'
              }`}
              style={{
                visibility: showLabel ? 'visible' : 'hidden',
                fontSize: data.length > 12 ? '11px' : '13px'
              }}
            >
              {d.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// Keyboard Key Component for shortcuts
interface KeyboardKeyProps {
  children: React.ReactNode;
  className?: string;
}

function KeyboardKey({ children, className = '' }: KeyboardKeyProps) {
  return (
    <div className={`inline-flex items-center justify-center px-[6px] py-0 bg-white border border-[rgba(0,0,0,0.12)] rounded-[6px] text-[12px] font-[440] text-[#70707d] leading-[18px] ${className}`}>
      {children}
    </div>
  );
}

// Search Result Item Component
interface SearchResultItemProps {
  icon?: 'square' | 'rounded';
  title: string;
  subtitle: string;
  onClick?: () => void;
}

function SearchResultItem({ icon = 'square', title, subtitle, onClick }: SearchResultItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex gap-[10px] items-center px-[12px] py-[12px] rounded-[8px] hover:bg-[rgba(112,115,147,0.05)] cursor-pointer transition-colors w-full text-left"
    >
      <div 
        className={`w-[24px] h-[24px] bg-[rgba(112,115,147,0.16)] shrink-0 ${
          icon === 'rounded' ? 'rounded-[12px]' : 'rounded-[4px]'
        }`} 
      />
      <div className="flex gap-[8px] items-baseline min-w-0 flex-1">
        <p className="text-[17px] leading-[28px] text-[#363644] font-normal whitespace-nowrap">
          {title}
        </p>
        <p className="text-[15px] leading-[24px] text-[#535461] font-normal whitespace-nowrap">
          {subtitle}
        </p>
      </div>
    </button>
  );
}

// Ask Anything Input Component
interface AskAnythingInputProps {
  isFocused?: boolean;
  onStartChat: (initialMessage: string) => void;
}

function AskAnythingInput({ isFocused: controlledFocused, onStartChat }: AskAnythingInputProps) {
  const [isFocused, setIsFocused] = useState(controlledFocused ?? false);
  const [inputValue, setInputValue] = useState('');
  const inputRef = React.useRef<HTMLInputElement>(null);
  
  // Prefill options that start a chat
  const searchResults = [
    { icon: 'square' as const, title: "What's my Cashflow?", subtitle: 'View your financial insights', initialMessage: "What's my cashflow looking like?" },
    { icon: 'square' as const, title: 'Canceling a payment you just sent', subtitle: 'Mercury Help Center', initialMessage: 'How do I cancel a payment I just sent?' },
    { icon: 'rounded' as const, title: 'Recent wire transactions', subtitle: 'View in transactions', initialMessage: 'Show me my recent wire transactions' },
    { icon: 'rounded' as const, title: 'Send a wire', subtitle: 'Go to payments', initialMessage: 'I want to send a wire payment' },
  ];

  // Handle selecting a prefill option
  const handleSelectOption = (initialMessage: string) => {
    setIsFocused(false);
    onStartChat(initialMessage);
  };

  // Handle submitting custom input
  const handleSubmit = () => {
    if (inputValue.trim()) {
      setIsFocused(false);
      onStartChat(inputValue.trim());
      setInputValue('');
    }
  };

  // Focus input when expanded
  React.useEffect(() => {
    if (isFocused && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isFocused]);
  
  // Global keyboard listener - focus input when user starts typing
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if already focused or if user is in another input
      if (isFocused) return;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      
      // Expand and focus the input for printable characters
      if (e.key.length === 1) {
        setIsFocused(true);
        // Small delay to ensure the input is rendered and focused
        setTimeout(() => {
          inputRef.current?.focus();
        }, 50);
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isFocused]);

  return (
    <>
      {/* Progressive blur overlay when focused - extended coverage for better background obscuring */}
      <div 
        className={`fixed inset-0 z-40 transition-opacity duration-300 ease-out ${
          isFocused ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsFocused(false)}
      >
        {/* Solid white overlay - starts higher for better text readability */}
        <div 
          className="absolute inset-x-0 bottom-0 h-[70%] pointer-events-none"
          style={{
            background: 'linear-gradient(to bottom, rgba(251,252,253,0) 0%, rgba(251,252,253,0.5) 10%, rgba(251,252,253,0.85) 35%, rgba(251,252,253,0.95) 60%, rgba(251,252,253,1) 100%)',
          }}
        />
        {/* Layer 1 - extended lightest blur */}
        <div 
          className="absolute inset-x-0 bottom-0 h-[65%]"
          style={{
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            maskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.4) 20%, rgba(0,0,0,0.5) 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.4) 20%, rgba(0,0,0,0.5) 100%)',
          }}
        />
        {/* Layer 2 - medium blur */}
        <div 
          className="absolute inset-x-0 bottom-0 h-[55%]"
          style={{
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            maskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.6) 30%, rgba(0,0,0,0.7) 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.6) 30%, rgba(0,0,0,0.7) 100%)',
          }}
        />
        {/* Layer 3 - stronger blur */}
        <div 
          className="absolute inset-x-0 bottom-0 h-[45%]"
          style={{
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
            maskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.8) 40%, rgba(0,0,0,0.9) 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.8) 40%, rgba(0,0,0,0.9) 100%)',
          }}
        />
        {/* Layer 4 - maximum blur at bottom */}
        <div 
          className="absolute inset-x-0 bottom-0 h-[35%]"
          style={{
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            maskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,1) 50%, rgba(0,0,0,1) 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,1) 50%, rgba(0,0,0,1) 100%)',
          }}
        />
      </div>
      
      <div 
        className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ease-out ${
          isFocused ? 'w-screen' : ''
        }`}
      >
        {/* Centered container */}
        <div className={`mx-auto transition-all duration-300 ease-out ${isFocused ? 'w-full' : 'w-auto'}`}>
          {/* Main Container */}
          <div 
            className={`mx-auto overflow-hidden transition-all duration-300 ease-out ${
              isFocused 
                ? 'rounded-none' 
                : 'rounded-[44px] bg-white shadow-[0px_0px_2.5px_0px_rgba(175,178,206,0.65),0px_0px_3.75px_0px_rgba(0,0,0,0.09),0px_15px_20px_0px_rgba(0,0,0,0.01),0px_27.5px_35px_0px_rgba(0,0,0,0.04)] hover:shadow-[0px_0px_4px_0px_rgba(175,178,206,0.8),0px_0px_6px_0px_rgba(0,0,0,0.12),0px_18px_24px_0px_rgba(0,0,0,0.03),0px_30px_40px_0px_rgba(0,0,0,0.06)] w-[350px]'
            }`}
          >
            {/* Results Section - only visible when focused */}
            <div 
              className={`overflow-hidden transition-all duration-300 ease-out ${
                isFocused ? 'max-h-[300px] opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              <div className="flex justify-center">
                <div className="w-[600px] pt-[24px]">
                  <div className="px-[4px]">
                    {searchResults.map((result, index) => (
                      <SearchResultItem
                        key={index}
                        icon={result.icon}
                        title={result.title}
                        subtitle={result.subtitle}
                        onClick={() => handleSelectOption(result.initialMessage)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Composer Section */}
            <div className={`transition-all duration-300 ease-out ${isFocused ? 'py-[24px]' : 'p-0'}`}>
              <div className={`mx-auto transition-all duration-300 ease-out ${isFocused ? 'w-[600px]' : 'w-auto'}`}>
                <div 
                  className={`bg-white overflow-hidden transition-all duration-300 ease-out ${
                    isFocused 
                      ? 'rounded-[24px] shadow-[0px_0px_2.5px_0px_rgba(175,178,206,0.65),0px_0px_3.75px_0px_rgba(0,0,0,0.09),0px_15px_20px_0px_rgba(0,0,0,0.01),0px_27.5px_35px_0px_rgba(0,0,0,0.04)]' 
                      : 'rounded-[44px]'
                  }`}
                >
                  <div className={`flex transition-all duration-300 ease-out ${
                    isFocused ? 'p-[12px] flex-col gap-[12px]' : 'p-[6px] pl-[16px] flex-row items-center justify-between'
                  }`}>
                    {/* Input Row */}
                    <div className={`flex items-center transition-all duration-300 ease-out ${isFocused ? 'pr-[8px]' : ''}`}>
                      <div className={`flex items-center h-[30px] transition-all duration-300 ease-out ${isFocused ? 'flex-1 pl-[8px]' : 'flex-1'}`}>
                        {/* Typing cursor indicator - only in focused state */}
                        {isFocused && inputValue === '' && (
                          <div className="w-[1px] h-[20px] bg-[#5266eb] animate-pulse mr-[2px]" />
                        )}
                        <input
                          ref={inputRef}
                          type="text"
                          placeholder="Ask anything"
                          value={inputValue}
                          onChange={(e) => setInputValue(e.target.value)}
                          onFocus={() => setIsFocused(true)}
                          onBlur={() => {
                            // Small delay to allow clicking on results
                            setTimeout(() => setIsFocused(false), 150);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && inputValue.trim()) {
                              e.preventDefault();
                              handleSubmit();
                            }
                          }}
                          className={`text-[18.75px] leading-[30px] text-[#363644] placeholder-[#9d9da8] outline-none bg-transparent transition-all duration-300 ease-out ${
                            isFocused ? 'flex-1 w-full' : 'flex-1'
                          }`}
                        />
                      </div>
                    </div>

                    {/* Actions Row */}
                    <div className="flex items-center justify-end">
                      {/* Right Side Actions */}
                      <div className="flex items-center gap-[24px]">
                        {/* Agent Mode Toggle - only visible when focused */}
                        <div className={`flex items-center gap-[4px] transition-all duration-300 ease-out ${
                          isFocused ? 'opacity-100 max-w-[200px]' : 'opacity-0 max-w-0 overflow-hidden'
                        }`}>
                          <span className="text-[14px] leading-[20px] text-[#535461] font-normal whitespace-nowrap">
                            Agent Mode
                          </span>
                          <KeyboardKey>Tab</KeyboardKey>
                        </div>

                        {/* Send Button */}
                        <button
                          type="button"
                          onClick={handleSubmit}
                          disabled={!inputValue.trim()}
                          className="w-[40px] h-[40px] rounded-full bg-[#5266eb] flex items-center justify-center text-white hover:bg-[#4255d9] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          aria-label="Send"
                        >
                          <svg className="w-[16px] h-[16px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Keyboard Shortcuts Bar - inside the input card, only visible when focused */}
                  {isFocused && (
                  <div 
                    className="flex items-center justify-between px-[16px] py-[8px] border-t border-[rgba(112,115,147,0.1)] transition-all duration-300 ease-out"
                  >
                    {/* Left Side - Keyboard Shortcuts */}
                    <div className="flex items-center gap-[12px]">
                      {/* Filter */}
                      <div className="flex items-center gap-[4px]">
                        <KeyboardKey>/</KeyboardKey>
                        <span className="text-[12px] leading-[20px] text-[#535461] tracking-[0.2px]">
                          Filter
                        </span>
                      </div>

                      {/* Navigate */}
                      <div className="flex items-center gap-[4px]">
                        <KeyboardKey>↑</KeyboardKey>
                        <KeyboardKey>↓</KeyboardKey>
                        <span className="text-[12px] leading-[20px] text-[#535461] tracking-[0.2px]">
                          Navigate
                        </span>
                      </div>

                      {/* Select */}
                      <div className="flex items-center gap-[4px]">
                        <KeyboardKey>↵</KeyboardKey>
                        <span className="text-[12px] leading-[20px] text-[#535461] tracking-[0.2px]">
                          Select
                        </span>
                      </div>
                    </div>

                    {/* Right Side - Help Link */}
                    <div className="flex items-center gap-[3px] text-[12px] tracking-[0.2px]">
                      <span className="text-[#535461] leading-[20px]">
                        Not what you're looking for?
                      </span>
                      <span className="text-[#535461] leading-[20px]">
                        Try the
                      </span>
                      <button 
                        type="button" 
                        className="text-[#5266eb] leading-[20px] hover:underline"
                      >
                        Help Center
                      </button>
                    </div>
                  </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// Main HomePage Component
interface HomePageProps {
  onStartChat?: (initialMessage: string) => void;
}

export default function HomePage({ onStartChat }: HomePageProps) {
  const [viewMode, setViewMode] = useState<string>('Cashflow');
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('YTD');
  const [cadence, setCadence] = useState<Cadence>('monthly');
  const [hoveredMonth, setHoveredMonth] = useState<string | null>(null);
  
  // Get chart options from store
  const chartOptions = useAppStore((s) => s.chartOptions);
  
  // Get date range for the dropdown to determine available cadence options
  const dateRange = useMemo(() => {
    return getDateRangeForPeriod(timePeriod);
  }, [timePeriod]);
  
  // Get filtered chart data based on time period and cadence
  const chartData = useMemo(() => {
    return getFilteredChartData(timePeriod, cadence);
  }, [timePeriod, cadence]);
  
  // Get transactions data from store
  const transactions = useAppStore((s) => s.transactions);
  
  // Calculate totals from transactions
  const { totalBalance, moneyIn, moneyOut } = useMemo(() => {
    const moneyInTotal = transactions
      .filter(t => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);
    const moneyOutTotal = transactions
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    return {
      totalBalance: 13346457, // Use design value for now
      moneyIn: moneyInTotal || 150100,
      moneyOut: moneyOutTotal || 1200000,
    };
  }, [transactions]);

  // Sample accounts data
  const depositoryAccounts: Account[] = [
    { id: '1', name: 'Main Checking', balance: 150000 },
    { id: '2', name: 'Ops & Payroll', balance: 300000 },
    { id: '3', name: 'Checking', balance: 300000 },
    { id: '4', name: 'Savings', balance: 350000 },
  ];

  // Sample feed data with month and day separated
  const feedItems: ExtendedFeedItem[] = [
    // November
    {
      id: '1',
      date: 'Nov 15',
      month: 'November 2024',
      monthShort: 'Nov',
      day: '15',
      title: 'Payment sent to Open AI',
      description: '$24,234.34',
    },
    {
      id: '2',
      date: '11',
      month: 'November 2024',
      monthShort: 'Nov',
      day: '11',
      title: 'Slack subscription increased by 4%',
      description: '$16,500 → $17,160',
    },
    {
      id: '3',
      date: '10',
      month: 'November 2024',
      monthShort: 'Nov',
      day: '10',
      title: 'Acme Invoice paid',
      description: '$5,000',
      isPositive: true,
    },
    {
      id: '4',
      date: '9',
      month: 'November 2024',
      monthShort: 'Nov',
      day: '9',
      title: 'Team Events category increased by 25% last month',
      description: '~$100 → $13,125',
    },
    {
      id: '5',
      date: '8',
      month: 'November 2024',
      monthShort: 'Nov',
      day: '8',
      title: 'AWS monthly invoice',
      description: '$8,750',
    },
    {
      id: '6',
      date: '7',
      month: 'November 2024',
      monthShort: 'Nov',
      day: '7',
      title: 'Client payment received from Stripe',
      description: '$45,000',
      isPositive: true,
    },
    {
      id: '7',
      date: '5',
      month: 'November 2024',
      monthShort: 'Nov',
      day: '5',
      title: 'Payroll processed',
      description: '$125,400',
    },
    {
      id: '8',
      date: '4',
      month: 'November 2024',
      monthShort: 'Nov',
      day: '4',
      title: 'Office rent paid',
      description: '$12,500',
    },
    {
      id: '9',
      date: '3',
      month: 'November 2024',
      monthShort: 'Nov',
      day: '3',
      title: 'Quarterly tax payment',
      description: '$35,000',
    },
    // October
    {
      id: '10',
      date: 'Oct 31',
      month: 'October 2024',
      monthShort: 'Oct',
      day: '31',
      title: 'Insurance premium renewed',
      description: '$4,200',
    },
    {
      id: '11',
      date: '28',
      month: 'October 2024',
      monthShort: 'Oct',
      day: '28',
      title: 'Invoice #1042 paid',
      description: '$18,500',
      isPositive: true,
    },
    {
      id: '12',
      date: '25',
      month: 'October 2024',
      monthShort: 'Oct',
      day: '25',
      title: 'Marketing spend increased by 15%',
      description: '$8,000 → $9,200',
    },
    {
      id: '13',
      date: '22',
      month: 'October 2024',
      monthShort: 'Oct',
      day: '22',
      title: 'Software licenses renewed',
      description: '$3,450',
    },
    {
      id: '14',
      date: '18',
      month: 'October 2024',
      monthShort: 'Oct',
      day: '18',
      title: 'Consulting fee received',
      description: '$12,000',
      isPositive: true,
    },
    {
      id: '15',
      date: '15',
      month: 'October 2024',
      monthShort: 'Oct',
      day: '15',
      title: 'Equipment purchase',
      description: '$7,800',
    },
    {
      id: '16',
      date: '10',
      month: 'October 2024',
      monthShort: 'Oct',
      day: '10',
      title: 'Monthly subscription fees',
      description: '$2,150',
    },
    {
      id: '17',
      date: '5',
      month: 'October 2024',
      monthShort: 'Oct',
      day: '5',
      title: 'Payroll processed',
      description: '$124,800',
    },
    // September
    {
      id: '18',
      date: 'Sep 28',
      month: 'September 2024',
      monthShort: 'Sep',
      day: '28',
      title: 'Q3 bonus payments',
      description: '$45,000',
    },
    {
      id: '19',
      date: '25',
      month: 'September 2024',
      monthShort: 'Sep',
      day: '25',
      title: 'Client retainer payment',
      description: '$25,000',
      isPositive: true,
    },
    {
      id: '20',
      date: '22',
      month: 'September 2024',
      monthShort: 'Sep',
      day: '22',
      title: 'Cloud infrastructure costs',
      description: '$9,200',
    },
    {
      id: '21',
      date: '18',
      month: 'September 2024',
      monthShort: 'Sep',
      day: '18',
      title: 'Office supplies purchased',
      description: '$1,250',
    },
    {
      id: '22',
      date: '15',
      month: 'September 2024',
      monthShort: 'Sep',
      day: '15',
      title: 'Annual conference tickets',
      description: '$4,800',
    },
    {
      id: '23',
      date: '12',
      month: 'September 2024',
      monthShort: 'Sep',
      day: '12',
      title: 'Partnership revenue share',
      description: '$32,500',
      isPositive: true,
    },
    {
      id: '24',
      date: '8',
      month: 'September 2024',
      monthShort: 'Sep',
      day: '8',
      title: 'Legal services fee',
      description: '$6,500',
    },
    {
      id: '25',
      date: '5',
      month: 'September 2024',
      monthShort: 'Sep',
      day: '5',
      title: 'Payroll processed',
      description: '$123,600',
    },
    {
      id: '26',
      date: '2',
      month: 'September 2024',
      monthShort: 'Sep',
      day: '2',
      title: 'Office rent paid',
      description: '$12,500',
    },
    // August
    {
      id: '27',
      date: 'Aug 30',
      month: 'August 2024',
      monthShort: 'Aug',
      day: '30',
      title: 'Summer team outing expenses',
      description: '$8,900',
    },
    {
      id: '28',
      date: '26',
      month: 'August 2024',
      monthShort: 'Aug',
      day: '26',
      title: 'Product launch revenue',
      description: '$85,000',
      isPositive: true,
    },
    {
      id: '29',
      date: '22',
      month: 'August 2024',
      monthShort: 'Aug',
      day: '22',
      title: 'Marketing campaign spend',
      description: '$15,400',
    },
    {
      id: '30',
      date: '18',
      month: 'August 2024',
      monthShort: 'Aug',
      day: '18',
      title: 'Contractor payments',
      description: '$28,000',
    },
    {
      id: '31',
      date: '14',
      month: 'August 2024',
      monthShort: 'Aug',
      day: '14',
      title: 'Enterprise deal closed',
      description: '$150,000',
      isPositive: true,
    },
    {
      id: '32',
      date: '10',
      month: 'August 2024',
      monthShort: 'Aug',
      day: '10',
      title: 'Server maintenance costs',
      description: '$3,200',
    },
    {
      id: '33',
      date: '5',
      month: 'August 2024',
      monthShort: 'Aug',
      day: '5',
      title: 'Payroll processed',
      description: '$122,400',
    },
    {
      id: '34',
      date: '1',
      month: 'August 2024',
      monthShort: 'Aug',
      day: '1',
      title: 'Office rent paid',
      description: '$12,500',
    },
  ];

  return (
    <div className="min-h-screen bg-[#fbfcfd] pb-24">
      {/* Dot pattern overlay for entire top section */}
      <div className="relative overflow-hidden">
        {/* Dot pattern - contained within this section only */}
        <div 
          className="absolute inset-x-0 top-0 h-[551px] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle, #d5d8de 1px, transparent 1px)`,
            backgroundSize: '20px 20px',
            opacity: 0.6,
          }}
        />
        
        <div className="relative z-10">
          {/* Header Section */}
          <div className="px-6 pt-8">
            {/* Segmented Control */}
            <SegmentedControl
              options={['Cashflow', 'Balance']}
              value={viewMode}
              onChange={setViewMode}
            />
            
            {/* Balance & Time Period Row */}
            <div className="flex items-start justify-between mt-4">
              {/* Balance Info */}
              <div className="flex flex-col gap-1">
                {/* Large Balance */}
                <div className="font-display text-[36px] font-[480] text-[#363644] leading-[1.1]">
                  ${totalBalance.toLocaleString()}
                </div>
                
                {/* Money In/Out Indicators */}
                <div className="flex items-center gap-3 mt-1">
                  <div className="flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-[#188554]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H7M17 7V17" />
                    </svg>
                    <span className="text-[15px] text-[#363644] font-[440]">${formatLargeNumber(moneyIn)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-[#d03275]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 7L7 17M7 17H17M7 17V7" />
                    </svg>
                    <span className="text-[15px] text-[#363644] font-[440]">–${formatLargeNumber(moneyOut)}</span>
                  </div>
                </div>
              </div>
              
              {/* Time Period Pills and Cadence Dropdown */}
              <div className="flex items-center gap-3">
                <TimePeriodPills value={timePeriod} onChange={setTimePeriod} />
                <Dropdown 
                  value={cadence} 
                  onChange={setCadence}
                  selectionStart={dateRange.start}
                  selectionEnd={dateRange.end}
                />
              </div>
            </div>
          </div>
          
          {/* Chart Area */}
          <div className="mt-8">
            <BalanceAreaChart 
              hoveredMonth={hoveredMonth} 
              onHoverMonth={setHoveredMonth}
              data={chartData}
              showCashflowLine={chartOptions.showCashflowLine}
              showBars={chartOptions.showBars}
            />
            <ChartXAxis hoveredMonth={hoveredMonth} data={chartData} />
          </div>
        </div>
      </div>
      
      {/* Bottom Section - Two Column Layout */}
      <div className="px-6 mt-20">
        <div className="max-w-[1024px] mx-auto">
          <div className="grid grid-cols-2 gap-6">
            {/* Left Column - Combined Accounts Card */}
            <div className="bg-white border border-[rgba(112,115,147,0.16)] rounded-xl overflow-hidden">
              {/* Depository Accounts */}
              <AccountsCard
                title="Depository Accounts"
                totalBalance="$500K"
                percentage="25% of total balance"
                accounts={depositoryAccounts}
              />
              
              {/* Divider */}
              <div className="mx-4 border-t border-[rgba(112,115,147,0.12)]" />
              
              {/* Treasury Account */}
              <AccountsCard
                title="Treasury Account"
                totalBalance="$11.5M"
                showChart
              />
            </div>
            
            {/* Right Column - Feed */}
            <div className="bg-white border border-[rgba(112,115,147,0.16)] rounded-xl overflow-hidden">
              <FeedSection items={feedItems} />
            </div>
          </div>
        </div>
      </div>
      
      {/* Ask Anything Input */}
      <AskAnythingInput onStartChat={onStartChat || (() => {})} />
    </div>
  );
}

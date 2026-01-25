import { useState, useMemo, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useUser, useTransactions, useMobileLayout } from '@/hooks';
import { Icon } from '@/components/ui/icon';
import { faChevronDown, faPlus, faCircleQuestion, faXmark, faArrowUpRight, faArrowDownRight, faArrowRightArrowLeft, faClock, faArrowUpFromLine, faArrowTurnDownLeft } from '@/icons';
import { cn } from '@/lib/utils';
import { Chip } from '@/components/ui/chip';
import { DSButton } from '@/components/ui/ds-button';
import { DSAvatar } from '@/components/ui/ds-avatar';
import { useDataSettings } from '@/context/DataContext';

// Chart settings interface
interface ChartSettings {
  slopeDirection: 'up' | 'down';
  pointCount: number;
  smoothing: number; // 0 = jagged, 100 = very smooth
  gradientOpacity: number; // 0-100
  gradientTopColor: string;
  gradientBottomColor: string;
}

// Time period options for the filter
const TIME_PERIODS = ['30', '60', '90', 'YTD', 'Last 12', 'Custom'] as const;
type TimePeriod = typeof TIME_PERIODS[number];

// Data summary tabs type
type DataTab = 'Net Cashflow' | 'Mercury Balance';

// Net cashflow data for each time period
interface NetCashflowData {
  total: string;
  moneyIn: string;
  moneyOut: string;
  xAxisLabels: string[];
}

// X-axis labels by period (static)
const X_AXIS_LABELS_BY_PERIOD: Record<TimePeriod, string[]> = {
  '30': ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Today'],
  '60': ['Nov 15', 'Nov 30', 'Dec 15', 'Dec 31', 'Today'],
  '90': ['Oct', 'Nov', 'Dec', 'Jan', 'Today'],
  'YTD': ['Jan', 'Apr', 'Jul', 'Oct', 'Today'],
  'Last 12': ['Jan \'25', 'Apr', 'Jul', 'Oct', 'Today'],
  'Custom': ['Jan', 'Apr', 'Jul', 'Oct', 'Today'],
};

// Period multipliers for scaling cash flow (longer periods = bigger numbers)
const PERIOD_MULTIPLIERS: Record<TimePeriod, number> = {
  '30': 0.03,
  '60': 0.06,
  '90': 0.08,
  'YTD': 0.10,
  'Last 12': 0.15,
  'Custom': 0.10,
};

// Format number as compact currency (e.g., $82K, $1.2M)
function formatCompactCurrency(amount: number, includeSign = false): string {
  const absAmount = Math.abs(amount);
  const sign = amount < 0 ? '−' : (includeSign && amount > 0 ? '+' : '');
  
  if (absAmount >= 1000000) {
    return `${sign}$${(absAmount / 1000000).toFixed(1)}M`;
  }
  if (absAmount >= 1000) {
    return `${sign}$${(absAmount / 1000).toFixed(absAmount >= 100000 ? 0 : 1)}K`;
  }
  return `${sign}$${absAmount.toFixed(0)}`;
}

// Generate dynamic cash flow data based on balance and cash flow direction
function generateCashFlowData(
  totalBalance: number,
  cashFlowDirection: number, // -100 to 100
  period: TimePeriod
): NetCashflowData {
  const multiplier = PERIOD_MULTIPLIERS[period];
  const baseAmount = totalBalance * multiplier;
  
  // Cash flow direction affects the ratio of money in vs money out
  // -100 = very negative (more out than in)
  // 0 = neutral (roughly equal)
  // +100 = very positive (more in than out)
  const directionFactor = cashFlowDirection / 100; // -1 to 1
  
  // Calculate money in and money out
  // Neutral: moneyIn slightly higher than moneyOut for positive net
  // Negative: moneyOut much higher than moneyIn
  // Positive: moneyIn much higher than moneyOut
  const moneyIn = baseAmount * (0.8 + directionFactor * 0.6); // 0.2 to 1.4 of base
  const moneyOut = baseAmount * (0.6 - directionFactor * 0.4); // 0.2 to 1.0 of base
  const netCashFlow = moneyIn - moneyOut;
  
  return {
    total: formatCompactCurrency(netCashFlow, true),
    moneyIn: formatCompactCurrency(moneyIn),
    moneyOut: formatCompactCurrency(-moneyOut),
    xAxisLabels: X_AXIS_LABELS_BY_PERIOD[period],
  };
}

// Chart point type
interface ChartPoint {
  x: number;
  y: number;
}

// Generate a chart path based on settings
function generateChartPath(settings: ChartSettings): { 
  linePath: string; 
  areaPath: string; 
  points: ChartPoint[];
} {
  const width = 1026;
  const height = 230;
  const { pointCount, smoothing, slopeDirection } = settings;
  
  // Generate random-ish points with trend
  const points: ChartPoint[] = [];
  const segmentWidth = width / (pointCount - 1);
  
  // Base trend: up means y decreases (going up on screen), down means y increases
  const trendSlope = slopeDirection === 'up' ? -0.4 : 0.4;
  const baseY = slopeDirection === 'up' ? 170 : 80;
  
  // Seed-based pseudo-random for consistency
  const seededRandom = (seed: number) => {
    const x = Math.sin(seed * 12.9898) * 43758.5453;
    return x - Math.floor(x);
  };
  
  for (let i = 0; i < pointCount; i++) {
    const x = i * segmentWidth;
    const trendY = baseY + (trendSlope * (i / (pointCount - 1)) * (height - 60));
    const noise = (seededRandom(i * 7 + pointCount) - 0.5) * 80;
    const y = Math.max(40, Math.min(190, trendY + noise));
    points.push({ x, y });
  }
  
  // Build path with smoothing (bezier curves)
  const smoothingFactor = smoothing / 100; // 0 = sharp corners, 1 = very smooth
  
  let linePath = `M${points[0].x} ${points[0].y}`;
  
  if (smoothingFactor < 0.1) {
    // Very jagged - use straight lines
    for (let i = 1; i < points.length; i++) {
      linePath += ` L${points[i].x} ${points[i].y}`;
    }
  } else {
    // Use bezier curves for smoothing
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const next = points[i + 1];
      const prevPrev = points[i - 2];
      
      // Calculate control points
      const tension = 0.3 * smoothingFactor;
      
      let cp1x, cp1y, cp2x, cp2y;
      
      if (i === 1) {
        cp1x = prev.x + (curr.x - prev.x) * tension;
        cp1y = prev.y + (curr.y - prev.y) * tension;
      } else {
        cp1x = prev.x + (curr.x - prevPrev.x) * tension;
        cp1y = prev.y + (curr.y - prevPrev.y) * tension;
      }
      
      if (i === points.length - 1 || !next) {
        cp2x = curr.x - (curr.x - prev.x) * tension;
        cp2y = curr.y - (curr.y - prev.y) * tension;
      } else {
        cp2x = curr.x - (next.x - prev.x) * tension;
        cp2y = curr.y - (next.y - prev.y) * tension;
      }
      
      linePath += ` C${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.x} ${curr.y}`;
    }
  }
  
  // Area path closes the shape
  const areaPath = `${linePath} L${width} ${height} L0 ${height} Z`;
  
  return { linePath, areaPath, points };
}

export function Dashboard() {
  const { user, isLoading: userLoading } = useUser();
  const { isMobile } = useMobileLayout();
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('YTD');
  const [selectedTab, setSelectedTab] = useState<DataTab>('Net Cashflow');
  
  // Chart settings state
  const [chartSettings, setChartSettings] = useState<ChartSettings>({
    slopeDirection: 'up',
    pointCount: 12,
    smoothing: 70,
    gradientOpacity: 15,
    gradientTopColor: 'var(--purple-magic-400)',
    gradientBottomColor: 'var(--purple-magic-400)',
  });
  
  // Generate chart paths based on settings and selected tab
  const { linePath, areaPath, points: chartPoints } = useMemo(
    () => {
      if (selectedTab === 'Mercury Balance') {
        // For Mercury Balance, generate a smoother upward trending chart
        const balanceSettings: ChartSettings = {
          ...chartSettings,
          slopeDirection: 'up', // Balance should trend upward
          smoothing: 85, // Smoother line for balance view
          pointCount: Math.max(8, chartSettings.pointCount - 2), // Slightly fewer points
        };
        return generateChartPath(balanceSettings);
      }
      return generateChartPath(chartSettings);
    },
    [chartSettings, selectedTab]
  );
  
  // Select evenly distributed points for the primary dots (max 6 dots)
  const dotPoints = useMemo(() => {
    const numDots = Math.min(6, chartPoints.length);
    const result: ChartPoint[] = [];
    for (let i = 0; i < numDots; i++) {
      const index = Math.round((i / (numDots - 1)) * (chartPoints.length - 1));
      result.push(chartPoints[index]);
    }
    return result;
  }, [chartPoints]);

  // Insight detail type
  interface InsightDetail {
    summary: string;
    type: 'spend' | 'revenue';
    source: string;
    amount: number;
    category: string;
    date: string;
    description: string;
    trend: string;
  }

  // Generate random insights for each dot point
  const dotInsights = useMemo((): InsightDetail[] => {
    const spendSources = [
      { name: 'OpenAI', category: 'Software & SaaS', desc: 'API usage charges for GPT-4 and embeddings' },
      { name: 'AWS', category: 'Infrastructure', desc: 'EC2 instances, S3 storage, and data transfer' },
      { name: 'Gusto', category: 'Payroll', desc: 'Bi-weekly payroll processing and benefits' },
      { name: 'Google Ads', category: 'Marketing', desc: 'Search and display advertising campaigns' },
      { name: 'Slack', category: 'Software & SaaS', desc: 'Team communication platform subscription' },
      { name: 'Figma', category: 'Software & SaaS', desc: 'Design tool licenses for product team' },
      { name: 'Notion', category: 'Software & SaaS', desc: 'Team workspace and documentation' },
      { name: 'Vercel', category: 'Infrastructure', desc: 'Frontend hosting and edge functions' },
      { name: 'GitHub', category: 'Software & SaaS', desc: 'Code repository and CI/CD minutes' },
    ];
    const revenueSources = [
      { name: 'Stripe', category: 'Product Revenue', desc: 'Customer subscription payments' },
      { name: 'Invoice #4521', category: 'Services', desc: 'Consulting engagement with Acme Corp' },
      { name: 'Shopify', category: 'Product Revenue', desc: 'E-commerce platform sales' },
      { name: 'Client deposit', category: 'Services', desc: 'Project retainer from Beta LLC' },
      { name: 'Square', category: 'Product Revenue', desc: 'Point of sale transactions' },
      { name: 'PayPal', category: 'Product Revenue', desc: 'International customer payments' },
    ];
    const trends = [
      'This is 12% higher than your monthly average',
      'Consistent with last month\'s spending',
      'This represents a 23% increase from last period',
      'Trending 8% below your typical spend',
      'New vendor added this quarter',
      'Part of your recurring monthly expenses',
    ];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    return dotPoints.map(() => {
      const isSpend = Math.random() > 0.4; // 60% chance of spend
      const amount = isSpend 
        ? Math.round((Math.random() * 15 + 1) * 1000) 
        : Math.round((Math.random() * 20 + 2) * 1000);
      const day = Math.floor(Math.random() * 28) + 1;
      const month = months[Math.floor(Math.random() * 12)];
      
      if (isSpend) {
        const sourceData = spendSources[Math.floor(Math.random() * spendSources.length)];
        return {
          summary: `–$${(amount / 1000).toFixed(1)}K to ${sourceData.name}`,
          type: 'spend' as const,
          source: sourceData.name,
          amount,
          category: sourceData.category,
          date: `${month} ${day}`,
          description: sourceData.desc,
          trend: trends[Math.floor(Math.random() * trends.length)],
        };
      } else {
        const sourceData = revenueSources[Math.floor(Math.random() * revenueSources.length)];
        return {
          summary: `+$${(amount / 1000).toFixed(1)}K from ${sourceData.name}`,
          type: 'revenue' as const,
          source: sourceData.name,
          amount,
          category: sourceData.category,
          date: `${month} ${day}`,
          description: sourceData.desc,
          trend: trends[Math.floor(Math.random() * trends.length)],
        };
      }
    });
  }, [dotPoints]);

  // Chart hover state
  const chartRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const [isHoveringChart, setIsHoveringChart] = useState(false);
  const [hoverX, setHoverX] = useState(0);
  const [hoverProgress, setHoverProgress] = useState(0); // 0 to 1
  const [hoverPointOnLine, setHoverPointOnLine] = useState({ x: 0, y: 100 });
  const [hoveredDotIndex, setHoveredDotIndex] = useState<number | null>(null);
  const [insightPanelOpen, setInsightPanelOpen] = useState(false);
  const [selectedInsightIndex, setSelectedInsightIndex] = useState<number | null>(null);
  const [insightChatInput, setInsightChatInput] = useState('');

  // Drag selection state
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartProgress, setDragStartProgress] = useState(0);
  const [dragEndProgress, setDragEndProgress] = useState(0);

  // Helper to get progress from mouse event
  const getProgressFromEvent = (e: React.MouseEvent<HTMLDivElement> | MouseEvent) => {
    if (!chartRef.current) return 0;
    const rect = chartRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    return Math.max(0, Math.min(1, x / rect.width));
  };

  // Helper to find point on path at given progress
  const getPointOnPath = (progress: number) => {
    if (!pathRef.current) return { x: 0, y: 100 };
    
    const path = pathRef.current;
    const totalLength = path.getTotalLength();
    const targetX = progress * 1026; // SVG viewBox width
    let low = 0;
    let high = totalLength;
    let bestPoint = path.getPointAtLength(0);
    
    for (let i = 0; i < 20; i++) {
      const mid = (low + high) / 2;
      const point = path.getPointAtLength(mid);
      
      if (Math.abs(point.x - targetX) < 0.5) {
        bestPoint = point;
        break;
      }
      
      if (point.x < targetX) {
        low = mid;
      } else {
        high = mid;
      }
      bestPoint = point;
    }
    
    return { x: bestPoint.x, y: bestPoint.y };
  };

  // Handle chart mouse move - use the actual SVG path to get exact position
  const handleChartMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!chartRef.current || !pathRef.current) return;
    const rect = chartRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const progress = Math.max(0, Math.min(1, x / rect.width));
    setHoverX(x);
    setHoverProgress(progress);
    
    const point = getPointOnPath(progress);
    setHoverPointOnLine(point);

    // Check if hovering near a dot point (within 15px threshold)
    const hoverXInSVG = progress * 1026; // Convert to SVG coordinates
    const dotThreshold = 15; // pixels in SVG space
    let foundDotIndex: number | null = null;
    
    for (let i = 0; i < dotPoints.length; i++) {
      const dotX = dotPoints[i].x;
      if (Math.abs(hoverXInSVG - dotX) < dotThreshold) {
        foundDotIndex = i;
        break;
      }
    }
    setHoveredDotIndex(foundDotIndex);

    // Update drag end if dragging
    if (isDragging) {
      setDragEndProgress(progress);
    }
  };

  // Handle mouse down to start dragging
  const handleChartMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const progress = getProgressFromEvent(e);
    setIsDragging(true);
    setDragStartProgress(progress);
    setDragEndProgress(progress);
  };

  // Handle mouse up to end dragging
  const handleChartMouseUp = () => {
    setIsDragging(false);
    setDragStartProgress(0);
    setDragEndProgress(0);
  };

  // Global mouse up listener to catch mouse up outside chart
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        setDragStartProgress(0);
        setDragEndProgress(0);
      }
    };

    if (isDragging) {
      window.addEventListener('mouseup', handleGlobalMouseUp);
    }

    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging]);

  // Calculate selection bounds (always left to right)
  const selectionStart = Math.min(dragStartProgress, dragEndProgress);
  const selectionEnd = Math.max(dragStartProgress, dragEndProgress);

  // Get exact date from progress (0-1) based on selected time period
  // Date ranges match the x-axis labels displayed on the chart
  const getDateFromProgress = (progress: number): string => {
    const today = new Date();
    let startDate: Date;
    
    // Calculate start date based on period - matching x-axis label ranges
    switch (selectedPeriod) {
      case '30':
        // 30 days: ~4 weeks back (Week 1 to Today)
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 30);
        break;
      case '60':
        // 60 days: Nov 15 to Today (labels show Nov 15, Nov 30, Dec 15, Dec 31, Today)
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 60);
        break;
      case '90':
        // 90 days: Oct to Today (labels show Oct, Nov, Dec, Jan, Today)
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 90);
        break;
      case 'YTD':
        // YTD: Labels show Jan, Apr, Jul, Oct, Today - spanning ~12 months
        // Use Jan 1 of previous year to match the chart's visual range
        startDate = new Date(today.getFullYear() - 1, 0, 1);
        break;
      case 'Last 12':
        // Last 12: Labels show Jan '25, Apr, Jul, Oct, Today - 12 months back
        startDate = new Date(today);
        startDate.setFullYear(today.getFullYear() - 1);
        break;
      case 'Custom':
      default:
        // Custom: Same as YTD range
        startDate = new Date(today.getFullYear() - 1, 0, 1);
        break;
    }
    
    // Interpolate between start and end date
    const totalMs = today.getTime() - startDate.getTime();
    const targetMs = startDate.getTime() + (totalMs * progress);
    const targetDate = new Date(targetMs);
    
    // Format as "Mon DD" (e.g., "Jan 15")
    return targetDate.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Calculate selected date range labels
  const selectionStartDate = isDragging ? getDateFromProgress(selectionStart) : '';
  const selectionEndDate = isDragging ? getDateFromProgress(selectionEnd) : '';

  // Get dynamic balance from DataContext
  const { settings: dataSettings, formattedTotalBalance } = useDataSettings();

  // Calculate interpolated Net Cashflow values for drag selection only
  const getDragInterpolatedValues = useMemo(() => {
    const data = generateCashFlowData(dataSettings.totalBalance, dataSettings.cashFlowDirection, selectedPeriod);
    
    // Parse the total value (remove $ and K/M suffix)
    const parseValue = (str: string) => {
      const cleaned = str.replace(/[−+$,]/g, '');
      const multiplier = cleaned.includes('M') ? 1000000 : cleaned.includes('K') ? 1000 : 1;
      return parseFloat(cleaned.replace(/[KM]/g, '')) * multiplier;
    };
    
    const totalValue = parseValue(data.total);
    const moneyInValue = parseValue(data.moneyIn);
    const moneyOutValue = parseValue(data.moneyOut);
    
    // Format values back
    const formatValue = (val: number, prefix: string = '$') => {
      const absVal = Math.abs(val);
      if (absVal >= 1000000) {
        return `${prefix}${(val / 1000000).toFixed(1)}M`;
      } else if (absVal >= 1000) {
        return `${prefix}${(val / 1000).toFixed(0)}K`;
      }
      return `${prefix}${val.toFixed(0)}`;
    };

    // Only calculate when dragging with a valid selection
    if (isDragging && selectionEnd > selectionStart) {
      const rangeSize = selectionEnd - selectionStart;
      // Scale values proportionally to the range size
      const scaledTotal = totalValue * rangeSize;
      const scaledMoneyIn = moneyInValue * rangeSize;
      const scaledMoneyOut = moneyOutValue * rangeSize;
      
      return {
        total: formatValue(scaledTotal),
        moneyIn: formatValue(scaledMoneyIn),
        moneyOut: formatValue(scaledMoneyOut, '−$'),
        xAxisLabels: data.xAxisLabels,
      };
    }
    
    // Return static values when not dragging
    return data;
  }, [selectedPeriod, isDragging, selectionStart, selectionEnd, dataSettings.totalBalance, dataSettings.cashFlowDirection]);
  
  // Generate dynamic cash flow data based on settings
  const dynamicCashFlowData = useMemo(() => 
    generateCashFlowData(dataSettings.totalBalance, dataSettings.cashFlowDirection, selectedPeriod),
    [dataSettings.totalBalance, dataSettings.cashFlowDirection, selectedPeriod]
  );
  
  // Update chart direction based on cash flow direction
  useEffect(() => {
    const newDirection = dataSettings.cashFlowDirection >= 0 ? 'up' : 'down';
    if (chartSettings.slopeDirection !== newDirection) {
      setChartSettings(prev => ({ ...prev, slopeDirection: newDirection }));
    }
  }, [dataSettings.cashFlowDirection]);
  
  // Calculate interpolated Mercury Balance based on hover progress
  const interpolatedMercuryBalance = useMemo(() => {
    // Scale balance based on progress (start from smaller values)
    const scaledBalance = dataSettings.totalBalance * (0.2 + hoverProgress * 0.8);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(scaledBalance);
  }, [hoverProgress, dataSettings.totalBalance]);

  // Display values for Net Cashflow - only use interpolated when dragging
  const displayValues = isDragging ? getDragInterpolatedValues : dynamicCashFlowData;
  
  // Display value for Mercury Balance - interpolate when hovering (not dragging)
  const displayMercuryBalance = (isHoveringChart && !isDragging) ? interpolatedMercuryBalance : formattedTotalBalance;

  if (userLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-body text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <div className="flex flex-col items-start w-full">
        {/* Header with Welcome and Time Period Tabs */}
        <div
          className="flex items-center justify-center w-full"
          style={{ paddingTop: isMobile ? 16 : 24, paddingBottom: 16, paddingLeft: isMobile ? 16 : 0, paddingRight: isMobile ? 16 : 0 }}
        >
          <div
            className={cn(
              "flex items-center justify-between ds-dashboard-header",
              isMobile && "flex-col items-start gap-4"
            )}
            style={{ width: isMobile ? '100%' : 1024, height: isMobile ? 'auto' : 36 }}
          >
            {/* Welcome Title */}
            <h1 className={cn("text-title-main", isMobile && "text-title-secondary")}>
              Welcome {user?.firstName}
            </h1>

            {/* Time Period Tabs */}
            <div className={cn("flex items-center overflow-clip ds-time-period-container", isMobile && "w-full overflow-x-auto")}>
              <div className="flex items-center gap-[2px]">
                {TIME_PERIODS.map((period) => (
                  <button
                    key={period}
                    onClick={() => setSelectedPeriod(period)}
                    className={cn(
                      'ds-time-period-tab',
                      selectedPeriod === period && 'active'
                    )}
                  >
                    <span
                      className="text-label"
                      style={{
                        color: selectedPeriod === period
                          ? 'var(--ds-text-emphasized)'
                          : 'var(--ds-text-tertiary)',
                      }}
                    >
                      {period}
                    </span>
                    {period === 'Custom' && (
                      <Icon
                        icon={faChevronDown}
                        size="small"
                        style={{ color: 'var(--ds-icon-secondary)' }}
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Overview Section with Chart */}
        <div
          className="flex flex-col items-center justify-between w-full overflow-clip relative ds-chart-section"
          style={{ height: isMobile ? 320 : 440, isolation: 'isolate' }}
        >
          {/* Dot grid background with contained fade overlays */}
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
                background: 'linear-gradient(to top, var(--neutral-base-0) 0%, transparent 100%)',
              }}
            />
          </div>

          {/* Data Summary Header (Insights) */}
          <div
            className="flex flex-col items-center w-full z-[30]"
            style={{ borderTop: '1px solid var(--color-border-default)', position: 'relative', backgroundColor: 'var(--ds-bg-default)', paddingLeft: isMobile ? 16 : 0, paddingRight: isMobile ? 16 : 0 }}
          >
            <div
              className="flex flex-col items-start ds-data-summary-container"
              style={{ width: isMobile ? '100%' : 1024 }}
            >
              <div className="flex items-start gap-2 w-full">
                <div className="flex items-center gap-6">
                  {/* Net Cashflow Tab */}
                  <div className="flex items-center self-stretch">
                    <button
                      onClick={() => setSelectedTab('Net Cashflow')}
                      className={cn(
                        'ds-data-summary-tab',
                        selectedTab === 'Net Cashflow' && 'active'
                      )}
                    >
                      <span
                        className="text-label"
                        style={{
                          color: selectedTab === 'Net Cashflow'
                            ? 'var(--ds-text-default)'
                            : 'var(--ds-text-secondary)',
                        }}
                      >
                        Net Cashflow
                      </span>
                      <div className="flex flex-col items-start gap-1">
                        {/* Amount */}
                        <div className="flex items-center">
                          <span
                            className="font-display ds-balance-text"
                            style={{
                              fontSize: isMobile ? 20 : 24,
                              fontWeight: 480,
                              lineHeight: 1.1,
                              color: 'var(--ds-text-default)',
                              fontVariantNumeric: 'tabular-nums',
                              minWidth: isMobile ? 60 : 80,
                              textAlign: 'left',
                            }}
                          >
                            {displayValues.total}
                          </span>
                        </div>
                        {/* Money In/Out */}
                        <div className={cn("flex items-center", isMobile ? "gap-3" : "gap-4")}>
                          {/* Money In */}
                          <div className="flex items-center gap-[6px]" style={{ height: 24 }}>
                            <Icon
                              icon={faArrowUpRight}
                              size="small"
                              style={{ color: 'var(--ds-icon-success)' }}
                            />
                            <span
                              className={cn(isMobile ? "text-label" : "text-body-sm")}
                              style={{ 
                                color: 'var(--ds-text-default)',
                                fontVariantNumeric: 'tabular-nums',
                                minWidth: isMobile ? 40 : 55,
                                textAlign: 'left',
                              }}
                            >
                              {displayValues.moneyIn}
                            </span>
                          </div>
                          {/* Money Out */}
                          <div className="flex items-center gap-[6px]" style={{ height: 24 }}>
                            <Icon
                              icon={faArrowDownRight}
                              size="small"
                              style={{ color: 'var(--ds-icon-error)' }}
                            />
                            <span
                              className={cn(isMobile ? "text-label" : "text-body-sm")}
                              style={{ 
                                color: 'var(--ds-text-default)',
                                fontVariantNumeric: 'tabular-nums',
                                minWidth: isMobile ? 40 : 55,
                                textAlign: 'left',
                              }}
                            >
                              {displayValues.moneyOut}
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                  </div>

                  {/* Mercury Balance Tab */}
                  <div className="flex items-center self-stretch">
                    <button
                      onClick={() => setSelectedTab('Mercury Balance')}
                      className={cn(
                        'ds-data-summary-tab',
                        selectedTab === 'Mercury Balance' && 'active'
                      )}
                    >
                      <span
                        className="text-label"
                        style={{
                          color: selectedTab === 'Mercury Balance'
                            ? 'var(--ds-text-default)'
                            : 'var(--ds-text-secondary)',
                        }}
                      >
                        Mercury Balance
                      </span>
                      <div className="flex flex-col items-start gap-1">
                        {/* Amount */}
                        <div className="flex items-center">
                          <span
                            className="font-display ds-balance-text-large"
                            style={{
                              fontSize: isMobile ? 18 : 24,
                              fontWeight: 480,
                              lineHeight: 1.1,
                              color: 'var(--ds-text-secondary)',
                              fontVariantNumeric: 'tabular-nums',
                              minWidth: isMobile ? 'auto' : 140,
                              textAlign: 'left',
                            }}
                          >
                            {displayMercuryBalance}
                          </span>
                        </div>
                        {/* Cash/Treasury breakdown */}
                        <div className="flex items-center justify-center" style={{ height: 24 }}>
                          <span
                            className="text-body-sm"
                            style={{ color: 'var(--ds-text-secondary)' }}
                          >
                            75% Cash · 25% Treasury
                          </span>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* X-Axis Labels */}
          <div
            className="z-[5] relative ds-xaxis-labels"
            style={{
              width: isMobile ? '100%' : 1026,
              padding: isMobile ? '8px 16px' : '8px 0',
              borderBottomLeftRadius: 12,
              borderBottomRightRadius: 12,
            }}
          >
            {/* Default x-axis labels - hidden when dragging, faded when hovering */}
            {!isDragging && (
              <div 
                className="flex items-start justify-between"
                style={{
                  opacity: isHoveringChart ? 0.2 : 1,
                  transition: 'opacity 150ms ease',
                }}
              >
                {displayValues.xAxisLabels.map((label) => (
                  <div
                    key={label}
                    className="flex flex-col items-center gap-[3px] relative"
                    style={{ width: 38 }}
                  >
                    <span
                      className="text-label text-center"
                      style={{
                        color: label === 'Today'
                          ? 'var(--ds-text-default)'
                          : 'var(--ds-text-secondary)',
                      }}
                    >
                      {label}
                    </span>
                    {/* Today vertical line indicator - gradient fade */}
                    {label === 'Today' && (
                      <div
                        className="absolute"
                        style={{
                          bottom: 36,
                          left: 19,
                          width: 1,
                          height: 238,
                          background: `linear-gradient(to top, var(--color-border-default) 0%, transparent 100%)`,
                        }}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}


          </div>

          {/* Chart Area - extends from left edge to Today marker */}
          <div
            ref={chartRef}
            className="absolute z-[2] ds-chart-container"
            style={{
              left: 0,
              right: isMobile ? 0 : 'calc(50% - 513px)',
              top: isMobile ? 120 : 167,
              height: isMobile ? 160 : 230,
              cursor: isMobile ? 'default' : (isDragging ? 'ew-resize' : 'crosshair'),
              userSelect: 'none',
            }}
            onMouseEnter={() => !isMobile && setIsHoveringChart(true)}
            onMouseLeave={() => {
              if (!isDragging && !isMobile) {
                setIsHoveringChart(false);
                setHoveredDotIndex(null);
              }
            }}
            onMouseMove={!isMobile ? handleChartMouseMove : undefined}
            onMouseDown={!isMobile ? handleChartMouseDown : undefined}
            onMouseUp={!isMobile ? handleChartMouseUp : undefined}
          >
            {/* Hover tracking line - hide while dragging */}
            {isHoveringChart && !isDragging && (
              <div
                className="ds-chart-hover-line"
                style={{
                  position: 'absolute',
                  left: hoverX,
                  top: 0,
                  bottom: 0,
                  width: 1,
                  background: 'linear-gradient(to bottom, transparent 0%, var(--purple-magic-600) 25%)',
                  pointerEvents: 'none',
                  zIndex: 10,
                }}
              />
            )}
            
            {/* Hover dot on line - hide while dragging */}
            {isHoveringChart && !isDragging && (
              <div
                style={{
                  position: 'absolute',
                  left: `${(hoverPointOnLine.x / 1026) * 100}%`,
                  top: `${(hoverPointOnLine.y / 230) * 100}%`,
                  transform: 'translate(-50%, -50%)',
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  backgroundColor: 'var(--purple-magic-600)',
                  border: '2px solid white',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                  pointerEvents: 'none',
                  zIndex: 11,
                }}
              />
            )}

            {/* Hover date label - centered on hover line */}
            {isHoveringChart && !isDragging && (
              <div
                style={{
                  position: 'absolute',
                  left: hoverX,
                  bottom: -28,
                  transform: 'translateX(-50%)',
                  pointerEvents: 'none',
                  zIndex: 20,
                }}
              >
                <span
                  className="text-label text-center whitespace-nowrap"
                  style={{ color: 'var(--ds-text-secondary)' }}
                >
                  {getDateFromProgress(hoverProgress)}
                </span>
              </div>
            )}

            {/* Drag selection boundary lines and date labels */}
            {isDragging && selectionEnd > selectionStart && (
              <>
                {/* Start boundary line */}
                <div
                  style={{
                    position: 'absolute',
                    left: `${selectionStart * 100}%`,
                    top: 0,
                    bottom: 0,
                    width: 2,
                    backgroundColor: 'var(--purple-magic-600)',
                    pointerEvents: 'none',
                    zIndex: 12,
                  }}
                />
                {/* End boundary line */}
                <div
                  style={{
                    position: 'absolute',
                    left: `${selectionEnd * 100}%`,
                    top: 0,
                    bottom: 0,
                    width: 2,
                    backgroundColor: 'var(--purple-magic-600)',
                    pointerEvents: 'none',
                    zIndex: 12,
                    transform: 'translateX(-2px)',
                  }}
                />
                {/* Start date label - positioned below chart */}
                <div
                  style={{
                    position: 'absolute',
                    left: `${selectionStart * 100}%`,
                    bottom: -28,
                    transform: 'translateX(-50%)',
                    pointerEvents: 'none',
                    zIndex: 20,
                  }}
                >
                  <span
                    className="text-label text-center whitespace-nowrap"
                    style={{ color: 'var(--ds-text-secondary)' }}
                  >
                    {selectionStartDate}
                  </span>
                </div>
                {/* End date label - positioned below chart */}
                <div
                  style={{
                    position: 'absolute',
                    left: `${selectionEnd * 100}%`,
                    bottom: -28,
                    transform: 'translateX(-50%)',
                    pointerEvents: 'none',
                    zIndex: 20,
                  }}
                >
                  <span
                    className="text-label text-center whitespace-nowrap"
                    style={{ color: 'var(--ds-text-secondary)' }}
                  >
                    {selectionEndDate}
                  </span>
                </div>
              </>
            )}

            {/* Drag Selection - Dim unselected areas */}
            {isDragging && selectionEnd > selectionStart && (
              <>
                {/* Left unselected area overlay */}
                {selectionStart > 0 && (
                  <div
                    style={{
                      position: 'absolute',
                      left: 0,
                      width: `${selectionStart * 100}%`,
                      top: 0,
                      bottom: 0,
                      backgroundColor: 'var(--ds-bg-default)',
                      opacity: 0.6,
                      pointerEvents: 'none',
                      zIndex: 3,
                    }}
                  />
                )}
                {/* Right unselected area overlay */}
                {selectionEnd < 1 && (
                  <div
                    style={{
                      position: 'absolute',
                      left: `${selectionEnd * 100}%`,
                      right: 0,
                      top: 0,
                      bottom: 0,
                      backgroundColor: 'var(--ds-bg-default)',
                      opacity: 0.6,
                      pointerEvents: 'none',
                      zIndex: 3,
                    }}
                  />
                )}
                {/* Selected area highlight */}
                <div
                  style={{
                    position: 'absolute',
                    left: `${selectionStart * 100}%`,
                    width: `${(selectionEnd - selectionStart) * 100}%`,
                    top: 0,
                    bottom: 0,
                    backgroundColor: 'var(--ds-bg-secondary)',
                    opacity: 0.2,
                    pointerEvents: 'none',
                    zIndex: 1,
                  }}
                />
              </>
            )}

            {/* Chart SVG with proper scaling */}
            <svg
              width="100%"
              height="100%"
              viewBox="0 0 1026 230"
              fill="none"
              preserveAspectRatio="none"
              style={{ pointerEvents: 'none', position: 'relative', zIndex: 2 }}
            >
              <defs>
                {/* Chart area gradient (top to bottom) */}
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop 
                    offset="0%" 
                    stopColor={chartSettings.gradientTopColor} 
                    stopOpacity={chartSettings.gradientOpacity / 100} 
                  />
                  <stop 
                    offset="100%" 
                    stopColor={chartSettings.gradientBottomColor} 
                    stopOpacity={0.02} 
                  />
                </linearGradient>
              </defs>
              
              {/* Area fill */}
              <path
                d={areaPath}
                fill="url(#chartGradient)"
              />
              
              {/* Line */}
              <path
                ref={pathRef}
                d={linePath}
                stroke="var(--purple-magic-600)"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

            {/* Data points (primary dots) - rendered as HTML elements to maintain 1:1 scale */}
            {dotPoints.map((point, index) => (
              <div
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedInsightIndex(index);
                  setInsightPanelOpen(true);
                }}
                style={{
                  position: 'absolute',
                  left: `${(point.x / 1026) * 100}%`,
                  top: `${(point.y / 230) * 100}%`,
                  transform: 'translate(-50%, -50%)',
                  width: 20,
                  height: 20,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  pointerEvents: 'auto',
                  zIndex: 3,
                  cursor: 'pointer',
                }}
              >
                {/* Visual dot */}
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: hoveredDotIndex === index ? 'var(--purple-magic-700)' : 'var(--ds-bg-primary)',
                    border: '2px solid white',
                    transition: 'transform 150ms ease, background-color 150ms ease',
                    boxShadow: hoveredDotIndex === index ? '0 2px 8px rgba(0,0,0,0.15)' : 'none',
                    transform: hoveredDotIndex === index ? 'scale(1.25)' : 'scale(1)',
                  }}
                />
              </div>
            ))}

            {/* Tooltip for hovered dot */}
            {isHoveringChart && !isDragging && hoveredDotIndex !== null && (
              <div
                style={{
                  position: 'absolute',
                  left: `${(dotPoints[hoveredDotIndex].x / 1026) * 100}%`,
                  top: `${(dotPoints[hoveredDotIndex].y / 230) * 100}%`,
                  transform: 'translate(-50%, -100%) translateY(-12px)',
                  backgroundColor: 'rgba(255, 255, 255, 0.7)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  color: 'var(--ds-text-default)',
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid rgba(255, 255, 255, 0.4)',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08), 0 1px 4px rgba(0, 0, 0, 0.04)',
                  pointerEvents: 'none',
                  zIndex: 20,
                  whiteSpace: 'nowrap',
                }}
                className="text-label"
              >
                {dotInsights[hoveredDotIndex].summary}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Insight Detail Panel */}
      {insightPanelOpen && selectedInsightIndex !== null && (
        <InsightPanel
          insight={dotInsights[selectedInsightIndex]}
          onClose={() => {
            setInsightPanelOpen(false);
            setSelectedInsightIndex(null);
          }}
          chatInput={insightChatInput}
          onChatInputChange={setInsightChatInput}
        />
      )}

      {/* Dashboard Cards Section */}
      <DashboardCards />
    </div>
  );
}

// Insight Panel Component
interface InsightPanelProps {
  insight: {
    summary: string;
    type: 'spend' | 'revenue';
    source: string;
    amount: number;
    category: string;
    date: string;
    description: string;
    trend: string;
  };
  onClose: () => void;
  chatInput: string;
  onChatInputChange: (value: string) => void;
}

function InsightPanel({ insight, onClose, chatInput, onChatInputChange }: InsightPanelProps) {
  const formatAmount = (amount: number) => {
    if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(1)}K`;
    }
    return `$${amount.toLocaleString()}`;
  };

  return (
    <div className="ds-insights-panel" style={{ animation: 'panelSlideIn 200ms ease-out' }}>
      {/* Header */}
      <div className="ds-insights-panel-header">
        <div className="flex flex-col gap-1">
          <span className="text-title-secondary" style={{ color: 'var(--ds-text-title)' }}>
            {insight.type === 'spend' ? 'Spend Insight' : 'Revenue Insight'}
          </span>
          <span className="text-label" style={{ color: 'var(--ds-text-secondary)' }}>
            Mercury AI
          </span>
        </div>
        <div className="flex items-center gap-2">
          <DSButton
            className="ds-insights-panel-icon-btn"
            variant="tertiary"
            size="small"
            iconOnly
            aria-label="History"
          >
            <Icon icon={faClock} size="small" style={{ color: 'var(--ds-icon-secondary)' }} />
          </DSButton>
          <DSButton
            className="ds-insights-panel-icon-btn"
            variant="tertiary"
            size="small"
            iconOnly
            aria-label="Close"
            onClick={onClose}
          >
            <Icon icon={faXmark} size="small" style={{ color: 'var(--ds-icon-secondary)' }} />
          </DSButton>
        </div>
      </div>

      {/* Chat Content Area */}
      <div className="ds-insights-panel-content">
        {/* User's implied question */}
        <div className="ds-insights-user-message">
          <span className="text-body" style={{ color: 'var(--ds-text-default)' }}>
            Tell me more about this {insight.type === 'spend' ? 'expense' : 'income'}
          </span>
        </div>

        {/* AI Response */}
        <div className="flex flex-col gap-4">
          {/* Summary Card */}
          <div
            className="rounded-lg p-4"
            style={{
              backgroundColor: insight.type === 'spend' ? 'var(--red-base-50)' : 'var(--green-base-50)',
              border: `1px solid ${insight.type === 'spend' ? 'var(--red-base-200)' : 'var(--green-base-200)'}`,
            }}
          >
            <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
              <span className="text-label-demi" style={{ color: 'var(--ds-text-default)' }}>
                {insight.source}
              </span>
              <span
                className="text-body-demi"
                style={{
                  color: insight.type === 'spend' ? 'var(--color-error)' : 'var(--color-success)',
                }}
              >
                {insight.type === 'spend' ? '−' : '+'}{formatAmount(insight.amount)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className="text-tiny rounded-full"
                style={{
                  padding: '2px 8px',
                  backgroundColor: 'var(--ds-bg-secondary)',
                  color: 'var(--ds-text-secondary)',
                }}
              >
                {insight.category}
              </span>
              <span className="text-tiny" style={{ color: 'var(--ds-text-tertiary)' }}>
                {insight.date}
              </span>
            </div>
          </div>

          {/* Description */}
          <p className="text-body" style={{ color: 'var(--ds-text-default)' }}>
            <strong>{insight.source}</strong> — {insight.description}
          </p>

          {/* Trend insight */}
          <div
            className="flex items-start gap-3 rounded-md p-3"
            style={{ backgroundColor: 'var(--ds-bg-secondary)' }}
          >
            <Icon
              icon={insight.type === 'spend' ? faArrowUpRight : faArrowDownRight}
              size="small"
              style={{
                color: insight.type === 'spend' ? 'var(--color-error)' : 'var(--color-success)',
                marginTop: 2,
              }}
            />
            <span className="text-body" style={{ color: 'var(--ds-text-default)' }}>
              {insight.trend}
            </span>
          </div>

          {/* Suggested actions */}
          <div>
            <span className="text-label-demi" style={{ color: 'var(--ds-text-secondary)', display: 'block', marginBottom: 8 }}>
              Suggested actions
            </span>
            <div className="flex flex-col gap-2">
              {insight.type === 'spend' ? (
                <>
                  <button className="ds-insight-action-btn">
                    <span>View all {insight.source} transactions</span>
                    <Icon icon={faArrowUpRight} size="small" style={{ color: 'var(--ds-icon-secondary)' }} />
                  </button>
                  <button className="ds-insight-action-btn">
                    <span>Compare to budget</span>
                    <Icon icon={faArrowUpRight} size="small" style={{ color: 'var(--ds-icon-secondary)' }} />
                  </button>
                  <button className="ds-insight-action-btn">
                    <span>Set up spend alert</span>
                    <Icon icon={faArrowUpRight} size="small" style={{ color: 'var(--ds-icon-secondary)' }} />
                  </button>
                </>
              ) : (
                <>
                  <button className="ds-insight-action-btn">
                    <span>View {insight.source} details</span>
                    <Icon icon={faArrowUpRight} size="small" style={{ color: 'var(--ds-icon-secondary)' }} />
                  </button>
                  <button className="ds-insight-action-btn">
                    <span>See revenue trends</span>
                    <Icon icon={faArrowUpRight} size="small" style={{ color: 'var(--ds-icon-secondary)' }} />
                  </button>
                  <button className="ds-insight-action-btn">
                    <span>Create invoice</span>
                    <Icon icon={faArrowUpRight} size="small" style={{ color: 'var(--ds-icon-secondary)' }} />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Message Input Area */}
      <div className="ds-insights-panel-input-area">
        <div className="ds-insights-panel-input-container">
          <div className="ds-insights-panel-content-row">
            <input
              type="text"
              className="ds-insights-panel-input"
              placeholder="Ask a follow-up question..."
              value={chatInput}
              onChange={(e) => onChatInputChange(e.target.value)}
            />
          </div>
          <div className="ds-insights-panel-actions-row">
            <div className="ds-insights-panel-icon-btn" role="button" aria-label="Upload">
              <Icon icon={faArrowUpFromLine} size="small" style={{ color: 'var(--ds-icon-secondary)' }} />
            </div>
            <button
              className="ds-insights-panel-send-btn"
              aria-label="Send"
              disabled={!chatInput.trim()}
            >
              <Icon icon={faArrowTurnDownLeft} size="small" style={{ color: 'var(--ds-icon-on-inverted)' }} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Note: Depository accounts data now comes from DataContext

// Bar heights for treasury chart (simulated data)
const TREASURY_BAR_HEIGHTS = [
  23, 16, 23, 16, 23, 16, 23, 16, 16, 23, 16, 23, 23, 12, 12, 12, 16, 16, 23, 16, 26, 16, 32, 40, 48, 40
];

// Filter tabs for transactions
const TRANSACTION_FILTERS = ['Recent', 'Expenses', 'Revenue', 'Marketing'] as const;
type TransactionFilter = typeof TRANSACTION_FILTERS[number];

function DashboardCards() {
  const [selectedFilter, setSelectedFilter] = useState<TransactionFilter>('Recent');
  const { transactions } = useTransactions();
  const { getAccountBalances } = useDataSettings();
  const { isMobile } = useMobileLayout();
  
  // Get dynamic account balances (exclude credit and treasury - treasury has its own section)
  const depositoryAccounts = getAccountBalances().filter(acc => acc.type !== 'credit' && acc.type !== 'treasury');

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };
  
  // Calculate depository total (excluding credit)
  const depositoryTotal = depositoryAccounts.reduce((sum, acc) => sum + acc.balance, 0);

  return (
    <div
      className="flex items-center justify-center w-full"
      style={{ paddingTop: 24, paddingBottom: isMobile ? 100 : 48, paddingLeft: isMobile ? 16 : 0, paddingRight: isMobile ? 16 : 0 }}
    >
      <div className={cn("flex gap-6 ds-dashboard-cards", isMobile && "flex-col")} style={{ width: isMobile ? '100%' : 1024 }}>
        {/* Left Column - Account Breakdown Card */}
        <div
          className="flex flex-col rounded-lg overflow-clip ds-dashboard-card"
          style={{
            width: isMobile ? '100%' : 500,
            border: '1px solid var(--color-border-default)',
          }}
        >
          {/* Depository Accounts Section */}
          <div
            className="flex flex-col gap-4 flex-1"
            style={{
              backgroundColor: 'var(--ds-bg-default)',
              paddingTop: 24,
              paddingBottom: 16,
              paddingLeft: 16,
              paddingRight: 16,
            }}
          >
            {/* Header */}
            <div className="flex items-start justify-between" style={{ paddingLeft: 8, paddingRight: 8 }}>
              <div className="flex flex-col gap-1">
                {/* Title with hint icon */}
                <div className="flex items-center gap-1">
                  <span
                    className="text-body"
                    style={{ color: 'var(--ds-text-default)' }}
                  >
                    Depository Accounts
                  </span>
                  <Icon
                    icon={faCircleQuestion}
                    size="small"
                    style={{ color: 'var(--ds-icon-tertiary)' }}
                  />
                </div>
                {/* Total Balance */}
                <span
                  className="font-display"
                  style={{
                    fontSize: 24,
                    fontWeight: 440,
                    lineHeight: '32px',
                    color: 'var(--ds-text-title)',
                  }}
                >
                  {formatCurrency(depositoryTotal)}
                </span>
              </div>
              {/* Action Buttons using DSButton */}
              <div className="flex items-center gap-2">
                <DSButton
                  variant="secondary"
                  size="small"
                  iconOnly
                >
                  <Icon icon={faArrowRightArrowLeft} size="small" style={{ color: 'var(--ds-icon-secondary)' }} />
                </DSButton>
                <DSButton
                  variant="secondary"
                  size="small"
                  iconOnly
                >
                  <Icon icon={faPlus} size="small" style={{ color: 'var(--ds-icon-secondary)' }} />
                </DSButton>
              </div>
            </div>

            {/* Account List */}
            <div className="flex flex-col ds-account-list" style={{ width: isMobile ? '100%' : 458 }}>
              {depositoryAccounts.map((account, index) => {
                const hasDetailPage = account.type !== 'treasury';
                const rowContent = (
                  <div
                    className={`flex items-center gap-3 rounded-md ${hasDetailPage ? 'ds-account-row' : ''}`}
                    style={{ padding: 8 }}
                  >
                    <div className="flex flex-1 items-center gap-4">
                      <span
                        className="text-body flex-1"
                        style={{ color: 'var(--ds-text-default)' }}
                      >
                        {account.name}
                      </span>
                      <span
                        className="text-body flex-1 text-right"
                        style={{ color: 'var(--ds-text-default)' }}
                      >
                        {formatCurrency(account.balance)}
                      </span>
                    </div>
                  </div>
                );

                if (hasDetailPage) {
                  return (
                    <Link key={account.id || index} to={`/accounts/${account.id}`}>
                      {rowContent}
                    </Link>
                  );
                }

                return <div key={account.id || index}>{rowContent}</div>;
              })}
            </div>
          </div>

          {/* Treasury Account Section */}
          <div
            className="flex flex-col gap-6"
            style={{
              backgroundColor: 'var(--ds-bg-default)',
              borderTop: '1px solid var(--color-border-default)',
              paddingTop: 16,
              paddingBottom: 24,
              paddingLeft: 24,
              paddingRight: 24,
            }}
          >
            {/* Header */}
            <div className="flex items-start justify-between w-full">
              <div className="flex flex-col gap-1">
                {/* Title with hint icon */}
                <div className="flex items-center gap-1">
                  <span
                    className="text-body"
                    style={{ color: 'var(--ds-text-default)' }}
                  >
                    Treasury Account
                  </span>
                  <Icon
                    icon={faCircleQuestion}
                    size="small"
                    style={{ color: 'var(--ds-icon-tertiary)' }}
                  />
                </div>
                {/* Balance */}
                <span
                  className="font-display"
                  style={{
                    fontSize: 24,
                    fontWeight: 440,
                    lineHeight: '32px',
                    color: 'var(--ds-text-title)',
                  }}
                >
                  $11.5M
                </span>
                {/* Percentage */}
                <span
                  className="text-tiny"
                  style={{ color: 'var(--ds-text-tertiary)' }}
                >
                  75% of total balance
                </span>
              </div>
              {/* Action Button using DSButton */}
              <DSButton
                variant="secondary"
                size="small"
                iconOnly
              >
                <Icon icon={faArrowRightArrowLeft} size="small" style={{ color: 'var(--ds-icon-secondary)' }} />
              </DSButton>
            </div>

            {/* Bar Chart */}
            <div
              className="flex items-end gap-px w-full"
              style={{ height: 48 }}
            >
              {TREASURY_BAR_HEIGHTS.map((height, index) => (
                <div
                  key={index}
                  className="flex-1 ds-treasury-bar"
                  style={{
                    height: height,
                    opacity: 0.5,
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Transactions */}
        <div
          className="flex flex-col gap-4 rounded-lg relative overflow-clip ds-dashboard-card"
          style={{
            width: isMobile ? '100%' : 500,
            backgroundColor: 'var(--ds-bg-default)',
            border: '1px solid var(--color-border-default)',
            paddingTop: 24,
            paddingBottom: 16,
            paddingLeft: 16,
            paddingRight: 16,
          }}
        >
          {/* Filter Chips */}
          <div className="flex items-center gap-2">
            {TRANSACTION_FILTERS.map((filter) => (
              <Chip
                key={filter}
                label={filter}
                variant={selectedFilter === filter ? 'selected' : 'default'}
                trailingAction="none"
                onClick={() => setSelectedFilter(filter)}
              />
            ))}
          </div>

          {/* Transactions List */}
          <div className="flex flex-col w-full">
            {transactions.slice(0, 8).map((txn) => {
              // Format date as "Mon DD"
              const date = new Date(txn.date);
              const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

              // Format amount
              const absAmount = Math.abs(txn.amount);
              const formattedAmount = absAmount.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              });

              return (
                <div
                  key={txn.id}
                  className="flex items-center w-full ds-transaction-row"
                  style={{ 
                    height: 49, 
                    borderBottom: '1px solid var(--color-border-default)',
                    paddingLeft: 8,
                    paddingRight: 8,
                  }}
                >
                  {/* Date Column */}
                  <div style={{ width: 64, flexShrink: 0 }}>
                    <span
                      className="text-body"
                      style={{ color: 'var(--ds-text-secondary)' }}
                    >
                      {formattedDate}
                    </span>
                  </div>

                  {/* Avatar + Name Column */}
                  <div className="flex items-center gap-3 flex-1" style={{ minWidth: 0, overflow: 'hidden' }}>
                    <DSAvatar type="trx" name={txn.merchant} size="small" />
                    <span
                      className="text-body"
                      style={{ 
                        color: 'var(--ds-text-default)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {txn.merchant}
                    </span>
                  </div>

                  {/* Amount Column */}
                  <div 
                    className="text-right" 
                    style={{ 
                      width: 100, 
                      flexShrink: 0,
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    <span
                      className="text-body"
                      style={{ color: 'var(--ds-text-default)' }}
                    >
                      ${formattedAmount}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Fade Overlay */}
          <div
            className="absolute bottom-0 left-0 right-0"
            style={{
              height: 72,
              background: 'linear-gradient(to top, white 14%, transparent 100%)',
              pointerEvents: 'none',
            }}
          />
        </div>
      </div>
    </div>
  );
}

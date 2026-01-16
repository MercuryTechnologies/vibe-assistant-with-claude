import { useState, useMemo, useRef, useEffect } from 'react';
import { useUser, useTransactions } from '@/hooks';
import { Icon } from '@/components/ui/icon';
import { faChevronDown, faArrowTrendUp, faArrowTrendDown, faArrowRightArrowLeft, faPlus, faEllipsis, faCircleQuestion, faChartLine, faXmark, faArrowUpRight, faArrowDownRight, faMagnifyingGlass, faClock, faCircleCheck, faBuilding } from '@/icons';
import { cn } from '@/lib/utils';
import { Chip } from '@/components/ui/chip';
import { DSButton } from '@/components/ui/ds-button';

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

const NET_CASHFLOW_BY_PERIOD: Record<TimePeriod, NetCashflowData> = {
  '30': {
    total: '$82K',
    moneyIn: '$45.2K',
    moneyOut: '−$36.8K',
    xAxisLabels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Today'],
  },
  '60': {
    total: '$156K',
    moneyIn: '$89.4K',
    moneyOut: '−$66.6K',
    xAxisLabels: ['Nov 15', 'Nov 30', 'Dec 15', 'Dec 31', 'Today'],
  },
  '90': {
    total: '$198K',
    moneyIn: '$112.7K',
    moneyOut: '−$85.3K',
    xAxisLabels: ['Oct', 'Nov', 'Dec', 'Jan', 'Today'],
  },
  'YTD': {
    total: '$246K',
    moneyIn: '$150.1K',
    moneyOut: '−$1.2M',
    xAxisLabels: ['Jan', 'Apr', 'Jul', 'Oct', 'Today'],
  },
  'Last 12': {
    total: '$412K',
    moneyIn: '$287.3K',
    moneyOut: '−$1.9M',
    xAxisLabels: ['Jan \'25', 'Apr', 'Jul', 'Oct', 'Today'],
  },
  'Custom': {
    total: '$246K',
    moneyIn: '$150.1K',
    moneyOut: '−$1.2M',
    xAxisLabels: ['Jan', 'Apr', 'Jul', 'Oct', 'Today'],
  },
};

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
  
  // Generate chart paths based on settings
  const { linePath, areaPath, points: chartPoints } = useMemo(
    () => generateChartPath(chartSettings),
    [chartSettings]
  );
  
  // Select evenly distributed points for the yellow dots (max 6 dots)
  const dotPoints = useMemo(() => {
    const numDots = Math.min(6, chartPoints.length);
    const result: ChartPoint[] = [];
    for (let i = 0; i < numDots; i++) {
      const index = Math.round((i / (numDots - 1)) * (chartPoints.length - 1));
      result.push(chartPoints[index]);
    }
    return result;
  }, [chartPoints]);

  // Chart hover state
  const chartRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const [isHoveringChart, setIsHoveringChart] = useState(false);
  const [hoverX, setHoverX] = useState(0);
  const [hoverProgress, setHoverProgress] = useState(0); // 0 to 1
  const [hoverPointOnLine, setHoverPointOnLine] = useState({ x: 0, y: 100 });

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

  // Calculate interpolated Net Cashflow values for drag selection only
  const getDragInterpolatedValues = useMemo(() => {
    const data = NET_CASHFLOW_BY_PERIOD[selectedPeriod];
    
    // Parse the total value (remove $ and K/M suffix)
    const parseValue = (str: string) => {
      const cleaned = str.replace(/[−$,]/g, '');
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
      };
    }
    
    // Return static values when not dragging
    return data;
  }, [selectedPeriod, isDragging, selectionStart, selectionEnd]);

  // Calculate interpolated Mercury Balance based on hover progress
  const MERCURY_BALANCE_BASE = 13346457; // $13,346,457
  const interpolatedMercuryBalance = useMemo(() => {
    // Scale balance based on progress (start from smaller values)
    const scaledBalance = MERCURY_BALANCE_BASE * (0.2 + hoverProgress * 0.8);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(scaledBalance);
  }, [hoverProgress]);

  // Display values for Net Cashflow - only use interpolated when dragging
  const displayValues = isDragging ? getDragInterpolatedValues : NET_CASHFLOW_BY_PERIOD[selectedPeriod];
  
  // Display value for Mercury Balance - interpolate when hovering (not dragging)
  const displayMercuryBalance = (isHoveringChart && !isDragging) ? interpolatedMercuryBalance : '$13,346,457';

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
          style={{ paddingTop: 24, paddingBottom: 16 }}
        >
          <div
            className="flex items-center justify-between"
            style={{ width: 1024, height: 36 }}
          >
            {/* Welcome Title */}
            <h1 className="text-title-main">
              Welcome {user?.firstName}
            </h1>

            {/* Time Period Tabs */}
            <div className="flex items-center overflow-clip">
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
          className="flex flex-col items-center justify-between w-full overflow-clip relative"
          style={{ height: 440, isolation: 'isolate' }}
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
            style={{ borderTop: '1px solid var(--color-border-default)', position: 'relative', backgroundColor: 'var(--ds-bg-default)' }}
          >
            <div
              className="flex flex-col items-start"
              style={{ width: 1024 }}
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
                            className="font-display"
                            style={{
                              fontSize: 24,
                              fontWeight: 480,
                              lineHeight: 1.1,
                              color: 'var(--ds-text-default)',
                              fontVariantNumeric: 'tabular-nums',
                              minWidth: 80,
                              textAlign: 'left',
                            }}
                          >
                            {displayValues.total}
                          </span>
                        </div>
                        {/* Money In/Out */}
                        <div className="flex items-center gap-4">
                          {/* Money In */}
                          <div className="flex items-center gap-[6px]" style={{ height: 24 }}>
                            <Icon
                              icon={faArrowUpRight}
                              size="small"
                              style={{ color: 'var(--ds-icon-success)' }}
                            />
                            <span
                              className="text-body-sm"
                              style={{ 
                                color: 'var(--ds-text-default)',
                                fontVariantNumeric: 'tabular-nums',
                                minWidth: 55,
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
                              className="text-body-sm"
                              style={{ 
                                color: 'var(--ds-text-default)',
                                fontVariantNumeric: 'tabular-nums',
                                minWidth: 55,
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
                            className="font-display"
                            style={{
                              fontSize: 24,
                              fontWeight: 480,
                              lineHeight: 1.1,
                              color: 'var(--ds-text-secondary)',
                              fontVariantNumeric: 'tabular-nums',
                              minWidth: 140,
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
            className="z-[5] relative"
            style={{
              width: 1026,
              padding: '8px 0',
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
                {NET_CASHFLOW_BY_PERIOD[selectedPeriod].xAxisLabels.map((label) => (
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
            className="absolute z-[2]"
            style={{
              left: 0,
              right: 'calc(50% - 513px)',
              top: 167,
              height: 230,
              cursor: isDragging ? 'ew-resize' : 'crosshair',
              userSelect: 'none',
            }}
            onMouseEnter={() => setIsHoveringChart(true)}
            onMouseLeave={() => {
              if (!isDragging) {
                setIsHoveringChart(false);
              }
            }}
            onMouseMove={handleChartMouseMove}
            onMouseDown={handleChartMouseDown}
            onMouseUp={handleChartMouseUp}
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
                  backgroundColor: 'var(--purple-magic-600)',
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

            {/* Data points (yellow dots) - rendered as HTML elements to maintain 1:1 scale */}
            {dotPoints.map((point, index) => (
              <div
                key={index}
                style={{
                  position: 'absolute',
                  left: `${(point.x / 1026) * 100}%`,
                  top: `${(point.y / 230) * 100}%`,
                  transform: 'translate(-50%, -50%)',
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  backgroundColor: 'var(--orange-magic-400)',
                  border: '2px solid white',
                  pointerEvents: 'none',
                  zIndex: 3,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Chart Settings FAB */}
      <ChartSettingsFAB settings={chartSettings} onSettingsChange={setChartSettings} />

      {/* Dashboard Cards Section */}
      <DashboardCards />

      {/* Sticky Bottom Action Toolbar */}
      <ActionToolbar />
    </div>
  );
}

// Sample search results for the command palette
const SEARCH_SUGGESTIONS = [
  { icon: faCircleCheck, label: 'Create a card', type: 'action', shortcuts: ['Open form ↵', 'Ask agent ⌘↵'] },
  { icon: faBuilding, label: 'Cards', type: 'page', path: '/cards' },
  { icon: faBuilding, label: 'Credit Balance', type: 'page', path: '/credit' },
  { icon: faBuilding, label: 'Team Spend', type: 'page', path: '/spend' },
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
function ActionToolbar() {
  const [inputValue, setInputValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isSendHovered, setIsSendHovered] = useState(false);
  const [hoveredRecipientIndex, setHoveredRecipientIndex] = useState<number | null>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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

  // Filter suggestions based on input
  const filteredSuggestions = inputValue
    ? SEARCH_SUGGESTIONS.filter(s => 
        s.label.toLowerCase().includes(inputValue.toLowerCase())
      )
    : SEARCH_SUGGESTIONS;

  return (
    <div className="ds-action-container">
      <div 
        ref={toolbarRef}
        className={cn('ds-action-toolbar', isFocused && 'focused')} 
        style={{ width: isFocused ? 672 : 484 }}
      >
        {/* Expanded Results Area - Only visible when focused */}
        {isFocused && (
          <div className="ds-action-results">
            {filteredSuggestions.map((suggestion, index) => (
              <div 
                key={suggestion.label}
                className={cn(
                  'ds-action-result-item',
                  index === selectedIndex && 'selected'
                )}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <div className="flex items-center gap-2">
                  <div className="ds-action-result-icon">
                    <Icon 
                      icon={suggestion.icon} 
                      size="small"
                      style={{ color: 'var(--ds-icon-secondary)' }} 
                    />
                  </div>
                  <span 
                    className="text-body"
                    style={{ color: 'var(--ds-text-default)' }}
                  >
                    {suggestion.label}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  {suggestion.shortcuts ? (
                    suggestion.shortcuts.map((shortcut, i) => (
                      <span key={i} className="flex items-center gap-2">
                        <span 
                          className="text-label"
                          style={{ color: 'var(--ds-text-default)', letterSpacing: '0.1px' }}
                        >
                          {shortcut}
                        </span>
                        {i < suggestion.shortcuts!.length - 1 && (
                          <div style={{ width: 1, height: 12, backgroundColor: '#d9d9d9' }} />
                        )}
                      </span>
                    ))
                  ) : (
                    <span 
                      className="text-label"
                      style={{ color: 'var(--ds-text-default)', letterSpacing: '0.1px' }}
                    >
                      {suggestion.path}
                    </span>
                  )}
                </div>
              </div>
            ))}
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
            placeholder="Ask Anything.."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onFocus={handleFocus}
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
    </div>
  );
}

// Chart Settings FAB Component
interface ChartSettingsFABProps {
  settings: ChartSettings;
  onSettingsChange: (settings: ChartSettings) => void;
}

function ChartSettingsFAB({ settings, onSettingsChange }: ChartSettingsFABProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSlopeChange = (direction: 'up' | 'down') => {
    onSettingsChange({ ...settings, slopeDirection: direction });
  };

  const handlePointCountChange = (value: number) => {
    onSettingsChange({ ...settings, pointCount: Math.max(3, Math.min(30, value)) });
  };

  const handleSmoothingChange = (value: number) => {
    onSettingsChange({ ...settings, smoothing: Math.max(0, Math.min(100, value)) });
  };

  const handleGradientOpacityChange = (value: number) => {
    onSettingsChange({ ...settings, gradientOpacity: Math.max(0, Math.min(100, value)) });
  };

  const handleTopColorChange = (color: string) => {
    onSettingsChange({ ...settings, gradientTopColor: color });
  };

  const handleBottomColorChange = (color: string) => {
    onSettingsChange({ ...settings, gradientBottomColor: color });
  };

  const colorOptions = [
    { label: 'Purple', value: 'var(--purple-magic-400)' },
    { label: 'Blue', value: 'var(--blue-magic-400)' },
    { label: 'Green', value: 'var(--green-magic-400)' },
    { label: 'Orange', value: 'var(--orange-magic-400)' },
    { label: 'Red', value: 'var(--red-magic-400)' },
  ];

  return (
    <>
      {/* FAB Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="ds-chart-settings-fab"
        aria-label="Chart settings"
      >
        <Icon 
          icon={isOpen ? faXmark : faChartLine} 
          style={{ color: 'var(--ds-icon-on-primary)' }} 
        />
      </button>

      {/* Settings Panel */}
      {isOpen && (
        <div className="ds-chart-settings-panel">
          {/* Header */}
          <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
            <span 
              className="text-body-demi"
              style={{ color: 'var(--ds-text-default)' }}
            >
              Chart Settings
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="ds-chart-settings-close"
              aria-label="Close settings"
            >
              <Icon icon={faXmark} size="small" style={{ color: 'var(--ds-icon-secondary)' }} />
            </button>
          </div>

          {/* Slope Direction */}
          <div className="ds-chart-settings-section">
            <span className="ds-chart-settings-label">Slope Direction</span>
            <div className="flex gap-2">
              <button
                onClick={() => handleSlopeChange('up')}
                className={cn(
                  'ds-chart-settings-toggle',
                  settings.slopeDirection === 'up' && 'active'
                )}
              >
                <Icon icon={faArrowTrendUp} size="small" />
                <span>Up</span>
              </button>
              <button
                onClick={() => handleSlopeChange('down')}
                className={cn(
                  'ds-chart-settings-toggle',
                  settings.slopeDirection === 'down' && 'active'
                )}
              >
                <Icon icon={faArrowTrendDown} size="small" />
                <span>Down</span>
              </button>
            </div>
          </div>

          {/* Point Count */}
          <div className="ds-chart-settings-section">
            <div className="flex items-center justify-between">
              <span className="ds-chart-settings-label">Line Points</span>
              <span className="ds-chart-settings-value">{settings.pointCount}</span>
            </div>
            <input
              type="range"
              min="3"
              max="30"
              value={settings.pointCount}
              onChange={(e) => handlePointCountChange(parseInt(e.target.value))}
              className="ds-chart-settings-slider"
            />
          </div>

          {/* Smoothing */}
          <div className="ds-chart-settings-section">
            <div className="flex items-center justify-between">
              <span className="ds-chart-settings-label">Smoothing</span>
              <span className="ds-chart-settings-value">{settings.smoothing}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={settings.smoothing}
              onChange={(e) => handleSmoothingChange(parseInt(e.target.value))}
              className="ds-chart-settings-slider"
            />
          </div>

          {/* Gradient Section */}
          <div 
            className="ds-chart-settings-section" 
            style={{ 
              borderTop: '1px solid var(--color-border-default)',
              paddingTop: 12,
              marginTop: 4 
            }}
          >
            <span 
              className="ds-chart-settings-label" 
              style={{ marginBottom: 8, display: 'block' }}
            >
              Gradient
            </span>

            {/* Gradient Opacity */}
            <div style={{ marginBottom: 12 }}>
              <div className="flex items-center justify-between">
                <span className="ds-chart-settings-sublabel">Opacity</span>
                <span className="ds-chart-settings-value">{settings.gradientOpacity}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={settings.gradientOpacity}
                onChange={(e) => handleGradientOpacityChange(parseInt(e.target.value))}
                className="ds-chart-settings-slider"
              />
            </div>

            {/* Top Color */}
            <div style={{ marginBottom: 12 }}>
              <span className="ds-chart-settings-sublabel">Top Color</span>
              <div className="flex gap-1 flex-wrap" style={{ marginTop: 4 }}>
                {colorOptions.map((color) => (
                  <button
                    key={color.value + '-top'}
                    onClick={() => handleTopColorChange(color.value)}
                    className={cn(
                      'ds-chart-settings-color-btn',
                      settings.gradientTopColor === color.value && 'active'
                    )}
                    style={{ backgroundColor: color.value }}
                    title={color.label}
                  />
                ))}
              </div>
            </div>

            {/* Bottom Color */}
            <div>
              <span className="ds-chart-settings-sublabel">Bottom Color</span>
              <div className="flex gap-1 flex-wrap" style={{ marginTop: 4 }}>
                {colorOptions.map((color) => (
                  <button
                    key={color.value + '-bottom'}
                    onClick={() => handleBottomColorChange(color.value)}
                    className={cn(
                      'ds-chart-settings-color-btn',
                      settings.gradientBottomColor === color.value && 'active'
                    )}
                    style={{ backgroundColor: color.value }}
                    title={color.label}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Account data for Depository Accounts card
const DEPOSITORY_ACCOUNTS = [
  { name: 'Main Checking', balance: 150000 },
  { name: 'Ops & Payroll', balance: 300000 },
  { name: 'Checking', balance: 300000 },
  { name: 'Savings', balance: 350000 },
];

// Sample transaction data
const SAMPLE_TRANSACTIONS = [
  { id: 1, date: 'May 5', name: 'Cursor', amount: 415 },
  { id: 2, date: 'Apr 29', name: 'Cursor', amount: 413 },
  { id: 3, date: 'May 3', name: 'Cursor', amount: 772 },
  { id: 4, date: 'Aug 7', name: 'Cursor', amount: 808 },
  { id: 5, date: 'Oct 17', name: 'Cursor', amount: 939 },
  { id: 6, date: 'Mar 16', name: 'Cursor', amount: 941 },
  { id: 7, date: 'Mar 10', name: 'Cursor', amount: 852 },
  { id: 8, date: 'Mar 26', name: 'Cursor', amount: 975 },
];

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

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div
      className="flex items-center justify-center w-full"
      style={{ paddingTop: 24, paddingBottom: 48 }}
    >
      <div className="flex gap-6" style={{ width: 1024 }}>
        {/* Left Column - Account Breakdown Card */}
        <div
          className="flex flex-col rounded-lg overflow-clip"
          style={{
            width: 500,
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
                  $500K
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
            <div className="flex flex-col" style={{ width: 458 }}>
              {DEPOSITORY_ACCOUNTS.map((account, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 rounded-md ds-account-row"
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
              ))}
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
          className="flex flex-col gap-4 rounded-lg relative overflow-clip"
          style={{
            width: 500,
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
            {SAMPLE_TRANSACTIONS.map((txn) => (
              <div
                key={txn.id}
                className="flex items-center w-full ds-transaction-row"
                style={{ height: 49, borderBottom: '1px solid var(--color-border-default)' }}
              >
                {/* Date Column */}
                <div style={{ width: 87 }}>
                  <span
                    className="text-body"
                    style={{ color: 'var(--ds-text-secondary)' }}
                  >
                    {txn.date}
                  </span>
                </div>

                {/* Avatar + Name Column */}
                <div className="flex items-center gap-3 flex-1">
                  {/* Avatar */}
                  <div
                    className="flex items-center justify-center rounded-full"
                    style={{
                      width: 32,
                      height: 32,
                      backgroundColor: 'var(--neutral-base-700)',
                    }}
                  >
                    <span
                      className="text-tiny"
                      style={{
                        color: 'var(--neutral-base-0)',
                        fontWeight: 500,
                        fontSize: 11,
                      }}
                    >
                      we
                    </span>
                  </div>
                  <span
                    className="text-body"
                    style={{ color: 'var(--ds-text-default)' }}
                  >
                    {txn.name}
                  </span>
                </div>

                {/* Amount Column */}
                <div className="text-right" style={{ width: 55 }}>
                  <span
                    className="text-body"
                    style={{ color: 'var(--ds-text-default)' }}
                  >
                    ${txn.amount}
                  </span>
                  <span
                    className="ds-money-amount-cents"
                    style={{ color: 'var(--ds-text-tertiary)' }}
                  >
                    .00
                  </span>
                </div>
              </div>
            ))}
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

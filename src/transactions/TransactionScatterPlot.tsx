import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import * as d3 from 'd3';
import { type Transaction } from './mockData';

// ============================================================================
// TYPES
// ============================================================================

export interface ScatterPlotTransaction {
  id: string;
  name: string;
  date: Date;
  amount: number;
  needsReceipt?: boolean;
}

export interface TransactionScatterPlotProps {
  /** Array of transactions to plot */
  data: Transaction[];
  /** Optional height override (default: 160px) */
  height?: number;
  /** Optional className for the container */
  className?: string;
  /** Callback when hovering over a transaction (null when not hovering) */
  onTransactionHover?: (transactionId: string | null) => void;
  /** Callback when clicking a transaction */
  onTransactionClick?: (transactionId: string) => void;
}

// ============================================================================
// CONSTANTS - Pixel-perfect values matching the design
// ============================================================================

const COLORS = {
  positive: '#0a5736',       // green (money in) - matches bar chart
  negative: '#d03275',       // pink (money out) - matches bar chart
  tooltipBg: '#1F2937',      // gray-800
  tooltipText: '#FFFFFF',
  tooltipSubtext: '#9CA3AF', // gray-400
  axisLabel: '#374151',      // text-secondary
} as const;

const SIZING = {
  dotRadius: 3,
  dotRadiusHover: 4,
  margin: { top: 20, right: 24, bottom: 32, left: 50 }, // Increased left margin for Y-axis
  tooltipPadding: { x: 12, y: 8 },
  tooltipBorderRadius: 6,
  tooltipOffset: 8,          // vertical offset from dot
  numBands: 4,               // number of time segments (max 4 for readability)
} as const;

/**
 * Calculate optimal number of Y-axis ticks based on viewport width
 * Smaller viewports get fewer labels for better readability
 */
const getYAxisTickCount = (width: number): number => {
  if (width < 400) return 2;
  if (width < 600) return 3;
  if (width < 900) return 4;
  return 5;
};

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Parse a date string into a Date object
 * Supports both ISO format (YYYY-MM-DD) and display format (Dec 8)
 */
const parseTransactionDate = (dateStr: string): Date => {
  // Check if it's ISO format (YYYY-MM-DD)
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const parsed = new Date(dateStr);
    if (!isNaN(parsed.getTime())) {
      return parsed;
    }
  }
  
  // Fall back to display format parsing (Dec 8)
  const currentYear = new Date().getFullYear();
  const parsed = new Date(`${dateStr}, ${currentYear}`);
  
  // If invalid, return current date
  if (isNaN(parsed.getTime())) {
    return new Date();
  }
  
  return parsed;
};

/**
 * Format amount to currency string matching design: -$985.00 or $985.00
 */
const formatAmount = (amount: number): string => {
  const absAmount = Math.abs(amount);
  const formatted = absAmount.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return amount < 0 ? `-${formatted}` : formatted;
};

/**
 * Format date for axis label
 */
const formatAxisDate = (date: Date, isToday: boolean): string => {
  if (isToday) return 'Today';
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Check if two dates are the same day
 */
const isSameDay = (d1: Date, d2: Date): boolean => {
  return d1.toDateString() === d2.toDateString();
};

/**
 * Format amount for Y-axis label (compact format: $1K, $10K, $1M)
 */
const formatYAxisAmount = (amount: number): string => {
  if (amount === 0) return '$0';
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(amount % 1000000 === 0 ? 0 : 1)}M`;
  }
  if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(amount % 1000 === 0 ? 0 : 1)}K`;
  }
  return `$${amount.toFixed(0)}`;
};

/**
 * Transform Transaction to ScatterPlotTransaction
 */
const transformTransaction = (t: Transaction): ScatterPlotTransaction => ({
  id: t.id,
  name: t.toFrom.name,
  date: parseTransactionDate(t.date),
  amount: t.amount,
  needsReceipt: !t.hasAttachment,
});

// ============================================================================
// TOOLTIP COMPONENT
// ============================================================================

interface TooltipProps {
  transaction: ScatterPlotTransaction;
  x: number;
  y: number;
}

const Tooltip: React.FC<TooltipProps> = ({ transaction, x, y }) => {
  return (
    <div
      className="absolute pointer-events-none z-50"
      style={{
        left: `${x}px`,
        top: `${y}px`,
        transform: 'translate(-50%, -100%)', // Center horizontally, position above
        marginTop: `-${SIZING.tooltipOffset}px`, // Gap between tooltip and dot
      }}
    >
      <div
        className="shadow-lg whitespace-nowrap"
        style={{
          backgroundColor: COLORS.tooltipBg,
          color: COLORS.tooltipText,
          padding: `${SIZING.tooltipPadding.y}px ${SIZING.tooltipPadding.x}px`,
          borderRadius: `${SIZING.tooltipBorderRadius}px`,
        }}
      >
        {/* Name and Amount on same line */}
        <div className="flex items-center gap-2 text-[13px] font-medium">
          <span className="truncate max-w-[140px]">{transaction.name}</span>
          <span className="whitespace-nowrap">{formatAmount(transaction.amount)}</span>
        </div>
      </div>
      {/* Tooltip arrow pointing down */}
      <div
        className="absolute left-1/2 -translate-x-1/2"
        style={{
          bottom: '-6px',
          width: 0,
          height: 0,
          borderLeft: '6px solid transparent',
          borderRight: '6px solid transparent',
          borderTop: `6px solid ${COLORS.tooltipBg}`,
        }}
      />
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const TransactionScatterPlot: React.FC<TransactionScatterPlotProps> = ({
  data,
  height = 160,
  className = '',
  onTransactionHover,
  onTransactionClick,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height });
  const [hoveredTransaction, setHoveredTransaction] = useState<ScatterPlotTransaction | null>(null);
  const [hoveredPosition, setHoveredPosition] = useState<{ x: number; y: number } | null>(null);
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
  const [mouseXPosition, setMouseXPosition] = useState<number | null>(null);
  const [isHoveringChart, setIsHoveringChart] = useState(false);

  // Transform transactions to scatter plot format with jitter for same-day spacing
  const scatterData = useMemo(() => {
    const transformed = data
      .filter(t => t.status !== 'failed') // Exclude failed transactions
      .map(transformTransaction)
      .sort((a, b) => a.date.getTime() - b.date.getTime());
    
    // Group by day and assign jitter offset to spread out same-day transactions
    const dayGroups: Record<string, number> = {};
    
    return transformed.map(t => {
      const dayKey = t.date.toDateString();
      const indexInDay = dayGroups[dayKey] || 0;
      dayGroups[dayKey] = indexInDay + 1;
      
      // Assign a jitter offset (-0.3 to +0.3 days) based on position in day
      // This spreads transactions horizontally within their day
      const jitterOffset = indexInDay === 0 ? -0.3 : 0.3;
      
      return {
        ...t,
        jitterOffset, // Store jitter for consistent positioning
      };
    });
  }, [data]);

  // Calculate date range based on actual transaction data
  const dateExtent = useMemo(() => {
    const today = new Date();
    
    if (scatterData.length === 0) {
      // Default to last 30 days if no data
      const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
      return [monthAgo, today] as [Date, Date];
    }
    
    const dates = scatterData.map(d => d.date);
    const minDate = d3.min(dates) || today;
    const maxDate = d3.max(dates) || today;
    
    // Add padding to the date range (5% on each side) so points aren't at edges
    const range = maxDate.getTime() - minDate.getTime();
    const padding = Math.max(range * 0.05, 24 * 60 * 60 * 1000); // At least 1 day padding
    
    return [
      new Date(minDate.getTime() - padding),
      new Date(maxDate.getTime() + padding),
    ] as [Date, Date];
  }, [scatterData]);

  // Calculate max absolute amount for y-scale
  const maxAbsAmount = useMemo(() => {
    if (scatterData.length === 0) return 1000;
    return Math.max(...scatterData.map(d => Math.abs(d.amount)));
  }, [scatterData]);

  // Generate time band ticks (evenly spaced labels)
  const timeBands = useMemo(() => {
    const [minDate, maxDate] = dateExtent;
    const range = maxDate.getTime() - minDate.getTime();
    const numBands = SIZING.numBands;
    const bands: Date[] = [];
    
    for (let i = 0; i < numBands; i++) {
      bands.push(new Date(minDate.getTime() + (range * i) / (numBands - 1)));
    }
    
    return bands;
  }, [dateExtent]);

  // Generate Y-axis ticks (evenly spaced values, excluding $0)
  // Number of ticks is determined by viewport width for better readability
  const yAxisTicks = useMemo(() => {
    const yMax = maxAbsAmount * 1.15; // Match the scale domain
    const tickCount = getYAxisTickCount(dimensions.width);
    const ticks: number[] = [];
    
    // Start from i=1 to skip the $0 tick, generate tickCount-1 visible ticks
    for (let i = 1; i <= tickCount; i++) {
      ticks.push((yMax * i) / tickCount);
    }
    
    return ticks;
  }, [maxAbsAmount, dimensions.width]);

  // Handle resize
  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        setDimensions({
          width: entry.contentRect.width,
          height,
        });
      }
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, [height]);

  // D3 scales
  const scales = useMemo(() => {
    const { margin } = SIZING;
    const innerWidth = Math.max(0, dimensions.width - margin.left - margin.right);
    const innerHeight = Math.max(0, dimensions.height - margin.top - margin.bottom);

    const xScale = d3.scaleTime()
      .domain(dateExtent)
      .range([0, innerWidth]);

    const yScale = d3.scaleLinear()
      .domain([0, maxAbsAmount * 1.15]) // 15% padding at top
      .range([innerHeight, 0]);

    return { xScale, yScale, innerWidth, innerHeight };
  }, [dimensions, dateExtent, maxAbsAmount]);

  // Calculate jittered X position for a point
  const getJitteredX = useCallback((point: ScatterPlotTransaction & { jitterOffset: number }, xScale: d3.ScaleTime<number, number>) => {
    const baseX = xScale(point.date);
    const oneDayMs = 24 * 60 * 60 * 1000;
    const dayWidth = xScale(new Date(point.date.getTime() + oneDayMs)) - baseX;
    return baseX + (point.jitterOffset * dayWidth * 0.5);
  }, []);

  // Handle mouse events for hover
  const handleMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;

    const svgRect = svgRef.current.getBoundingClientRect();
    const mouseX = e.clientX - svgRect.left - SIZING.margin.left;
    const mouseY = e.clientY - svgRect.top - SIZING.margin.top;

    const { xScale, yScale, innerWidth, innerHeight } = scales;

    // Track mouse position for vertical line (only within chart bounds)
    if (mouseX >= 0 && mouseX <= innerWidth && mouseY >= 0 && mouseY <= innerHeight) {
      setMouseXPosition(mouseX);
      setIsHoveringChart(true);
    } else {
      setMouseXPosition(null);
      setIsHoveringChart(false);
    }

    if (scatterData.length === 0) return;

    // Find point directly under cursor (small threshold for direct hover only)
    const hoverThreshold = SIZING.dotRadius + 4; // Only trigger when very close to dot
    let closestDist = Infinity;
    let closestPoint: (ScatterPlotTransaction & { jitterOffset: number }) | null = null;
    let closestX = 0;
    let closestY = 0;
    let closestDate: Date | null = null;
    let closestId: string | null = null;

    scatterData.forEach(point => {
      const px = getJitteredX(point, xScale);
      const py = yScale(Math.abs(point.amount));
      const dist = Math.sqrt((mouseX - px) ** 2 + (mouseY - py) ** 2);

      if (dist < closestDist && dist < hoverThreshold) {
        closestDist = dist;
        closestPoint = point;
        closestX = px + SIZING.margin.left;
        closestY = py + SIZING.margin.top;
        closestDate = point.date;
        closestId = point.id;
      }
    });

    if (closestPoint && closestDate && closestId) {
      setHoveredTransaction(closestPoint);
      setHoveredPosition({ x: closestX, y: closestY });
      setHoveredDate(closestDate);
      onTransactionHover?.(closestId);
    } else {
      setHoveredTransaction(null);
      setHoveredPosition(null);
      setHoveredDate(null);
      onTransactionHover?.(null);
    }
  }, [scatterData, scales, getJitteredX, onTransactionHover]);

  const handleMouseLeave = useCallback(() => {
    setHoveredTransaction(null);
    setHoveredPosition(null);
    setHoveredDate(null);
    setMouseXPosition(null);
    setIsHoveringChart(false);
    onTransactionHover?.(null);
  }, [onTransactionHover]);

  // Handle click on a point
  const handleClick = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current || scatterData.length === 0) return;

    const svgRect = svgRef.current.getBoundingClientRect();
    const mouseX = e.clientX - svgRect.left - SIZING.margin.left;
    const mouseY = e.clientY - svgRect.top - SIZING.margin.top;

    const { xScale, yScale } = scales;

    // Find point directly under cursor - use larger threshold for easier clicking
    const clickThreshold = SIZING.dotRadius + 10;

    for (const point of scatterData) {
      const px = getJitteredX(point, xScale);
      const py = yScale(Math.abs(point.amount));
      const dist = Math.sqrt((mouseX - px) ** 2 + (mouseY - py) ** 2);

      if (dist < clickThreshold) {
        onTransactionClick?.(point.id);
        break;
      }
    }
  }, [scatterData, scales, getJitteredX, onTransactionClick]);

  // Render
  const { margin } = SIZING;
  const { xScale, yScale, innerWidth, innerHeight } = scales;
  const today = new Date();

  if (dimensions.width === 0) {
    return (
      <div ref={containerRef} className={`w-full ${className}`} style={{ height }} />
    );
  }

  return (
    <div ref={containerRef} className={`relative w-full ${className}`} style={{ height }}>
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        className="overflow-visible"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
      >
        <g transform={`translate(${margin.left}, ${margin.top})`}>

          {/* Y-axis ticks and labels */}
          {yAxisTicks.map((tick, i) => {
            const y = yScale(tick);
            return (
              <g key={`y-tick-${i}`}>
                {/* Bottom baseline only */}
                {i === 0 && (
                  <line
                    x1={0}
                    y1={y}
                    x2={innerWidth}
                    y2={y}
                    stroke="#F3F4F6"
                    strokeWidth={1}
                    style={{ pointerEvents: 'none' }}
                  />
                )}
                {/* Tick label */}
                <text
                  x={-8}
                  y={y}
                  textAnchor="end"
                  dominantBaseline="middle"
                  fill={COLORS.axisLabel}
                  fontSize="13px"
                  fontWeight="400"
                  fontFamily="Arcadia Text, sans-serif"
                  letterSpacing="0.1px"
                >
                  {formatYAxisAmount(tick)}
                </text>
              </g>
            );
          })}

          {/* X-axis labels - hide all when hovering */}
          {timeBands.map((date, i) => {
            const x = xScale(date);
            const isToday = isSameDay(date, today);
            const label = formatAxisDate(date, isToday);
            
            return (
              <text
                key={`label-${i}`}
                x={x}
                y={innerHeight + 20}
                textAnchor="middle"
                fill={COLORS.axisLabel}
                fontSize="13px"
                fontWeight="400"
                fontFamily="Arcadia Text, sans-serif"
                letterSpacing="0.1px"
                style={{ 
                  opacity: isHoveringChart ? 0 : 1,
                  transition: 'opacity 100ms ease-out',
                }}
              >
                {label}
              </text>
            );
          })}

          {/* Vertical line following mouse with date label */}
          {isHoveringChart && mouseXPosition !== null && (
            <>
              <line
                x1={mouseXPosition}
                y1={0}
                x2={mouseXPosition}
                y2={innerHeight}
                stroke="#9CA3AF"
                strokeWidth={1}
                style={{ pointerEvents: 'none' }}
              />
              <text
                x={mouseXPosition}
                y={innerHeight + 20}
                textAnchor="middle"
                fill="#374151"
                fontSize="11px"
                fontWeight="600"
                fontFamily="system-ui, -apple-system, sans-serif"
                style={{ pointerEvents: 'none' }}
              >
                {formatAxisDate(xScale.invert(mouseXPosition), isSameDay(xScale.invert(mouseXPosition), today))}
              </text>
            </>
          )}

          {/* Scatter points with jittered X positions */}
          {scatterData.map(point => {
            // Apply jitter to spread out same-day transactions
            const baseX = xScale(point.date);
            const oneDayMs = 24 * 60 * 60 * 1000;
            const dayWidth = xScale(new Date(point.date.getTime() + oneDayMs)) - baseX;
            const cx = baseX + (point.jitterOffset * dayWidth * 0.5);
            const cy = yScale(Math.abs(point.amount));
            const isHovered = hoveredTransaction?.id === point.id;
            const isPositive = point.amount >= 0;

            return (
              <g 
                key={point.id} 
                style={{ cursor: 'pointer' }}
                onClick={(e) => {
                  e.stopPropagation();
                  onTransactionClick?.(point.id);
                }}
              >
                {/* Invisible larger hit area for easier clicking */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={15}
                  fill="transparent"
                  style={{ pointerEvents: 'all' }}
                />
                {/* Visible dot */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={isHovered ? SIZING.dotRadiusHover : SIZING.dotRadius}
                  fill={isPositive ? COLORS.positive : COLORS.negative}
                  className="transition-all duration-75"
                  style={{
                    pointerEvents: 'none',
                    filter: isHovered ? 'brightness(1.1)' : 'none',
                  }}
                />
              </g>
            );
          })}
        </g>
      </svg>

      {/* Tooltip - rendered as HTML overlay */}
      {hoveredTransaction && hoveredPosition && (
        <Tooltip
          transaction={hoveredTransaction}
          x={hoveredPosition.x}
          y={hoveredPosition.y}
        />
      )}
    </div>
  );
};

export default TransactionScatterPlot;

// ============================================================================
// SAMPLE MOCK DATA FOR TESTING
// ============================================================================

/**
 * Generate sample transactions spanning Jan 1 to Today
 * Use this to test the scatter plot immediately
 */
export const generateScatterPlotMockData = (count: number = 50): Transaction[] => {
  const merchants = [
    { name: 'IBM', initials: 'IB' },
    { name: 'Microsoft', initials: 'MS' },
    { name: 'Apple', initials: 'AP' },
    { name: 'Google', initials: 'GO' },
    { name: 'Amazon', initials: 'AM' },
    { name: 'Stripe', initials: 'ST' },
    { name: 'Shopify', initials: 'SH' },
    { name: 'Slack', initials: 'SL' },
    { name: 'Notion', initials: 'NO' },
    { name: 'Figma', initials: 'FI' },
  ];

  const accounts = ['Ops / Payroll', 'AR', 'Credit account', 'Treasury'];
  
  const today = new Date();
  const startOfYear = new Date(today.getFullYear(), 0, 1);
  const dateRange = today.getTime() - startOfYear.getTime();

  const transactions: Transaction[] = [];

  for (let i = 0; i < count; i++) {
    const merchant = merchants[Math.floor(Math.random() * merchants.length)];
    const randomDate = new Date(startOfYear.getTime() + Math.random() * dateRange);
    const formattedDate = randomDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    // Amount between $10 and $5000, with some larger outliers
    let amount = Math.random() * 4990 + 10;
    if (Math.random() < 0.1) {
      // 10% chance of larger transaction
      amount = Math.random() * 10000 + 5000;
    }
    amount = Math.round(amount * 100) / 100;
    
    // 40% chance of negative (money out)
    if (Math.random() < 0.4) {
      amount = -amount;
    }

    transactions.push({
      id: `scatter-${i}`,
      date: formattedDate,
      toFrom: merchant,
      amount,
      account: accounts[Math.floor(Math.random() * accounts.length)],
      method: { type: 'card', cardLast4: '1234', cardHolder: 'Jane B.' },
      hasAttachment: Math.random() > 0.6, // 40% need receipt
      status: 'completed',
    });
  }

  return transactions;
};

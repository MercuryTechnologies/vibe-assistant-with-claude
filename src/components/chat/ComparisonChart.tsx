import { useMemo } from 'react';

interface ChartPeriod {
  label: string;
  previousValue: number;
  currentValue: number;
}

interface ComparisonChartProps {
  periods: ChartPeriod[];
  legend: {
    previous: string;
    current: string;
  };
  yAxisLabel?: string;
  context?: 'rhc' | 'command';
  className?: string;
}

/**
 * ComparisonChart - A dual-line chart comparing two time periods
 * Used to show burn rate trends, Q3 vs Q4, etc.
 * Responsive with context awareness for RHC panel
 */
export function ComparisonChart({ 
  periods, 
  legend, 
  // yAxisLabel is reserved for future Y-axis display
  yAxisLabel: _yAxisLabel = '$K', // eslint-disable-line @typescript-eslint/no-unused-vars
  context = 'rhc',
  className = '' 
}: ComparisonChartProps) {
  const isCompact = context === 'rhc';
  
  // Chart dimensions based on context
  const dimensions = useMemo(() => ({
    width: isCompact ? 280 : 400,
    height: isCompact ? 80 : 120,
    padding: {
      top: 10,
      bottom: isCompact ? 16 : 20,
      left: 10,
      right: 10,
    },
  }), [isCompact]);

  // Generate SVG points from data
  const { previousPoints, currentPoints } = useMemo(() => {
    const allValues = periods.flatMap(p => [p.previousValue, p.currentValue]);
    const max = Math.max(...allValues);
    
    const { width, height, padding } = dimensions;
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;
    
    const prevPts = periods.map((p, i) => {
      const x = padding.left + (i / (periods.length - 1)) * chartWidth;
      const y = padding.top + (1 - p.previousValue / max) * chartHeight;
      return `${x},${y}`;
    }).join(' ');
    
    const currPts = periods.map((p, i) => {
      const x = padding.left + (i / (periods.length - 1)) * chartWidth;
      const y = padding.top + (1 - p.currentValue / max) * chartHeight;
      return `${x},${y}`;
    }).join(' ');
    
    return { previousPoints: prevPts, currentPoints: currPts };
  }, [periods, dimensions]);

  return (
    <div className={`chat-chart ${isCompact ? 'chat-chart--compact' : ''} ${className}`}>
      {/* Legend */}
      <div className="chat-chart__legend">
        <span className="chat-chart__legend-item">
          <span className="chat-chart__legend-line chat-chart__legend-line--dashed" />
          <span className={`${isCompact ? 'text-micro' : 'text-tiny'} chat-chart__legend-label`}>
            {legend.previous}
          </span>
        </span>
        <span className="chat-chart__legend-item">
          <span className="chat-chart__legend-line chat-chart__legend-line--solid" />
          <span className={`${isCompact ? 'text-micro' : 'text-tiny'} chat-chart__legend-label`}>
            {legend.current}
          </span>
        </span>
      </div>

      {/* Chart */}
      <div className="chat-chart__svg-container">
        <svg 
          viewBox={`0 0 ${dimensions.width} ${dimensions.height}`} 
          preserveAspectRatio="xMidYMid meet"
          className="chat-chart__svg"
        >
          {/* Previous period line (dashed) */}
          <polyline
            points={previousPoints}
            fill="none"
            stroke="var(--neutral-base-400)"
            strokeWidth="2"
            strokeDasharray="4,4"
          />
          
          {/* Current period line (solid) */}
          <polyline
            points={currentPoints}
            fill="none"
            stroke="var(--purple-magic-600)"
            strokeWidth="2"
          />
        </svg>
      </div>

      {/* X-axis labels */}
      <div className="chat-chart__x-axis">
        {periods.map((p, i) => (
          <span 
            key={i} 
            className={`${isCompact ? 'text-micro' : 'text-tiny'} chat-chart__x-label`}
          >
            {p.label}
          </span>
        ))}
      </div>
    </div>
  );
}

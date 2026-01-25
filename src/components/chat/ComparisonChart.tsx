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
  className?: string;
}

/**
 * ComparisonChart - A dual-line chart comparing two time periods
 * Used to show burn rate trends, Q3 vs Q4, etc.
 */
export function ComparisonChart({ 
  periods, 
  legend, 
  yAxisLabel: _yAxisLabel = '$K',
  className = '' 
}: ComparisonChartProps) {
  // Generate SVG points from data
  const { previousPoints, currentPoints, maxValue: _maxValue } = useMemo(() => {
    const allValues = periods.flatMap(p => [p.previousValue, p.currentValue]);
    const max = Math.max(...allValues);
    
    const width = 300;
    const height = 100;
    const padding = { top: 10, bottom: 20, left: 10, right: 10 };
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
    
    return { previousPoints: prevPts, currentPoints: currPts, maxValue: max };
  }, [periods]);

  return (
    <div className={`chat-comparison-chart ${className}`}>
      {/* Legend */}
      <div className="chat-chart-legend">
        <span className="chat-legend-item">
          <span className="chat-legend-line chat-legend-line-dashed" />
          <span className="text-tiny" style={{ color: 'var(--ds-text-secondary)' }}>
            {legend.previous}
          </span>
        </span>
        <span className="chat-legend-item">
          <span className="chat-legend-line chat-legend-line-solid" />
          <span className="text-tiny" style={{ color: 'var(--ds-text-secondary)' }}>
            {legend.current}
          </span>
        </span>
      </div>

      {/* Chart */}
      <div className="chat-chart-container">
        <svg viewBox="0 0 300 100" preserveAspectRatio="xMidYMid meet">
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
      <div className="chat-chart-x-axis">
        {periods.map((p, i) => (
          <span 
            key={i} 
            className="text-tiny"
            style={{ color: 'var(--ds-text-tertiary)' }}
          >
            {p.label}
          </span>
        ))}
      </div>
    </div>
  );
}

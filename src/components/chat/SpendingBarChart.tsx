import { useMemo } from 'react';

interface BarChartItem {
  label: string;
  value: number;
  percentage?: number;
}

interface SpendingBarChartProps {
  title?: string;
  items: BarChartItem[];
  showPercentages?: boolean;
  context?: 'rhc' | 'command';
  className?: string;
}

/**
 * Format currency value for display
 */
function formatCurrency(value: number): string {
  const absValue = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  
  if (absValue >= 1000000) {
    return `${sign}$${(absValue / 1000000).toFixed(1)}M`;
  }
  if (absValue >= 1000) {
    return `${sign}$${(absValue / 1000).toFixed(1)}K`;
  }
  return `${sign}$${absValue.toFixed(0)}`;
}

/**
 * SpendingBarChart - Horizontal bar chart showing spending breakdown
 * Used for category breakdowns, vendor spending, etc.
 * Responsive with context awareness for RHC panel
 */
export function SpendingBarChart({ 
  title, 
  items, 
  showPercentages = false,
  context = 'rhc',
  className = '' 
}: SpendingBarChartProps) {
  const isCompact = context === 'rhc';
  
  const maxValue = useMemo(() => {
    return Math.max(...items.map(i => Math.abs(i.value)));
  }, [items]);

  return (
    <div className={`chat-bar-chart ${isCompact ? 'chat-bar-chart--compact' : ''} ${className}`}>
      {title && (
        <h4 className={`${isCompact ? 'text-label-demi' : 'text-body-demi'} chat-bar-chart__title`}>
          {title}
        </h4>
      )}
      
      <div className="chat-bar-chart__items">
        {items.map((item, i) => (
          <div key={i} className="chat-bar-chart__row">
            <span className={`${isCompact ? 'text-label' : 'text-body-sm'} chat-bar-chart__label`}>
              {item.label}
            </span>
            
            <div className="chat-bar-chart__bar-container">
              <div
                className={`chat-bar-chart__bar ${item.value < 0 ? 'chat-bar-chart__bar--negative' : ''}`}
                style={{
                  width: `${(Math.abs(item.value) / maxValue) * 100}%`,
                }}
              />
            </div>
            
            <span className={`${isCompact ? 'text-label' : 'text-body-sm'} chat-bar-chart__value`}>
              {formatCurrency(item.value)}
            </span>
            
            {showPercentages && item.percentage !== undefined && (
              <span className={`${isCompact ? 'text-micro' : 'text-tiny'} chat-bar-chart__percentage`}>
                {item.percentage}%
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

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
 */
export function SpendingBarChart({ 
  title, 
  items, 
  showPercentages = false,
  className = '' 
}: SpendingBarChartProps) {
  const maxValue = useMemo(() => {
    return Math.max(...items.map(i => Math.abs(i.value)));
  }, [items]);

  return (
    <div className={`chat-spending-breakdown ${className}`}>
      {title && (
        <h4 className="text-label-demi" style={{ 
          color: 'var(--ds-text-default)', 
          marginBottom: 12 
        }}>
          {title}
        </h4>
      )}
      
      <div className="chat-spending-items">
        {items.map((item, i) => (
          <div key={i} className="chat-spending-row">
            <span 
              className="text-body-sm chat-spending-label"
              style={{ color: 'var(--ds-text-default)' }}
            >
              {item.label}
            </span>
            
            <div className="chat-spending-bar-container">
              <div
                className="chat-spending-bar"
                style={{
                  width: `${(Math.abs(item.value) / maxValue) * 100}%`,
                  backgroundColor: item.value < 0 
                    ? 'var(--neutral-base-300)' 
                    : 'var(--purple-magic-300)',
                }}
              />
            </div>
            
            <span 
              className="text-body-sm chat-spending-value"
              style={{ 
                color: 'var(--ds-text-default)',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {formatCurrency(item.value)}
            </span>
            
            {showPercentages && item.percentage !== undefined && (
              <span 
                className="text-tiny chat-spending-percentage"
                style={{ color: 'var(--ds-text-tertiary)' }}
              >
                {item.percentage}%
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

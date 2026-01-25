import { Icon } from '@/components/ui/icon';
import { faArrowTrendUp, faArrowTrendDown } from '@/icons';

interface StatItem {
  label: string;
  value: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
}

interface SummaryStatsProps {
  stats: StatItem[];
  layout?: 'row' | 'grid';
  className?: string;
}

/**
 * SummaryStats - Compact display of key metrics
 * Shows runway, burn rate, balance, etc. with optional trend indicators
 */
export function SummaryStats({ 
  stats, 
  layout = 'row',
  className = '' 
}: SummaryStatsProps) {
  return (
    <div className={`chat-summary-stats chat-summary-stats-${layout} ${className}`}>
      {stats.map((stat, i) => (
        <div key={i} className="chat-stat-item">
          <span 
            className="text-tiny"
            style={{ color: 'var(--ds-text-secondary)' }}
          >
            {stat.label}
          </span>
          <div className="chat-stat-value-row">
            <span 
              className="text-body-demi"
              style={{ 
                color: 'var(--ds-text-default)',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {stat.value}
            </span>
            {stat.trend && stat.trendValue && (
              <span 
                className={`chat-stat-trend chat-stat-trend-${stat.trend}`}
              >
                {stat.trend === 'up' && (
                  <Icon icon={faArrowTrendUp} size="small" style={{ color: 'var(--ds-icon-success)' }} />
                )}
                {stat.trend === 'down' && (
                  <Icon icon={faArrowTrendDown} size="small" style={{ color: 'var(--ds-icon-error)' }} />
                )}
                <span className="text-tiny" style={{ 
                  color: stat.trend === 'up' 
                    ? 'var(--color-success)' 
                    : stat.trend === 'down' 
                      ? 'var(--color-error)' 
                      : 'var(--ds-text-tertiary)'
                }}>
                  {stat.trendValue}
                </span>
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

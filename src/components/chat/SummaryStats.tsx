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
  context?: 'rhc' | 'command';
  className?: string;
}

/**
 * SummaryStats - Compact display of key metrics
 * Shows runway, burn rate, balance, etc. with optional trend indicators
 * Supports compact mode for RHC panel
 */
export function SummaryStats({ 
  stats, 
  layout = 'row',
  context = 'rhc',
  className = '' 
}: SummaryStatsProps) {
  const isCompact = context === 'rhc';
  
  return (
    <div className={`chat-stats ${isCompact ? 'chat-stats--compact' : ''} chat-stats--${layout} ${className}`}>
      {stats.map((stat, i) => (
        <div key={i} className="chat-stats__item">
          <span className={`${isCompact ? 'text-micro' : 'text-tiny'} chat-stats__label`}>
            {stat.label}
          </span>
          <div className="chat-stats__value-row">
            <span className={`${isCompact ? 'text-body-sm-demi' : 'text-body-demi'} chat-stats__value`}>
              {stat.value}
            </span>
            {stat.trend && stat.trendValue && (
              <span className={`chat-stats__trend chat-stats__trend--${stat.trend}`}>
                {stat.trend === 'up' && (
                  <Icon icon={faArrowTrendUp} size="small" className="chat-stats__trend-icon--up" />
                )}
                {stat.trend === 'down' && (
                  <Icon icon={faArrowTrendDown} size="small" className="chat-stats__trend-icon--down" />
                )}
                <span className={`${isCompact ? 'text-micro' : 'text-tiny'} chat-stats__trend-value--${stat.trend}`}>
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

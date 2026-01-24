import React from 'react';

// Arrow icons for insights (trend arrows)
const ArrowUpIcon = () => (
  <svg
    className="scorecard-arrow-icon"
    viewBox="0 0 20 20"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
  >
    <path d="M10 15V5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M5.5 9.5L10 5l4.5 4.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ArrowDownIcon = () => (
  <svg
    className="scorecard-arrow-icon"
    viewBox="0 0 20 20"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
  >
    <path d="M10 5v10" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M5.5 10.5L10 15l4.5-4.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export interface Insight {
  id: string;
  type: 'positive' | 'negative';
  title: string;
  description: string;
}

export interface ScorecardProps {
  netCashflow: string;
  moneyIn: string;
  moneyOut: string;
  insights: Insight[];
  onInsightClick?: (insight: Insight) => void;
}

export const Scorecard: React.FC<ScorecardProps> = ({
  netCashflow,
  moneyIn,
  moneyOut,
  insights,
  onInsightClick
}) => {
  return (
    <div 
      className="rounded-lg p-6"
      style={{ 
        backgroundColor: 'var(--ds-bg-default)',
        minWidth: 240,
        width: '100%',
      }}
    >
      {/* Net Cashflow */}
      <div className="mb-6 w-full">
        <h2 
          className="text-label mb-1" 
          style={{ color: 'var(--ds-text-secondary)' }}
        >
          Net Cashflow
        </h2>
        <div className="text-title-hero tabular-nums">
          {netCashflow}
        </div>
      </div>

      {/* Money In and Money Out - Side by Side */}
      <div 
        className="flex gap-6 mb-6 pb-6"
        style={{ borderBottom: '1px solid var(--color-border-default)' }}
      >
        <div className="flex-1 min-w-0">
          <h3 
            className="text-label mb-1"
            style={{ color: 'var(--ds-text-secondary)' }}
          >
            Money in
          </h3>
          <div className="text-title-secondary tabular-nums">
            {moneyIn}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h3 
            className="text-label mb-1"
            style={{ color: 'var(--ds-text-secondary)' }}
          >
            Money out
          </h3>
          <div className="text-title-secondary tabular-nums">
            {moneyOut}
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="flex flex-col gap-2">
        {insights.map((insight) => (
          <button
            key={insight.id}
            type="button"
            onClick={() => onInsightClick?.(insight)}
            className="scorecard-insight-button"
          >
            {/* Arrow Icon */}
            <div className="scorecard-insight-icon">
              {insight.type === 'positive' ? <ArrowUpIcon /> : <ArrowDownIcon />}
            </div>
            
            {/* Insight Content */}
            <div className="flex-1 min-w-0">
              <p className="scorecard-insight-title">
                {insight.title}
              </p>
              <p className="scorecard-insight-description">
                {insight.description}
              </p>
            </div>
            
            {/* Chat hint icon - appears on hover */}
            <div className="scorecard-insight-chat-icon">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
              </svg>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Scorecard;

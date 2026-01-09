import React from 'react';

// Arrow icons for insights (black trend arrows, not chevrons)
const ArrowUpIcon = () => (
  <svg
    className="w-4 h-4"
    viewBox="0 0 20 20"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
  >
    {/* Vertical stem */}
    <path
      d="M10 15V5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Arrow head */}
    <path
      d="M5.5 9.5L10 5l4.5 4.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ArrowDownIcon = () => (
  <svg
    className="w-4 h-4"
    viewBox="0 0 20 20"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
  >
    {/* Vertical stem */}
    <path
      d="M10 5v10"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Arrow head */}
    <path
      d="M5.5 10.5L10 15l4.5-4.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
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

const Scorecard: React.FC<ScorecardProps> = ({
  netCashflow,
  moneyIn,
  moneyOut,
  insights,
  onInsightClick
}) => {
  return (
    <div className="bg-white rounded-xl min-w-[240px] w-full px-6">
      {/* Net Cashflow */}
      <div className="mb-6 w-full">
        <h2 className="text-label mb-1 w-full">Net Cashflow</h2>
        <div
          className="text-4xl font-bold text-gray-900 whitespace-nowrap tracking-[-0.03em]"
        >
          {netCashflow}
        </div>
      </div>

      {/* Money In and Money Out - Side by Side */}
      <div className="flex gap-6 mb-6 pb-6 border-b border-gray-100">
        <div className="flex-1 min-w-0">
          <h3 className="text-label mb-1">Money in</h3>
          <div
            className="text-2xl font-semibold text-gray-900 whitespace-nowrap tracking-[-0.03em]"
          >
            {moneyIn}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-label mb-1">Money out</h3>
          <div
            className="text-2xl font-semibold text-gray-900 whitespace-nowrap tracking-[-0.03em]"
          >
            {moneyOut}
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="space-y-2">
        {insights.map((insight) => (
          <button
            key={insight.id}
            type="button"
            onClick={() => onInsightClick?.(insight)}
            className="w-full text-left flex items-start gap-3 p-3 -mx-3 rounded-xl transition-all duration-200 hover:bg-[rgba(82,102,235,0.06)] hover:shadow-[inset_0_0_0_1px_rgba(82,102,235,0.15)] group cursor-pointer"
          >
            {/* Arrow Icon */}
            <div
              className="flex-shrink-0 mt-[2px] text-gray-900 transition-transform duration-200 group-hover:scale-110"
            >
              {insight.type === 'positive' ? <ArrowUpIcon /> : <ArrowDownIcon />}
            </div>
            
            {/* Insight Content */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 leading-snug group-hover:text-[#5266eb] transition-colors duration-200">
                {insight.title}
              </p>
              <p className="mt-1 text-sm text-gray-500 leading-relaxed">
                {insight.description}
              </p>
            </div>
            
            {/* Chat hint icon - appears on hover */}
            <div className="flex-shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <svg className="w-4 h-4 text-[#5266eb]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
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


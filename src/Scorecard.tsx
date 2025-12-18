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
}

const Scorecard: React.FC<ScorecardProps> = ({
  netCashflow,
  moneyIn,
  moneyOut,
  insights
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
      <div className="space-y-4">
        {insights.map((insight) => (
          <div key={insight.id} className="flex items-start gap-3">
            {/* Arrow Icon */}
            <div
              className="flex-shrink-0 mt-[2px] text-gray-900"
            >
              {insight.type === 'positive' ? <ArrowUpIcon /> : <ArrowDownIcon />}
            </div>
            
            {/* Insight Content */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 leading-snug">
                {insight.title}
              </p>
              <p className="mt-1 text-sm text-gray-500 leading-relaxed">
                {insight.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Scorecard;


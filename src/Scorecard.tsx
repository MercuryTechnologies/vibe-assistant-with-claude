import React from 'react';

// Arrow icons for insights
const ArrowUpIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L10 4.414 4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
  </svg>
);

const ArrowDownIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L10 15.586l5.293-5.293a1 1 0 011.414 0z" clipRule="evenodd" />
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
  lastUpdated: string;
  insights: Insight[];
}

const Scorecard: React.FC<ScorecardProps> = ({
  netCashflow,
  moneyIn,
  moneyOut,
  lastUpdated,
  insights
}) => {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      {/* Net Cashflow */}
      <div className="mb-6">
        <h2 className="text-sm font-medium text-gray-600 mb-2">Net Cashflow</h2>
        <div className="text-4xl font-bold text-gray-900">{netCashflow}</div>
      </div>

      {/* Money In and Money Out */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
        <div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Money in</h3>
          <div className="text-2xl font-semibold text-gray-900">{moneyIn}</div>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Money out</h3>
          <div className="text-2xl font-semibold text-gray-900">{moneyOut}</div>
        </div>
      </div>

      {/* Last Updated */}
      <div className="mb-6 pb-6 border-b border-gray-100">
        <p className="text-sm text-gray-500">{lastUpdated}</p>
      </div>

      {/* Insights */}
      <div className="space-y-4">
        {insights.map((insight) => (
          <div key={insight.id} className="flex items-start gap-3">
            {/* Arrow Icon */}
            <div className={`flex-shrink-0 mt-0.5 ${
              insight.type === 'positive' 
                ? 'text-green-600' 
                : 'text-red-600'
            }`}>
              {insight.type === 'positive' ? <ArrowUpIcon /> : <ArrowDownIcon />}
            </div>
            
            {/* Insight Content */}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900 leading-relaxed">
                <span className="font-semibold">{insight.title}:</span>{' '}
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


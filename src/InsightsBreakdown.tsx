import React, { useState } from 'react';
import SegmentedControl from './SegmentedControl';

interface BreakdownItem {
  label: string;
  percentage: number;
  amount: number;
}

interface BreakdownModuleProps {
  title: string;
  totalAmount: string;
  tabs: string[];
  items: BreakdownItem[];
  isNegative?: boolean;
}

const BreakdownModule: React.FC<BreakdownModuleProps> = ({
  title,
  totalAmount,
  tabs,
  items,
  isNegative = false,
}) => {
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const activeTabIndex = tabs.indexOf(activeTab);

  // Calculate max percentage to determine gauge widths
  const maxPercentage = Math.max(...items.map(item => item.percentage));

  const formatAmount = (amount: number) => {
    const formatted = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Math.abs(amount));
    
    if (isNegative) {
      return `–$${formatted}`;
    }
    return `$${formatted}`;
  };

  return (
    <div className="bg-white border border-[rgba(112,115,147,0.1)] rounded-xl overflow-hidden flex-1">
      {/* Header */}
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-[15px] text-[#535461] leading-6">{title}</span>
            <span className="text-[28px] font-[480] text-[#1e1e2a] leading-[1.1] font-display tracking-[-0.01em]">
              {totalAmount}
            </span>
          </div>
          <button
            className="w-8 h-8 flex items-center justify-center rounded-full bg-[rgba(112,115,147,0.1)] text-[#363644] hover:bg-[rgba(112,115,147,0.15)] transition-colors"
            aria-label="More options"
          >
            <i className="fa-solid fa-ellipsis-vertical text-[11px]" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 pt-4 pb-6">
        {/* Segmented Control */}
        <div className="mb-6">
          <SegmentedControl
            options={tabs}
            value={activeTab}
            onChange={setActiveTab}
            size="sm"
            aria-label={`${title} view selection`}
          />
        </div>

        {/* Breakdown Table */}
        <div className="flex gap-2">
          {/* Label Column */}
          <div className="flex flex-col gap-1 w-[180px] shrink-0">
            <div className="pb-1 pt-0">
              <span className="text-[13px] text-[#535461] leading-5 tracking-[0.1px]">
                {activeTabIndex === 0 ? (title === 'Money In' ? 'Source' : 'Category') : activeTab}
              </span>
            </div>
            {items.map((item, index) => (
              <div key={index} className="py-1">
                <span className="text-[15px] text-[#363644] leading-6">{item.label}</span>
              </div>
            ))}
          </div>

          {/* Gauge Column */}
          <div className="flex flex-col gap-1 flex-1">
            <div className="pb-1 pt-0">
              <span className="text-[13px] text-[#535461] leading-5 tracking-[0.1px] text-right block">
                % of total
              </span>
            </div>
            {items.map((item, index) => (
              <div key={index} className="py-1 flex items-center gap-2">
                <span className="text-[15px] text-[#363644] leading-6 w-10 text-right">
                  {item.percentage}%
                </span>
                <div className="h-[5px] bg-[#f9f9f9] rounded-full flex-1 overflow-hidden flex gap-px">
                  {items.map((_, i) => {
                    const width = (items[i].percentage / 100) * 100;
                    const isHighlighted = i === index;
                    const isLast = items[i].label.toLowerCase().includes('remaining');
                    return (
                      <div
                        key={i}
                        className={`h-[6px] transition-colors ${
                          isHighlighted 
                            ? (isLast ? 'bg-[#70707d]' : 'bg-[#5266eb]')
                            : 'bg-[#e3e3e9]'
                        }`}
                        style={{ 
                          width: `${Math.max(width * 1.2, 6)}px`,
                          minWidth: '6px'
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Amount Column */}
          <div className="flex flex-col gap-1 items-end shrink-0">
            <div className="pb-1 pt-0">
              <span className="text-[13px] text-[#535461] leading-5 tracking-[0.1px]">Amount</span>
            </div>
            {items.map((item, index) => (
              <div key={index} className="py-1">
                <span className={`text-[15px] leading-6 tabular-nums ${isNegative ? 'text-[#363644]' : 'text-[#363644]'}`}>
                  {formatAmount(item.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

interface InsightsBreakdownProps {
  moneyInTotal: string;
  moneyOutTotal: string;
  moneyInItems?: BreakdownItem[];
  moneyOutItems?: BreakdownItem[];
}

const InsightsBreakdown: React.FC<InsightsBreakdownProps> = ({
  moneyInTotal,
  moneyOutTotal,
  moneyInItems,
  moneyOutItems,
}) => {
  // Default sample data for Money In
  const defaultMoneyInItems: BreakdownItem[] = moneyInItems || [
    { label: 'Gourmet Haven', percentage: 38, amount: 1725 },
    { label: 'Culinary Delights', percentage: 31, amount: 5365 },
    { label: 'Taste Buds Bistro', percentage: 23, amount: 1224 },
    { label: 'Savory Spot', percentage: 21, amount: 9714 },
    { label: 'Epicurean Eats', percentage: 19, amount: 7018 },
    { label: 'Flavor Town', percentage: 16, amount: 254 },
    { label: 'Dine Divine', percentage: 10, amount: 8956 },
    { label: 'Remaining sources', percentage: 29, amount: 18956 },
  ];

  // Default sample data for Money Out
  const defaultMoneyOutItems: BreakdownItem[] = moneyOutItems || [
    { label: 'Legal', percentage: 38, amount: 12500 },
    { label: 'Government Services', percentage: 31, amount: 9345 },
    { label: 'Electronics', percentage: 23, amount: 6789 },
    { label: 'Ground Transportation', percentage: 21, amount: 13678 },
    { label: 'Charity', percentage: 19, amount: 14234 },
    { label: 'Insurance', percentage: 16, amount: 11890 },
    { label: 'Other', percentage: 10, amount: 7123 },
    { label: 'Remaining categories', percentage: 29, amount: 10456 },
  ];

  return (
    <div className="flex gap-6 items-stretch px-6 pt-6">
      <BreakdownModule
        title="Money In"
        totalAmount={moneyInTotal}
        tabs={['Sources', 'Category']}
        items={defaultMoneyInItems}
        isNegative={false}
      />
      <BreakdownModule
        title="Money Out"
        totalAmount={moneyOutTotal}
        tabs={['Category', 'GL Code', 'Recipient']}
        items={defaultMoneyOutItems}
        isNegative={true}
      />
    </div>
  );
};

export default InsightsBreakdown;


import React, { useState } from 'react';
import { SegmentedControl } from './ui/segmented-control';
import { Icon } from './ui/icon';
import { faEllipsisVertical } from '@fortawesome/free-solid-svg-icons';

export interface BreakdownItem {
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
    <div 
      className="rounded-lg overflow-hidden flex-1"
      style={{ 
        backgroundColor: 'var(--ds-bg-default)',
        border: '1px solid var(--color-border-default)',
      }}
    >
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <span 
              className="text-body"
              style={{ color: 'var(--ds-text-secondary)' }}
            >
              {title}
            </span>
            <span 
              className="text-title-main"
              style={{ color: 'var(--ds-text-default)' }}
            >
              {totalAmount}
            </span>
          </div>
          <button
            className="insights-more-button"
            aria-label="More options"
          >
            <Icon icon={faEllipsisVertical} size="small" />
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
          <div className="flex flex-col gap-1" style={{ width: 180, flexShrink: 0 }}>
            <div className="pb-1 pt-0">
              <span 
                className="text-label"
                style={{ color: 'var(--ds-text-secondary)' }}
              >
                {activeTabIndex === 0 ? (title === 'Money In' ? 'Source' : 'Category') : activeTab}
              </span>
            </div>
            {items.map((item, index) => (
              <div key={index} className="py-1">
                <span 
                  className="text-body"
                  style={{ color: 'var(--ds-text-default)' }}
                >
                  {item.label}
                </span>
              </div>
            ))}
          </div>

          {/* Gauge Column */}
          <div className="flex flex-col gap-1 flex-1">
            <div className="pb-1 pt-0">
              <span 
                className="text-label block text-right"
                style={{ color: 'var(--ds-text-secondary)' }}
              >
                % of total
              </span>
            </div>
            {items.map((item, index) => (
              <div key={index} className="py-1 flex items-center gap-2">
                <span 
                  className="text-body text-right tabular-nums"
                  style={{ width: 40, color: 'var(--ds-text-default)' }}
                >
                  {item.percentage}%
                </span>
                <div 
                  className="flex-1 overflow-hidden flex gap-px rounded-full"
                  style={{ height: 5, backgroundColor: 'var(--neutral-base-100)' }}
                >
                  {items.map((segmentItem, i) => {
                    const width = (segmentItem.percentage / 100) * 100;
                    const isHighlighted = i === index;
                    const isLast = segmentItem.label.toLowerCase().includes('remaining');
                    return (
                      <div
                        key={i}
                        style={{ 
                          width: `${Math.max(width * 1.2, 6)}px`,
                          minWidth: 6,
                          height: 6,
                          backgroundColor: isHighlighted 
                            ? (isLast ? 'var(--neutral-base-500)' : 'var(--purple-magic-500)')
                            : 'var(--neutral-base-200)',
                          transition: 'background-color 0.15s',
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Amount Column */}
          <div className="flex flex-col gap-1 items-end" style={{ flexShrink: 0 }}>
            <div className="pb-1 pt-0">
              <span 
                className="text-label"
                style={{ color: 'var(--ds-text-secondary)' }}
              >
                Amount
              </span>
            </div>
            {items.map((item, index) => (
              <div key={index} className="py-1">
                <span 
                  className="text-body tabular-nums"
                  style={{ color: 'var(--ds-text-default)' }}
                >
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

export interface InsightsBreakdownProps {
  moneyInTotal: string;
  moneyOutTotal: string;
  moneyInItems?: BreakdownItem[];
  moneyOutItems?: BreakdownItem[];
}

export const InsightsBreakdown: React.FC<InsightsBreakdownProps> = ({
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
    <div className="flex gap-6 items-stretch">
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

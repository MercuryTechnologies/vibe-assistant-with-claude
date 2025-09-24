import React from 'react';

export type Scale = 'month' | 'quarter' | 'year';
export type TimePeriod = 'mtd' | 'qtd' | 'ytd';

interface SegmentedControlProps {
  value: TimePeriod;
  onChange: (value: TimePeriod) => void;
  className?: string;
}

const SegmentedControl: React.FC<SegmentedControlProps> = ({ value, onChange, className = '' }) => {
  const options: { value: TimePeriod; label: string }[] = [
    { value: 'mtd', label: 'MTD' },
    { value: 'qtd', label: 'QTD' },
    { value: 'ytd', label: 'YTD' }
  ];

  return (
    <div
      className={`inline-flex items-center bg-gray-100 rounded-full p-1 ${className}`}
      role="radiogroup"
      aria-label="Time period selection"
    >
      {options.map((option) => {
        const isActive = value === option.value;
        return (
          <button
            key={option.value}
            role="radio"
            aria-checked={isActive}
            onClick={() => onChange(option.value)}
            className={[
              'relative px-4 py-1.5 text-sm rounded-full transition-all duration-150',
              isActive
                ? 'bg-white text-gray-900 font-medium shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            ].join(' ')}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
};

export default SegmentedControl;


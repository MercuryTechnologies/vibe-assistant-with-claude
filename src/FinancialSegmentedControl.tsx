import React, { useState } from 'react';

export type FinancialCategory = 'cashflow' | 'money-in' | 'money-out';

interface FinancialSegmentedControlProps {
  className?: string;
}

const FinancialSegmentedControl: React.FC<FinancialSegmentedControlProps> = ({ className = '' }) => {
  const [value, setValue] = useState<FinancialCategory>('cashflow');

  const options: { value: FinancialCategory; label: string }[] = [
    { value: 'cashflow', label: 'Cashflow' },
    { value: 'money-in', label: 'Money In' },
    { value: 'money-out', label: 'Money Out' }
  ];

  return (
    <div
      className={`inline-flex items-center bg-gray-100 rounded-full p-1 ${className}`}
      role="radiogroup"
      aria-label="Financial category selection"
    >
      {options.map((option) => {
        const isActive = value === option.value;
        return (
          <button
            key={option.value}
            role="radio"
            aria-checked={isActive}
            onClick={() => setValue(option.value)}
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

export default FinancialSegmentedControl;

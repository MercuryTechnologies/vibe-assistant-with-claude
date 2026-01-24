import React, { useState } from 'react';
import { SegmentedControl } from '../ui/segmented-control';

export type FinancialCategory = 'cashflow' | 'money-in' | 'money-out';

interface FinancialSegmentedControlProps {
  className?: string;
  value?: FinancialCategory;
  onChange?: (value: FinancialCategory) => void;
}

const options: { value: FinancialCategory; label: string }[] = [
  { value: 'cashflow', label: 'Cashflow' },
  { value: 'money-in', label: 'Money In' },
  { value: 'money-out', label: 'Money Out' }
];

export const FinancialSegmentedControl: React.FC<FinancialSegmentedControlProps> = ({ 
  className = '',
  value: controlledValue,
  onChange: controlledOnChange,
}) => {
  const [internalValue, setInternalValue] = useState<FinancialCategory>('cashflow');
  
  const value = controlledValue ?? internalValue;
  const handleChange = (newValue: FinancialCategory) => {
    if (controlledOnChange) {
      controlledOnChange(newValue);
    } else {
      setInternalValue(newValue);
    }
  };

  return (
    <SegmentedControl
      options={options}
      value={value}
      onChange={handleChange}
      className={className}
      aria-label="Financial category selection"
    />
  );
};

export default FinancialSegmentedControl;

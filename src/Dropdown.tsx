import React, { useState, useRef, useEffect } from 'react';

export type Cadence = 'days' | 'monthly' | 'quarterly' | 'yearly';

interface DropdownProps {
  value: Cadence;
  onChange: (value: Cadence) => void;
  className?: string;
  selectionStart?: Date;
  selectionEnd?: Date;
}

const Dropdown: React.FC<DropdownProps> = ({ value, onChange, className = '', selectionStart, selectionEnd }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Calculate time range characteristics
  const timeRangeInfo = React.useMemo(() => {
    if (!selectionStart || !selectionEnd) {
      return { daysDiff: 0, monthsDiff: 0, yearsDiff: 0 };
    }

    const daysDiff = Math.ceil((selectionEnd.getTime() - selectionStart.getTime()) / (1000 * 60 * 60 * 24));
    
    // Calculate months difference more accurately
    const monthsDiff = (selectionEnd.getFullYear() - selectionStart.getFullYear()) * 12 + 
                       (selectionEnd.getMonth() - selectionStart.getMonth()) + 
                       (selectionEnd.getDate() >= selectionStart.getDate() ? 0 : -1);
    
    // Calculate years difference
    const yearsDiff = selectionEnd.getFullYear() - selectionStart.getFullYear() + 
                      (selectionEnd.getMonth() > selectionStart.getMonth() || 
                       (selectionEnd.getMonth() === selectionStart.getMonth() && selectionEnd.getDate() >= selectionStart.getDate()) ? 0 : -1);

    return { daysDiff, monthsDiff, yearsDiff };
  }, [selectionStart, selectionEnd]);

  // Filter options based on time range
  const options: { value: Cadence; label: string }[] = React.useMemo(() => {
    const availableOptions: { value: Cadence; label: string }[] = [];

    // Days: Show if selection is 60 days or less
    if (timeRangeInfo.daysDiff <= 60) {
      availableOptions.push({ value: 'days' as Cadence, label: 'Days' });
    }

    // Monthly: Show if selection spans at least 1 month but less than 24 months
    if (timeRangeInfo.monthsDiff >= 1 && timeRangeInfo.monthsDiff < 24) {
      availableOptions.push({ value: 'monthly' as Cadence, label: 'Monthly' });
    }

    // Quarterly: Show if selection spans at least 3 months
    if (timeRangeInfo.monthsDiff >= 3) {
      availableOptions.push({ value: 'quarterly' as Cadence, label: 'Quarterly' });
    }

    // Yearly: Show if selection spans multiple years or more than 12 months
    if (timeRangeInfo.yearsDiff >= 1 || timeRangeInfo.monthsDiff >= 12) {
      availableOptions.push({ value: 'yearly' as Cadence, label: 'Yearly' });
    }

    // Fallback to monthly if no options are available
    if (availableOptions.length === 0) {
      availableOptions.push({ value: 'monthly' as Cadence, label: 'Monthly' });
    }

    return availableOptions;
  }, [timeRangeInfo]);

  const selectedOption = options.find(opt => opt.value === value) || options[0];

  // Auto-switch to available option if current selection is not available
  useEffect(() => {
    const currentValueAvailable = options.some(opt => opt.value === value);
    if (!currentValueAvailable && options.length > 0) {
      // Switch to the first available option
      onChange(options[0].value);
    }
  }, [value, options, onChange]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (newValue: Cadence) => {
    onChange(newValue);
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between h-8 pl-2 pr-3 bg-white border border-[rgba(112,115,147,0.16)] rounded-lg text-[15px] leading-6 text-[#363644] hover:bg-[rgba(112,115,147,0.06)] focus:outline-none focus:ring-2 focus:ring-[rgba(82,102,235,0.5)] min-w-[110px] transition-colors"
        style={{ fontFamily: "'Arcadia Text', sans-serif" }}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span>{selectedOption.label}</span>
        <svg
          className={`ml-2 h-4 w-4 transition-transform text-[#70707d] ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div 
          className="absolute z-50 mt-1 w-full bg-white rounded-lg p-1"
          style={{
            boxShadow: '0px 14px 20px 0px rgba(4, 4, 52, 0.02), 0px 8px 12px 0px rgba(14, 14, 45, 0.08), 0px 0px 1px 0px rgba(175, 178, 206, 0.9), 0px 1px 4px 0px rgba(183, 187, 219, 0.14)',
          }}
        >
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => handleSelect(option.value)}
              className={`w-full pl-2 pr-3 py-2 text-left text-[15px] leading-6 rounded hover:bg-[rgba(112,115,147,0.06)] transition-colors ${
                option.value === value ? 'bg-[rgba(112,115,147,0.06)] text-[#363644]' : 'text-[#363644]'
              }`}
              style={{ fontFamily: "'Arcadia Text', sans-serif" }}
              role="option"
              aria-selected={option.value === value}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dropdown;

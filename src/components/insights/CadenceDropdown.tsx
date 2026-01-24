import React, { useState, useRef, useEffect, useMemo } from 'react';
import type { Cadence } from '@/lib/insights-utils';

interface CadenceDropdownProps {
  value: Cadence;
  onChange: (value: Cadence) => void;
  className?: string;
  selectionStart?: Date;
  selectionEnd?: Date;
}

export const CadenceDropdown: React.FC<CadenceDropdownProps> = ({ 
  value, 
  onChange, 
  className = '', 
  selectionStart, 
  selectionEnd 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const timeRangeInfo = useMemo(() => {
    if (!selectionStart || !selectionEnd) {
      return { daysDiff: 0, monthsDiff: 0, yearsDiff: 0 };
    }

    const daysDiff = Math.ceil((selectionEnd.getTime() - selectionStart.getTime()) / (1000 * 60 * 60 * 24));
    
    const monthsDiff = (selectionEnd.getFullYear() - selectionStart.getFullYear()) * 12 + 
                       (selectionEnd.getMonth() - selectionStart.getMonth()) + 
                       (selectionEnd.getDate() >= selectionStart.getDate() ? 0 : -1);
    
    const yearsDiff = selectionEnd.getFullYear() - selectionStart.getFullYear() + 
                      (selectionEnd.getMonth() > selectionStart.getMonth() || 
                       (selectionEnd.getMonth() === selectionStart.getMonth() && selectionEnd.getDate() >= selectionStart.getDate()) ? 0 : -1);

    return { daysDiff, monthsDiff, yearsDiff };
  }, [selectionStart, selectionEnd]);

  const options: { value: Cadence; label: string }[] = useMemo(() => {
    const availableOptions: { value: Cadence; label: string }[] = [];

    if (timeRangeInfo.daysDiff <= 60) {
      availableOptions.push({ value: 'days', label: 'Days' });
    }

    if (timeRangeInfo.monthsDiff >= 1 && timeRangeInfo.monthsDiff < 24) {
      availableOptions.push({ value: 'monthly', label: 'Monthly' });
    }

    if (timeRangeInfo.monthsDiff >= 3) {
      availableOptions.push({ value: 'quarterly', label: 'Quarterly' });
    }

    if (timeRangeInfo.yearsDiff >= 1 || timeRangeInfo.monthsDiff >= 12) {
      availableOptions.push({ value: 'yearly', label: 'Yearly' });
    }

    if (availableOptions.length === 0) {
      availableOptions.push({ value: 'monthly', label: 'Monthly' });
    }

    return availableOptions;
  }, [timeRangeInfo]);

  const selectedOption = options.find(opt => opt.value === value) || options[0];

  useEffect(() => {
    const currentValueAvailable = options.some(opt => opt.value === value);
    if (!currentValueAvailable && options.length > 0) {
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
        className="insights-dropdown-button"
        style={{ minWidth: 110 }}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="text-body">{selectedOption.label}</span>
        <svg
          className={`insights-dropdown-chevron ${isOpen ? 'rotated' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="insights-dropdown-menu">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => handleSelect(option.value)}
              className={`insights-dropdown-item ${option.value === value ? 'selected' : ''}`}
              role="option"
              aria-selected={option.value === value}
            >
              <span className="text-body">{option.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CadenceDropdown;

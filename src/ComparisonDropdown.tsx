import React, { useState, useRef, useEffect } from 'react';
import type { ComparisonMode } from './TimelineRange';

interface ComparisonDropdownProps {
  value: ComparisonMode;
  onChange: (value: ComparisonMode) => void;
  className?: string;
  forceOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
}

const ComparisonDropdown: React.FC<ComparisonDropdownProps> = ({ value, onChange, className = '', forceOpen, onOpenChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const options: { value: ComparisonMode; label: string }[] = [
    { value: 'Off', label: 'No Comparison' },
    { value: 'PreviousPeriod', label: 'Previous Period' },
    { value: 'PreviousYear', label: 'Previous Year' }
  ];

  const selectedOption = options.find(opt => opt.value === value) || options[0];

  // Handle forceOpen prop
  useEffect(() => {
    if (forceOpen !== undefined) {
      setIsOpen(forceOpen);
    }
  }, [forceOpen]);

  // Notify parent when open state changes
  useEffect(() => {
    if (onOpenChange) {
      onOpenChange(isOpen);
    }
  }, [isOpen, onOpenChange]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (newValue: ComparisonMode) => {
    onChange(newValue);
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between h-8 pl-2 pr-3 bg-white border border-[rgba(112,115,147,0.16)] rounded-lg text-[15px] leading-6 text-[#363644] hover:bg-[rgba(112,115,147,0.06)] focus:outline-none focus:ring-2 focus:ring-[rgba(82,102,235,0.5)] min-w-[160px] transition-colors"
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

export default ComparisonDropdown;

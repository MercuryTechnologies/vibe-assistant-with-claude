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
        className="flex items-center justify-between px-2 py-1 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[140px]"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span>{selectedOption.label}</span>
        <svg
          className={`ml-1 h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded shadow-lg">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => handleSelect(option.value)}
              className={`w-full px-2 py-1 text-left text-sm hover:bg-gray-100 first:rounded-t last:rounded-b ${
                option.value === value ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'
              }`}
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

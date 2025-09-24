import React, { useState, useRef, useEffect } from 'react';

export type Cadence = 'days' | 'monthly' | 'yearly';

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

  // Calculate if selection is 30 days or less
  const isSelectionShort = React.useMemo(() => {
    if (!selectionStart || !selectionEnd) return false;
    const daysDiff = Math.ceil((selectionEnd.getTime() - selectionStart.getTime()) / (1000 * 60 * 60 * 24));
    return daysDiff <= 30;
  }, [selectionStart, selectionEnd]);

  // Filter options based on selection length
  const options: { value: Cadence; label: string }[] = React.useMemo(() => {
    const baseOptions = [
      { value: 'monthly' as Cadence, label: 'Monthly' },
      { value: 'yearly' as Cadence, label: 'Yearly' }
    ];

    // Only show Days option if selection is 30 days or less
    if (isSelectionShort) {
      return [
        { value: 'days' as Cadence, label: 'Days' },
        ...baseOptions
      ];
    }

    return baseOptions;
  }, [isSelectionShort]);

  const selectedOption = options.find(opt => opt.value === value) || options[0];

  // Auto-switch away from 'days' if selection becomes too long
  useEffect(() => {
    if (value === 'days' && !isSelectionShort) {
      onChange('monthly'); // Switch to monthly when days is no longer available
    }
  }, [value, isSelectionShort, onChange]);

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
        className="flex items-center justify-between px-2 py-1 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[110px]"
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

export default Dropdown;

import React, { useState, useRef, useEffect } from 'react';

export type ComparisonMode = 'Off' | 'PreviousPeriod' | 'PreviousYear';

interface ComparisonDropdownProps {
  value: ComparisonMode;
  onChange: (value: ComparisonMode) => void;
  className?: string;
  forceOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
}

export const ComparisonDropdown: React.FC<ComparisonDropdownProps> = ({ 
  value, 
  onChange, 
  className = '', 
  forceOpen, 
  onOpenChange 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const options: { value: ComparisonMode; label: string }[] = [
    { value: 'Off', label: 'No Comparison' },
    { value: 'PreviousPeriod', label: 'Previous Period' },
    { value: 'PreviousYear', label: 'Previous Year' }
  ];

  const selectedOption = options.find(opt => opt.value === value) || options[0];

  useEffect(() => {
    if (forceOpen !== undefined) {
      setIsOpen(forceOpen);
    }
  }, [forceOpen]);

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
        className="insights-dropdown-button"
        style={{ minWidth: 160 }}
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

export default ComparisonDropdown;

import React, { useState, useRef, useEffect } from 'react';

export type TimePeriod = 'mtd' | 'qtd' | 'ytd' | 'last3m' | 'last6m' | 'last12m' | 'custom';

interface PeriodDropdownProps {
  value: TimePeriod;
  onChange: (value: TimePeriod) => void;
  className?: string;
  referenceDate?: Date;
  customDateRange?: string;
}

const PeriodDropdown: React.FC<PeriodDropdownProps> = ({ value, onChange, className = '', referenceDate = new Date(), customDateRange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Date calculation functions
  const startOfMonth = (d: Date): Date => {
    const n = new Date(d);
    n.setDate(1);
    n.setHours(0, 0, 0, 0);
    return n;
  };

  const startOfQuarter = (d: Date): Date => {
    const n = startOfMonth(d);
    const qStartMonth = Math.floor(n.getMonth() / 3) * 3;
    n.setMonth(qStartMonth, 1);
    return n;
  };

  const startOfYear = (d: Date): Date => {
    const n = new Date(d);
    n.setMonth(0, 1);
    n.setHours(0, 0, 0, 0);
    return n;
  };

  const monthsAgo = (d: Date, months: number): Date => {
    const n = new Date(d);
    n.setMonth(n.getMonth() - months);
    n.setDate(1);
    n.setHours(0, 0, 0, 0);
    return n;
  };

  const formatDate = (d: Date): string => {
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getDateRange = (period: TimePeriod): string => {
    const today = new Date(referenceDate);
    today.setHours(23, 59, 59, 999);
    
    let startDate: Date;
    
    switch (period) {
      case 'mtd':
        startDate = startOfMonth(today);
        break;
      case 'qtd':
        startDate = startOfQuarter(today);
        break;
      case 'ytd':
        startDate = startOfYear(today);
        break;
      case 'last3m':
        startDate = monthsAgo(today, 3);
        break;
      case 'last6m':
        startDate = monthsAgo(today, 6);
        break;
      case 'last12m':
        startDate = monthsAgo(today, 12);
        break;
      default:
        startDate = startOfYear(today);
    }
    
    return `${formatDate(startDate)} – ${formatDate(today)}`;
  };

  const options: { value: TimePeriod; label: string; dateRange: string }[] = [
    { value: 'mtd', label: 'Month to Date', dateRange: getDateRange('mtd') },
    { value: 'qtd', label: 'Quarter to Date', dateRange: getDateRange('qtd') },
    { value: 'ytd', label: 'Year to Date', dateRange: getDateRange('ytd') },
    { value: 'last3m', label: 'Last 3 Months', dateRange: getDateRange('last3m') },
    { value: 'last6m', label: 'Last 6 Months', dateRange: getDateRange('last6m') },
    { value: 'last12m', label: 'Last 12 Months', dateRange: getDateRange('last12m') },
    ...(value === 'custom' ? [{ value: 'custom' as TimePeriod, label: customDateRange || 'Custom', dateRange: '' }] : [])
  ];

  const selectedOption = options.find(opt => opt.value === value) || options[2]; // Default to YTD

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (newValue: TimePeriod) => {
    onChange(newValue);
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between px-2 py-1 rounded-lg text-sm hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[120px]"
        style={{
          background: 'rgba(59, 130, 246, 0.12)',
          border: '1.5px solid #3B82F6',
          color: '#3B82F6'
        }}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span>{selectedOption.value === 'mtd' ? 'MTD' : 
               selectedOption.value === 'qtd' ? 'QTD' : 
               selectedOption.value === 'ytd' ? 'YTD' : 
               selectedOption.value === 'custom' ? (customDateRange || 'Custom') :
               selectedOption.label}</span>
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
        <div className="absolute z-10 mt-1 w-80 bg-white border border-gray-300 rounded shadow-lg">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => handleSelect(option.value)}
              className={`w-full px-2 py-1 text-left hover:bg-gray-100 first:rounded-t last:rounded-b ${
                option.value === value ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
              }`}
              role="option"
              aria-selected={option.value === value}
            >
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">{option.label}</span>
                <span className="text-sm text-gray-500 text-right">{option.dateRange}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default PeriodDropdown;

import React, { useState, useRef, useEffect } from 'react';

export type TimePeriod = 'mtd' | 'qtd' | 'ytd' | 'lastMonth' | 'lastQuarter' | 'last30d' | 'last3m' | 'last6m' | 'last12m' | 'custom';

interface PeriodDropdownProps {
  value: TimePeriod;
  onChange: (value: TimePeriod) => void;
  className?: string;
  referenceDate?: Date;
  customDateRange?: string;
}

export const PeriodDropdown: React.FC<PeriodDropdownProps> = ({ 
  value, 
  onChange, 
  className = '', 
  referenceDate = new Date(), 
  customDateRange 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  const daysAgo = (d: Date, days: number): Date => {
    const n = new Date(d);
    n.setDate(n.getDate() - days);
    n.setHours(0, 0, 0, 0);
    return n;
  };

  const monthsAgo = (d: Date, months: number): Date => {
    const n = new Date(d);
    n.setMonth(n.getMonth() - months);
    n.setHours(0, 0, 0, 0);
    return n;
  };

  const getLastMonthRange = (d: Date): { start: Date; end: Date } => {
    const end = new Date(d);
    end.setDate(0);
    end.setHours(23, 59, 59, 999);
    const start = new Date(end);
    start.setDate(1);
    start.setHours(0, 0, 0, 0);
    return { start, end };
  };

  const getLastQuarterRange = (d: Date): { start: Date; end: Date } => {
    const currentQuarter = Math.floor(d.getMonth() / 3);
    const lastQuarter = currentQuarter === 0 ? 3 : currentQuarter - 1;
    const lastQuarterYear = currentQuarter === 0 ? d.getFullYear() - 1 : d.getFullYear();
    
    const start = new Date(lastQuarterYear, lastQuarter * 3, 1);
    const end = new Date(lastQuarterYear, lastQuarter * 3 + 3, 0, 23, 59, 59, 999);
    return { start, end };
  };

  const formatDate = (d: Date): string => {
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getDateRangeForButton = (period: TimePeriod): string => {
    const today = new Date(referenceDate);
    today.setHours(23, 59, 59, 999);
    
    let startDate: Date;
    let endDate: Date = today;
    
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
      case 'lastMonth': {
        const range = getLastMonthRange(today);
        startDate = range.start;
        endDate = range.end;
        break;
      }
      case 'lastQuarter': {
        const range = getLastQuarterRange(today);
        startDate = range.start;
        endDate = range.end;
        break;
      }
      case 'last30d':
        startDate = daysAgo(today, 30);
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
    
    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
  };

  const options: { value: TimePeriod; label: string; dateRange: string }[] = [
    { value: 'mtd', label: 'Month to Date', dateRange: getDateRangeForButton('mtd') },
    { value: 'qtd', label: 'Quarter to Date', dateRange: getDateRangeForButton('qtd') },
    { value: 'ytd', label: 'Year to Date', dateRange: getDateRangeForButton('ytd') },
    { value: 'lastMonth', label: 'Last Month', dateRange: getDateRangeForButton('lastMonth') },
    { value: 'lastQuarter', label: 'Last Quarter', dateRange: getDateRangeForButton('lastQuarter') },
    { value: 'last30d', label: 'Last 30 days', dateRange: getDateRangeForButton('last30d') },
    { value: 'last3m', label: 'Last 3 Months', dateRange: getDateRangeForButton('last3m') },
    { value: 'last6m', label: 'Last 6 Months', dateRange: getDateRangeForButton('last6m') },
    { value: 'last12m', label: 'Last 12 Months', dateRange: getDateRangeForButton('last12m') },
    { value: 'custom', label: 'Custom', dateRange: '' },
  ];

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

  const getButtonDisplayText = (): string => {
    if (value === 'custom' && customDateRange) {
      return customDateRange;
    }
    return getDateRangeForButton(value);
  };

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`period-dropdown-button ${isOpen ? 'open' : ''}`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="flex items-center">
          <div className="period-dropdown-icon">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
          </div>
          <span className="text-body" style={{ whiteSpace: 'nowrap' }}>{getButtonDisplayText()}</span>
        </div>
        <div className="period-dropdown-chevron-wrapper">
          <svg 
            className={`period-dropdown-chevron ${isOpen ? 'rotated' : ''}`}
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {isOpen && (
        <div className="period-dropdown-menu">
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <button
                key={option.value}
                onClick={() => handleSelect(option.value)}
                className={`period-dropdown-item ${isSelected ? 'selected' : ''}`}
                role="option"
                aria-selected={isSelected}
              >
                <div className="period-dropdown-check">
                  {isSelected && (
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <div className="flex-1 flex items-center justify-between min-w-0">
                  <span className="text-body">{option.label}</span>
                  {option.dateRange && (
                    <span className="text-label" style={{ color: 'var(--ds-text-tertiary)', marginLeft: 8 }}>
                      {option.dateRange}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PeriodDropdown;

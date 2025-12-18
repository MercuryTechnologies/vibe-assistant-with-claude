import React, { useState, useRef, useEffect } from 'react';

export type TimePeriod = 'mtd' | 'qtd' | 'ytd' | 'lastMonth' | 'lastQuarter' | 'last30d' | 'last3m' | 'last6m' | 'last12m' | 'custom';

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
    end.setDate(0); // Last day of previous month
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

  const getDateRange = (period: TimePeriod): string => {
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
    { value: 'mtd', label: 'Month to Date', dateRange: getDateRange('mtd') },
    { value: 'qtd', label: 'Quarter to Date', dateRange: getDateRange('qtd') },
    { value: 'ytd', label: 'Year to Date', dateRange: getDateRange('ytd') },
    { value: 'lastMonth', label: 'Last Month', dateRange: getDateRange('lastMonth') },
    { value: 'lastQuarter', label: 'Last Quarter', dateRange: getDateRange('lastQuarter') },
    { value: 'last30d', label: 'Last 30 days', dateRange: getDateRange('last30d') },
    { value: 'last3m', label: 'Last 3 Months', dateRange: getDateRange('last3m') },
    { value: 'last6m', label: 'Last 6 Months', dateRange: getDateRange('last6m') },
    { value: 'last12m', label: 'Last 12 Months', dateRange: getDateRange('last12m') },
    { value: 'custom', label: 'Custom', dateRange: '' },
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

  // Get the display text for the button
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
        className={`h-8 flex items-center px-1 rounded-lg text-[15px] leading-6 transition-all ${
          isOpen 
            ? 'bg-[rgba(156,180,232,0.28)] border border-[#5266eb] shadow-[0px_0px_0px_1px_white,0px_0px_0px_3px_#9cb4e8]' 
            : 'bg-[rgba(156,180,232,0.12)] border border-[#5266eb] hover:bg-[rgba(156,180,232,0.28)]'
        }`}
        style={{ fontFamily: "'Arcadia Text', sans-serif" }}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="flex items-center">
          {/* Calendar icon */}
          <div className="w-6 h-6 flex items-center justify-center">
            <svg className="w-[13px] h-[13px] text-[#363644]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
          </div>
          <span className="text-[#363644] whitespace-nowrap">{getButtonDisplayText()}</span>
        </div>
        {/* Chevron icon */}
        <div className="w-6 h-6 flex items-center justify-center">
          <svg 
            className={`w-3 h-3 text-[#363644] transition-transform ${isOpen ? 'rotate-180' : ''}`} 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {isOpen && (
        <div 
          className="absolute right-0 z-50 mt-1 w-[273px] bg-white rounded-lg p-1 overflow-hidden"
          style={{
            boxShadow: '0px 14px 20px 0px rgba(4, 4, 52, 0.02), 0px 8px 12px 0px rgba(14, 14, 45, 0.08), 0px 0px 1px 0px rgba(175, 178, 206, 0.9), 0px 1px 4px 0px rgba(183, 187, 219, 0.14)',
          }}
        >
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <button
                key={option.value}
                onClick={() => handleSelect(option.value)}
                className="w-full p-2 text-left rounded hover:bg-[rgba(112,115,147,0.06)] transition-colors flex items-center gap-1"
                style={{ fontFamily: "'Arcadia Text', sans-serif" }}
                role="option"
                aria-selected={isSelected}
              >
                {/* Checkmark icon column */}
                <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
                  {isSelected && (
                    <svg className="w-4 h-4 text-[#5266eb]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                {/* Label and date range */}
                <div className="flex-1 flex items-center justify-between min-w-0">
                  <span className={`text-[15px] leading-6 ${
                    isSelected ? 'text-[#1e1e2a]' : 'text-[#363644]'
                  }`}>
                    {option.label}
                  </span>
                  {option.dateRange && (
                    <span className="text-[13px] leading-5 text-[#535461] tracking-[0.1px] ml-2 truncate">
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

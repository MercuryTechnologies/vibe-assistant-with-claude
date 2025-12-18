import React, { useState, useRef, useEffect } from 'react';

interface FilterButtonProps {
  icon?: React.ReactNode;
  label: string;
  hasDropdown?: boolean;
  variant?: 'default' | 'icon-only';
  onClick?: () => void;
  isActive?: boolean;
  isOpen?: boolean;
}

const FilterButton: React.FC<FilterButtonProps> = ({ 
  icon, 
  label, 
  hasDropdown = true,
  variant = 'default',
  onClick,
  isActive = false,
  isOpen = false,
}) => {
  if (variant === 'icon-only') {
    return (
      <button 
        onClick={onClick}
        className={`h-8 w-8 flex items-center justify-center rounded-lg transition-colors
          ${isActive 
            ? 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100' 
            : 'text-[#70707d] hover:text-[#363644] hover:bg-gray-100'
          }`}
      >
        {icon}
      </button>
    );
  }

  return (
    <button 
      onClick={onClick}
      className={`h-8 pr-0 flex items-center rounded-lg transition-colors ${icon ? 'pl-1.5' : 'pl-3'} ${
        isOpen 
          ? 'bg-[rgba(112,115,147,0.06)] border border-[rgba(112,115,147,0.16)]' 
          : isActive 
            ? 'border-indigo-300 bg-indigo-50' 
            : 'bg-[#fbfcfd] border border-[rgba(112,115,147,0.16)] hover:bg-[rgba(112,115,147,0.06)] hover:border-[rgba(112,115,147,0.22)]'
      }`}
    >
      {icon && (
        <span className="w-6 h-6 flex items-center justify-center text-[#70707d]">
          {icon}
        </span>
      )}
      <span className={`text-[15px] leading-6 whitespace-nowrap ${isOpen ? 'text-[#1e1e2a]' : isActive ? 'text-indigo-700' : 'text-[#535461]'}`}>{label}</span>
      {hasDropdown && (
        <span className="w-8 h-full flex items-center justify-center">
          <svg className={`w-3 h-3 ${isActive ? 'text-indigo-600' : 'text-[#363644]'} transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      )}
    </button>
  );
};

// Date Filter Types
export type DateShortcut = 'all-time' | 'this-month' | 'last-month' | 'this-quarter' | 'last-quarter' | 'this-year' | 'custom';

interface DateFilterDropdownProps {
  onClose: () => void;
  selectedShortcut: DateShortcut;
  onShortcutChange: (shortcut: DateShortcut) => void;
  fromDate: string;
  toDate: string;
  onFromDateChange: (date: string) => void;
  onToDateChange: (date: string) => void;
}

const shortcutLabels: Record<DateShortcut, string> = {
  'all-time': 'All time',
  'this-month': 'This month',
  'last-month': 'Last month',
  'this-quarter': 'This quarter',
  'last-quarter': 'Last quarter',
  'this-year': 'This year',
  'custom': 'Custom',
};

const DateFilterDropdown: React.FC<DateFilterDropdownProps> = ({
  onClose,
  selectedShortcut,
  onShortcutChange,
  fromDate,
  toDate,
  onFromDateChange,
  onToDateChange,
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isShortcutOpen, setIsShortcutOpen] = useState(false);
  const [baseYear, setBaseYear] = useState(2023);

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const handleMonthClick = (year: number, monthIndex: number) => {
    const monthStr = String(monthIndex + 1).padStart(2, '0');
    const dateStr = `${year}-${monthStr}`;
    
    if (!fromDate || (fromDate && toDate)) {
      // Start new selection
      onFromDateChange(dateStr);
      onToDateChange('');
      onShortcutChange('custom');
    } else {
      // Complete selection
      if (dateStr < fromDate) {
        onToDateChange(fromDate);
        onFromDateChange(dateStr);
      } else {
        onToDateChange(dateStr);
      }
      onShortcutChange('custom');
    }
  };

  const isMonthSelected = (year: number, monthIndex: number) => {
    const monthStr = String(monthIndex + 1).padStart(2, '0');
    const dateStr = `${year}-${monthStr}`;
    return dateStr === fromDate || dateStr === toDate;
  };

  const isMonthInRange = (year: number, monthIndex: number) => {
    if (!fromDate || !toDate) return false;
    const monthStr = String(monthIndex + 1).padStart(2, '0');
    const dateStr = `${year}-${monthStr}`;
    return dateStr > fromDate && dateStr < toDate;
  };

  return (
    <div
      ref={dropdownRef}
      className="absolute top-full left-0 mt-1 bg-white rounded-xl overflow-hidden z-50 p-6"
      style={{
        boxShadow: '0px 14px 20px 0px rgba(4, 4, 52, 0.02), 0px 8px 12px 0px rgba(14, 14, 45, 0.08), 0px 0px 1px 0px rgba(175, 178, 206, 0.9), 0px 1px 4px 0px rgba(183, 187, 219, 0.14)',
        minWidth: '380px',
      }}
    >
      {/* Show transactions for dropdown */}
      <div className="mb-6">
        <label className="block text-[14px] text-[#535461] mb-2">Show transactions for</label>
        <div className="relative">
          <button
            onClick={() => setIsShortcutOpen(!isShortcutOpen)}
            className="w-full h-10 px-3 flex items-center justify-between bg-white border border-[rgba(112,115,147,0.16)] rounded-lg hover:border-[rgba(112,115,147,0.22)] transition-colors"
          >
            <span className="text-[15px] text-[#1e1e2a]">{shortcutLabels[selectedShortcut]}</span>
            <svg className={`w-4 h-4 text-[#363644] transition-transform ${isShortcutOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {isShortcutOpen && (
            <div 
              className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg z-10 p-1"
              style={{
                boxShadow: '0px 14px 20px 0px rgba(4, 4, 52, 0.02), 0px 8px 12px 0px rgba(14, 14, 45, 0.08), 0px 0px 1px 0px rgba(175, 178, 206, 0.9), 0px 1px 4px 0px rgba(183, 187, 219, 0.14)',
              }}
            >
              {(Object.keys(shortcutLabels) as DateShortcut[]).filter(k => k !== 'custom').map((shortcut) => (
                <button
                  key={shortcut}
                  onClick={() => {
                    onShortcutChange(shortcut);
                    setIsShortcutOpen(false);
                  }}
                  className={`w-full pl-2 pr-3 py-2 text-left text-[15px] leading-6 rounded hover:bg-[rgba(112,115,147,0.06)] transition-colors ${
                    selectedShortcut === shortcut ? 'bg-[rgba(112,115,147,0.06)] text-[#363644]' : 'text-[#363644]'
                  }`}
                  style={{ fontFamily: "'Arcadia Text', sans-serif" }}
                >
                  {shortcutLabels[shortcut]}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* From/To date inputs */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1">
          <label className="block text-[13px] text-[#535461] mb-1.5">From</label>
          <input
            type="text"
            value={fromDate}
            onChange={(e) => {
              onFromDateChange(e.target.value);
              onShortcutChange('custom');
            }}
            placeholder="YYYY-MM"
            className="w-full h-10 px-3 text-[15px] text-[#1e1e2a] placeholder:text-[#9ca3af] bg-white border border-[rgba(112,115,147,0.16)] rounded-lg focus:outline-none focus:border-[#5266EB] focus:ring-1 focus:ring-[#5266EB] transition-colors"
          />
        </div>
        <span className="text-[#9ca3af] mt-6">—</span>
        <div className="flex-1">
          <label className="block text-[13px] text-[#535461] mb-1.5">To</label>
          <input
            type="text"
            value={toDate}
            onChange={(e) => {
              onToDateChange(e.target.value);
              onShortcutChange('custom');
            }}
            placeholder="YYYY-MM"
            className="w-full h-10 px-3 text-[15px] text-[#1e1e2a] placeholder:text-[#9ca3af] bg-white border border-[rgba(112,115,147,0.16)] rounded-lg focus:outline-none focus:border-[#5266EB] focus:ring-1 focus:ring-[#5266EB] transition-colors"
          />
        </div>
      </div>

      {/* Month grid selector */}
      <div>
        {/* Year navigation */}
        <div className="flex items-center gap-4 mb-4">
          <button 
            onClick={() => setBaseYear(baseYear - 1)}
            className="w-8 h-8 flex items-center justify-center text-[#363644] hover:bg-[rgba(112,115,147,0.06)] rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-[15px] font-medium text-[#1e1e2a] w-14 text-center">{baseYear}</span>
          <div className="flex-1" />
          <span className="text-[15px] font-medium text-[#1e1e2a] w-14 text-center">{baseYear + 1}</span>
          <button 
            onClick={() => setBaseYear(baseYear + 1)}
            className="w-8 h-8 flex items-center justify-center text-[#363644] hover:bg-[rgba(112,115,147,0.06)] rounded-lg transition-colors opacity-0 pointer-events-none"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Month grids for two years side by side */}
        <div className="flex gap-6">
          {[baseYear, baseYear + 1].map((year) => (
            <div key={year} className="grid grid-cols-3 gap-1">
              {months.map((month, idx) => {
                const isSelected = isMonthSelected(year, idx);
                const inRange = isMonthInRange(year, idx);
                return (
                  <button
                    key={`${year}-${month}`}
                    onClick={() => handleMonthClick(year, idx)}
                    className={`w-11 h-8 text-[14px] rounded-md transition-colors ${
                      isSelected
                        ? 'bg-[#5266EB] text-white'
                        : inRange
                          ? 'bg-[rgba(82,102,235,0.1)] text-[#1e1e2a]'
                          : 'text-[#1e1e2a] hover:bg-[rgba(112,115,147,0.06)]'
                    }`}
                  >
                    {month}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Active Date Filter Chip Component
interface DateFilterChipProps {
  label: string;
  onClear: () => void;
  onClick: () => void;
}

const DateFilterChip: React.FC<DateFilterChipProps> = ({ label, onClear, onClick }) => {
  return (
    <button className="h-8 flex items-center bg-[rgba(82,102,235,0.1)] rounded-lg pl-3 pr-0">
      <span 
        onClick={onClick}
        className="text-[15px] leading-6 text-[#1e1e2a] whitespace-nowrap cursor-pointer"
      >
        {label}
      </span>
      <div 
        onClick={(e) => {
          e.stopPropagation();
          onClear();
        }}
        className="w-8 h-full flex items-center justify-center cursor-pointer hover:text-[#1e1e2a] text-[#363644]"
      >
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>
    </button>
  );
};

// Keyword Filter Dropdown Component
interface KeywordFilterDropdownProps {
  recentKeywords: string[];
  selectedKeywords: string[];
  onSelectionChange: (keywords: string[]) => void;
  onClose: () => void;
}

const KeywordFilterDropdown: React.FC<KeywordFilterDropdownProps> = ({
  recentKeywords,
  selectedKeywords,
  onSelectionChange,
  onClose,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // Filter keywords by search
  const filteredKeywords = recentKeywords.filter(keyword =>
    keyword.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggleKeyword = (keyword: string) => {
    if (selectedKeywords.includes(keyword)) {
      onSelectionChange(selectedKeywords.filter(k => k !== keyword));
    } else {
      onSelectionChange([...selectedKeywords, keyword]);
    }
  };

  // If user types a search and hits enter, add it as a keyword
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      if (!selectedKeywords.includes(searchQuery.trim())) {
        onSelectionChange([...selectedKeywords, searchQuery.trim()]);
      }
      setSearchQuery('');
    }
  };

  return (
    <div
      ref={dropdownRef}
      className="absolute top-full left-[-1px] mt-0 w-[376px] bg-white rounded-xl z-50 p-6 flex flex-col gap-4"
      style={{
        boxShadow: '0px 14px 20px 0px rgba(4, 4, 52, 0.02), 0px 8px 12px 0px rgba(14, 14, 45, 0.08), 0px 0px 1px 0px rgba(175, 178, 206, 0.9), 0px 1px 4px 0px rgba(183, 187, 219, 0.14)',
      }}
    >
      {/* Search Input */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search recipients, and more"
          className="w-full h-10 px-3 text-[15px] text-[#1e1e2a] placeholder:text-[#9ca3af] rounded-lg border border-[#5266EB] focus:outline-none focus:ring-1 focus:ring-[#5266EB] transition-colors"
        />
      </div>

      {/* Recent Keywords Section */}
      {filteredKeywords.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="text-[12px] text-[#535461] leading-5 tracking-[0.2px]">Recent</span>
          <div className="flex flex-col">
            {filteredKeywords.map((keyword) => {
              const isSelected = selectedKeywords.includes(keyword);
              return (
                <label key={keyword} className="flex items-center gap-3 py-2 cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleKeyword(keyword)}
                      className="sr-only peer"
                    />
                    <div className="w-5 h-5 rounded border border-[rgba(112,115,147,0.22)] bg-white peer-checked:border-[#5266EB] peer-checked:bg-[#5266EB] transition-colors flex items-center justify-center">
                      {isSelected && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <span className="text-[15px] text-[#1e1e2a] leading-6">{keyword}</span>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {filteredKeywords.length === 0 && searchQuery && (
        <div className="py-2 text-center text-sm text-[#535461]">
          Press Enter to search for "{searchQuery}"
        </div>
      )}
    </div>
  );
};

// Keyword Filter Chip Component (Active state)
interface KeywordFilterChipProps {
  label: string;
  onClear: () => void;
}

const KeywordFilterChip: React.FC<KeywordFilterChipProps> = ({ label, onClear }) => {
  return (
    <button className="h-8 flex items-center bg-[rgba(82,102,235,0.1)] rounded-lg pl-3 pr-0">
      <span className="text-[15px] leading-6 text-[#1e1e2a] whitespace-nowrap">
        {label}
      </span>
      <div 
        onClick={(e) => {
          e.stopPropagation();
          onClear();
        }}
        className="w-8 h-full flex items-center justify-center cursor-pointer hover:text-[#1e1e2a] text-[#363644]"
      >
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>
    </button>
  );
};

// Amount Filter Types
export type AmountDirection = 'any' | 'in' | 'out';

export interface AmountFilterValue {
  direction: AmountDirection;
  exactAmount?: number;
  minAmount?: number;
  maxAmount?: number;
}

// Amount Filter Dropdown Component
interface AmountFilterDropdownProps {
  value: AmountFilterValue;
  onChange: (value: AmountFilterValue) => void;
  onClose: () => void;
}

const AmountFilterDropdown: React.FC<AmountFilterDropdownProps> = ({
  value,
  onChange,
  onClose,
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [localValue, setLocalValue] = useState<AmountFilterValue>(value);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onChange(localValue);
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose, onChange, localValue]);

  const handleDirectionChange = (direction: AmountDirection) => {
    setLocalValue(prev => ({ ...prev, direction }));
  };

  const handleExactAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value === '' ? undefined : parseFloat(e.target.value);
    setLocalValue(prev => ({ ...prev, exactAmount: val }));
  };

  const handleMinAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value === '' ? undefined : parseFloat(e.target.value);
    setLocalValue(prev => ({ ...prev, minAmount: val }));
  };

  const handleMaxAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value === '' ? undefined : parseFloat(e.target.value);
    setLocalValue(prev => ({ ...prev, maxAmount: val }));
  };

  return (
    <div
      ref={dropdownRef}
      className="absolute top-[35px] left-[-1px] w-[376px] bg-white rounded-xl overflow-hidden z-50 p-6 flex flex-col gap-4"
      style={{
        boxShadow: '0px 14px 20px 0px rgba(4, 4, 52, 0.02), 0px 8px 12px 0px rgba(14, 14, 45, 0.08), 0px 0px 1px 0px rgba(175, 178, 206, 0.9), 0px 1px 4px 0px rgba(183, 187, 219, 0.14)',
      }}
    >
      {/* Direction Radio Group */}
      <div className="flex flex-col">
        <label className="text-[13px] text-[#535461] leading-5 tracking-[0.1px] mb-2">Direction</label>
        <div className="flex flex-col gap-2">
          {/* Any */}
          <label className="flex items-center gap-3 cursor-pointer">
            <div className="relative">
              <input
                type="radio"
                name="direction"
                checked={localValue.direction === 'any'}
                onChange={() => handleDirectionChange('any')}
                className="sr-only peer"
              />
              <div className="w-5 h-5 rounded-full border-2 border-[rgba(112,115,147,0.22)] bg-white peer-checked:border-[#5266EB] transition-colors flex items-center justify-center">
                {localValue.direction === 'any' && (
                  <div className="w-2.5 h-2.5 rounded-full bg-[#5266EB]" />
                )}
              </div>
            </div>
            <span className="text-[15px] text-[#1e1e2a] leading-6">Any</span>
          </label>
          
          {/* In */}
          <label className="flex items-center gap-3 cursor-pointer">
            <div className="relative">
              <input
                type="radio"
                name="direction"
                checked={localValue.direction === 'in'}
                onChange={() => handleDirectionChange('in')}
                className="sr-only peer"
              />
              <div className="w-5 h-5 rounded-full border-2 border-[rgba(112,115,147,0.22)] bg-white peer-checked:border-[#5266EB] transition-colors flex items-center justify-center">
                {localValue.direction === 'in' && (
                  <div className="w-2.5 h-2.5 rounded-full bg-[#5266EB]" />
                )}
              </div>
            </div>
            <span className="text-[15px] text-[#1e1e2a] leading-6">In <span className="text-[#535461]">(e.g. deposits, refunds)</span></span>
          </label>
          
          {/* Out */}
          <label className="flex items-center gap-3 cursor-pointer">
            <div className="relative">
              <input
                type="radio"
                name="direction"
                checked={localValue.direction === 'out'}
                onChange={() => handleDirectionChange('out')}
                className="sr-only peer"
              />
              <div className="w-5 h-5 rounded-full border-2 border-[rgba(112,115,147,0.22)] bg-white peer-checked:border-[#5266EB] transition-colors flex items-center justify-center">
                {localValue.direction === 'out' && (
                  <div className="w-2.5 h-2.5 rounded-full bg-[#5266EB]" />
                )}
              </div>
            </div>
            <span className="text-[15px] text-[#1e1e2a] leading-6">Out <span className="text-[#535461]">(e.g. purchases, charges)</span></span>
          </label>
        </div>
      </div>

      {/* Specific amount input */}
      <div>
        <label className="block text-[13px] text-[#5266EB] leading-5 tracking-[0.1px] mb-1.5">Specific amount</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[15px] text-[#535461]">=</span>
          <input
            type="number"
            value={localValue.exactAmount ?? ''}
            onChange={handleExactAmountChange}
            placeholder=""
            className="w-full h-10 pl-8 pr-3 text-[15px] text-[#1e1e2a] placeholder:text-[#9ca3af] bg-white border border-[rgba(112,115,147,0.16)] rounded-lg focus:outline-none focus:border-[#5266EB] focus:ring-1 focus:ring-[#5266EB] transition-colors"
          />
        </div>
      </div>

      {/* At least input */}
      <div>
        <label className="block text-[13px] text-[#535461] leading-5 tracking-[0.1px] mb-1.5">At least</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[15px] text-[#535461]">≥</span>
          <input
            type="number"
            value={localValue.minAmount ?? ''}
            onChange={handleMinAmountChange}
            placeholder=""
            className="w-full h-10 pl-8 pr-3 text-[15px] text-[#1e1e2a] placeholder:text-[#9ca3af] bg-white border border-[rgba(112,115,147,0.16)] rounded-lg focus:outline-none focus:border-[#5266EB] focus:ring-1 focus:ring-[#5266EB] transition-colors"
          />
        </div>
      </div>

      {/* No more than input */}
      <div>
        <label className="block text-[13px] text-[#535461] leading-5 tracking-[0.1px] mb-1.5">No more than</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[15px] text-[#535461]">≤</span>
          <input
            type="number"
            value={localValue.maxAmount ?? ''}
            onChange={handleMaxAmountChange}
            placeholder=""
            className="w-full h-10 pl-8 pr-3 text-[15px] text-[#1e1e2a] placeholder:text-[#9ca3af] bg-white border border-[rgba(112,115,147,0.16)] rounded-lg focus:outline-none focus:border-[#5266EB] focus:ring-1 focus:ring-[#5266EB] transition-colors"
          />
        </div>
      </div>
    </div>
  );
};

// Amount Filter Chip Component (Active state)
interface AmountFilterChipProps {
  label: string;
  onClick: () => void;
  onClear: () => void;
}

const AmountFilterChip: React.FC<AmountFilterChipProps> = ({ label, onClick, onClear }) => {
  return (
    <button className="h-8 flex items-center bg-[rgba(82,102,235,0.1)] rounded-lg pl-3 pr-0">
      <span 
        onClick={onClick}
        className="text-[15px] leading-6 text-[#1e1e2a] whitespace-nowrap cursor-pointer"
      >
        {label}
      </span>
      <div 
        onClick={(e) => {
          e.stopPropagation();
          onClear();
        }}
        className="w-8 h-full flex items-center justify-center cursor-pointer hover:text-[#1e1e2a] text-[#363644]"
      >
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>
    </button>
  );
};

// Category Filter Dropdown Component
interface CategoryFilterDropdownProps {
  categories: string[];
  selectedCategories: string[];
  onSelectionChange: (categories: string[]) => void;
  onClose: () => void;
}

const CategoryFilterDropdown: React.FC<CategoryFilterDropdownProps> = ({
  categories,
  selectedCategories,
  onSelectionChange,
  onClose,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // Filter categories by search
  const filteredCategories = categories.filter(cat =>
    cat.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggleCategory = (category: string) => {
    if (selectedCategories.includes(category)) {
      onSelectionChange(selectedCategories.filter(c => c !== category));
    } else {
      onSelectionChange([...selectedCategories, category]);
    }
  };

  const handleSelectAll = () => {
    if (selectedCategories.length === categories.length + 1) {
      // All selected (including Uncategorized), deselect all
      onSelectionChange([]);
    } else {
      // Select all categories + Uncategorized
      onSelectionChange(['Uncategorized', ...categories]);
    }
  };

  const isAllSelected = selectedCategories.length === categories.length + 1;
  const isUncategorizedSelected = selectedCategories.includes('Uncategorized');

  return (
    <div
      ref={dropdownRef}
      className="absolute top-full left-0 mt-1 w-[320px] bg-white rounded-xl overflow-hidden z-50"
      style={{
        boxShadow: '0px 14px 20px 0px rgba(4, 4, 52, 0.02), 0px 8px 12px 0px rgba(14, 14, 45, 0.08), 0px 0px 1px 0px rgba(175, 178, 206, 0.9), 0px 1px 4px 0px rgba(183, 187, 219, 0.14)',
      }}
    >
      {/* Search Input */}
      <div className="p-6 pb-4">
        <div className="relative">
          <svg 
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for category"
            className="w-full h-10 pl-10 pr-4 text-[15px] text-gray-900 placeholder:text-gray-400 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Uncategorized Option */}
      <div className="px-6 pb-4">
        <label className="flex items-center gap-3 cursor-pointer group">
          <div className="relative">
            <input
              type="checkbox"
              checked={isUncategorizedSelected}
              onChange={() => handleToggleCategory('Uncategorized')}
              className="sr-only peer"
            />
            <div className="w-5 h-5 rounded border-2 border-gray-300 peer-checked:border-indigo-600 peer-checked:bg-indigo-600 transition-colors flex items-center justify-center">
              {isUncategorizedSelected && (
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
          </div>
          <span className="text-[15px] text-gray-900 leading-6">Uncategorized</span>
        </label>
      </div>

      {/* Category Section Header */}
      <div className="px-6 pb-2 flex items-center justify-between">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Category</span>
        <button
          onClick={handleSelectAll}
          className="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
        >
          {isAllSelected ? 'Deselect All' : 'Select All'}
        </button>
      </div>

      {/* Category List */}
      <div className="px-6 pb-6 max-h-[320px] overflow-y-auto">
        <div className="space-y-1">
          {filteredCategories.map((category) => {
            const isSelected = selectedCategories.includes(category);
            return (
              <label key={category} className="flex items-center gap-3 py-2 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleToggleCategory(category)}
                    className="sr-only peer"
                  />
                  <div className="w-5 h-5 rounded border-2 border-gray-300 peer-checked:border-indigo-600 peer-checked:bg-indigo-600 transition-colors flex items-center justify-center">
                    {isSelected && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="text-[15px] text-gray-900 leading-6">{category}</span>
              </label>
            );
          })}

          {filteredCategories.length === 0 && searchQuery && (
            <div className="py-4 text-center text-sm text-gray-400">
              No categories found
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface TransactionsFilterBarProps {
  onSettingsClick?: () => void;
  categoryFilter?: string[];
  onCategoryFilterChange?: (categories: string[]) => void;
  categories?: string[];
  dateFilter?: { shortcut: DateShortcut; from: string; to: string };
  onDateFilterChange?: (filter: { shortcut: DateShortcut; from: string; to: string } | null) => void;
  keywordFilter?: string[];
  onKeywordFilterChange?: (keywords: string[]) => void;
  recentKeywords?: string[];
  amountFilter?: AmountFilterValue;
  onAmountFilterChange?: (filter: AmountFilterValue | null) => void;
}

const TransactionsFilterBar: React.FC<TransactionsFilterBarProps> = ({ 
  onSettingsClick,
  categoryFilter = [],
  onCategoryFilterChange,
  categories = [],
  dateFilter,
  onDateFilterChange,
  keywordFilter = [],
  onKeywordFilterChange,
  recentKeywords = ['Hook Fish', 'Xian Noodles', 'Beeps', 'Nick\'s Tacos', 'Roxie\'s Subs'],
  amountFilter,
  onAmountFilterChange,
}) => {
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isDateDropdownOpen, setIsDateDropdownOpen] = useState(false);
  const [isKeywordDropdownOpen, setIsKeywordDropdownOpen] = useState(false);
  const [isAmountDropdownOpen, setIsAmountDropdownOpen] = useState(false);
  const categoryButtonRef = useRef<HTMLDivElement>(null);
  const dateButtonRef = useRef<HTMLDivElement>(null);
  const keywordButtonRef = useRef<HTMLDivElement>(null);
  const amountButtonRef = useRef<HTMLDivElement>(null);
  
  // Local date filter state (used when no external state provided)
  const [localDateFilter, setLocalDateFilter] = useState<{ shortcut: DateShortcut; from: string; to: string }>({
    shortcut: 'all-time',
    from: '',
    to: '',
  });

  const currentDateFilter = dateFilter || localDateFilter;
  const setCurrentDateFilter = onDateFilterChange || ((filter: { shortcut: DateShortcut; from: string; to: string } | null) => {
    if (filter) setLocalDateFilter(filter);
    else setLocalDateFilter({ shortcut: 'all-time', from: '', to: '' });
  });

  const handleCategoryClick = () => {
    setIsCategoryDropdownOpen(!isCategoryDropdownOpen);
  };

  const handleCategorySelectionChange = (newSelection: string[]) => {
    onCategoryFilterChange?.(newSelection);
  };

  const handleClearCategoryFilter = () => {
    onCategoryFilterChange?.([]);
  };

  const handleDateClick = () => {
    setIsDateDropdownOpen(!isDateDropdownOpen);
  };

  const handleClearDateFilter = () => {
    setCurrentDateFilter({ shortcut: 'all-time', from: '', to: '' });
  };

  const handleKeywordClick = () => {
    setIsKeywordDropdownOpen(!isKeywordDropdownOpen);
  };

  const handleKeywordSelectionChange = (newSelection: string[]) => {
    onKeywordFilterChange?.(newSelection);
  };

  const handleClearKeywordFilter = () => {
    onKeywordFilterChange?.([]);
  };

  // Default amount filter value
  const defaultAmountFilter: AmountFilterValue = { direction: 'any' };
  const currentAmountFilter = amountFilter || defaultAmountFilter;

  const handleAmountClick = () => {
    setIsAmountDropdownOpen(!isAmountDropdownOpen);
  };

  const handleAmountFilterChange = (newValue: AmountFilterValue) => {
    onAmountFilterChange?.(newValue);
  };

  const handleClearAmountFilter = () => {
    onAmountFilterChange?.(null);
  };

  // Check if amount filter is active (has any value set beyond default)
  const hasActiveAmountFilter = currentAmountFilter.direction !== 'any' || 
    currentAmountFilter.exactAmount !== undefined || 
    currentAmountFilter.minAmount !== undefined || 
    currentAmountFilter.maxAmount !== undefined;

  // Generate label for active amount filter
  const getAmountFilterLabel = (): string => {
    const parts: string[] = [];
    
    if (currentAmountFilter.direction === 'in') {
      parts.push('Money In');
    } else if (currentAmountFilter.direction === 'out') {
      parts.push('Money Out');
    }
    
    if (currentAmountFilter.exactAmount !== undefined) {
      parts.push(`= $${currentAmountFilter.exactAmount.toLocaleString()}`);
    }
    if (currentAmountFilter.minAmount !== undefined) {
      parts.push(`≥ $${currentAmountFilter.minAmount.toLocaleString()}`);
    }
    if (currentAmountFilter.maxAmount !== undefined) {
      parts.push(`≤ $${currentAmountFilter.maxAmount.toLocaleString()}`);
    }
    
    return parts.length > 0 ? parts.join(', ') : 'Amount';
  };

  const hasActiveKeywordFilter = keywordFilter.length > 0;
  const keywordFilterLabel = hasActiveKeywordFilter
    ? keywordFilter.length === 1
      ? keywordFilter[0]
      : `${keywordFilter.length} keywords`
    : 'Keyword';

  const hasActiveDateFilter = currentDateFilter.shortcut !== 'all-time';
  const dateFilterLabel = hasActiveDateFilter ? shortcutLabels[currentDateFilter.shortcut] : 'Date';

  const hasActiveFilter = categoryFilter.length > 0;
  const filterLabel = hasActiveFilter
    ? categoryFilter.length === 1
      ? categoryFilter[0]
      : `${categoryFilter.length} categories`
    : 'Category';

  return (
    <div className="flex items-center justify-between py-3">
      {/* Left side filters */}
      <div className="flex items-center gap-2">
        {/* Data Views */}
        <FilterButton
          icon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
            </svg>
          }
          label="Data Views"
        />

        {/* Filters */}
        <FilterButton
          icon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
          }
          label="Filters"
        />

        {/* Date */}
        <div ref={dateButtonRef} className="relative">
          {hasActiveDateFilter ? (
            <DateFilterChip
              label={dateFilterLabel}
              onClick={handleDateClick}
              onClear={handleClearDateFilter}
            />
          ) : (
            <FilterButton
              label="Date"
              onClick={handleDateClick}
              isOpen={isDateDropdownOpen}
            />
          )}

          {/* Date Dropdown */}
          {isDateDropdownOpen && (
            <DateFilterDropdown
              selectedShortcut={currentDateFilter.shortcut}
              onShortcutChange={(shortcut) => {
                setCurrentDateFilter({ ...currentDateFilter, shortcut });
              }}
              fromDate={currentDateFilter.from}
              toDate={currentDateFilter.to}
              onFromDateChange={(from) => {
                setCurrentDateFilter({ ...currentDateFilter, from });
              }}
              onToDateChange={(to) => {
                setCurrentDateFilter({ ...currentDateFilter, to });
              }}
              onClose={() => setIsDateDropdownOpen(false)}
            />
          )}
        </div>

        {/* Keywords */}
        <div ref={keywordButtonRef} className="relative">
          {hasActiveKeywordFilter ? (
            <KeywordFilterChip
              label={keywordFilterLabel}
              onClear={handleClearKeywordFilter}
            />
          ) : (
            <FilterButton
              label="Keyword"
              onClick={handleKeywordClick}
              isOpen={isKeywordDropdownOpen}
            />
          )}

          {/* Keyword Dropdown */}
          {isKeywordDropdownOpen && (
            <KeywordFilterDropdown
              recentKeywords={recentKeywords}
              selectedKeywords={keywordFilter}
              onSelectionChange={handleKeywordSelectionChange}
              onClose={() => setIsKeywordDropdownOpen(false)}
            />
          )}
        </div>

        {/* Amount */}
        <div ref={amountButtonRef} className="relative">
          {hasActiveAmountFilter ? (
            <AmountFilterChip
              label={getAmountFilterLabel()}
              onClick={handleAmountClick}
              onClear={handleClearAmountFilter}
            />
          ) : (
            <FilterButton
              label="Amount"
              onClick={handleAmountClick}
              isOpen={isAmountDropdownOpen}
            />
          )}

          {/* Amount Dropdown */}
          {isAmountDropdownOpen && (
            <AmountFilterDropdown
              value={currentAmountFilter}
              onChange={handleAmountFilterChange}
              onClose={() => setIsAmountDropdownOpen(false)}
            />
          )}
        </div>

        {/* Category */}
        <div ref={categoryButtonRef} className="relative">
          {hasActiveFilter ? (
            <div className="flex items-center">
              <button 
                onClick={handleCategoryClick}
                className="h-8 pl-3 pr-1 flex items-center gap-1 bg-indigo-50 border border-indigo-200 rounded-l-lg hover:bg-indigo-100 transition-colors"
              >
                <span className="text-[15px] text-indigo-700 leading-6 whitespace-nowrap font-medium">{filterLabel}</span>
                <span className="w-6 h-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </button>
              <button
                onClick={handleClearCategoryFilter}
                className="h-8 px-2 flex items-center bg-indigo-50 border border-l-0 border-indigo-200 rounded-r-lg hover:bg-indigo-100 transition-colors"
              >
                <svg className="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ) : (
            <FilterButton
              label="Category"
              onClick={handleCategoryClick}
              isActive={isCategoryDropdownOpen}
            />
          )}

          {/* Category Dropdown */}
          {isCategoryDropdownOpen && (
            <CategoryFilterDropdown
              categories={categories}
              selectedCategories={categoryFilter}
              onSelectionChange={handleCategorySelectionChange}
              onClose={() => setIsCategoryDropdownOpen(false)}
            />
          )}
        </div>
      </div>

      {/* Right side controls */}
      <div className="flex items-center gap-1">
        {/* View toggle - Grid */}
        <FilterButton
          variant="icon-only"
          label=""
          icon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          }
        />

        {/* View toggle - Sort */}
        <FilterButton
          variant="icon-only"
          label=""
          icon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
            </svg>
          }
        />

        {/* Settings - Slider icon */}
        <FilterButton
          variant="icon-only"
          label=""
          onClick={onSettingsClick}
          icon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
          }
        />

        {/* Export All */}
        <button className="h-8 px-3 flex items-center gap-2 text-[13px] text-gray-700 hover:bg-gray-100 rounded-md transition-colors ml-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          <span className="font-medium">Export All</span>
        </button>
      </div>
    </div>
  );
};

export default TransactionsFilterBar;

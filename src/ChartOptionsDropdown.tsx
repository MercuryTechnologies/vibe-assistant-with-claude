import React, { useState, useRef, useEffect } from 'react';
import { useAppStore } from './store';

// Toggle Switch Component matching the Figma design
interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

function ToggleSwitch({ checked, onChange }: ToggleSwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative w-[36px] h-[20px] rounded-full transition-colors duration-200 ${
        checked ? 'bg-[#5266eb]' : 'bg-[#d9d9e0]'
      }`}
    >
      <span
        className={`absolute top-[2px] left-[2px] w-[16px] h-[16px] bg-white rounded-full shadow-sm transition-transform duration-200 ${
          checked ? 'translate-x-[16px]' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

// Chart Options Dropdown Component
interface ChartOptionsDropdownProps {
  className?: string;
}

const ChartOptionsDropdown: React.FC<ChartOptionsDropdownProps> = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Get chart options from store
  const chartOptions = useAppStore((s) => s.chartOptions);
  const setChartOptions = useAppStore((s) => s.setChartOptions);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center bg-[#fbfcfd] border border-[rgba(112,115,147,0.16)] rounded-lg p-1 hover:bg-[rgba(112,115,147,0.05)] transition-colors"
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-label="Chart options"
      >
        {/* Chart column icon */}
        <div className="w-6 h-6 flex items-center justify-center">
          <i className="fa-solid fa-chart-column text-[13px] text-[#70707d]" />
        </div>
        {/* Chevron icon */}
        <div className="w-6 h-6 flex items-center justify-center">
          <i className={`fa-solid fa-chevron-${isOpen ? 'up' : 'down'} text-[13px] text-[#70707d] transition-transform`} />
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div 
          className="absolute right-0 top-[35px] w-[253px] bg-white rounded-lg p-1 z-50"
          style={{
            boxShadow: '0px 14px 20px 0px rgba(4, 4, 52, 0.02), 0px 8px 12px 0px rgba(14, 14, 45, 0.08), 0px 0px 1px 0px rgba(175, 178, 206, 0.9), 0px 1px 4px 0px rgba(183, 187, 219, 0.14)',
          }}
        >
          {/* Show cashflow line option */}
          <div className="flex items-center justify-between pl-2 pr-3 py-2 rounded hover:bg-[rgba(112,115,147,0.06)] transition-colors">
            <div className="flex items-start gap-1">
              {/* Chart line icon */}
              <div className="w-6 h-6 flex items-center justify-center">
                <i className="fa-solid fa-chart-line text-[13px] text-[#535461]" />
              </div>
              <div className="flex items-center">
                <span 
                  className="text-[15px] text-[#363644] leading-6 font-normal whitespace-nowrap"
                  style={{ fontFamily: "'Arcadia Text', sans-serif" }}
                >
                  Show cashflow line
                </span>
              </div>
            </div>
            <ToggleSwitch
              checked={chartOptions.showCashflowLine}
              onChange={(checked) => setChartOptions({ showCashflowLine: checked })}
            />
          </div>

          {/* Show bars option */}
          <div className="flex items-center justify-between pl-2 pr-3 py-2 rounded hover:bg-[rgba(112,115,147,0.06)] transition-colors">
            <div className="flex items-start gap-1">
              {/* Chart column icon */}
              <div className="w-6 h-6 flex items-center justify-center">
                <i className="fa-solid fa-chart-column text-[13px] text-[#535461]" />
              </div>
              <div className="flex items-center">
                <span 
                  className="text-[15px] text-[#363644] leading-6 font-normal whitespace-nowrap"
                  style={{ fontFamily: "'Arcadia Text', sans-serif" }}
                >
                  Show bars
                </span>
              </div>
            </div>
            <ToggleSwitch
              checked={chartOptions.showBars}
              onChange={(checked) => setChartOptions({ showBars: checked })}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ChartOptionsDropdown;

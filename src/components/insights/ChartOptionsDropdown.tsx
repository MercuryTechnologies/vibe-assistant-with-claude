import React, { useState, useRef, useEffect } from 'react';
import { Icon } from '../ui/icon';
import { faChartLine, faChartColumn, faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';

interface ChartOptions {
  showCashflowLine: boolean;
  showBars: boolean;
}

interface ChartOptionsDropdownProps {
  options: ChartOptions;
  onChange: (options: Partial<ChartOptions>) => void;
  className?: string;
}

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="chart-toggle-switch"
      data-checked={checked}
    >
      <span className="chart-toggle-thumb" />
    </button>
  );
}

export const ChartOptionsDropdown: React.FC<ChartOptionsDropdownProps> = ({ 
  options, 
  onChange, 
  className = '' 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="chart-options-trigger"
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-label="Chart options"
      >
        <Icon icon={faChartColumn} size="small" style={{ color: 'var(--ds-icon-secondary)' }} />
        <Icon icon={isOpen ? faChevronUp : faChevronDown} size="small" style={{ color: 'var(--ds-icon-secondary)' }} />
      </button>

      {isOpen && (
        <div className="chart-options-menu">
          <div className="chart-options-item">
            <div className="flex items-center gap-1">
              <Icon icon={faChartLine} size="small" style={{ color: 'var(--ds-icon-secondary)' }} />
              <span className="text-body">Show cashflow line</span>
            </div>
            <ToggleSwitch
              checked={options.showCashflowLine}
              onChange={(checked) => onChange({ showCashflowLine: checked })}
            />
          </div>

          <div className="chart-options-item">
            <div className="flex items-center gap-1">
              <Icon icon={faChartColumn} size="small" style={{ color: 'var(--ds-icon-secondary)' }} />
              <span className="text-body">Show bars</span>
            </div>
            <ToggleSwitch
              checked={options.showBars}
              onChange={(checked) => onChange({ showBars: checked })}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ChartOptionsDropdown;

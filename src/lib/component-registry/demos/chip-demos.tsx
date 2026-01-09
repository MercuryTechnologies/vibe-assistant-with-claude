import { useState } from 'react';
import { Chip } from '@/components/ui/chip';
import { DateFilter, type DatePreset, type DateRange } from '@/components/ui/date-filter-dropdown';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBookmark } from '@fortawesome/free-regular-svg-icons';

// Icon helpers
function FilterIcon({ className }: { className?: string }) {
  return (
    <svg
      style={{ width: '11px', height: '11px' }}
      viewBox="0 0 512 512"
      fill="none"
      stroke="currentColor"
      strokeWidth="42"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M32 144h448M96 256h320M192 368h128" />
    </svg>
  );
}

function BookmarkIcon({ className }: { className?: string }) {
  return <FontAwesomeIcon icon={faBookmark} style={{ width: '13px', height: '13px' }} className={className} />;
}

function TagIcon({ className }: { className?: string }) {
  return (
    <svg
      style={{ width: '11px', height: '11px' }}
      viewBox="0 0 448 512"
      fill="none"
      stroke="currentColor"
      strokeWidth="35"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M21 229L229 21c9.4-9.4 24.6-9.4 33.9 0l165 165c9.4 9.4 9.4 24.6 0 33.9L241 433c-9.4 9.4-24.6 9.4-33.9 0L21 263c-9.4-9.4-9.4-24.6 0-33.9z" />
      <circle cx="125" cy="117" r="20" fill="none" stroke="currentColor" strokeWidth="35" />
    </svg>
  );
}

function CircleIcon({ className }: { className?: string }) {
  return (
    <svg
      style={{ width: '16px', height: '16px' }}
      viewBox="0 0 512 512"
      fill="none"
      stroke="currentColor"
      strokeWidth="32"
      className={className}
    >
      <circle cx="256" cy="256" r="224" />
    </svg>
  );
}

// Default variant demo
export function ChipDefaultDemo() {
  const [datePreset, setDatePreset] = useState<DatePreset>('all_time');
  const [dateRange, setDateRange] = useState<DateRange>({});
  
  return (
    <div className="flex flex-col gap-6 p-4">
      {/* Default state */}
      <div>
        <div className="text-label mb-2" style={{ color: "var(--ds-text-tertiary)" }}>
          Default (Dropdown trigger)
        </div>
        <div className="flex flex-wrap gap-2">
          <DateFilter
            preset={datePreset}
            dateRange={dateRange}
            onPresetChange={setDatePreset}
            onDateRangeChange={setDateRange}
          />
          <Chip label="Keyword" trailingAction="dropdown" />
          <Chip label="Amount" trailingAction="dropdown" />
        </div>
      </div>
      
      {/* With leading icon */}
      <div>
        <div className="text-label mb-2" style={{ color: "var(--ds-text-tertiary)" }}>
          With Leading Icon
        </div>
        <div className="flex flex-wrap gap-2">
          <Chip 
            label="Filters" 
            leadingIcon={
              <span style={{ color: "var(--ds-icon-secondary)" }}>
                <FilterIcon />
              </span>
            }
            trailingAction="dropdown" 
          />
          <Chip 
            label="Data Views" 
            leadingIcon={
              <span style={{ color: "var(--ds-icon-secondary)" }}>
                <BookmarkIcon />
              </span>
            }
            trailingAction="dropdown" 
          />
        </div>
      </div>
      
      {/* Open state */}
      <div>
        <div className="text-label mb-2" style={{ color: "var(--ds-text-tertiary)" }}>
          Open State (dropdown open)
        </div>
        <div className="flex flex-wrap gap-2">
          <Chip 
            label="Date" 
            trailingAction="dropdown" 
            isOpen={true}
          />
        </div>
      </div>
      
      {/* No trailing action */}
      <div>
        <div className="text-label mb-2" style={{ color: "var(--ds-text-tertiary)" }}>
          No Trailing Action
        </div>
        <div className="flex flex-wrap gap-2">
          <Chip label="Label" trailingAction="none" />
          <Chip 
            label="With Icon" 
            leadingIcon={
              <span style={{ color: "var(--ds-icon-secondary)" }}>
                <TagIcon />
              </span>
            }
            trailingAction="none" 
          />
        </div>
      </div>
    </div>
  );
}

// Selected variant demo
export function ChipSelectedDemo() {
  return (
    <div className="flex flex-col gap-6 p-4">
      {/* Selected chip without icon */}
      <div>
        <div className="text-label mb-2" style={{ color: "var(--ds-text-tertiary)" }}>
          Selected (without icon)
        </div>
        <div className="flex flex-wrap gap-2">
          <Chip variant="selected" label="label" trailingAction="none" />
        </div>
      </div>
      
      {/* Selected chip with circular icon */}
      <div>
        <div className="text-label mb-2" style={{ color: "var(--ds-text-tertiary)" }}>
          Selected (with circular icon)
        </div>
        <div className="flex flex-wrap gap-2">
          <Chip 
            variant="selected" 
            label="label" 
            leadingIcon={
              <span style={{ color: "var(--ds-icon-default)" }}>
                <CircleIcon />
              </span>
            }
            trailingAction="none" 
          />
        </div>
      </div>
    </div>
  );
}

// Chips with clear button demo
export function ChipClearDemo() {
  const [filters, setFilters] = useState({
    date: 'This month',
    keyword: 'Software',
    amount: '≥$100',
  });
  
  const clearFilter = (key: keyof typeof filters) => {
    setFilters(prev => ({ ...prev, [key]: '' }));
  };
  
  return (
    <div className="flex flex-col gap-6 p-4">
      {/* Chips with clear button */}
      <div>
        <div className="text-label mb-2" style={{ color: "var(--ds-text-tertiary)" }}>
          Chips with Clear Button
        </div>
        <div className="flex flex-wrap gap-2">
          {filters.date && (
            <Chip 
              label={filters.date} 
              trailingAction="clear" 
              onClear={() => clearFilter('date')} 
            />
          )}
          {filters.keyword && (
            <Chip 
              label={filters.keyword} 
              trailingAction="clear" 
              onClear={() => clearFilter('keyword')} 
            />
          )}
          {filters.amount && (
            <Chip 
              label={filters.amount} 
              trailingAction="clear" 
              onClear={() => clearFilter('amount')} 
            />
          )}
          {!filters.date && !filters.keyword && !filters.amount && (
            <div className="text-body-sm" style={{ color: "var(--ds-text-disabled)" }}>
              Click the × to clear filters (they will reset on refresh)
            </div>
          )}
        </div>
      </div>
      
      {/* Chips without clear button */}
      <div>
        <div className="text-label mb-2" style={{ color: "var(--ds-text-tertiary)" }}>
          Chips without Clear Button
        </div>
        <div className="flex flex-wrap gap-2">
          <Chip label="Category A" trailingAction="none" />
          <Chip label="Category B" trailingAction="none" />
        </div>
      </div>
    </div>
  );
}

// Interactive demo
export function ChipInteractiveDemo() {
  const [datePreset, setDatePreset] = useState<DatePreset>('all_time');
  const [dateRange, setDateRange] = useState<DateRange>({});
  const [isKeywordOpen, setIsKeywordOpen] = useState(false);
  const [keywordValue, setKeywordValue] = useState<string | null>(null);
  
  const handleKeywordClick = () => {
    if (!keywordValue) {
      setIsKeywordOpen(true);
      // Simulate selecting keywords after 1.5s
      setTimeout(() => {
        setKeywordValue('2 keywords');
        setIsKeywordOpen(false);
      }, 1500);
    }
  };
  
  return (
    <div className="flex flex-col gap-6 p-4">
      <div>
        <div className="text-label mb-2" style={{ color: "var(--ds-text-tertiary)" }}>
          Interactive Demo (click Date chip to open filter menu)
        </div>
        <div className="flex flex-wrap gap-2">
          <DateFilter
            preset={datePreset}
            dateRange={dateRange}
            onPresetChange={setDatePreset}
            onDateRangeChange={setDateRange}
          />
          
          {keywordValue ? (
            <Chip 
              label={keywordValue} 
              trailingAction="clear" 
              onClear={() => setKeywordValue(null)} 
            />
          ) : (
            <Chip 
              label="Keyword" 
              trailingAction="dropdown" 
              isOpen={isKeywordOpen}
              onClick={handleKeywordClick}
            />
          )}
          
          <Chip label="Amount" trailingAction="dropdown" />
        </div>
      </div>
    </div>
  );
}

// All states demo for design review
export function ChipAllStatesDemo() {
  return (
    <div className="flex flex-col gap-6 p-4">
      <div>
        <div className="text-label mb-2" style={{ color: "var(--ds-text-tertiary)" }}>
          All Variants & States
        </div>
        <div className="flex flex-col gap-4">
          {/* Row 1: Default variants */}
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-tiny w-24" style={{ color: "var(--ds-text-disabled)" }}>
              Default:
            </span>
            <Chip label="Default" trailingAction="dropdown" />
            <Chip
              label="With Icon"
              leadingIcon={
                <span style={{ color: "var(--ds-icon-secondary)" }}>
                  <FilterIcon />
                </span>
              }
              trailingAction="dropdown"
            />
            <Chip label="No Arrow" trailingAction="none" />
          </div>
          
          {/* Row 2: Open state */}
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-tiny w-24" style={{ color: "var(--ds-text-disabled)" }}>
              Open:
            </span>
            <Chip label="Open" trailingAction="dropdown" isOpen={true} />
          </div>
          
          {/* Row 3: With clear button */}
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-tiny w-24" style={{ color: "var(--ds-text-disabled)" }}>
              Clear:
            </span>
            <Chip label="With Clear" trailingAction="clear" />
            <Chip label="No Clear" trailingAction="none" />
          </div>
          
          {/* Row 4: Selected variants */}
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-tiny w-24" style={{ color: "var(--ds-text-disabled)" }}>
              Selected:
            </span>
            <Chip variant="selected" label="label" trailingAction="none" />
            <Chip 
              variant="selected" 
              label="label" 
              leadingIcon={
                <span style={{ color: "var(--ds-icon-default)" }}>
                  <CircleIcon />
                </span>
              }
              trailingAction="none" 
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Variant components map for ComponentDetail page
export const chipVariantComponents: Record<string, React.ComponentType> = {
  'Default': ChipDefaultDemo,
  'Selected': ChipSelectedDemo,
  'Clear': ChipClearDemo,
  'Interactive': ChipInteractiveDemo,
  'All States': ChipAllStatesDemo,
};

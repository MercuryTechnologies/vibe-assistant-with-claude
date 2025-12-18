import React from 'react';

// Types for flexible option handling
export type SegmentedControlOption<T extends string = string> = 
  | T 
  | { value: T; label: string };

export interface SegmentedControlProps<T extends string = string> {
  /** Array of options - can be strings or objects with value/label */
  options: SegmentedControlOption<T>[];
  /** Currently selected value */
  value: T;
  /** Callback when selection changes */
  onChange: (value: T) => void;
  /** Optional className for the container */
  className?: string;
  /** Size variant */
  size?: 'sm' | 'md';
  /** Accessible label for the control */
  'aria-label'?: string;
}

// Helper to extract value and label from an option
function getOptionDetails<T extends string>(option: SegmentedControlOption<T>): { value: T; label: string } {
  if (typeof option === 'string') {
    return { value: option, label: option };
  }
  return option;
}

/**
 * SegmentedControl - A pill-style toggle for switching between options
 * 
 * Matches Mercury design system with:
 * - Light gray container background (#fbfcfd)
 * - Subtle border
 * - White background for selected option with shadow
 * - Dividers between unselected options
 */
function SegmentedControl<T extends string = string>({
  options,
  value,
  onChange,
  className = '',
  size = 'md',
  'aria-label': ariaLabel = 'Selection',
}: SegmentedControlProps<T>) {
  // Size-based styling
  const sizeStyles = {
    sm: {
      container: '',
      button: 'px-2.5 py-1 text-[13px]',
      divider: 'h-2.5',
    },
    md: {
      container: '',
      button: 'px-3 py-1 text-[15px]',
      divider: 'h-3',
    },
  };

  const styles = sizeStyles[size];

  return (
    <div
      className={`inline-flex rounded-lg border border-[rgba(112,115,147,0.16)] bg-[#fbfcfd] ${styles.container} ${className}`}
      role="radiogroup"
      aria-label={ariaLabel}
    >
      {options.map((option, index) => {
        const { value: optionValue, label } = getOptionDetails(option);
        const isActive = value === optionValue;
        const prevOption = index > 0 ? getOptionDetails(options[index - 1]) : null;
        const isPrevActive = prevOption ? value === prevOption.value : false;
        
        // Show divider if both current and previous options are not active
        const showDivider = index > 0 && !isActive && !isPrevActive;

        return (
          <React.Fragment key={optionValue}>
            {showDivider && (
              <div 
                className={`w-px ${styles.divider} bg-[rgba(112,115,147,0.2)] self-center`}
                aria-hidden="true"
              />
            )}
            <button
              type="button"
              role="radio"
              aria-checked={isActive}
              onClick={() => onChange(optionValue)}
              className={`${styles.button} rounded-[8px] transition-all duration-150 ${
                isActive
                  ? 'bg-white shadow-sm font-[480] text-[#1e1e2a] border border-[rgba(112,115,147,0.22)] -m-px z-10 relative'
                  : 'text-[#70707d] hover:text-[#363644]'
              }`}
            >
              {label}
            </button>
          </React.Fragment>
        );
      })}
    </div>
  );
}

// Legacy type exports for backward compatibility
export type Scale = 'month' | 'quarter' | 'year';
export type TimePeriod = 'mtd' | 'qtd' | 'ytd';

export default SegmentedControl;

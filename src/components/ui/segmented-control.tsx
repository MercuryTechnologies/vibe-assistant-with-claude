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
 * - Light gray container background
 * - Subtle border
 * - White background for selected option with shadow
 * - Dividers between unselected options
 */
export function SegmentedControl<T extends string = string>({
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
      button: 'segmented-control-button-sm',
      divider: 'segmented-control-divider-sm',
    },
    md: {
      button: 'segmented-control-button-md',
      divider: 'segmented-control-divider-md',
    },
  };

  const styles = sizeStyles[size];

  return (
    <div
      className={`segmented-control ${className}`}
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
                className={`segmented-control-divider ${styles.divider}`}
                aria-hidden="true"
              />
            )}
            <button
              type="button"
              role="radio"
              aria-checked={isActive}
              onClick={() => onChange(optionValue)}
              className={`segmented-control-button ${styles.button} ${isActive ? 'active' : ''}`}
            >
              {label}
            </button>
          </React.Fragment>
        );
      })}
    </div>
  );
}

export default SegmentedControl;

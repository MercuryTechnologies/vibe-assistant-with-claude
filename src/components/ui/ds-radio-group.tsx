"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

// ============================================================================
// Types
// ============================================================================

export interface RadioOption<T extends string = string> {
  /** Unique value for the option */
  value: T
  /** Display label for the option */
  label: string
  /** Optional description shown after the label */
  description?: string
  /** Whether this option is disabled */
  disabled?: boolean
}

export interface DSRadioGroupProps<T extends string = string> {
  /** The label for the radio group */
  label?: string
  /** Array of radio options */
  options: RadioOption<T>[]
  /** Currently selected value */
  value?: T
  /** Callback when value changes */
  onChange?: (value: T) => void
  /** Variant of the radio group */
  variant?: "simple" | "block"
  /** Orientation of the radio options */
  orientation?: "vertical" | "horizontal"
  /** Whether the entire radio group is disabled */
  disabled?: boolean
  /** Whether the radio group is in an error state */
  error?: boolean
  /** Additional className for the container */
  className?: string
  /** Name attribute for the radio inputs (for form submission) */
  name?: string
}

// ============================================================================
// DSRadioGroup Component
// ============================================================================

export function DSRadioGroup<T extends string = string>({
  label,
  options,
  value,
  onChange,
  variant = "simple",
  orientation = "vertical",
  disabled = false,
  error = false,
  className,
  name,
}: DSRadioGroupProps<T>) {
  const groupId = React.useId()
  const radioName = name || groupId

  const handleSelect = (optionValue: T, optionDisabled?: boolean) => {
    if (disabled || optionDisabled) return
    onChange?.(optionValue)
  }

  return (
    <div
      className={cn("ds-radio-group", className)}
      role="radiogroup"
      aria-label={label}
    >
      {/* Label */}
      {label && (
        <label className="ds-radio-group-label">
          {label}
        </label>
      )}

      {/* Options */}
      <div
        className={cn(
          "ds-radio-options",
          orientation === "vertical" ? "vertical" : "horizontal"
        )}
      >
        {options.map((option) => {
          const isSelected = value === option.value
          const isDisabled = disabled || option.disabled

          if (variant === "block") {
            return (
              <BlockRadioOption
                key={option.value}
                option={option}
                isSelected={isSelected}
                isDisabled={isDisabled}
                error={error}
                radioName={radioName}
                onSelect={() => handleSelect(option.value, option.disabled)}
              />
            )
          }

          return (
            <SimpleRadioOption
              key={option.value}
              option={option}
              isSelected={isSelected}
              isDisabled={isDisabled}
              error={error}
              radioName={radioName}
              onSelect={() => handleSelect(option.value, option.disabled)}
            />
          )
        })}
      </div>
    </div>
  )
}

// ============================================================================
// Simple Radio Option
// ============================================================================

interface RadioOptionInternalProps<T extends string> {
  option: RadioOption<T>
  isSelected: boolean
  isDisabled?: boolean
  error?: boolean
  radioName: string
  onSelect: () => void
}

function SimpleRadioOption<T extends string>({
  option,
  isSelected,
  isDisabled,
  error,
  radioName,
  onSelect,
}: RadioOptionInternalProps<T>) {
  return (
    <label
      className={cn(
        "ds-radio-option-simple",
        isDisabled && "disabled"
      )}
    >
      {/* Hidden input for accessibility */}
      <input
        type="radio"
        name={radioName}
        value={option.value}
        checked={isSelected}
        disabled={isDisabled}
        onChange={onSelect}
        className="sr-only"
      />

      {/* Radio button visual */}
      <div
        className={cn(
          "ds-radio-indicator",
          isSelected ? "selected" : "unselected",
          error && "error",
          isDisabled && "disabled"
        )}
      >
        {isSelected && (
          <div className="ds-radio-indicator-dot" />
        )}
      </div>

      {/* Label text */}
      <span className={cn(
        "ds-radio-label-text",
        isDisabled && "disabled"
      )}>
        {option.label}
        {option.description && (
          <span className="ds-radio-description">{option.description}</span>
        )}
      </span>
    </label>
  )
}

// ============================================================================
// Block Radio Option
// ============================================================================

function BlockRadioOption<T extends string>({
  option,
  isSelected,
  isDisabled,
  error,
  radioName,
  onSelect,
}: RadioOptionInternalProps<T>) {
  return (
    <label
      className={cn(
        "ds-radio-option-block",
        isSelected && "selected",
        error && "error",
        isDisabled && "disabled"
      )}
    >
      {/* Hidden input for accessibility */}
      <input
        type="radio"
        name={radioName}
        value={option.value}
        checked={isSelected}
        disabled={isDisabled}
        onChange={onSelect}
        className="sr-only"
      />

      {/* Radio button visual */}
      <div
        className={cn(
          "ds-radio-indicator",
          isSelected ? "selected" : "unselected",
          error && "error"
        )}
      >
        {isSelected && (
          <div className="ds-radio-indicator-dot" />
        )}
      </div>

      {/* Label text */}
      <span className={cn(
        "ds-radio-label-text",
        isDisabled && "disabled"
      )}>
        {option.label}
        {option.description && (
          <span className="ds-radio-description">{option.description}</span>
        )}
      </span>
    </label>
  )
}

// ============================================================================
// Export
// ============================================================================

export { DSRadioGroup as default }

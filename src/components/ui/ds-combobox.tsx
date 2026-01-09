"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// ============================================================================
// DSCombobox Types
// ============================================================================

export type DSComboboxVariant = "default" | "inline"

export interface ComboboxOption {
  value: string
  label: string
  disabled?: boolean
}

export interface DSComboboxProps {
  /** Visual style variant */
  variant?: DSComboboxVariant
  /** Label text displayed above the combobox */
  label?: string
  /** Currently selected value */
  value?: string
  /** Placeholder text when no value is selected */
  placeholder?: string
  /** Array of options to display */
  options: ComboboxOption[]
  /** Callback when value changes */
  onChange?: (value: string) => void
  /** Help text displayed below the combobox */
  helpText?: string
  /** Error state */
  error?: boolean
  /** Error message to display (also sets error state) */
  errorMessage?: string
  /** Disabled state */
  disabled?: boolean
  /** Allow clearing the selection */
  clearable?: boolean
  /** Allow multiple selections (future enhancement) */
  multiselect?: boolean
  /** Additional className for the container */
  containerClassName?: string
  /** Additional className for the trigger */
  triggerClassName?: string
  /** Align dropdown to trigger */
  align?: "start" | "center" | "end"
}

// ============================================================================
// Icon Components
// ============================================================================

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      style={{ width: 13, height: 13 }}
      viewBox="0 0 13 13"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M3.25 5L6.5 8.25L9.75 5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ClearIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      style={{ width: 13, height: 13 }}
      viewBox="0 0 13 13"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M4 4L9 9M9 4L4 9"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function WarningIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      style={{ width: 12, height: 12 }}
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M5.134 1.5c.385-.667 1.347-.667 1.732 0l4.134 7.167c.385.666-.096 1.5-.866 1.5H1.866c-.77 0-1.251-.834-.866-1.5L5.134 1.5z"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <path
        d="M6 4.5v2"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <circle cx="6" cy="8.25" r="0.75" fill="currentColor" />
    </svg>
  )
}

// ============================================================================
// DSCombobox Component
// ============================================================================

function DSCombobox({
  variant = "default",
  label,
  value,
  placeholder = "Select...",
  options,
  onChange,
  helpText,
  error = false,
  errorMessage,
  disabled = false,
  clearable = false,
  containerClassName,
  triggerClassName,
  align = "start",
}: DSComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [isHovered, setIsHovered] = React.useState(false)

  const selectedOption = options.find((opt) => opt.value === value)
  const displayValue = selectedOption?.label || placeholder
  const hasValue = !!selectedOption
  const hasError = error || !!errorMessage

  const currentState = disabled
    ? "disabled"
    : hasError
      ? "error"
      : open
        ? "focus"
        : isHovered
          ? "hover"
          : "default"

  const labelStateClass =
    currentState === "focus"
      ? "ds-combobox-label-focus"
      : currentState === "error"
        ? "ds-combobox-label-error"
        : currentState === "disabled"
          ? "ds-combobox-label-disabled"
          : ""

  const triggerBaseClass =
    variant === "inline" ? "ds-inline-combobox-trigger" : "ds-combobox-trigger"

  const triggerStateClass =
    currentState === "error"
      ? "error"
      : currentState === "disabled"
        ? "disabled"
        : currentState === "focus"
          ? variant === "inline"
            ? "open"
            : "focus"
          : ""

  const handleSelect = (optionValue: string) => {
    if (!disabled) {
      onChange?.(optionValue)
      setOpen(false)
    }
  }

  const handleClear = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onChange?.("")
    setOpen(false)
  }

  return (
    <div
      className={cn(
        "flex flex-col gap-1 w-full",
        currentState === "disabled" && "opacity-60 pointer-events-none",
        containerClassName
      )}
    >
      {label && (
        <label className={cn("text-label", labelStateClass)}>
          {label}
        </label>
      )}
      <DropdownMenu open={open} onOpenChange={disabled ? undefined : setOpen}>
        <DropdownMenuTrigger asChild disabled={disabled}>
          <button
            type="button"
            className={cn(triggerBaseClass, triggerStateClass, triggerClassName)}
            onMouseEnter={() => !disabled && setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            aria-expanded={open}
            aria-haspopup="listbox"
            disabled={disabled}
          >
            <span
              className={cn(
                "text-body truncate flex-1 text-left",
                !hasValue && "ds-combobox-placeholder"
              )}
            >
              {displayValue}
            </span>
            <div className="flex items-center shrink-0">
              {clearable && hasValue && !disabled && isHovered ? (
                <span
                  onClick={handleClear}
                  className="ds-combobox-clear"
                >
                  <ClearIcon />
                </span>
              ) : (
                <ChevronDownIcon
                  className={cn(
                    "ds-combobox-chevron shrink-0 transition-transform duration-200",
                    open && "rotate-180"
                  )}
                />
              )}
            </div>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align={align}
          className="ds-combobox-content"
          sideOffset={4}
        >
          {options.map((option) => (
            <DropdownMenuItem
              key={option.value}
              onClick={() => handleSelect(option.value)}
              disabled={option.disabled}
              className={cn(
                "ds-combobox-item",
                option.value === value && "selected",
                option.disabled && "disabled"
              )}
            >
              {option.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      {(helpText || errorMessage) && (
        <span
          className={cn(
            "ds-combobox-help text-tiny flex items-center gap-1",
            hasError
              ? "ds-combobox-help-error"
              : "ds-combobox-help-default"
          )}
        >
          {hasError && <WarningIcon className="shrink-0" />}
          {errorMessage || helpText}
        </span>
      )}
    </div>
  )
}

// ============================================================================
// Exports
// ============================================================================

export {
  DSCombobox,
}

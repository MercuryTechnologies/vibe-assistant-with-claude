"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCaretDown } from "@/icons"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// ============================================================================
// Types
// ============================================================================

export interface ComboboxOption {
  value: string
  label: string
  disabled?: boolean
}

export interface InlineComboboxProps
{
  /** Currently selected value */
  value?: string
  /** Placeholder text when no value is selected */
  placeholder?: string
  /** Array of options to display */
  options: ComboboxOption[]
  /** Callback when value changes */
  onChange?: (value: string) => void
  /** Error state */
  error?: boolean
  /** Disabled state */
  disabled?: boolean
  /** Additional className */
  className?: string
  /** Align dropdown to trigger */
  align?: "start" | "center" | "end"
  /** Make the combobox span the full width of its container */
  fullWidth?: boolean
  /** Props forwarded to the trigger button (native button attributes) */
  triggerProps?: React.ButtonHTMLAttributes<HTMLButtonElement>
}

// ============================================================================
// InlineCombobox Component
// ============================================================================

export function InlineCombobox({
  value,
  placeholder = "Select...",
  options,
  onChange,
  error = false,
  disabled = false,
  className,
  align = "start",
  fullWidth = false,
  triggerProps,
}: InlineComboboxProps) {
  const [open, setOpen] = React.useState(false)

  const selectedOption = options.find((opt) => opt.value === value)
  const displayValue = selectedOption?.label || placeholder
  const hasValue = !!selectedOption

  const stateClass = disabled ? "disabled" : error ? "error" : open ? "open" : ""

  const handleSelect = (optionValue: string) => {
    if (!disabled) {
      onChange?.(optionValue)
      setOpen(false)
    }
  }

  return (
    <DropdownMenu open={open} onOpenChange={disabled ? undefined : setOpen}>
      <DropdownMenuTrigger
        asChild
        disabled={disabled}
      >
        <button
          type="button"
          className={cn(
            "ds-inline-combobox-trigger text-body select-none",
            stateClass,
            fullWidth ? "w-full" : "",
            className
          )}
          aria-expanded={open}
          aria-haspopup="listbox"
          disabled={disabled}
          {...triggerProps}
        >
          <span className={cn("truncate", !hasValue && "ds-combobox-placeholder")}>
            {displayValue}
          </span>
          <FontAwesomeIcon icon={faCaretDown} className="ds-inline-combobox-chevron" />
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
  )
}

"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

// ============================================================================
// Types
// ============================================================================

export interface DSTextInputProps extends Omit<React.ComponentProps<"input">, "prefix"> {
  /** Label text displayed above the input */
  label?: string
  /** Prefix content (text or icon) shown before the input */
  prefix?: React.ReactNode
  /** Suffix content (text or icon) shown after the input */
  suffix?: React.ReactNode
  /** Help text displayed below the input */
  helpText?: string
  /** Error state */
  error?: boolean
  /** Error message to display (also sets error state) */
  errorMessage?: string
  /** Additional className for the container */
  containerClassName?: string
  /** Additional className for the input wrapper */
  wrapperClassName?: string
}

// ============================================================================
// Icon Components
// ============================================================================

function WarningIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn("shrink-0", className)}
      style={{ width: 11, height: 11 }}
      viewBox="0 0 11 11"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M5.5 0L11 10H0L5.5 0ZM5.5 2.5L1.8 9H9.2L5.5 2.5ZM5 6V4.5H6V6H5ZM5 8V7H6V8H5Z" />
    </svg>
  )
}

// ============================================================================
// DSTextInput Component
// ============================================================================

const DSTextInput = React.forwardRef<HTMLInputElement, DSTextInputProps>(
  (
    {
      className,
      label,
      prefix,
      suffix,
      helpText,
      error = false,
      errorMessage,
      containerClassName,
      wrapperClassName,
      disabled,
      onFocus,
      onBlur,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = React.useState(false)

    const hasError = error || !!errorMessage

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true)
      onFocus?.(e)
    }

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false)
      onBlur?.(e)
    }

    return (
      <div 
        className={cn(
          "ds-text-input-container",
          disabled && "disabled",
          containerClassName
        )}
      >
        {label && (
          <label 
            className={cn(
              "ds-text-input-label",
              isFocused && !hasError && "focused",
              hasError && "error",
              disabled && "disabled"
            )}
          >
            {label}
          </label>
        )}
        <div
          className={cn(
            "ds-text-input-wrapper",
            isFocused && !hasError && "focused",
            hasError && "error",
            disabled && "disabled",
            wrapperClassName
          )}
        >
          {prefix && (
            <span className="ds-text-input-affix">
              {prefix}
            </span>
          )}
          <input
            ref={ref}
            disabled={disabled}
            className={cn("ds-text-input-field", className)}
            onFocus={handleFocus}
            onBlur={handleBlur}
            {...props}
          />
          {suffix && (
            <span className="ds-text-input-affix">
              {suffix}
            </span>
          )}
        </div>
        {(helpText || errorMessage) && (
          <span
            className={cn(
              "ds-text-input-help",
              hasError && "error"
            )}
          >
            {hasError && <WarningIcon />}
            {errorMessage || helpText}
          </span>
        )}
      </div>
    )
  }
)

DSTextInput.displayName = "DSTextInput"

// ============================================================================
// Exports
// ============================================================================

export { DSTextInput }

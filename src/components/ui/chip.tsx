"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

// ============================================================================
// Icons
// ============================================================================

function ChevronDownIcon() {
  return (
    <svg
      style={{ width: 13, height: 13 }}
      viewBox="0 0 512 512"
      fill="currentColor"
    >
      <path d="M233.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L256 338.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z" />
    </svg>
  )
}

function ChevronUpIcon() {
  return (
    <svg
      style={{ width: 13, height: 13 }}
      viewBox="0 0 512 512"
      fill="currentColor"
    >
      <path d="M233.4 105.4c12.5-12.5 32.8-12.5 45.3 0l192 192c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L256 173.3 86.6 342.6c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3l192-192z" />
    </svg>
  )
}

function TimesIcon() {
  return (
    <svg
      style={{ width: 13, height: 13 }}
      viewBox="0 0 384 512"
      fill="currentColor"
    >
      <path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z" />
    </svg>
  )
}

// ============================================================================
// Types
// ============================================================================

export interface ChipProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  /** Text label to display */
  label: string
  /** Optional leading icon */
  leadingIcon?: React.ReactNode
  /** 
   * Visual variant of the chip
   * - default: Standard chip with white background and border (for filters, dropdowns)
   * - selected: Selected chip with light purple background, no border (for active filters)
   */
  variant?: "default" | "selected"
  /** Type of trailing action to show */
  trailingAction?: "dropdown" | "clear" | "none"
  /** Whether the chip is in open/expanded state (controls chevron direction) */
  isOpen?: boolean
  /** Callback when clear button is clicked (only for trailingAction="clear") */
  onClear?: () => void
  /** Additional className */
  className?: string
}

// ============================================================================
// Chip Component
// ============================================================================

/**
 * Chip component for filters, tags, and dropdown triggers.
 * 
 * Features:
 * - Two variants: default (white with border) and selected (purple background)
 * - Optional leading icon
 * - Three trailing action types: dropdown (chevron), clear (x), or none
 * - Automatic chevron direction based on isOpen state
 * 
 * Usage:
 * ```tsx
 * // Basic dropdown trigger
 * <Chip label="Date" trailingAction="dropdown" onClick={openDatePicker} />
 * 
 * // Selected chip with clear button
 * <Chip 
 *   variant="selected"
 *   label="This month" 
 *   trailingAction="clear" 
 *   onClear={() => clearFilter()} 
 * />
 * 
 * // Selected chip with leading icon
 * <Chip 
 *   variant="selected"
 *   label="Filters" 
 *   leadingIcon={<CircleIcon />} 
 *   trailingAction="none" 
 * />
 * ```
 */
export function Chip({
  label,
  leadingIcon,
  variant = "default",
  trailingAction = "dropdown",
  isOpen = false,
  onClear,
  className,
  onClick,
  ...props
}: ChipProps) {
  const hasTrailingAction = trailingAction !== "none"

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(e)
  }

  const handleClearClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onClear?.()
  }

  return (
    <button
      type="button"
      className={cn(
        "ds-chip",
        variant === "selected" && "ds-chip--selected",
        hasTrailingAction ? "ds-chip--has-trailing" : "ds-chip--no-trailing",
        leadingIcon && "ds-chip--has-leading",
        isOpen && "ds-chip--open",
        className
      )}
      onClick={handleClick}
      {...props}
    >
      {/* Leading icon */}
      {leadingIcon && (
        <span className="ds-chip-leading-icon">
          {leadingIcon}
        </span>
      )}

      {/* Label */}
      <span className="ds-chip-label">
        {label}
      </span>

      {/* Trailing action */}
      {hasTrailingAction && (
        <span
          className={cn(
            "ds-chip-trailing",
            trailingAction === "clear" && "ds-chip-trailing--clear"
          )}
          onClick={trailingAction === "clear" ? handleClearClick : undefined}
          role={trailingAction === "clear" ? "button" : undefined}
          tabIndex={trailingAction === "clear" ? 0 : undefined}
        >
          {trailingAction === "clear" ? (
            <TimesIcon />
          ) : isOpen ? (
            <ChevronUpIcon />
          ) : (
            <ChevronDownIcon />
          )}
        </span>
      )}
    </button>
  )
}

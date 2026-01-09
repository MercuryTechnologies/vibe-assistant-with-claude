"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

// ============================================================================
// ToggleSwitch Component
// ============================================================================

export interface ToggleSwitchProps {
  /** Whether the switch is checked/on */
  checked?: boolean
  /** Callback when the switch state changes */
  onChange?: (checked: boolean) => void
  /** Disabled state */
  disabled?: boolean
  /** Additional className */
  className?: string
  /** Aria label for accessibility */
  "aria-label"?: string
}

export function ToggleSwitch({
  checked = false,
  onChange,
  disabled = false,
  className,
  "aria-label": ariaLabel,
}: ToggleSwitchProps) {
  const handleClick = () => {
    if (!disabled) {
      onChange?.(!checked)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      handleClick()
    }
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={cn(
        "ds-toggle-switch",
        className
      )}
      data-checked={checked ? "true" : "false"}
    >
      <span className="ds-toggle-switch-thumb" />
    </button>
  )
}

"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

// ============================================================================
// DSCheckbox Component - Mercury Design System
// Based on Figma design with three label styles:
// - None: Checkbox only
// - Simple: Checkbox with label
// - Sublabel: Checkbox with label and sublabel beneath
//
// Design specs from Figma:
// - Size: 20x20px
// - Border radius: 4px (rounded-sm)
// - Default: bg #fbfcfd, border #c3c3cc
// - Hovered: drop shadow 0 1px 4px rgba(157, 157, 176, 0.1)
// - Checked: bg #5266eb (purple-magic-600)
// - Checked + Hovered: bg #4354c8 (purple-magic-700)
// ============================================================================

export type LabelStyle = "none" | "simple" | "sublabel"

export interface DSCheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  /** The label style variant */
  labelStyle?: LabelStyle
  /** Main label text (only shown when labelStyle is "simple" or "sublabel") */
  label?: string
  /** Sublabel text (only shown when labelStyle is "sublabel") */
  sublabel?: string
  /** Whether the checkbox is in an indeterminate state */
  indeterminate?: boolean
  /** Whether the checkbox should take up minimal width */
  hugContents?: boolean
}

const DSCheckbox = React.forwardRef<HTMLInputElement, DSCheckboxProps>(
  ({ 
    className, 
    labelStyle = "none",
    label,
    sublabel,
    indeterminate, 
    checked, 
    disabled,
    id,
    hugContents = true,
    ...props 
  }, ref) => {
    const internalRef = React.useRef<HTMLInputElement>(null)
    const generatedId = React.useId()
    const checkboxId = id || generatedId
    
    // Combine refs
    React.useImperativeHandle(ref, () => internalRef.current!, [])
    
    // Handle indeterminate state
    React.useEffect(() => {
      if (internalRef.current) {
        internalRef.current.indeterminate = indeterminate ?? false
      }
    }, [indeterminate])

    // Checkbox box element (shared across all variants)
    const checkboxBox = (
      <div className="ds-checkbox-wrapper">
        {/* Actual checkbox input - positioned over the visual element */}
        <input
          type="checkbox"
          ref={internalRef}
          id={checkboxId}
          checked={checked}
          disabled={disabled}
          className={cn(
            "ds-checkbox-input",
            disabled ? "cursor-not-allowed" : "cursor-pointer"
          )}
          {...props}
        />
        {/* Visual checkbox (behind the input) */}
        <div
          className={cn(
            "ds-checkbox-visual",
            (checked || indeterminate) && "ds-checkbox-visual--checked",
            disabled && "ds-checkbox-visual--disabled"
          )}
        >
          {/* Checkmark icon - only show when checked */}
          <svg
            className={cn(
              "ds-checkbox-icon",
              checked && !indeterminate ? "ds-checkbox-icon--visible" : "ds-checkbox-icon--hidden"
            )}
            viewBox="0 0 448 512"
            fill="currentColor"
          >
            <path d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z"/>
          </svg>
          {/* Indeterminate icon (minus) */}
          <svg
            className={cn(
              "ds-checkbox-icon ds-checkbox-icon--absolute",
              indeterminate ? "ds-checkbox-icon--visible" : "ds-checkbox-icon--hidden"
            )}
            viewBox="0 0 448 512"
            fill="currentColor"
          >
            <path d="M432 256c0 17.7-14.3 32-32 32L48 288c-17.7 0-32-14.3-32-32s14.3-32 32-32l352 0c17.7 0 32 14.3 32 32z"/>
          </svg>
        </div>
      </div>
    )

    // Label style: None - just the checkbox
    if (labelStyle === "none") {
      return (
        <div className={cn("inline-flex items-center", className)}>
          {checkboxBox}
        </div>
      )
    }

    // Label style: Simple - checkbox with label
    if (labelStyle === "simple") {
      return (
        <label
          htmlFor={checkboxId}
          className={cn(
            "ds-checkbox-label",
            disabled ? "cursor-not-allowed" : "cursor-pointer",
            hugContents ? "w-auto" : "w-full",
            className
          )}
        >
          {checkboxBox}
          <span className={cn(
            "ds-checkbox-label-text",
            disabled && "ds-checkbox-label-text--disabled"
          )}>
            {label}
          </span>
        </label>
      )
    }

    // Label style: Sublabel - checkbox with label and sublabel beneath
    if (labelStyle === "sublabel") {
      return (
        <label
          htmlFor={checkboxId}
          className={cn(
            "ds-checkbox-label ds-checkbox-label--sublabel",
            disabled ? "cursor-not-allowed" : "cursor-pointer",
            hugContents ? "w-auto" : "w-full",
            className
          )}
        >
          {/* Checkbox aligned to top of label */}
          <div className="pt-0.5">
            {checkboxBox}
          </div>
          <div className="flex flex-col">
            <span className={cn(
              "ds-checkbox-label-text",
              disabled && "ds-checkbox-label-text--disabled"
            )}>
              {label}
            </span>
            {sublabel && (
              <span className={cn(
                "ds-checkbox-sublabel-text",
                disabled && "ds-checkbox-sublabel-text--disabled"
              )}>
                {sublabel}
              </span>
            )}
          </div>
        </label>
      )
    }

    return null
  }
)

DSCheckbox.displayName = "DSCheckbox"

export { DSCheckbox }

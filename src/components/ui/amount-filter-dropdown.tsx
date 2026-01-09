"use client"

import * as React from "react"
import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import { DSRadioGroup, type RadioOption } from "@/components/ui/ds-radio-group"
import { Chip } from "./chip"

function EqualsIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 13 13"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M1.5 4.5H11.5M1.5 8.5H11.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

function GreaterThanEqualIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 13 13"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M2 3L10 6L2 9M2 11.5H11"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function LessThanEqualIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 13 13"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M11 3L3 6L11 9M2 11.5H11"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// ============================================================================
// Types
// ============================================================================

export type AmountDirection = "any" | "in" | "out"

export interface AmountFilterValues {
  direction?: AmountDirection
  exactAmount?: number
  minAmount?: number
  maxAmount?: number
}

export interface AmountFilterDropdownProps {
  /** Whether the dropdown is open */
  open: boolean
  /** Callback when dropdown should close */
  onClose: () => void
  /** Current filter values */
  values?: AmountFilterValues
  /** Callback when values change */
  onValuesChange?: (values: AmountFilterValues) => void
  /** Additional className for the dropdown */
  className?: string
}

// ============================================================================
// Sub-components
// ============================================================================

const directionOptions: RadioOption<AmountDirection>[] = [
  { value: "any", label: "Any" },
  { value: "in", label: "In", description: "(e.g. deposits, refunds)" },
  { value: "out", label: "Out", description: "(e.g. purchases, charges)" },
]

interface AmountInputProps {
  label: string
  icon: React.ReactNode
  value: string
  onChange: (value: string) => void
  placeholder?: string
  focused?: boolean
  onFocus?: () => void
  onBlur?: () => void
}

function AmountInput({ label, icon, value, onChange, placeholder, focused, onFocus, onBlur }: AmountInputProps) {
  return (
    <div className="ds-text-input-container">
      <label 
        className={cn("ds-text-input-label", focused && "focused")}
        style={{ color: focused ? "#4354c8" : "#535461" }}
      >
        {label}
      </label>
      <div 
        className={cn("ds-text-input-wrapper", focused && "focused")}
        style={{
          height: 40,
          padding: "0 12px 0 0",
          backgroundColor: focused ? "white" : "#fbfcfd",
          border: "1px solid rgba(112, 115, 147, 0.16)",
          borderBottomWidth: focused ? 2 : 1,
          borderBottomColor: focused ? "#5266eb" : "rgba(112, 115, 147, 0.16)",
        }}
      >
        {/* Icon prefix */}
        <span 
          className="ds-text-input-affix"
          style={{
            width: 40,
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#70707d",
            flexShrink: 0,
          }}
        >
          {icon}
        </span>
        {/* Input */}
        <input
          type="text"
          inputMode="decimal"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder={placeholder}
          className="ds-text-input-field"
          style={{
            flex: 1,
            height: "100%",
            backgroundColor: "transparent",
            border: "none",
            outline: "none",
            fontFamily: "var(--font-sans)",
            fontSize: 15,
            lineHeight: "24px",
            color: "#363644",
          }}
        />
      </div>
    </div>
  )
}

// ============================================================================
// AmountFilterDropdown Component
// ============================================================================

export function AmountFilterDropdown({
  open,
  onClose,
  values = {},
  onValuesChange,
  className,
  anchorEl,
}: AmountFilterDropdownProps & { anchorEl?: HTMLElement | null }) {
  const [direction, setDirection] = useState<AmountDirection>(values.direction || "any")
  const [exactAmount, setExactAmount] = useState(values.exactAmount?.toString() || "")
  const [minAmount, setMinAmount] = useState(values.minAmount?.toString() || "")
  const [maxAmount, setMaxAmount] = useState(values.maxAmount?.toString() || "")
  const [focusedField, setFocusedField] = useState<string | null>(null)
  const ref = useRef<HTMLDivElement>(null)

  // Update internal state when props change
  useEffect(() => {
    setDirection(values.direction || "any")
    setExactAmount(values.exactAmount?.toString() || "")
    setMinAmount(values.minAmount?.toString() || "")
    setMaxAmount(values.maxAmount?.toString() || "")
  }, [values])

  // Handle click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node
      // Don't close if clicking inside the dropdown or on the anchor element (chip container)
      if (ref.current && !ref.current.contains(target) && 
          anchorEl && !anchorEl.contains(target)) {
        onClose()
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [open, onClose, anchorEl])

  const parseAmount = (str: string): number | undefined => {
    const cleaned = str.replace(/[^0-9.]/g, "")
    const num = parseFloat(cleaned)
    return isNaN(num) ? undefined : num
  }

  const handleDirectionChange = (newDirection: AmountDirection) => {
    setDirection(newDirection)
    onValuesChange?.({
      ...values,
      direction: newDirection,
    })
  }

  const handleExactAmountChange = (value: string) => {
    setExactAmount(value)
    onValuesChange?.({
      ...values,
      exactAmount: parseAmount(value),
    })
  }

  const handleMinAmountChange = (value: string) => {
    setMinAmount(value)
    onValuesChange?.({
      ...values,
      minAmount: parseAmount(value),
    })
  }

  const handleMaxAmountChange = (value: string) => {
    setMaxAmount(value)
    onValuesChange?.({
      ...values,
      maxAmount: parseAmount(value),
    })
  }

  if (!open) return null

  return (
    <div
      ref={ref}
      className={cn("absolute z-50 bg-white rounded-lg p-6", className)}
      style={{
        top: 35,
        left: -1,
        width: 376,
        boxShadow: "0px 1px 4px 0px rgba(183,187,219,0.14), 0px 0px 1px 0px rgba(175,178,206,0.9), 0px 8px 12px 0px rgba(14,14,45,0.08), 0px 14px 20px 0px rgba(4,4,52,0.02)",
      }}
    >
      <div className="flex flex-col gap-4">
        {/* Direction radio group */}
        <DSRadioGroup
          label="Direction"
          options={directionOptions}
          value={direction}
          onChange={handleDirectionChange}
        />

        {/* Specific amount input */}
        <AmountInput
          label="Specific amount"
          icon={<EqualsIcon />}
          value={exactAmount}
          onChange={handleExactAmountChange}
          placeholder=""
          focused={focusedField === "exact"}
          onFocus={() => setFocusedField("exact")}
          onBlur={() => setFocusedField(null)}
        />

        {/* At least input */}
        <AmountInput
          label="At least"
          icon={<GreaterThanEqualIcon />}
          value={minAmount}
          onChange={handleMinAmountChange}
          placeholder=""
          focused={focusedField === "min"}
          onFocus={() => setFocusedField("min")}
          onBlur={() => setFocusedField(null)}
        />

        {/* No more than input */}
        <AmountInput
          label="No more than"
          icon={<LessThanEqualIcon />}
          value={maxAmount}
          onChange={handleMaxAmountChange}
          placeholder=""
          focused={focusedField === "max"}
          onFocus={() => setFocusedField("max")}
          onBlur={() => setFocusedField(null)}
        />
      </div>
    </div>
  )
}


// ============================================================================
// Combined AmountFilter component (Chip + Dropdown)
// ============================================================================

export interface AmountFilterProps {
  /** Current filter values */
  values?: AmountFilterValues
  /** Callback when values change */
  onValuesChange?: (values: AmountFilterValues) => void
  /** Additional className */
  className?: string
}

export function AmountFilter({
  values = {},
  onValuesChange,
  className,
}: AmountFilterProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [internalValues, setInternalValues] = useState<AmountFilterValues>(values)
  const containerRef = useRef<HTMLDivElement>(null)

  // Update internal values when props change
  useEffect(() => {
    setInternalValues(values)
  }, [values])

  const handleValuesChange = (newValues: AmountFilterValues) => {
    setInternalValues(newValues)
    onValuesChange?.(newValues)
  }

  const handleClear = () => {
    const emptyValues: AmountFilterValues = {}
    setInternalValues(emptyValues)
    onValuesChange?.(emptyValues)
  }

  // Get display value based on current filter values
  const getDisplayValue = (): string | undefined => {
    const parts: string[] = []

    // Direction
    if (internalValues.direction && internalValues.direction !== "any") {
      parts.push(internalValues.direction === "in" ? "Money In" : "Money Out")
    }

    // Exact amount
    if (internalValues.exactAmount !== undefined) {
      parts.push(`=$${internalValues.exactAmount.toLocaleString()}`)
    }

    // Min amount
    if (internalValues.minAmount !== undefined) {
      parts.push(`≥$${internalValues.minAmount.toLocaleString()}`)
    }

    // Max amount
    if (internalValues.maxAmount !== undefined) {
      parts.push(`≤$${internalValues.maxAmount.toLocaleString()}`)
    }

    if (parts.length === 0) return undefined
    return parts.join(", ")
  }

  const displayValue = getDisplayValue()
  const hasValue = !!displayValue

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <Chip
        label={displayValue || "Amount"}
        variant={hasValue ? "selected" : "default"}
        trailingAction={hasValue ? "clear" : "dropdown"}
        isOpen={isOpen && !hasValue}
        onClick={hasValue ? undefined : () => setIsOpen(!isOpen)}
        onClear={handleClear}
      />
      <AmountFilterDropdown
        open={isOpen}
        onClose={() => setIsOpen(false)}
        values={internalValues}
        onValuesChange={handleValuesChange}
        anchorEl={containerRef.current}
      />
    </div>
  )
}

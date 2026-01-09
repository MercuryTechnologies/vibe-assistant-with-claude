"use client"

import * as React from "react"
import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Chip } from "./chip"

// ============================================================================
// Icons
// ============================================================================

function ChevronLeftIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 320 512" fill="currentColor">
      <path d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l192 192c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L77.3 256 246.6 86.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-192 192z" />
    </svg>
  )
}

function ChevronDownIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 512 512" fill="currentColor">
      <path d="M233.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L256 338.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z" />
    </svg>
  )
}

// ============================================================================
// Types
// ============================================================================

export type DatePreset = "all_time" | "this_month" | "last_month" | "this_quarter" | "last_quarter" | "this_year" | "last_year" | "custom"

export interface DateRange {
  from?: { month: number; year: number }
  to?: { month: number; year: number }
}

export interface DateFilterDropdownProps {
  /** Whether the dropdown is open */
  open: boolean
  /** Callback when dropdown should close */
  onClose: () => void
  /** Currently selected preset */
  preset?: DatePreset
  /** Custom date range when preset is "custom" */
  dateRange?: DateRange
  /** Callback when preset changes */
  onPresetChange?: (preset: DatePreset) => void
  /** Callback when date range changes */
  onDateRangeChange?: (range: DateRange) => void
  /** Additional className for the dropdown */
  className?: string
}

// ============================================================================
// Helper functions
// ============================================================================

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

const PRESETS: { value: DatePreset; label: string }[] = [
  { value: "all_time", label: "All time" },
  { value: "this_month", label: "This month" },
  { value: "last_month", label: "Last month" },
  { value: "this_quarter", label: "This quarter" },
  { value: "last_quarter", label: "Last quarter" },
  { value: "this_year", label: "This year" },
  { value: "last_year", label: "Last year" },
  { value: "custom", label: "Custom" },
]

function getPresetLabel(preset: DatePreset): string {
  return PRESETS.find(p => p.value === preset)?.label || "All time"
}

function formatMonthYear(month?: number, year?: number): string {
  if (month === undefined || year === undefined) return ""
  return `${MONTHS[month]} ${year}`
}

// ============================================================================
// Sub-components
// ============================================================================

interface PresetSelectProps {
  value: DatePreset
  onChange: (value: DatePreset) => void
}

function PresetSelect({ value, onChange }: PresetSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          height: '36px',
          padding: '0 12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#fbfcfd',
          border: '1px solid rgba(112, 115, 147, 0.16)',
          borderRadius: '8px',
          fontFamily: 'var(--font-sans)',
          fontSize: '15px',
          color: '#363644',
          cursor: 'pointer',
        }}
      >
        <span>{getPresetLabel(value)}</span>
        <ChevronDownIcon />
      </button>
      
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          marginTop: '4px',
          zIndex: 10,
          backgroundColor: 'white',
          borderRadius: '8px',
          border: '1px solid rgba(112, 115, 147, 0.16)',
          boxShadow: '0px 1px 4px 0px rgba(183,187,219,0.14), 0px 0px 1px 0px rgba(175,178,206,0.9), 0px 8px 12px 0px rgba(14,14,45,0.08)',
          padding: '4px 0',
          overflow: 'hidden',
          fontFamily: 'var(--font-sans)',
        }}>
          {PRESETS.map((preset) => (
            <button
              key={preset.value}
              type="button"
              onClick={() => {
                onChange(preset.value)
                setIsOpen(false)
              }}
              style={{
                width: '100%',
                padding: '8px 12px',
                textAlign: 'left',
                fontFamily: 'var(--font-sans)',
                fontSize: '14px',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: value === preset.value ? '#5266eb' : '#363644',
                fontWeight: value === preset.value ? 500 : 400,
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(112, 115, 147, 0.06)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              {preset.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ============================================================================
// DateFilterDropdown Component
// ============================================================================

export function DateFilterDropdown({
  open,
  onClose,
  preset = "all_time",
  dateRange,
  onPresetChange,
  onDateRangeChange,
  className,
  anchorEl,
}: DateFilterDropdownProps & { anchorEl?: HTMLElement | null }) {
  const [internalPreset, setInternalPreset] = useState<DatePreset>(preset)
  const [internalRange, setInternalRange] = useState<DateRange>(dateRange || {})
  const [isSelectingFrom, setIsSelectingFrom] = useState(true)
  const currentYear = new Date().getFullYear()
  const [baseYear, setBaseYear] = useState(currentYear - 1)
  const ref = useRef<HTMLDivElement>(null)

  // Update internal state when props change
  useEffect(() => {
    setInternalPreset(preset)
  }, [preset])

  useEffect(() => {
    setInternalRange(dateRange || {})
  }, [dateRange])

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

  const handlePresetChange = (newPreset: DatePreset) => {
    setInternalPreset(newPreset)
    onPresetChange?.(newPreset)
    
    if (newPreset !== "custom") {
      setInternalRange({})
      onDateRangeChange?.({})
    }
  }

  const handleMonthSelect = (month: number, year: number) => {
    const newDate = { month, year }
    
    if (isSelectingFrom) {
      const newRange = { from: newDate, to: internalRange.to }
      setInternalRange(newRange)
      onDateRangeChange?.(newRange)
      setIsSelectingFrom(false)
      
      if (internalPreset !== "custom") {
        setInternalPreset("custom")
        onPresetChange?.("custom")
      }
    } else {
      const newRange = { from: internalRange.from, to: newDate }
      setInternalRange(newRange)
      onDateRangeChange?.(newRange)
      setIsSelectingFrom(true)
      
      if (internalPreset !== "custom") {
        setInternalPreset("custom")
        onPresetChange?.("custom")
      }
    }
  }

  const isMonthSelected = (month: number, year: number) => {
    if (internalRange.from?.month === month && internalRange.from?.year === year) return "from"
    if (internalRange.to?.month === month && internalRange.to?.year === year) return "to"
    return null
  }

  const isMonthInRange = (month: number, year: number) => {
    if (!internalRange.from || !internalRange.to) return false
    const fromDate = internalRange.from.year * 12 + internalRange.from.month
    const toDate = internalRange.to.year * 12 + internalRange.to.month
    const currentDate = year * 12 + month
    return currentDate > fromDate && currentDate < toDate
  }

  const navigateYears = (direction: "prev" | "next") => {
    setBaseYear(prev => direction === "prev" ? prev - 1 : prev + 1)
  }

  if (!open) return null

  const dropdownStyles: React.CSSProperties = {
    position: 'absolute',
    top: '100%',
    left: 0,
    marginTop: '4px',
    zIndex: 50,
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0px 1px 4px 0px rgba(183,187,219,0.14), 0px 0px 1px 0px rgba(175,178,206,0.9), 0px 8px 12px 0px rgba(14,14,45,0.08), 0px 14px 20px 0px rgba(4,4,52,0.02)',
    width: '360px',
    fontFamily: 'var(--font-sans)',
  }

  const inputStyles = (isActive: boolean, hasValue: boolean): React.CSSProperties => ({
    width: '100%',
    height: '36px',
    padding: '0 12px',
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'white',
    border: isActive ? '1px solid #5266eb' : '1px solid rgba(112, 115, 147, 0.16)',
    borderRadius: '8px',
    fontFamily: 'var(--font-sans)',
    fontSize: '15px',
    color: hasValue ? '#1e1e2a' : '#9d9da8',
    cursor: 'pointer',
    boxShadow: isActive ? '0 0 0 3px rgba(82, 102, 235, 0.1)' : 'none',
  })

  const monthButtonStyles = (selected: string | null, inRange: boolean): React.CSSProperties => ({
    height: '36px',
    padding: '0 12px',
    fontFamily: 'var(--font-sans)',
    fontSize: '14px',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    backgroundColor: selected ? '#5266eb' : inRange ? 'rgba(82, 102, 235, 0.1)' : 'transparent',
    color: selected ? 'white' : '#363644',
    transition: 'background-color 0.15s',
  })

  return (
    <div ref={ref} style={dropdownStyles} className={className}>
      {/* Show transactions for */}
      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', fontFamily: 'var(--font-sans)', fontSize: '14px', lineHeight: '20px', color: '#535461', marginBottom: '8px' }}>
          Show transactions for
        </label>
        <PresetSelect value={internalPreset} onChange={handlePresetChange} />
      </div>

      {/* Separator */}
      <div style={{ height: '1px', backgroundColor: 'rgba(112, 115, 147, 0.1)', marginBottom: '16px' }} />

      {/* From / To inputs */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', marginBottom: '24px' }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', fontFamily: 'var(--font-sans)', fontSize: '13px', lineHeight: '20px', color: '#535461', marginBottom: '6px' }}>
            From
          </label>
          <button
            type="button"
            onClick={() => setIsSelectingFrom(true)}
            style={inputStyles(isSelectingFrom, !!internalRange.from)}
          >
            {internalRange.from ? formatMonthYear(internalRange.from.month, internalRange.from.year) : ""}
          </button>
        </div>
        
        <span style={{ color: '#9d9da8', paddingBottom: '8px' }}>—</span>
        
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', fontFamily: 'var(--font-sans)', fontSize: '13px', lineHeight: '20px', color: '#535461', marginBottom: '6px' }}>
            To
          </label>
          <button
            type="button"
            onClick={() => setIsSelectingFrom(false)}
            style={inputStyles(!isSelectingFrom, !!internalRange.to)}
          >
            {internalRange.to ? formatMonthYear(internalRange.to.month, internalRange.to.year) : ""}
          </button>
        </div>
      </div>

      {/* Year headers with navigation */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
        <button
          type="button"
          onClick={() => navigateYears("prev")}
          style={{
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            border: 'none',
            backgroundColor: 'transparent',
            cursor: 'pointer',
            color: '#363644',
          }}
        >
          <ChevronLeftIcon />
        </button>
        
        <div style={{ flex: 1, textAlign: 'center', fontFamily: 'var(--font-sans)', fontSize: '14px', fontWeight: 500, color: '#1e1e2a' }}>
          {baseYear}
        </div>
        
        <div style={{ width: '32px' }} />
        
        <div style={{ flex: 1, textAlign: 'center', fontFamily: 'var(--font-sans)', fontSize: '14px', fontWeight: 500, color: '#1e1e2a' }}>
          {baseYear + 1}
        </div>
        
        <div style={{ width: '32px' }} />
      </div>

      {/* Month grids */}
      <div style={{ display: 'flex', gap: '16px' }}>
        {/* Left year grid */}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px 4px' }}>
            {MONTHS.map((monthName, monthIndex) => {
              const selected = isMonthSelected(monthIndex, baseYear)
              const inRange = isMonthInRange(monthIndex, baseYear)
              return (
                <button
                  key={monthName}
                  type="button"
                  onClick={() => handleMonthSelect(monthIndex, baseYear)}
                  style={monthButtonStyles(selected, inRange)}
                  onMouseEnter={(e) => {
                    if (!selected) e.currentTarget.style.backgroundColor = 'rgba(112, 115, 147, 0.06)'
                  }}
                  onMouseLeave={(e) => {
                    if (!selected && !inRange) e.currentTarget.style.backgroundColor = 'transparent'
                    else if (inRange && !selected) e.currentTarget.style.backgroundColor = 'rgba(82, 102, 235, 0.1)'
                  }}
                >
                  {monthName}
                </button>
              )
            })}
          </div>
        </div>

        {/* Right year grid */}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px 4px' }}>
            {MONTHS.map((monthName, monthIndex) => {
              const selected = isMonthSelected(monthIndex, baseYear + 1)
              const inRange = isMonthInRange(monthIndex, baseYear + 1)
              return (
                <button
                  key={monthName}
                  type="button"
                  onClick={() => handleMonthSelect(monthIndex, baseYear + 1)}
                  style={monthButtonStyles(selected, inRange)}
                  onMouseEnter={(e) => {
                    if (!selected) e.currentTarget.style.backgroundColor = 'rgba(112, 115, 147, 0.06)'
                  }}
                  onMouseLeave={(e) => {
                    if (!selected && !inRange) e.currentTarget.style.backgroundColor = 'transparent'
                    else if (inRange && !selected) e.currentTarget.style.backgroundColor = 'rgba(82, 102, 235, 0.1)'
                  }}
                >
                  {monthName}
                </button>
              )
            })}
          </div>
        </div>
      </div>
      
    </div>
  )
}


// ============================================================================
// Combined DateFilter component (Chip + Dropdown)
// ============================================================================

export interface DateFilterProps {
  /** Currently selected preset */
  preset?: DatePreset
  /** Custom date range when preset is "custom" */
  dateRange?: DateRange
  /** Callback when preset changes */
  onPresetChange?: (preset: DatePreset) => void
  /** Callback when date range changes */
  onDateRangeChange?: (range: DateRange) => void
  /** Additional className */
  className?: string
}

export function DateFilter({
  preset = "all_time",
  dateRange,
  onPresetChange,
  onDateRangeChange,
  className,
}: DateFilterProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedPreset, setSelectedPreset] = useState<DatePreset>(preset)
  const [selectedRange, setSelectedRange] = useState<DateRange>(dateRange || {})
  const containerRef = useRef<HTMLDivElement>(null)

  const handlePresetChange = (newPreset: DatePreset) => {
    setSelectedPreset(newPreset)
    onPresetChange?.(newPreset)
  }

  const handleRangeChange = (newRange: DateRange) => {
    setSelectedRange(newRange)
    onDateRangeChange?.(newRange)
  }

  const handleClear = () => {
    setSelectedPreset("all_time")
    setSelectedRange({})
    onPresetChange?.("all_time")
    onDateRangeChange?.({})
  }

  // Get display value based on preset or range
  const getDisplayValue = () => {
    if (selectedPreset === "all_time") return undefined
    if (selectedPreset === "custom" && selectedRange.from && selectedRange.to) {
      return `${formatMonthYear(selectedRange.from.month, selectedRange.from.year)} - ${formatMonthYear(selectedRange.to.month, selectedRange.to.year)}`
    }
    if (selectedPreset !== "all_time") {
      return getPresetLabel(selectedPreset)
    }
    return undefined
  }

  const displayValue = getDisplayValue()
  const hasValue = !!displayValue

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <Chip
        label={displayValue || "Date"}
        variant={hasValue ? "selected" : "default"}
        trailingAction={hasValue ? "clear" : "dropdown"}
        isOpen={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        onClear={handleClear}
      />
      <DateFilterDropdown
        open={isOpen}
        onClose={() => setIsOpen(false)}
        preset={selectedPreset}
        dateRange={selectedRange}
        onPresetChange={handlePresetChange}
        onDateRangeChange={handleRangeChange}
        anchorEl={containerRef.current}
      />
    </div>
  )
}

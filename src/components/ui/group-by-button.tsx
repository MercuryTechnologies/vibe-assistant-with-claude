"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { InlineCombobox, type ComboboxOption } from "@/components/ui/inline-combobox"
import { DSButton } from "@/components/ui/ds-button"

// ============================================================================
// Icons
// ============================================================================

function GridDividersIcon({ className }: { className?: string }) {
  return (
    <svg
      style={{ width: "11px", height: "11px", flexShrink: 0, color: "var(--ds-icon-default)" }}
      className={className}
      viewBox="0 0 640 512"
      fill="currentColor"
    >
      <path d="M64 96l512 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L64 32C46.3 32 32 46.3 32 64s14.3 32 32 32zM41.4 233.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L128 237.3 128 448c0 17.7 14.3 32 32 32s32-14.3 32-32l0-210.7 41.4 41.4c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-96-96c-12.5-12.5-32.8-12.5-45.3 0l-96 96zm320 45.3c12.5 12.5 32.8 12.5 45.3 0L448 237.3 448 448c0 17.7 14.3 32 32 32s32-14.3 32-32l0-210.7 41.4 41.4c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-96-96c-12.5-12.5-32.8-12.5-45.3 0l-96 96c-12.5 12.5-12.5 32.8 0 45.3z" />
    </svg>
  )
}

// ============================================================================
// Types
// ============================================================================

export type GroupByOption = "none" | "date" | "category" | "account" | "method"

export interface GroupByButtonProps {
  /** Current group by value */
  value?: GroupByOption
  /** Callback when value changes */
  onChange?: (value: GroupByOption) => void
  /** Whether the menu is open (controlled) */
  open?: boolean
  /** Callback when open state changes */
  onOpenChange?: (open: boolean) => void
  /** Additional className */
  className?: string
  /** Tooltip text */
  tooltip?: string
}

// ============================================================================
// Options
// ============================================================================

const groupByOptions: ComboboxOption[] = [
  { value: "none", label: "No grouping" },
  { value: "date", label: "Date" },
  { value: "category", label: "Category" },
  { value: "account", label: "Account" },
  { value: "method", label: "Method" },
]

// ============================================================================
// GroupByButton Component
// ============================================================================

export function GroupByButton({
  value = "none",
  onChange,
  open,
  onOpenChange,
  className,
  tooltip = "Group",
}: GroupByButtonProps) {
  const [internalOpen, setInternalOpen] = React.useState(false)
  
  const isControlled = open !== undefined
  const isOpen = isControlled ? open : internalOpen
  const setIsOpen = isControlled ? onOpenChange : setInternalOpen

  const hasGrouping = value !== "none"

  const handleGroupByChange = (newValue: string) => {
    onChange?.(newValue as GroupByOption)
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <div className={cn("relative", className)} title={tooltip}>
          <DSButton
            variant="tertiary"
            size="small"
            iconOnly
            data-state={isOpen ? "open" : "closed"}
            className="ds-menu-trigger"
          >
            <GridDividersIcon />
          </DSButton>
          {/* Indicator dot when grouping is active */}
          {hasGrouping && (
            <div
              className="absolute rounded-full pointer-events-none"
              style={{
                top: 7,
                right: 7,
                width: 6,
                height: 6,
                backgroundColor: "var(--ds-bg-primary)",
              }}
              aria-hidden="true"
            />
          )}
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={4}
        style={{ width: 288, backgroundColor: "var(--ds-bg-default)", border: "none" }}
        className={cn(
          "px-1 pt-1 pb-2 rounded-md shadow-lg"
        )}
      >
        {/* Group by label */}
        <div className="px-2 pt-2 pb-0">
          <span className="text-label">Group by</span>
        </div>
        
        {/* Group by combobox */}
        <div className="px-2 py-1">
          <InlineCombobox
            value={value}
            options={groupByOptions}
            onChange={handleGroupByChange}
            fullWidth
          />
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// ============================================================================
// Exports
// ============================================================================

export { groupByOptions }

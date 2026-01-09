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

function ArrowDownArrowUpIcon({ className }: { className?: string }) {
  return (
    <svg
      style={{ width: "11px", height: "11px", flexShrink: 0, color: "var(--ds-icon-default)" }}
      className={className}
      viewBox="0 0 576 512"
      fill="currentColor"
    >
      <path d="M151.6 42.4C145.5 35.8 136 32 126.1 32s-19.4 3.8-25.5 10.4l-88 96c-11.9 13-11.1 33.3 2 45.2s33.3 11.1 45.2-2L96 142.3V448c0 17.7 14.3 32 32 32s32-14.3 32-32V142.3l36.2 39.4c11.9 13 32.2 13.9 45.2 2s13.9-32.2 2-45.2l-92.8-96zM320 32c-17.7 0-32 14.3-32 32s14.3 32 32 32h32c17.7 0 32-14.3 32-32s-14.3-32-32-32H320zm0 128c-17.7 0-32 14.3-32 32s14.3 32 32 32h96c17.7 0 32-14.3 32-32s-14.3-32-32-32H320zm0 128c-17.7 0-32 14.3-32 32s14.3 32 32 32H480c17.7 0 32-14.3 32-32s-14.3-32-32-32H320zm0 128c-17.7 0-32 14.3-32 32s14.3 32 32 32H544c17.7 0 32-14.3 32-32s-14.3-32-32-32H320z" />
    </svg>
  )
}

// ============================================================================
// Types
// ============================================================================

export type SortField = "date" | "amount" | "description" | "category" | "account"
export type SortDirection = "asc" | "desc"

export interface SortValue {
  field: SortField
  direction: SortDirection
}

export interface SortButtonProps {
  /** Current sort value */
  value?: SortValue
  /** Callback when value changes */
  onChange?: (value: SortValue) => void
  /** Whether the menu is open (controlled) */
  open?: boolean
  /** Callback when open state changes */
  onOpenChange?: (open: boolean) => void
  /** Additional className */
  className?: string
  /** Tooltip text */
  tooltip?: string
  /** Custom sort field options */
  fieldOptions?: ComboboxOption[]
  /** Custom direction options */
  directionOptions?: ComboboxOption[]
}

// ============================================================================
// Default Options
// ============================================================================

const defaultFieldOptions: ComboboxOption[] = [
  { value: "date", label: "Date" },
  { value: "amount", label: "Amount" },
  { value: "description", label: "Description" },
  { value: "category", label: "Category" },
  { value: "account", label: "Account" },
]

const defaultDirectionOptions: ComboboxOption[] = [
  { value: "desc", label: "New to Old" },
  { value: "asc", label: "Old to New" },
]

// Direction labels that change based on field type
const getDirectionOptions = (field: SortField): ComboboxOption[] => {
  switch (field) {
    case "amount":
      return [
        { value: "desc", label: "High to Low" },
        { value: "asc", label: "Low to High" },
      ]
    case "description":
    case "category":
    case "account":
      return [
        { value: "asc", label: "A to Z" },
        { value: "desc", label: "Z to A" },
      ]
    case "date":
    default:
      return defaultDirectionOptions
  }
}

// ============================================================================
// SortButton Component
// ============================================================================

export function SortButton({
  value = { field: "date", direction: "desc" },
  onChange,
  open,
  onOpenChange,
  className,
  tooltip = "Sort",
  fieldOptions = defaultFieldOptions,
  directionOptions,
}: SortButtonProps) {
  const [internalOpen, setInternalOpen] = React.useState(false)
  
  const isControlled = open !== undefined
  const isOpen = isControlled ? open : internalOpen
  const setIsOpen = isControlled ? onOpenChange : setInternalOpen

  // Get direction options based on current field
  const currentDirectionOptions = directionOptions || getDirectionOptions(value.field)

  const handleFieldChange = (newField: string) => {
    const field = newField as SortField
    // Get appropriate direction options for new field
    const newDirectionOptions = getDirectionOptions(field)
    // Keep same direction if it exists in new options, otherwise use first option
    const directionExists = newDirectionOptions.some(opt => opt.value === value.direction)
    const direction = directionExists ? value.direction : (newDirectionOptions[0]?.value as SortDirection) || "desc"
    
    onChange?.({ field, direction })
  }

  const handleDirectionChange = (newDirection: string) => {
    onChange?.({ field: value.field, direction: newDirection as SortDirection })
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
            <ArrowDownArrowUpIcon />
          </DSButton>
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
        {/* Sort by label */}
        <div className="px-2 pt-2 pb-0">
          <span className="text-label">Sort by</span>
        </div>
        
        {/* Sort field and direction comboboxes */}
        <div className="flex gap-2 px-2 py-1">
          <div className="flex-1">
            <InlineCombobox
              value={value.field}
              options={fieldOptions}
              onChange={handleFieldChange}
              fullWidth
            />
          </div>
          <div className="flex-1">
            <InlineCombobox
              value={value.direction}
              options={currentDirectionOptions}
              onChange={handleDirectionChange}
              fullWidth
            />
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// ============================================================================
// Exports
// ============================================================================

export { defaultFieldOptions, defaultDirectionOptions, getDirectionOptions }

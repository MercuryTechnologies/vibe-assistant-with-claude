"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { DSButton } from "@/components/ui/ds-button"
import { DSCombobox, type ComboboxOption } from "@/components/ui/ds-combobox"
import { Icon } from "@/components/ui/icon"
import { faEllipsisVertical, faXmark } from "@fortawesome/free-solid-svg-icons"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// ============================================================================
// Types
// ============================================================================

export interface BulkActionBarProps {
  /** Number of selected items */
  selectedCount: number
  /** Whether the bar is visible */
  isVisible: boolean
  /** Callback when dismiss button is clicked */
  onDismiss: () => void
  /** Category options for the combobox */
  categoryOptions?: ComboboxOption[]
  /** Current category value */
  categoryValue?: string
  /** Callback when category changes */
  onCategoryChange?: (value: string) => void
  /** Custom actions for overflow menu */
  overflowActions?: {
    label: string
    icon?: React.ReactNode
    onClick: () => void
  }[]
  /** Additional className */
  className?: string
}

// ============================================================================
// BulkActionBar Component
// ============================================================================

export function BulkActionBar({
  selectedCount,
  isVisible,
  onDismiss,
  categoryOptions = [],
  categoryValue,
  onCategoryChange,
  overflowActions = [],
  className,
}: BulkActionBarProps) {
  const [overflowOpen, setOverflowOpen] = React.useState(false)

  if (!isVisible || selectedCount === 0) {
    return null
  }

  return (
    <div
      className={cn("bulk-action-bar-container", className)}
      role="toolbar"
      aria-label={`${selectedCount} item${selectedCount === 1 ? '' : 's'} selected`}
    >
      <div className="bulk-action-bar">
        {/* Selection count */}
        <div className="bulk-action-bar-content">
          <span className="bulk-action-bar-count text-body">
            <span>{selectedCount}</span>
            <span> selected</span>
          </span>
        </div>

        {/* GL Code Combobox */}
        {categoryOptions.length > 0 && (
          <div className="bulk-action-bar-combobox">
            <DSCombobox
              variant="inline"
              value={categoryValue}
              options={categoryOptions}
              onChange={onCategoryChange}
              placeholder="GL Code"
              triggerClassName="bulk-action-bar-combobox-trigger"
            />
          </div>
        )}

        {/* Overflow menu button */}
        {overflowActions.length > 0 && (
          <DropdownMenu open={overflowOpen} onOpenChange={setOverflowOpen}>
            <DropdownMenuTrigger asChild>
              <button
                className={cn(
                  "bulk-action-bar-overflow-btn",
                  overflowOpen && "open"
                )}
                aria-label="More actions"
              >
                <Icon
                  icon={faEllipsisVertical}
                  size="small"
                  style={{
                    color: overflowOpen
                      ? "var(--ds-icon-primary)"
                      : "var(--ds-text-default)",
                  }}
                />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              side="top"
              sideOffset={8}
              className="bulk-action-bar-dropdown"
            >
              {overflowActions.map((action, index) => (
                <DropdownMenuItem
                  key={index}
                  onClick={action.onClick}
                  className="bulk-action-bar-dropdown-item"
                >
                  {action.icon && (
                    <span className="bulk-action-bar-dropdown-icon">
                      {action.icon}
                    </span>
                  )}
                  <span>{action.label}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Divider */}
        <div className="bulk-action-bar-divider" />

        {/* Dismiss button */}
        <DSButton
          variant="secondary"
          size="small"
          iconOnly
          onClick={onDismiss}
          aria-label="Dismiss selection"
        >
          <Icon
            icon={faXmark}
            size="small"
            style={{ color: "var(--ds-text-default)" }}
          />
        </DSButton>
      </div>
    </div>
  )
}

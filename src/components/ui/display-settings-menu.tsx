"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { InlineCombobox, type ComboboxOption } from "@/components/ui/inline-combobox"
import { ToggleSwitch } from "@/components/ui/toggle-switch"
import { DSButton } from "@/components/ui/ds-button"
import { type GroupByOption, groupByOptions as groupByOptionsFromButton } from "@/components/ui/group-by-button"

// ============================================================================
// Icons
// ============================================================================

function SlidersIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg
      style={{
        width: "11px",
        height: "11px",
        flexShrink: 0,
        color: "var(--ds-icon-default)",
        ...(style ?? {}),
      }}
      className={className}
      viewBox="0 0 512 512"
      fill="currentColor"
    >
      <path d="M0 416c0 17.7 14.3 32 32 32l54.7 0c12.3 28.3 40.5 48 73.3 48s61-19.7 73.3-48L480 448c17.7 0 32-14.3 32-32s-14.3-32-32-32l-246.7 0c-12.3-28.3-40.5-48-73.3-48s-61 19.7-73.3 48L32 384c-17.7 0-32 14.3-32 32zm128 0a32 32 0 1 1 64 0 32 32 0 1 1 -64 0zM320 256a32 32 0 1 1 64 0 32 32 0 1 1 -64 0zm32-80c-32.8 0-61 19.7-73.3 48L32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l246.7 0c12.3 28.3 40.5 48 73.3 48s61-19.7 73.3-48l54.7 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-54.7 0c-12.3-28.3-40.5-48-73.3-48zM192 128a32 32 0 1 1 0-64 32 32 0 1 1 0 64zm73.3-64C253 35.7 224.8 16 192 16s-61 19.7-73.3 48L32 64C14.3 64 0 78.3 0 96s14.3 32 32 32l86.7 0c12.3 28.3 40.5 48 73.3 48s61-19.7 73.3-48L480 128c17.7 0 32-14.3 32-32s-14.3-32-32-32L265.3 64z" />
    </svg>
  )
}

function LineChartIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg
      style={{
        width: "13px",
        height: "13px",
        flexShrink: 0,
        color: "var(--ds-icon-default)",
        ...(style ?? {}),
      }}
      className={className}
      viewBox="0 0 512 512"
      fill="currentColor"
    >
      <path d="M64 64c0-17.7-14.3-32-32-32S0 46.3 0 64V400c0 44.2 35.8 80 80 80H480c17.7 0 32-14.3 32-32s-14.3-32-32-32H80c-8.8 0-16-7.2-16-16V64zm406.6 86.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L320 210.7l-57.4-57.4c-12.5-12.5-32.8-12.5-45.3 0l-112 112c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L240 221.3l57.4 57.4c12.5 12.5 32.8 12.5 45.3 0l128-128z" />
    </svg>
  )
}

function ColumnsIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg
      style={{
        width: "13px",
        height: "13px",
        flexShrink: 0,
        color: "var(--ds-icon-default)",
        ...(style ?? {}),
      }}
      className={className}
      viewBox="0 0 512 512"
      fill="currentColor"
    >
      <path d="M0 96C0 60.7 28.7 32 64 32H448c35.3 0 64 28.7 64 64V416c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V96zm64 0v64h64V96H64zm384 0H192v64H448V96zM64 224v64h64V224H64zm384 0H192v64H448V224zM64 352v64h64V352H64zm384 0H192v64H448V352z" />
    </svg>
  )
}

function ClockIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg
      style={{
        width: "13px",
        height: "13px",
        flexShrink: 0,
        color: "var(--ds-icon-default)",
        ...(style ?? {}),
      }}
      className={className}
      viewBox="0 0 512 512"
      fill="currentColor"
    >
      <path d="M256 0a256 256 0 1 1 0 512A256 256 0 1 1 256 0zM232 120V256c0 8 4 15.5 10.7 20l96 64c11 7.4 25.9 4.4 33.3-6.7s4.4-25.9-6.7-33.3L280 243.2V120c0-13.3-10.7-24-24-24s-24 10.7-24 24z" />
    </svg>
  )
}

function ChevronRightIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg
      style={{
        width: "13px",
        height: "13px",
        flexShrink: 0,
        color: "var(--ds-icon-default)",
        ...(style ?? {}),
      }}
      className={className}
      viewBox="0 0 320 512"
      fill="currentColor"
    >
      <path d="M310.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-192 192c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L242.7 256 73.4 86.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l192 192z" />
    </svg>
  )
}

// ============================================================================
// Types
// ============================================================================

// GroupByOption is imported from group-by-button.tsx
export type { GroupByOption }
export type SortByOption = "date" | "amount" | "merchant"
export type SortDirection = "new-to-old" | "old-to-new" | "high-to-low" | "low-to-high" | "a-to-z" | "z-to-a"
export type TimeZone = "PST" | "EST" | "CST" | "MST" | "UTC"

export interface DisplaySettings {
  groupBy: GroupByOption
  sortBy: SortByOption
  sortDirection: SortDirection
  showGraph: boolean
  timeZone: TimeZone
}

export interface DisplaySettingsMenuProps {
  /** Current display settings */
  settings: DisplaySettings
  /** Callback when settings change */
  onSettingsChange: (settings: DisplaySettings) => void
  /** Whether the menu is open (controlled) */
  open?: boolean
  /** Callback when open state changes */
  onOpenChange?: (open: boolean) => void
  /** Additional className */
  className?: string
  /** Button variant */
  buttonVariant?: "icon" | "button"
  /** Trigger element (for custom triggers) */
  trigger?: React.ReactNode
}

// ============================================================================
// Options
// ============================================================================

// Use the shared groupByOptions from group-by-button
const groupByOptions = groupByOptionsFromButton

const sortByOptions: ComboboxOption[] = [
  { value: "date", label: "Date" },
  { value: "amount", label: "Amount" },
  { value: "merchant", label: "Merchant" },
]

const sortDirectionOptionsForDate: ComboboxOption[] = [
  { value: "new-to-old", label: "New to Old" },
  { value: "old-to-new", label: "Old to New" },
]

const sortDirectionOptionsForAmount: ComboboxOption[] = [
  { value: "high-to-low", label: "High to Low" },
  { value: "low-to-high", label: "Low to High" },
]

const sortDirectionOptionsForMerchant: ComboboxOption[] = [
  { value: "a-to-z", label: "A to Z" },
  { value: "z-to-a", label: "Z to A" },
]

const timeZoneOptions: ComboboxOption[] = [
  { value: "PST", label: "PST" },
  { value: "EST", label: "EST" },
  { value: "CST", label: "CST" },
  { value: "MST", label: "MST" },
  { value: "UTC", label: "UTC" },
]

// ============================================================================
// MenuDivider Component
// ============================================================================

function MenuDivider() {
  return (
    <div className="flex items-center justify-center w-full px-3 py-2">
      <div className="w-full" style={{ height: 1, backgroundColor: "var(--color-border-default)" }} />
    </div>
  )
}

// ============================================================================
// MenuRow Component (for icon + label + right content)
// ============================================================================

interface MenuRowProps {
  icon?: React.ReactNode
  label: string
  rightContent?: React.ReactNode
  onClick?: () => void
  className?: string
}

function MenuRow({ icon, label, rightContent, onClick, className }: MenuRowProps) {
  const Component = onClick ? "button" : "div"
  
  return (
    <Component
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={cn(
        "ds-display-settings-menu-row flex items-center justify-between w-full px-2 py-2 rounded-md",
        onClick && "cursor-pointer",
        className
      )}
    >
      <div className="flex items-center gap-1">
        {icon && (
          <span
            className="flex items-center justify-center w-6 h-6"
            style={{ color: "var(--ds-icon-secondary)" }}
          >
            {icon}
          </span>
        )}
        <span className="text-body whitespace-nowrap">
          {label}
        </span>
      </div>
      {rightContent}
    </Component>
  )
}

// ============================================================================
// DisplaySettingsMenu Component
// ============================================================================

export function DisplaySettingsMenu({
  settings,
  onSettingsChange,
  open,
  onOpenChange,
  className,
  buttonVariant = "icon",
  trigger,
}: DisplaySettingsMenuProps) {
  const [internalOpen, setInternalOpen] = React.useState(false)
  
  const isControlled = open !== undefined
  const isOpen = isControlled ? open : internalOpen
  const setIsOpen = isControlled ? onOpenChange : setInternalOpen

  const getSortDirectionOptions = (sortBy: SortByOption): ComboboxOption[] => {
    switch (sortBy) {
      case "date":
        return sortDirectionOptionsForDate
      case "amount":
        return sortDirectionOptionsForAmount
      case "merchant":
        return sortDirectionOptionsForMerchant
      default:
        return sortDirectionOptionsForDate
    }
  }

  const handleGroupByChange = (value: string) => {
    onSettingsChange({ ...settings, groupBy: value as GroupByOption })
  }

  const handleSortByChange = (value: string) => {
    const newSortBy = value as SortByOption
    // Reset sort direction when sort by changes
    const defaultDirection: SortDirection = 
      newSortBy === "date" ? "new-to-old" :
      newSortBy === "amount" ? "high-to-low" :
      "a-to-z"
    onSettingsChange({ ...settings, sortBy: newSortBy, sortDirection: defaultDirection })
  }

  const handleSortDirectionChange = (value: string) => {
    onSettingsChange({ ...settings, sortDirection: value as SortDirection })
  }

  const handleShowGraphChange = (checked: boolean) => {
    onSettingsChange({ ...settings, showGraph: checked })
  }

  const defaultTrigger = buttonVariant === "button" ? (
    <DSButton
      variant="tertiary"
      size="small"
      leadingIcon={<SlidersIcon />}
      data-state={isOpen ? "open" : "closed"}
    >
      Display
    </DSButton>
  ) : (
    <DSButton
      variant="tertiary"
      size="small"
      iconOnly
      data-state={isOpen ? "open" : "closed"}
    >
      <SlidersIcon />
    </DSButton>
  )

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        {trigger || defaultTrigger}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={4}
        style={{ width: 280, backgroundColor: "var(--ds-bg-default)", border: "none" }}
        className={cn(
          "p-1 rounded-md shadow-lg",
          className
        )}
      >
        {/* Group by section */}
        <div className="px-2 pt-2 pb-0">
          <span className="text-label">Group by</span>
        </div>
        <div className="px-2 py-1">
          <InlineCombobox
            value={settings.groupBy}
            options={groupByOptions}
            onChange={handleGroupByChange}
            fullWidth
          />
        </div>

        <MenuDivider />

        {/* Sort by section */}
        <div className="px-2 pt-1 pb-0">
          <span className="text-label">Sort by</span>
        </div>
        <div className="flex items-center gap-2 px-2 py-1">
          <InlineCombobox
            value={settings.sortBy}
            options={sortByOptions}
            onChange={handleSortByChange}
          />
          <InlineCombobox
            value={settings.sortDirection}
            options={getSortDirectionOptions(settings.sortBy)}
            onChange={handleSortDirectionChange}
          />
        </div>

        <MenuDivider />

        {/* Show graph toggle */}
        <MenuRow
          icon={<LineChartIcon />}
          label="Show graph"
          rightContent={
            <ToggleSwitch
              checked={settings.showGraph}
              onChange={handleShowGraphChange}
              aria-label="Show graph"
            />
          }
        />

        {/* Columns submenu trigger */}
        <MenuRow
          icon={<ColumnsIcon />}
          label="Columns"
          rightContent={<ChevronRightIcon style={{ color: "var(--ds-icon-secondary)" }} />}
          onClick={() => {
            // TODO: Open columns submenu
            console.log("Open columns submenu")
          }}
        />

        {/* Time Zone submenu trigger */}
        <div className="ds-submenu-trigger">
          <div className="flex items-center gap-1">
            <span
              className="flex items-center justify-center w-6 h-6"
              style={{ color: "var(--ds-icon-secondary)" }}
            >
              <ClockIcon />
            </span>
            <div className="flex items-center justify-between grow">
              <span className="text-body">Time Zone</span>
              <span className="text-label ml-2">{settings.timeZone}</span>
            </div>
          </div>
          <ChevronRightIcon style={{ color: "var(--ds-icon-secondary)" }} />
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// ============================================================================
// Default Settings Export
// ============================================================================

export const defaultDisplaySettings: DisplaySettings = {
  groupBy: "none",
  sortBy: "date",
  sortDirection: "new-to-old",
  showGraph: true,
  timeZone: "PST",
}

"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faBookmark } from "@fortawesome/free-regular-svg-icons"
import {
  faArrowUp,
  faSort,
  faSliders,
  faDownload,
  faChevronDown,
  faChevronUp,
  faXmark,
} from "@fortawesome/free-solid-svg-icons"
import { Chip } from "./chip"
import { DateFilter, type DatePreset, type DateRange } from "./date-filter-dropdown"
import { KeywordFilter, type KeywordOption } from "./keyword-filter-dropdown"
import { AmountFilter, type AmountFilterValues } from "./amount-filter-dropdown"
import { DSButton } from "./ds-button"
import { DisplaySettingsMenu, type DisplaySettings, defaultDisplaySettings } from "./display-settings-menu"
import { GroupByButton, type GroupByOption } from "./group-by-button"
import { SortButton, type SortValue } from "./sort-button"
import { FilterMenuButton, type FilterValues } from "./filter-menu"

// ============================================================================
// Icon Components (FontAwesome)
// ============================================================================

function BookmarkIcon({ className }: { className?: string }) {
  return <FontAwesomeIcon icon={faBookmark} style={{ width: '13px', height: '13px' }} className={className} />
}

function FilterIcon({ className }: { className?: string }) {
  return (
    <svg
      style={{ width: '11px', height: '11px' }}
      viewBox="0 0 512 512"
      fill="none"
      stroke="currentColor"
      strokeWidth="42"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M32 144h448M96 256h320M192 368h128" />
    </svg>
  )
}

function ArrowsUpToLineIcon({ className }: { className?: string }) {
  return <FontAwesomeIcon icon={faArrowUp} style={{ width: '11px', height: '11px', display: 'block' }} className={className} />
}

function SortIcon({ className }: { className?: string }) {
  return <FontAwesomeIcon icon={faSort} style={{ width: '11px', height: '11px' }} className={className} />
}

function SlidersIcon({ className }: { className?: string }) {
  return <FontAwesomeIcon icon={faSliders} style={{ width: '11px', height: '11px' }} className={className} />
}

function DownloadIcon({ className }: { className?: string }) {
  return <FontAwesomeIcon icon={faDownload} style={{ width: '11px', height: '11px' }} className={className} />
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <FontAwesomeIcon
      icon={faChevronDown}
      style={{ width: "13px", height: "13px", color: "var(--ds-icon-default)" }}
      className={className}
    />
  )
}

function ChevronUpIcon({ className }: { className?: string }) {
  return (
    <FontAwesomeIcon
      icon={faChevronUp}
      style={{ width: "13px", height: "13px", color: "var(--ds-icon-default)" }}
      className={className}
    />
  )
}

// ============================================================================
// DSToolbar Variants
// ============================================================================

const dsToolbarVariants = cva(
  "flex items-center justify-between w-full",
  {
    variants: {
      size: {
        sm: "h-10 gap-2",
        md: "h-11 gap-2",
        lg: "h-12 gap-3",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
)

// ============================================================================
// Sub-components
// ============================================================================

interface IconButtonProps {
  icon: React.ReactNode
  label?: string
  onClick?: () => void
  active?: boolean
  className?: string
}

function IconButton({ icon, label, onClick, active, className }: IconButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "ds-icon-button",
        label ? "px-3 pl-3 pr-4" : "px-1.5",
        active && "active",
        className
      )}
    >
      <span className={cn("flex items-center justify-center", label ? "" : "w-5")}>
        {icon}
      </span>
      {label && (
        <span className="text-body capitalize whitespace-nowrap">
          {label}
        </span>
      )}
    </button>
  )
}

function ToolbarDivider() {
  return (
    <div className="w-2 h-8 flex items-center justify-center shrink-0">
      <div className="h-4" style={{ width: 1, backgroundColor: "var(--color-border-emphasized)" }} />
    </div>
  )
}

function TimesIcon({ className }: { className?: string }) {
  return (
    <FontAwesomeIcon
      icon={faXmark}
      style={{ width: "13px", height: "13px", color: "var(--ds-icon-default)" }}
      className={className}
    />
  )
}

// ============================================================================
// QuickFilterDate Component
// ============================================================================

export interface QuickFilterDateProps {
  /** Currently selected value label (e.g., "This month") */
  value?: string
  /** Whether the filter is open */
  isOpen?: boolean
  /** Callback when clicked */
  onClick?: () => void
  /** Callback when clear button is clicked */
  onClear?: () => void
  /** Additional className */
  className?: string
}

export function QuickFilterDate({
  value,
  isOpen = false,
  onClick,
  onClear,
  className,
}: QuickFilterDateProps) {
  const hasValue = !!value
  
  return (
    <button
      type="button"
      onClick={hasValue ? undefined : onClick}
      data-has-value={hasValue ? "true" : "false"}
      data-open={isOpen ? "true" : "false"}
      className={cn(
        "ds-quickfilter-date flex items-center rounded-md shrink-0 pl-3 pr-0 py-1",
        className
      )}
    >
      <span
        className="text-body whitespace-nowrap"
        style={{
          color: isOpen || hasValue ? "var(--ds-text-title)" : "var(--ds-text-secondary)",
        }}
      >
        {hasValue ? value : "Date"}
      </span>
      <span
        className="w-8 h-full flex items-center justify-center p-1"
        onClick={hasValue ? (e) => { e.stopPropagation(); onClear?.(); } : undefined}
        role={hasValue ? "button" : undefined}
        tabIndex={hasValue ? 0 : undefined}
      >
        {hasValue ? (
          <TimesIcon />
        ) : isOpen ? (
          <ChevronUpIcon />
        ) : (
          <ChevronDownIcon />
        )}
      </span>
    </button>
  )
}

// ============================================================================
// Types
// ============================================================================

export interface QuickFilter {
  /** Unique identifier */
  id: string
  /** Display label */
  label: string
  /** Whether the filter is active */
  active?: boolean
  /** Selected value (for active state display) */
  value?: string
  /** Callback when clicked */
  onClick?: () => void
  /** Callback when cleared (for active filters) */
  onClear?: () => void
}

export interface DSToolbarProps extends VariantProps<typeof dsToolbarVariants> {
  /** Additional className */
  className?: string
  /** View menu label */
  viewMenuLabel?: string
  /** Callback when view menu is clicked */
  onViewMenuClick?: () => void
  /** Show filters button */
  showFilters?: boolean
  /** Callback when filters button is clicked */
  onFiltersClick?: () => void
  /** Active filter count for badge display */
  activeFilterCount?: number
  /** Current filter values for the FilterMenu */
  filterValues?: FilterValues
  /** Callback when filter values change */
  onFilterValuesChange?: (values: FilterValues) => void
  /** View name to display in filter menu footer */
  filterViewName?: string
  /** Quick filter chips */
  quickFilters?: QuickFilter[]
  /** Date filter preset */
  dateFilterPreset?: DatePreset
  /** Date filter custom range */
  dateFilterRange?: DateRange
  /** Callback when date filter preset changes */
  onDatePresetChange?: (preset: DatePreset) => void
  /** Callback when date filter range changes */
  onDateRangeChange?: (range: DateRange) => void
  /** Keyword filter search query */
  keywordSearchQuery?: string
  /** Keyword filter selected keywords */
  keywordSelectedKeywords?: string[]
  /** Callback when keyword search query changes */
  onKeywordSearchChange?: (query: string) => void
  /** Callback when keyword selection changes */
  onKeywordSelectionChange?: (keywords: string[]) => void
  /** Recent keyword options for the keyword filter */
  keywordRecentOptions?: KeywordOption[]
  /** Amount filter values */
  amountFilterValues?: AmountFilterValues
  /** Callback when amount filter values change */
  onAmountFilterChange?: (values: AmountFilterValues) => void
  /** Date filter value (when active, shows selected date like "This month") - deprecated, use dateFilterPreset */
  dateFilterValue?: string
  /** Callback when date filter is clicked - deprecated */
  onDateFilterClick?: () => void
  /** Callback when date filter is cleared - deprecated */
  onDateFilterClear?: () => void
  /** Whether date filter dropdown is open - deprecated */
  dateFilterOpen?: boolean
  /** Show group button */
  showGroupButton?: boolean
  /** Callback when group button is clicked - deprecated, use onGroupByChange */
  onGroupClick?: () => void
  /** Is grouping active - deprecated, use groupByValue */
  groupingActive?: boolean
  /** Current group by value */
  groupByValue?: GroupByOption
  /** Callback when group by value changes */
  onGroupByChange?: (value: GroupByOption) => void
  /** Show sort button */
  showSortButton?: boolean
  /** Callback when sort button is clicked - deprecated, use onSortValueChange */
  onSortClick?: () => void
  /** Current sort value */
  sortValue?: SortValue
  /** Callback when sort value changes */
  onSortValueChange?: (value: SortValue) => void
  /** Show display/settings button */
  showDisplayButton?: boolean
  /** Display button type */
  displayButtonType?: "icon" | "button"
  /** Callback when display button is clicked (deprecated - use displaySettings instead) */
  onDisplayClick?: () => void
  /** Display settings state */
  displaySettings?: DisplaySettings
  /** Callback when display settings change */
  onDisplaySettingsChange?: (settings: DisplaySettings) => void
  /** Show export button */
  showExportButton?: boolean
  /** Callback when export button is clicked */
  onExportClick?: () => void
  /** Custom left content */
  leftContent?: React.ReactNode
  /** Custom right content */
  rightContent?: React.ReactNode
}

// ============================================================================
// DSToolbar Component
// ============================================================================

export function DSToolbar({
  className,
  size = "md",
  viewMenuLabel = "Data Views",
  onViewMenuClick,
  showFilters = true,
  onFiltersClick,
  activeFilterCount,
  filterValues,
  onFilterValuesChange,
  filterViewName = "Monthly In",
  quickFilters = [],
  dateFilterPreset,
  dateFilterRange,
  onDatePresetChange,
  onDateRangeChange,
  keywordSearchQuery,
  keywordSelectedKeywords,
  onKeywordSearchChange,
  onKeywordSelectionChange,
  keywordRecentOptions,
  amountFilterValues,
  onAmountFilterChange,
  // Deprecated props - kept for backwards compatibility but not used
  dateFilterValue: _dateFilterValue,
  onDateFilterClick: _onDateFilterClick,
  onDateFilterClear: _onDateFilterClear,
  dateFilterOpen: _dateFilterOpen = false,
  showGroupButton = true,
  onGroupClick,
  groupingActive = false,
  groupByValue,
  onGroupByChange,
  showSortButton = true,
  onSortClick,
  sortValue,
  onSortValueChange,
  showDisplayButton = true,
  displayButtonType = "icon",
  onDisplayClick,
  displaySettings,
  onDisplaySettingsChange,
  showExportButton = true,
  onExportClick,
  leftContent,
  rightContent,
}: DSToolbarProps) {
  // Suppress unused variable warnings for deprecated props
  void _dateFilterValue;
  void _onDateFilterClick;
  void _onDateFilterClear;
  void _dateFilterOpen;
  
  // Use provided display settings or default
  const currentDisplaySettings = displaySettings || defaultDisplaySettings;
  return (
    <div
      data-slot="ds-toolbar"
      className={cn(dsToolbarVariants({ size }), className)}
    >
      {/* Left Section: Facets + Filters */}
      <div className="flex items-center gap-2 shrink-0">
        {leftContent ? (
          leftContent
        ) : (
          <>
            {/* View Menu */}
            <Chip
              leadingIcon={<BookmarkIcon className="text-[color:var(--ds-text-secondary)]" />}
              label={viewMenuLabel}
              trailingAction="dropdown"
              onClick={onViewMenuClick}
            />

            <ToolbarDivider />

            {/* Filters Button */}
            {showFilters && (
              onFilterValuesChange ? (
                <FilterMenuButton
                  values={filterValues}
                  onValuesChange={onFilterValuesChange}
                  viewName={filterViewName}
                />
              ) : (
                <Chip
                  leadingIcon={<FilterIcon className="text-[color:var(--ds-text-secondary)]" />}
                  label={activeFilterCount ? `Filters (${activeFilterCount})` : "Filters"}
                  trailingAction="dropdown"
                  onClick={onFiltersClick}
                />
              )
            )}

            {/* Quick Filters */}
            {quickFilters.length > 0 && (
              <div className="flex items-center gap-2">
                {quickFilters.map((filter) => {
                  // Special handling for date filter - use the new DateFilter component
                  if (filter.id === 'date') {
                    return (
                      <DateFilter
                        key={filter.id}
                        preset={dateFilterPreset}
                        dateRange={dateFilterRange}
                        onPresetChange={onDatePresetChange}
                        onDateRangeChange={onDateRangeChange}
                      />
                    )
                  }
                  
                  // Special handling for keyword filter - use the new KeywordFilter component
                  if (filter.id === 'keyword') {
                    return (
                      <KeywordFilter
                        key={filter.id}
                        searchQuery={keywordSearchQuery}
                        selectedKeywords={keywordSelectedKeywords}
                        onSearchChange={onKeywordSearchChange}
                        onKeywordsChange={onKeywordSelectionChange}
                        recentKeywords={keywordRecentOptions}
                      />
                    )
                  }
                  
                  // Special handling for amount filter - use the AmountFilter component
                  if (filter.id === 'amount') {
                    return (
                      <AmountFilter
                        key={filter.id}
                        values={amountFilterValues}
                        onValuesChange={onAmountFilterChange}
                      />
                    )
                  }
                  
                  // For other filters with active value, show value with clear button
                  if (filter.value) {
                    return (
                      <Chip
                        key={filter.id}
                        label={filter.value}
                        trailingAction="clear"
                        onClear={filter.onClear}
                      />
                    )
                  }
                  
                  // Default chip for inactive filters
                  return (
                    <Chip
                      key={filter.id}
                      label={filter.label}
                      trailingAction="dropdown"
                      onClick={filter.onClick}
                    />
                  )
                })}
              </div>
            )}
          </>
        )}
      </div>

      {/* Right Section: Actions */}
      <div className="flex items-center gap-2 shrink-0">
        {rightContent ? (
          rightContent
        ) : (
          <>
            {/* Reset link when grouping is active OR any filter is active */}
            {(() => {
              const hasGrouping = groupByValue && groupByValue !== "none";
              
              // Check FilterMenu values
              const hasFilterMenuFilters = filterValues && (
                (filterValues.datePreset && filterValues.datePreset !== "all_time") ||
                (filterValues.keywords && filterValues.keywords.length > 0) ||
                filterValues.amountMin !== undefined ||
                filterValues.amountMax !== undefined ||
                (filterValues.methods && filterValues.methods.length > 0) ||
                (filterValues.categories && filterValues.categories.length > 0) ||
                (filterValues.glCodes && filterValues.glCodes.length > 0) ||
                (filterValues.accounts && filterValues.accounts.length > 0) ||
                (filterValues.cards && filterValues.cards.length > 0) ||
                (filterValues.statuses && filterValues.statuses.length > 0) ||
                (filterValues.policies && filterValues.policies.length > 0) ||
                filterValues.hasAttachments !== undefined
              );
              
              // Check quick filter values (Date, Keyword, Amount chips)
              const hasDateFilter = dateFilterPreset && dateFilterPreset !== "all_time";
              const hasKeywordFilter = keywordSelectedKeywords && keywordSelectedKeywords.length > 0;
              const hasAmountFilter = amountFilterValues && (
                amountFilterValues.exactAmount !== undefined ||
                amountFilterValues.minAmount !== undefined ||
                amountFilterValues.maxAmount !== undefined
              );
              
              const hasAnyFilter = hasFilterMenuFilters || hasDateFilter || hasKeywordFilter || hasAmountFilter;
              
              const handleReset = () => {
                if (hasGrouping && onGroupByChange) {
                  onGroupByChange("none");
                }
                if (hasFilterMenuFilters && onFilterValuesChange) {
                  onFilterValuesChange({});
                }
                if (hasDateFilter && onDatePresetChange) {
                  onDatePresetChange("all_time");
                  onDateRangeChange?.({});
                }
                if (hasKeywordFilter && onKeywordSelectionChange) {
                  onKeywordSelectionChange([]);
                  onKeywordSearchChange?.("");
                }
                if (hasAmountFilter && onAmountFilterChange) {
                  onAmountFilterChange({});
                }
              };
              
              if ((hasGrouping && onGroupByChange) || hasAnyFilter) {
                return (
                  <>
                    <DSButton
                      variant="tertiary"
                      size="small"
                      onClick={handleReset}
                    >
                      Reset
                    </DSButton>
                    <ToolbarDivider />
                  </>
                );
              }
              return null;
            })()}

            {/* Table Actions */}
            <div className="flex items-center gap-1.5">
              {showGroupButton && (
                onGroupByChange ? (
                  <GroupByButton
                    value={groupByValue}
                    onChange={onGroupByChange}
                  />
                ) : (
                  <div className="relative">
                    <DSButton
                      variant="tertiary"
                      size="small"
                      iconOnly
                      onClick={onGroupClick}
                    >
                      <ArrowsUpToLineIcon />
                    </DSButton>
                    {groupingActive && (
                      <div
                        className="absolute rounded-full"
                        style={{
                          top: 7,
                          right: 7,
                          width: 6,
                          height: 6,
                          backgroundColor: "var(--ds-bg-primary)",
                        }}
                      />
                    )}
                  </div>
                )
              )}

              {showSortButton && (
                onSortValueChange ? (
                  <SortButton
                    value={sortValue}
                    onChange={onSortValueChange}
                  />
                ) : (
                  <DSButton
                    variant="tertiary"
                    size="small"
                    iconOnly
                    onClick={onSortClick}
                  >
                    <SortIcon />
                  </DSButton>
                )
              )}

              {showDisplayButton && (
                onDisplaySettingsChange ? (
                  <DisplaySettingsMenu
                    settings={currentDisplaySettings}
                    onSettingsChange={onDisplaySettingsChange}
                    buttonVariant={displayButtonType}
                  />
                ) : displayButtonType === "button" ? (
                  <DSButton
                    variant="tertiary"
                    size="small"
                    leadingIcon={<SlidersIcon />}
                    onClick={onDisplayClick}
                  >
                    Display
                  </DSButton>
                ) : (
                  <DSButton
                    variant="tertiary"
                    size="small"
                    iconOnly
                    onClick={onDisplayClick}
                  >
                    <SlidersIcon />
                  </DSButton>
                )
              )}
            </div>

            {/* Export Button */}
            {showExportButton && (
              <DSButton
                variant="tertiary"
                size="small"
                leadingIcon={<DownloadIcon />}
                onClick={onExportClick}
              >
                Export
              </DSButton>
            )}
          </>
        )}
      </div>
    </div>
  )
}

// ============================================================================
// Exports
// ============================================================================

export { dsToolbarVariants, IconButton, ToolbarDivider }
export { Chip } from "./chip"
export type { DatePreset, DateRange } from "./date-filter-dropdown"
export type { KeywordOption } from "./keyword-filter-dropdown"
export type { AmountFilterValues, AmountDirection } from "./amount-filter-dropdown"
export { AmountFilter } from "./amount-filter-dropdown"
export type { DisplaySettings, SortByOption, SortDirection, TimeZone } from "./display-settings-menu"
export type { GroupByOption } from "./group-by-button"
export { GroupByButton } from "./group-by-button"
export type { SortValue, SortField, SortDirection as SortDir } from "./sort-button"
export { SortButton } from "./sort-button"
export { defaultDisplaySettings } from "./display-settings-menu"
export type { FilterValues, FilterCategory } from "./filter-menu"
export { FilterMenuButton, FilterMenu, FilterMenuTrigger } from "./filter-menu"
"use client"

import * as React from "react"
import { useMemo, useState, useRef, useEffect } from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faBookmark } from "@fortawesome/free-regular-svg-icons"
import {
  faArrowUp,
  faSort,
  faSliders,
  faDownload,
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
  return <FontAwesomeIcon icon={faBookmark} style={{ width: '13px', height: '13px', flexShrink: 0 }} className={className} />
}

function FilterIcon({ className }: { className?: string }) {
  return (
    <svg
      style={{ width: '11px', height: '11px', flexShrink: 0 }}
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
  return <FontAwesomeIcon icon={faArrowUp} style={{ width: '11px', height: '11px', display: 'block', flexShrink: 0 }} className={className} />
}

function SortIcon({ className }: { className?: string }) {
  return <FontAwesomeIcon icon={faSort} style={{ width: '11px', height: '11px', flexShrink: 0 }} className={className} />
}

function SlidersIcon({ className }: { className?: string }) {
  return <FontAwesomeIcon icon={faSliders} style={{ width: '11px', height: '11px', flexShrink: 0 }} className={className} />
}

function DownloadIcon({ className }: { className?: string }) {
  return <FontAwesomeIcon icon={faDownload} style={{ width: '11px', height: '11px', flexShrink: 0 }} className={className} />
}

// ============================================================================
// DSTableToolbar Variants
// ============================================================================

const dsTableToolbarVariants = cva(
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

function ToolbarDivider() {
  return (
    <div className="w-2 h-8 flex items-center justify-center shrink-0">
      <div className="h-4" style={{ width: 1, backgroundColor: "var(--color-border-emphasized)" }} />
    </div>
  )
}

// ============================================================================
// Helper functions for filter chips
// ============================================================================

interface AppliedFilter {
  id: string
  label: string
  onClear: () => void
}

/**
 * Extract active filters from filterValues that should be displayed as chips.
 * Excludes date, keywords, and amount filters (which have their own UI).
 */
function getAppliedFilters(
  filterValues?: FilterValues,
  onFilterValuesChange?: (values: FilterValues) => void
): AppliedFilter[] {
  if (!filterValues || !onFilterValuesChange) return []
  
  const filters: AppliedFilter[] = []
  
  // Methods filter
  if (filterValues.methods && filterValues.methods.length > 0) {
    const label = filterValues.methods.length === 1 
      ? filterValues.methods[0] 
      : `${filterValues.methods.length} methods`
    filters.push({
      id: 'methods',
      label,
      onClear: () => {
        onFilterValuesChange({
          ...filterValues,
          methods: []
        })
      }
    })
  }
  
  // Categories filter
  if (filterValues.categories && filterValues.categories.length > 0) {
    const label = filterValues.categories.length === 1 
      ? filterValues.categories[0] 
      : `${filterValues.categories.length} categories`
    filters.push({
      id: 'categories',
      label,
      onClear: () => {
        onFilterValuesChange({
          ...filterValues,
          categories: []
        })
      }
    })
  }
  
  // Category filter mode (Categorized/Uncategorized)
  if (filterValues.categoryFilterMode && filterValues.categoryFilterMode !== "all") {
    const label = filterValues.categoryFilterMode === "categorized" ? "Categorized" : "Uncategorized"
    filters.push({
      id: 'categoryFilterMode',
      label,
      onClear: () => {
        onFilterValuesChange({
          ...filterValues,
          categoryFilterMode: "all"
        })
      }
    })
  }
  
  // GL Codes filter
  if (filterValues.glCodes && filterValues.glCodes.length > 0) {
    const label = filterValues.glCodes.length === 1 
      ? filterValues.glCodes[0] 
      : `${filterValues.glCodes.length} GL codes`
    filters.push({
      id: 'glCodes',
      label,
      onClear: () => {
        onFilterValuesChange({
          ...filterValues,
          glCodes: []
        })
      }
    })
  }
  
  // Accounts filter
  if (filterValues.accounts && filterValues.accounts.length > 0) {
    const label = filterValues.accounts.length === 1 
      ? filterValues.accounts[0] 
      : `${filterValues.accounts.length} accounts`
    filters.push({
      id: 'accounts',
      label,
      onClear: () => {
        onFilterValuesChange({
          ...filterValues,
          accounts: []
        })
      }
    })
  }
  
  // Cards filter
  if (filterValues.cards && filterValues.cards.length > 0) {
    const label = filterValues.cards.length === 1 
      ? filterValues.cards[0] 
      : `${filterValues.cards.length} cards`
    filters.push({
      id: 'cards',
      label,
      onClear: () => {
        onFilterValuesChange({
          ...filterValues,
          cards: []
        })
      }
    })
  }
  
  // Status filter
  if (filterValues.statuses && filterValues.statuses.length > 0) {
    const label = filterValues.statuses.length === 1 
      ? filterValues.statuses[0] 
      : `${filterValues.statuses.length} statuses`
    filters.push({
      id: 'statuses',
      label,
      onClear: () => {
        onFilterValuesChange({
          ...filterValues,
          statuses: []
        })
      }
    })
  }
  
  // Policies filter
  if (filterValues.policies && filterValues.policies.length > 0) {
    const label = filterValues.policies.length === 1 
      ? filterValues.policies[0] 
      : `${filterValues.policies.length} policies`
    filters.push({
      id: 'policies',
      label,
      onClear: () => {
        onFilterValuesChange({
          ...filterValues,
          policies: []
        })
      }
    })
  }
  
  // Attachments filter
  if (filterValues.hasAttachments !== undefined) {
    filters.push({
      id: 'attachments',
      label: filterValues.hasAttachments ? "Has attachments" : "No attachments",
      onClear: () => {
        onFilterValuesChange({
          ...filterValues,
          hasAttachments: undefined
        })
      }
    })
  }
  
  return filters
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

export interface DSTableToolbarProps extends VariantProps<typeof dsTableToolbarVariants> {
  /** Additional className */
  className?: string
  
  // View Menu
  /** View menu label */
  viewMenuLabel?: string
  /** Callback when view menu is clicked */
  onViewMenuClick?: () => void
  
  // Filter Menu
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
  
  // Quick Filters
  /** Quick filter chips (Date, Keyword, Amount, etc.) */
  quickFilters?: QuickFilter[]
  
  // Date Filter
  /** Date filter preset */
  dateFilterPreset?: DatePreset
  /** Date filter custom range */
  dateFilterRange?: DateRange
  /** Callback when date filter preset changes */
  onDatePresetChange?: (preset: DatePreset) => void
  /** Callback when date filter range changes */
  onDateRangeChange?: (range: DateRange) => void
  
  // Keyword Filter
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
  
  // Amount Filter
  /** Amount filter values */
  amountFilterValues?: AmountFilterValues
  /** Callback when amount filter values change */
  onAmountFilterChange?: (values: AmountFilterValues) => void
  
  // Group By
  /** Show group button */
  showGroupButton?: boolean
  /** Current group by value */
  groupByValue?: GroupByOption
  /** Callback when group by value changes */
  onGroupByChange?: (value: GroupByOption) => void
  
  // Sort
  /** Show sort button */
  showSortButton?: boolean
  /** Current sort value */
  sortValue?: SortValue
  /** Callback when sort value changes */
  onSortValueChange?: (value: SortValue) => void
  
  // Display Settings
  /** Show display/settings button */
  showDisplayButton?: boolean
  /** Display button type */
  displayButtonType?: "icon" | "button"
  /** Callback when display button is clicked (for simple mode) */
  onDisplayClick?: () => void
  /** Display settings state */
  displaySettings?: DisplaySettings
  /** Callback when display settings change */
  onDisplaySettingsChange?: (settings: DisplaySettings) => void
  
  // Export
  /** Show export button */
  showExportButton?: boolean
  /** Callback when export button is clicked */
  onExportClick?: () => void
  
  // Custom Content
  /** Custom left content */
  leftContent?: React.ReactNode
  /** Custom right content */
  rightContent?: React.ReactNode
}

// ============================================================================
// DSTableToolbar Component
// ============================================================================

export function DSTableToolbar({
  className,
  size = "md",
  // View Menu
  viewMenuLabel = "Data Views",
  onViewMenuClick,
  // Filter Menu
  showFilters = true,
  onFiltersClick,
  activeFilterCount,
  filterValues,
  onFilterValuesChange,
  filterViewName = "Monthly In",
  // Quick Filters
  quickFilters = [],
  // Date Filter
  dateFilterPreset,
  dateFilterRange,
  onDatePresetChange,
  onDateRangeChange,
  // Keyword Filter
  keywordSearchQuery,
  keywordSelectedKeywords,
  onKeywordSearchChange,
  onKeywordSelectionChange,
  keywordRecentOptions,
  // Amount Filter
  amountFilterValues,
  onAmountFilterChange,
  // Group By
  showGroupButton = true,
  groupByValue,
  onGroupByChange,
  // Sort
  showSortButton = true,
  sortValue,
  onSortValueChange,
  // Display Settings
  showDisplayButton = true,
  displayButtonType = "icon",
  onDisplayClick,
  displaySettings,
  onDisplaySettingsChange,
  // Export
  showExportButton = true,
  onExportClick,
  // Custom Content
  leftContent,
  rightContent,
}: DSTableToolbarProps) {
  // Use provided display settings or default
  const currentDisplaySettings = displaySettings || defaultDisplaySettings
  
  // Extract applied filters (excluding date, keywords, amount)
  const appliedFilters = useMemo(() => {
    return getAppliedFilters(filterValues, onFilterValuesChange)
  }, [filterValues, onFilterValuesChange])
  
  // Overflow handling for filter chips
  const filterChipsContainerRef = useRef<HTMLDivElement>(null)
  const hiddenChipsRef = useRef<HTMLDivElement>(null)
  const [visibleFilterCount, setVisibleFilterCount] = useState<number>(appliedFilters.length)
  const [overflowCount, setOverflowCount] = useState<number>(0)
  
  useEffect(() => {
    if (appliedFilters.length === 0) {
      setVisibleFilterCount(0)
      setOverflowCount(0)
      return
    }
    
    const updateVisibleCount = () => {
      const container = filterChipsContainerRef.current
      const hiddenContainer = hiddenChipsRef.current
      if (!container || !hiddenContainer) return
      
      // Get the toolbar container
      const toolbar = container.closest('[data-slot="ds-table-toolbar"]') as HTMLElement
      if (!toolbar) return
      
      // Find the right actions section to calculate available space
      const rightSection = toolbar.querySelector('[data-right-section]') as HTMLElement
      if (!rightSection) return
      
      const containerRect = container.getBoundingClientRect()
      const rightSectionRect = rightSection.getBoundingClientRect()
      // Calculate available width: space from start of filter chips to start of right actions
      const availableWidth = rightSectionRect.left - containerRect.left - 8 // 8px gap
      
      if (availableWidth <= 0) {
        setVisibleFilterCount(0)
        setOverflowCount(appliedFilters.length)
        return
      }
      
      // Measure chip widths from hidden container (all chips rendered there)
      const chipElements = Array.from(hiddenContainer.children) as HTMLElement[]
      if (chipElements.length === 0) {
        setVisibleFilterCount(appliedFilters.length)
        setOverflowCount(0)
        return
      }
      
      let totalWidth = 0
      let visibleCount = 0
      const chipGap = 8 // gap-2 = 8px
      const moreChipWidth = 90 // Approximate width of "+X more" chip
      
      for (let i = 0; i < chipElements.length; i++) {
        const chip = chipElements[i]
        const chipRect = chip.getBoundingClientRect()
        const chipWidth = chipRect.width
        
        // Check if this chip would fit
        const wouldFit = totalWidth + chipWidth <= availableWidth
        
        if (wouldFit) {
          totalWidth += chipWidth + chipGap
          visibleCount++
        } else {
          // Check if we can show a "+X more" chip instead
          const remainingCount = chipElements.length - visibleCount
          if (remainingCount > 0 && totalWidth + moreChipWidth <= availableWidth) {
            // We can show all visible chips plus the "+X more" chip
            break
          } else if (visibleCount > 0) {
            // Hide the last chip to make room for "+X more"
            visibleCount--
            break
          } else {
            // Can't fit anything, show "+X more" only if it fits
            if (moreChipWidth <= availableWidth) {
              visibleCount = 0
            }
            break
          }
        }
      }
      
      setVisibleFilterCount(visibleCount)
      setOverflowCount(Math.max(0, appliedFilters.length - visibleCount))
    }
    
    // Use ResizeObserver for more accurate measurements
    const resizeObserver = new ResizeObserver(() => {
      // Small delay to ensure layout is complete
      requestAnimationFrame(() => {
        requestAnimationFrame(updateVisibleCount)
      })
    })
    
    if (filterChipsContainerRef.current) {
      resizeObserver.observe(filterChipsContainerRef.current)
    }
    if (hiddenChipsRef.current) {
      resizeObserver.observe(hiddenChipsRef.current)
    }
    const parentElement = filterChipsContainerRef.current?.parentElement
    if (parentElement) {
      resizeObserver.observe(parentElement)
    }
    const toolbar = filterChipsContainerRef.current?.closest('[data-slot="ds-table-toolbar"]') as HTMLElement
    if (toolbar) {
      resizeObserver.observe(toolbar)
    }
    
    // Initial calculation after layout is complete
    requestAnimationFrame(() => {
      requestAnimationFrame(updateVisibleCount)
    })
    
    return () => {
      resizeObserver.disconnect()
    }
  }, [appliedFilters.length, appliedFilters])
  
  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    // Check grouping
    const hasGrouping = groupByValue && groupByValue !== "none"
    
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
    )
    
    // Check quick filter values (Date, Keyword, Amount chips)
    const hasDateFilter = dateFilterPreset && dateFilterPreset !== "all_time"
    const hasKeywordFilter = keywordSelectedKeywords && keywordSelectedKeywords.length > 0
    const hasAmountFilter = amountFilterValues && (
      amountFilterValues.exactAmount !== undefined ||
      amountFilterValues.minAmount !== undefined ||
      amountFilterValues.maxAmount !== undefined
    )
    
    return hasGrouping || hasFilterMenuFilters || hasDateFilter || hasKeywordFilter || hasAmountFilter
  }, [groupByValue, filterValues, dateFilterPreset, keywordSelectedKeywords, amountFilterValues])
  
  // Reset all filters
  const handleReset = () => {
    // Reset grouping
    if (groupByValue && groupByValue !== "none" && onGroupByChange) {
      onGroupByChange("none")
    }
    
    // Reset FilterMenu values
    if (filterValues && onFilterValuesChange) {
      onFilterValuesChange({})
    }
    
    // Reset date filter
    if (dateFilterPreset && dateFilterPreset !== "all_time" && onDatePresetChange) {
      onDatePresetChange("all_time")
      onDateRangeChange?.({})
    }
    
    // Reset keyword filter
    if (keywordSelectedKeywords && keywordSelectedKeywords.length > 0 && onKeywordSelectionChange) {
      onKeywordSelectionChange([])
      onKeywordSearchChange?.("")
    }
    
    // Reset amount filter
    if (amountFilterValues && onAmountFilterChange) {
      const hasAmountValues = amountFilterValues.exactAmount !== undefined ||
        amountFilterValues.minAmount !== undefined ||
        amountFilterValues.maxAmount !== undefined
      if (hasAmountValues) {
        onAmountFilterChange({})
      }
    }
  }
  
  return (
    <div
      data-slot="ds-table-toolbar"
      className={cn(dsTableToolbarVariants({ size }), className)}
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
                  // Special handling for date filter - use the DateFilter component
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
                  
                  // Special handling for keyword filter - use the KeywordFilter component
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
            
            {/* Applied Filter Chips (from FilterMenu) - left aligned after Amount filter */}
            {appliedFilters.length > 0 && (
              <>
                {/* Hidden container for measuring chip widths */}
                <div 
                  ref={hiddenChipsRef}
                  className="absolute invisible"
                  style={{ left: '-9999px', top: '-9999px' }}
                >
                  {appliedFilters.map((filter) => (
                    <Chip
                      key={filter.id}
                      variant="selected"
                      label={filter.label}
                      trailingAction="clear"
                      onClear={() => {}}
                    />
                  ))}
                </div>
                
                {/* Visible container */}
                <div 
                  ref={filterChipsContainerRef}
                  className="flex items-center gap-2 shrink-0"
                >
                  {appliedFilters.slice(0, visibleFilterCount).map((filter) => (
                    <Chip
                      key={filter.id}
                      variant="selected"
                      label={filter.label}
                      trailingAction="clear"
                      onClear={filter.onClear}
                    />
                  ))}
                  {overflowCount > 0 && (
                    <Chip
                      variant="selected"
                      label={`+${overflowCount} more`}
                      trailingAction="none"
                    />
                  )}
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* Right Section: Actions */}
      <div className="flex items-center gap-2 shrink-0" data-right-section>
        {rightContent ? (
          rightContent
        ) : (
          <>
            {/* Reset link when any filter is active */}
            {hasActiveFilters && (
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
            )}

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
                    >
                      <ArrowsUpToLineIcon />
                    </DSButton>
                    {groupByValue && groupByValue !== "none" && (
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

export { dsTableToolbarVariants, ToolbarDivider }
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

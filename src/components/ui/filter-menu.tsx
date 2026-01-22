"use client"

import * as React from "react"
import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import {
  faCalendar,
  faCreditCard,
  faMagnifyingGlass,
  faGreaterThanEqual,
  faDollarSign,
  faList,
  faBuildingColumns,
  faSpinner,
  faGavel,
  faPaperclip,
  faChevronRight,
  faChevronLeft,
  faChevronDown,
  faCircleCheck,
  faEquals,
  faLessThanEqual,
  faTag,
} from "@/icons"
import { DSCheckbox } from "./ds-checkbox"
import { DSRadioGroup, type RadioOption } from "./ds-radio-group"
import { Chip } from "./chip"
import { Icon } from "./icon"

// ============================================================================
// Icon Components (using Icon design system component)
// ============================================================================

function SearchIcon({ className }: { className?: string }) {
  return <Icon icon={faMagnifyingGlass} size="small" className={className} />
}

function GreaterThanEqualIcon({ className }: { className?: string }) {
  return <Icon icon={faGreaterThanEqual} size="small" className={className} />
}

function ChevronRightIcon({ className }: { className?: string }) {
  return <Icon icon={faChevronRight} size="small" className={className} />
}

function ChevronLeftIcon({ className }: { className?: string }) {
  return <Icon icon={faChevronLeft} size="small" className={className} />
}

function ChevronDownIcon({ className }: { className?: string }) {
  return <Icon icon={faChevronDown} size="small" className={className} />
}

// CircleCheckIcon - reserved for future use
// function CircleCheckIcon({ className }: { className?: string }) {
//   return <Icon icon={faCircleCheck} size="small" className={className} />
// }

function FilterBarsIcon({ className }: { className?: string }) {
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

// ============================================================================
// Types
// ============================================================================

export type FilterCategory = 
  | "date"
  | "keywords"
  | "amount"
  | "method"
  | "categories"
  | "glCodes"
  | "accounts"
  | "cards"
  | "status"
  | "policies"
  | "attachments"

export interface FilterCategoryConfig {
  id: FilterCategory
  label: string
  icon: React.ReactNode
  hasValue?: boolean
}

export type DatePreset = "all_time" | "this_month" | "last_month" | "this_quarter" | "last_quarter" | "this_year" | "last_year" | "last_30_days" | "custom"

export interface DateRange {
  from?: { month: number; year: number }
  to?: { month: number; year: number }
}

export interface FilterValues {
  datePreset?: DatePreset
  dateRange?: DateRange
  keywords?: string[]
  keywordSearch?: string
  amountDirection?: "any" | "in" | "out"
  amountExact?: number
  amountMin?: number
  amountMax?: number
  methods?: string[]
  categories?: string[]
  categorySearch?: string
  categoryFilterMode?: CategoryFilterMode
  glCodes?: string[]
  accounts?: string[]
  cards?: string[]
  statuses?: string[]
  policies?: string[]
  hasAttachments?: boolean
}

export interface FilterMenuProps {
  /** Whether the menu is open */
  open: boolean
  /** Callback when menu should close */
  onClose: () => void
  /** Anchor element for viewport-aware positioning */
  anchorEl?: HTMLElement | null
  /** Current filter values */
  values?: FilterValues
  /** Callback when filter values change */
  onValuesChange?: (values: FilterValues) => void
  /** Current view name */
  viewName?: string
  /** Additional className */
  className?: string
}

// ============================================================================
// Constants
// ============================================================================

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

const DATE_PRESETS: { value: DatePreset; label: string }[] = [
  { value: "last_30_days", label: "Last 30 days" },
  { value: "this_month", label: "This month" },
  { value: "last_month", label: "Last month" },
  { value: "this_quarter", label: "This quarter" },
  { value: "last_quarter", label: "Last quarter" },
  { value: "this_year", label: "This year" },
  { value: "last_year", label: "Last year" },
  { value: "all_time", label: "All time" },
  { value: "custom", label: "Custom" },
]

const FILTER_CATEGORIES: FilterCategoryConfig[] = [
  { id: "date", label: "Date", icon: <Icon icon={faCalendar} size="small" /> },
  { id: "keywords", label: "Keywords", icon: <Icon icon={faMagnifyingGlass} size="small" /> },
  { id: "amount", label: "Amount", icon: <Icon icon={faGreaterThanEqual} size="small" /> },
  { id: "method", label: "Method", icon: <Icon icon={faDollarSign} size="small" /> },
  { id: "categories", label: "Categories", icon: <Icon icon={faTag} size="small" /> },
  { id: "glCodes", label: "GL Codes", icon: <Icon icon={faList} size="small" /> },
  { id: "accounts", label: "Accounts", icon: <Icon icon={faBuildingColumns} size="small" /> },
  { id: "cards", label: "Cards", icon: <Icon icon={faCreditCard} size="small" /> },
  { id: "status", label: "Status", icon: <Icon icon={faSpinner} size="small" /> },
  { id: "policies", label: "Policies", icon: <Icon icon={faGavel} size="small" /> },
  { id: "attachments", label: "Attachments", icon: <Icon icon={faPaperclip} size="small" /> },
]

// ============================================================================
// Helper functions
// ============================================================================

function getPresetLabel(preset: DatePreset): string {
  return DATE_PRESETS.find(p => p.value === preset)?.label || "Last 30 days"
}

function formatMonthYear(month?: number, year?: number): string {
  if (month === undefined || year === undefined) return ""
  return `${MONTHS[month]} ${year}`
}

function getFilterSummary(values: FilterValues): string {
  const parts: string[] = []
  
  if (values.datePreset && values.datePreset !== "all_time") {
    if (values.datePreset === "custom" && values.dateRange?.from && values.dateRange?.to) {
      const from = formatMonthYear(values.dateRange.from.month, values.dateRange.from.year)
      const to = formatMonthYear(values.dateRange.to.month, values.dateRange.to.year)
      parts.push(`${from} - ${to}`)
    } else {
      parts.push(getPresetLabel(values.datePreset))
    }
  }
  
  if (values.keywords && values.keywords.length > 0) {
    parts.push(values.keywords.length === 1 ? values.keywords[0] : `${values.keywords.length} keywords`)
  }
  
  // Amount filters
  const amountParts: string[] = []
  if (values.amountDirection && values.amountDirection !== "any") {
    amountParts.push(values.amountDirection === "in" ? "Money In" : "Money Out")
  }
  if (values.amountExact !== undefined) {
    amountParts.push(`=$${values.amountExact.toLocaleString()}`)
  }
  if (values.amountMin !== undefined) {
    amountParts.push(`≥$${values.amountMin.toLocaleString()}`)
  }
  if (values.amountMax !== undefined) {
    amountParts.push(`≤$${values.amountMax.toLocaleString()}`)
  }
  if (amountParts.length > 0) {
    parts.push(amountParts.join(", "))
  }
  
  // Categories filter
  if (values.categoryFilterMode && values.categoryFilterMode !== "all") {
    parts.push(values.categoryFilterMode === "categorized" ? "Categorized" : "Uncategorized")
  }
  if (values.categories && values.categories.length > 0) {
    parts.push(values.categories.length === 1 ? values.categories[0] : `${values.categories.length} categories`)
  }
  
  return parts.join(", ") || "No filters applied"
}

// ============================================================================
// Sub-components
// ============================================================================

interface FilterSidebarProps {
  activeCategory: FilterCategory
  onCategorySelect: (category: FilterCategory) => void
  values: FilterValues
}

function FilterSidebar({ activeCategory, onCategorySelect, values }: FilterSidebarProps) {
  // Determine which categories have active filters
  const hasDateFilter = values.datePreset && values.datePreset !== "all_time"
  const hasAmountFilter = (values.amountDirection && values.amountDirection !== "any") || 
                          values.amountExact !== undefined || 
                          values.amountMin !== undefined || 
                          values.amountMax !== undefined
  const hasKeywordsFilter = values.keywords && values.keywords.length > 0
  
  const getCategoryHasValue = (id: FilterCategory): boolean => {
    switch (id) {
      case "date": return !!hasDateFilter
      case "amount": return !!hasAmountFilter
      case "keywords": return !!hasKeywordsFilter
      case "method": return (values.methods?.length || 0) > 0
      case "categories": return (values.categories?.length || 0) > 0 || (values.categoryFilterMode !== undefined && values.categoryFilterMode !== "all")
      case "glCodes": return (values.glCodes?.length || 0) > 0
      case "accounts": return (values.accounts?.length || 0) > 0
      case "cards": return (values.cards?.length || 0) > 0
      case "status": return (values.statuses?.length || 0) > 0
      case "policies": return (values.policies?.length || 0) > 0
      case "attachments": return values.hasAttachments !== undefined
      default: return false
    }
  }

  return (
    <div className="ds-filter-sidebar">
      {FILTER_CATEGORIES.map((category) => {
        const isActive = activeCategory === category.id
        const hasValue = getCategoryHasValue(category.id)
        const iconColor = hasValue
          ? "var(--purple-magic-600)"
          : isActive
            ? "var(--neutral-base-900)"
            : "var(--neutral-base-700)"
        
        return (
          <button
            key={category.id}
            type="button"
            onClick={() => onCategorySelect(category.id)}
            className={cn(
              "ds-filter-sidebar-item",
              isActive && "active"
            )}
          >
            {/* Icon */}
            {hasValue ? (
              <Icon icon={faCircleCheck} size="small" style={{ color: iconColor }} />
            ) : (
              <div style={{ color: iconColor }}>{category.icon}</div>
            )}
            
            {/* Label */}
            <span className={cn(
              "ds-filter-sidebar-label",
              isActive && "active"
            )}>
              {category.label}
            </span>
            
            {/* Arrow (only for active) */}
            <div className="ds-filter-sidebar-arrow">
              <Icon icon={faChevronRight} size="small" />
            </div>
          </button>
        )
      })}
    </div>
  )
}

interface DateContentProps {
  preset: DatePreset
  dateRange?: DateRange
  onPresetChange: (preset: DatePreset) => void
  onDateRangeChange: (range: DateRange) => void
}

function DateContent({ preset, dateRange, onPresetChange, onDateRangeChange }: DateContentProps) {
  const [isSelectingFrom, setIsSelectingFrom] = useState(true)
  const currentYear = new Date().getFullYear()
  const [baseYear, setBaseYear] = useState(currentYear - 1)
  const [isPresetOpen, setIsPresetOpen] = useState(false)
  const presetRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (presetRef.current && !presetRef.current.contains(event.target as Node)) {
        setIsPresetOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleMonthSelect = (month: number, year: number) => {
    const newDate = { month, year }
    
    if (isSelectingFrom) {
      const newRange = { from: newDate, to: dateRange?.to }
      onDateRangeChange(newRange)
      setIsSelectingFrom(false)
      
      if (preset !== "custom") {
        onPresetChange("custom")
      }
    } else {
      const newRange = { from: dateRange?.from, to: newDate }
      onDateRangeChange(newRange)
      setIsSelectingFrom(true)
      
      if (preset !== "custom") {
        onPresetChange("custom")
      }
    }
  }

  const isMonthSelected = (month: number, targetYear: number) => {
    if (dateRange?.from?.month === month && dateRange?.from?.year === targetYear) return "from"
    if (dateRange?.to?.month === month && dateRange?.to?.year === targetYear) return "to"
    return null
  }

  const isMonthInRange = (month: number, targetYear: number) => {
    if (!dateRange?.from || !dateRange?.to) return false
    
    const fromDate = dateRange.from.year * 12 + dateRange.from.month
    const toDate = dateRange.to.year * 12 + dateRange.to.month
    const currentDate = targetYear * 12 + month
    
    return currentDate > fromDate && currentDate < toDate
  }

  return (
    <div className="ds-filter-content">
      {/* Preset dropdown */}
      <div className="p-6" style={{ boxShadow: "inset 0px -1px 0px 0px var(--purple-base-100)" }}>
        <div className="mb-1">
          <label className="ds-radio-group-label" style={{ paddingBottom: "4px" }}>
            Show transactions for
          </label>
        </div>
        <div ref={presetRef} className="relative">
          <button
            type="button"
            onClick={() => setIsPresetOpen(!isPresetOpen)}
            className="ds-filter-select"
          >
            <span>{getPresetLabel(preset)}</span>
            <ChevronDownIcon className="text-foreground" />
          </button>
          
          {isPresetOpen && (
            <div className="ds-filter-dropdown">
              {DATE_PRESETS.map((presetOption) => (
                <button
                  key={presetOption.value}
                  type="button"
                  onClick={() => {
                    onPresetChange(presetOption.value)
                    setIsPresetOpen(false)
                  }}
                  className={cn(
                    "ds-filter-dropdown-item",
                    preset === presetOption.value && "selected"
                  )}
                >
                  {presetOption.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* From / To inputs */}
      <div className="px-6 pt-6 pb-2">
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <label className="ds-radio-group-label" style={{ paddingBottom: "4px" }}>From</label>
            <button
              type="button"
              onClick={() => setIsSelectingFrom(true)}
              className={cn(
                "ds-filter-input",
                isSelectingFrom && "ds-filter-input-focused"
              )}
              style={{ color: dateRange?.from ? "var(--neutral-base-700)" : "var(--neutral-base-400)" }}
            >
              {dateRange?.from 
                ? formatMonthYear(dateRange.from.month, dateRange.from.year)
                : ""}
            </button>
          </div>
          
          <span style={{ color: "var(--neutral-base-500)", fontFamily: "var(--font-sans)", fontSize: "13px", marginTop: "20px" }}>—</span>
          
          <div className="flex-1">
            <label className="ds-radio-group-label" style={{ paddingBottom: "4px" }}>To</label>
            <button
              type="button"
              onClick={() => setIsSelectingFrom(false)}
              className={cn(
                "ds-filter-input",
                !isSelectingFrom && "ds-filter-input-focused"
              )}
              style={{ color: dateRange?.to ? "var(--neutral-base-700)" : "var(--neutral-base-400)" }}
            >
              {dateRange?.to 
                ? formatMonthYear(dateRange.to.month, dateRange.to.year)
                : ""}
            </button>
          </div>
        </div>
      </div>

      {/* Month picker */}
      <div className="px-6 pt-6 flex-1 min-h-0 overflow-y-auto">
        {/* Year navigation */}
        <div className="flex items-center gap-4 mb-3">
          <button
            type="button"
            onClick={() => setBaseYear(prev => prev - 1)}
            className="ds-filter-month-nav"
          >
            <ChevronLeftIcon />
          </button>
          
          <div className="flex-1 flex justify-center" style={{ gap: "68px" }}>
            <span style={{ fontFamily: "var(--font-sans)", fontSize: "12px", color: "var(--neutral-base-600)", fontWeight: 480, letterSpacing: "1px", textTransform: "uppercase", lineHeight: "24px" }}>
              {baseYear}
            </span>
            <span style={{ fontFamily: "var(--font-sans)", fontSize: "12px", color: "var(--neutral-base-600)", fontWeight: 480, letterSpacing: "1px", textTransform: "uppercase", lineHeight: "24px" }}>
              {baseYear + 1}
            </span>
          </div>
          
          <button
            type="button"
            onClick={() => setBaseYear(prev => prev + 1)}
            className="ds-filter-month-nav"
          >
            <ChevronRightIcon />
          </button>
        </div>

        {/* Month grids */}
        <div className="flex gap-4">
          {[baseYear, baseYear + 1].map((year) => (
            <div key={year} className="flex-1">
              <div className="grid grid-cols-3 gap-1">
                {MONTHS.map((monthName, monthIndex) => {
                  const selection = isMonthSelected(monthIndex, year)
                  const inRange = isMonthInRange(monthIndex, year)
                  
                  return (
                    <button
                      key={monthName}
                      type="button"
                      onClick={() => handleMonthSelect(monthIndex, year)}
                      className={cn(
                        "ds-filter-month-btn",
                        (selection === "from" || selection === "to") && "selected",
                        inRange && "in-range"
                      )}
                    >
                      {monthName}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

interface FilterHeaderProps {
  viewName: string
  filterSummary: string
  onReset: () => void
}

function FilterHeader({ viewName, filterSummary, onReset }: FilterHeaderProps) {
  return (
    <div className="ds-filter-header">
      <div className="flex flex-col">
        <span className="ds-filter-header-view">{viewName}</span>
        <span className="ds-filter-header-summary">{filterSummary}</span>
      </div>
      <button
        type="button"
        onClick={onReset}
        className="ds-filter-reset-btn"
      >
        Reset
      </button>
    </div>
  )
}

// ============================================================================
// Keywords Content Panel
// ============================================================================

const DEFAULT_RECENT_KEYWORDS = [
  { value: "hook-fish", label: "Hook Fish" },
  { value: "xian-noodles", label: "Xian Noodles" },
  { value: "beeps", label: "Beeps" },
  { value: "nicks-tacos", label: "Nick's Tacos" },
  { value: "roxies-subs", label: "Roxie's Subs" },
]


interface KeywordsContentProps {
  keywords: string[]
  searchQuery: string
  onKeywordsChange: (keywords: string[]) => void
  onSearchChange: (query: string) => void
}

function KeywordsContent({ keywords, searchQuery, onKeywordsChange, onSearchChange }: KeywordsContentProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  
  // Focus input when panel becomes active
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])
  
  const handleKeywordToggle = (keyword: string) => {
    const newSelected = keywords.includes(keyword)
      ? keywords.filter(k => k !== keyword)
      : [...keywords, keyword]
    onKeywordsChange(newSelected)
  }
  
  // Filter keywords based on search
  const filteredKeywords = DEFAULT_RECENT_KEYWORDS.filter(keyword =>
    keyword.label.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="ds-filter-content p-6 overflow-y-auto">
      {/* Search Input */}
      <div className="relative mb-4">
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search recipients, and more"
          className="ds-filter-input ds-filter-input-focused"
          style={{ backgroundColor: "var(--neutral-base-0)" }}
        />
      </div>

      {/* Recent Keywords */}
      <div>
        <div style={{ fontFamily: "var(--font-sans)", fontSize: "12px", color: "var(--neutral-base-500)", fontWeight: 400, letterSpacing: "0.05em", marginBottom: "8px" }}>
          Recent
        </div>
        <div className="flex flex-col gap-1">
          {filteredKeywords.map((keyword) => (
            <DSCheckbox
              key={keyword.value}
              labelStyle="simple"
              label={keyword.label}
              checked={keywords.includes(keyword.value)}
              onChange={() => handleKeywordToggle(keyword.value)}
            />
          ))}
          {filteredKeywords.length === 0 && (
            <div style={{ fontFamily: "var(--font-sans)", fontSize: "14px", color: "var(--neutral-base-400)", padding: "8px 0" }}>
              No results found
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// Amount Content Panel
// ============================================================================

type AmountDirection = "any" | "in" | "out"

interface AmountContentProps {
  direction: AmountDirection
  exactAmount?: number
  minAmount?: number
  maxAmount?: number
  onDirectionChange: (direction: AmountDirection) => void
  onExactAmountChange: (amount?: number) => void
  onMinAmountChange: (amount?: number) => void
  onMaxAmountChange: (amount?: number) => void
}

function EqualsIcon({ className }: { className?: string }) {
  return <Icon icon={faEquals} size="small" className={className} />
}

function LessThanEqualIcon({ className }: { className?: string }) {
  return <Icon icon={faLessThanEqual} size="small" className={className} />
}

function AmountContent({ 
  direction, 
  exactAmount, 
  minAmount, 
  maxAmount,
  onDirectionChange,
  onExactAmountChange,
  onMinAmountChange,
  onMaxAmountChange 
}: AmountContentProps) {
  const [exactStr, setExactStr] = useState(exactAmount?.toString() || "")
  const [minStr, setMinStr] = useState(minAmount?.toString() || "")
  const [maxStr, setMaxStr] = useState(maxAmount?.toString() || "")
  const [focusedField, setFocusedField] = useState<string | null>(null)
  
  const parseAmount = (str: string): number | undefined => {
    const cleaned = str.replace(/[^0-9.]/g, "")
    const num = parseFloat(cleaned)
    return isNaN(num) ? undefined : num
  }
  
  const handleExactChange = (value: string) => {
    setExactStr(value)
    onExactAmountChange(parseAmount(value))
  }
  
  const handleMinChange = (value: string) => {
    setMinStr(value)
    onMinAmountChange(parseAmount(value))
  }
  
  const handleMaxChange = (value: string) => {
    setMaxStr(value)
    onMaxAmountChange(parseAmount(value))
  }

  const directionOptions: RadioOption<AmountDirection>[] = [
    { value: "any", label: "Any" },
    { value: "in", label: "In", description: "(e.g. deposits, refunds)" },
    { value: "out", label: "Out", description: "(e.g. purchases, charges)" },
  ]

  return (
    <div className="ds-filter-content p-6 overflow-y-auto">
      <div className="flex flex-col gap-4">
        {/* Direction radio group */}
        <DSRadioGroup
          label="Direction"
          options={directionOptions}
          value={direction}
          onChange={onDirectionChange}
        />

        {/* Specific amount input */}
        <div className="flex flex-col gap-1">
          <label className="ds-radio-group-label" style={{ paddingBottom: 0 }}>
            Specific amount
          </label>
          <div
            className={cn(
              "ds-filter-amount-input",
              focusedField === "exact" && "focused"
            )}
          >
            <div className="ds-filter-amount-icon">
              <EqualsIcon />
            </div>
            <input
              type="text"
              inputMode="decimal"
              value={exactStr}
              onChange={(e) => handleExactChange(e.target.value)}
              onFocus={() => setFocusedField("exact")}
              onBlur={() => setFocusedField(null)}
              className="ds-filter-amount-field"
            />
          </div>
        </div>

        {/* At least input */}
        <div className="flex flex-col gap-1">
          <label className="ds-radio-group-label" style={{ paddingBottom: 0 }}>
            At least
          </label>
          <div
            className={cn(
              "ds-filter-amount-input",
              focusedField === "min" && "focused"
            )}
          >
            <div className="ds-filter-amount-icon">
              <GreaterThanEqualIcon />
            </div>
            <input
              type="text"
              inputMode="decimal"
              value={minStr}
              onChange={(e) => handleMinChange(e.target.value)}
              onFocus={() => setFocusedField("min")}
              onBlur={() => setFocusedField(null)}
              className="ds-filter-amount-field"
            />
          </div>
        </div>

        {/* No more than input */}
        <div className="flex flex-col gap-1">
          <label className="ds-radio-group-label" style={{ paddingBottom: 0 }}>
            No more than
          </label>
          <div
            className={cn(
              "ds-filter-amount-input",
              focusedField === "max" && "focused"
            )}
          >
            <div className="ds-filter-amount-icon">
              <LessThanEqualIcon />
            </div>
            <input
              type="text"
              inputMode="decimal"
              value={maxStr}
              onChange={(e) => handleMaxChange(e.target.value)}
              onFocus={() => setFocusedField("max")}
              onBlur={() => setFocusedField(null)}
              className="ds-filter-amount-field"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// Categories Content Panel
// ============================================================================

export const DEFAULT_CATEGORIES = [
  "Bank Fees",
  "Business Meals",
  "COGS",
  "Credit & Loan Payments",
  "Employee Benefits",
  "Entertainment",
  "Financing Proceeds",
  "Insurance",
  "Interest Earned",
  "Inventory & Materials",
  "Legal & Professional Services",
  "Marketing & Advertising",
  "Office Supplies & Equipment",
  "Payment Processing Fees",
  "Payroll",
  "Rent & Utilities",
  "Revenue",
  "Shipping & Postage",
  "Software & Subscriptions",
  "Taxes",
  "Transfer",
  "Travel & Transportation",
]

export type CategoryFilterMode = "all" | "categorized" | "uncategorized"

interface CategoriesContentProps {
  searchQuery: string
  filterMode: CategoryFilterMode
  selectedCategories: string[]
  availableCategories?: string[]
  onSearchChange: (query: string) => void
  onFilterModeChange: (mode: CategoryFilterMode) => void
  onCategoriesChange: (categories: string[]) => void
}

function CategoriesContent({
  searchQuery,
  filterMode,
  selectedCategories,
  availableCategories = DEFAULT_CATEGORIES,
  onSearchChange,
  onFilterModeChange,
  onCategoriesChange,
}: CategoriesContentProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  
  // Focus input when panel becomes active
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])
  
  // Filter categories based on search
  const filteredCategories = availableCategories.filter(category =>
    category.toLowerCase().includes(searchQuery.toLowerCase())
  )
  
  const handleCategoryToggle = (category: string) => {
    const newSelected = selectedCategories.includes(category)
      ? selectedCategories.filter(c => c !== category)
      : [...selectedCategories, category]
    onCategoriesChange(newSelected)
  }
  
  const handleSelectAll = () => {
    // If all filtered categories are selected, deselect all. Otherwise, select all filtered.
    const allFilteredSelected = filteredCategories.every(cat => 
      selectedCategories.includes(cat)
    )
    
    if (allFilteredSelected) {
      // Deselect all filtered categories
      const newSelected = selectedCategories.filter(cat => 
        !filteredCategories.includes(cat)
      )
      onCategoriesChange(newSelected)
    } else {
      // Select all filtered categories (merge with existing)
      const newSelected = [...new Set([...selectedCategories, ...filteredCategories])]
      onCategoriesChange(newSelected)
    }
  }
  
  const filterModeOptions: RadioOption<CategoryFilterMode>[] = [
    { value: "all", label: "All Transactions" },
    { value: "categorized", label: "Categorized" },
    { value: "uncategorized", label: "Uncategorized" },
  ]

  return (
    <div className="ds-filter-content overflow-y-auto">
      {/* Search Input */}
      <div className="p-6 pb-4">
        <div className="relative">
          <div className="absolute top-1/2" style={{ left: 12, transform: "translateY(-50%)", color: "var(--neutral-base-400)" }}>
            <SearchIcon />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search for a category"
            className="ds-filter-search-input"
          />
        </div>
      </div>

      {/* Filter Mode Radio Group */}
      <div className="px-6 pb-4">
        <DSRadioGroup
          options={filterModeOptions}
          value={filterMode}
          onChange={onFilterModeChange}
        />
      </div>

      {/* Category Section Header */}
      <div className="px-6 py-2 flex items-center justify-between">
        <span style={{ fontFamily: "var(--font-sans)", fontSize: "12px", color: "var(--neutral-base-500)", fontWeight: 400, letterSpacing: "0.05em", textTransform: "uppercase" }}>
          Category
        </span>
        <button
          type="button"
          onClick={handleSelectAll}
          className="ds-filter-select-all"
        >
          Select All
        </button>
      </div>

      {/* Category Checkboxes */}
      <div className="px-6 pb-4">
        <div className="flex flex-col gap-1">
          {filteredCategories.map((category) => (
            <DSCheckbox
              key={category}
              labelStyle="simple"
              label={category}
              checked={selectedCategories.includes(category)}
              onChange={() => handleCategoryToggle(category)}
              className="py-0.5"
            />
          ))}
          {filteredCategories.length === 0 && (
            <div style={{ fontFamily: "var(--font-sans)", fontSize: "14px", color: "var(--neutral-base-400)", padding: "8px 0" }}>
              No categories found
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// Coming Soon placeholder for other filter content panels
// ============================================================================

function ComingSoonContent({ category }: { category: FilterCategory }) {
  const config = FILTER_CATEGORIES.find(c => c.id === category)
  
  return (
    <div className="ds-filter-content items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center" style={{ backgroundColor: "var(--neutral-magic-600-alpha3)" }}>
          <span style={{ color: "var(--neutral-base-600)" }}>{config?.icon}</span>
        </div>
        <p style={{ fontFamily: "var(--font-sans)", fontSize: "15px", color: "var(--neutral-base-600)" }}>{config?.label} filter</p>
        <p style={{ fontFamily: "var(--font-sans)", fontSize: "13px", color: "var(--neutral-base-400)", marginTop: "4px" }}>Coming soon</p>
      </div>
    </div>
  )
}

// ============================================================================
// FilterMenu Component
// ============================================================================

export function FilterMenu({
  open,
  onClose,
  anchorEl,
  values = {},
  onValuesChange,
  viewName = "Monthly In",
  className,
}: FilterMenuProps) {
  const [activeCategory, setActiveCategory] = useState<FilterCategory>("date")
  const [internalValues, setInternalValues] = useState<FilterValues>(values)
  const ref = useRef<HTMLDivElement>(null)

  // Update internal state when props change
  useEffect(() => {
    setInternalValues(values)
  }, [values])

  // Handle click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node
      // Don't close if clicking inside the menu or on the anchor element (chip)
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

  const handleValuesChange = (newValues: FilterValues) => {
    setInternalValues(newValues)
    onValuesChange?.(newValues)
  }

  const handleReset = () => {
    const emptyValues: FilterValues = {}
    setInternalValues(emptyValues)
    onValuesChange?.(emptyValues)
  }

  const handleDatePresetChange = (preset: DatePreset) => {
    handleValuesChange({
      ...internalValues,
      datePreset: preset,
    })
  }

  const handleDateRangeChange = (dateRange: DateRange) => {
    handleValuesChange({
      ...internalValues,
      dateRange,
      datePreset: "custom",
    })
  }

  // Keywords handlers
  const handleKeywordsChange = (keywords: string[]) => {
    handleValuesChange({
      ...internalValues,
      keywords,
    })
  }

  const handleKeywordSearchChange = (search: string) => {
    handleValuesChange({
      ...internalValues,
      keywordSearch: search,
    })
  }

  // Amount handlers
  const handleAmountDirectionChange = (direction: "any" | "in" | "out") => {
    handleValuesChange({
      ...internalValues,
      amountDirection: direction,
    })
  }

  const handleAmountExactChange = (amount?: number) => {
    handleValuesChange({
      ...internalValues,
      amountExact: amount,
    })
  }

  const handleAmountMinChange = (amount?: number) => {
    handleValuesChange({
      ...internalValues,
      amountMin: amount,
    })
  }

  const handleAmountMaxChange = (amount?: number) => {
    handleValuesChange({
      ...internalValues,
      amountMax: amount,
    })
  }

  // Categories handlers
  const handleCategorySearchChange = (search: string) => {
    handleValuesChange({
      ...internalValues,
      categorySearch: search,
    })
  }

  const handleCategoryFilterModeChange = (mode: CategoryFilterMode) => {
    handleValuesChange({
      ...internalValues,
      categoryFilterMode: mode,
    })
  }

  const handleCategoriesChange = (categories: string[]) => {
    handleValuesChange({
      ...internalValues,
      categories,
    })
  }

  const [, setPlacement] = useState<"bottom" | "top">("bottom")
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties | null>(null)

  // Viewport-aware positioning so the menu doesn't get cut off on short pages.
  // NOTE: This effect must be before the early return to avoid React hooks violation
  useEffect(() => {
    if (!open) return

    const updatePosition = () => {
      const rect = anchorEl?.getBoundingClientRect()
      const fallbackRect = ref.current?.parentElement?.getBoundingClientRect()
      const anchorRect = rect ?? fallbackRect
      if (!anchorRect) return

      const viewportPadding = 8
      const gap = 4
      const menuWidth = 598
      const desiredHeight = 533

      const left = Math.max(
        viewportPadding,
        Math.min(anchorRect.left, window.innerWidth - menuWidth - viewportPadding)
      )

      const availableBelow = window.innerHeight - anchorRect.bottom - gap - viewportPadding
      const availableAbove = anchorRect.top - gap - viewportPadding

      const shouldFlip = availableBelow < 360 && availableAbove > availableBelow
      const nextPlacement: "bottom" | "top" = shouldFlip ? "top" : "bottom"
      setPlacement(nextPlacement)

      if (nextPlacement === "bottom") {
        const top = anchorRect.bottom + gap
        const maxHeight = Math.max(260, availableBelow)
        const height = Math.min(desiredHeight, maxHeight)
        setMenuStyle({
          position: "fixed",
          top,
          left,
          width: menuWidth,
          height,
          zIndex: 70,
        })
      } else {
        const bottom = window.innerHeight - anchorRect.top + gap
        const maxHeight = Math.max(260, availableAbove)
        const height = Math.min(desiredHeight, maxHeight)
        setMenuStyle({
          position: "fixed",
          bottom,
          left,
          width: menuWidth,
          height,
          zIndex: 70,
        })
      }
    }

    updatePosition()
    window.addEventListener("resize", updatePosition)
    window.addEventListener("scroll", updatePosition, { passive: true })
    return () => {
      window.removeEventListener("resize", updatePosition)
      window.removeEventListener("scroll", updatePosition)
    }
  }, [open, anchorEl])

  // Early return AFTER all hooks
  if (!open) return null

  const filterSummary = getFilterSummary(internalValues)

  // Render the appropriate content panel based on active category
  const renderContentPanel = () => {
    switch (activeCategory) {
      case "date":
        return (
          <DateContent
            preset={internalValues.datePreset || "last_30_days"}
            dateRange={internalValues.dateRange}
            onPresetChange={handleDatePresetChange}
            onDateRangeChange={handleDateRangeChange}
          />
        )
      case "keywords":
        return (
          <KeywordsContent
            keywords={internalValues.keywords || []}
            searchQuery={internalValues.keywordSearch || ""}
            onKeywordsChange={handleKeywordsChange}
            onSearchChange={handleKeywordSearchChange}
          />
        )
      case "amount":
        return (
          <AmountContent
            direction={internalValues.amountDirection || "any"}
            exactAmount={internalValues.amountExact}
            minAmount={internalValues.amountMin}
            maxAmount={internalValues.amountMax}
            onDirectionChange={handleAmountDirectionChange}
            onExactAmountChange={handleAmountExactChange}
            onMinAmountChange={handleAmountMinChange}
            onMaxAmountChange={handleAmountMaxChange}
          />
        )
      case "categories":
        return (
          <CategoriesContent
            searchQuery={internalValues.categorySearch || ""}
            filterMode={internalValues.categoryFilterMode || "all"}
            selectedCategories={internalValues.categories || []}
            onSearchChange={handleCategorySearchChange}
            onFilterModeChange={handleCategoryFilterModeChange}
            onCategoriesChange={handleCategoriesChange}
          />
        )
      default:
        return <ComingSoonContent category={activeCategory} />
    }
  }

  return (
    <div
      ref={ref}
      className={cn("ds-filter-menu", className)}
      style={menuStyle ?? undefined}
    >
      {/* Header */}
      <FilterHeader
        viewName={viewName}
        filterSummary={filterSummary}
        onReset={handleReset}
      />
      
      {/* Main content area */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Sidebar */}
        <FilterSidebar
          activeCategory={activeCategory}
          onCategorySelect={setActiveCategory}
          values={internalValues}
        />
        
        {/* Content panel */}
        {renderContentPanel()}
      </div>
    </div>
  )
}

// ============================================================================
// FilterMenuTrigger - The button that opens the FilterMenu
// ============================================================================

export interface FilterMenuTriggerProps {
  /** Whether the menu is open */
  isOpen?: boolean
  /** Number of active filters */
  activeFilterCount?: number
  /** Callback when clicked */
  onClick?: () => void
  /** Additional className */
  className?: string
}

export function FilterMenuTrigger({
  isOpen = false,
  activeFilterCount,
  onClick,
  className,
}: FilterMenuTriggerProps) {
  return (
    <Chip
      leadingIcon={<FilterBarsIcon className="text-[color:var(--ds-text-secondary)]" />}
      label={activeFilterCount ? `Filters (${activeFilterCount})` : "Filters"}
      trailingAction="dropdown"
      isOpen={isOpen}
      onClick={onClick}
      className={className}
    />
  )
}

// ============================================================================
// Combined FilterMenuButton component (Trigger + Menu)
// ============================================================================

export interface FilterMenuButtonProps {
  /** Current filter values */
  values?: FilterValues
  /** Callback when filter values change */
  onValuesChange?: (values: FilterValues) => void
  /** Current view name */
  viewName?: string
  /** Additional className */
  className?: string
}

export function FilterMenuButton({
  values = {},
  onValuesChange,
  viewName = "Monthly In",
  className,
}: FilterMenuButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [internalValues, setInternalValues] = useState<FilterValues>(values)
  const anchorRef = useRef<HTMLDivElement>(null)

  // Count active filters
  const getActiveFilterCount = (): number => {
    let count = 0
    if (internalValues.datePreset && internalValues.datePreset !== "all_time") count++
    if (internalValues.keywords && internalValues.keywords.length > 0) count++
    if (internalValues.amountMin !== undefined || internalValues.amountMax !== undefined) count++
    if (internalValues.methods && internalValues.methods.length > 0) count++
    if (internalValues.categories && internalValues.categories.length > 0) count++
    if (internalValues.glCodes && internalValues.glCodes.length > 0) count++
    if (internalValues.accounts && internalValues.accounts.length > 0) count++
    if (internalValues.cards && internalValues.cards.length > 0) count++
    if (internalValues.statuses && internalValues.statuses.length > 0) count++
    if (internalValues.policies && internalValues.policies.length > 0) count++
    if (internalValues.hasAttachments !== undefined) count++
    return count
  }

  const handleValuesChange = (newValues: FilterValues) => {
    setInternalValues(newValues)
    onValuesChange?.(newValues)
  }

  const activeFilterCount = getActiveFilterCount()

  return (
    <div ref={anchorRef} className={cn("relative", className)}>
      <FilterMenuTrigger
        isOpen={isOpen}
        activeFilterCount={activeFilterCount > 0 ? activeFilterCount : undefined}
        onClick={() => setIsOpen(!isOpen)}
      />
      <FilterMenu
        open={isOpen}
        onClose={() => setIsOpen(false)}
        anchorEl={anchorRef.current}
        values={internalValues}
        onValuesChange={handleValuesChange}
        viewName={viewName}
      />
    </div>
  )
}

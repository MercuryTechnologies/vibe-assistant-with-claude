"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { DSMoneyAmount } from "./ds-money-amount"
import { Icon } from "./icon"
import { faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons"

// ============================================================================
// Constants
// ============================================================================

const GROUPED_TABLE_ROW_HEIGHT = 49
const GROUPED_TABLE_LEFT_COL_WIDTH = 220
const GROUPED_TABLE_MONEY_COL_WIDTH = 164

// ============================================================================
// Types
// ============================================================================

export interface GroupedData<T> {
  /** Group key/name */
  groupKey: string
  /** Display label for the group */
  groupLabel: string
  /** Items in this group */
  items: T[]
  /** Total money in for this group */
  moneyIn: number
  /** Total money out for this group */
  moneyOut: number
}

export interface GroupedTableProps<T> {
  /** Grouped data to display */
  groups: GroupedData<T>[]
  /** Currently expanded group keys */
  expandedGroups?: Set<string>
  /** Callback when a group is expanded/collapsed */
  onToggleGroup?: (groupKey: string) => void
  /** Callback when "Expand group" is clicked */
  onExpandGroup?: (groupKey: string) => void
  /** Loading state */
  loading?: boolean
  /** Additional className */
  className?: string
  /** Render function for expanded group items */
  renderItems?: (items: T[], groupKey: string) => React.ReactNode
  /** Get unique key for each item */
  getItemKey?: (item: T) => string
}

// ============================================================================
// GroupedTable Component
// ============================================================================

export function GroupedTable<T>({
  groups,
  expandedGroups = new Set(),
  onToggleGroup,
  onExpandGroup,
  loading = false,
  className,
  renderItems,
  getItemKey,
}: GroupedTableProps<T>) {
  if (loading) {
    return (
      <div className={cn("w-full", className)}>
        {/* Loading skeleton */}
        {Array.from({ length: 5 }).map((_, idx) => (
          <div key={idx} className="flex border-b border-border">
            <div
              className="flex items-center gap-2 pl-6 pr-4"
              style={{ width: GROUPED_TABLE_LEFT_COL_WIDTH, height: GROUPED_TABLE_ROW_HEIGHT }}
            >
              <div className="w-6 h-6 ds-table-skeleton-bg rounded-md animate-pulse" />
              <div className="flex-1 h-5 ds-table-skeleton-bg rounded-md animate-pulse" />
            </div>
            <div className="flex-1 flex items-center px-4" style={{ height: GROUPED_TABLE_ROW_HEIGHT }}>
              <div className="w-32 h-5 ds-table-skeleton-bg rounded-md animate-pulse" />
            </div>
            <div
              className="flex items-center justify-end px-4"
              style={{ width: GROUPED_TABLE_MONEY_COL_WIDTH, height: GROUPED_TABLE_ROW_HEIGHT }}
            >
              <div className="w-20 h-5 ds-table-skeleton-bg rounded-md animate-pulse" />
            </div>
            <div
              className="flex items-center justify-end px-6"
              style={{ width: GROUPED_TABLE_MONEY_COL_WIDTH, height: GROUPED_TABLE_ROW_HEIGHT }}
            >
              <div className="w-20 h-5 ds-table-skeleton-bg rounded-md animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (groups.length === 0) {
    return (
      <div className={cn("w-full flex items-center justify-center py-12", className)}>
        <p className="text-body text-muted-foreground">No groups to display</p>
      </div>
    )
  }

  return (
    <div className={cn("w-full bg-background overflow-hidden", className)}>
      {groups.map((group) => {
        const isExpanded = expandedGroups.has(group.groupKey)
        const transactionCount = group.items.length
        const transactionText = transactionCount === 1 ? "1 transaction" : `${transactionCount} transactions`

        return (
          <div key={group.groupKey}>
            {/* Group Header Row */}
            <div
              className="ds-grouped-table-row flex items-stretch border-b border-border cursor-pointer"
              onClick={() => onToggleGroup?.(group.groupKey)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault()
                  onToggleGroup?.(group.groupKey)
                }
              }}
            >
              {/* Left Column (Group) */}
              <div
                className="flex items-center gap-2 px-4"
                style={{ width: GROUPED_TABLE_LEFT_COL_WIDTH, height: GROUPED_TABLE_ROW_HEIGHT }}
              >
                <Icon
                  icon={isExpanded ? faChevronUp : faChevronDown}
                  style={{
                    color: isExpanded ? "var(--ds-icon-default)" : "var(--ds-icon-secondary)",
                  }}
                />
                <span className="text-body truncate" style={{ color: "var(--ds-text-default)" }}>
                  {group.groupLabel}
                </span>
              </div>

              {/* Middle Column (Count + Expand link when collapsed) */}
              <div className="flex-1">
                <div
                  className="flex items-center"
                  style={{
                    height: GROUPED_TABLE_ROW_HEIGHT,
                    paddingLeft: 16,
                    paddingRight: 16,
                    gap: 3,
                  }}
                >
                  <span className="text-body" style={{ color: "var(--ds-text-default)" }}>
                    {transactionText}
                  </span>
                  {!isExpanded && (
                    <span className="ds-grouped-table-hover-actions">
                      <span className="text-body" style={{ color: "var(--ds-text-default)" }}>
                        ·
                      </span>
                      <button
                        className="text-body ds-link ds-grouped-table-expand-link"
                        onClick={(e) => {
                          e.stopPropagation()
                          onExpandGroup?.(group.groupKey)
                        }}
                      >
                        Expand group
                      </button>
                    </span>
                  )}
                </div>
              </div>

              {/* Money In Column */}
              <div
                className="shrink-0 flex items-center justify-end px-4"
                style={{ width: GROUPED_TABLE_MONEY_COL_WIDTH, height: GROUPED_TABLE_ROW_HEIGHT }}
              >
                <DSMoneyAmount amount={group.moneyIn} tone="auto" />
              </div>

              {/* Money Out Column */}
              <div
                className="shrink-0 flex items-center justify-end"
                style={{
                  width: GROUPED_TABLE_MONEY_COL_WIDTH,
                  height: GROUPED_TABLE_ROW_HEIGHT,
                  paddingLeft: 16,
                  paddingRight: 24,
                }}
              >
                <DSMoneyAmount amount={-Math.abs(group.moneyOut)} tone="auto" />
              </div>
            </div>

            {/* Expanded Items */}
            {isExpanded && renderItems && (
              <div className="border-b border-border">
                {renderItems(group.items, group.groupKey)}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ============================================================================
// Helper function to group transactions
// ============================================================================

export type GroupByField = "account" | "category" | "method" | "date"

export interface GroupableItem {
  id: string
  amount: number
  [key: string]: unknown
}

export function groupTransactions<T extends GroupableItem>(
  items: T[],
  groupBy: GroupByField,
  getGroupKey: (item: T) => string,
  getGroupLabel?: (item: T) => string
): GroupedData<T>[] {
  const groupMap = new Map<string, { items: T[], label: string }>()

  for (const item of items) {
    const key = getGroupKey(item)
    const label = getGroupLabel ? getGroupLabel(item) : key

    if (!groupMap.has(key)) {
      groupMap.set(key, { items: [], label })
    }
    groupMap.get(key)!.items.push(item)
  }

  return Array.from(groupMap.entries()).map(([groupKey, { items: groupItems, label }]) => {
    const moneyIn = groupItems
      .filter(item => item.amount > 0)
      .reduce((sum, item) => sum + item.amount, 0)
    
    const moneyOut = groupItems
      .filter(item => item.amount < 0)
      .reduce((sum, item) => sum + Math.abs(item.amount), 0)

    return {
      groupKey,
      groupLabel: label,
      items: groupItems,
      moneyIn,
      moneyOut,
    }
  })
}

// (No additional exports)

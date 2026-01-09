"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { DSCheckbox } from "./ds-checkbox"
import { DSMoneyAmount } from "./ds-money-amount"

// ============================================================================
// DSTable Variants
// ============================================================================

const dsTableVariants = cva(
  "w-full caption-bottom table-fixed border-collapse",
  {
    variants: {
      size: {
        sm: "text-tiny",
        md: "text-body",
        lg: "text-body-lg",
      },
      variant: {
        default: "",
        striped: "ds-table-striped",
        bordered: "border border-border rounded-lg overflow-hidden",
        fullWidth: "ds-table-full-width", // Full width with no side borders
        centered: "", // Centered with max-width 968px (container handles width)
      },
    },
    defaultVariants: {
      size: "md",
      variant: "default",
    },
  }
)

const dsTableHeaderVariants = cva(
  "ds-table-header-cell",
  {
    variants: {
      size: {
        sm: "h-10 py-2",
        md: "h-11 py-2.5",
        lg: "h-12 py-3",
      },
      sortable: {
        true: "cursor-pointer select-none ds-table-header-sortable",
        false: "",
      },
      isFirst: {
        true: "pl-4",
        false: "pl-3",
      },
      isLast: {
        true: "pr-4",
        false: "pr-3",
      },
      isFirstCentered: {
        true: "ds-table-first-centered",
        false: "",
      },
    },
    defaultVariants: {
      size: "md",
      sortable: false,
      isFirst: false,
      isLast: false,
      isFirstCentered: false,
    },
  }
)

const dsTableRowVariants = cva(
  "group border-b border-border transition-colors bg-background cursor-pointer relative",
  {
    variants: {
      interactive: {
        true: "",
        false: "",
      },
      selected: {
        true: "ds-table-row-selected",
        false: "",
      },
      extendedHover: {
        // Centered tables use per-cell hover background + rounded edges (see render below)
        // Hide the hovered row border + the "top border" (previous row's bottom border)
        // so only the hover container border remains visible.
        true: "ds-table-row-extended-hover",
        false: "ds-table-row-hover",
      },
    },
    defaultVariants: {
      interactive: true,
      selected: false,
      extendedHover: false,
    },
  }
)

const dsTableCellVariants = cva(
  // Body row height: 64px (border is on <tr>, so not included here)
  "ds-table-body-cell",
  {
    variants: {
      size: {
        // Row height is controlled via `.ds-table-body-cell { height: 50px; }` in CSS.
        // Keep vertical padding at 0 so rows are exactly 50px excluding the <tr> border.
        sm: "py-0",
        md: "py-0",
        lg: "py-0",
      },
      align: {
        left: "text-left",
        center: "text-center",
        right: "text-right",
      },
      isFirst: {
        true: "pl-4",
        false: "pl-3",
      },
      isLast: {
        true: "pr-4",
        false: "pr-3",
      },
      isFirstCentered: {
        true: "ds-table-first-centered",
        false: "",
      },
    },
    defaultVariants: {
      size: "md",
      align: "left",
      isFirst: false,
      isLast: false,
      isFirstCentered: false,
    },
  }
)

// ============================================================================
// Column Header Icons (SVG)
// ============================================================================

function ArrowUpIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn("ds-table-sort-icon", className)}
      viewBox="0 0 384 512"
      fill="currentColor"
    >
      <path d="M214.6 41.4c-12.5-12.5-32.8-12.5-45.3 0l-160 160c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L160 141.2V448c0 17.7 14.3 32 32 32s32-14.3 32-32V141.2L329.4 246.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-160-160z" />
    </svg>
  )
}

function ArrowDownIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn("ds-table-sort-icon", className)}
      viewBox="0 0 384 512"
      fill="currentColor"
    >
      <path d="M169.4 470.6c12.5 12.5 32.8 12.5 45.3 0l160-160c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L224 370.8V64c0-17.7-14.3-32-32-32s-32 14.3-32 32v306.7L54.6 265.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l160 160z" />
    </svg>
  )
}

function ArrowUpDownIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn("ds-table-sort-icon", className)}
      viewBox="0 0 576 512"
      fill="currentColor"
    >
      <path d="M151.6 42.4C145.5 35.8 136 32 126.1 32s-19.4 3.8-25.5 10.4l-88 96c-11.9 13-11.1 33.3 2 45.2s33.3 11.1 45.2-2L96 141.2V432c0 17.7 14.3 32 32 32s32-14.3 32-32V141.2l36.2 39.4c11.9 13 32.2 13.9 45.2 2s13.9-32.2 2-45.2l-92.8-96zM320 480h32c17.7 0 32-14.3 32-32s-14.3-32-32-32H320c-17.7 0-32 14.3-32 32s14.3 32 32 32zm0-128h96c17.7 0 32-14.3 32-32s-14.3-32-32-32H320c-17.7 0-32 14.3-32 32s14.3 32 32 32zm0-128H480c17.7 0 32-14.3 32-32s-14.3-32-32-32H320c-17.7 0-32 14.3-32 32s14.3 32 32 32zm0-128H544c17.7 0 32-14.3 32-32s-14.3-32-32-32H320c-17.7 0-32 14.3-32 32s14.3 32 32 32z" />
    </svg>
  )
}

// ============================================================================
// Column Label Component (matches Figma design)
// ============================================================================

interface ColumnLabelProps {
  title: string
  sortState?: "none" | "asc" | "desc"
  sortable?: boolean
  aligned?: "left" | "center" | "right"
  onClick?: () => void
}

function ColumnLabel({ 
  title, 
  sortState = "none", 
  sortable = false, 
  aligned = "left",
  onClick 
}: ColumnLabelProps) {
  const isRightAligned = aligned === "right"

  // Container uses negative margin to allow hover bg to extend beyond text alignment
  // Padding matches Figma: left-aligned 6px/2px, right-aligned 2px/6px
  const containerClasses = cn(
    "group inline-flex items-center overflow-clip rounded-sm transition-colors",
    sortable && "cursor-pointer ds-column-label-sortable"
  )
  
  const textElement = (
    <span className="ds-column-label-text">
      {title}
    </span>
  )
  
  // Icon container is always 24x24, but content varies based on sort state
  const iconContainer = (
    <span className="flex items-center justify-center w-6 h-6 shrink-0">
      {sortState === "asc" ? (
        <ArrowUpIcon className="text-ds-700" />
      ) : sortState === "desc" ? (
        <ArrowDownIcon className="text-ds-700" />
      ) : sortable ? (
        // Figma: show arrow-up-arrow-down on hover when not sorted
        <ArrowUpDownIcon className="text-ds-400 ds-table-sort-icon-hover" />
      ) : null}
    </span>
  )
  
  return (
    <span
      className={containerClasses}
      onClick={onClick}
      role={sortable ? "button" : undefined}
      tabIndex={sortable ? 0 : undefined}
    >
      {isRightAligned ? (
        <>
          {iconContainer}
          {textElement}
        </>
      ) : (
        <>
          {textElement}
          {iconContainer}
        </>
      )}
    </span>
  )
}

// Legacy SortIcon for backwards compatibility
interface SortIconProps {
  direction: "asc" | "desc" | null
}

function SortIcon({ direction }: SortIconProps) {
  if (direction === "asc") {
    return <ArrowUpIcon className="ml-1 text-ds-700" />
  }
  if (direction === "desc") {
    return <ArrowDownIcon className="ml-1 text-ds-700" />
  }
  return null
}

// ============================================================================
// Types
// ============================================================================

export type SortDirection = "asc" | "desc" | null

export interface DSTableColumn<T> {
  /** Unique identifier for the column */
  id: string
  /** Header text to display */
  header: string
  /** Key to access data from row object, or render function */
  accessor: keyof T | ((row: T) => React.ReactNode)
  /** Column alignment */
  align?: "left" | "center" | "right"
  /** Column width (CSS value) */
  width?: string
  /** Whether this column is sortable */
  sortable?: boolean
  /** Custom cell renderer */
  cell?: (value: unknown, row: T) => React.ReactNode
}

// ============================================================================
// Money column helpers
// ============================================================================

function isAmountColumn(column: Pick<DSTableColumn<unknown>, "id" | "header">) {
  const id = column.id.toLowerCase()
  const header = column.header.toLowerCase()
  return id.includes("amount") || header.includes("amount")
}

function isMoneyLikeColumnName(column: Pick<DSTableColumn<unknown>, "id" | "header">) {
  const id = column.id.toLowerCase()
  const header = column.header.toLowerCase()

  // Broader than "amount" to cover real-world money fields (e.g. "spentThisMonth")
  const tokens = [
    "amount",
    "spent",
    "total",
    "balance",
    "price",
    "cost",
    "fee",
    "paid",
    "due",
    "payment",
    "revenue",
    "income",
    "expense",
  ]

  return tokens.some((t) => id.includes(t) || header.includes(t))
}

function parseMoneyString(value: string): number | null {
  const raw = value.trim()
  if (!raw) return null

  // Handle "(123.45)" as negative
  const isParensNegative = raw.startsWith("(") && raw.endsWith(")")
  const normalized = (isParensNegative ? raw.slice(1, -1) : raw)
    .replaceAll("−", "-")
    .replaceAll(",", "")
    .replaceAll("$", "")
    .trim()

  // Strip everything except digits, sign, and decimal point
  const cleaned = normalized.replace(/[^\d.+-]/g, "")
  if (!cleaned) return null

  const parsed = Number.parseFloat(cleaned)
  if (!Number.isFinite(parsed)) return null

  return isParensNegative ? -parsed : parsed
}

function coerceMoneyValue(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value
  if (typeof value === "string") return parseMoneyString(value)
  return null
}

export interface DSTableDetailPanelRenderContext<T> {
  /** The currently selected row (or null if none is selected) */
  row: T | null
  /** Whether the detail panel should be visible */
  isOpen: boolean
  /** Helper to close the detail panel from within the renderer */
  close: () => void
}

export interface DSTableProps<T>
  extends VariantProps<typeof dsTableVariants> {
  /** Array of column definitions */
  columns: DSTableColumn<T>[]
  /** Array of data rows */
  data: T[]
  /** Function to get unique key for each row */
  getRowKey: (row: T) => string
  /** Additional className for the table container */
  className?: string
  /** Additional className for the table */
  tableClassName?: string
  /** Callback when row is clicked */
  onRowClick?: (row: T) => void
  /** Currently selected row key */
  selectedRowKey?: string | null
  /** Callback when sort changes */
  onSort?: (columnId: string, direction: SortDirection) => void
  /** Current sort state */
  sortState?: { columnId: string; direction: SortDirection }
  /** Show loading skeleton */
  loading?: boolean
  /** Number of skeleton rows to show when loading */
  loadingRowCount?: number
  /** Empty state message */
  emptyMessage?: string
  /** Empty state component */
  emptyComponent?: React.ReactNode
  /** Sticky header */
  stickyHeader?: boolean
  /** Enable row selection with checkboxes */
  selectable?: boolean
  /** Set of selected row keys */
  selectedRowKeys?: Set<string>
  /** Callback when selection changes */
  onSelectionChange?: (selectedKeys: Set<string>) => void
  /** Optional renderer to show a row detail panel (click row to toggle) */
  renderDetailPanel?: (context: DSTableDetailPanelRenderContext<T>) => React.ReactNode
  /** Callback fired when the detail panel open state changes */
  onDetailPanelOpenChange?: (open: boolean, row: T | null) => void
}

// ============================================================================
// DSTable Component
// ============================================================================

function DSTableComponent<T>(
  {
    columns,
    data,
    getRowKey,
    className,
    tableClassName,
    size = "md",
    variant = "default",
    onRowClick,
    selectedRowKey,
    onSort,
    sortState,
    loading = false,
    loadingRowCount = 5,
    emptyMessage = "No data available",
    emptyComponent,
    stickyHeader = false,
    selectable = false,
    selectedRowKeys = new Set(),
    onSelectionChange,
    renderDetailPanel,
    onDetailPanelOpenChange,
  }: DSTableProps<T>,
  ref: React.ForwardedRef<HTMLTableElement>
) {
  // `detailPanelOpenRow` controls whether the panel is open.
  // `detailPanelRenderRow` keeps the last selected row mounted so the panel can animate out smoothly.
  const [detailPanelOpenRow, setDetailPanelOpenRow] = React.useState<T | null>(null)
  const [detailPanelRenderRow, setDetailPanelRenderRow] = React.useState<T | null>(null)

  const closeDetailPanel = React.useCallback(() => {
    setDetailPanelOpenRow(null)
    onDetailPanelOpenChange?.(false, null)
  }, [onDetailPanelOpenChange])

  // Close the detail panel if the selected row no longer exists (e.g., after filtering)
  React.useEffect(() => {
    if (!renderDetailPanel || !detailPanelRenderRow) return

    const selectedKey = getRowKey(detailPanelRenderRow)
    const stillExists = data.some((row) => getRowKey(row) === selectedKey)

    if (!stillExists) {
      setDetailPanelOpenRow(null)
      setDetailPanelRenderRow(null)
      onDetailPanelOpenChange?.(false, null)
    }
  }, [data, detailPanelRenderRow, getRowKey, renderDetailPanel, onDetailPanelOpenChange])

  const handleHeaderClick = (column: DSTableColumn<T>) => {
    if (!column.sortable || !onSort) return

    const currentDirection = sortState?.columnId === column.id ? sortState.direction : null
    let newDirection: SortDirection = "asc"

    if (currentDirection === "asc") {
      newDirection = "desc"
    } else if (currentDirection === "desc") {
      newDirection = null
    }

    onSort(column.id, newDirection)
  }

  const getCellValue = (row: T, column: DSTableColumn<T>) => {
    if (typeof column.accessor === "function") {
      return column.accessor(row)
    }
    return row[column.accessor]
  }

  const moneyColumnIds = React.useMemo(() => {
    const ids = new Set<string>()

    for (const column of columns) {
      if (isMoneyLikeColumnName(column)) {
        ids.add(column.id)
        continue
      }

      // Fall back to sniffing the first rows for currency-like output.
      // This is important for columns like "Spent this month" where the cell renderer formats "$...".
      for (const row of data) {
        const rawValue =
          typeof column.accessor === "function" ? column.accessor(row) : row[column.accessor]

        if (typeof rawValue === "string" && rawValue.includes("$")) {
          ids.add(column.id)
          break
        }

        if (column.cell) {
          const rendered = column.cell(rawValue, row)
          if (typeof rendered === "string" && rendered.includes("$")) {
            ids.add(column.id)
            break
          }
        }
      }
    }

    return ids
  }, [columns, data])

  const renderCellContent = (row: T, column: DSTableColumn<T>) => {
    const value = getCellValue(row, column)
    const treatAsAmount = moneyColumnIds.has(column.id) || isAmountColumn(column)

    if (column.cell) {
      const rendered = column.cell(value, row)

      // If an "Amount" cell renderer returns a raw string/number,
      // normalize it to the DS money display.
      if (treatAsAmount) {
        const coerced = coerceMoneyValue(rendered)
        if (coerced !== null) return <DSMoneyAmount amount={coerced} />
      }

      return rendered
    }

    if (treatAsAmount) {
      const coerced = coerceMoneyValue(value)
      if (coerced !== null) return <DSMoneyAmount amount={coerced} />
    }

    return value as React.ReactNode
  }

  const handleRowClick = (row: T) => {
    onRowClick?.(row)

    if (renderDetailPanel) {
      const clickedRowKey = getRowKey(row)

      setDetailPanelOpenRow((previous) => {
        const previousKey = previous ? getRowKey(previous) : null
        const nextRow = previousKey === clickedRowKey ? null : row

        // Keep last row mounted for animation even when closing.
        setDetailPanelRenderRow(nextRow ?? row)

        onDetailPanelOpenChange?.(!!nextRow, nextRow)
        return nextRow
      })
    }
  }

  // Selection helpers
  const allRowKeys = React.useMemo(() => data.map(row => getRowKey(row)), [data, getRowKey])
  const allSelected = allRowKeys.length > 0 && allRowKeys.every(key => selectedRowKeys.has(key))
  const someSelected = allRowKeys.some(key => selectedRowKeys.has(key))
  const indeterminate = someSelected && !allSelected

  const handleSelectAll = () => {
    if (!onSelectionChange) return
    
    if (allSelected) {
      // Deselect all
      onSelectionChange(new Set())
    } else {
      // Select all
      onSelectionChange(new Set(allRowKeys))
    }
  }

  const handleSelectRow = (rowKey: string) => {
    if (!onSelectionChange) return
    
    const newSelectedKeys = new Set(selectedRowKeys)
    if (newSelectedKeys.has(rowKey)) {
      newSelectedKeys.delete(rowKey)
    } else {
      newSelectedKeys.add(rowKey)
    }
    onSelectionChange(newSelectedKeys)
  }

  const isCentered = variant === "centered"
  
  const containerClasses = cn(
    "relative",
    isCentered ? "ds-table-centered-container" : "w-full",
    className
  )

  // Loading skeleton
  if (loading) {
    return (
      <div
        data-slot="ds-table-container"
        className={containerClasses}
        style={{ ["--ds-table-detail-panel-duration" as never]: "200ms" }}
      >
        <table
          ref={ref}
          data-slot="ds-table"
          className={cn(dsTableVariants({ size, variant }), tableClassName)}
        >
          <thead
            data-slot="ds-table-header"
            className={cn(
              "border-b border-border",
              stickyHeader && "sticky top-0 z-10 bg-background"
            )}
          >
            <tr>
              {selectable && (
                <th
                  className={cn(
                    dsTableHeaderVariants({ 
                      size, 
                      sortable: false,
                      isFirst: true,
                      isLast: false,
                    }),
                    "ds-table-checkbox-col"
                  )}
                >
                  <DSCheckbox labelStyle="none" disabled />
                </th>
              )}
              {columns.map((column, colIdx) => {
                const isFirstColumn = !selectable && colIdx === 0
                const shouldUseCenteredPadding = isCentered && isFirstColumn
                const align = (moneyColumnIds.has(column.id) || isAmountColumn(column)) ? "right" : column.align
                
                return (
                  <th
                    key={column.id}
                    className={cn(
                      dsTableHeaderVariants({ 
                        size, 
                        sortable: false,
                        isFirst: isFirstColumn && !shouldUseCenteredPadding,
                        isLast: colIdx === columns.length - 1,
                        isFirstCentered: shouldUseCenteredPadding,
                      }),
                      align === "right" && "text-right",
                      align === "center" && "text-center"
                    )}
                    style={{ width: column.width }}
                  >
                    {align === "right" || align === "center" ? (
                      <div className={cn(
                        "flex w-full",
                        align === "center" && "justify-center",
                        align === "right" && "justify-end"
                      )}>
                        <ColumnLabel
                          title={column.header}
                          sortable={false}
                          sortState="none"
                          aligned={align === "right" ? "right" : "center"}
                        />
                      </div>
                    ) : (
                      <ColumnLabel
                        title={column.header}
                        sortable={false}
                        sortState="none"
                        aligned="left"
                      />
                    )}
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody data-slot="ds-table-body">
            {Array.from({ length: loadingRowCount }).map((_, rowIdx) => (
              <tr 
                key={rowIdx} 
                className={dsTableRowVariants({ extendedHover: isCentered })}
              >
                {selectable && (
                  <td
                    className={cn(
                      dsTableCellVariants({ 
                        size, 
                        align: "left",
                        isFirst: true,
                        isLast: false,
                      }),
                      "ds-table-checkbox-col"
                    )}
                  >
                    <div className="ds-table-skeleton-checkbox ds-table-skeleton-bg rounded-md animate-pulse" />
                  </td>
                )}
                {columns.map((column, colIdx) => {
                  const isFirstColumn = !selectable && colIdx === 0
                  const shouldUseCenteredPadding = isCentered && isFirstColumn
                  const align = (moneyColumnIds.has(column.id) || isAmountColumn(column)) ? "right" : column.align
                  
                  return (
                    <td
                      key={column.id}
                      className={cn(
                        dsTableCellVariants({ 
                          size, 
                          align,
                          isFirst: isFirstColumn && !shouldUseCenteredPadding,
                          isLast: colIdx === columns.length - 1,
                          isFirstCentered: shouldUseCenteredPadding,
                        })
                      )}
                    >
                      <div className={cn(
                        "h-5 ds-table-skeleton-bg rounded-md animate-pulse",
                        align === "right" && "ml-auto w-3/4",
                        align === "center" && "mx-auto w-1/2"
                      )} />
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  // Empty state
  if (data.length === 0) {
    return (
      <div
        data-slot="ds-table-container"
        className={containerClasses}
        style={{ ["--ds-table-detail-panel-duration" as never]: "200ms" }}
      >
        <table
          ref={ref}
          data-slot="ds-table"
          className={cn(dsTableVariants({ size, variant }), tableClassName)}
        >
          <thead
            data-slot="ds-table-header"
            className={cn(
              "border-b border-border",
              stickyHeader && "sticky top-0 z-10 bg-background"
            )}
          >
            <tr>
              {selectable && (
                <th
                  className={cn(
                    dsTableHeaderVariants({ 
                      size, 
                      sortable: false,
                      isFirst: true,
                      isLast: false,
                    }),
                    "ds-table-checkbox-col"
                  )}
                >
                  <DSCheckbox labelStyle="none" disabled />
                </th>
              )}
              {columns.map((column, colIdx) => {
                const isFirstColumn = !selectable && colIdx === 0
                const align = (moneyColumnIds.has(column.id) || isAmountColumn(column)) ? "right" : column.align
                
                return (
                  <th
                    key={column.id}
                    className={cn(
                      dsTableHeaderVariants({ 
                        size, 
                        sortable: false,
                        isFirst: isFirstColumn,
                        isLast: colIdx === columns.length - 1,
                        isFirstCentered: isCentered && isFirstColumn,
                      }),
                      align === "right" && "text-right",
                      align === "center" && "text-center"
                    )}
                    style={{ width: column.width }}
                  >
                    {align === "right" || align === "center" ? (
                      <div className={cn(
                        "flex w-full",
                        align === "center" && "justify-center",
                        align === "right" && "justify-end"
                      )}>
                        <ColumnLabel
                          title={column.header}
                          sortable={column.sortable}
                          sortState="none"
                          aligned={align === "right" ? "right" : "center"}
                        />
                      </div>
                    ) : (
                      <ColumnLabel
                        title={column.header}
                        sortable={column.sortable}
                        sortState="none"
                        aligned="left"
                      />
                    )}
                  </th>
                )
              })}
            </tr>
          </thead>
        </table>
        <div className="flex items-center justify-center py-12">
          {emptyComponent || (
            <p className="text-body text-muted-foreground">{emptyMessage}</p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div
      data-slot="ds-table-container"
      className={cn(containerClasses, "relative")}
      data-all-selected={selectable && allSelected ? "true" : undefined}
      style={{ ["--ds-table-detail-panel-duration" as never]: "200ms" }}
    >
      <table
        ref={ref}
        data-slot="ds-table"
        className={cn(dsTableVariants({ size, variant }), tableClassName)}
      >
        <thead
          data-slot="ds-table-header"
          className={cn(
            "border-b border-border",
            stickyHeader && "sticky top-0 z-10 bg-background"
          )}
        >
          <tr>
            {selectable && (
              <th
                className={cn(
                  dsTableHeaderVariants({ 
                    size, 
                    sortable: false,
                    isFirst: true,
                    isLast: false,
                  }),
                  "ds-table-checkbox-col"
                )}
              >
                <DSCheckbox
                  labelStyle="none"
                  checked={allSelected}
                  indeterminate={indeterminate}
                  onChange={handleSelectAll}
                  aria-label="Select all rows"
                />
              </th>
            )}
            {columns.map((column, colIdx) => {
              const isSorted = sortState?.columnId === column.id
              const sortDirection = isSorted ? sortState.direction : null
              const sortStateValue = sortDirection === "asc" ? "asc" : sortDirection === "desc" ? "desc" : "none"
              const isFirstColumn = !selectable && colIdx === 0
              const shouldUseCenteredPadding = isCentered && isFirstColumn
              const align = (moneyColumnIds.has(column.id) || isAmountColumn(column)) ? "right" : column.align

              return (
                <th
                  key={column.id}
                  className={cn(
                  dsTableHeaderVariants({ 
                    size, 
                    sortable: false, // Remove default sortable styling, handled by ColumnLabel
                    isFirst: isFirstColumn && !shouldUseCenteredPadding,
                    isLast: colIdx === columns.length - 1,
                    isFirstCentered: shouldUseCenteredPadding,
                  }),
                    align === "right" && "text-right",
                    align === "center" && "text-center"
                  )}
                  style={{ width: column.width }}
                  aria-sort={
                    sortDirection === "asc"
                      ? "ascending"
                      : sortDirection === "desc"
                      ? "descending"
                      : undefined
                  }
                >
                  {align === "right" || align === "center" ? (
                    <div className={cn(
                      "flex w-full",
                      align === "center" && "justify-center",
                      align === "right" && "justify-end"
                    )}>
                      <ColumnLabel
                        title={column.header}
                        sortable={column.sortable}
                        sortState={sortStateValue}
                        aligned={align === "right" ? "right" : align === "center" ? "center" : "left"}
                        onClick={column.sortable ? () => handleHeaderClick(column) : undefined}
                      />
                    </div>
                  ) : (
                    <ColumnLabel
                      title={column.header}
                      sortable={column.sortable}
                      sortState={sortStateValue}
                      aligned="left"
                      onClick={column.sortable ? () => handleHeaderClick(column) : undefined}
                    />
                  )}
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody data-slot="ds-table-body">
          {data.map((row, rowIndex) => {
            const rowKey = getRowKey(row)
            const isLastRow = rowIndex === data.length - 1
            const isSelected =
              selectedRowKey === rowKey ||
              selectedRowKeys.has(rowKey) ||
              (detailPanelOpenRow ? getRowKey(detailPanelOpenRow) === rowKey : false)

            const isInteractive = !!onRowClick || selectable || !!renderDetailPanel
            const finalClassName = cn(
              dsTableRowVariants({
                interactive: isInteractive,
                selected: !isCentered && isSelected,
                extendedHover: isCentered,
              }),
              isLastRow && "border-b-0"
            )

            return (
              <tr
                key={rowKey}
                data-slot="ds-table-row"
                className={finalClassName}
                onClick={() => handleRowClick(row)}
                data-state={isSelected ? "selected" : undefined}
              >
                {selectable && (
                  <td
                    data-slot="ds-table-cell"
                    className={cn(
                      dsTableCellVariants({ 
                        size, 
                        align: "left",
                        isFirst: true,
                        isLast: false,
                      }),
                      "ds-table-checkbox-col",
                      isCentered && "ds-table-cell-hover-layer ds-table-cell-hover-first"
                    )}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span
                      className={cn(
                        "ds-table-checkbox-content",
                        isCentered ? "ds-table-cell-content" : "relative z-10"
                      )}
                    >
                      <DSCheckbox
                        labelStyle="none"
                        checked={selectedRowKeys.has(rowKey)}
                        onChange={() => handleSelectRow(rowKey)}
                        aria-label={`Select row ${rowKey}`}
                      />
                    </span>
                  </td>
                )}
                {columns.map((column, colIdx) => {
                  const isFirstColumn = !selectable && colIdx === 0
                  const shouldUseCenteredPadding = isCentered && isFirstColumn
                  const isLastColumn = colIdx === columns.length - 1
                  const align = (moneyColumnIds.has(column.id) || isAmountColumn(column)) ? "right" : column.align
                  
                  // Determine cell hover layer class for centered tables
                  let cellHoverLayerClass = ""
                  if (isCentered) {
                    if (isFirstColumn && isLastColumn) {
                      cellHoverLayerClass = "ds-table-cell-hover-layer ds-table-cell-hover-only"
                    } else if (isFirstColumn) {
                      cellHoverLayerClass = "ds-table-cell-hover-layer ds-table-cell-hover-first"
                    } else if (isLastColumn) {
                      cellHoverLayerClass = "ds-table-cell-hover-layer ds-table-cell-hover-last"
                    } else {
                      cellHoverLayerClass = "ds-table-cell-hover-layer ds-table-cell-hover-middle"
                    }
                  }
                  
                  return (
                    <td
                      key={column.id}
                      data-slot="ds-table-cell"
                      className={cn(
                        dsTableCellVariants({ 
                          size, 
                          align,
                          isFirst: isFirstColumn && !shouldUseCenteredPadding,
                          isLast: isLastColumn,
                          isFirstCentered: shouldUseCenteredPadding,
                        }),
                        cellHoverLayerClass
                      )}
                    >
                      <span className={cn("block truncate", isCentered && "ds-table-cell-content")}>
                        {renderCellContent(row, column)}
                      </span>
                    </td>
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
      {/* Detail Panel Container */}
      {renderDetailPanel && (
        <div className="ds-table-detail-panel-container">
          {renderDetailPanel({
            row: detailPanelRenderRow,
            isOpen: !!detailPanelOpenRow,
            close: closeDetailPanel,
          })}
        </div>
      )}
    </div>
  )
}

// Forward ref with generic support
export const DSTable = React.forwardRef(DSTableComponent) as <T>(
  props: DSTableProps<T> & { ref?: React.ForwardedRef<HTMLTableElement> }
) => React.ReactElement

// ============================================================================
// Convenience Components for Custom Tables
// ============================================================================

interface DSTableContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function DSTableContainer({
  className,
  children,
  ...props
}: DSTableContainerProps) {
  return (
    <div
      data-slot="ds-table-container"
      className={cn("relative w-full overflow-x-auto", className)}
      {...props}
    >
      {children}
    </div>
  )
}

interface DSTableRootProps
  extends React.HTMLAttributes<HTMLTableElement>,
    VariantProps<typeof dsTableVariants> {}

export function DSTableRoot({
  className,
  size,
  variant,
  ...props
}: DSTableRootProps) {
  return (
    <table
      data-slot="ds-table"
      className={cn(dsTableVariants({ size, variant }), className)}
      {...props}
    />
  )
}

interface DSTableHeaderProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  sticky?: boolean
}

export function DSTableHeader({
  className,
  sticky,
  ...props
}: DSTableHeaderProps) {
  return (
    <thead
      data-slot="ds-table-header"
      className={cn(
        "ds-table-header-bg border-b border-border",
        sticky && "sticky top-0 z-10",
        className
      )}
      {...props}
    />
  )
}

export function DSTableBody({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tbody
      data-slot="ds-table-body"
      className={className}
      {...props}
    />
  )
}

interface DSTableRowProps
  extends React.HTMLAttributes<HTMLTableRowElement>,
    VariantProps<typeof dsTableRowVariants> {}

export function DSTableRow({
  className,
  interactive,
  selected,
  style,
  ...props
}: DSTableRowProps) {
  return (
    <tr
      data-slot="ds-table-row"
      className={cn(dsTableRowVariants({ interactive, selected }), className)}
      style={style}
      data-state={selected ? "selected" : undefined}
      {...props}
    />
  )
}

interface DSTableHeadProps
  extends React.ThHTMLAttributes<HTMLTableCellElement>,
    VariantProps<typeof dsTableHeaderVariants> {}

export function DSTableHead({
  className,
  size,
  sortable,
  ...props
}: DSTableHeadProps) {
  return (
    <th
      data-slot="ds-table-head"
      className={cn(dsTableHeaderVariants({ size, sortable }), className)}
      {...props}
    />
  )
}

interface DSTableCellProps
  extends Omit<React.TdHTMLAttributes<HTMLTableCellElement>, 'align'>,
    VariantProps<typeof dsTableCellVariants> {}

export function DSTableCell({
  className,
  size,
  align,
  ...props
}: DSTableCellProps) {
  return (
    <td
      data-slot="ds-table-cell"
      className={cn(dsTableCellVariants({ size, align }), className)}
      {...props}
    />
  )
}

export function DSTableFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tfoot
      data-slot="ds-table-footer"
      className={cn(
        "ds-table-footer-bg border-t border-border font-medium",
        className
      )}
      {...props}
    />
  )
}

// ============================================================================
// Exports
// ============================================================================

export {
  dsTableVariants,
  dsTableHeaderVariants,
  dsTableRowVariants,
  dsTableCellVariants,
  SortIcon,
}

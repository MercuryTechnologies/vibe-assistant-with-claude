"use client"

import { cn } from "@/lib/utils"
import { DSButton } from "./ds-button"

// ============================================================================
// Icons
// ============================================================================

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg
      style={{ width: 11, height: 11, flexShrink: 0 }}
      className={className}
      viewBox="0 0 512 512"
      fill="currentColor"
    >
      <path d="M233.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L256 338.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z" />
    </svg>
  )
}

function ChevronUpIcon({ className }: { className?: string }) {
  return (
    <svg
      style={{ width: 11, height: 11, flexShrink: 0 }}
      className={className}
      viewBox="0 0 512 512"
      fill="currentColor"
    >
      <path d="M233.4 105.4c12.5-12.5 32.8-12.5 45.3 0l192 192c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L256 173.3 86.6 342.6c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3l192-192z" />
    </svg>
  )
}

// ============================================================================
// Types
// ============================================================================

export interface MonthlySummaryProps {
  /** Net change amount (positive or negative) */
  netChange: number
  /** Total money in */
  moneyIn: number
  /** Total money out */
  moneyOut: number
  /** Label for the summary period */
  periodLabel?: string
  /** Whether the section is expanded */
  expanded?: boolean
  /** Callback when expand/collapse is clicked */
  onToggle?: () => void
  /** Additional className */
  className?: string
}

// ============================================================================
// Helper Components
// ============================================================================

function formatMoney(amount: number, showSign = false): { main: string; cents: string } {
  const absAmount = Math.abs(amount)
  const dollars = Math.floor(absAmount)
  const cents = Math.round((absAmount - dollars) * 100).toString().padStart(2, '0')
  const formattedDollars = dollars.toLocaleString('en-US')
  
  let sign = ''
  if (showSign && amount < 0) {
    sign = '−'
  }
  
  return {
    main: `${sign}$${formattedDollars}`,
    cents,
  }
}

interface SummaryItemProps {
  label: string
  amount: number
  isPositive?: boolean
  showNegativeSign?: boolean
}

function SummaryItem({ label, amount, isPositive, showNegativeSign = false }: SummaryItemProps) {
  const { main, cents } = formatMoney(amount, showNegativeSign)
  
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-label text-muted-foreground">
        {label}
      </span>
      <span 
        className="tabular-nums"
        style={{
          fontSize: 20,
          lineHeight: "28px",
          color: isPositive ? "var(--color-success)" : "var(--color-text-primary)",
        }}
      >
        {main}<span className="text-label align-top">.{cents}</span>
      </span>
    </div>
  )
}

// ============================================================================
// MonthlySummary Component
// ============================================================================

export function MonthlySummary({
  netChange,
  moneyIn,
  moneyOut,
  periodLabel = "Net change this month",
  expanded = false,
  onToggle,
  className,
}: MonthlySummaryProps) {
  const isPositive = netChange >= 0
  
  return (
    <div
      data-slot="monthly-summary"
      className={cn(
        "flex items-center justify-between py-4 px-4 bg-background border-b border-border",
        className
      )}
    >
      {/* Summary Items */}
      <div className="flex items-center gap-10">
        <SummaryItem 
          label={periodLabel}
          amount={netChange}
          isPositive={isPositive}
        />
        <SummaryItem 
          label="Money in"
          amount={moneyIn}
        />
        <SummaryItem 
          label="Money out"
          amount={moneyOut}
          showNegativeSign
        />
      </div>
      
      {/* Expand/Collapse Button */}
      {onToggle && (
        <DSButton
          variant="tertiary"
          size="small"
          iconOnly
          onClick={onToggle}
          aria-label={expanded ? "Collapse" : "Expand"}
        >
          {expanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
        </DSButton>
      )}
    </div>
  )
}

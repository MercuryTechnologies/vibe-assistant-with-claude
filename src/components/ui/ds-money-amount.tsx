import * as React from "react"
import { cn } from "@/lib/utils"

export interface DSMoneyAmountProps {
  amount: number
  /** "auto" matches trx semantics (green for positive, gray for negative). "neutral" always uses neutral text. */
  tone?: "auto" | "neutral"
  className?: string
}

/**
 * Design-system money amount display.
 * Matches the Transactions page "ascended cents" style.
 */
export function DSMoneyAmount({
  amount,
  tone = "neutral",
  className,
}: DSMoneyAmountProps) {
  const isPositive = amount >= 0
  const absAmount = Math.abs(amount)

  // Avoid edge cases like 1.999 rounding cents to "100"
  const totalCents = Math.round(absAmount * 100)
  const dollars = Math.floor(totalCents / 100)
  const cents = String(totalCents % 100).padStart(2, "0")

  const formattedDollars = dollars.toLocaleString("en-US")
  const amountText = `${isPositive ? "" : "−"}$${formattedDollars}`
  const textTone =
    tone === "auto" ? (isPositive ? "text-ds-success" : "text-ds-700") : "text-ds-700"

  return (
    <span
      className={cn(
        "whitespace-nowrap",
        textTone,
        className
      )}
      style={{ fontVariantNumeric: "tabular-nums" }}
    >
      {amountText}
      <span className="ds-money-amount-cents">.{cents}</span>
    </span>
  )
}


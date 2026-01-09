import { DSMoneyAmount } from "@/components/ui/ds-money-amount"

interface MoneyAmountProps {
  amount: number
}

/**
 * Legacy wrapper for transactions money display.
 * Prefer `DSMoneyAmount` directly.
 */
export function MoneyAmount({ amount }: MoneyAmountProps) {
  return <DSMoneyAmount amount={amount} tone="auto" />
}

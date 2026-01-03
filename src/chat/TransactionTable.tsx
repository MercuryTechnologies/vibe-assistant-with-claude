// =============================================================================
// Transaction Table Component
// =============================================================================
// Renders a formatted table of transactions within chat messages

import React from 'react'
import { TransactionTableMetadata } from './types'

interface TransactionTableProps {
  data: TransactionTableMetadata
  onViewTransaction?: (url: string) => void
}

/**
 * Format a number as USD currency
 */
function formatCurrency(amount: number): string {
  const isNegative = amount < 0
  const absAmount = Math.abs(amount)
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(absAmount)
  
  return isNegative ? `-${formatted}` : formatted
}

/**
 * Format a date string to readable format
 */
function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

export default function TransactionTable({ data, onViewTransaction }: TransactionTableProps) {
  const { title, rows, showCategory = false, showType = false } = data

  if (!rows || rows.length === 0) {
    return null
  }

  return (
    <div className="my-3 overflow-hidden rounded-lg border border-[rgba(112,115,147,0.16)] bg-white">
      {title && (
        <div className="px-3 py-2 border-b border-[rgba(112,115,147,0.12)] bg-[#fafafc]">
          <span className="text-[13px] font-medium text-[#6e6e80]">{title}</span>
        </div>
      )}
      
      <div className="overflow-x-auto">
        <table className="w-full text-[14px]">
          <thead>
            <tr className="border-b border-[rgba(112,115,147,0.08)] bg-[#fafafc]">
              <th className="px-3 py-2 text-left font-medium text-[#6e6e80] text-[12px] uppercase tracking-wide">
                Counterparty
              </th>
              <th className="px-3 py-2 text-right font-medium text-[#6e6e80] text-[12px] uppercase tracking-wide">
                Amount
              </th>
              <th className="px-3 py-2 text-left font-medium text-[#6e6e80] text-[12px] uppercase tracking-wide">
                Date
              </th>
              {showCategory && (
                <th className="px-3 py-2 text-left font-medium text-[#6e6e80] text-[12px] uppercase tracking-wide">
                  Category
                </th>
              )}
              {showType && (
                <th className="px-3 py-2 text-left font-medium text-[#6e6e80] text-[12px] uppercase tracking-wide">
                  Type
                </th>
              )}
              <th className="px-3 py-2 text-right font-medium text-[#6e6e80] text-[12px] uppercase tracking-wide w-[80px]">
                {/* View column */}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr
                key={row.id}
                className={`
                  border-b border-[rgba(112,115,147,0.06)] last:border-b-0
                  hover:bg-[#f8f8fa] transition-colors
                `}
              >
                <td className="px-3 py-2.5">
                  <span className="font-medium text-[#1e1e2a] truncate block max-w-[180px]">
                    {row.counterparty}
                  </span>
                </td>
                <td className="px-3 py-2.5 text-right">
                  <span
                    className={`font-mono font-medium ${
                      row.amount < 0 ? 'text-[#1e1e2a]' : 'text-[#1a8754]'
                    }`}
                  >
                    {formatCurrency(row.amount)}
                  </span>
                </td>
                <td className="px-3 py-2.5 text-[#6e6e80]">
                  {formatDate(row.date)}
                </td>
                {showCategory && (
                  <td className="px-3 py-2.5 text-[#6e6e80]">
                    {row.category || '—'}
                  </td>
                )}
                {showType && (
                  <td className="px-3 py-2.5">
                    <span className="inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#f2f2f7] text-[#6e6e80]">
                      {row.type || 'Transfer'}
                    </span>
                  </td>
                )}
                <td className="px-3 py-2.5 text-right">
                  <button
                    onClick={() => onViewTransaction?.(row.dashboardLink)}
                    className="text-[13px] font-medium text-[#5166ee] hover:text-[#3d4eba] transition-colors"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Footer with total or action */}
      {rows.length >= 5 && (
        <div className="px-3 py-2 border-t border-[rgba(112,115,147,0.08)] bg-[#fafafc] flex justify-between items-center">
          <span className="text-[12px] text-[#6e6e80]">
            Showing top {rows.length} transactions
          </span>
          <button
            onClick={() => onViewTransaction?.('/transactions')}
            className="text-[12px] font-medium text-[#5166ee] hover:text-[#3d4eba] transition-colors"
          >
            View all →
          </button>
        </div>
      )}
    </div>
  )
}


// =============================================================================
// Employee Table Component
// =============================================================================
// Renders a formatted table of employees within chat messages

import React from 'react'
import { EmployeeTableMetadata } from './types'

interface EmployeeTableProps {
  data: EmployeeTableMetadata
}

/**
 * Format a number as USD currency
 */
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Get department badge color
 */
function getDepartmentColor(department: string): string {
  const colors: Record<string, string> = {
    'Engineering': 'bg-[#e0e7ff] text-[#4338ca]',
    'Sales': 'bg-[#fef3c7] text-[#92400e]',
    'Marketing': 'bg-[#fce7f3] text-[#9d174d]',
    'Operations': 'bg-[#d1fae5] text-[#065f46]',
    'Finance': 'bg-[#e0f2fe] text-[#0369a1]',
    'HR': 'bg-[#f3e8ff] text-[#7c3aed]',
  }
  return colors[department] || 'bg-[#f3f4f6] text-[#4b5563]'
}

export default function EmployeeTable({ data }: EmployeeTableProps) {
  const { title, rows } = data

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
                Name
              </th>
              <th className="px-3 py-2 text-left font-medium text-[#6e6e80] text-[12px] uppercase tracking-wide">
                Email
              </th>
              <th className="px-3 py-2 text-left font-medium text-[#6e6e80] text-[12px] uppercase tracking-wide">
                Department
              </th>
              <th className="px-3 py-2 text-right font-medium text-[#6e6e80] text-[12px] uppercase tracking-wide">
                Salary
              </th>
              <th className="px-3 py-2 text-center font-medium text-[#6e6e80] text-[12px] uppercase tracking-wide">
                Has Card
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.id}
                className="border-b border-[rgba(112,115,147,0.06)] last:border-b-0 hover:bg-[#f8f8fa] transition-colors"
              >
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    {/* Avatar circle with initials */}
                    <div className="w-7 h-7 rounded-full bg-[#e8e8f4] flex items-center justify-center text-[11px] font-[520] text-[#5266eb]">
                      {row.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <span className="font-medium text-[#1e1e2a]">
                      {row.name}
                    </span>
                  </div>
                </td>
                <td className="px-3 py-2.5 text-[#6e6e80]">
                  {row.email}
                </td>
                <td className="px-3 py-2.5">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium ${getDepartmentColor(row.department)}`}>
                    {row.department}
                  </span>
                </td>
                <td className="px-3 py-2.5 text-right">
                  <span className="font-mono text-[#1e1e2a]">
                    {formatCurrency(row.salary)}
                  </span>
                </td>
                <td className="px-3 py-2.5 text-center">
                  {row.hasCard ? (
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#dcfce7]">
                      <svg className="w-3 h-3 text-[#16a34a]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                  ) : (
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#fef3c7]">
                      <svg className="w-3 h-3 text-[#d97706]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Summary footer */}
      <div className="px-3 py-2 border-t border-[rgba(112,115,147,0.08)] bg-[#fafafc] flex justify-between items-center">
        <span className="text-[12px] text-[#6e6e80]">
          {rows.filter(r => r.hasCard).length} of {rows.length} employees have cards
        </span>
        <span className="text-[12px] text-[#6e6e80]">
          {rows.filter(r => !r.hasCard).length} need cards
        </span>
      </div>
    </div>
  )
}


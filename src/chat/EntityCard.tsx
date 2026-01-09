// =============================================================================
// Entity Card Component
// =============================================================================
// Displays entity cards with draft/scheduled/void states (for cards, payments, etc.)

import React from 'react'
import { EntityCard as EntityCardType } from './types'

interface EntityCardProps {
  card: EntityCardType
  className?: string
}

function CardIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
    </svg>
  )
}

function StatusBadge({ status }: { status: EntityCardType['status'] }) {
  switch (status) {
    case 'draft':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-[520] uppercase tracking-wide bg-[#e0e7ff] text-[#4338ca]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#6366f1]" />
          Pending Approval
        </span>
      )
    case 'scheduled':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-[520] uppercase tracking-wide bg-[#dcfce7] text-[#166534]">
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          Card Issued
        </span>
      )
    case 'void':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-[520] uppercase tracking-wide bg-[#f3f4f6] text-[#6b7280] line-through">
          Cancelled
        </span>
      )
  }
}

export default function EntityCard({ card, className = '' }: EntityCardProps) {
  const { entityType, data, status } = card
  
  // Style based on status
  const containerStyles = {
    draft: 'border-[#c7d2fe] bg-gradient-to-r from-[#f0f2ff] to-[#fafafc]',
    scheduled: 'border-[#86efac] bg-gradient-to-r from-[#f0fdf4] to-[#fafafc]',
    void: 'border-[#e5e7eb] bg-[#f9fafb] opacity-60',
  }
  
  const iconBgStyles = {
    draft: 'bg-[#e0e7ff] text-[#4338ca]',
    scheduled: 'bg-[#dcfce7] text-[#166534]',
    void: 'bg-[#f3f4f6] text-[#9ca3af]',
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  if (entityType === 'card') {
    const employeeName = data.employeeName as string
    const employeeEmail = data.employeeEmail as string
    const cardType = data.cardType as string
    const spendingLimit = data.spendingLimit as number
    const last4 = data.last4 as string | undefined

    return (
      <div className={`rounded-xl border-2 ${containerStyles[status]} p-4 transition-all duration-300 ${status === 'void' ? 'line-through' : ''} ${className}`}>
        <div className="flex items-start justify-between gap-4">
          {/* Left side - Icon and details */}
          <div className="flex items-start gap-3">
            <div className={`w-10 h-10 rounded-lg ${iconBgStyles[status]} flex items-center justify-center`}>
              <CardIcon />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className={`text-[15px] font-[520] ${status === 'void' ? 'text-[#9ca3af]' : 'text-[#1e1e2a]'}`}>
                  {employeeName}
                </span>
                <StatusBadge status={status} />
              </div>
              <p className={`text-[13px] ${status === 'void' ? 'text-[#9ca3af]' : 'text-[#70707d]'} mt-0.5`}>
                {employeeEmail}
              </p>
              <div className={`flex items-center gap-3 mt-2 text-[12px] ${status === 'void' ? 'text-[#9ca3af]' : 'text-[#70707d]'}`}>
                <span className="inline-flex items-center gap-1">
                  <span className="font-[480]">Type:</span>
                  <span className="capitalize">{cardType}</span>
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="font-[480]">Limit:</span>
                  <span>{formatCurrency(spendingLimit)}/mo</span>
                </span>
                {last4 && (
                  <span className="inline-flex items-center gap-1">
                    <span className="font-[480]">Card:</span>
                    <span>••••{last4}</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Generic fallback for other entity types
  return (
    <div className={`rounded-xl border-2 ${containerStyles[status]} p-4 ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-[14px] font-[480] text-[#1e1e2a]">
          {entityType} - {card.entityId}
        </span>
        <StatusBadge status={status} />
      </div>
    </div>
  )
}

interface EntityCardListProps {
  cards: EntityCardType[]
  className?: string
}

export function EntityCardList({ cards, className = '' }: EntityCardListProps) {
  if (cards.length === 0) return null

  return (
    <div className={`space-y-2 ${className}`}>
      {cards.map((card) => (
        <EntityCard key={card.entityId} card={card} />
      ))}
    </div>
  )
}


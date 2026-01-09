// =============================================================================
// Clarification Card Component
// =============================================================================
// Displays an ambiguity resolution UI with selectable options

import React, { useState } from 'react'
import { ClarificationRequest } from './types'

interface ClarificationCardProps {
  request: ClarificationRequest
  onSelect: (optionId: string) => void
  disabled?: boolean
  className?: string
}

export default function ClarificationCard({ 
  request, 
  onSelect, 
  disabled = false,
  className = '' 
}: ClarificationCardProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSelect = (optionId: string) => {
    if (disabled || isSubmitted) return
    setSelectedId(optionId)
  }

  const handleConfirm = () => {
    if (!selectedId || isSubmitted) return
    setIsSubmitted(true)
    onSelect(selectedId)
  }

  return (
    <div className={`rounded-xl border-2 border-[#f59e0b] bg-[#fffbeb] overflow-hidden ${className}`}>
      {/* Header with warning icon */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[#fcd34d] bg-[#fef3c7]">
        <div className="w-5 h-5 rounded-full bg-[#f59e0b] flex items-center justify-center">
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <span className="text-[14px] font-[520] text-[#92400e]">Clarification needed</span>
      </div>

      {/* Question */}
      <div className="px-4 py-3">
        <p className="text-[15px] text-[#78350f] font-[480]">{request.question}</p>
      </div>

      {/* Options */}
      <div className="px-4 pb-3 space-y-2">
        {request.options.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => handleSelect(option.id)}
            disabled={disabled || isSubmitted}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border-2 transition-all duration-150 text-left ${
              selectedId === option.id
                ? 'border-[#f59e0b] bg-white shadow-sm'
                : 'border-transparent bg-white/60 hover:bg-white hover:border-[#fcd34d]'
            } ${(disabled || isSubmitted) ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            {/* Radio indicator */}
            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
              selectedId === option.id
                ? 'border-[#f59e0b] bg-[#f59e0b]'
                : 'border-[#d4a574] bg-white'
            }`}>
              {selectedId === option.id && (
                <div className="w-1.5 h-1.5 rounded-full bg-white" />
              )}
            </div>

            {/* Option content */}
            <div className="flex-1 min-w-0">
              <span className="text-[14px] font-[480] text-[#78350f]">{option.label}</span>
              {option.subtitle && (
                <span className="text-[13px] text-[#a16207] ml-2">{option.subtitle}</span>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Confirm button */}
      {!isSubmitted && (
        <div className="px-4 pb-4">
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!selectedId || disabled}
            className={`w-full py-2.5 rounded-lg text-[14px] font-[520] transition-all duration-150 ${
              selectedId && !disabled
                ? 'bg-[#f59e0b] text-white hover:bg-[#d97706] shadow-sm'
                : 'bg-[#fcd34d] text-[#a16207] cursor-not-allowed'
            }`}
          >
            Confirm Selection
          </button>
        </div>
      )}

      {/* Submitted state */}
      {isSubmitted && (
        <div className="px-4 pb-4">
          <div className="flex items-center gap-2 py-2.5 justify-center text-[14px] text-[#16a34a] font-[480]">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Selection confirmed
          </div>
        </div>
      )}
    </div>
  )
}


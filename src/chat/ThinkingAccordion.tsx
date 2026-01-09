// =============================================================================
// Thinking Accordion Component
// =============================================================================
// Displays a collapsible checklist of thinking steps for agentic flows

import React, { useState } from 'react'
import { ThinkingStep } from './types'

interface ThinkingAccordionProps {
  steps: ThinkingStep[]
  className?: string
}

function StepIcon({ status }: { status: ThinkingStep['status'] }) {
  switch (status) {
    case 'pending':
      return (
        <div className="w-4 h-4 rounded-full border-2 border-[#d1d1d6] bg-white" />
      )
    case 'in_progress':
      return (
        <div className="relative w-4 h-4">
          <div className="absolute inset-0 rounded-full border-2 border-[#e8e8ee]" />
          <div 
            className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#5266eb] animate-spin"
            style={{ animationDuration: '0.8s' }}
          />
        </div>
      )
    case 'done':
      return (
        <div className="w-4 h-4 rounded-full bg-[#16a34a] flex items-center justify-center">
          <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )
    case 'error':
      return (
        <div className="w-4 h-4 rounded-full bg-[#dc2626] flex items-center justify-center">
          <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
      )
  }
}

export default function ThinkingAccordion({ steps, className = '' }: ThinkingAccordionProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  
  const completedCount = steps.filter(s => s.status === 'done').length
  const hasInProgress = steps.some(s => s.status === 'in_progress')
  const allDone = completedCount === steps.length && steps.length > 0
  
  return (
    <div className={`rounded-xl border border-[rgba(112,115,147,0.16)] bg-[#fafafc] overflow-hidden ${className}`}>
      {/* Header */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#f5f5f7] transition-colors"
      >
        <div className="flex items-center gap-2">
          {hasInProgress ? (
            <div className="relative w-4 h-4">
              <div className="absolute inset-0 rounded-full border-2 border-[#e8e8ee]" />
              <div 
                className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#5266eb] animate-spin"
                style={{ animationDuration: '0.8s' }}
              />
            </div>
          ) : allDone ? (
            <div className="w-4 h-4 rounded-full bg-[#16a34a] flex items-center justify-center">
              <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          ) : (
            <div className="w-4 h-4 rounded-full border-2 border-[#5266eb] bg-[#f0f2ff]" />
          )}
          <span className="text-[14px] font-[480] text-[#1e1e2a]">
            {hasInProgress ? 'Thinking...' : allDone ? 'Complete' : 'Planning...'}
          </span>
          <span className="text-[12px] text-[#70707d]">
            {completedCount}/{steps.length} steps
          </span>
        </div>
        <svg 
          className={`w-4 h-4 text-[#70707d] transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor" 
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {/* Steps list */}
      <div 
        className={`overflow-hidden transition-all duration-300 ease-out ${
          isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-4 pb-3 space-y-2">
          {steps.map((step, index) => (
            <div 
              key={step.id}
              className={`flex items-center gap-3 py-1.5 transition-opacity duration-300 ${
                step.status === 'pending' ? 'opacity-50' : 'opacity-100'
              }`}
              style={{ 
                animationDelay: `${index * 100}ms`,
              }}
            >
              <StepIcon status={step.status} />
              <span className={`text-[13px] ${
                step.status === 'done' ? 'text-[#16a34a]' : 
                step.status === 'error' ? 'text-[#dc2626]' :
                step.status === 'in_progress' ? 'text-[#1e1e2a]' : 
                'text-[#70707d]'
              }`}>
                {step.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}


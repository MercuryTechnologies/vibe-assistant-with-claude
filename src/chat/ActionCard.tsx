// =============================================================================
// Action Card Component
// =============================================================================
// Renders different action types: navigation, links, actions, form prefill, undo

import React, { useState } from 'react'
import { MessageMetadata } from './types'
import NavigateCountdown from './NavigateCountdown'

interface ActionCardProps {
  messageId: string
  metadata: MessageMetadata
  onNavigate?: (url: string, filters?: MessageMetadata['navigation']) => void
  onUndo?: (actionType: string, targetId: string) => void
  isNavigationComplete?: boolean
  onNavigationComplete?: () => void
}

export default function ActionCard({ 
  messageId, 
  metadata, 
  onNavigate, 
  onUndo,
  isNavigationComplete,
  onNavigationComplete,
}: ActionCardProps) {
  const [cancelled, setCancelled] = useState(false)
  
  // Navigation action with countdown
  if (metadata.navigation) {
    const { target, url, countdown, followUpAction, filters } = metadata.navigation
    
    // Show countdown only if: countdown enabled, not cancelled, not already completed, and has onNavigate
    if (countdown && !cancelled && !isNavigationComplete && onNavigate) {
      return (
        <NavigateCountdown
          destination={target}
          url={url}
          onNavigate={(navUrl) => {
            onNavigationComplete?.()
            onNavigate(navUrl, metadata.navigation)
          }}
          onCancel={() => setCancelled(true)}
        />
      )
    }
    
    // Show success state after navigation is complete
    if (isNavigationComplete) {
      return (
        <div className="flex items-center gap-3 px-4 py-3 bg-[#f0fdf4] rounded-xl border border-[rgba(22,163,74,0.2)]">
          <div className="w-8 h-8 rounded-full bg-[#16a34a] flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-[14px] font-[480] text-[#166534]">
              Now viewing {target}
            </span>
            {followUpAction === 'apply_filters' && filters && (
              <span className="text-[13px] text-[#15803d]">
                Filtered to show {filters.keywords?.join(', ') || filters.types?.join(', ') || 'relevant'} transactions
              </span>
            )}
            {followUpAction === 'answer_with_page_data' && (
              <span className="text-[13px] text-[#15803d]">
                See your insights below
              </span>
            )}
          </div>
        </div>
      )
    }
    
    // Show as a clickable link after countdown is cancelled or if no countdown
    return (
      <button
        type="button"
        onClick={() => onNavigate?.(url, metadata.navigation)}
        className="flex items-center gap-3 px-4 py-3 bg-[#f9f9fb] rounded-xl border border-[rgba(112,115,147,0.12)] hover:bg-[#f2f2f7] transition-colors w-full text-left"
      >
        <div className="w-8 h-8 rounded-full bg-[#e8e8f4] flex items-center justify-center">
          <svg className="w-4 h-4 text-[#5266eb]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </div>
        <div className="flex flex-col">
          <span className="text-[14px] font-[480] text-[#1e1e2a]">Go to {target}</span>
          <span className="text-[13px] text-[#70707d]">{url}</span>
        </div>
      </button>
    )
  }
  
  // Link action (simple clickable link)
  if (metadata.link) {
    const { url, label } = metadata.link
    
    return (
      <a
        href={url}
        onClick={(e) => {
          e.preventDefault()
          onNavigate?.(url)
        }}
        className="inline-flex items-center gap-2 px-4 py-2 bg-[#f9f9fb] rounded-lg border border-[rgba(112,115,147,0.12)] hover:bg-[#f2f2f7] transition-colors"
      >
        <svg className="w-4 h-4 text-[#5266eb]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
        <span className="text-[14px] font-[480] text-[#5266eb]">{label}</span>
      </a>
    )
  }
  
  // Action completed with undo option
  if (metadata.action) {
    const { actionType, targetId, completed, undoAvailable } = metadata.action
    
    // Format action type for display
    const actionLabel = actionType.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
    
    return (
      <div className="flex items-center justify-between px-4 py-3 bg-[#f0fdf4] rounded-xl border border-[rgba(22,163,74,0.2)]">
        <div className="flex items-center gap-3">
          {/* Success icon */}
          <div className="w-6 h-6 rounded-full bg-[#16a34a] flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <span className="text-[14px] font-[480] text-[#166534]">
            {completed ? `${actionLabel} completed` : actionLabel}
          </span>
        </div>
        
        {undoAvailable && onUndo && (
          <button
            type="button"
            onClick={() => onUndo(actionType, targetId)}
            className="px-3 py-1.5 text-[13px] font-[480] text-[#70707d] hover:text-[#1e1e2a] hover:bg-white rounded-lg transition-colors"
          >
            Undo
          </button>
        )}
      </div>
    )
  }
  
  // Form prefill action
  if (metadata.formPrefill) {
    const { formType, url } = metadata.formPrefill
    
    // Format form type for display
    const formLabel = formType.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
    
    return (
      <button
        type="button"
        onClick={() => onNavigate?.(url)}
        className="flex items-center gap-3 px-4 py-3 bg-[#fefce8] rounded-xl border border-[rgba(202,138,4,0.2)] hover:bg-[#fef9c3] transition-colors w-full text-left"
      >
        <div className="w-8 h-8 rounded-full bg-[#fbbf24] flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <div className="flex flex-col">
          <span className="text-[14px] font-[480] text-[#854d0e]">Open {formLabel} Form</span>
          <span className="text-[13px] text-[#a16207]">Pre-filled with your details</span>
        </div>
      </button>
    )
  }
  
  // Support handoff
  if (metadata.supportHandoff) {
    const { ticketId } = metadata.supportHandoff
    
    return (
      <div className="flex items-center gap-3 px-4 py-3 bg-[#eff6ff] rounded-xl border border-[rgba(59,130,246,0.2)]">
        <div className="w-8 h-8 rounded-full bg-[#3b82f6] flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </div>
        <div className="flex flex-col">
          <span className="text-[14px] font-[480] text-[#1e40af]">Connecting to Support</span>
          <span className="text-[13px] text-[#3b82f6]">Ticket #{ticketId}</span>
        </div>
      </div>
    )
  }
  
  // No action to display
  return null
}


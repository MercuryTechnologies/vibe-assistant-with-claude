// =============================================================================
// Navigate Countdown Component
// =============================================================================
// Shows "Taking you to X in 3...2...1..." with countdown animation

import React, { useEffect, useState, useCallback } from 'react'

interface NavigateCountdownProps {
  destination: string
  url: string
  onNavigate: (url: string) => void
  onCancel?: () => void
  countdownSeconds?: number
}

export default function NavigateCountdown({
  destination,
  url,
  onNavigate,
  onCancel,
  countdownSeconds = 3,
}: NavigateCountdownProps) {
  const [count, setCount] = useState(countdownSeconds)
  const [cancelled, setCancelled] = useState(false)
  
  const handleCancel = useCallback(() => {
    setCancelled(true)
    onCancel?.()
  }, [onCancel])
  
  useEffect(() => {
    if (cancelled) return
    
    if (count <= 0) {
      onNavigate(url)
      return
    }
    
    const timer = setTimeout(() => {
      setCount((prev) => prev - 1)
    }, 1000)
    
    return () => clearTimeout(timer)
  }, [count, cancelled, onNavigate, url])
  
  if (cancelled) {
    return (
      <div className="flex items-center gap-2 px-4 py-3 bg-[#f9f9fb] rounded-xl border border-[rgba(112,115,147,0.12)]">
        <span className="text-[14px] text-[#70707d]">Navigation cancelled</span>
      </div>
    )
  }
  
  return (
    <div className="flex items-center justify-between px-4 py-3 bg-[#f0f0ff] rounded-xl border border-[rgba(82,102,235,0.2)]">
      <div className="flex items-center gap-3">
        {/* Navigation icon */}
        <div className="w-8 h-8 rounded-full bg-[#5266eb] flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </div>
        
        {/* Countdown text */}
        <div className="flex flex-col">
          <span className="text-[14px] font-[480] text-[#1e1e2a]">
            Taking you to {destination}
          </span>
          <span className="text-[13px] text-[#5266eb] font-[480] tabular-nums">
            in {count}...
          </span>
        </div>
      </div>
      
      {/* Cancel button */}
      <button
        type="button"
        onClick={handleCancel}
        className="px-3 py-1.5 text-[13px] font-[480] text-[#70707d] hover:text-[#1e1e2a] hover:bg-white rounded-lg transition-colors"
      >
        Cancel
      </button>
    </div>
  )
}


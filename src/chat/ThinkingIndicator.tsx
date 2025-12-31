// =============================================================================
// Thinking Indicator Component
// =============================================================================
// Shows animated "thinking" status with rotating messages

import React, { useEffect, useState } from 'react'
import { ThinkingStatus, THINKING_MESSAGES } from './types'

interface ThinkingIndicatorProps {
  status?: ThinkingStatus | null
  className?: string
}

export default function ThinkingIndicator({ status, className = '' }: ThinkingIndicatorProps) {
  const [currentMessage, setCurrentMessage] = useState<string>(status || 'Thinking')
  const [dotCount, setDotCount] = useState(0)
  
  // Rotate through messages if no specific status is provided
  useEffect(() => {
    if (status) {
      setCurrentMessage(status)
      return
    }
    
    // Rotate through thinking messages every 2 seconds
    const interval = setInterval(() => {
      setCurrentMessage((prev) => {
        const currentIndex = THINKING_MESSAGES.indexOf(prev as ThinkingStatus)
        const nextIndex = (currentIndex + 1) % THINKING_MESSAGES.length
        return THINKING_MESSAGES[nextIndex]
      })
    }, 2000)
    
    return () => clearInterval(interval)
  }, [status])
  
  // Animate dots
  useEffect(() => {
    const interval = setInterval(() => {
      setDotCount((prev) => (prev + 1) % 4)
    }, 400)
    
    return () => clearInterval(interval)
  }, [])
  
  // Remove trailing dots/ellipsis from message for consistent animation
  const baseMessage = currentMessage.replace(/\.+$/, '')
  
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Animated spinner */}
      <div className="relative w-4 h-4">
        <div className="absolute inset-0 rounded-full border-2 border-[#e8e8ee]" />
        <div 
          className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#5266eb] animate-spin"
          style={{ animationDuration: '0.8s' }}
        />
      </div>
      
      {/* Message with animated dots */}
      <span className="text-[14px] text-[#70707d] font-[440]">
        {baseMessage}
        <span className="inline-block w-[18px]">
          {'.'.repeat(dotCount)}
        </span>
      </span>
    </div>
  )
}


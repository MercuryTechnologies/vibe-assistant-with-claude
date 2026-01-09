"use client"

import * as React from "react"
import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Chip } from "./chip"

// ============================================================================
// Types
// ============================================================================

export interface KeywordOption {
  value: string
  label: string
}

export interface KeywordFilterDropdownProps {
  /** Whether the dropdown is open */
  open: boolean
  /** Callback when dropdown should close */
  onClose: () => void
  /** Anchor element for positioning (recommended) */
  anchorEl?: HTMLElement | null
  /** Search query */
  searchQuery?: string
  /** Callback when search query changes */
  onSearchChange?: (query: string) => void
  /** Selected keywords */
  selectedKeywords?: string[]
  /** Callback when keywords selection changes */
  onKeywordsChange?: (keywords: string[]) => void
  /** Recent keyword options */
  recentKeywords?: KeywordOption[]
  /** Additional className for the dropdown */
  className?: string
}

// ============================================================================
// Default recent keywords
// ============================================================================

const DEFAULT_RECENT_KEYWORDS: KeywordOption[] = [
  { value: "hook-fish", label: "Hook Fish" },
  { value: "xian-noodles", label: "Xian Noodles" },
  { value: "beeps", label: "Beeps" },
  { value: "nicks-tacos", label: "Nick's Tacos" },
  { value: "roxies-subs", label: "Roxie's Subs" },
]

// ============================================================================
// Checkbox Component
// ============================================================================

interface CheckboxItemProps {
  label: string
  checked: boolean
  onChange: () => void
}

function CheckboxItem({ label, checked, onChange }: CheckboxItemProps) {
  const checkboxStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    cursor: 'pointer',
    padding: '6px 0',
  }

  const boxStyles: React.CSSProperties = {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '16px',
    height: '16px',
    flexShrink: 0,
  }

  const visualBoxStyles: React.CSSProperties = {
    width: '16px',
    height: '16px',
    borderRadius: '4px',
    border: checked ? '1px solid #5266eb' : '1px solid #c3c3cc',
    backgroundColor: checked ? '#5266eb' : '#fbfcfd',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.15s',
  }

  const labelStyles: React.CSSProperties = {
    fontSize: '15px',
    lineHeight: '24px',
    color: '#363644',
    userSelect: 'none',
  }

  return (
    <label style={checkboxStyles}>
      <div style={boxStyles}>
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            opacity: 0,
            cursor: 'pointer',
            zIndex: 10,
          }}
        />
        <div style={visualBoxStyles}>
          {checked && (
            <svg
              width="10"
              height="10"
              viewBox="0 0 448 512"
              fill="white"
            >
              <path d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z" />
            </svg>
          )}
        </div>
      </div>
      <span style={labelStyles}>{label}</span>
    </label>
  )
}

// ============================================================================
// KeywordFilterDropdown Component
// ============================================================================

export function KeywordFilterDropdown({
  open,
  onClose,
  anchorEl,
  searchQuery = "",
  onSearchChange,
  selectedKeywords = [],
  onKeywordsChange,
  recentKeywords = DEFAULT_RECENT_KEYWORDS,
  className,
}: KeywordFilterDropdownProps) {
  const [internalSearch, setInternalSearch] = useState(searchQuery)
  const [internalSelected, setInternalSelected] = useState<string[]>(selectedKeywords)
  const ref = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [placement, setPlacement] = useState<"bottom" | "top">("bottom")
  const [position, setPosition] = useState<{ top?: number; bottom?: number; left: number; maxHeight: number } | null>(null)

  // Update internal state when props change
  useEffect(() => {
    setInternalSearch(searchQuery)
  }, [searchQuery])

  useEffect(() => {
    setInternalSelected(selectedKeywords)
  }, [selectedKeywords])

  // Focus input when dropdown opens
  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus()
    }
  }, [open])

  // Viewport-aware positioning so the dropdown isn't "cut off"
  useEffect(() => {
    if (!open) {
      setPosition(null)
      setPlacement("bottom")
      return
    }

    const updatePosition = () => {
      const rect = anchorEl?.getBoundingClientRect()
      const fallbackRect = ref.current?.parentElement?.getBoundingClientRect()
      const anchorRect = rect ?? fallbackRect
      if (!anchorRect) return

      const viewportPadding = 8
      const gap = 4
      const dropdownWidth = 376

      // Clamp horizontally into the viewport.
      const left = Math.max(
        viewportPadding,
        Math.min(anchorRect.left, window.innerWidth - dropdownWidth - viewportPadding)
      )

      const availableBelow = window.innerHeight - anchorRect.bottom - gap - viewportPadding
      const availableAbove = anchorRect.top - gap - viewportPadding

      // Prefer bottom placement unless it would be cramped and top is better.
      const shouldFlip = availableBelow < 220 && availableAbove > availableBelow
      const nextPlacement: "bottom" | "top" = shouldFlip ? "top" : "bottom"
      setPlacement(nextPlacement)

      if (nextPlacement === "bottom") {
        const top = anchorRect.bottom + gap
        const maxHeight = Math.max(160, availableBelow)
        setPosition({ top, left, maxHeight })
      } else {
        const bottom = window.innerHeight - anchorRect.top + gap
        const maxHeight = Math.max(160, availableAbove)
        setPosition({ bottom, left, maxHeight })
      }
    }

    updatePosition()
    window.addEventListener("resize", updatePosition)
    window.addEventListener("scroll", updatePosition, { passive: true })
    return () => {
      window.removeEventListener("resize", updatePosition)
      window.removeEventListener("scroll", updatePosition)
    }
  }, [open, anchorEl])

  // Handle click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node
      // Don't close if clicking inside the dropdown or on the anchor element (chip)
      if (ref.current && !ref.current.contains(target) && 
          anchorEl && !anchorEl.contains(target)) {
        onClose()
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [open, onClose, anchorEl])

  const handleSearchChange = (value: string) => {
    setInternalSearch(value)
    onSearchChange?.(value)
  }

  const handleKeywordToggle = (keywordLabel: string) => {
    const newSelected = internalSelected.includes(keywordLabel)
      ? internalSelected.filter(k => k !== keywordLabel)
      : [...internalSelected, keywordLabel]
    
    setInternalSelected(newSelected)
    onKeywordsChange?.(newSelected)
  }

  // Filter keywords based on search
  const filteredKeywords = recentKeywords.filter(keyword =>
    keyword.label.toLowerCase().includes(internalSearch.toLowerCase())
  )

  if (!open) return null

  const dropdownStyles: React.CSSProperties = {
    position: 'fixed',
    top: placement === "bottom" ? position?.top : undefined,
    bottom: placement === "top" ? position?.bottom : undefined,
    left: position?.left ?? 0,
    zIndex: 50,
    width: '376px',
    padding: '24px',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0px 14px 20px 0px rgba(4, 4, 52, 0.02), 0px 8px 12px 0px rgba(14, 14, 45, 0.08), 0px 0px 1px 0px rgba(175, 178, 206, 0.9), 0px 1px 4px 0px rgba(183, 187, 219, 0.14)',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    maxHeight: position?.maxHeight ?? undefined,
    overflowY: 'auto',
    overscrollBehavior: 'contain',
  }

  const inputStyles: React.CSSProperties = {
    width: '100%',
    height: '40px',
    padding: '0 12px',
    fontSize: '15px',
    lineHeight: '24px',
    color: '#363644',
    backgroundColor: 'white',
    border: '1px solid #5266eb',
    borderRadius: '8px',
    outline: 'none',
    boxShadow: '0 0 0 3px rgba(82, 102, 235, 0.2)',
  }

  const sectionLabelStyles: React.CSSProperties = {
    fontSize: '12px',
    lineHeight: '20px',
    letterSpacing: '0.2px',
    color: '#70707d',
    fontWeight: 400,
  }

  return (
    <div ref={ref} style={dropdownStyles} className={className}>
      {/* Search Input */}
      <input
        ref={inputRef}
        type="text"
        value={internalSearch}
        onChange={(e) => handleSearchChange(e.target.value)}
        placeholder="Search recipients, and more"
        style={inputStyles}
      />

      {/* Recent Section */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {/* Section Label */}
        <span style={sectionLabelStyles}>Recent</span>
        
        {/* Checkbox List */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {filteredKeywords.map((keyword) => (
            <CheckboxItem
              key={keyword.value}
              label={keyword.label}
              checked={internalSelected.includes(keyword.label)}
              onChange={() => handleKeywordToggle(keyword.label)}
            />
          ))}
          {filteredKeywords.length === 0 && (
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: '15px', lineHeight: '24px', color: '#9d9da8', padding: '8px 0' }}>
              No results found
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


// ============================================================================
// Combined KeywordFilter component (Chip + Dropdown)
// ============================================================================

export interface KeywordFilterProps {
  /** Search query */
  searchQuery?: string
  /** Selected keywords */
  selectedKeywords?: string[]
  /** Callback when search query changes */
  onSearchChange?: (query: string) => void
  /** Callback when keywords selection changes */
  onKeywordsChange?: (keywords: string[]) => void
  /** Recent keyword options */
  recentKeywords?: KeywordOption[]
  /** Additional className */
  className?: string
}

export function KeywordFilter({
  searchQuery = "",
  selectedKeywords = [],
  onSearchChange,
  onKeywordsChange,
  recentKeywords = DEFAULT_RECENT_KEYWORDS,
  className,
}: KeywordFilterProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [internalSearch, setInternalSearch] = useState(searchQuery)
  const [internalSelected, setInternalSelected] = useState<string[]>(selectedKeywords)
  const anchorRef = useRef<HTMLDivElement>(null)

  // Sync internal state with props
  useEffect(() => {
    setInternalSearch(searchQuery)
  }, [searchQuery])

  useEffect(() => {
    setInternalSelected(selectedKeywords)
  }, [selectedKeywords])

  const handleSearchChange = (query: string) => {
    setInternalSearch(query)
    onSearchChange?.(query)
  }

  const handleKeywordsChange = (keywords: string[]) => {
    setInternalSelected(keywords)
    onKeywordsChange?.(keywords)
  }

  const handleClear = () => {
    setInternalSearch("")
    setInternalSelected([])
    onSearchChange?.("")
    onKeywordsChange?.([])
  }

  // Get display value based on selected keywords (now stores labels directly)
  const getDisplayValue = () => {
    if (internalSelected.length === 0) return undefined
    if (internalSelected.length === 1) {
      // internalSelected now contains labels directly
      return internalSelected[0]
    }
    return `${internalSelected.length} keywords`
  }

  const displayValue = getDisplayValue()
  const hasValue = !!displayValue

  return (
    <div ref={anchorRef} className={cn("relative", className)}>
      <Chip
        label={displayValue || "Keyword"}
        variant={hasValue ? "selected" : "default"}
        trailingAction={hasValue ? "clear" : "dropdown"}
        isOpen={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        onClear={handleClear}
      />
      <KeywordFilterDropdown
        open={isOpen}
        onClose={() => setIsOpen(false)}
        anchorEl={anchorRef.current}
        searchQuery={internalSearch}
        selectedKeywords={internalSelected}
        onSearchChange={handleSearchChange}
        onKeywordsChange={handleKeywordsChange}
        recentKeywords={recentKeywords}
      />
    </div>
  )
}

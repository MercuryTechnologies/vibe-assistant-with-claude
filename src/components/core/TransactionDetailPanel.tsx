"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { DSCombobox, type ComboboxOption } from "@/components/ui/ds-combobox"
import { DSButton } from "@/components/ui/ds-button"
import { Icon } from "@/components/ui/icon"
import { faXmark, faLink, faFile, faCircleCheck } from "@fortawesome/free-solid-svg-icons"
import type { Transaction } from "@/types"

// ============================================================================
// Option Data
// ============================================================================

const categoryOptions: ComboboxOption[] = [
  { value: "grocery", label: "Grocery" },
  { value: "software", label: "Software" },
  { value: "marketing", label: "Marketing" },
  { value: "payroll", label: "Payroll" },
  { value: "office-supplies", label: "Office Supplies" },
  { value: "utilities", label: "Utilities" },
  { value: "professional-services", label: "Professional Services" },
  { value: "equipment", label: "Equipment" },
  { value: "other-travel", label: "Other Travel" },
]

// ============================================================================
// Types
// ============================================================================

export interface TransactionDetailPanelProps {
  /** The transaction to display */
  transaction: Transaction | null
  /** Whether the panel is open */
  isOpen: boolean
  /** Callback when the panel should close */
  onClose: () => void
  /** Additional className */
  className?: string
  /** Account type mapping function */
  getAccountType?: (accountId: string) => string
  /** Method type mapping function */
  getMethod?: (transaction: Transaction) => string
  /** Category options to use in the combobox */
  categoryOptions?: ComboboxOption[]
  /** Current category value for the transaction */
  categoryValue?: string
  /** Callback when category changes */
  onCategoryChange?: (transactionId: string, category: string) => void
}

// ============================================================================
// Helper Components
// ============================================================================

interface MoneyAmountHeadlineProps {
  amount: number
  className?: string
}

function MoneyAmountHeadline({ amount, className }: MoneyAmountHeadlineProps) {
  const isPositive = amount >= 0
  const absAmount = Math.abs(amount)
  const totalCents = Math.round(absAmount * 100)
  const dollars = Math.floor(totalCents / 100)
  const cents = String(totalCents % 100).padStart(2, "0")
  const formattedDollars = dollars.toLocaleString("en-US")
  const prefix = isPositive ? "" : "−"

  return (
    <span
      className={cn(
        "text-title-main font-display tabular-nums whitespace-nowrap",
        className
      )}
      style={{ 
        color: isPositive ? "var(--color-success)" : "var(--ds-text-title)",
      }}
    >
      <span>{prefix}$</span>
      <span>{formattedDollars}</span>
      <span 
        className="text-body-sm-demi align-top" 
        style={{ 
          position: 'relative', 
          top: '2px',
        }}
      >
        .{cents}
      </span>
    </span>
  )
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label 
      className="text-label"
      style={{ color: 'var(--ds-text-secondary)' }}
    >
      {children}
    </label>
  )
}

function FieldValue({ children }: { children: React.ReactNode }) {
  return (
    <div 
      className="text-body-sm"
      style={{ color: 'var(--ds-text-default)' }}
    >
      {children}
    </div>
  )
}

// ============================================================================
// Timeline Components
// ============================================================================

interface TimelineStepProps {
  type: "first" | "last"
  title: string
  datetime: string
  attribution?: string
}

function TimelineStep({ type, title, datetime, attribution }: TimelineStepProps) {
  return (
    <div className="flex gap-4 items-start w-full">
      {/* Progress indicator */}
      <div className="flex flex-col items-center shrink-0">
        {type === "first" ? (
          <>
            <div className="flex items-start" style={{ paddingTop: 2, paddingBottom: 2 }}>
              <div
                className="rounded-full"
                style={{ width: 8, height: 8, backgroundColor: "var(--ds-icon-primary)" }}
              />
            </div>
            <div
              style={{
                width: 2,
                flex: 1,
                minHeight: 16,
                backgroundColor: "var(--ds-icon-primary)",
              }}
            />
          </>
        ) : (
          <>
            <div style={{ width: 2, height: 16, backgroundColor: "var(--color-border-default)" }} />
            <div className="flex items-start" style={{ paddingTop: 2, paddingBottom: 2 }}>
              <div style={{ width: 8, height: 11, position: "relative" }}>
                <svg
                  viewBox="0 0 8 11"
                  fill="none"
                  style={{ width: 8, height: 11, display: "block" }}
                  aria-hidden="true"
                >
                  <path
                    d="M4 0C1.79086 0 0 1.79086 0 4C0 6.5 4 11 4 11C4 11 8 6.5 8 4C8 1.79086 6.20914 0 4 0Z"
                    fill="var(--color-border-default)"
                  />
                </svg>
              </div>
            </div>
          </>
        )}
      </div>
      
      {/* Content */}
      <div 
        className="flex flex-col flex-1 min-w-0"
        style={{ gap: 2 }}
        style={type === "last" ? { paddingTop: '16px' } : undefined}
      >
        <div 
          className="text-body-demi truncate"
          style={{ color: 'var(--ds-text-title)' }}
        >
          {title}
        </div>
        <div 
          className="flex gap-1 items-start flex-wrap text-tiny"
          style={{ 
            color: 'var(--ds-text-secondary)',
            letterSpacing: '0.2px'
          }}
        >
          <span>{datetime}</span>
          {attribution && (
            <>
              <span>–</span>
              <div className="flex gap-1">
                <span>Sent by</span>
                <span style={{ fontWeight: 480 }}>{attribution}</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// File Attachment Component
// ============================================================================

interface FileAttachmentProps {
  filename: string
  uploaded?: boolean
}

function FileAttachment({ filename, uploaded = true }: FileAttachmentProps) {
  return (
    <div 
      className="flex items-center gap-3 p-4 rounded-lg border"
      style={{ 
        borderColor: 'var(--color-border-default)',
        backgroundColor: 'var(--ds-bg-default)'
      }}
    >
      {/* File preview placeholder */}
      <div 
        className="rounded-md flex items-center justify-center border"
        style={{ 
          width: 56,
          height: 72,
          backgroundColor: 'var(--neutral-base-100)',
          borderColor: 'var(--color-border-default)'
        }}
      >
        <div 
          className="text-micro text-center px-1"
          style={{ color: 'var(--ds-text-tertiary)' }}
        >
          PDF
        </div>
      </div>
      
      {/* File info */}
      <div className="flex-1 flex items-center justify-between min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          <Icon icon={faFile} size="small" style={{ color: 'var(--ds-icon-secondary)' }} />
          <span 
            className="text-body-sm truncate"
            style={{ color: 'var(--ds-text-default)' }}
          >
            {filename}
          </span>
        </div>
        {uploaded && (
          <Icon icon={faCircleCheck} size="small" style={{ color: 'var(--green-magic-600)' }} />
        )}
      </div>
    </div>
  )
}

// ============================================================================
// TransactionDetailPanel Component
// ============================================================================

export function TransactionDetailPanel({
  transaction,
  isOpen,
  onClose,
  className,
  getAccountType = (id) => id,
  categoryOptions: propCategoryOptions,
  categoryValue,
  onCategoryChange,
}: TransactionDetailPanelProps) {
  // Form state
  const [notes, setNotes] = React.useState("")
  const [internalCategory, setInternalCategory] = React.useState("")
  
  // Reset form when transaction changes
  React.useEffect(() => {
    if (transaction) {
      setNotes("")
      setInternalCategory(transaction.category || "")
    }
  }, [transaction?.id])
  
  // Handle category change
  const handleCategoryChange = (newValue: string) => {
    setInternalCategory(newValue)
    if (transaction && onCategoryChange) {
      onCategoryChange(transaction.id, newValue)
    }
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    const month = date.toLocaleDateString('en-US', { month: 'short' })
    const day = date.getDate()
    const time = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).toLowerCase()
    return `${month} ${day} at ${time}`
  }

  // Get transaction direction
  const isIncoming = transaction ? transaction.amount >= 0 : false

  // Determine the category options to use
  const finalCategoryOptions = propCategoryOptions || categoryOptions

  // Shadow style matching Figma L4 - Dialog
  const shadowStyle = {
    boxShadow: '0px 0px 2px 0px rgba(175, 178, 206, 0.65), 0px 0px 3px 0px rgba(0, 0, 0, 0.09), 0px 12px 16px 0px rgba(0, 0, 0, 0.01), 0px 22px 28px 0px rgba(0, 0, 0, 0.04)'
  }

  return (
    <div
      className={cn(
        "detail-panel flex flex-col overflow-hidden rounded-lg",
        !isOpen || !transaction ? "pointer-events-none" : "",
        className
      )}
      style={{
        position: "fixed",
        top: "calc(var(--ds-top-nav-height) + 16px)",
        bottom: 16,
        right: 16,
        width: 400,
        zIndex: 60,
        backgroundColor: 'var(--ds-bg-default)',
        // Slide completely off-screen: 100% width + 16px right margin + extra for shadow
        transform: isOpen && transaction ? 'translateX(0)' : 'translateX(calc(100% + 32px))',
        ...shadowStyle
      }}
    >
      {/* Sticky Header with gradient */}
      <div 
        className="detail-panel-header flex items-center justify-between shrink-0 sticky top-0 z-10"
        style={{
          padding: '20px 24px 12px 24px',
          background: 'linear-gradient(to top, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.92) 20%, #ffffff 100%)',
        }}
      >
        {/* Title */}
        <div className="flex-1 min-w-0 flex items-center gap-2">
          <span 
            className="text-body truncate"
            style={{ 
              color: 'var(--ds-text-default)',
              maxWidth: '146px'
            }}
          >
            {transaction?.merchant || 'Transaction'}
          </span>
        </div>
        
        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Copy Link */}
          <DSButton
            variant="tertiary"
            size="small"
            iconOnly
            aria-label="Copy link"
          >
            <Icon icon={faLink} style={{ color: "var(--ds-icon-secondary)" }} />
          </DSButton>
          
          {/* Divider */}
          <div 
            className="h-5 w-px"
            style={{ backgroundColor: 'var(--color-border-default)' }}
          />
          
          {/* Close */}
          <DSButton
            variant="tertiary"
            size="small"
            iconOnly
            onClick={onClose}
            aria-label="Close panel"
          >
            <Icon icon={faXmark} style={{ color: "var(--ds-icon-secondary)" }} />
          </DSButton>
        </div>
      </div>

      {transaction && (
        <>
          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto">
            {/* Hero Section */}
            <div 
              className="flex flex-col gap-4"
              style={{ 
                padding: '0 24px 24px 24px',
                backgroundColor: 'var(--ds-bg-default)'
              }}
            >
              {/* Money Amount */}
              <div className="w-full">
                <MoneyAmountHeadline amount={transaction.amount} />
              </div>

              {/* Timeline */}
              <div className="flex flex-col w-full">
                <TimelineStep
                  type="first"
                  title={isIncoming ? transaction.merchant : "Pending"}
                  datetime={formatDateTime(transaction.date)}
                  attribution="First L."
                />
                <TimelineStep
                  type="last"
                  title={isIncoming ? getAccountType(transaction.accountId) : `${transaction.merchant} ••1111`}
                  datetime={formatDateTime(transaction.date)}
                  attribution="First L."
                />
              </div>
            </div>

            {/* Fields Section */}
            <div 
              className="flex flex-col gap-5"
              style={{ 
                padding: '24px',
                borderTop: '1px solid var(--color-border-default)',
                backgroundColor: 'var(--ds-bg-default)'
              }}
            >
              {/* Recipient memo */}
              <div className="flex flex-col gap-1">
                <FieldLabel>Recipient memo</FieldLabel>
                <FieldValue>From Mercury Technologies, Inc.</FieldValue>
              </div>

              {/* Category (Custom) */}
              <DSCombobox
                label="Custom"
                value={categoryValue || internalCategory}
                onChange={handleCategoryChange}
                options={finalCategoryOptions}
                placeholder="Select category"
              />

              {/* Notes */}
              <div className="flex flex-col gap-1">
                <FieldLabel>Notes</FieldLabel>
                <textarea
                  className="detail-panel-textarea"
                  placeholder="Add a note"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                />
              </div>

              {/* Attachments */}
              <div className="flex flex-col gap-2">
                <FieldLabel>Attachments</FieldLabel>
                <FileAttachment filename="Filename.pdf" uploaded />
              </div>

              {/* Bank description */}
              <div className="flex flex-col gap-1">
                <FieldLabel>Bank description</FieldLabel>
                <FieldValue>
                  {transaction.description || 'Send Money transition initiated on Mercury'}
                </FieldValue>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

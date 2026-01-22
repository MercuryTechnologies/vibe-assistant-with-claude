"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { DSCombobox, type ComboboxOption } from "@/components/ui/ds-combobox"
import { DSButton } from "@/components/ui/ds-button"
import { Icon } from "@/components/ui/icon"
import { faXmark, faLink, faFile, faCircleCheck } from "@/icons"

// ============================================================================
// Types
// ============================================================================

export type DetailPanelFieldType = 
  | "text"           // Simple text display
  | "combobox"        // Dropdown select
  | "textarea"        // Multi-line text input
  | "file"            // File attachment display/upload
  | "custom"          // Custom React component

export interface DetailPanelField<T = unknown> {
  /** Unique identifier for the field */
  id: string
  /** Field label */
  label: string
  /** Type of field */
  type: DetailPanelFieldType
  /** Function to get the value from the row data */
  getValue?: (row: T) => React.ReactNode
  /** For combobox: options array */
  options?: ComboboxOption[]
  /** For combobox: current value */
  value?: string
  /** For combobox/textarea: onChange handler */
  onChange?: (value: string, row: T) => void
  /** For textarea: placeholder text */
  placeholder?: string
  /** For textarea: number of rows */
  rows?: number
  /** For file: filename */
  filename?: string
  /** For file: whether file is uploaded */
  uploaded?: boolean
  /** For custom: render function */
  render?: (row: T, value: unknown) => React.ReactNode
}

export interface DSTableDetailPanelProps<T = unknown> {
  /** The row data to display */
  row: T | null
  /** Whether the panel is open */
  isOpen: boolean
  /** Callback when the panel should close */
  onClose: () => void
  /** Panel title (displayed in header) */
  title?: string | ((row: T) => string)
  /** Function to get title from row if title prop not provided */
  getTitle?: (row: T) => string
  /** Hero section content (e.g., money amount, main value) */
  hero?: (row: T) => React.ReactNode
  /** Timeline steps (optional) */
  timeline?: Array<{
    type: "first" | "last"
    title: string
    datetime: string
    attribution?: string
  }>
  /** Field configurations */
  fields: DetailPanelField<T>[]
  /** Additional className */
  className?: string
  /** Panel width (default: 480px) */
  width?: number
  /** Show copy link button in header */
  showCopyLink?: boolean
  /** Custom header actions */
  headerActions?: React.ReactNode
}

// ============================================================================
// Helper Components
// ============================================================================

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
        style={{ 
          gap: 2,
          ...(type === "last" ? { paddingTop: '16px' } : {})
        }}
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
// DSTableDetailPanel Component
// ============================================================================

export function DSTableDetailPanel<T = unknown>({
  row,
  isOpen,
  onClose,
  title,
  getTitle,
  hero,
  timeline,
  fields,
  className,
  width = 480,
  showCopyLink = false,
  headerActions,
}: DSTableDetailPanelProps<T>) {
  // Form state for textarea fields
  const [textareaValues, setTextareaValues] = React.useState<Record<string, string>>({})
  
  // Reset form when row changes
  React.useEffect(() => {
    if (row) {
      // Reset textarea values
      const newValues: Record<string, string> = {}
      fields.forEach(field => {
        if (field.type === "textarea") {
          newValues[field.id] = ""
        }
      })
      setTextareaValues(newValues)
    }
  }, [row, fields])

  // Close panel on Escape key
  React.useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, onClose])

  // Get panel title
  const panelTitle = React.useMemo(() => {
    if (!row) return "Details"
    if (typeof title === "function") return title(row)
    if (title) return title
    if (getTitle) return getTitle(row)
    return "Details"
  }, [row, title, getTitle])

  // Shadow style matching Figma L4 - Dialog
  const shadowStyle = {
    boxShadow: '0px 0px 2px 0px rgba(175, 178, 206, 0.65), 0px 0px 3px 0px rgba(0, 0, 0, 0.09), 0px 12px 16px 0px rgba(0, 0, 0, 0.01), 0px 22px 28px 0px rgba(0, 0, 0, 0.04)'
  }

  // Render a field based on its type
  const renderField = (field: DetailPanelField<T>, rowData: T) => {
    const value = field.getValue ? field.getValue(rowData) : null

    switch (field.type) {
      case "text":
        return (
          <div className="flex flex-col gap-1">
            <FieldLabel>{field.label}</FieldLabel>
            <FieldValue>{value || "-"}</FieldValue>
          </div>
        )

      case "combobox":
        return (
          <DSCombobox
            label={field.label}
            value={field.value || ""}
            onChange={(newValue) => {
              if (field.onChange) {
                field.onChange(newValue, rowData)
              }
            }}
            options={field.options || []}
            placeholder={field.placeholder || "Select..."}
          />
        )

      case "textarea":
        const textareaValue = textareaValues[field.id] || ""
        return (
          <div className="flex flex-col gap-1">
            <FieldLabel>{field.label}</FieldLabel>
            <textarea
              className="detail-panel-textarea"
              placeholder={field.placeholder || "Add a note"}
              value={textareaValue}
              onChange={(e) => {
                const newValue = e.target.value
                setTextareaValues(prev => ({ ...prev, [field.id]: newValue }))
                if (field.onChange) {
                  field.onChange(newValue, rowData)
                }
              }}
              rows={field.rows || 2}
            />
          </div>
        )

      case "file":
        return (
          <div className="flex flex-col gap-2">
            <FieldLabel>{field.label}</FieldLabel>
            <FileAttachment 
              filename={field.filename || "file.pdf"} 
              uploaded={field.uploaded !== false}
            />
          </div>
        )

      case "custom":
        if (field.render) {
          return (
            <div className="flex flex-col gap-1">
              <FieldLabel>{field.label}</FieldLabel>
              <div>{field.render(rowData, value)}</div>
            </div>
          )
        }
        return null

      default:
        return null
    }
  }

  return (
    <div
      className={cn(
        "detail-panel flex flex-col overflow-hidden rounded-lg",
        !isOpen || !row ? "pointer-events-none" : "",
        className
      )}
      style={{
        position: "fixed",
        top: "calc(var(--ds-top-nav-height) + 16px)",
        bottom: 16,
        right: 16,
        width,
        zIndex: 60,
        backgroundColor: 'var(--ds-bg-default)',
        // Slide completely off-screen: 100% width + 16px right margin + extra for shadow
        transform: isOpen && row ? 'translateX(0)' : 'translateX(calc(100% + 32px))',
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
            {panelTitle}
          </span>
        </div>
        
        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Custom header actions */}
          {headerActions}
          
          {/* Copy Link */}
          {showCopyLink && (
            <>
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
            </>
          )}
          
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

      {row && (
        <>
          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto">
            {/* Hero Section */}
            {hero && (
              <div 
                className="flex flex-col gap-4"
                style={{ 
                  padding: '0 24px 24px 24px',
                  backgroundColor: 'var(--ds-bg-default)'
                }}
              >
                {hero(row)}
              </div>
            )}

            {/* Timeline */}
            {timeline && timeline.length > 0 && (
              <div 
                className="flex flex-col gap-4"
                style={{ 
                  padding: hero ? '0 24px 24px 24px' : '0 24px 24px 24px',
                  backgroundColor: 'var(--ds-bg-default)'
                }}
              >
                <div className="flex flex-col w-full">
                  {timeline.map((step, index) => (
                    <TimelineStep
                      key={index}
                      type={step.type}
                      title={step.title}
                      datetime={step.datetime}
                      attribution={step.attribution}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Fields Section */}
            <div 
              className="flex flex-col gap-5"
              style={{ 
                padding: '24px',
                borderTop: hero || timeline ? '1px solid var(--color-border-default)' : 'none',
                backgroundColor: 'var(--ds-bg-default)'
              }}
            >
              {fields.map((field) => (
                <div key={field.id}>
                  {renderField(field, row)}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

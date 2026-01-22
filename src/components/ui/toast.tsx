"use client"

import * as React from "react"

// ============================================================================
// Toast Types
// ============================================================================

export interface ToastAction {
  label: string
  onClick: () => void
}

export interface ToastData {
  id: string
  message: string
  /** Optional dynamic value to interpolate into message (replaces [Category], [Value], etc.) */
  interpolateValue?: string
  action?: ToastAction
  duration?: number
}

export interface ToastProps {
  toast: ToastData
  onDismiss: (id: string) => void
}

// ============================================================================
// Toast Component
// ============================================================================

export function Toast({ toast, onDismiss }: ToastProps) {
  const { id, message, interpolateValue, action, duration = 5000 } = toast

  // Auto-dismiss after duration
  React.useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onDismiss(id)
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [id, duration, onDismiss])

  // Interpolate value into message (e.g., "[Category]" becomes the actual category name)
  const displayMessage = interpolateValue
    ? message.replace(/\[Category\]|\[Value\]/g, interpolateValue)
    : message

  return (
    <div className="ds-toast" role="alert">
      <span className="ds-toast-message text-body">{displayMessage}</span>
      {action && (
        <button
          className="ds-toast-action text-body-demi"
          onClick={() => {
            action.onClick()
            onDismiss(id)
          }}
        >
          {action.label}
        </button>
      )}
    </div>
  )
}

// ============================================================================
// Toast Context
// ============================================================================

interface ToastContextValue {
  toasts: ToastData[]
  showToast: (toast: Omit<ToastData, "id">) => void
  dismissToast: (id: string) => void
}

const ToastContext = React.createContext<ToastContextValue | null>(null)

export function useToast() {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}

// ============================================================================
// Toast Provider
// ============================================================================

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastData[]>([])

  const showToast = React.useCallback((toast: Omit<ToastData, "id">) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    setToasts((prev) => [...prev, { ...toast, id }])
  }, [])

  const dismissToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const value = React.useMemo(
    () => ({ toasts, showToast, dismissToast }),
    [toasts, showToast, dismissToast]
  )

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  )
}

// ============================================================================
// Toast Container
// ============================================================================

interface ToastContainerProps {
  toasts: ToastData[]
  onDismiss: (id: string) => void
}

function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (toasts.length === 0) return null

  return (
    <div className="ds-toast-container">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  )
}

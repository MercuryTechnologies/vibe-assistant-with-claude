import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"

/**
 * DSButton - Design System Button Component
 * 
 * Sizes:
 * - small: 32px height, for everyday actions
 * - large: 40px height, for CTAs and main actions
 * 
 * Variants:
 * - primary: Blue filled button for main actions
 * - secondary: Gray filled button for secondary actions
 * - tertiary: Transparent button for less prominent actions
 * - destructive: Error-colored button for destructive actions
 * - floating: White raised button with shadow for overlay contexts
 */

export interface DSButtonProps extends React.ComponentProps<"button"> {
  variant?: "primary" | "secondary" | "tertiary" | "destructive" | "floating"
  size?: "small" | "large"
  asChild?: boolean
  leadingIcon?: React.ReactNode
  trailingIcon?: React.ReactNode
  iconOnly?: boolean
  loading?: boolean
}

function DSButton({
  className,
  variant = "primary",
  size = "small",
  asChild = false,
  leadingIcon,
  trailingIcon,
  iconOnly = false,
  loading = false,
  children,
  disabled,
  ...props
}: DSButtonProps) {
  const Comp = asChild ? Slot : "button"

  // Get variant class
  const variantClass = `ds-button-${variant}`
  
  // Get size class
  const sizeClass = `ds-button-${size}`

  // Padding based on size and icon position
  const getPaddingStyle = (): React.CSSProperties => {
    if (iconOnly) return {}
    
    const isSmall = size === "small"
    
    if (leadingIcon && trailingIcon) {
      return { paddingLeft: isSmall ? 12 : 28, paddingRight: isSmall ? 12 : 28 }
    }
    if (leadingIcon) {
      return { paddingLeft: isSmall ? 12 : 28, paddingRight: isSmall ? 16 : 32 }
    }
    if (trailingIcon) {
      return { paddingLeft: isSmall ? 16 : 32, paddingRight: isSmall ? 12 : 28 }
    }
    // Text only
    return { paddingLeft: isSmall ? 16 : 32, paddingRight: isSmall ? 16 : 32 }
  }

  // Icon-only dimensions
  const iconOnlyStyle: React.CSSProperties = iconOnly
    ? { 
        width: size === "small" ? 32 : 40, 
        height: size === "small" ? 32 : 40,
        padding: 0 
      }
    : {}

  const isDisabled = disabled || loading

  return (
    <Comp
      data-slot="ds-button"
      data-variant={variant}
      data-size={size}
      disabled={isDisabled}
      className={cn(
        "ds-button",
        variantClass,
        sizeClass,
        (leadingIcon || trailingIcon) && !iconOnly && "gap-2",
        className
      )}
      style={{ ...getPaddingStyle(), ...iconOnlyStyle }}
      {...props}
    >
      {loading ? (
        <LoadingDots size={size} variant={variant} />
      ) : (
        <>
          {leadingIcon && (
            <span className={cn(
              "flex items-center justify-center shrink-0",
              variant === "destructive" && "ds-button-icon"
            )}>
              {leadingIcon}
            </span>
          )}
          {trailingIcon && (
            <span className={cn(
              "flex items-center justify-center shrink-0",
              variant === "destructive" && "ds-button-icon"
            )}>
              {trailingIcon}
            </span>
          )}
          {!iconOnly && children}
          {iconOnly && !leadingIcon && !trailingIcon && children && (
            <span className={cn(
              "flex items-center justify-center shrink-0",
              variant === "destructive" && "ds-button-icon"
            )}>
              {children}
            </span>
          )}
        </>
      )}
    </Comp>
  )
}

// Loading dots component
function LoadingDots({ 
  size, 
  variant 
}: { 
  size?: "small" | "large" | null
  variant?: "primary" | "secondary" | "tertiary" | "destructive" | "floating" | null
}) {
  const dotColorClass = variant === "primary" 
    ? "ds-button-loading-dot-primary" 
    : variant === "destructive"
    ? "ds-button-loading-dot-destructive"
    : "ds-button-loading-dot-default"
  
  const dotSize = size === "small" ? 4 : 6
  
  return (
    <span className="flex items-center gap-1">
      <span 
        className={cn("ds-button-loading-dot", dotColorClass)} 
        style={{ width: dotSize, height: dotSize }}
      />
      <span 
        className={cn("ds-button-loading-dot", dotColorClass)} 
        style={{ width: dotSize, height: dotSize, animationDelay: "150ms" }}
      />
      <span 
        className={cn("ds-button-loading-dot", dotColorClass)} 
        style={{ width: dotSize, height: dotSize, animationDelay: "300ms" }}
      />
    </span>
  )
}

export { DSButton }

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"

/**
 * @deprecated This is a generic shadcn/ui Button component.
 * For the Mercury Design System, prefer using `DSButton` from '@/components/ui/ds-button'
 * which implements the official Mercury button specifications with:
 * - 5 variants: primary, secondary, tertiary, destructive, floating
 * - 2 sizes: small (32px), large (40px)
 * - Support for leading/trailing icons, icon-only mode, and loading state
 * 
 * This component is kept for backwards compatibility and edge cases where
 * shadcn/ui patterns are required.
 */

export interface ButtonProps extends React.ComponentProps<"button"> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon" | "icon-sm" | "icon-lg"
  asChild?: boolean
}

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button"

  // Base classes
  const baseClasses = "button-base"
  
  // Variant classes
  const variantClasses: Record<string, string> = {
    default: "button-variant-default",
    destructive: "button-variant-destructive",
    outline: "button-variant-outline",
    secondary: "button-variant-secondary",
    ghost: "button-variant-ghost",
    link: "button-variant-link",
  }
  
  // Size classes
  const sizeClasses: Record<string, string> = {
    default: "button-default",
    sm: "button-sm",
    lg: "button-lg",
    icon: "button-icon",
    "icon-sm": "button-icon-sm",
    "icon-lg": "button-icon-lg",
  }

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    />
  )
}

export { Button }

"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core"
import { cn } from "@/lib/utils"
import { Icon } from "@/components/ui/icon"

export interface DSLinkProps extends Omit<React.ComponentProps<"a">, "children"> {
  /** Visual variant */
  variant?: "primary" | "secondary"
  /** Size variant */
  size?: "default" | "small"
  /** Optional icon */
  icon?: IconDefinition
  /** Icon position */
  iconPosition?: "left" | "right"
  /** Link label (use this or `children`) */
  label?: string
  /** Link contents (overrides `label` if provided) */
  children?: React.ReactNode
  /** Disabled state (prevents navigation/click) */
  disabled?: boolean
  /** Render as child (for react-router `Link`, etc.) */
  asChild?: boolean
}

export function DSLink({
  className,
  variant = "primary",
  size = "default",
  icon,
  iconPosition = "right",
  label,
  children,
  disabled = false,
  asChild = false,
  onClick,
  href,
  ...props
}: DSLinkProps) {
  const Comp = asChild ? Slot : "a"
  const content = children ?? label

  const handleClick: React.MouseEventHandler<HTMLElement> = (e) => {
    if (disabled) {
      e.preventDefault()
      e.stopPropagation()
      return
    }
    onClick?.(e as unknown as React.MouseEvent<HTMLAnchorElement>)
  }

  // Per DS usage rules: links use the small icon size by default.
  const iconSize = "small"

  return (
    <Comp
      data-slot="ds-link"
      data-variant={variant}
      data-size={size}
      data-icon-position={iconPosition}
      data-disabled={disabled ? "true" : "false"}
      className={cn("ds-link ds-link-base", className)}
      href={disabled ? undefined : href}
      aria-disabled={disabled || undefined}
      tabIndex={disabled ? -1 : props.tabIndex}
      onClick={handleClick}
      {...props}
    >
      {icon && iconPosition === "left" && (
        <Icon className="ds-link-icon" icon={icon} size={iconSize} />
      )}
      <span className="ds-link-label text-body">{content}</span>
      {icon && iconPosition === "right" && (
        <Icon className="ds-link-icon" icon={icon} size={iconSize} />
      )}
    </Comp>
  )
}


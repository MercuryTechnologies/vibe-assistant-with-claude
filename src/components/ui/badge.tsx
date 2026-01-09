import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"

// Icon colors by badge type
const iconColors: Record<string, { default: string; hover: string }> = {
  neutral: { default: "#70707d", hover: "#363644" },
  pearl: { default: "#494579", hover: "#363644" },
  highlight: { default: "#355b7f", hover: "#363644" },
  success: { default: "#188554", hover: "#363644" },
  warning: { default: "#c45000", hover: "#363644" },
  error: { default: "#d03275", hover: "#363644" },
}

// Icon component for badge - renders a circle indicator
function BadgeIcon({ type = "neutral" }: { type?: string }) {
  const colors = iconColors[type] || iconColors.neutral
  return (
    <svg
      className="ds-badge-icon"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle 
        cx="10" 
        cy="10" 
        r="4" 
        stroke={colors.default} 
        strokeWidth="1.5" 
        fill="none" 
      />
    </svg>
  )
}

export interface BadgeProps extends React.ComponentProps<"span"> {
  type?: "neutral" | "pearl" | "highlight" | "success" | "warning" | "error"
  asChild?: boolean
  hasIcon?: boolean
  label?: string
  icon?: React.ReactNode
}

function Badge({
  className,
  type = "neutral",
  asChild = false,
  hasIcon = false,
  label,
  icon,
  children,
  ...props
}: BadgeProps) {
  const Comp = asChild ? Slot : "span"

  // Get type class
  const typeClass = `ds-badge-${type}`

  return (
    <Comp
      data-slot="badge"
      className={cn(
        "ds-badge",
        typeClass,
        hasIcon && "has-icon",
        className
      )}
      {...props}
    >
      {hasIcon && (icon || <BadgeIcon type={type} />)}
      {label || children}
    </Comp>
  )
}

export { Badge, BadgeIcon }

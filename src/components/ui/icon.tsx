import * as React from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core"
import { cn } from "@/lib/utils"

/**
 * Icon Component - Design System Icon
 * 
 * A standardized icon component that wraps Font Awesome icons with consistent sizing.
 * 
 * Sizes:
 * - default: 24x24px container, 13px font size (most icons should use this)
 * - small: 20x20px container, 11px font size
 * 
 * The component uses the CSS variable `--ds-icon-default` for color, which defaults to #363644.
 */

export interface IconProps extends Omit<React.ComponentProps<"div">, "children"> {
  /** Font Awesome icon definition */
  icon: IconDefinition
  /** Size variant - default is 24x24px, small is 20x20px */
  size?: "default" | "small"
  /** Optional className for additional styling */
  className?: string
}

export function Icon({ icon, size = "default", className, style, ...props }: IconProps) {
  // Size configurations matching Figma design
  const sizeConfig = {
    default: {
      container: "24px",
      iconSize: "13px",
      padding: "4px",
    },
    small: {
      container: "20px",
      iconSize: "11px",
      padding: "4px",
    },
  }

  const config = sizeConfig[size]
  const mergedStyle: React.CSSProperties = {
    width: config.container,
    height: config.container,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: config.padding,
    // Default icon color; consumers can override via `style={{ color: ... }}`.
    color: "var(--ds-icon-default, #363644)",
    ...style,
  }

  return (
    <div
      className={cn("ds-icon", `ds-icon-${size}`, className)}
      style={mergedStyle}
      {...props}
    >
      <FontAwesomeIcon
        icon={icon}
        style={{
          width: config.iconSize,
          height: config.iconSize,
          color: "currentColor",
        }}
      />
    </div>
  )
}

/**
 * DSIcon - Design System Icon (alias)
 *
 * Some parts of the codebase reference `DSIcon` to make "design system" usage explicit.
 * This is a thin wrapper over `Icon` to enforce consistent sizing + usage patterns.
 */
export function DSIcon(props: IconProps) {
  return <Icon data-slot="ds-icon" {...props} />
}

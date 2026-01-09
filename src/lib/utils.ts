import { clsx, type ClassValue } from "clsx"

/**
 * Utility function for conditionally constructing className strings.
 * 
 * @example
 * cn("base-class", isActive && "active", disabled && "disabled")
 * cn("flex items-center", className)
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

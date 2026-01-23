import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * Avatar color mapping for each letter/digit based on Figma design system (Light Mode)
 * These are the background colors from the Figma _Local/Avatar/* variables
 */
const avatarColorMap: Record<string, string> = {
  // Letters A-Z grouped by color (light pastel backgrounds)
  'A': '#d2e6e2', 'B': '#d2e6e2', 'C': '#d2e6e2',  // Muted teal-green
  'D': '#d2e6e6', 'E': '#d2e6e6', 'F': '#d2e6e6',  // Light cyan
  'G': '#d1e7e9', 'H': '#d1e7e9', 'I': '#d1e7e9',  // Soft cyan
  'J': '#d1e5ee', 'K': '#d1e5ee', 'L': '#d1e5ee',  // Light blue
  'M': '#d2e3f1', 'N': '#d2e3f1', 'O': '#d2e3f1',  // Soft blue
  'P': '#d4e1f3', 'Q': '#d4e1f3', 'R': '#d4e1f3',  // Periwinkle blue
  'S': '#d8def4', 'T': '#d8def4', 'U': '#d8def4', 'V': '#d8def4',  // Lavender
  'W': '#dddbf2', 'X': '#dddbf2', 'Y': '#dddbf2', 'Z': '#dddbf2',  // Light purple
  // Digits 0-9 (light green tones)
  '0': '#d6e2d9', '1': '#d6e2d9', '2': '#d6e2d9', '3': '#d6e2d9',  // Sage green
  '4': '#d5e4db', '5': '#d5e4db', '6': '#d5e4db',  // Mint green
  '7': '#d3e5df', '8': '#d3e5df', '9': '#d3e5df',  // Seafoam
}

/** Role background colors from Figma (Light Mode) */
const roleColors = {
  admin: { bg: '#d1e1e8', text: '#183d4a' },       // Light blue bg, dark blue text
  custom: { bg: '#dddbf4', text: '#383255' },      // Light purple bg, dark purple text
  bookkeeper: { bg: '#dddde5', text: '#363644' },  // Light gray bg, dark gray text
  'card-only': { bg: '#d3e3d8', text: '#293d31' }, // Light green bg, dark green text
} as const

/** Default text color for Trx avatars (dark for light backgrounds) */
const avatarTextColor = '#1e1e2a'

export type DSAvatarType =
  | 'trx'
  | 'image'
  | 'mercury'
  | 'merchant'
  | 'financial-institution'
  | 'custom-icon'
  | 'role-admin'
  | 'role-custom'
  | 'role-bookkeeper'
  | 'role-card-only'

export type DSAvatarSize = 'small' | 'large'

export interface DSAvatarProps {
  /** Avatar type */
  type?: DSAvatarType
  /** Size: small (28px) or large (40px) */
  size?: DSAvatarSize
  /** Name or text to derive initials from (for trx type) */
  name?: string
  /** Image URL (for image type) */
  src?: string
  /** Alt text for image */
  alt?: string
  /** Custom icon element (for custom-icon type) */
  icon?: React.ReactNode
  /** Additional class names */
  className?: string
  /** Additional styles */
  style?: React.CSSProperties
}

/**
 * Get initials from a name string
 * Takes the first letter of up to 2 words
 */
function getInitials(name: string): string {
  const words = name.trim().split(/\s+/)
  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase()
  }
  return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase()
}

/**
 * Get avatar background color based on first character
 */
function getAvatarColor(name: string): string {
  const firstChar = name.trim().charAt(0).toUpperCase()
  return avatarColorMap[firstChar] || avatarColorMap['A']
}

/**
 * DSAvatar Component
 * 
 * A flexible avatar component matching the Figma design system.
 * Supports multiple types: transaction initials (trx), images, roles, 
 * Mercury branding, merchants, financial institutions, and custom icons.
 * 
 * @example
 * // Transaction avatar with automatic color based on first letter
 * <DSAvatar type="trx" name="Acme Corp" size="large" />
 * 
 * @example
 * // Image avatar
 * <DSAvatar type="image" src="/avatar.jpg" alt="John Doe" />
 * 
 * @example
 * // Role avatar
 * <DSAvatar type="role-admin" size="small" />
 */
export function DSAvatar({
  type = 'trx',
  size = 'small',
  name = '',
  src,
  alt,
  icon,
  className,
  style,
}: DSAvatarProps) {
  const sizeValue = size === 'small' ? 28 : 40
  const fontSize = size === 'small' ? 10 : 13
  const iconSize = size === 'small' ? 11 : 13

  const baseStyles: React.CSSProperties = {
    width: sizeValue,
    height: sizeValue,
    borderRadius: 'var(--radius-full)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    overflow: 'hidden',
    border: '1px solid var(--color-border-avatar)',
    ...style,
  }

  // Image type
  if (type === 'image') {
    return (
      <div className={cn('ds-avatar', className)} style={baseStyles}>
        {src ? (
          <img
            src={src}
            alt={alt || 'Avatar'}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: 'var(--ds-bg-secondary)',
            }}
          />
        )}
      </div>
    )
  }

  // Custom icon type
  if (type === 'custom-icon') {
    return (
      <div
        className={cn('ds-avatar', className)}
        style={{
          ...baseStyles,
          backgroundColor: 'var(--ds-bg-secondary)',
        }}
      >
        <span style={{ fontSize: iconSize, color: 'var(--ds-icon-secondary)' }}>
          {icon}
        </span>
      </div>
    )
  }

  // Mercury type (brand avatar)
  if (type === 'mercury') {
    return (
      <div
        className={cn('ds-avatar', className)}
        style={{
          ...baseStyles,
          backgroundColor: 'var(--ds-bg-inverted)',
        }}
      >
        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 24 24"
          fill="none"
          style={{ color: 'var(--ds-icon-on-inverted)' }}
        >
          <path
            d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    )
  }

  // Merchant type
  if (type === 'merchant') {
    return (
      <div
        className={cn('ds-avatar', className)}
        style={{
          ...baseStyles,
          backgroundColor: 'var(--ds-bg-secondary)',
        }}
      >
        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 24 24"
          fill="none"
          style={{ color: 'var(--ds-icon-secondary)' }}
        >
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
          <path
            d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>
      </div>
    )
  }

  // Financial institution type
  if (type === 'financial-institution') {
    return (
      <div
        className={cn('ds-avatar', className)}
        style={{
          ...baseStyles,
          backgroundColor: 'var(--blue-magic-600)',
        }}
      >
        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 24 24"
          fill="none"
          style={{ color: 'var(--ds-icon-on-inverted)' }}
        >
          <path
            d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    )
  }

  // Role types
  if (type.startsWith('role-')) {
    const roleKey = type.replace('role-', '') as keyof typeof roleColors
    const colors = roleColors[roleKey] || roleColors.admin

    // Role icon (shield or similar)
    return (
      <div
        className={cn('ds-avatar', className)}
        style={{
          ...baseStyles,
          backgroundColor: colors.bg,
        }}
      >
        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 24 24"
          fill="none"
          style={{ color: colors.text }}
        >
          <path
            d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    )
  }

  // Default: Trx (transaction) type with letter initials
  const initials = getInitials(name || 'A')
  const bgColor = getAvatarColor(name || 'A')

  return (
    <div
      className={cn('ds-avatar ds-avatar-trx', className)}
      style={{
        ...baseStyles,
        backgroundColor: bgColor,
      }}
    >
      <span
        className="ds-avatar-initials"
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize,
          fontWeight: 480,
          lineHeight: 1,
          color: avatarTextColor,
          textTransform: 'uppercase',
          letterSpacing: '0.02em',
        }}
      >
        {initials}
      </span>
    </div>
  )
}

export default DSAvatar

// Design tokens for Transactions page
// Extracted from Mercury UI reference

export const colors = {
  // Primary
  primary: '#6366F1',
  primaryHover: '#4F46E5',
  
  // Status
  success: '#10B981',
  successLight: '#D1FAE5',
  successDark: '#059669',
  danger: '#EF4444',
  dangerLight: '#FEE2E2',
  dangerBg: '#FEF2F2',
  warning: '#F59E0B',
  
  // Text
  textPrimary: '#111827',
  textSecondary: '#374151',
  textMuted: '#6B7280',
  textLight: '#9CA3AF',
  
  // Backgrounds
  bgWhite: '#FFFFFF',
  bgGray50: '#F9FAFB',
  bgGray100: '#F3F4F6',
  bgGray200: '#E5E7EB',
  
  // Borders
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  
  // Chart colors (matching bar chart design)
  chartGreen: '#0a5736',
  chartGreenLight: 'rgba(24, 133, 84, 0.16)',
  chartPink: '#d03275',
  chartPinkLight: 'rgba(208, 50, 117, 0.16)',
  chartBar1: '#D1FAE5',
  chartBar2: '#E5E7EB',
} as const;

export const typography = {
  // Font sizes
  xs: '11px',
  sm: '12px',
  base: '13px',
  md: '14px',
  lg: '16px',
  xl: '20px',
  '2xl': '24px',
  '3xl': '30px',
  
  // Font weights
  weightNormal: '400',
  weightMedium: '500',
  weightSemibold: '600',
  weightBold: '700',
  
  // Line heights
  lineHeightTight: '1.25',
  lineHeightNormal: '1.5',
  lineHeightRelaxed: '1.625',
} as const;

export const spacing = {
  px: '1px',
  0: '0px',
  0.5: '2px',
  1: '4px',
  1.5: '6px',
  2: '8px',
  2.5: '10px',
  3: '12px',
  3.5: '14px',
  4: '16px',
  5: '20px',
  6: '24px',
  7: '28px',
  8: '32px',
  9: '36px',
  10: '40px',
  11: '44px',
  12: '48px',
} as const;

export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
} as const;

export const borderRadius = {
  none: '0px',
  sm: '2px',
  DEFAULT: '4px',
  md: '6px',
  lg: '8px',
  xl: '12px',
  full: '9999px',
} as const;

// Avatar color palette for To/From icons (based on Figma DSAvatar component)
// Default uses a sage/mint green background matching the Figma design
export const avatarColors: Record<string, { bg: string; text: string }> = {
  // Sage/mint variants (primary palette from Figma)
  M: { bg: '#DBE5E0', text: '#374151' },
  P: { bg: '#D4E4ED', text: '#1E3A5F' },
  LE: { bg: '#E8E4D9', text: '#5C4A1F' },
  D7: { bg: '#D4E4ED', text: '#1E3A5F' },
  OS: { bg: '#D1E5DC', text: '#1F5C3D' },
  TJ: { bg: '#EBDCDC', text: '#8B3A3A' },
  MB: { bg: '#DFE0EB', text: '#3D3F6B' },
  // Default: light sage/mint background (matching Figma Trx › 0 style)
  default: { bg: '#DBE5E0', text: '#374151' },
};

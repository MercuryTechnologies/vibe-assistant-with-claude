/**
 * Color mapping for each letter/digit based on Figma design system (Trx variants)
 * Text color is #1e1e2a for all variants per design spec
 */
export const avatarTextColor = '#1e1e2a';

export const avatarColorMap: Record<string, { bg: string; text: string }> = {
  // Letters A-Z (grouped by color)
  'A': { bg: '#d2e6e2', text: avatarTextColor }, // Muted teal-green
  'B': { bg: '#d2e6e2', text: avatarTextColor },
  'C': { bg: '#d2e6e2', text: avatarTextColor },
  'D': { bg: '#d2e6e6', text: avatarTextColor }, // Light teal
  'E': { bg: '#d2e6e6', text: avatarTextColor },
  'F': { bg: '#d2e6e6', text: avatarTextColor },
  'G': { bg: '#d1e7e9', text: avatarTextColor }, // Soft cyan
  'H': { bg: '#d1e7e9', text: avatarTextColor },
  'I': { bg: '#d1e7e9', text: avatarTextColor },
  'J': { bg: '#d1e5ee', text: avatarTextColor }, // Light blue
  'K': { bg: '#d1e5ee', text: avatarTextColor },
  'L': { bg: '#d1e5ee', text: avatarTextColor },
  'M': { bg: '#d2e3f1', text: avatarTextColor }, // Soft blue
  'N': { bg: '#d2e3f1', text: avatarTextColor },
  'O': { bg: '#d2e3f1', text: avatarTextColor },
  'P': { bg: '#d4e1f3', text: avatarTextColor }, // Periwinkle blue
  'Q': { bg: '#d4e1f3', text: avatarTextColor },
  'R': { bg: '#d4e1f3', text: avatarTextColor },
  'S': { bg: '#d8def4', text: avatarTextColor }, // Lavender blue
  'T': { bg: '#d8def4', text: avatarTextColor },
  'U': { bg: '#d8def4', text: avatarTextColor },
  'V': { bg: '#d8def4', text: avatarTextColor },
  'W': { bg: '#dddbf2', text: avatarTextColor }, // Light purple
  'X': { bg: '#dddbf2', text: avatarTextColor },
  'Y': { bg: '#dddbf2', text: avatarTextColor },
  'Z': { bg: '#dddbf2', text: avatarTextColor },
  // Digits 0-9
  '0': { bg: '#d6e2d9', text: avatarTextColor }, // Sage green
  '1': { bg: '#d6e2d9', text: avatarTextColor },
  '2': { bg: '#d6e2d9', text: avatarTextColor },
  '3': { bg: '#d6e2d9', text: avatarTextColor },
  '4': { bg: '#d5e4db', text: avatarTextColor }, // Mint green
  '5': { bg: '#d5e4db', text: avatarTextColor },
  '6': { bg: '#d5e4db', text: avatarTextColor },
  '7': { bg: '#d3e5df', text: avatarTextColor }, // Seafoam
  '8': { bg: '#d3e5df', text: avatarTextColor },
  '9': { bg: '#d3e5df', text: avatarTextColor },
};

/**
 * Get color scheme based on first character of merchant name
 */
export const getAvatarColors = (merchant: string): { bg: string; text: string } => {
  const firstChar = merchant.trim()[0]?.toUpperCase() || 'A';
  return avatarColorMap[firstChar] || avatarColorMap['A'];
};

import { DSAvatar, type DSAvatarSize } from '@/components/ui/ds-avatar';

interface TransactionAvatarProps {
  merchant: string;
  size?: DSAvatarSize;
}

/**
 * Transaction Avatar component matching Figma design (Trx › [Letter] type)
 * Displays merchant initials in a colored circle based on first character
 * 
 * Now uses DSAvatar under the hood for consistent styling across the app.
 */
export function TransactionAvatar({ merchant, size = 'small' }: TransactionAvatarProps) {
  return <DSAvatar type="trx" name={merchant} size={size} />;
}

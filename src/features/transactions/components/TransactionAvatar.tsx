import { getMerchantInitials, getAvatarColors } from '../utils';

interface TransactionAvatarProps {
  merchant: string;
}

/**
 * Transaction Avatar component matching Figma design (Trx › [Letter] type)
 * Displays merchant initials in a colored circle based on first character
 */
export function TransactionAvatar({ merchant }: TransactionAvatarProps) {
  const initials = getMerchantInitials(merchant);
  const colors = getAvatarColors(merchant);
  
  return (
    <div 
      className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 overflow-hidden"
      style={{ backgroundColor: colors.bg }}
    >
      <span 
        className="text-tiny"
        style={{ color: colors.text }}
      >
        {initials}
      </span>
    </div>
  );
}

import type { Transaction } from '@/types';

/**
 * Format date as "Mar 30"
 */
export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Account type mapping (simplified for demo)
 */
export const getAccountType = (accountId: string): string => {
  const types: Record<string, string> = {
    'acc_001': 'Main Checking',
    'acc_002': 'Treasury',
    'acc_003': 'Ops/Payroll',
  };
  return types[accountId] || 'AP';
};

/**
 * Method type based on transaction type
 */
export const getMethod = (transaction: Transaction): string => {
  if (transaction.type === 'transfer') return 'Transfer Out';
  if (transaction.amount >= 0) return 'ACH In';
  return 'ACH Payment';
};

/**
 * Simulate which transactions have attachments (based on id for demo consistency)
 */
export const hasAttachment = (transactionId: string): boolean => {
  // Use a simple hash to deterministically decide attachments
  const hash = transactionId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return hash % 3 === 0; // ~33% of transactions have attachments
};

/**
 * Get initials from merchant name (first two letters or first letter of first two words)
 */
export const getMerchantInitials = (merchant: string): string => {
  const words = merchant.trim().split(/\s+/);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return merchant.slice(0, 2).toUpperCase();
};

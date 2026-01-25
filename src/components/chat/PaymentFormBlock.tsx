import { useState } from 'react';
import type { PaymentFormMetadata } from '@/chat/types';
import { DSButton } from '@/components/ui/ds-button';
import { DSTextInput } from '@/components/ui/ds-text-input';
import { DSCombobox } from '@/components/ui/ds-combobox';
import { DSRadioGroup } from '@/components/ui/ds-radio-group';
import { DSAvatar } from '@/components/ui/ds-avatar';
import { Icon } from '@/components/ui/icon';
import { faPaperPlane } from '@/icons';

interface PaymentFormBlockProps {
  data: PaymentFormMetadata;
  onSubmit?: (payment: PaymentData) => void;
  onCancel?: () => void;
  className?: string;
}

export interface PaymentData {
  recipientId?: string;
  recipientName: string;
  amount: number;
  paymentType: 'ach' | 'wire';
  memo: string;
  fromAccountId: string;
}

// Mock accounts for the dropdown
const ACCOUNTS = [
  { value: 'acc_operating', label: 'Operating ••4521' },
  { value: 'acc_payroll', label: 'Payroll ••7832' },
  { value: 'acc_treasury', label: 'Treasury ••9012' },
];

/**
 * PaymentFormBlock - Inline payment form for sending ACH/Wire payments
 * Renders within the chat when metadata.paymentForm is present
 */
export function PaymentFormBlock({ 
  data, 
  onSubmit, 
  onCancel,
  className = '' 
}: PaymentFormBlockProps) {
  const [amount, setAmount] = useState(data.suggestedAmount?.toString() || '');
  const [paymentType, setPaymentType] = useState<'ach' | 'wire'>(data.paymentType || 'ach');
  const [memo, setMemo] = useState(data.memo || '');
  const [fromAccount, setFromAccount] = useState('acc_operating');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const handleSubmit = async () => {
    if (!amount || isSubmitting) return;
    
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    if (onSubmit) {
      onSubmit({
        recipientId: data.recipientId,
        recipientName: data.recipientName || '',
        amount: parseFloat(amount.replace(/,/g, '')),
        paymentType,
        memo,
        fromAccountId: fromAccount,
      });
    }
    
    setIsSubmitting(false);
    setIsSubmitted(true);
  };
  
  // Format amount with commas
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9.]/g, '');
    setAmount(value);
  };
  
  // Show success state after submission
  if (isSubmitted) {
    return (
      <div 
        className={`chat-payment-form ${className}`}
        style={{
          marginTop: 12,
          padding: 16,
          backgroundColor: 'var(--ds-bg-success)',
          borderRadius: 'var(--radius-md)',
        }}
      >
        <div className="flex items-center gap-3">
          <Icon icon={faPaperPlane} style={{ color: 'var(--ds-icon-success)' }} />
          <div className="flex flex-col">
            <span className="text-body-demi" style={{ color: 'var(--ds-text-default)' }}>
              Payment sent
            </span>
            <span className="text-label" style={{ color: 'var(--ds-text-secondary)' }}>
              ${parseFloat(amount).toLocaleString()} to {data.recipientName} via {paymentType.toUpperCase()}
            </span>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div 
      className={`chat-payment-form ${className}`}
      style={{
        marginTop: 12,
        padding: 16,
        backgroundColor: 'var(--ds-bg-secondary)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--color-border-default)',
      }}
    >
      {/* Header with recipient */}
      <div className="flex items-center gap-3" style={{ marginBottom: 16 }}>
        <DSAvatar type="trx" name={data.recipientName || 'Recipient'} size="large" />
        <div className="flex flex-col">
          <span className="text-body-demi" style={{ color: 'var(--ds-text-default)' }}>
            Send Payment
          </span>
          <span className="text-label" style={{ color: 'var(--ds-text-secondary)' }}>
            to {data.recipientName || 'Recipient'}
          </span>
        </div>
      </div>
      
      {/* Form fields */}
      <div className="flex flex-col gap-4">
        <DSTextInput
          label="Amount"
          prefix="$"
          placeholder="0.00"
          value={amount}
          onChange={handleAmountChange}
        />
        
        <DSRadioGroup
          label="Payment Type"
          name="paymentType"
          value={paymentType}
          onChange={(value) => setPaymentType(value as 'ach' | 'wire')}
          options={[
            { value: 'ach', label: 'ACH', description: '1-2 business days' },
            { value: 'wire', label: 'Wire', description: 'Same day (fee applies)' },
          ]}
          variant="simple"
        />
        
        <DSTextInput
          label="Memo (optional)"
          placeholder="What's this payment for?"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
        />
        
        <DSCombobox
          label="From Account"
          value={fromAccount}
          onChange={(value) => setFromAccount(value)}
          options={ACCOUNTS}
        />
      </div>
      
      {/* Actions */}
      <div 
        className="flex items-center justify-between"
        style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--color-border-default)' }}
      >
        <DSButton 
          variant="tertiary" 
          size="large"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </DSButton>
        <DSButton 
          variant="primary" 
          size="large"
          onClick={handleSubmit}
          disabled={!amount || isSubmitting}
        >
          {isSubmitting ? 'Sending...' : `Send ${paymentType.toUpperCase()}`}
        </DSButton>
      </div>
    </div>
  );
}

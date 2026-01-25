import { useState } from 'react';
import type { RecipientCreateMetadata } from '@/chat/types';
import { DSButton } from '@/components/ui/ds-button';
import { DSTextInput } from '@/components/ui/ds-text-input';
import { DSRadioGroup } from '@/components/ui/ds-radio-group';
import { Icon } from '@/components/ui/icon';
import { faUser, faCheck } from '@/icons';

interface RecipientCreateBlockProps {
  data: RecipientCreateMetadata;
  onSubmit?: (recipient: RecipientData) => void;
  onCancel?: () => void;
  className?: string;
}

export interface RecipientData {
  name: string;
  bankName: string;
  routingNumber: string;
  accountNumber: string;
  accountType: 'checking' | 'savings';
}

/**
 * RecipientCreateBlock - Inline form for adding a new payment recipient
 * Renders within the chat when metadata.recipientCreate is present
 */
export function RecipientCreateBlock({ 
  data, 
  onSubmit, 
  onCancel,
  className = '' 
}: RecipientCreateBlockProps) {
  const [name, setName] = useState(data.suggestedName || '');
  const [bankName, setBankName] = useState('');
  const [routingNumber, setRoutingNumber] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountType, setAccountType] = useState<'checking' | 'savings'>('checking');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  // Validate routing number (9 digits)
  const isRoutingValid = routingNumber.length === 9 && /^\d+$/.test(routingNumber);
  // Validate account number (4-17 digits)
  const isAccountValid = accountNumber.length >= 4 && accountNumber.length <= 17 && /^\d+$/.test(accountNumber);
  
  const isFormValid = name && bankName && isRoutingValid && isAccountValid;
  
  const handleSubmit = async () => {
    if (!isFormValid || isSubmitting) return;
    
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    if (onSubmit) {
      onSubmit({
        name,
        bankName,
        routingNumber,
        accountNumber,
        accountType,
      });
    }
    
    setIsSubmitting(false);
    setIsSubmitted(true);
  };
  
  // Show success state after submission
  if (isSubmitted) {
    return (
      <div 
        className={`chat-recipient-form ${className}`}
        style={{
          marginTop: 12,
          padding: 16,
          backgroundColor: 'var(--ds-bg-success)',
          borderRadius: 'var(--radius-md)',
        }}
      >
        <div className="flex items-center gap-3">
          <Icon icon={faCheck} style={{ color: 'var(--ds-icon-success)' }} />
          <div className="flex flex-col">
            <span className="text-body-demi" style={{ color: 'var(--ds-text-default)' }}>
              Recipient added
            </span>
            <span className="text-label" style={{ color: 'var(--ds-text-secondary)' }}>
              {name} at {bankName} (••{accountNumber.slice(-4)})
            </span>
          </div>
        </div>
        {data.afterAction?.type === 'send_payment' && (
          <div style={{ marginTop: 12 }}>
            <span className="text-label" style={{ color: 'var(--ds-text-secondary)' }}>
              Ready to send payment. Type an amount or tell me more about this payment.
            </span>
          </div>
        )}
      </div>
    );
  }
  
  return (
    <div 
      className={`chat-recipient-form ${className}`}
      style={{
        marginTop: 12,
        padding: 16,
        backgroundColor: 'var(--ds-bg-secondary)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--color-border-default)',
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-3" style={{ marginBottom: 16 }}>
        <div 
          style={{
            width: 40,
            height: 40,
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--ds-bg-emphasized)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon icon={faUser} style={{ color: 'var(--ds-icon-secondary)' }} />
        </div>
        <div className="flex flex-col">
          <span className="text-body-demi" style={{ color: 'var(--ds-text-default)' }}>
            Add New Recipient
          </span>
          <span className="text-label" style={{ color: 'var(--ds-text-secondary)' }}>
            Enter bank account details
          </span>
        </div>
      </div>
      
      {/* Form fields */}
      <div className="flex flex-col gap-4">
        <DSTextInput
          label="Recipient Name"
          placeholder="e.g., Acme Corp"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        
        <DSTextInput
          label="Bank Name"
          placeholder="e.g., Chase, Wells Fargo"
          value={bankName}
          onChange={(e) => setBankName(e.target.value)}
        />
        
        <div className="flex gap-4">
          <div style={{ flex: 1 }}>
            <DSTextInput
              label="Routing Number"
              placeholder="9 digits"
              value={routingNumber}
              onChange={(e) => setRoutingNumber(e.target.value.replace(/\D/g, '').slice(0, 9))}
              error={routingNumber.length > 0 && !isRoutingValid}
              errorMessage={routingNumber.length > 0 && !isRoutingValid ? 'Must be 9 digits' : undefined}
            />
          </div>
          <div style={{ flex: 1 }}>
            <DSTextInput
              label="Account Number"
              placeholder="4-17 digits"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, '').slice(0, 17))}
              error={accountNumber.length > 0 && !isAccountValid}
              errorMessage={accountNumber.length > 0 && !isAccountValid ? '4-17 digits required' : undefined}
            />
          </div>
        </div>
        
        <DSRadioGroup
          label="Account Type"
          name="accountType"
          value={accountType}
          onChange={(value) => setAccountType(value as 'checking' | 'savings')}
          options={[
            { value: 'checking', label: 'Checking' },
            { value: 'savings', label: 'Savings' },
          ]}
          variant="simple"
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
          disabled={!isFormValid || isSubmitting}
        >
          {isSubmitting ? 'Adding...' : 'Add Recipient'}
        </DSButton>
      </div>
    </div>
  );
}

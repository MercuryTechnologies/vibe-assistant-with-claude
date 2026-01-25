import { useState } from 'react';
import type { RecipientsMetadata, RecipientRow } from '@/chat/types';
import { DSButton } from '@/components/ui/ds-button';
import { DSAvatar } from '@/components/ui/ds-avatar';
import { DSMoneyAmount } from '@/components/ui/ds-money-amount';
import { Icon } from '@/components/ui/icon';
import { faPaperPlane } from '@/icons';

interface RecipientsBlockProps {
  data: RecipientsMetadata;
  context?: 'rhc' | 'command';
  onSendPayment?: (recipientId: string, recipientName: string) => void;
  className?: string;
}

/**
 * Format date for display
 */
function formatDate(dateStr?: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/**
 * RecipientsBlock - Displays recipients with payment actions
 */
export function RecipientsBlock({ 
  data, 
  context = 'rhc',
  onSendPayment,
  className = '' 
}: RecipientsBlockProps) {
  const [selectedRecipient, setSelectedRecipient] = useState<RecipientRow | null>(null);
  const isCompact = context === 'rhc';
  
  const handleSendPayment = (recipient: RecipientRow) => {
    if (onSendPayment) {
      onSendPayment(recipient.id, recipient.name);
    } else {
      setSelectedRecipient(recipient);
    }
  };
  
  return (
    <div className={`chat-recipients ${className}`} style={{ marginTop: 12 }}>
      {data.title && (
        <h4 className="text-label-demi" style={{ 
          color: 'var(--ds-text-default)', 
          marginBottom: 8 
        }}>
          {data.title}
        </h4>
      )}
      
      <div className="flex flex-col gap-2">
        {data.rows.map((recipient) => (
          <div 
            key={recipient.id}
            className="flex items-center justify-between gap-3"
            style={{
              padding: '8px 12px',
              backgroundColor: 'var(--ds-bg-secondary)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <div className="flex items-center gap-3">
              <DSAvatar type="trx" name={recipient.name} size="small" />
              <div className="flex flex-col">
                <span className="text-body-sm" style={{ color: 'var(--ds-text-default)' }}>
                  {recipient.name}
                </span>
                <span className="text-tiny" style={{ color: 'var(--ds-text-tertiary)' }}>
                  {recipient.bankName && `${recipient.bankName} `}
                  {recipient.accountLast4 && `••${recipient.accountLast4}`}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {!isCompact && recipient.lastPaidDate && (
                <div className="flex flex-col items-end">
                  <span className="text-tiny" style={{ color: 'var(--ds-text-tertiary)' }}>
                    Last paid {formatDate(recipient.lastPaidDate)}
                  </span>
                  {recipient.lastPaidAmount && (
                    <DSMoneyAmount 
                      value={-recipient.lastPaidAmount} 
                      size="sm"
                    />
                  )}
                </div>
              )}
              
              {data.allowPayment && (
                <DSButton
                  variant="secondary"
                  size="small"
                  onClick={() => handleSendPayment(recipient)}
                >
                  <Icon icon={faPaperPlane} size="small" />
                  Send
                </DSButton>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {/* Inline payment confirmation */}
      {selectedRecipient && (
        <div 
          style={{
            marginTop: 12,
            padding: 12,
            backgroundColor: 'var(--ds-bg-emphasized)',
            borderRadius: 'var(--radius-md)',
          }}
        >
          <span className="text-body-sm" style={{ color: 'var(--ds-text-default)' }}>
            Ready to send a payment to <strong>{selectedRecipient.name}</strong>. 
            Type an amount or tell me more about this payment.
          </span>
        </div>
      )}
    </div>
  );
}

import { useState } from 'react';
import type { InvoiceFormMetadata } from '@/chat/types';
import { DSButton } from '@/components/ui/ds-button';
import { DSTextInput } from '@/components/ui/ds-text-input';
import { Icon } from '@/components/ui/icon';
import { faFileInvoiceDollar, faCheck, faPlus, faXmark } from '@/icons';

interface InvoiceFormBlockProps {
  data: InvoiceFormMetadata;
  onSubmit?: (invoice: InvoiceData) => void;
  onCancel?: () => void;
  className?: string;
}

export interface InvoiceLineItem {
  id: string;
  description: string;
  amount: number;
}

export interface InvoiceData {
  clientName: string;
  clientEmail: string;
  lineItems: InvoiceLineItem[];
  dueDate: string;
  notes: string;
}

/**
 * InvoiceFormBlock - Inline form for creating and sending invoices
 * Renders within the chat when metadata.invoiceForm is present
 */
export function InvoiceFormBlock({ 
  data, 
  onSubmit, 
  onCancel,
  className = '' 
}: InvoiceFormBlockProps) {
  const [clientName, setClientName] = useState(data.suggestedClient || '');
  const [clientEmail, setClientEmail] = useState('');
  const [lineItems, setLineItems] = useState<InvoiceLineItem[]>(
    data.draftItems?.map((item, i) => ({ id: `item-${i}`, ...item })) || 
    [{ id: 'item-0', description: '', amount: data.suggestedAmount || 0 }]
  );
  const [dueDate, setDueDate] = useState(data.dueDate || '');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  // Calculate total
  const total = lineItems.reduce((sum, item) => sum + (item.amount || 0), 0);
  
  const isFormValid = clientName && clientEmail && lineItems.some(item => item.description && item.amount > 0);
  
  const addLineItem = () => {
    setLineItems([...lineItems, { id: `item-${Date.now()}`, description: '', amount: 0 }]);
  };
  
  const removeLineItem = (id: string) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter(item => item.id !== id));
    }
  };
  
  const updateLineItem = (id: string, field: 'description' | 'amount', value: string | number) => {
    setLineItems(lineItems.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };
  
  const handleSubmit = async () => {
    if (!isFormValid || isSubmitting) return;
    
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    if (onSubmit) {
      onSubmit({
        clientName,
        clientEmail,
        lineItems: lineItems.filter(item => item.description && item.amount > 0),
        dueDate,
        notes,
      });
    }
    
    setIsSubmitting(false);
    setIsSubmitted(true);
  };
  
  // Show success state after submission
  if (isSubmitted) {
    return (
      <div 
        className={`chat-invoice-form ${className}`}
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
              Invoice sent
            </span>
            <span className="text-label" style={{ color: 'var(--ds-text-secondary)' }}>
              ${total.toLocaleString()} invoice sent to {clientName} ({clientEmail})
            </span>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div 
      className={`chat-invoice-form ${className}`}
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
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--ds-bg-highlight)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon icon={faFileInvoiceDollar} style={{ color: 'var(--ds-icon-primary)' }} />
        </div>
        <div className="flex flex-col">
          <span className="text-body-demi" style={{ color: 'var(--ds-text-default)' }}>
            Create Invoice
          </span>
          <span className="text-label" style={{ color: 'var(--ds-text-secondary)' }}>
            Bill a client for your services
          </span>
        </div>
      </div>
      
      {/* Client fields */}
      <div className="flex flex-col gap-4">
        <div className="flex gap-4">
          <div style={{ flex: 1 }}>
            <DSTextInput
              label="Client Name"
              placeholder="e.g., Acme Corp"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
            />
          </div>
          <div style={{ flex: 1 }}>
            <DSTextInput
              label="Client Email"
              placeholder="billing@acme.com"
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
            />
          </div>
        </div>
        
        {/* Line items */}
        <div>
          <span className="text-label-demi" style={{ color: 'var(--ds-text-default)', display: 'block', marginBottom: 8 }}>
            Line Items
          </span>
          <div className="flex flex-col gap-2">
            {lineItems.map((item) => (
              <div key={item.id} className="flex items-center gap-2">
                <div style={{ flex: 2 }}>
                  <DSTextInput
                    placeholder="Description"
                    value={item.description}
                    onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <DSTextInput
                    prefix="$"
                    placeholder="0.00"
                    value={item.amount > 0 ? item.amount.toString() : ''}
                    onChange={(e) => updateLineItem(item.id, 'amount', parseFloat(e.target.value) || 0)}
                  />
                </div>
                {lineItems.length > 1 && (
                  <DSButton
                    variant="tertiary"
                    size="small"
                    iconOnly
                    onClick={() => removeLineItem(item.id)}
                    aria-label="Remove line item"
                  >
                    <Icon icon={faXmark} size="small" style={{ color: 'var(--ds-icon-secondary)' }} />
                  </DSButton>
                )}
              </div>
            ))}
          </div>
          <DSButton
            variant="tertiary"
            size="small"
            onClick={addLineItem}
            style={{ marginTop: 8 }}
          >
            <Icon icon={faPlus} size="small" style={{ color: 'var(--ds-icon-primary)' }} />
            Add line item
          </DSButton>
        </div>
        
        {/* Due date */}
        <DSTextInput
          label="Due Date (optional)"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
        
        {/* Notes */}
        <DSTextInput
          label="Notes (optional)"
          placeholder="Payment terms, additional details..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>
      
      {/* Total */}
      <div 
        className="flex items-center justify-between"
        style={{ marginTop: 16, padding: '12px 0', borderTop: '1px solid var(--color-border-default)' }}
      >
        <span className="text-body-demi" style={{ color: 'var(--ds-text-default)' }}>Total</span>
        <span className="text-body-demi" style={{ color: 'var(--ds-text-default)', fontVariantNumeric: 'tabular-nums' }}>
          ${total.toLocaleString()}
        </span>
      </div>
      
      {/* Actions */}
      <div 
        className="flex items-center justify-between"
        style={{ paddingTop: 16, borderTop: '1px solid var(--color-border-default)' }}
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
          {isSubmitting ? 'Sending...' : 'Send Invoice'}
        </DSButton>
      </div>
    </div>
  );
}

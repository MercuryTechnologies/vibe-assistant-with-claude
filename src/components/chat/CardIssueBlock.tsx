import { useState } from 'react';
import type { CardIssueMetadata } from '@/chat/types';
import { DSButton } from '@/components/ui/ds-button';
import { DSTextInput } from '@/components/ui/ds-text-input';
import { DSCombobox } from '@/components/ui/ds-combobox';
import { DSRadioGroup } from '@/components/ui/ds-radio-group';
import { Icon } from '@/components/ui/icon';
import { faCreditCard, faCheck } from '@/icons';

interface CardIssueBlockProps {
  data: CardIssueMetadata;
  onSubmit?: (card: CardIssueData) => void;
  onCancel?: () => void;
  className?: string;
}

export interface CardIssueData {
  employeeId: string;
  employeeName: string;
  cardType: 'virtual' | 'physical';
  monthlyLimit: number;
  cardName: string;
}

/**
 * CardIssueBlock - Inline form for issuing a new card to an employee
 * Renders within the chat when metadata.cardIssue is present
 */
export function CardIssueBlock({ 
  data, 
  onSubmit, 
  onCancel,
  className = '' 
}: CardIssueBlockProps) {
  const [employeeId, setEmployeeId] = useState(data.employeeId || '');
  const [cardType, setCardType] = useState<'virtual' | 'physical'>(data.cardType || 'virtual');
  const [limit, setLimit] = useState(data.suggestedLimit?.toString() || '2000');
  const [cardName, setCardName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  // Get employee options for dropdown
  const employeeOptions = data.employees.map(e => ({
    value: e.id,
    label: `${e.name} (${e.email})`,
  }));
  
  // Find selected employee
  const selectedEmployee = data.employees.find(e => e.id === employeeId);
  
  const isFormValid = employeeId && limit;
  
  const handleSubmit = async () => {
    if (!isFormValid || isSubmitting) return;
    
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    if (onSubmit) {
      onSubmit({
        employeeId,
        employeeName: selectedEmployee?.name || '',
        cardType,
        monthlyLimit: parseFloat(limit.replace(/,/g, '')),
        cardName,
      });
    }
    
    setIsSubmitting(false);
    setIsSubmitted(true);
  };
  
  // Show success state after submission
  if (isSubmitted) {
    return (
      <div 
        className={`chat-card-issue-form ${className}`}
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
              Card issued
            </span>
            <span className="text-label" style={{ color: 'var(--ds-text-secondary)' }}>
              {cardType === 'virtual' ? 'Virtual' : 'Physical'} card for {selectedEmployee?.name} with ${parseFloat(limit).toLocaleString()} limit
            </span>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div 
      className={`chat-card-issue-form ${className}`}
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
            backgroundColor: 'var(--ds-bg-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon icon={faCreditCard} style={{ color: 'var(--ds-icon-on-primary)' }} />
        </div>
        <div className="flex flex-col">
          <span className="text-body-demi" style={{ color: 'var(--ds-text-default)' }}>
            Issue New Card
          </span>
          <span className="text-label" style={{ color: 'var(--ds-text-secondary)' }}>
            Create a card for a team member
          </span>
        </div>
      </div>
      
      {/* Form fields */}
      <div className="flex flex-col gap-4">
        <DSCombobox
          label="Employee"
          value={employeeId}
          onChange={(value) => setEmployeeId(value)}
          options={employeeOptions}
          placeholder="Select an employee"
        />
        
        <DSRadioGroup
          label="Card Type"
          name="cardType"
          value={cardType}
          onChange={(value) => setCardType(value as 'virtual' | 'physical')}
          options={[
            { value: 'virtual', label: 'Virtual', description: 'Instant, for online purchases' },
            { value: 'physical', label: 'Physical', description: 'Ships in 5-7 days' },
          ]}
          variant="simple"
        />
        
        <DSTextInput
          label="Monthly Limit"
          prefix="$"
          placeholder="2,000"
          value={limit}
          onChange={(e) => setLimit(e.target.value.replace(/[^0-9]/g, ''))}
        />
        
        <DSTextInput
          label="Card Name (optional)"
          placeholder="e.g., Team Expenses, Software Licenses"
          value={cardName}
          onChange={(e) => setCardName(e.target.value)}
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
          {isSubmitting ? 'Issuing...' : 'Issue Card'}
        </DSButton>
      </div>
    </div>
  );
}

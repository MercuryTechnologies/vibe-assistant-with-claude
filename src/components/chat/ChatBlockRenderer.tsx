import { useNavigate } from 'react-router-dom';
import type { MessageMetadata } from '@/chat/types';
import { ChatMessage } from './ChatMessage';
import { ThinkingChain } from './ThinkingChain';
import { NavigationCard } from './NavigationCard';
import { TransactionTable } from './TransactionTable';
import { EmployeeTable } from './EmployeeTable';
import { TaskTableBlock } from './TaskTableBlock';
import { CardsTableBlock } from './CardsTableBlock';
import { AccountBalancesBlock } from './AccountBalancesBlock';
import { RecipientsBlock } from './RecipientsBlock';
import { DocumentsBlock } from './DocumentsBlock';
import { FeatureCardsBlock } from './FeatureCardsBlock';
import { SuggestedActions } from './SuggestedActions';
import { PaymentFormBlock, type PaymentData } from './PaymentFormBlock';
import { RecipientCreateBlock, type RecipientData } from './RecipientCreateBlock';
import { CardIssueBlock, type CardIssueData } from './CardIssueBlock';
import { InvoiceFormBlock, type InvoiceData } from './InvoiceFormBlock';
import { ConfirmationBlock } from './ConfirmationBlock';
import { PlanBlock } from './PlanBlock';
import { Badge } from '@/components/ui/badge';

/**
 * Action payload types for inline actions
 */
export type ActionPayload = 
  | { type: 'send_payment'; data: PaymentData }
  | { type: 'create_recipient'; data: RecipientData }
  | { type: 'issue_card'; data: CardIssueData }
  | { type: 'create_invoice'; data: InvoiceData }
  | { type: 'freeze_card'; cardId: string }
  | { type: 'update_limit'; cardId: string; newLimit: number }
  | { type: 'confirm_action'; actionId: string }
  | { type: 'undo_action'; actionId: string }
  | { type: 'execute_plan'; planId: string }
  | { type: 'cancel_plan'; planId: string };

interface ChatBlockRendererProps {
  content: string;
  metadata?: MessageMetadata;
  onNavigate?: (url: string) => void;
  onEmployeeSelect?: (ids: string[]) => void;
  onAction?: (action: ActionPayload) => void;
  onSuggestedAction?: (action: string) => void;
  context?: 'rhc' | 'command';
  className?: string;
  animateFeatureCards?: boolean;  // Enable card deal animation for feature cards
}

/**
 * ChatBlockRenderer - Renders chat message content and all associated metadata blocks
 * Dispatches to the appropriate component based on metadata type
 * Passes context to all child components for responsive styling
 */
export function ChatBlockRenderer({ 
  content, 
  metadata,
  onNavigate,
  onEmployeeSelect,
  onAction,
  onSuggestedAction,
  context = 'rhc',
  className = '',
  animateFeatureCards = false,
}: ChatBlockRendererProps) {
  const navigate = useNavigate();
  
  const handleNavigate = (url: string) => {
    if (onNavigate) {
      onNavigate(url);
    } else {
      navigate(url);
    }
  };
  
  // Handle action submissions from inline forms
  const handlePaymentSubmit = (data: PaymentData) => {
    onAction?.({ type: 'send_payment', data });
  };
  
  const handleRecipientSubmit = (data: RecipientData) => {
    onAction?.({ type: 'create_recipient', data });
  };
  
  const handleCardIssueSubmit = (data: CardIssueData) => {
    onAction?.({ type: 'issue_card', data });
  };
  
  const handleInvoiceSubmit = (data: InvoiceData) => {
    onAction?.({ type: 'create_invoice', data });
  };
  
  // Confirmation handlers
  const handleConfirm = (actionId: string) => {
    onAction?.({ type: 'confirm_action', actionId });
  };
  
  const handleUndo = (actionId: string) => {
    onAction?.({ type: 'undo_action', actionId });
  };
  
  // Plan handlers
  const handlePlanConfirm = (planId: string) => {
    onAction?.({ type: 'execute_plan', planId });
  };
  
  const handlePlanCancel = (planId: string) => {
    onAction?.({ type: 'cancel_plan', planId });
  };

  const isCompact = context === 'rhc';

  return (
    <div className={`chat-block-renderer ${className}`}>
      {/* Support Mode Badge */}
      {metadata?.supportMode && (
        <div style={{ marginBottom: 8 }}>
          <Badge type="highlight">
            Mercury Support
          </Badge>
        </div>
      )}
      
      {/* Thinking Chain (shows tool usage steps) */}
      {metadata?.thinkingChain && (
        <ThinkingChain steps={metadata.thinkingChain} context={context} />
      )}
      
      {/* Main text content with markdown */}
      {content && (
        <ChatMessage content={content} />
      )}
      
      {/* Transaction Table */}
      {metadata?.transactionTable && (
        <TransactionTable 
          data={metadata.transactionTable} 
          context={context}
        />
      )}
      
      {/* Employee Table */}
      {metadata?.employeeTable && (
        <EmployeeTable 
          data={metadata.employeeTable}
          context={context}
          onSelectionChange={onEmployeeSelect}
        />
      )}
      
      {/* Task Table */}
      {metadata?.taskTable && (
        <TaskTableBlock 
          data={metadata.taskTable}
          context={context}
        />
      )}
      
      {/* Cards Table */}
      {metadata?.cardsTable && (
        <CardsTableBlock 
          data={metadata.cardsTable}
          context={context}
        />
      )}
      
      {/* Account Balances */}
      {metadata?.accountBalances && (
        <AccountBalancesBlock 
          data={metadata.accountBalances}
          context={context}
        />
      )}
      
      {/* Recipients */}
      {metadata?.recipients && (
        <RecipientsBlock 
          data={metadata.recipients}
          context={context}
        />
      )}
      
      {/* Documents */}
      {metadata?.documents && (
        <DocumentsBlock 
          data={metadata.documents}
          context={context}
        />
      )}
      
      {/* Feature Cards */}
      {metadata?.featureCards && (
        <FeatureCardsBlock 
          data={metadata.featureCards}
          context={context}
          onNavigate={handleNavigate}
          animate={animateFeatureCards}
        />
      )}
      
      {/* Suggested Actions */}
      {metadata?.suggestedActions && metadata.suggestedActions.length > 0 && onSuggestedAction && (
        <SuggestedActions
          actions={metadata.suggestedActions}
          onAction={onSuggestedAction}
          context={context}
        />
      )}
      
      {/* Payment Form */}
      {metadata?.paymentForm && (
        <PaymentFormBlock 
          data={metadata.paymentForm}
          onSubmit={handlePaymentSubmit}
        />
      )}
      
      {/* Recipient Create Form */}
      {metadata?.recipientCreate && (
        <RecipientCreateBlock 
          data={metadata.recipientCreate}
          onSubmit={handleRecipientSubmit}
        />
      )}
      
      {/* Card Issue Form */}
      {metadata?.cardIssue && (
        <CardIssueBlock 
          data={metadata.cardIssue}
          onSubmit={handleCardIssueSubmit}
        />
      )}
      
      {/* Invoice Form */}
      {metadata?.invoiceForm && (
        <InvoiceFormBlock 
          data={metadata.invoiceForm}
          onSubmit={handleInvoiceSubmit}
        />
      )}
      
      {/* Confirmation Block */}
      {metadata?.confirmationRequest && (
        <ConfirmationBlock 
          id={metadata.confirmationRequest.id}
          action={metadata.confirmationRequest.action}
          currentValue={metadata.confirmationRequest.currentValue}
          newValue={metadata.confirmationRequest.newValue}
          targetId={metadata.confirmationRequest.targetId}
          targetName={metadata.confirmationRequest.targetName}
          onConfirm={handleConfirm}
          onUndo={handleUndo}
          context={context}
        />
      )}
      
      {/* Plan Block */}
      {metadata?.plan && (
        <PlanBlock 
          plan={metadata.plan}
          onConfirm={handlePlanConfirm}
          onCancel={handlePlanCancel}
          context={context}
        />
      )}
      
      {/* Empty State */}
      {metadata?.emptyState && (
        <div className={`chat-block chat-block--secondary ${isCompact ? 'chat-block--compact' : ''}`}>
          <p className="text-body chat-block__subtitle" style={{ margin: 0 }}>
            {metadata.emptyState.message || 'No results found'}
          </p>
          {metadata.emptyState.suggestion && (
            <p 
              className="text-label"
              style={{ 
                color: 'var(--ds-text-tertiary)', 
                margin: '8px 0 0 0',
              }}
            >
              {metadata.emptyState.suggestion}
            </p>
          )}
        </div>
      )}
      
      {/* Navigation Card */}
      {metadata?.navigation && (
        <NavigationCard 
          navigation={metadata.navigation}
          onNavigate={handleNavigate}
          context={context}
        />
      )}
    </div>
  );
}

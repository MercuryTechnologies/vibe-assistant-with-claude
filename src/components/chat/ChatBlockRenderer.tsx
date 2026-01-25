import { useNavigate } from 'react-router-dom';
import type { MessageMetadata } from '@/chat/types';
import { ChatMessage } from './ChatMessage';
import { ThinkingChain } from './ThinkingChain';
import { NavigationCard } from './NavigationCard';
import { TransactionTable } from './TransactionTable';
import { EmployeeTable } from './EmployeeTable';
import { CardsTableBlock } from './CardsTableBlock';
import { AccountBalancesBlock } from './AccountBalancesBlock';
import { RecipientsBlock } from './RecipientsBlock';
import { DocumentsBlock } from './DocumentsBlock';
import { FeatureCardsBlock } from './FeatureCardsBlock';

interface ChatBlockRendererProps {
  content: string;
  metadata?: MessageMetadata;
  onNavigate?: (url: string) => void;
  onEmployeeSelect?: (ids: string[]) => void;
  context?: 'rhc' | 'command';
  className?: string;
}

/**
 * ChatBlockRenderer - Renders chat message content and all associated metadata blocks
 * Dispatches to the appropriate component based on metadata type
 */
export function ChatBlockRenderer({ 
  content, 
  metadata,
  onNavigate,
  onEmployeeSelect,
  context = 'rhc',
  className = '' 
}: ChatBlockRendererProps) {
  const navigate = useNavigate();
  
  const handleNavigate = (url: string) => {
    if (onNavigate) {
      onNavigate(url);
    } else {
      navigate(url);
    }
  };

  return (
    <div className={`chat-block-renderer ${className}`}>
      {/* Thinking Chain (shows tool usage steps) */}
      {metadata?.thinkingChain && (
        <ThinkingChain steps={metadata.thinkingChain} />
      )}
      
      {/* Main text content with markdown */}
      {content && (
        <ChatMessage content={content} />
      )}
      
      {/* Transaction Table */}
      {metadata?.transactionTable && (
        <TransactionTable data={metadata.transactionTable} />
      )}
      
      {/* Employee Table */}
      {metadata?.employeeTable && (
        <EmployeeTable 
          data={metadata.employeeTable}
          onSelectionChange={onEmployeeSelect}
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
        />
      )}
      
      {/* Navigation Card */}
      {metadata?.navigation && (
        <NavigationCard 
          navigation={metadata.navigation}
          onNavigate={handleNavigate}
        />
      )}
    </div>
  );
}

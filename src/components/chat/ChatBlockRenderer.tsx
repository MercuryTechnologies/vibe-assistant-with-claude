import { useNavigate } from 'react-router-dom';
import type { MessageMetadata } from '@/chat/types';
import { ChatMessage } from './ChatMessage';
import { ThinkingChain } from './ThinkingChain';
import { NavigationCard } from './NavigationCard';
import { TransactionTable } from './TransactionTable';
import { EmployeeTable } from './EmployeeTable';

interface ChatBlockRendererProps {
  content: string;
  metadata?: MessageMetadata;
  onNavigate?: (url: string) => void;
  onEmployeeSelect?: (ids: string[]) => void;
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

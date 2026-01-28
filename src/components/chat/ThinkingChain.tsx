import { Icon } from '@/components/ui/icon';
import { faCheck, faXmark, faSpinner } from '@/icons';
import type { ThinkingStep } from '@/chat/types';

interface ThinkingChainProps {
  steps: ThinkingStep[];
  context?: 'rhc' | 'command';
  className?: string;
}

/**
 * ThinkingChain - Shows the steps Claude is taking during a multi-step workflow
 * Displays status icons (pending, in_progress, done, error) for each step
 * Supports compact mode for RHC panel
 */
export function ThinkingChain({ 
  steps, 
  context = 'rhc',
  className = '' 
}: ThinkingChainProps) {
  const isCompact = context === 'rhc';
  
  return (
    <div className={`chat-thinking-chain ${isCompact ? 'chat-thinking-chain--compact' : ''} ${className}`}>
      {steps.map((step) => (
        <div 
          key={step.id} 
          className={`chat-thinking-step chat-thinking-step-${step.status}`}
        >
          <span className="chat-thinking-step-icon">
            {step.status === 'pending' && (
              <span className="chat-thinking-step-dot" />
            )}
            {step.status === 'in_progress' && (
              <Icon 
                icon={faSpinner} 
                size="small" 
                className="chat-thinking-spinner"
              />
            )}
            {step.status === 'done' && (
              <Icon 
                icon={faCheck} 
                size="small" 
                className="chat-thinking-icon--success"
              />
            )}
            {step.status === 'error' && (
              <Icon 
                icon={faXmark} 
                size="small" 
                className="chat-thinking-icon--error"
              />
            )}
          </span>
          <span className={`${isCompact ? 'text-tiny' : 'text-label'} chat-thinking-step-label chat-thinking-step-label--${step.status}`}>
            {step.label}
          </span>
        </div>
      ))}
    </div>
  );
}

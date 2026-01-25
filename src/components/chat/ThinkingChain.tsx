import { Icon } from '@/components/ui/icon';
import { faCheck, faXmark, faSpinner } from '@/icons';
import type { ThinkingStep } from '@/chat/types';

interface ThinkingChainProps {
  steps: ThinkingStep[];
  className?: string;
}

/**
 * ThinkingChain - Shows the steps Claude is taking during a multi-step workflow
 * Displays status icons (pending, in_progress, done, error) for each step
 */
export function ThinkingChain({ steps, className = '' }: ThinkingChainProps) {
  return (
    <div className={`chat-thinking-chain ${className}`}>
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
                style={{ color: 'var(--ds-icon-primary)' }}
                className="chat-thinking-spinner"
              />
            )}
            {step.status === 'done' && (
              <Icon 
                icon={faCheck} 
                size="small" 
                style={{ color: 'var(--ds-icon-success)' }}
              />
            )}
            {step.status === 'error' && (
              <Icon 
                icon={faXmark} 
                size="small" 
                style={{ color: 'var(--ds-icon-error)' }}
              />
            )}
          </span>
          <span 
            className="text-label"
            style={{ 
              color: step.status === 'done' 
                ? 'var(--ds-text-default)' 
                : step.status === 'error'
                  ? 'var(--ds-text-default)'
                  : 'var(--ds-text-secondary)'
            }}
          >
            {step.label}
          </span>
        </div>
      ))}
    </div>
  );
}

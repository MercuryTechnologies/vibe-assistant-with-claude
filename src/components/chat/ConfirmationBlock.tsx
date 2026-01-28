import { useState, useEffect } from 'react';
import { DSButton } from '@/components/ui/ds-button';
import { Icon } from '@/components/ui/icon';
import { faCheck, faRotateRight, faCircleInfo } from '@/icons';

interface ConfirmationBlockProps {
  id: string;
  action: string;
  currentValue: string;
  newValue: string;
  targetId: string;
  targetName?: string;
  onConfirm: (id: string) => void;
  onUndo: (id: string) => void;
  onCancel?: (id: string) => void;
  undoTimeoutSeconds?: number;
  context?: 'rhc' | 'command';
  className?: string;
}

/**
 * ConfirmationBlock - Displays a confirmation dialog for sensitive changes
 * Includes undo functionality with countdown timer
 * Supports compact mode for RHC panel
 */
export function ConfirmationBlock({ 
  id,
  action,
  currentValue,
  newValue,
  targetId,
  targetName,
  onConfirm,
  onUndo,
  onCancel,
  undoTimeoutSeconds = 300, // 5 minutes default
  context = 'rhc',
  className = '' 
}: ConfirmationBlockProps) {
  const [status, setStatus] = useState<'pending' | 'confirmed' | 'undone'>('pending');
  const [timeRemaining, setTimeRemaining] = useState(undoTimeoutSeconds);
  const [canUndo, setCanUndo] = useState(true);
  
  const isCompact = context === 'rhc';
  
  // Countdown timer for undo availability
  useEffect(() => {
    if (status !== 'confirmed') return;
    
    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          setCanUndo(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [status]);
  
  const formatTimeRemaining = () => {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  };
  
  const handleConfirm = () => {
    setStatus('confirmed');
    onConfirm(id);
  };
  
  const handleUndo = () => {
    if (!canUndo) return;
    setStatus('undone');
    onUndo(id);
  };
  
  const blockClass = `chat-block ${isCompact ? 'chat-block--compact' : ''} ${className}`;
  
  // Undone state
  if (status === 'undone') {
    return (
      <div className={`${blockClass} chat-block--secondary`}>
        <div className="flex items-center gap-3">
          <Icon icon={faRotateRight} className="chat-block__icon chat-block__icon--secondary" />
          <div className="flex flex-col">
            <span className="text-body-demi chat-block__title">
              Change undone
            </span>
            <span className="text-label chat-block__subtitle">
              {targetName || targetId} reverted to {currentValue}
            </span>
          </div>
        </div>
      </div>
    );
  }
  
  // Confirmed state with undo option
  if (status === 'confirmed') {
    return (
      <div className={`${blockClass} chat-block--success`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon icon={faCheck} className="chat-block__icon chat-block__icon--success" />
            <div className="flex flex-col">
              <span className="text-body-demi chat-block__title">
                {action} confirmed
              </span>
              <span className="text-label chat-block__subtitle">
                {targetName || targetId}: {currentValue} → {newValue}
              </span>
            </div>
          </div>
          {canUndo && (
            <DSButton 
              variant="secondary" 
              size="small"
              onClick={handleUndo}
            >
              <Icon icon={faRotateRight} size="small" />
              Undo ({formatTimeRemaining()})
            </DSButton>
          )}
        </div>
      </div>
    );
  }
  
  // Pending confirmation state
  return (
    <div className={`${blockClass} chat-block--warning`}>
      <div className="flex items-start gap-3">
        <Icon icon={faCircleInfo} className="chat-block__icon chat-block__icon--warning" />
        <div className="flex-1">
          <span className="text-body-demi chat-block__heading">
            Confirm change
          </span>
          
          <div className="chat-confirmation__details">
            <div className="flex items-center justify-between">
              <span className="text-label chat-block__subtitle">
                {action}
              </span>
              <span className="text-label chat-block__subtitle">
                {targetName || targetId}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-body-sm chat-confirmation__current">
                Current: {currentValue}
              </span>
              <span className="text-body-sm chat-confirmation__new">
                New: {newValue}
              </span>
            </div>
          </div>
          
          <div className="chat-confirmation__footer">
            <span className="text-tiny chat-confirmation__hint">
              Undo available for 5 minutes after confirming
            </span>
            <div className="flex gap-2">
              {onCancel && (
                <DSButton 
                  variant="tertiary" 
                  size="small"
                  onClick={() => onCancel(id)}
                >
                  Cancel
                </DSButton>
              )}
              <DSButton 
                variant="primary" 
                size="small"
                onClick={handleConfirm}
              >
                Confirm
              </DSButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

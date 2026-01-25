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
  className?: string;
}

/**
 * ConfirmationBlock - Displays a confirmation dialog for sensitive changes
 * Includes undo functionality with countdown timer
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
  className = '' 
}: ConfirmationBlockProps) {
  const [status, setStatus] = useState<'pending' | 'confirmed' | 'undone'>('pending');
  const [timeRemaining, setTimeRemaining] = useState(undoTimeoutSeconds);
  const [canUndo, setCanUndo] = useState(true);
  
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
  
  // Undone state
  if (status === 'undone') {
    return (
      <div 
        className={`chat-confirmation-block ${className}`}
        style={{
          marginTop: 12,
          padding: 16,
          backgroundColor: 'var(--ds-bg-secondary)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-border-default)',
        }}
      >
        <div className="flex items-center gap-3">
          <Icon icon={faRotateRight} style={{ color: 'var(--ds-icon-secondary)' }} />
          <div className="flex flex-col">
            <span className="text-body-demi" style={{ color: 'var(--ds-text-default)' }}>
              Change undone
            </span>
            <span className="text-label" style={{ color: 'var(--ds-text-secondary)' }}>
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
      <div 
        className={`chat-confirmation-block ${className}`}
        style={{
          marginTop: 12,
          padding: 16,
          backgroundColor: 'var(--ds-bg-success)',
          borderRadius: 'var(--radius-md)',
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon icon={faCheck} style={{ color: 'var(--ds-icon-success)' }} />
            <div className="flex flex-col">
              <span className="text-body-demi" style={{ color: 'var(--ds-text-default)' }}>
                {action} confirmed
              </span>
              <span className="text-label" style={{ color: 'var(--ds-text-secondary)' }}>
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
    <div 
      className={`chat-confirmation-block ${className}`}
      style={{
        marginTop: 12,
        padding: 16,
        backgroundColor: 'var(--ds-bg-warning)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--color-border-default)',
      }}
    >
      <div className="flex items-start gap-3">
        <Icon icon={faCircleInfo} style={{ color: 'var(--ds-icon-warning)', marginTop: 2 }} />
        <div className="flex-1">
          <span className="text-body-demi" style={{ color: 'var(--ds-text-default)', display: 'block', marginBottom: 8 }}>
            Confirm change
          </span>
          
          <div 
            className="flex flex-col gap-2"
            style={{
              padding: 12,
              backgroundColor: 'var(--ds-bg-default)',
              borderRadius: 'var(--radius-sm)',
              marginBottom: 12,
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-label" style={{ color: 'var(--ds-text-secondary)' }}>
                {action}
              </span>
              <span className="text-label" style={{ color: 'var(--ds-text-secondary)' }}>
                {targetName || targetId}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-body-sm" style={{ color: 'var(--ds-text-tertiary)' }}>
                Current: {currentValue}
              </span>
              <span className="text-body-sm" style={{ color: 'var(--ds-text-default)' }}>
                New: {newValue}
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-tiny" style={{ color: 'var(--ds-text-tertiary)' }}>
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

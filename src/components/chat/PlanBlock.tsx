import { useState } from 'react';
import { DSButton } from '@/components/ui/ds-button';
import { Icon } from '@/components/ui/icon';
import { faCheck, faSpinner, faCircle, faXmark, faArrowRight, faCircleCheck } from '@/icons';

export interface PlanStep {
  id: string;
  action: string;
  label: string;
  status: 'pending' | 'in_progress' | 'completed' | 'error' | 'skipped';
  data?: Record<string, unknown>;
  dependsOn?: string;
  result?: string;
  error?: string;
}

export interface Plan {
  id: string;
  title: string;
  status: 'pending_confirmation' | 'executing' | 'completed' | 'cancelled';
  steps: PlanStep[];
}

interface PlanBlockProps {
  plan: Plan;
  onConfirm?: (planId: string) => void;
  onCancel?: (planId: string) => void;
  onEditStep?: (planId: string, stepId: string) => void;
  className?: string;
}

/**
 * Get icon for step status
 */
function getStepIcon(status: PlanStep['status']) {
  switch (status) {
    case 'completed':
      return faCircleCheck;
    case 'in_progress':
      return faSpinner;
    case 'error':
      return faXmark;
    case 'skipped':
      return faCircle;
    default:
      return faCircle;
  }
}

/**
 * Get icon color for step status
 */
function getStepIconColor(status: PlanStep['status']): string {
  switch (status) {
    case 'completed':
      return 'var(--ds-icon-success)';
    case 'in_progress':
      return 'var(--ds-icon-primary)';
    case 'error':
      return 'var(--ds-icon-error)';
    case 'skipped':
      return 'var(--ds-icon-tertiary)';
    default:
      return 'var(--ds-icon-tertiary)';
  }
}

/**
 * PlanBlock - Displays a multi-step workflow plan with progress tracking
 * Used for complex actions like "Invite John and issue him a card"
 */
export function PlanBlock({ 
  plan,
  onConfirm,
  onCancel,
  onEditStep,
  className = '' 
}: PlanBlockProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  
  const completedSteps = plan.steps.filter(s => s.status === 'completed').length;
  const totalSteps = plan.steps.length;
  const progressPercent = (completedSteps / totalSteps) * 100;
  
  // Completed state - show summary
  if (plan.status === 'completed') {
    return (
      <div 
        className={`chat-plan-block ${className}`}
        style={{
          marginTop: 12,
          padding: 16,
          backgroundColor: 'var(--ds-bg-success)',
          borderRadius: 'var(--radius-md)',
        }}
      >
        <div className="flex items-center gap-3" style={{ marginBottom: 12 }}>
          <Icon icon={faCircleCheck} style={{ color: 'var(--ds-icon-success)' }} />
          <span className="text-body-demi" style={{ color: 'var(--ds-text-default)' }}>
            Plan completed
          </span>
        </div>
        
        <div className="flex flex-col gap-2">
          {plan.steps.map((step) => (
            <div key={step.id} className="flex items-center gap-2">
              <Icon icon={faCheck} size="small" style={{ color: 'var(--ds-icon-success)' }} />
              <span className="text-body-sm" style={{ color: 'var(--ds-text-default)' }}>
                {step.label}
              </span>
              {step.result && (
                <span className="text-label" style={{ color: 'var(--ds-text-secondary)' }}>
                  - {step.result}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  // Cancelled state
  if (plan.status === 'cancelled') {
    return (
      <div 
        className={`chat-plan-block ${className}`}
        style={{
          marginTop: 12,
          padding: 16,
          backgroundColor: 'var(--ds-bg-secondary)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-border-default)',
        }}
      >
        <div className="flex items-center gap-3">
          <Icon icon={faXmark} style={{ color: 'var(--ds-icon-secondary)' }} />
          <span className="text-body" style={{ color: 'var(--ds-text-secondary)' }}>
            Plan cancelled
          </span>
        </div>
      </div>
    );
  }
  
  return (
    <div 
      className={`chat-plan-block ${className}`}
      style={{
        marginTop: 12,
        padding: 16,
        backgroundColor: 'var(--ds-bg-secondary)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--color-border-default)',
      }}
    >
      {/* Header */}
      <div 
        className="flex items-center justify-between"
        style={{ marginBottom: 12, cursor: 'pointer' }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div 
            style={{
              width: 32,
              height: 32,
              borderRadius: 'var(--radius-md)',
              backgroundColor: plan.status === 'executing' ? 'var(--ds-bg-primary)' : 'var(--ds-bg-emphasized)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon 
              icon={plan.status === 'executing' ? faSpinner : faArrowRight} 
              size="small"
              style={{ 
                color: plan.status === 'executing' ? 'var(--ds-icon-on-primary)' : 'var(--ds-icon-secondary)',
              }} 
            />
          </div>
          <div className="flex flex-col">
            <span className="text-body-demi" style={{ color: 'var(--ds-text-default)' }}>
              {plan.title}
            </span>
            <span className="text-label" style={{ color: 'var(--ds-text-secondary)' }}>
              {plan.status === 'executing' 
                ? `Step ${completedSteps + 1} of ${totalSteps}` 
                : `${totalSteps} steps`}
            </span>
          </div>
        </div>
        
        {/* Progress bar (only when executing) */}
        {plan.status === 'executing' && (
          <div 
            style={{
              width: 80,
              height: 4,
              backgroundColor: 'var(--ds-bg-emphasized)',
              borderRadius: 2,
              overflow: 'hidden',
            }}
          >
            <div 
              style={{
                width: `${progressPercent}%`,
                height: '100%',
                backgroundColor: 'var(--ds-bg-primary)',
                transition: 'width 0.3s ease',
              }}
            />
          </div>
        )}
      </div>
      
      {/* Steps list */}
      {isExpanded && (
        <div 
          className="flex flex-col gap-3"
          style={{
            paddingTop: 12,
            borderTop: '1px solid var(--color-border-default)',
          }}
        >
          {plan.steps.map((step, index) => (
            <div 
              key={step.id}
              className="flex items-start gap-3"
              style={{
                opacity: step.status === 'skipped' ? 0.5 : 1,
              }}
            >
              {/* Step number/status icon */}
              <div 
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: step.status === 'completed' 
                    ? 'var(--ds-bg-success)' 
                    : step.status === 'in_progress'
                    ? 'var(--ds-bg-primary)'
                    : step.status === 'error'
                    ? 'var(--ds-bg-error)'
                    : 'var(--ds-bg-emphasized)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {step.status === 'pending' ? (
                  <span className="text-tiny-demi" style={{ color: 'var(--ds-text-secondary)' }}>
                    {index + 1}
                  </span>
                ) : (
                  <Icon 
                    icon={getStepIcon(step.status)} 
                    size="small" 
                    style={{ 
                      color: step.status === 'completed' || step.status === 'in_progress' || step.status === 'error'
                        ? 'white' 
                        : getStepIconColor(step.status),
                    }} 
                  />
                )}
              </div>
              
              {/* Step content */}
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span 
                    className="text-body-sm" 
                    style={{ 
                      color: step.status === 'completed' ? 'var(--ds-text-secondary)' : 'var(--ds-text-default)',
                      textDecoration: step.status === 'skipped' ? 'line-through' : 'none',
                    }}
                  >
                    {step.label}
                  </span>
                  {plan.status === 'pending_confirmation' && onEditStep && (
                    <DSButton
                      variant="tertiary"
                      size="small"
                      onClick={() => onEditStep(plan.id, step.id)}
                    >
                      Edit
                    </DSButton>
                  )}
                </div>
                
                {/* Result or error message */}
                {step.result && (
                  <span className="text-label" style={{ color: 'var(--ds-text-secondary)' }}>
                    {step.result}
                  </span>
                )}
                {step.error && (
                  <span className="text-label" style={{ color: 'var(--color-error)' }}>
                    {step.error}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Actions (only for pending confirmation) */}
      {plan.status === 'pending_confirmation' && (
        <div 
          className="flex items-center justify-between"
          style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--color-border-default)' }}
        >
          <DSButton 
            variant="tertiary" 
            size="large"
            onClick={() => onCancel?.(plan.id)}
          >
            Cancel
          </DSButton>
          <DSButton 
            variant="primary" 
            size="large"
            onClick={() => onConfirm?.(plan.id)}
          >
            <Icon icon={faArrowRight} size="small" style={{ color: 'var(--ds-icon-on-primary)' }} />
            Execute Plan
          </DSButton>
        </div>
      )}
    </div>
  );
}

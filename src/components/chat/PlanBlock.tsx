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
  context?: 'rhc' | 'command';
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
 * Get step status class modifier
 */
function getStepStatusClass(status: PlanStep['status']): string {
  switch (status) {
    case 'completed':
      return 'chat-plan__step-icon--success';
    case 'in_progress':
      return 'chat-plan__step-icon--primary';
    case 'error':
      return 'chat-plan__step-icon--error';
    default:
      return 'chat-plan__step-icon--default';
  }
}

/**
 * PlanBlock - Displays a multi-step workflow plan with progress tracking
 * Used for complex actions like "Invite John and issue him a card"
 * Supports compact mode for RHC panel
 */
export function PlanBlock({ 
  plan,
  onConfirm,
  onCancel,
  onEditStep,
  context = 'rhc',
  className = '' 
}: PlanBlockProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  
  const isCompact = context === 'rhc';
  const completedSteps = plan.steps.filter(s => s.status === 'completed').length;
  const totalSteps = plan.steps.length;
  const progressPercent = (completedSteps / totalSteps) * 100;
  
  const blockClass = `chat-block chat-plan ${isCompact ? 'chat-block--compact' : ''} ${className}`;
  
  // Completed state - show summary
  if (plan.status === 'completed') {
    return (
      <div className={`${blockClass} chat-block--success`}>
        <div className="chat-plan__header-row">
          <Icon icon={faCircleCheck} className="chat-block__icon chat-block__icon--success" />
          <span className="text-body-demi chat-block__title">
            Plan completed
          </span>
        </div>
        
        <div className="chat-plan__steps-summary">
          {plan.steps.map((step) => (
            <div key={step.id} className="chat-plan__step-summary">
              <Icon icon={faCheck} size="small" className="chat-block__icon--success" />
              <span className="text-body-sm chat-block__title">
                {step.label}
              </span>
              {step.result && (
                <span className="text-label chat-block__subtitle">
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
      <div className={`${blockClass} chat-block--secondary`}>
        <div className="flex items-center gap-3">
          <Icon icon={faXmark} className="chat-block__icon chat-block__icon--secondary" />
          <span className="text-body chat-block__subtitle">
            Plan cancelled
          </span>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`${blockClass} chat-block--secondary`}>
      {/* Header */}
      <button 
        type="button"
        className="chat-plan__header"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className={`chat-plan__icon-badge ${plan.status === 'executing' ? 'chat-plan__icon-badge--executing' : ''}`}>
            <Icon 
              icon={plan.status === 'executing' ? faSpinner : faArrowRight} 
              size="small"
              className={plan.status === 'executing' ? 'chat-plan__icon--on-primary' : 'chat-plan__icon--secondary'}
            />
          </div>
          <div className="flex flex-col">
            <span className="text-body-demi chat-block__title">
              {plan.title}
            </span>
            <span className="text-label chat-block__subtitle">
              {plan.status === 'executing' 
                ? `Step ${completedSteps + 1} of ${totalSteps}` 
                : `${totalSteps} steps`}
            </span>
          </div>
        </div>
        
        {/* Progress bar (only when executing) */}
        {plan.status === 'executing' && (
          <div className="chat-plan__progress">
            <div 
              className="chat-plan__progress-bar"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        )}
      </button>
      
      {/* Steps list */}
      {isExpanded && (
        <div className="chat-plan__steps">
          {plan.steps.map((step, index) => (
            <div 
              key={step.id}
              className={`chat-plan__step ${step.status === 'skipped' ? 'chat-plan__step--skipped' : ''}`}
            >
              {/* Step number/status icon */}
              <div className={`chat-plan__step-icon ${getStepStatusClass(step.status)}`}>
                {step.status === 'pending' ? (
                  <span className="text-tiny-demi chat-plan__step-number">
                    {index + 1}
                  </span>
                ) : (
                  <Icon 
                    icon={getStepIcon(step.status)} 
                    size="small" 
                    className="chat-plan__step-icon-svg"
                  />
                )}
              </div>
              
              {/* Step content */}
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className={`text-body-sm ${step.status === 'completed' ? 'chat-plan__step-label--completed' : 'chat-plan__step-label'} ${step.status === 'skipped' ? 'chat-plan__step-label--skipped' : ''}`}>
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
                  <span className="text-label chat-block__subtitle">
                    {step.result}
                  </span>
                )}
                {step.error && (
                  <span className="text-label chat-plan__step-error">
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
        <div className="chat-plan__actions">
          <DSButton 
            variant="tertiary" 
            size={isCompact ? 'small' : 'large'}
            onClick={() => onCancel?.(plan.id)}
          >
            Cancel
          </DSButton>
          <DSButton 
            variant="primary" 
            size={isCompact ? 'small' : 'large'}
            onClick={() => onConfirm?.(plan.id)}
          >
            <Icon icon={faArrowRight} size="small" />
            Execute Plan
          </DSButton>
        </div>
      )}
    </div>
  );
}

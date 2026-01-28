import { Chip } from '@/components/ui/chip';

interface SuggestedAction {
  label: string;
  action: string;
}

interface SuggestedActionsProps {
  actions: SuggestedAction[];
  onAction: (action: string) => void;
  context?: 'rhc' | 'command';
  className?: string;
}

/**
 * SuggestedActions - Clickable action chips for follow-up questions
 * Uses the Chip component from the design system for consistency
 * Supports compact mode for RHC panel
 */
export function SuggestedActions({ 
  actions, 
  onAction, 
  context = 'rhc',
  className = '' 
}: SuggestedActionsProps) {
  if (actions.length === 0) return null;
  
  const isCompact = context === 'rhc';
  
  return (
    <div className={`chat-suggested-actions ${isCompact ? 'chat-suggested-actions--compact' : ''} ${className}`}>
      {actions.map((action, index) => (
        <Chip
          key={index}
          label={action.label}
          variant="default"
          trailingAction="none"
          onClick={() => onAction(action.action)}
        />
      ))}
    </div>
  );
}

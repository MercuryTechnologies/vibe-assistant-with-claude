interface SuggestedAction {
  label: string;
  action: string;
}

interface SuggestedActionsProps {
  actions: SuggestedAction[];
  onAction: (action: string) => void;
  className?: string;
}

/**
 * SuggestedActions - Clickable action chips for follow-up questions
 * Renders as pill-shaped buttons that send a message when clicked
 */
export function SuggestedActions({ 
  actions, 
  onAction, 
  className = '' 
}: SuggestedActionsProps) {
  if (actions.length === 0) return null;
  
  return (
    <div className={`chat-suggested-actions ${className}`}>
      {actions.map((action, index) => (
        <button
          key={index}
          onClick={() => onAction(action.action)}
          className="chat-suggested-action-chip"
        >
          <span className="text-label" style={{ color: 'var(--ds-text-default)' }}>
            {action.label}
          </span>
        </button>
      ))}
    </div>
  );
}

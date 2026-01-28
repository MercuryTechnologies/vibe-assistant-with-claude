import { useState } from 'react';
import { Icon } from '@/components/ui/icon';
import { faChevronRight, faChevronDown } from '@/icons';

interface ExpandableSectionProps {
  title: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  context?: 'rhc' | 'command';
  className?: string;
}

/**
 * ExpandableSection - A collapsible section with a header
 * Used to show/hide details like data sources, tool calls, methodology
 * Supports compact mode for RHC panel
 */
export function ExpandableSection({
  title,
  children,
  defaultExpanded = false,
  context = 'rhc',
  className = '',
}: ExpandableSectionProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const isCompact = context === 'rhc';

  return (
    <div className={`chat-expandable ${isCompact ? 'chat-expandable--compact' : ''} ${className}`}>
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="chat-expandable__header"
        aria-expanded={expanded}
      >
        <Icon 
          icon={expanded ? faChevronDown : faChevronRight} 
          size="small"
          className="chat-expandable__icon"
        />
        <span className={`${isCompact ? 'text-tiny' : 'text-label'} chat-expandable__title`}>
          {title}
        </span>
      </button>
      {expanded && (
        <div className="chat-expandable__content">
          {children}
        </div>
      )}
    </div>
  );
}

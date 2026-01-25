import { useState } from 'react';
import { Icon } from '@/components/ui/icon';
import { faChevronRight, faChevronDown } from '@/icons';

interface ExpandableSectionProps {
  title: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  className?: string;
}

/**
 * ExpandableSection - A collapsible section with a header
 * Used to show/hide details like data sources, tool calls, methodology
 */
export function ExpandableSection({
  title,
  children,
  defaultExpanded = false,
  className = '',
}: ExpandableSectionProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <div className={`chat-expandable-section ${className}`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="chat-expandable-header"
        aria-expanded={expanded}
      >
        <Icon 
          icon={expanded ? faChevronDown : faChevronRight} 
          size="small"
          style={{ color: 'var(--ds-icon-secondary)' }}
        />
        <span className="text-label" style={{ color: 'var(--ds-text-secondary)' }}>
          {title}
        </span>
      </button>
      {expanded && (
        <div className="chat-expandable-content">
          {children}
        </div>
      )}
    </div>
  );
}

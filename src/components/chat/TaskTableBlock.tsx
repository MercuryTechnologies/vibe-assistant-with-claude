import type { TaskTableMetadata, TaskTableRow } from '@/chat/types';
import { Badge } from '@/components/ui/badge';
import { DSButton } from '@/components/ui/ds-button';
import { Icon } from '@/components/ui/icon';
import { faCheck, faCircle } from '@/icons';

interface TaskTableBlockProps {
  data: TaskTableMetadata;
  context?: 'rhc' | 'command';
  className?: string;
}

/**
 * Format date for display
 */
function formatDate(dateStr?: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/**
 * Format task type for display
 */
function formatTaskType(type: string): string {
  return type
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

/**
 * TaskTableBlock - Displays a list of tasks with status and actions
 * Supports compact mode for RHC panel
 */
export function TaskTableBlock({ 
  data, 
  context = 'rhc',
  className = '' 
}: TaskTableBlockProps) {
  const isCompact = context === 'rhc';
  
  if (data.rows.length === 0) {
    return (
      <div className={`chat-block chat-block--secondary ${isCompact ? 'chat-block--compact' : ''} ${className}`}>
        <p className="text-body-sm chat-block__subtitle" style={{ margin: 0 }}>
          No tasks found.
        </p>
      </div>
    );
  }

  return (
    <div className={`chat-task-table ${isCompact ? 'chat-task-table--compact' : ''} ${className}`}>
      {data.title && (
        <h4 className="text-label-demi chat-task-table__title">
          {data.title}
        </h4>
      )}
      
      <div className="chat-task-table__list">
        {data.rows.map((task: TaskTableRow) => (
          <div key={task.id} className="chat-task-table__item">
            {/* Status Icon */}
            <div className={`chat-task-table__icon ${task.status === 'completed' ? 'chat-task-table__icon--success' : ''}`}>
              <Icon 
                icon={task.status === 'completed' ? faCheck : faCircle} 
                size="small" 
              />
            </div>
            
            {/* Task Content */}
            <div className="chat-task-table__content">
              <div className="chat-task-table__header">
                <span className={`${isCompact ? 'text-label-demi' : 'text-body-sm-demi'} chat-task-table__type`}>
                  {formatTaskType(task.type)}
                </span>
                <Badge 
                  type={task.status === 'completed' ? 'success' : 'neutral'}
                >
                  {task.status === 'completed' ? 'Completed' : 'Pending'}
                </Badge>
              </div>
              
              <p className={`${isCompact ? 'text-label' : 'text-body-sm'} chat-task-table__description`}>
                {task.description}
              </p>
              
              {/* Task Footer */}
              {(task.received || task.completedOn || (task.actionLabel && task.actionHref && task.status === 'incomplete')) && (
                <div className="chat-task-table__footer">
                  {task.received && (
                    <span className={`${isCompact ? 'text-micro' : 'text-tiny'} chat-task-table__date`}>
                      Received: {formatDate(task.received)}
                    </span>
                  )}
                  
                  {task.completedOn && (
                    <span className={`${isCompact ? 'text-micro' : 'text-tiny'} chat-task-table__date`}>
                      Completed: {formatDate(task.completedOn)}
                      {task.completedBy && ` by ${task.completedBy}`}
                    </span>
                  )}
                  
                  {task.actionLabel && task.actionHref && task.status === 'incomplete' && (
                    <DSButton
                      variant="secondary"
                      size="small"
                      onClick={() => window.location.href = task.actionHref!}
                    >
                      {task.actionLabel}
                    </DSButton>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

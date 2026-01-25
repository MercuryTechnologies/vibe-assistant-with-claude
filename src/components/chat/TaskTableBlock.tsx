import type { TaskTableMetadata, TaskTableRow } from '@/chat/types';
import { Badge } from '@/components/ui/badge';
import { DSButton } from '@/components/ui/ds-button';
import { Icon } from '@/components/ui/icon';
import { faCheck, faCircle } from '@/icons';

interface TaskTableBlockProps {
  data: TaskTableMetadata;
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
 */
export function TaskTableBlock({ 
  data, 
  className = '' 
}: TaskTableBlockProps) {
  if (data.rows.length === 0) {
    return (
      <div 
        className={`chat-task-table ${className}`}
        style={{
          padding: 16,
          backgroundColor: 'var(--ds-bg-secondary)',
          borderRadius: 'var(--radius-md)',
          marginTop: 12,
        }}
      >
        <p 
          className="text-body-sm" 
          style={{ color: 'var(--ds-text-secondary)', margin: 0 }}
        >
          No tasks found.
        </p>
      </div>
    );
  }

  return (
    <div className={`chat-task-table ${className}`} style={{ marginTop: 12 }}>
      {data.title && (
        <h4 className="text-label-demi" style={{ 
          color: 'var(--ds-text-default)', 
          marginBottom: 8 
        }}>
          {data.title}
        </h4>
      )}
      
      <div className="flex flex-col gap-2">
        {data.rows.map((task: TaskTableRow) => (
          <div 
            key={task.id}
            className="flex items-start gap-3"
            style={{
              padding: '12px 16px',
              backgroundColor: 'var(--ds-bg-secondary)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            {/* Status Icon */}
            <div 
              style={{ 
                marginTop: 2,
                color: task.status === 'completed' 
                  ? 'var(--ds-icon-success)' 
                  : 'var(--ds-icon-secondary)',
              }}
            >
              <Icon 
                icon={task.status === 'completed' ? faCheck : faCircle} 
                size="small" 
              />
            </div>
            
            {/* Task Content */}
            <div className="flex flex-col flex-1" style={{ minWidth: 0 }}>
              <div className="flex items-center gap-2" style={{ marginBottom: 4 }}>
                <span 
                  className="text-body-sm-demi" 
                  style={{ color: 'var(--ds-text-default)' }}
                >
                  {formatTaskType(task.type)}
                </span>
                <Badge 
                  type={task.status === 'completed' ? 'success' : 'neutral'}
                >
                  {task.status === 'completed' ? 'Completed' : 'Pending'}
                </Badge>
              </div>
              
              <p 
                className="text-body-sm" 
                style={{ 
                  color: 'var(--ds-text-secondary)', 
                  margin: 0,
                  marginBottom: task.received || task.actionLabel ? 8 : 0,
                }}
              >
                {task.description}
              </p>
              
              {/* Task Footer */}
              <div className="flex items-center justify-between">
                {task.received && (
                  <span 
                    className="text-tiny" 
                    style={{ color: 'var(--ds-text-tertiary)' }}
                  >
                    Received: {formatDate(task.received)}
                  </span>
                )}
                
                {task.completedOn && (
                  <span 
                    className="text-tiny" 
                    style={{ color: 'var(--ds-text-tertiary)' }}
                  >
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
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

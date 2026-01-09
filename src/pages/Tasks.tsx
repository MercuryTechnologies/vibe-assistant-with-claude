import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  faEnvelope,
  faPaperPlane,
  faClock,
  faUser,
  faCreditCard,
} from '@fortawesome/free-regular-svg-icons';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { useTasks } from '@/hooks';
import type { Task } from '@/types';
import { cn } from '@/lib/utils';
import { DSIcon } from '@/components/ui/icon';

type TaskTab = 'incomplete' | 'completed';

function formatShortMonthDay(dateStr?: string) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString('en-US', { month: 'short', day: 'numeric' });
}

function getTaskIcon(task: Task) {
  switch (task.type) {
    case 'email':
      return faEnvelope;
    case 'team_invite':
      return faUser;
    case 'payment':
      return faPaperPlane;
    case 'recurring_payment':
      return faClock;
    case 'policy':
      return faCreditCard;
    case 'security':
      return faUser;
    default:
      return faEnvelope;
  }
}

export function Tasks() {
  const { tasks, isLoading } = useTasks();
  const [tab, setTab] = useState<TaskTab>('incomplete');

  const visibleTasks = useMemo(
    () => tasks.filter((t) => t.status === tab),
    [tasks, tab],
  );

  const gridTemplateColumns =
    tab === 'completed'
      ? 'minmax(0, 1fr) 140px 140px 180px'
      : 'minmax(0, 1fr) 88px 180px';

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <h1 className="text-title-main">Tasks</h1>

        <div className="inline-flex items-center gap-2">
          <button
            type="button"
            onClick={() => setTab('incomplete')}
            className="text-body h-8 px-3 rounded-md border"
            style={{
              backgroundColor:
                tab === 'incomplete' ? 'var(--ds-bg-emphasized)' : 'var(--ds-bg-input-default)',
              borderColor: tab === 'incomplete' ? 'transparent' : 'var(--color-border-emphasized)',
              color: tab === 'incomplete' ? 'var(--ds-text-default)' : 'var(--ds-text-secondary)',
              cursor: 'pointer',
            }}
          >
            Incomplete
          </button>
          <button
            type="button"
            onClick={() => setTab('completed')}
            className="text-body h-8 px-3 rounded-md border"
            style={{
              backgroundColor:
                tab === 'completed' ? 'var(--ds-bg-emphasized)' : 'var(--ds-bg-input-default)',
              borderColor: tab === 'completed' ? 'transparent' : 'var(--color-border-emphasized)',
              color: tab === 'completed' ? 'var(--ds-text-default)' : 'var(--ds-text-secondary)',
              cursor: 'pointer',
            }}
          >
            Completed
          </button>
        </div>
      </div>

      <div>
        <div
          className="grid gap-4 px-2 pb-2"
          style={{ gridTemplateColumns }}
        >
          <div className="text-label" style={{ color: 'var(--ds-text-tertiary)' }}>
            Description
          </div>
          {tab === 'completed' ? (
            <>
              <div className="text-label whitespace-nowrap" style={{ color: 'var(--ds-text-tertiary)' }}>
                Received
              </div>
              <div className="text-label whitespace-nowrap" style={{ color: 'var(--ds-text-tertiary)' }}>
                Completed on
              </div>
              <div className="text-label whitespace-nowrap" style={{ color: 'var(--ds-text-tertiary)' }}>
                Completed by
              </div>
            </>
          ) : (
            <>
              <div className="text-label text-right whitespace-nowrap" style={{ color: 'var(--ds-text-tertiary)' }}>
                Due by
              </div>
              <div className="text-label text-right whitespace-nowrap" style={{ color: 'var(--ds-text-tertiary)' }}>
                Received
              </div>
            </>
          )}
        </div>

        <div className="border-t" style={{ borderColor: 'var(--color-border-emphasized)' }}>
          {isLoading ? (
            <div className="py-10 text-body text-muted-foreground">Loading...</div>
          ) : visibleTasks.length === 0 ? (
            <div className="py-10 text-body text-muted-foreground">No tasks.</div>
          ) : (
            <div className="ds-task-list">
              {visibleTasks.map((task) => {
                return (
                  <div
                    key={task.id}
                    className="ds-task-row relative"
                  >
                    {/* Hover card overlay */}
                    <div className="ds-task-row-overlay absolute inset-x-0 inset-y-0 -mx-1 rounded-md border border-transparent pointer-events-none" />
                    
                    <div
                      className="relative grid gap-4 items-center px-2 py-4"
                      style={{ gridTemplateColumns }}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <DSIcon icon={getTaskIcon(task)} style={{ color: 'var(--ds-icon-secondary)' }} />

                        <div className="min-w-0 flex-1">
                          <div className="text-body truncate" style={{ color: 'var(--ds-text-default)' }}>
                            {task.description}
                          </div>
                        </div>
                      </div>

                      {tab === 'completed' ? (
                        <>
                          <div
                            className="text-body whitespace-nowrap"
                            style={{ color: 'var(--ds-text-secondary)', fontVariantNumeric: 'tabular-nums' }}
                          >
                            {formatShortMonthDay(task.received)}
                          </div>

                          <div
                            className="text-body whitespace-nowrap"
                            style={{ color: 'var(--ds-text-secondary)', fontVariantNumeric: 'tabular-nums' }}
                          >
                            {formatShortMonthDay(task.completedOn)}
                          </div>

                          <div className="flex items-center justify-between gap-2 min-w-0 whitespace-nowrap">
                            <div className="text-body truncate" style={{ color: 'var(--ds-text-secondary)' }}>
                              {task.completedBy ?? ''}
                            </div>

                            {task.actionHref && task.actionLabel && (
                              <Link to={task.actionHref} className="ds-task-action-link items-center gap-2">
                                {task.actionLabel}
                                <DSIcon
                                  // Chevron-right is required for this affordance; it is only available in the free-solid set.
                                  icon={faChevronRight}
                                  size="small"
                                  style={{ color: 'var(--ds-icon-primary)' }}
                                />
                              </Link>
                            )}
                          </div>
                        </>
                      ) : (
                        <>
                          <div
                            className="text-body text-right whitespace-nowrap"
                            style={{ color: 'var(--ds-text-secondary)', fontVariantNumeric: 'tabular-nums' }}
                          >
                            {formatShortMonthDay(task.dueBy)}
                          </div>

                          <div className="flex items-center justify-end min-w-0 whitespace-nowrap">
                            {/* Received date - hidden on hover when action link exists */}
                            <div
                              className={cn(
                                'text-body text-right',
                                task.actionHref && task.actionLabel && 'ds-task-hide-on-hover',
                              )}
                              style={{ color: 'var(--ds-text-secondary)', fontVariantNumeric: 'tabular-nums' }}
                            >
                              {formatShortMonthDay(task.received)}
                            </div>

                            {/* View link - replaces received date on hover */}
                            {task.actionHref && task.actionLabel && (
                              <Link to={task.actionHref} className="ds-task-action-link items-center gap-2">
                                {task.actionLabel}
                                <DSIcon
                                  // Chevron-right is required for this affordance; it is only available in the free-solid set.
                                  icon={faChevronRight}
                                  size="small"
                                  style={{ color: 'var(--ds-icon-primary)' }}
                                />
                              </Link>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


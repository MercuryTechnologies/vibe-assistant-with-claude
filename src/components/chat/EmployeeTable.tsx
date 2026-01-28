import { useState } from 'react';
import { Icon } from '@/components/ui/icon';
import { faCheck } from '@/icons';
import type { EmployeeTableMetadata, EmployeeTableRow } from '@/chat/types';

interface EmployeeTableProps {
  data: EmployeeTableMetadata;
  context?: 'rhc' | 'command';
  onSelectionChange?: (ids: string[]) => void;
  className?: string;
}

/**
 * EmployeeTable - Table of employees with optional selection
 * Used for card issuance workflows, team management, etc.
 * Supports compact mode for RHC panel
 */
export function EmployeeTable({ 
  data, 
  context = 'rhc',
  onSelectionChange,
  className = '' 
}: EmployeeTableProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const isCompact = context === 'rhc';

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selected);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelected(newSelected);
    onSelectionChange?.(Array.from(newSelected));
  };

  const toggleSelectAll = () => {
    if (selected.size === data.rows.length) {
      setSelected(new Set());
      onSelectionChange?.([]);
    } else {
      const allIds = data.rows.map(r => r.id);
      setSelected(new Set(allIds));
      onSelectionChange?.(allIds);
    }
  };

  const isAllSelected = selected.size === data.rows.length && data.rows.length > 0;
  const isIndeterminate = selected.size > 0 && selected.size < data.rows.length;

  return (
    <div className={`chat-employee-table ${isCompact ? 'chat-employee-table--compact' : ''} ${className}`}>
      {data.title && (
        <h4 className="text-label-demi chat-table__title">
          {data.title}
        </h4>
      )}
      
      <table className="chat-table">
        <thead>
          <tr>
            {data.selectable && (
              <th style={{ width: 32 }}>
                <button
                  type="button"
                  onClick={toggleSelectAll}
                  className={`chat-checkbox ${isAllSelected ? 'checked' : ''} ${isIndeterminate ? 'indeterminate' : ''}`}
                  aria-label={isAllSelected ? 'Deselect all' : 'Select all'}
                >
                  {isAllSelected && (
                    <Icon icon={faCheck} size="small" style={{ color: 'var(--ds-icon-on-primary)' }} />
                  )}
                  {isIndeterminate && (
                    <span className="chat-checkbox-indeterminate" />
                  )}
                </button>
              </th>
            )}
            <th className={isCompact ? 'text-micro' : 'text-tiny'}>
              Name
            </th>
            {!isCompact && (
              <th className="text-tiny">
                Email
              </th>
            )}
            <th className={isCompact ? 'text-micro' : 'text-tiny'}>
              Department
            </th>
            <th className={isCompact ? 'text-micro' : 'text-tiny'}>
              Card
            </th>
          </tr>
        </thead>
        <tbody>
          {data.rows.map((row: EmployeeTableRow) => (
            <tr key={row.id} className={selected.has(row.id) ? 'selected' : ''}>
              {data.selectable && (
                <td>
                  <button
                    type="button"
                    onClick={() => toggleSelect(row.id)}
                    className={`chat-checkbox ${selected.has(row.id) ? 'checked' : ''}`}
                    aria-label={selected.has(row.id) ? `Deselect ${row.name}` : `Select ${row.name}`}
                  >
                    {selected.has(row.id) && (
                      <Icon icon={faCheck} size="small" style={{ color: 'var(--ds-icon-on-primary)' }} />
                    )}
                  </button>
                </td>
              )}
              <td className={`${isCompact ? 'text-label' : 'text-body-sm'} chat-table__name`}>
                {row.name}
                {isCompact && (
                  <span className="text-micro chat-table__email-inline">
                    {row.email}
                  </span>
                )}
              </td>
              {!isCompact && (
                <td className="text-body-sm chat-table__email">
                  {row.email}
                </td>
              )}
              <td className={`${isCompact ? 'text-label' : 'text-body-sm'} chat-table__department`}>
                {row.department}
              </td>
              <td className={`${isCompact ? 'text-label' : 'text-body-sm'} ${row.hasCard ? 'chat-table__has-card' : 'chat-table__no-card'}`}>
                {row.hasCard ? '✓' : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

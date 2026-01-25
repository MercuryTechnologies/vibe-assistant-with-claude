import { useState } from 'react';
import { Icon } from '@/components/ui/icon';
import { faCheck } from '@/icons';
import type { EmployeeTableMetadata, EmployeeTableRow } from '@/chat/types';

interface EmployeeTableProps {
  data: EmployeeTableMetadata;
  onSelectionChange?: (ids: string[]) => void;
  className?: string;
}

/**
 * EmployeeTable - Table of employees with optional selection
 * Used for card issuance workflows, team management, etc.
 */
export function EmployeeTable({ 
  data, 
  onSelectionChange,
  className = '' 
}: EmployeeTableProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

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
    <div className={`chat-employee-table ${className}`}>
      {data.title && (
        <h4 className="text-label-demi" style={{ 
          color: 'var(--ds-text-default)', 
          marginBottom: 8 
        }}>
          {data.title}
        </h4>
      )}
      
      <table className="chat-table">
        <thead>
          <tr>
            {data.selectable && (
              <th style={{ width: 32 }}>
                <button
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
            <th className="text-tiny" style={{ color: 'var(--ds-text-secondary)' }}>
              Name
            </th>
            <th className="text-tiny" style={{ color: 'var(--ds-text-secondary)' }}>
              Email
            </th>
            <th className="text-tiny" style={{ color: 'var(--ds-text-secondary)' }}>
              Department
            </th>
            <th className="text-tiny" style={{ color: 'var(--ds-text-secondary)' }}>
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
              <td className="text-body-sm" style={{ color: 'var(--ds-text-default)' }}>
                {row.name}
              </td>
              <td className="text-body-sm" style={{ color: 'var(--ds-text-secondary)' }}>
                {row.email}
              </td>
              <td className="text-body-sm" style={{ color: 'var(--ds-text-secondary)' }}>
                {row.department}
              </td>
              <td className="text-body-sm" style={{ color: row.hasCard ? 'var(--color-success)' : 'var(--ds-text-tertiary)' }}>
                {row.hasCard ? '✓' : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

import { useState, useMemo } from 'react';
import { useRecipients } from '@/hooks';
import { DSTable, type DSTableColumn, type SortDirection, type DSTableDetailPanelRenderContext } from '@/components/ui/ds-table';
import { DSTableDetailPanel, type DetailPanelField } from '@/components/ui/ds-table-detail-panel';
import { Badge } from '@/components/ui/badge';
import type { Recipient } from '@/types';

function formatDate(dateString?: string | null): string {
  if (!dateString) return '—';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatDateTime(dateString?: string | null): string {
  if (!dateString) return '—';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '—';
  const month = date.toLocaleDateString('en-US', { month: 'short' });
  const day = date.getDate();
  const time = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).toLowerCase();
  return `${month} ${day} at ${time}`;
}

export function Recipients() {
  const { recipients, isLoading } = useRecipients();
  const [sortState, setSortState] = useState<{ columnId: string; direction: SortDirection } | null>({
    columnId: 'name',
    direction: 'asc',
  });

  // Define columns for the recipients table
  const recipientColumns: DSTableColumn<Recipient>[] = [
    {
      id: 'name',
      header: 'Name',
      accessor: 'name',
      sortable: true,
      cell: (value) => (
        <span className="text-body">
          {value as string}
        </span>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      accessor: 'status',
      sortable: true,
      cell: (value) => {
        const status = value as string;
        const statusBadgeType: Record<string, 'success' | 'neutral' | 'warning'> = {
          active: 'success',
          inactive: 'neutral',
          pending: 'warning',
        };
        const badgeType = statusBadgeType[status] || 'neutral';
        const statusLabel = status.charAt(0).toUpperCase() + status.slice(1);
        return (
          <Badge type={badgeType}>
            {statusLabel}
          </Badge>
        );
      },
    },
    {
      id: 'lastPaid',
      header: 'Last Paid',
      accessor: 'lastPaid',
      sortable: true,
      cell: (value) => (
        <span className="text-body" style={{ color: 'var(--ds-text-secondary)' }}>
          {formatDate(value as string | null | undefined)}
        </span>
      ),
    },
  ];

  // Sort recipients based on current sort state
  const sortedRecipients = useMemo(() => {
    if (!sortState || !sortState.direction) return recipients;
    
    const { columnId, direction } = sortState;
    const sorted = [...recipients].sort((a, b) => {
      let comparison = 0;
      
      switch (columnId) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        case 'lastPaid':
          {
            const dateA = a.lastPaid ? new Date(a.lastPaid).getTime() : 0;
            const dateB = b.lastPaid ? new Date(b.lastPaid).getTime() : 0;
            comparison = dateA - dateB;
          }
          break;
        default:
          comparison = 0;
      }
      
      return direction === 'asc' ? comparison : -comparison;
    });
    
    return sorted;
  }, [recipients, sortState]);

  const renderRecipientDetailPanel = ({ row, isOpen, close }: DSTableDetailPanelRenderContext<Recipient>) => {
    if (!row) return null;

    const statusBadgeType: Record<string, 'success' | 'neutral' | 'warning'> = {
      active: 'success',
      inactive: 'neutral',
      pending: 'warning',
    };
    const badgeType = statusBadgeType[row.status] || 'neutral';
    const statusLabel = row.status.charAt(0).toUpperCase() + row.status.slice(1);

    // Configure fields for the detail panel
    const fields: DetailPanelField<Recipient>[] = [
      {
        id: 'name',
        label: 'Name',
        type: 'text',
        getValue: (r) => r.name,
      },
      {
        id: 'status',
        label: 'Status',
        type: 'custom',
        render: () => (
          <Badge type={badgeType}>
            {statusLabel}
          </Badge>
        ),
      },
      {
        id: 'lastPaid',
        label: 'Last Paid',
        type: 'text',
        getValue: (r) => r.lastPaid ? formatDateTime(r.lastPaid) : 'Never',
      },
      {
        id: 'notes',
        label: 'Notes',
        type: 'textarea',
        placeholder: 'Add a note about this recipient',
        rows: 3,
      },
    ];

    return (
      <DSTableDetailPanel
        row={row}
        isOpen={isOpen}
        onClose={close}
        title={row.name}
        hero={(r) => (
          <div className="w-full">
            <Badge type={badgeType} className="text-body">
              {statusLabel}
            </Badge>
          </div>
        )}
        fields={fields}
        showCopyLink={true}
      />
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-title-main">Recipients</h1>
      
      <DSTable
        columns={recipientColumns}
        data={sortedRecipients}
        getRowKey={(row) => row.id}
        loading={isLoading}
        loadingRowCount={10}
        emptyMessage="No recipients found."
        sortState={sortState}
        onSort={(columnId, direction) => {
          setSortState(direction 
            ? { columnId, direction } 
            : null
          );
        }}
        renderDetailPanel={renderRecipientDetailPanel}
        variant="centered"
      />
    </div>
  );
}

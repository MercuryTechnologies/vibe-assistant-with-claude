import { useState } from 'react';
import { DSTable, type SortDirection, type DSTableDetailPanelRenderContext } from '@/components/ui/ds-table';
import { DSTableDetailPanel, type DetailPanelField } from '@/components/ui/ds-table-detail-panel';
import { samplePeople, personColumns, sampleTransactions, transactionColumns, transactionCategoryOptions, getAccountType, getMethod } from '../sample-data';
import { cn } from '@/lib/utils';
import type { Transaction } from '@/types';

export function DSTableDefaultDemo() {
  const [sortState, setSortState] = useState<{ columnId: string; direction: SortDirection } | undefined>();
  
  return (
    <DSTable
      columns={personColumns}
      data={samplePeople}
      getRowKey={(row) => row.id}
      sortState={sortState}
      onSort={(columnId, direction) => setSortState(direction ? { columnId, direction } : undefined)}
    />
  );
}

export function DSTableInteractiveDemo() {
  const [selectedRowKey, setSelectedRowKey] = useState<string | null>(null);
  
  return (
    <DSTable
      columns={personColumns}
      data={samplePeople}
      getRowKey={(row) => row.id}
      onRowClick={(row) => setSelectedRowKey(row.id)}
      selectedRowKey={selectedRowKey}
    />
  );
}

export function DSTableSmallDemo() {
  return (
    <DSTable
      columns={personColumns}
      data={samplePeople.slice(0, 3)}
      getRowKey={(row) => row.id}
      size="sm"
    />
  );
}

export function DSTableLargeDemo() {
  return (
    <DSTable
      columns={personColumns}
      data={samplePeople.slice(0, 3)}
      getRowKey={(row) => row.id}
      size="lg"
    />
  );
}

export function DSTableStripedDemo() {
  return (
    <DSTable
      columns={personColumns}
      data={samplePeople}
      getRowKey={(row) => row.id}
      variant="striped"
    />
  );
}

export function DSTableBorderedDemo() {
  return (
    <DSTable
      columns={personColumns}
      data={samplePeople}
      getRowKey={(row) => row.id}
      variant="bordered"
    />
  );
}

export function DSTableLoadingDemo() {
  return (
    <DSTable
      columns={personColumns}
      data={[]}
      getRowKey={(row) => row.id}
      loading={true}
      loadingRowCount={3}
    />
  );
}

export function DSTableEmptyDemo() {
  return (
    <DSTable
      columns={personColumns}
      data={[]}
      getRowKey={(row) => row.id}
      emptyMessage="No team members found"
    />
  );
}

export function DSTableFullWidthDemo() {
  const [sortState, setSortState] = useState<{ columnId: string; direction: SortDirection } | undefined>();
  
  return (
    <DSTable
      columns={personColumns}
      data={samplePeople}
      getRowKey={(row) => row.id}
      variant="fullWidth"
      sortState={sortState}
      onSort={(columnId, direction) => setSortState(direction ? { columnId, direction } : undefined)}
    />
  );
}

export function DSTableCenteredDemo() {
  const [sortState, setSortState] = useState<{ columnId: string; direction: SortDirection } | undefined>();
  
  return (
    <DSTable
      columns={personColumns}
      data={samplePeople}
      getRowKey={(row) => row.id}
      variant="centered"
      sortState={sortState}
      onSort={(columnId, direction) => setSortState(direction ? { columnId, direction } : undefined)}
    />
  );
}

export function DSTableFullWidthWithPanelDemo() {
  const [sortState, setSortState] = useState<{ columnId: string; direction: SortDirection } | undefined>();
  const [categoryValues, setCategoryValues] = useState<Record<string, string>>({});

  const handleCategoryChange = (transactionId: string, newValue: string) => {
    setCategoryValues(prev => ({
      ...prev,
      [transactionId]: newValue
    }));
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    const month = date.toLocaleDateString('en-US', { month: 'short' })
    const day = date.getDate()
    const time = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).toLowerCase()
    return `${month} ${day} at ${time}`
  }

  const MoneyAmountHeadline = ({ amount }: { amount: number }) => {
    const isPositive = amount >= 0
    const absAmount = Math.abs(amount)
    const totalCents = Math.round(absAmount * 100)
    const dollars = Math.floor(totalCents / 100)
    const cents = String(totalCents % 100).padStart(2, "0")
    const formattedDollars = dollars.toLocaleString("en-US")
    const prefix = isPositive ? "" : "−"

    return (
      <span
        className={cn(
          "text-title-main font-display tabular-nums whitespace-nowrap"
        )}
        style={{ 
          color: isPositive ? "var(--color-success)" : "var(--ds-text-title)",
        }}
      >
        <span>{prefix}$</span>
        <span>{formattedDollars}</span>
        <span 
          className="text-body-sm-demi align-top" 
          style={{ 
            position: 'relative', 
            top: '2px',
          }}
        >
          .{cents}
        </span>
      </span>
    )
  }

  const renderDetailPanel = ({ row, isOpen, close }: DSTableDetailPanelRenderContext<Transaction>) => {
    if (!row) return null

    const isIncoming = row.amount >= 0

    const fields: DetailPanelField<Transaction>[] = [
      {
        id: 'recipient-memo',
        label: 'Recipient memo',
        type: 'text',
        getValue: () => 'From Mercury Technologies, Inc.',
      },
      {
        id: 'category',
        label: 'Custom',
        type: 'combobox',
        value: categoryValues[row.id] || row.category,
        options: transactionCategoryOptions,
        onChange: (newValue) => handleCategoryChange(row.id, newValue),
        placeholder: 'Select category',
      },
      {
        id: 'notes',
        label: 'Notes',
        type: 'textarea',
        placeholder: 'Add a note',
        rows: 2,
      },
      {
        id: 'bank-description',
        label: 'Bank description',
        type: 'text',
        getValue: (t) => t.description || 'Send Money transition initiated on Mercury',
      },
    ]

    return (
      <DSTableDetailPanel
        row={row}
        isOpen={isOpen}
        onClose={close}
        title={row.merchant}
        hero={(t) => (
          <div className="w-full">
            <MoneyAmountHeadline amount={t.amount} />
          </div>
        )}
        timeline={[
          {
            type: 'first',
            title: isIncoming ? row.merchant : 'Pending',
            datetime: formatDateTime(row.date),
            attribution: 'First L.',
          },
          {
            type: 'last',
            title: isIncoming ? getAccountType(row.accountId) : `${row.merchant} ••1111`,
            datetime: formatDateTime(row.date),
            attribution: 'First L.',
          },
        ]}
        fields={fields}
        showCopyLink={true}
      />
    )
  };
  
  return (
    <DSTable
      columns={transactionColumns}
      data={sampleTransactions}
      getRowKey={(row) => row.id}
      variant="fullWidth"
      sortState={sortState}
      onSort={(columnId, direction) => setSortState(direction ? { columnId, direction } : undefined)}
      renderDetailPanel={renderDetailPanel}
    />
  );
}

export function DSTableCenteredWithPanelDemo() {
  const [sortState, setSortState] = useState<{ columnId: string; direction: SortDirection } | undefined>();
  const [categoryValues, setCategoryValues] = useState<Record<string, string>>({});

  const handleCategoryChange = (transactionId: string, newValue: string) => {
    setCategoryValues(prev => ({
      ...prev,
      [transactionId]: newValue
    }));
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    const month = date.toLocaleDateString('en-US', { month: 'short' })
    const day = date.getDate()
    const time = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).toLowerCase()
    return `${month} ${day} at ${time}`
  }

  const MoneyAmountHeadline = ({ amount }: { amount: number }) => {
    const isPositive = amount >= 0
    const absAmount = Math.abs(amount)
    const totalCents = Math.round(absAmount * 100)
    const dollars = Math.floor(totalCents / 100)
    const cents = String(totalCents % 100).padStart(2, "0")
    const formattedDollars = dollars.toLocaleString("en-US")
    const prefix = isPositive ? "" : "−"

    return (
      <span
        className={cn(
          "text-title-main font-display tabular-nums whitespace-nowrap"
        )}
        style={{ 
          color: isPositive ? "var(--color-success)" : "var(--ds-text-title)",
        }}
      >
        <span>{prefix}$</span>
        <span>{formattedDollars}</span>
        <span 
          className="text-body-sm-demi align-top" 
          style={{ 
            position: 'relative', 
            top: '2px',
          }}
        >
          .{cents}
        </span>
      </span>
    )
  }

  const renderDetailPanel = ({ row, isOpen, close }: DSTableDetailPanelRenderContext<Transaction>) => {
    if (!row) return null

    const isIncoming = row.amount >= 0

    const fields: DetailPanelField<Transaction>[] = [
      {
        id: 'recipient-memo',
        label: 'Recipient memo',
        type: 'text',
        getValue: () => 'From Mercury Technologies, Inc.',
      },
      {
        id: 'category',
        label: 'Custom',
        type: 'combobox',
        value: categoryValues[row.id] || row.category,
        options: transactionCategoryOptions,
        onChange: (newValue) => handleCategoryChange(row.id, newValue),
        placeholder: 'Select category',
      },
      {
        id: 'notes',
        label: 'Notes',
        type: 'textarea',
        placeholder: 'Add a note',
        rows: 2,
      },
      {
        id: 'bank-description',
        label: 'Bank description',
        type: 'text',
        getValue: (t) => t.description || 'Send Money transition initiated on Mercury',
      },
    ]

    return (
      <DSTableDetailPanel
        row={row}
        isOpen={isOpen}
        onClose={close}
        title={row.merchant}
        hero={(t) => (
          <div className="w-full">
            <MoneyAmountHeadline amount={t.amount} />
          </div>
        )}
        timeline={[
          {
            type: 'first',
            title: isIncoming ? row.merchant : 'Pending',
            datetime: formatDateTime(row.date),
            attribution: 'First L.',
          },
          {
            type: 'last',
            title: isIncoming ? getAccountType(row.accountId) : `${row.merchant} ••1111`,
            datetime: formatDateTime(row.date),
            attribution: 'First L.',
          },
        ]}
        fields={fields}
        showCopyLink={true}
      />
    )
  };
  
  return (
    <DSTable
      columns={transactionColumns}
      data={sampleTransactions}
      getRowKey={(row) => row.id}
      variant="centered"
      sortState={sortState}
      onSort={(columnId, direction) => setSortState(direction ? { columnId, direction } : undefined)}
      renderDetailPanel={renderDetailPanel}
    />
  );
}

// ============================================================================
// DSTableDetailPanel Standalone Demos (for preview)
// ============================================================================

function MoneyAmountHeadline({ amount }: { amount: number }) {
  const isPositive = amount >= 0
  const absAmount = Math.abs(amount)
  const totalCents = Math.round(absAmount * 100)
  const dollars = Math.floor(totalCents / 100)
  const cents = String(totalCents % 100).padStart(2, "0")
  const formattedDollars = dollars.toLocaleString("en-US")
  const prefix = isPositive ? "" : "−"

  return (
    <span
      className={cn(
        "text-title-main font-display tabular-nums whitespace-nowrap"
      )}
      style={{ 
        color: isPositive ? "var(--color-success)" : "var(--ds-text-title)",
      }}
    >
      <span>{prefix}$</span>
      <span>{formattedDollars}</span>
      <span 
        className="text-body-sm-demi align-top" 
        style={{ 
          position: 'relative', 
          top: '2px',
        }}
      >
        .{cents}
      </span>
    </span>
  )
}

const formatDateTime = (dateString: string) => {
  const date = new Date(dateString)
  const month = date.toLocaleDateString('en-US', { month: 'short' })
  const day = date.getDate()
  const time = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).toLowerCase()
  return `${month} ${day} at ${time}`
}

export function DSTableDetailPanelBasicDemo() {
  const [isOpen, setIsOpen] = useState(true)
  const sampleRow = sampleTransactions[0]
  const isIncoming = sampleRow.amount >= 0

  const fields: DetailPanelField<Transaction>[] = [
    {
      id: 'recipient-memo',
      label: 'Recipient memo',
      type: 'text',
      getValue: () => 'From Mercury Technologies, Inc.',
    },
    {
      id: 'category',
      label: 'Custom',
      type: 'combobox',
      value: sampleRow.category,
      options: transactionCategoryOptions,
      onChange: () => {},
      placeholder: 'Select category',
    },
    {
      id: 'notes',
      label: 'Notes',
      type: 'textarea',
      placeholder: 'Add a note',
      rows: 2,
    },
    {
      id: 'bank-description',
      label: 'Bank description',
      type: 'text',
      getValue: (t) => t.description || 'Send Money transition initiated on Mercury',
    },
  ]

  return (
    <div style={{ position: 'relative', height: '600px', width: '100%' }}>
      <DSTableDetailPanel
        row={sampleRow}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={sampleRow.merchant}
        hero={(t) => (
          <div className="w-full">
            <MoneyAmountHeadline amount={t.amount} />
          </div>
        )}
        timeline={[
          {
            type: 'first',
            title: isIncoming ? sampleRow.merchant : 'Pending',
            datetime: formatDateTime(sampleRow.date),
            attribution: 'First L.',
          },
          {
            type: 'last',
            title: isIncoming ? getAccountType(sampleRow.accountId) : `${sampleRow.merchant} ••1111`,
            datetime: formatDateTime(sampleRow.date),
            attribution: 'First L.',
          },
        ]}
        fields={fields}
        showCopyLink={true}
      />
    </div>
  )
}

export function DSTableDetailPanelWithFileDemo() {
  const [isOpen, setIsOpen] = useState(true)
  const sampleRow = sampleTransactions[0]

  const fields: DetailPanelField<Transaction>[] = [
    {
      id: 'category',
      label: 'Category',
      type: 'combobox',
      value: sampleRow.category,
      options: transactionCategoryOptions,
      onChange: () => {},
    },
    {
      id: 'attachments',
      label: 'Attachments',
      type: 'file',
      filename: 'Invoice-2024-Q1.pdf',
      uploaded: true,
    },
    {
      id: 'notes',
      label: 'Notes',
      type: 'textarea',
      placeholder: 'Add internal notes...',
      rows: 3,
    },
  ]

  return (
    <div style={{ position: 'relative', height: '600px', width: '100%' }}>
      <DSTableDetailPanel
        row={sampleRow}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={sampleRow.merchant}
        fields={fields}
      />
    </div>
  )
}

export function DSTableDetailPanelMinimalDemo() {
  const [isOpen, setIsOpen] = useState(true)
  const sampleRow = sampleTransactions[0]

  const fields: DetailPanelField<Transaction>[] = [
    {
      id: 'merchant',
      label: 'Merchant',
      type: 'text',
      getValue: (t) => t.merchant,
    },
    {
      id: 'amount',
      label: 'Amount',
      type: 'text',
      getValue: (t) => `$${Math.abs(t.amount).toFixed(2)}`,
    },
    {
      id: 'date',
      label: 'Date',
      type: 'text',
      getValue: (t) => new Date(t.date).toLocaleDateString(),
    },
  ]

  return (
    <div style={{ position: 'relative', height: '400px', width: '100%' }}>
      <DSTableDetailPanel
        row={sampleRow}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={sampleRow.merchant}
        fields={fields}
      />
    </div>
  )
}

export const dsTableVariantComponents: Record<string, React.ComponentType> = {
  'Default with Sorting': DSTableDefaultDemo,
  'Interactive Rows': DSTableInteractiveDemo,
  'Small Size': DSTableSmallDemo,
  'Large Size': DSTableLargeDemo,
  'Striped Rows': DSTableStripedDemo,
  'Bordered': DSTableBorderedDemo,
  'Loading State': DSTableLoadingDemo,
  'Empty State': DSTableEmptyDemo,
  'Full Width': DSTableFullWidthDemo,
  'Centered': DSTableCenteredDemo,
  'Full Width with Detail Panel': DSTableFullWidthWithPanelDemo,
  'Centered with Detail Panel': DSTableCenteredWithPanelDemo,
};

export const dsTableDetailPanelVariantComponents: Record<string, React.ComponentType> = {
  'Basic': DSTableDetailPanelBasicDemo,
  'With File Attachment': DSTableDetailPanelWithFileDemo,
  'Minimal': DSTableDetailPanelMinimalDemo,
};

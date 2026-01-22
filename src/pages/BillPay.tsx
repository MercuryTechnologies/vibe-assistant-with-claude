import { useState, useMemo } from 'react';
import { DSButton } from '@/components/ui/ds-button';
import { DSTable, type DSTableColumn, type SortDirection } from '@/components/ui/ds-table';
import { Badge } from '@/components/ui/badge';
import { Chip } from '@/components/ui/chip';
import { Icon } from '@/components/ui/icon';
import { faEnvelope, faArrowUpFromBracket, faPaperPlane, faGear, faMessage, faCircleUp } from '@/icons';

// ============================================================================
// Types
// ============================================================================

interface Bill {
  id: string;
  dueDate: string;
  status: 'overdue' | 'pending' | 'scheduled' | 'paid';
  recipient: string;
  recipientType: 'email' | 'upload';
  amount: number;
  invoiceNo: string;
  lastUpdated: string;
}

type TabId = 'inbox' | 'needs_approval' | 'scheduled' | 'paid';

interface Tab {
  id: TabId;
  label: string;
  count?: number;
}

// ============================================================================
// Mock Data
// ============================================================================

const mockBills: Bill[] = [
  {
    id: '1',
    dueDate: '2025-04-15',
    status: 'overdue',
    recipient: 'Debug LLC',
    recipientType: 'email',
    amount: 220.00,
    invoiceNo: 'INV-902',
    lastUpdated: '2026-01-21',
  },
  {
    id: '2',
    dueDate: '2025-12-01',
    status: 'overdue',
    recipient: 'Nano Tech LLC',
    recipientType: 'upload',
    amount: 1290.00,
    invoiceNo: 'INV-001',
    lastUpdated: '2026-01-21',
  },
  {
    id: '3',
    dueDate: '2026-01-17',
    status: 'overdue',
    recipient: 'Tax Bureau Inc',
    recipientType: 'email',
    amount: 11600.00,
    invoiceNo: 'INV-883346',
    lastUpdated: '2026-01-21',
  },
];

const tabs: Tab[] = [
  { id: 'inbox', label: 'Inbox', count: 3 },
  { id: 'needs_approval', label: 'Needs Approval', count: 1 },
  { id: 'scheduled', label: 'Scheduled', count: 3 },
  { id: 'paid', label: 'Paid' },
];

// ============================================================================
// Helper Functions
// ============================================================================

function formatDueDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const currentYear = now.getFullYear();
  const dateYear = date.getFullYear();
  
  // If it's this year and within the same month, show just the day
  if (dateYear === currentYear && date.getMonth() === now.getMonth()) {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
  
  // If it's this year, show month and day
  if (dateYear === currentYear) {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
  
  // Otherwise show month and year
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

function formatLastUpdated(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatAmount(amount: number): { dollars: string; cents: string } {
  const totalCents = Math.round(amount * 100);
  const dollars = Math.floor(totalCents / 100).toLocaleString('en-US');
  const cents = String(totalCents % 100).padStart(2, '0');
  return { dollars, cents };
}

// ============================================================================
// Summary Card Component
// ============================================================================

interface SummaryCardProps {
  count: number;
  label: string;
  amount: number;
  highlight?: boolean;
}

function SummaryCard({ count, label, amount, highlight = false }: SummaryCardProps) {
  const { dollars, cents } = formatAmount(amount);
  
  return (
    <div
      className="flex flex-col gap-1 p-4 rounded-lg"
      style={{
        border: '1px solid var(--color-border-default)',
        backgroundColor: 'var(--ds-bg-default)',
      }}
    >
      <span
        className="text-title-main"
        style={{ color: highlight ? 'var(--color-warning)' : 'var(--ds-text-title)' }}
      >
        {count}
      </span>
      <span
        className="text-body"
        style={{ color: 'var(--ds-text-secondary)' }}
      >
        {label}
      </span>
      <span
        className="text-body tabular-nums"
        style={{ color: 'var(--ds-text-tertiary)' }}
      >
        ${dollars}.{cents}
      </span>
    </div>
  );
}

// ============================================================================
// Tab Component
// ============================================================================

interface TabButtonProps {
  tab: Tab;
  isActive: boolean;
  onClick: () => void;
}

function TabButton({ tab, isActive, onClick }: TabButtonProps) {
  return (
    <button
      type="button"
      className="flex items-center gap-2 pb-3 relative"
      onClick={onClick}
      style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
      }}
    >
      <span
        className="text-body"
        style={{
          color: isActive ? 'var(--ds-text-default)' : 'var(--ds-text-tertiary)',
        }}
      >
        {tab.label}
      </span>
      {tab.count !== undefined && (
        <span
          className="text-label px-1.5 rounded"
          style={{
            backgroundColor: 'var(--ds-bg-secondary)',
            color: 'var(--ds-text-tertiary)',
          }}
        >
          {tab.count}
        </span>
      )}
      {isActive && (
        <div
          className="absolute bottom-0 left-0 right-0 h-0.5"
          style={{ backgroundColor: 'var(--color-warning)' }}
        />
      )}
    </button>
  );
}

// ============================================================================
// Recipient Cell Component
// ============================================================================

interface RecipientCellProps {
  recipient: string;
  type: 'email' | 'upload';
}

function RecipientCell({ recipient, type }: RecipientCellProps) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="flex items-center justify-center w-8 h-8 rounded-full"
        style={{ backgroundColor: 'var(--ds-bg-secondary)' }}
      >
        <Icon
          icon={type === 'email' ? faEnvelope : faCircleUp}
          size="small"
          style={{ color: 'var(--ds-icon-secondary)' }}
        />
      </div>
      <span className="text-body">{recipient}</span>
    </div>
  );
}

// ============================================================================
// Amount Cell Component
// ============================================================================

interface AmountCellProps {
  amount: number;
}

function AmountCell({ amount }: AmountCellProps) {
  const { dollars, cents } = formatAmount(amount);
  
  return (
    <span className="text-body tabular-nums">
      ${dollars}.<span style={{ color: 'var(--ds-text-tertiary)' }}>{cents}</span>
    </span>
  );
}

// ============================================================================
// Bill Pay Page Component
// ============================================================================

export function BillPay() {
  const [activeTab, setActiveTab] = useState<TabId>('inbox');
  const [selectedRowKeys, setSelectedRowKeys] = useState<Set<string>>(new Set());
  const [sortState, setSortState] = useState<{ columnId: string; direction: SortDirection }>({
    columnId: 'lastUpdated',
    direction: 'desc',
  });
  const [statusFilterOpen, setStatusFilterOpen] = useState(false);

  // Calculate summary values
  const summary = useMemo(() => {
    const totalOutstanding = mockBills.filter(b => b.status !== 'paid').length;
    const totalAmount = mockBills
      .filter(b => b.status !== 'paid')
      .reduce((sum, b) => sum + b.amount, 0);
    
    const overdue = mockBills.filter(b => b.status === 'overdue').length;
    const overdueAmount = mockBills
      .filter(b => b.status === 'overdue')
      .reduce((sum, b) => sum + b.amount, 0);
    
    // Due in next 7 days (none in mock data)
    const dueNext7Days = 0;
    const dueNext7DaysAmount = 0;
    
    return {
      totalOutstanding,
      totalAmount,
      overdue,
      overdueAmount,
      dueNext7Days,
      dueNext7DaysAmount,
    };
  }, []);

  // Filter bills by active tab
  const filteredBills = useMemo(() => {
    switch (activeTab) {
      case 'inbox':
        return mockBills.filter(b => b.status === 'overdue' || b.status === 'pending');
      case 'needs_approval':
        return mockBills.filter(b => b.status === 'pending');
      case 'scheduled':
        return mockBills.filter(b => b.status === 'scheduled');
      case 'paid':
        return mockBills.filter(b => b.status === 'paid');
      default:
        return mockBills;
    }
  }, [activeTab]);

  // Sort bills
  const sortedBills = useMemo(() => {
    if (!sortState.direction) return filteredBills;

    return [...filteredBills].sort((a, b) => {
      let comparison = 0;
      
      switch (sortState.columnId) {
        case 'dueDate':
          comparison = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
          break;
        case 'amount':
          comparison = a.amount - b.amount;
          break;
        case 'recipient':
          comparison = a.recipient.localeCompare(b.recipient);
          break;
        case 'lastUpdated':
          comparison = new Date(a.lastUpdated).getTime() - new Date(b.lastUpdated).getTime();
          break;
        default:
          comparison = 0;
      }
      
      return sortState.direction === 'asc' ? comparison : -comparison;
    });
  }, [filteredBills, sortState]);

  // Table columns
  const columns: DSTableColumn<Bill>[] = [
    {
      id: 'dueDate',
      header: 'Due date',
      accessor: 'dueDate',
      sortable: true,
      width: '100px',
      cell: (value) => (
        <span className="text-body">{formatDueDate(value as string)}</span>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      accessor: 'status',
      width: '100px',
      cell: (value) => {
        const status = value as Bill['status'];
        if (status === 'overdue') {
          return <Badge type="warning">Overdue</Badge>;
        }
        if (status === 'pending') {
          return <Badge type="neutral">Pending</Badge>;
        }
        if (status === 'scheduled') {
          return <Badge type="highlight">Scheduled</Badge>;
        }
        return <Badge type="success">Paid</Badge>;
      },
    },
    {
      id: 'recipient',
      header: 'Recipient',
      accessor: (row) => row,
      sortable: true,
      cell: (_, row) => (
        <RecipientCell recipient={row.recipient} type={row.recipientType} />
      ),
    },
    {
      id: 'amount',
      header: 'Amount',
      accessor: 'amount',
      align: 'right',
      sortable: true,
      width: '120px',
      cell: (value) => <AmountCell amount={value as number} />,
    },
    {
      id: 'invoiceNo',
      header: 'Invoice no.',
      accessor: 'invoiceNo',
      width: '120px',
      cell: (value) => (
        <span className="text-body">{value as string}</span>
      ),
    },
    {
      id: 'lastUpdated',
      header: 'Last updated',
      accessor: 'lastUpdated',
      sortable: true,
      width: '120px',
      align: 'right',
      cell: (value) => (
        <span className="text-body">{formatLastUpdated(value as string)}</span>
      ),
    },
  ];

  const handleSort = (columnId: string, direction: SortDirection) => {
    setSortState({ columnId, direction });
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-title-main m-0">Bill Pay</h1>
          <DSButton
            variant="secondary"
            size="small"
            leadingIcon={<Icon icon={faMessage} size="small" style={{ color: 'var(--ds-icon-secondary)' }} />}
          >
            Feedback
          </DSButton>
        </div>
        <div className="flex items-center gap-3">
          <DSButton
            variant="tertiary"
            size="small"
            leadingIcon={<Icon icon={faPaperPlane} size="small" style={{ color: 'var(--ds-icon-default)' }} />}
          >
            Send Money
          </DSButton>
          <DSButton
            variant="secondary"
            size="small"
            leadingIcon={<Icon icon={faArrowUpFromBracket} size="small" style={{ color: 'var(--ds-icon-default)' }} />}
          >
            Upload Bill
          </DSButton>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="px-6 mb-6">
        <div className="grid grid-cols-3 gap-4">
          <SummaryCard
            count={summary.totalOutstanding}
            label="Total outstanding"
            amount={summary.totalAmount}
          />
          <SummaryCard
            count={summary.overdue}
            label="Overdue"
            amount={summary.overdueAmount}
            highlight
          />
          <SummaryCard
            count={summary.dueNext7Days}
            label="Due in next 7 days"
            amount={summary.dueNext7DaysAmount}
          />
        </div>
      </div>

      {/* Tabs and Email */}
      <div className="px-6 flex items-center justify-between border-b" style={{ borderColor: 'var(--color-border-default)' }}>
        <div className="flex items-center gap-6">
          {tabs.map((tab) => (
            <TabButton
              key={tab.id}
              tab={tab}
              isActive={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
            />
          ))}
        </div>
        <div className="flex items-center gap-3 pb-3">
          <div className="flex items-center gap-2">
            <Icon icon={faEnvelope} size="small" style={{ color: 'var(--ds-icon-secondary)' }} />
            <span className="text-body" style={{ color: 'var(--ds-text-secondary)' }}>
              my-company-name@ap.mercury.com
            </span>
          </div>
          <button
            type="button"
            className="flex items-center justify-center w-8 h-8 rounded-md"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <Icon icon={faGear} size="small" style={{ color: 'var(--ds-icon-secondary)' }} />
          </button>
        </div>
      </div>

      {/* Filter Row */}
      <div className="px-6 py-3">
        <Chip
          label="Status"
          trailingAction="dropdown"
          isOpen={statusFilterOpen}
          onClick={() => setStatusFilterOpen(!statusFilterOpen)}
        />
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <DSTable
          columns={columns}
          data={sortedBills}
          getRowKey={(row) => row.id}
          sortState={sortState}
          onSort={handleSort}
          variant="fullWidth"
          selectable
          selectedRowKeys={selectedRowKeys}
          onSelectionChange={setSelectedRowKeys}
          emptyMessage="No bills found"
        />
      </div>
    </div>
  );
}

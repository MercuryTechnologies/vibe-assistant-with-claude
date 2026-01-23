import { useParams, Link } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { DSButton } from '@/components/ui/ds-button';
import { DSTable, type DSTableColumn } from '@/components/ui/ds-table';
import { DSAvatar } from '@/components/ui/ds-avatar';
import { Icon } from '@/components/ui/icon';
import { faCircleInfo, faChevronDown, faPlus, faCopy, faEye, faEyeSlash, faChevronRight, faArrowLeft, faArrowRight, faCreditCard } from '@/icons';
import { useDataSettings, formatBalanceParts } from '@/context/DataContext';
import { useTransactions } from '@/hooks';
import type { Transaction } from '@/types';

// Account metadata for routing/bank info
const ACCOUNT_METADATA: Record<string, {
  routingNumber: string;
  accountNumber: string;
  bankName: string;
  bankAddress: string[];
}> = {
  'ops-payroll': {
    routingNumber: '132456789',
    accountNumber: '1038',
    bankName: 'Choice Financial Group',
    bankAddress: ['4501 23rd Avenue S', 'Fargo, ND 58104'],
  },
  'ap': {
    routingNumber: '132456789',
    accountNumber: '2847',
    bankName: 'Choice Financial Group',
    bankAddress: ['4501 23rd Avenue S', 'Fargo, ND 58104'],
  },
  'ar': {
    routingNumber: '132456789',
    accountNumber: '5912',
    bankName: 'Choice Financial Group',
    bankAddress: ['4501 23rd Avenue S', 'Fargo, ND 58104'],
  },
  'checking-0297': {
    routingNumber: '132456789',
    accountNumber: '0297',
    bankName: 'Choice Financial Group',
    bankAddress: ['4501 23rd Avenue S', 'Fargo, ND 58104'],
  },
  'savings-7658': {
    routingNumber: '132456789',
    accountNumber: '7658',
    bankName: 'Choice Financial Group',
    bankAddress: ['4501 23rd Avenue S', 'Fargo, ND 58104'],
  },
};

// Transaction method types for display
const TRANSACTION_METHODS: Record<string, { label: string; icon: 'arrow-left' | 'arrow-right' | 'card' }> = {
  'working-capital': { label: 'Working Capital Loan Payment', icon: 'arrow-left' },
  'transfer-in': { label: 'Transfer', icon: 'arrow-right' },
  'transfer-out': { label: 'Transfer', icon: 'arrow-left' },
  'card': { label: '', icon: 'card' },
};


// Copy button component
function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="flex items-center justify-center rounded-sm"
      style={{
        width: 20,
        height: 20,
        background: 'transparent',
        border: 'none',
        padding: 0,
        cursor: 'pointer',
      }}
    >
      <Icon 
        icon={faCopy} 
        size="small" 
        style={{ color: copied ? 'var(--color-success)' : 'var(--ds-icon-secondary)' }}
      />
    </button>
  );
}

// Transaction row interface
interface TransactionRow {
  id: string;
  date: string;
  merchant: string;
  amount: number;
  method: string;
  cardHolder?: string;
  isMercuryTransfer?: boolean;
}

export function AccountDetail() {
  const { accountId } = useParams<{ accountId: string }>();
  const { getAccountBalances } = useDataSettings();
  const { transactions } = useTransactions(accountId);
  const [showAccountNumber, setShowAccountNumber] = useState(false);

  // Get account data
  const accounts = getAccountBalances();
  const account = accounts.find(acc => acc.id === accountId);
  const metadata = accountId ? ACCOUNT_METADATA[accountId] : null;

  // Format balance
  const balanceParts = account ? formatBalanceParts(account.balance) : { dollars: '0', cents: '00' };

  // Transform transactions for table
  const tableData: TransactionRow[] = useMemo(() => {
    return transactions.slice(0, 5).map((txn: Transaction) => {
      const date = new Date(txn.date);
      const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      // Determine if it's a Mercury transfer
      const isMercuryTransfer = txn.merchant.toLowerCase().includes('mercury') || 
                                txn.merchant.toLowerCase().includes('from ar') ||
                                txn.merchant.toLowerCase().includes('from ap');

      // Determine method based on transaction type and amount
      let method = 'card';
      let cardHolder = '';

      if (txn.type === 'transfer' || isMercuryTransfer) {
        method = txn.amount > 0 ? 'transfer-in' : 'transfer-out';
      } else if (txn.type === 'debit' && !isMercuryTransfer) {
        // Card transaction - extract card holder from merchant if available
        const parts = txn.merchant.split(' - ');
        if (parts.length > 1) {
          cardHolder = parts[1];
        } else {
          cardHolder = `${txn.merchant.slice(0, 1).toUpperCase()}. ••${Math.floor(Math.random() * 9000 + 1000)}`;
        }
        method = 'card';
      }

      return {
        id: txn.id,
        date: formattedDate,
        merchant: txn.merchant,
        amount: txn.amount,
        method,
        cardHolder,
        isMercuryTransfer,
      };
    });
  }, [transactions]);

  // Table columns
  const columns: DSTableColumn<TransactionRow>[] = [
    {
      id: 'date',
      header: 'Date',
      accessor: 'date',
      width: '100px',
      cell: (value) => (
        <span className="text-body" style={{ color: 'var(--ds-text-secondary)' }}>
          {value as string}
        </span>
      ),
    },
    {
      id: 'toFrom',
      header: 'To/From',
      accessor: (row) => row.merchant,
      cell: (_, row) => (
        <div className="flex items-center gap-3">
          <DSAvatar type="trx" name={row.merchant} size="small" />
          <span className="text-body" style={{ color: 'var(--ds-text-default)' }}>
            {row.merchant}
          </span>
        </div>
      ),
    },
    {
      id: 'amount',
      header: 'Amount',
      accessor: 'amount',
      align: 'right',
      width: '140px',
      cell: (value) => {
        const amount = value as number;
        const isNegative = amount < 0;
        const absAmount = Math.abs(amount);
        const formatted = absAmount.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
        
        return (
          <span 
            className="text-body" 
            style={{ 
              color: isNegative ? 'var(--ds-text-default)' : 'var(--color-success)',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {isNegative ? `−$${formatted}` : `$${formatted}`}
          </span>
        );
      },
    },
    {
      id: 'method',
      header: 'Method',
      accessor: 'method',
      width: '200px',
      cell: (value, row) => {
        const method = value as string;
        
        if (method === 'card') {
          return (
            <div className="flex items-center gap-2">
              <Icon icon={faCreditCard} size="small" style={{ color: 'var(--ds-icon-secondary)' }} />
              <span className="text-body" style={{ color: 'var(--ds-text-secondary)' }}>
                {row.cardHolder}
              </span>
            </div>
          );
        }

        const methodInfo = TRANSACTION_METHODS[method];
        if (!methodInfo) return null;

        return (
          <div className="flex items-center gap-2">
            <Icon 
              icon={methodInfo.icon === 'arrow-left' ? faArrowLeft : faArrowRight} 
              size="small" 
              style={{ color: 'var(--ds-icon-secondary)' }} 
            />
            <span className="text-body" style={{ color: 'var(--ds-text-secondary)' }}>
              {methodInfo.label}
            </span>
          </div>
        );
      },
    },
  ];

  if (!account || !metadata) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-body text-muted-foreground">Account not found</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full" style={{ maxWidth: 968, margin: '0 auto' }}>
      {/* Page Title */}
      <h1 className="text-title-main" style={{ marginBottom: 24 }}>
        {account.name}
      </h1>

      {/* Cards Row */}
      <div className="flex gap-4" style={{ marginBottom: 32 }}>
        {/* Balance Card */}
        <div
          className="flex flex-col rounded-lg flex-1"
          style={{
            border: '1px solid var(--color-border-default)',
            backgroundColor: 'var(--ds-bg-default)',
          }}
        >
          {/* Top Section */}
          <div className="flex items-start justify-between" style={{ padding: 24, paddingBottom: 16 }}>
            <div className="flex flex-col gap-2">
              {/* Available Label */}
              <div className="flex items-center gap-1">
                <span className="text-body" style={{ color: 'var(--ds-text-secondary)' }}>
                  Available
                </span>
                <Icon icon={faCircleInfo} size="small" style={{ color: 'var(--ds-icon-tertiary)' }} />
              </div>

              {/* Balance Amount */}
              <div className="flex items-baseline">
                <span
                  className="font-display"
                  style={{
                    fontSize: 38,
                    fontWeight: 380,
                    lineHeight: 1,
                    color: 'var(--ds-text-title)',
                  }}
                >
                  ${balanceParts.dollars}
                </span>
                <span
                  className="font-display"
                  style={{
                    fontSize: 24,
                    fontWeight: 380,
                    color: 'var(--ds-text-tertiary)',
                  }}
                >
                  .{balanceParts.cents}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <DSButton variant="secondary" size="small" leadingIcon={<Icon icon={faPlus} size="small" />}>
                Deposit
              </DSButton>
              <DSButton variant="secondary" size="small" trailingIcon={<Icon icon={faChevronDown} size="small" />}>
                Transfer
              </DSButton>
            </div>
          </div>

          {/* Account Type Info */}
          <div className="flex items-center gap-8" style={{ padding: '0 24px' }}>
            <div className="flex flex-col gap-1">
              <span className="text-label" style={{ color: 'var(--ds-text-tertiary)' }}>
                Type
              </span>
              <span className="text-body" style={{ color: 'var(--ds-text-default)' }}>
                {account.type === 'checking' ? 'Checking' : account.type === 'savings' ? 'Savings' : account.type}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-label" style={{ color: 'var(--ds-text-tertiary)' }}>
                Current
              </span>
              <span className="text-body" style={{ color: 'var(--ds-text-default)' }}>
                ${balanceParts.dollars}.{balanceParts.cents}
              </span>
            </div>
          </div>

          {/* Auto Transfer Link */}
          <div style={{ padding: 24, paddingTop: 16 }}>
            <Link
              to="#"
              className="flex items-center gap-1 text-body"
              style={{ color: 'var(--ds-text-primary)' }}
            >
              <span>Set up an auto transfer rule</span>
              <Icon icon={faChevronRight} size="small" />
            </Link>
          </div>
        </div>

        {/* Account Info Card */}
        <div
          className="flex flex-col rounded-lg"
          style={{
            width: 340,
            border: '1px solid var(--color-border-default)',
            backgroundColor: 'var(--ds-bg-default)',
            padding: 24,
          }}
        >
          {/* Routing Number */}
          <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
            <span className="text-body" style={{ color: 'var(--ds-text-secondary)' }}>
              Routing number
            </span>
            <div className="flex items-center gap-2">
              <span className="text-body" style={{ color: 'var(--ds-text-default)' }}>
                {metadata.routingNumber}
              </span>
              <CopyButton value={metadata.routingNumber} />
            </div>
          </div>

          {/* Account Number */}
          <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
            <div className="flex items-center gap-1">
              <span className="text-body" style={{ color: 'var(--ds-text-secondary)' }}>
                Account number
              </span>
              <button
                onClick={() => setShowAccountNumber(!showAccountNumber)}
                className="flex items-center justify-center"
                style={{ 
                  color: 'var(--ds-icon-secondary)',
                  background: 'transparent',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                }}
              >
                <Icon icon={showAccountNumber ? faEyeSlash : faEye} size="small" />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-body" style={{ color: 'var(--ds-text-default)' }}>
                {showAccountNumber ? `${metadata.routingNumber}${metadata.accountNumber}` : `••••••${metadata.accountNumber}`}
              </span>
              <CopyButton value={`${metadata.routingNumber}${metadata.accountNumber}`} />
            </div>
          </div>

          {/* Bank Name */}
          <div className="flex items-start justify-between" style={{ marginBottom: 12 }}>
            <div className="flex items-center gap-1">
              <span className="text-body" style={{ color: 'var(--ds-text-secondary)' }}>
                Bank
              </span>
              <Icon icon={faCircleInfo} size="small" style={{ color: 'var(--ds-icon-tertiary)' }} />
            </div>
            <div className="flex flex-col items-end gap-1">
              <div className="flex items-center gap-2">
                <span className="text-body" style={{ color: 'var(--ds-text-default)' }}>
                  {metadata.bankName}
                </span>
                <CopyButton value={metadata.bankName} />
              </div>
              {metadata.bankAddress.map((line, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-body" style={{ color: 'var(--ds-text-default)' }}>
                    {line}
                  </span>
                  {idx === metadata.bankAddress.length - 1 && (
                    <CopyButton value={metadata.bankAddress.join(', ')} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Documents Dropdown */}
          <div style={{ marginTop: 'auto', paddingTop: 16 }}>
            <button
              className="flex items-center justify-between w-full text-body"
              style={{ 
                color: 'var(--ds-text-default)',
                background: 'transparent',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
              }}
            >
              <span>Documents</span>
              <Icon icon={faChevronDown} size="small" style={{ color: 'var(--ds-icon-secondary)' }} />
            </button>
          </div>
        </div>
      </div>

      {/* Recent Transactions Section */}
      <div className="flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-4" style={{ marginBottom: 16 }}>
          <h2 className="text-title-secondary">Recent transactions</h2>
          <Link
            to="/transactions"
            className="flex items-center gap-1 text-body"
            style={{ color: 'var(--ds-text-primary)' }}
          >
            <span>View all</span>
            <Icon icon={faChevronRight} size="small" />
          </Link>
        </div>

        {/* Transactions Table */}
        <DSTable
          columns={columns}
          data={tableData}
          getRowKey={(row) => row.id}
          variant="centered"
          emptyMessage="No recent transactions"
        />
      </div>
    </div>
  );
}

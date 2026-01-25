import type { TransactionTableMetadata, TransactionTableRow } from '@/chat/types';

interface TransactionTableProps {
  data: TransactionTableMetadata;
  className?: string;
}

/**
 * Format currency value for display
 */
function formatCurrency(value: number): string {
  const absValue = Math.abs(value);
  const formatted = absValue.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return value < 0 ? `-$${formatted}` : `$${formatted}`;
}

/**
 * Format date for display
 */
function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/**
 * TransactionTable - Tabular display of transactions
 * Shows counterparty, amount, date, and optional category
 */
export function TransactionTable({ 
  data, 
  className = '' 
}: TransactionTableProps) {
  return (
    <div className={`chat-transaction-table ${className}`}>
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
            <th className="text-tiny" style={{ color: 'var(--ds-text-secondary)' }}>
              Counterparty
            </th>
            <th className="text-tiny" style={{ color: 'var(--ds-text-secondary)', textAlign: 'right' }}>
              Amount
            </th>
            <th className="text-tiny" style={{ color: 'var(--ds-text-secondary)' }}>
              Date
            </th>
            {data.showCategory && (
              <th className="text-tiny" style={{ color: 'var(--ds-text-secondary)' }}>
                Category
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {data.rows.map((row: TransactionTableRow) => (
            <tr key={row.id}>
              <td>
                <a 
                  href={row.dashboardLink} 
                  className="chat-table-link text-body-sm"
                  style={{ color: 'var(--ds-text-default)' }}
                >
                  {row.counterparty}
                </a>
              </td>
              <td 
                className="text-body-sm"
                style={{ 
                  textAlign: 'right',
                  fontVariantNumeric: 'tabular-nums',
                  color: row.amount < 0 ? 'var(--ds-text-default)' : 'var(--color-success)',
                }}
              >
                {formatCurrency(row.amount)}
              </td>
              <td 
                className="text-body-sm"
                style={{ color: 'var(--ds-text-secondary)' }}
              >
                {formatDate(row.date)}
              </td>
              {data.showCategory && row.category && (
                <td className="text-body-sm" style={{ color: 'var(--ds-text-secondary)' }}>
                  {row.category}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

import type { TransactionTableMetadata, TransactionTableRow } from '@/chat/types';

interface TransactionTableProps {
  data: TransactionTableMetadata;
  context?: 'rhc' | 'command';
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
 * Supports compact mode for RHC panel
 */
export function TransactionTable({ 
  data, 
  context = 'rhc',
  className = '' 
}: TransactionTableProps) {
  const isCompact = context === 'rhc';
  // Hide category column in compact mode
  const showCategory = data.showCategory && !isCompact;
  
  return (
    <div className={`chat-transaction-table ${isCompact ? 'chat-transaction-table--compact' : ''} ${className}`}>
      {data.title && (
        <h4 className="text-label-demi chat-table__title">
          {data.title}
        </h4>
      )}
      
      <table className="chat-table">
        <thead>
          <tr>
            <th className={isCompact ? 'text-micro' : 'text-tiny'}>
              Counterparty
            </th>
            <th className={isCompact ? 'text-micro' : 'text-tiny'} style={{ textAlign: 'right' }}>
              Amount
            </th>
            <th className={isCompact ? 'text-micro' : 'text-tiny'}>
              Date
            </th>
            {showCategory && (
              <th className="text-tiny">
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
                  className={`chat-table-link ${isCompact ? 'text-label' : 'text-body-sm'}`}
                >
                  {row.counterparty}
                </a>
              </td>
              <td 
                className={`chat-table__amount ${isCompact ? 'text-label' : 'text-body-sm'} ${row.amount >= 0 ? 'chat-table__amount--positive' : ''}`}
              >
                {formatCurrency(row.amount)}
              </td>
              <td className={`chat-table__date ${isCompact ? 'text-label' : 'text-body-sm'}`}>
                {formatDate(row.date)}
              </td>
              {showCategory && row.category && (
                <td className="text-body-sm chat-table__category">
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

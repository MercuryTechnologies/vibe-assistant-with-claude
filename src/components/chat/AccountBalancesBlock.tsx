import type { AccountBalancesMetadata } from '@/chat/types';
import { DSMoneyAmount } from '@/components/ui/ds-money-amount';

interface AccountBalancesBlockProps {
  data: AccountBalancesMetadata;
  context?: 'rhc' | 'command';
  className?: string;
}

/**
 * AccountBalancesBlock - Displays account balances in chat
 */
export function AccountBalancesBlock({ 
  data, 
  context = 'rhc',
  className = '' 
}: AccountBalancesBlockProps) {
  const isCompact = context === 'rhc';
  
  return (
    <div className={`chat-account-balances ${className}`} style={{ marginTop: 12 }}>
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
              Account
            </th>
            {!isCompact && (
              <th className="text-tiny" style={{ color: 'var(--ds-text-secondary)' }}>
                Type
              </th>
            )}
            <th className="text-tiny" style={{ color: 'var(--ds-text-secondary)', textAlign: 'right' }}>
              Balance
            </th>
          </tr>
        </thead>
        <tbody>
          {data.accounts.map((account) => (
            <tr key={account.id}>
              <td>
                <span className="text-body-sm" style={{ color: 'var(--ds-text-default)' }}>
                  {account.name}
                </span>
                {isCompact && (
                  <span className="text-tiny" style={{ color: 'var(--ds-text-tertiary)', display: 'block' }}>
                    {account.type}
                  </span>
                )}
              </td>
              {!isCompact && (
                <td className="text-body-sm" style={{ color: 'var(--ds-text-secondary)', textTransform: 'capitalize' }}>
                  {account.type}
                </td>
              )}
              <td style={{ textAlign: 'right' }}>
                <DSMoneyAmount 
                  value={account.balance} 
                  size="sm"
                  showPositive={false}
                />
              </td>
            </tr>
          ))}
          {data.totalBalance !== undefined && (
            <tr style={{ borderTop: '2px solid var(--color-border-default)' }}>
              <td colSpan={isCompact ? 1 : 2}>
                <span className="text-body-sm-demi" style={{ color: 'var(--ds-text-default)' }}>
                  Total
                </span>
              </td>
              <td style={{ textAlign: 'right' }}>
                <DSMoneyAmount 
                  value={data.totalBalance} 
                  size="sm"
                  showPositive={false}
                />
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

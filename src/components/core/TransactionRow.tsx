import { Badge } from '@/components/ui/badge';
import type { Transaction } from '@/types';

interface TransactionRowProps {
  transaction: Transaction;
}

export function TransactionRow({ transaction }: TransactionRowProps) {
  const formatCurrency = (amount: number) => {
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(Math.abs(amount));
    return amount >= 0 ? `+${formatted}` : `-${formatted}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="flex items-center justify-between py-3 border-b border-border last:border-0">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
          <span className="text-label-demi text-muted-foreground">
            {transaction.merchant[0]}
          </span>
        </div>
        <div>
          <p className="text-label-demi">{transaction.description}</p>
          <p className="text-tiny text-muted-foreground">{transaction.merchant}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Badge type="neutral">
          {transaction.category}
        </Badge>
        <div className="text-right">
          <p
            className="text-label-demi"
            style={{
              color:
                transaction.amount >= 0 ? "var(--color-success)" : "var(--color-text-primary)",
            }}
          >
            {formatCurrency(transaction.amount)}
          </p>
          <p className="text-tiny text-muted-foreground">{formatDate(transaction.date)}</p>
        </div>
      </div>
    </div>
  );
}


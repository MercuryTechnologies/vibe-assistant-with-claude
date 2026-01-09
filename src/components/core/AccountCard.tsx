import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Account } from '@/types';

interface AccountCardProps {
  account: Account;
  onClick?: () => void;
}

export function AccountCard({ account, onClick }: AccountCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: account.currency,
    }).format(amount);
  };

  return (
    <Card
      className="ds-account-card"
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-label-demi text-muted-foreground">
          {account.name}
        </CardTitle>
        <Badge type={account.type === 'treasury' ? 'highlight' : 'pearl'}>
          {account.type}
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="text-title-main">{formatCurrency(account.balance)}</div>
        <p className="text-tiny text-muted-foreground mt-1">
          {account.accountNumber}
        </p>
        {account.apy && (
          <p className="text-tiny mt-2" style={{ color: "var(--color-success)" }}>
            {account.apy}% APY
          </p>
        )}
      </CardContent>
    </Card>
  );
}


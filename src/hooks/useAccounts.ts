import { useState, useEffect, useMemo } from 'react';
import type { Account } from '@/types';
import accountsData from '@/data/accounts.json';

export function useAccounts() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API delay for realistic feel
    const timer = setTimeout(() => {
      setAccounts(accountsData.accounts as Account[]);
      setIsLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Calculate total balance from actual account data
  const totalBalance = useMemo(() => {
    return accounts.reduce((sum, acc) => sum + acc.balance, 0);
  }, [accounts]);

  const getAccountById = (id: string) => accounts.find((acc) => acc.id === id);

  return {
    accounts,
    totalBalance,
    getAccountById,
    isLoading,
  };
}


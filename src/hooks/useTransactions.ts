import { useState, useEffect, useMemo } from 'react';
import type { Transaction } from '@/types';
import transactionsData from '@/data/transactions.json';

export function useTransactions(accountId?: string) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API delay for realistic feel
    const timer = setTimeout(() => {
      setTransactions(transactionsData.transactions as Transaction[]);
      setIsLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const filteredTransactions = useMemo(() => {
    if (!accountId) return transactions;
    return transactions.filter((txn) => txn.accountId === accountId);
  }, [transactions, accountId]);

  const recentTransactions = useMemo(() => {
    return [...filteredTransactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [filteredTransactions]);

  return {
    transactions: filteredTransactions,
    recentTransactions,
    isLoading,
  };
}


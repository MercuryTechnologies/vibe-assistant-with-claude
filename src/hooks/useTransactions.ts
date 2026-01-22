import { useState, useEffect, useMemo } from 'react';
import type { Transaction } from '@/types';
import transactionsData from '@/data/transactions.json';
import { getGeneratedTransactions, onTransactionUpdate } from '@/lib/transaction-generator';

export function useTransactions(accountId?: string) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadTransactions = () => {
    const generated = getGeneratedTransactions();
    const dataToUse = generated || (transactionsData.transactions as Transaction[]);
    setTransactions(dataToUse);
    setIsLoading(false);
  };

  useEffect(() => {
    // Simulate API delay for realistic feel
    const timer = setTimeout(() => {
      loadTransactions();
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Listen for transaction updates
  useEffect(() => {
    const unsubscribe = onTransactionUpdate(() => {
      loadTransactions();
    });
    return unsubscribe;
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


import { useState, useEffect, useMemo } from 'react';
import type { Account } from '@/types';
import accountsData from '@/data/accounts.json';
import { useDataSettings } from '@/context/DataContext';

export function useAccounts() {
  const [baseAccounts, setBaseAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Get dynamic balance from DataContext
  const { settings, getAccountBalances } = useDataSettings();

  useEffect(() => {
    // Simulate API delay for realistic feel
    const timer = setTimeout(() => {
      setBaseAccounts(accountsData.accounts as Account[]);
      setIsLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Override account balances with data from context
  const accounts = useMemo(() => {
    const dynamicBalances = getAccountBalances();
    
    return baseAccounts.map(account => {
      // Try to match by id or name pattern
      const dynamicAccount = dynamicBalances.find(da => 
        account.id === da.id || 
        account.name.toLowerCase().includes(da.name.split(' ')[0].toLowerCase())
      );
      
      if (dynamicAccount) {
        return { ...account, balance: dynamicAccount.balance };
      }
      
      // Fallback: distribute remaining balance proportionally
      return account;
    });
  }, [baseAccounts, getAccountBalances]);

  // Use the total balance from settings
  const totalBalance = settings.totalBalance;

  const getAccountById = (id: string) => accounts.find((acc) => acc.id === id);

  return {
    accounts,
    totalBalance,
    getAccountById,
    isLoading,
  };
}


import { useState, useEffect, useMemo } from 'react';
import type { Card } from '@/types';
import cardsData from '@/data/cards.json';
import { useTransactions } from './useTransactions';
import { getCardSpendingThisMonth } from '@/lib/data-helpers';

export interface CardWithSpending extends Card {
  spentThisMonth: number;
  card: string; // Formatted card number for display (e.g., "•••• 4521")
  account: string; // Account name for display
}

// Map accountId to display name
const accountNames: Record<string, string> = {
  'checking-0297': 'Checking',
  'ops-payroll': 'Ops / Payroll',
  'ap': 'AP',
  'ar': 'AR',
  'savings-7658': 'Savings',
  'treasury': 'Treasury',
};

export function useCards() {
  const [cards, setCards] = useState<Card[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { transactions } = useTransactions();

  useEffect(() => {
    // Simulate API delay for realistic feel
    const timer = setTimeout(() => {
      setCards(cardsData.cards as Card[]);
      setIsLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Enrich cards with spending data calculated from transactions
  const cardsWithSpending: CardWithSpending[] = useMemo(() => {
    return cards.map(card => ({
      ...card,
      spentThisMonth: getCardSpendingThisMonth(card.id, transactions),
      card: `•••• ${card.cardNumber}`,
      account: accountNames[card.accountId] || card.accountId,
    }));
  }, [cards, transactions]);

  // Get a specific card by ID
  const getCard = (cardId: string): CardWithSpending | undefined => {
    return cardsWithSpending.find(c => c.id === cardId);
  };

  // Get cards for a specific cardholder
  const getCardsByCardholder = (cardholder: string): CardWithSpending[] => {
    return cardsWithSpending.filter(c => 
      c.cardholder.toLowerCase().includes(cardholder.toLowerCase())
    );
  };

  // Get total spending across all cards
  const totalSpending = useMemo(() => {
    return cardsWithSpending.reduce((sum, c) => sum + c.spentThisMonth, 0);
  }, [cardsWithSpending]);

  return {
    cards: cardsWithSpending,
    isLoading,
    getCard,
    getCardsByCardholder,
    totalSpending,
  };
}

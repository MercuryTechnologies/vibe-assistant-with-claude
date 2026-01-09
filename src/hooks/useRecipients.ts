import { useState, useEffect } from 'react';
import type { Recipient } from '@/types';
import recipientsData from '@/data/recipients.json';

export function useRecipients() {
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API delay for realistic feel
    const timer = setTimeout(() => {
      setRecipients(recipientsData.recipients as Recipient[]);
      setIsLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return {
    recipients,
    isLoading,
  };
}

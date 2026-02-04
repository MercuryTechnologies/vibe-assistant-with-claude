/**
 * Convert transaction data into a numeric seed for the random generator
 */

import type { Transaction } from '@/types';

/**
 * Simple string hash function (djb2 algorithm)
 */
function hashString(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) ^ str.charCodeAt(i);
  }
  return hash >>> 0; // Ensure unsigned
}

/**
 * Converts an array of transactions into a single numeric seed
 * Combines amounts, dates, categories, and merchant names
 * 
 * @param transactions - Array of transactions (expects up to 10)
 * @returns A numeric seed value
 */
export function transactionsToSeed(transactions: Transaction[]): number {
  if (transactions.length === 0) {
    return Date.now(); // Fallback to current time if no transactions
  }

  // Combine various transaction properties into a string
  const dataPoints: string[] = [];

  for (const txn of transactions) {
    // Amount (use absolute value and multiply to get more variation)
    dataPoints.push(Math.abs(txn.amount * 100).toFixed(0));
    
    // Date
    dataPoints.push(txn.date);
    
    // Category
    dataPoints.push(txn.category || 'unknown');
    
    // Merchant name
    dataPoints.push(txn.merchant || txn.description || 'unknown');
    
    // Transaction type
    dataPoints.push(txn.type);
  }

  // Join all data points and hash
  const combinedString = dataPoints.join('|');
  return hashString(combinedString);
}

/**
 * Extract meaningful parameters from transactions for art generation
 */
export interface TransactionAnalysis {
  totalAmount: number;
  averageAmount: number;
  categoryDistribution: Record<string, number>;
  dateSpreadDays: number;
  transactionCount: number;
  dominantCategory: string;
  isNetPositive: boolean;
}

export function analyzeTransactions(transactions: Transaction[]): TransactionAnalysis {
  if (transactions.length === 0) {
    return {
      totalAmount: 0,
      averageAmount: 0,
      categoryDistribution: {},
      dateSpreadDays: 0,
      transactionCount: 0,
      dominantCategory: 'Other',
      isNetPositive: true,
    };
  }

  // Calculate total and average
  const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);
  const averageAmount = totalAmount / transactions.length;

  // Category distribution
  const categoryDistribution: Record<string, number> = {};
  for (const txn of transactions) {
    const cat = txn.category || 'Other';
    categoryDistribution[cat] = (categoryDistribution[cat] || 0) + Math.abs(txn.amount);
  }

  // Find dominant category
  let dominantCategory = 'Other';
  let maxAmount = 0;
  for (const [cat, amount] of Object.entries(categoryDistribution)) {
    if (amount > maxAmount) {
      maxAmount = amount;
      dominantCategory = cat;
    }
  }

  // Date spread
  const dates = transactions.map(t => new Date(t.date).getTime());
  const minDate = Math.min(...dates);
  const maxDate = Math.max(...dates);
  const dateSpreadDays = Math.ceil((maxDate - minDate) / (1000 * 60 * 60 * 24));

  return {
    totalAmount: Math.abs(totalAmount),
    averageAmount: Math.abs(averageAmount),
    categoryDistribution,
    dateSpreadDays,
    transactionCount: transactions.length,
    dominantCategory,
    isNetPositive: totalAmount >= 0,
  };
}

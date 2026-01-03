import React, { useState, useEffect } from 'react';
import { type Transaction } from './mockData';
import { getLegacyTransactions } from '../shared/mockData';

// Sample data pools for generating variety
const merchants = [
  { name: 'Mercury Working Capital', initials: 'M', icon: 'mercury' },
  { name: 'Payment from NASA', initials: 'P' },
  { name: 'Payment from Acme Corp', initials: 'P' },
  { name: 'Stripe', initials: 'S' },
  { name: 'AWS', initials: 'AW' },
  { name: 'Google Cloud', initials: 'GC' },
  { name: "Lily's Eatery", initials: 'LE' },
  { name: 'Deli 77', initials: 'D7' },
  { name: 'Office Stop Co.', initials: 'OS' },
  { name: "Trader John's", initials: 'TJ' },
  { name: 'Milgram Brokerage', initials: 'MB' },
  { name: 'Monarch Books', initials: 'MB' },
  { name: 'The Plant Organic Cafe', initials: 'P' },
  { name: 'Shopify', initials: 'SH' },
  { name: 'Slack Technologies', initials: 'SL' },
  { name: 'Figma Inc', initials: 'FI' },
  { name: 'Notion Labs', initials: 'NL' },
  { name: 'Vercel', initials: 'V' },
  { name: 'GitHub', initials: 'GH' },
  { name: 'Linear', initials: 'LN' },
];

const accounts = ['Ops / Payroll', 'AR', 'Credit account', 'Treasury', 'Savings'];

const methodTypes: Array<Transaction['method']> = [
  { type: 'loan', direction: 'out' },
  { type: 'invoice', direction: 'in' },
  { type: 'invoice', direction: 'out' },
  { type: 'transfer', direction: 'in' },
  { type: 'transfer', direction: 'out' },
  { type: 'card', cardLast4: '1234', cardHolder: 'Jane B.' },
  { type: 'card', cardLast4: '5555', cardHolder: 'Jane B.' },
  { type: 'card', cardLast4: '4929', cardHolder: 'Landon S.' },
  { type: 'card', cardLast4: '9914', cardHolder: 'Jessica A.' },
  { type: 'card', cardLast4: '0331', cardHolder: 'Landon S.' },
  { type: 'card', cardLast4: '2345', cardHolder: 'Jane B.' },
  { type: 'card', cardLast4: '7840', cardHolder: 'Aluna T.' },
];

const categories = [
  '',
  'Bank Fees',
  'Business Meals',
  'COGS',
  'Credit & Loan Payments',
  'Employee Benefits',
  'Entertainment',
  'Financing Proceeds',
  'Insurance',
  'Interest Earned',
  'Inventory & Materials',
  'Legal & Professional Services',
  'Marketing & Advertising',
  'Office Supplies & Equipment',
  'Payment Processing Fees',
  'Payroll',
  'Rent & Utilities',
  'Revenue',
  'Shipping & Postage',
  'Software & Subscriptions',
  'Taxes',
  'Transfer',
  'Travel & Transportation',
];

// Reference date for data generation - use current date
const getReferenceDate = (): Date => new Date();

// Generate dates spanning 24 months back from current date
const generateDateRange = (): string[] => {
  const dates: string[] = [];
  const endDate = getReferenceDate();
  const startDate = new Date(endDate);
  startDate.setMonth(startDate.getMonth() - 24); // Go back 24 months
  startDate.setDate(1); // Start from beginning of that month
  
  // Generate one date per day for the entire range
  const currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    // Store as ISO date string (YYYY-MM-DD)
    dates.push(currentDate.toISOString().split('T')[0]);
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return dates;
};

// Regenerate dates on each call to ensure freshness
const getAllDates = (): string[] => generateDateRange();

// Helper to format ISO date for display
export const formatDateForDisplay = (isoDate: string): string => {
  const date = new Date(isoDate);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export interface DataControlSettings {
  transactionCount: number;
  minAmount: number;
  maxAmount: number;
  includeNegative: boolean;
  negativeRatio: number; // 0-100 percentage of negative transactions
  merchantVariety: number; // 1-20 number of unique merchants
  accountVariety: number; // 1-5 number of unique accounts
  methodVariety: number; // 1-12 number of unique methods
  includeCategories: boolean;
  categoryRatio: number; // 0-100 percentage of transactions with categories
  autoAppliedRatio: number; // 0-100 percentage of categorized transactions that are auto-applied
  includeFailed: boolean;
  failedRatio: number; // 0-20 percentage of failed transactions
}

const defaultSettings: DataControlSettings = {
  transactionCount: 800, // Plenty of data for 24 months - about 1 transaction per day
  minAmount: 1,
  maxAmount: 60000,
  includeNegative: true,
  negativeRatio: 40,
  merchantVariety: 15,
  accountVariety: 4,
  methodVariety: 8,
  includeCategories: true,
  categoryRatio: 40,
  autoAppliedRatio: 60,
  includeFailed: true,
  failedRatio: 3,
};

// Maximum transactions per day (increased for longer date range)
const MAX_TRANSACTIONS_PER_DAY = 5;

// Generate random transactions based on settings
// Dates are in ISO format (YYYY-MM-DD) spanning 24 months back from current date
export const generateTransactions = (settings: DataControlSettings): Transaction[] => {
  const transactions: Transaction[] = [];
  const allDates = getAllDates(); // Get fresh date range based on current date
  
  // Select merchants based on variety setting
  const selectedMerchants = merchants.slice(0, Math.min(settings.merchantVariety, merchants.length));
  const selectedAccounts = accounts.slice(0, Math.min(settings.accountVariety, accounts.length));
  const selectedMethods = methodTypes.slice(0, Math.min(settings.methodVariety, methodTypes.length));
  
  // Track transactions per date to limit to MAX_TRANSACTIONS_PER_DAY
  const dateCount: Record<string, number> = {};
  allDates.forEach(d => { dateCount[d] = 0; });
  
  // Get available dates (those with fewer than MAX_TRANSACTIONS_PER_DAY)
  const getAvailableDates = (): string[] => {
    return allDates.filter(d => dateCount[d] < MAX_TRANSACTIONS_PER_DAY);
  };
  
  for (let i = 0; i < settings.transactionCount; i++) {
    const merchant = selectedMerchants[Math.floor(Math.random() * selectedMerchants.length)];
    const account = selectedAccounts[Math.floor(Math.random() * selectedAccounts.length)];
    const method = { ...selectedMethods[Math.floor(Math.random() * selectedMethods.length)] };
    
    // Pick a date from available dates (those with < MAX_TRANSACTIONS_PER_DAY)
    const availableDates = getAvailableDates();
    let date: string;
    if (availableDates.length === 0) {
      // All dates are full, just use a random date
      date = allDates[Math.floor(Math.random() * allDates.length)];
    } else {
      date = availableDates[Math.floor(Math.random() * availableDates.length)];
    }
    dateCount[date]++;
    
    // Generate amount
    let amount = Math.random() * (settings.maxAmount - settings.minAmount) + settings.minAmount;
    amount = Math.round(amount * 100) / 100; // Round to 2 decimal places
    
    // Determine if negative
    if (settings.includeNegative && Math.random() * 100 < settings.negativeRatio) {
      amount = -amount;
    }
    
    // Determine status
    let status: 'completed' | 'failed' | 'pending' = 'completed';
    if (settings.includeFailed && Math.random() * 100 < settings.failedRatio) {
      status = 'failed';
    }
    
    // Random category with auto-applied flag
    let glCode: string | undefined;
    let glCodeAutoApplied = false;
    
    if (settings.includeCategories && Math.random() * 100 < settings.categoryRatio) {
      // Pick a non-empty category
      const nonEmptyCategories = categories.filter(c => c);
      glCode = nonEmptyCategories[Math.floor(Math.random() * nonEmptyCategories.length)];
      
      // Determine if this category was auto-applied
      if (glCode && Math.random() * 100 < settings.autoAppliedRatio) {
        glCodeAutoApplied = true;
      }
    }
    
    // Random attachment
    const hasAttachment = Math.random() > 0.9;
    
    transactions.push({
      id: `gen-${i}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      date, // ISO format: YYYY-MM-DD
      toFrom: merchant,
      amount,
      account,
      method,
      glCode: glCode || undefined,
      glCodeAutoApplied: glCode ? glCodeAutoApplied : undefined,
      hasAttachment,
      status,
    });
  }
  
  // Sort transactions by date descending (newest first)
  // ISO date strings sort correctly with string comparison
  transactions.sort((a, b) => b.date.localeCompare(a.date));
  
  return transactions;
};

// Generate initial transactions for app startup
// Uses the shared mock data as the single source of truth
export const generateInitialTransactions = (): Transaction[] => {
  // Return transactions from the shared mock data
  // This ensures consistency between the chat agent and the UI
  return getLegacyTransactions();
};

interface DataControlPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (transactions: Transaction[]) => void;
  currentCount: number;
  showGradientPlayground?: boolean;
  onToggleGradientPlayground?: (show: boolean) => void;
}

const DataControlPanel: React.FC<DataControlPanelProps> = ({ 
  isOpen, 
  onClose, 
  onApply, 
  currentCount,
  showGradientPlayground = false,
  onToggleGradientPlayground
}) => {
  const [settings, setSettings] = useState<DataControlSettings>({
    ...defaultSettings,
    transactionCount: currentCount,
  });
  
  const [previewCount, setPreviewCount] = useState(0);
  
  useEffect(() => {
    // Update preview count when settings change
    setPreviewCount(settings.transactionCount);
  }, [settings.transactionCount]);

  const handleChange = <K extends keyof DataControlSettings>(key: K, value: DataControlSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleApply = () => {
    const newTransactions = generateTransactions(settings);
    onApply(newTransactions);
    onClose();
  };

  const handleReset = () => {
    setSettings({ ...defaultSettings, transactionCount: currentCount });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-start p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in slide-in-from-bottom-4 duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-indigo-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </div>
              <div>
                <h2 className="text-base font-semibold text-gray-900">Data Controls</h2>
                <p className="text-xs text-gray-500">Customize transaction data</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Body - Scrollable */}
        <div className="px-5 py-4 max-h-[60vh] overflow-y-auto space-y-5">
          {/* Transaction Count */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">Number of Transactions</label>
              <span className="text-sm font-semibold text-indigo-600">{settings.transactionCount}</span>
            </div>
            <input
              type="range"
              min="10"
              max="500"
              value={settings.transactionCount}
              onChange={(e) => handleChange('transactionCount', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>10</span>
              <span>250</span>
              <span>500</span>
            </div>
          </div>

          {/* Amount Range */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">Amount Range</label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Min ($)</label>
                <input
                  type="number"
                  min="0"
                  max={settings.maxAmount - 1}
                  value={settings.minAmount}
                  onChange={(e) => handleChange('minAmount', Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full h-9 px-3 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Max ($)</label>
                <input
                  type="number"
                  min={settings.minAmount + 1}
                  max="1000000"
                  value={settings.maxAmount}
                  onChange={(e) => handleChange('maxAmount', Math.max(settings.minAmount + 1, parseInt(e.target.value) || 0))}
                  className="w-full h-9 px-3 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Negative Transactions */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">Include Negative Amounts</label>
              <button
                onClick={() => handleChange('includeNegative', !settings.includeNegative)}
                className={`w-10 h-6 rounded-full transition-colors ${settings.includeNegative ? 'bg-indigo-600' : 'bg-gray-200'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform ${settings.includeNegative ? 'translate-x-5' : 'translate-x-1'}`} />
              </button>
            </div>
            {settings.includeNegative && (
              <div className="mt-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-500">Negative ratio</span>
                  <span className="text-xs font-medium text-gray-700">{settings.negativeRatio}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.negativeRatio}
                  onChange={(e) => handleChange('negativeRatio', parseInt(e.target.value))}
                  className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>
            )}
          </div>

          {/* Data Variety */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700 block">Data Variety</label>
            
            {/* Merchant Variety */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-500">Unique merchants</span>
                <span className="text-xs font-medium text-gray-700">{settings.merchantVariety}</span>
              </div>
              <input
                type="range"
                min="1"
                max="20"
                value={settings.merchantVariety}
                onChange={(e) => handleChange('merchantVariety', parseInt(e.target.value))}
                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>

            {/* Account Variety */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-500">Unique accounts</span>
                <span className="text-xs font-medium text-gray-700">{settings.accountVariety}</span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                value={settings.accountVariety}
                onChange={(e) => handleChange('accountVariety', parseInt(e.target.value))}
                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>

            {/* Method Variety */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-500">Unique payment methods</span>
                <span className="text-xs font-medium text-gray-700">{settings.methodVariety}</span>
              </div>
              <input
                type="range"
                min="1"
                max="12"
                value={settings.methodVariety}
                onChange={(e) => handleChange('methodVariety', parseInt(e.target.value))}
                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>
          </div>

          {/* Additional Options */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700 block">Additional Options</label>
            
            {/* Include Categories */}
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Include categories</span>
                <button
                  onClick={() => handleChange('includeCategories', !settings.includeCategories)}
                  className={`w-10 h-6 rounded-full transition-colors ${settings.includeCategories ? 'bg-indigo-600' : 'bg-gray-200'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform ${settings.includeCategories ? 'translate-x-5' : 'translate-x-1'}`} />
                </button>
              </div>
              {settings.includeCategories && (
                <div className="mt-3 space-y-3 pl-3 border-l-2 border-indigo-100">
                  {/* Category Ratio */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-400">Transactions with categories</span>
                      <span className="text-xs font-medium text-gray-600">{settings.categoryRatio}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={settings.categoryRatio}
                      onChange={(e) => handleChange('categoryRatio', parseInt(e.target.value))}
                      className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                  </div>
                  
                  {/* Auto-Applied Ratio */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-gray-400">Auto-applied categories</span>
                        <svg 
                          className="w-3.5 h-3.5 text-indigo-500" 
                          viewBox="0 0 24 24" 
                          fill="currentColor"
                          aria-label="Categories automatically suggested by the system"
                        >
                          <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                        </svg>
                      </div>
                      <span className="text-xs font-medium text-gray-600">{settings.autoAppliedRatio}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={settings.autoAppliedRatio}
                      onChange={(e) => handleChange('autoAppliedRatio', parseInt(e.target.value))}
                      className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                    <p className="text-[10px] text-gray-400 mt-1">
                      % of categorized transactions marked as auto-suggested
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Include Failed */}
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Include failed transactions</span>
                <button
                  onClick={() => handleChange('includeFailed', !settings.includeFailed)}
                  className={`w-10 h-6 rounded-full transition-colors ${settings.includeFailed ? 'bg-indigo-600' : 'bg-gray-200'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform ${settings.includeFailed ? 'translate-x-5' : 'translate-x-1'}`} />
                </button>
              </div>
              {settings.includeFailed && (
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-400">Failed ratio</span>
                    <span className="text-xs font-medium text-gray-600">{settings.failedRatio}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    value={settings.failedRatio}
                    onChange={(e) => handleChange('failedRatio', parseInt(e.target.value))}
                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Display Options */}
          {onToggleGradientPlayground && (
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700 block">Display Options</label>
              
              {/* Gradient Playground Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-gray-500">Show Gradient Playground</span>
                  <p className="text-[10px] text-gray-400">Customize chart bar gradients</p>
                </div>
                <button
                  onClick={() => onToggleGradientPlayground(!showGradientPlayground)}
                  className={`w-10 h-6 rounded-full transition-colors ${showGradientPlayground ? 'bg-indigo-600' : 'bg-gray-200'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform ${showGradientPlayground ? 'translate-x-5' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="px-5 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
          <button
            onClick={handleReset}
            className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Reset to Default
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Generate Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Floating trigger button component
export const DataControlTrigger: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <button
    onClick={onClick}
    className="fixed bottom-6 left-6 z-40 w-12 h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center group"
    title="Data Controls"
  >
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
    </svg>
    <span className="absolute left-full ml-3 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
      Data Controls
    </span>
  </button>
);

export default DataControlPanel;

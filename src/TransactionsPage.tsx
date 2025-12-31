import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  TransactionsFilterBar,
  TransactionsSummary,
  TransactionsCharts,
  TransactionsTable,
  TransactionsDetailPanel,
  SettingsModal,
  defaultPageSettings,
  type Transaction,
  type PageSettings,
  type CategoryRule,
  type LineChartHoverData,
  type GroupByOption,
  type AmountFilterValue,
  type DateShortcut,
} from './transactions';
import { useAppStore } from './store';
import { filterTransactionsByDateRange, dateShortcutToRange, customDateRangeToRange } from './utils';

interface TransactionsPageProps {
  urlFilter?: string  // Filter from URL query param (e.g., 'wire')
}

const TransactionsPage: React.FC<TransactionsPageProps> = ({ urlFilter }) => {
  // Page settings state
  const [settings, setSettings] = useState<PageSettings>(defaultPageSettings);
  const [isChartsExpanded, setIsChartsExpanded] = useState(settings.showChartsExpanded);
  
  // Modals state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // Highlighted rule state (for navigating directly to a rule in settings)
  const [highlightedRuleId, setHighlightedRuleId] = useState<string | null>(null);
  
  // Track if we've applied the initial URL filter
  const [initialFilterApplied, setInitialFilterApplied] = useState(false);
  
  // Get transactions from shared store
  const allTransactions = useAppStore((s) => s.transactions);
  const updateTransaction = useAppStore((s) => s.updateTransaction);
  const committedTimeRange = useAppStore((s) => s.timeRange);
  
  // Filter transactions by the shared time range
  const transactions = useMemo(() => {
    return filterTransactionsByDateRange(allTransactions, committedTimeRange);
  }, [allTransactions, committedTimeRange]);
  
  // Rules state (lifted from table to share with settings)
  const [rules, setRules] = useState<CategoryRule[]>([]);

  // Scatter plot interaction state
  const [hoveredTransactionId, setHoveredTransactionId] = useState<string | null>(null);
  const [clickedTransactionId, setClickedTransactionId] = useState<string | null>(null);
  const [scrollToTransactionId, setScrollToTransactionId] = useState<string | null>(null);
  
  // Line chart hover state
  const [lineChartHoverData, setLineChartHoverData] = useState<LineChartHoverData | null>(null);
  
  // Combined highlight - click takes priority over hover
  const highlightedTransactionId = clickedTransactionId || hoveredTransactionId;

  // Detail panel state
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isDetailPanelOpen, setIsDetailPanelOpen] = useState(false);

  // Category filter state (multi-select)
  const [categoryFilter, setCategoryFilter] = useState<string[]>([]);

  // Keyword filter state (multi-select)
  const [keywordFilter, setKeywordFilter] = useState<string[]>([]);

  // Amount filter state
  const [amountFilter, setAmountFilter] = useState<AmountFilterValue | null>(null);

  // Date filter state
  const [dateFilter, setDateFilter] = useState<{ shortcut: DateShortcut; from: string; to: string }>({
    shortcut: 'all-time',
    from: '',
    to: '',
  });

  // Filter transactions by date filter (applied before other filters)
  const dateFilteredTransactions = useMemo(() => {
    // First apply the global time range from the timeline (if any)
    let result = transactions;
    
    // Then apply the local date filter from the filter bar
    if (dateFilter.shortcut === 'custom' && dateFilter.from && dateFilter.to) {
      const range = customDateRangeToRange(dateFilter.from, dateFilter.to);
      if (range) {
        result = filterTransactionsByDateRange(result, range);
      }
    } else if (dateFilter.shortcut !== 'all-time') {
      const range = dateShortcutToRange(dateFilter.shortcut);
      if (range) {
        result = filterTransactionsByDateRange(result, range);
      }
    }
    
    return result;
  }, [transactions, dateFilter]);

  // Get unique categories from transactions for the filter dropdown
  const availableCategories = useMemo(() => {
    const categories = new Set<string>();
    dateFilteredTransactions.forEach(t => {
      if (t.glCode) {
        categories.add(t.glCode);
      }
    });
    return Array.from(categories).sort();
  }, [dateFilteredTransactions]);

  // Filter transactions by category, keywords, and amount (for charts and summary)
  const filteredTransactions = useMemo(() => {
    let result = dateFilteredTransactions;
    
    // Filter by category
    if (categoryFilter && categoryFilter.length > 0) {
      result = result.filter(t => {
        // Check if "Uncategorized" is selected and transaction has no category
        if (categoryFilter.includes('Uncategorized') && !t.glCode) {
          return true;
        }
        // Check if transaction's category is in the selected categories
        if (t.glCode && categoryFilter.includes(t.glCode)) {
          return true;
        }
        return false;
      });
    }
    
    // Filter by keywords (search in toFrom name, account, glCode)
    if (keywordFilter && keywordFilter.length > 0) {
      result = result.filter(t => {
        const searchableText = [
          t.toFrom?.name,
          t.account,
          t.glCode,
        ].filter(Boolean).join(' ').toLowerCase();
        
        return keywordFilter.some(keyword => 
          searchableText.includes(keyword.toLowerCase())
        );
      });
    }
    
    // Filter by amount
    if (amountFilter) {
      result = result.filter(t => {
        const amount = t.amount;
        
        // Filter by direction
        if (amountFilter.direction === 'in' && amount < 0) {
          return false;
        }
        if (amountFilter.direction === 'out' && amount > 0) {
          return false;
        }
        
        // Use absolute value for amount comparisons
        const absAmount = Math.abs(amount);
        
        // Filter by exact amount
        if (amountFilter.exactAmount !== undefined && absAmount !== amountFilter.exactAmount) {
          return false;
        }
        
        // Filter by minimum amount
        if (amountFilter.minAmount !== undefined && absAmount < amountFilter.minAmount) {
          return false;
        }
        
        // Filter by maximum amount
        if (amountFilter.maxAmount !== undefined && absAmount > amountFilter.maxAmount) {
          return false;
        }
        
        return true;
      });
    }
    
    return result;
  }, [dateFilteredTransactions, categoryFilter, keywordFilter, amountFilter]);

  // Sync charts expanded state with settings
  useEffect(() => {
    setIsChartsExpanded(settings.showChartsExpanded);
  }, [settings.showChartsExpanded]);

  // Handle transaction updates from the table (e.g., category changes)
  // We need to update the shared store
  const setTransactions = useAppStore((s) => s.setTransactions);
  
  const handleTransactionsChange = useCallback((updatedTransactions: Transaction[]) => {
    // When transactions are updated, we need to merge with all transactions
    // Find which transactions were changed and update them in the full list
    const updatedIds = new Set(updatedTransactions.map(t => t.id));
    const unchangedTransactions = allTransactions.filter(t => !updatedIds.has(t.id));
    
    // If the updated transactions are a subset (filtered view), merge back
    if (updatedTransactions.length !== allTransactions.length) {
      // Merge: keep unchanged transactions and add updated ones
      setTransactions([...unchangedTransactions, ...updatedTransactions]);
    } else {
      // Full replacement
      setTransactions(updatedTransactions);
    }
  }, [allTransactions, setTransactions]);

  // Handle rules updates from the table
  const handleRulesChange = useCallback((updatedRules: CategoryRule[]) => {
    setRules(updatedRules);
  }, []);

  // Handle deleting a rule
  const handleDeleteRule = useCallback((ruleId: string) => {
    setRules(prev => prev.filter(r => r.id !== ruleId));
  }, []);

  // Handle opening settings with optional rule highlight
  const handleOpenSettings = useCallback((ruleId?: string) => {
    if (ruleId) {
      setHighlightedRuleId(ruleId);
    }
    setIsSettingsOpen(true);
  }, []);

  // Handle scatter plot hover - highlight transaction in table
  const handleScatterHover = useCallback((transactionId: string | null) => {
    setHoveredTransactionId(transactionId);
  }, []);

  // Handle line chart hover - update summary with cumulative values
  const handleLineChartHover = useCallback((data: LineChartHoverData | null) => {
    setLineChartHoverData(data);
  }, []);

  // Handle scatter plot click - scroll to transaction and open detail panel
  const handleScatterClick = useCallback((transactionId: string) => {
    setScrollToTransactionId(transactionId);
    setClickedTransactionId(transactionId);
    
    // Find the transaction and open the detail panel (search in filtered transactions)
    const transaction = dateFilteredTransactions.find(t => t.id === transactionId);
    if (transaction) {
      setSelectedTransaction(transaction);
      setIsDetailPanelOpen(true);
    }
  }, [dateFilteredTransactions]);

  // Handle scroll complete - clear scroll target but keep highlight
  const handleScrollComplete = useCallback(() => {
    setScrollToTransactionId(null);
    // Clear the clicked highlight after a delay so user can see it
    setTimeout(() => {
      setClickedTransactionId(null);
    }, 3000);
  }, []);

  // Handle row click - open detail panel or toggle if same row
  const handleRowClick = useCallback((transaction: Transaction) => {
    if (selectedTransaction?.id === transaction.id && isDetailPanelOpen) {
      // Clicking the same row that's already open - close the panel
      setIsDetailPanelOpen(false);
    } else {
      // Clicking a different row - update and open the panel
      setSelectedTransaction(transaction);
      setIsDetailPanelOpen(true);
    }
  }, [selectedTransaction?.id, isDetailPanelOpen]);

  // Handle detail panel close
  const handleDetailPanelClose = useCallback(() => {
    setIsDetailPanelOpen(false);
  }, []);

  // Handle category change from detail panel
  const handleDetailCategoryChange = useCallback((transactionId: string, category: string) => {
    updateTransaction(transactionId, { glCode: category || undefined });
  }, [updateTransaction]);

  // Handle viewing transactions for a specific category (from Settings modal)
  const handleViewCategoryTransactions = useCallback((category: string) => {
    setCategoryFilter([category]);
  }, []);

  // Handle category filter change (multi-select from dropdown)
  const handleCategoryFilterChange = useCallback((categories: string[]) => {
    setCategoryFilter(categories);
  }, []);

  // Handle keyword filter change (multi-select from dropdown)
  const handleKeywordFilterChange = useCallback((keywords: string[]) => {
    setKeywordFilter(keywords);
  }, []);

  // Handle amount filter change
  const handleAmountFilterChange = useCallback((filter: AmountFilterValue | null) => {
    setAmountFilter(filter);
  }, []);

  // Handle date filter change
  const handleDateFilterChange = useCallback((filter: { shortcut: DateShortcut; from: string; to: string } | null) => {
    if (filter) {
      setDateFilter(filter);
    } else {
      setDateFilter({ shortcut: 'all-time', from: '', to: '' });
    }
  }, []);
  
  // Apply URL filter on mount (e.g., ?filter=wire)
  useEffect(() => {
    if (urlFilter && !initialFilterApplied) {
      setInitialFilterApplied(true);
      
      // Map URL filter to keyword filter
      const filterKeywordMap: Record<string, string[]> = {
        'wire': ['wire'],
        'ach': ['ach'],
        'card': ['card'],
        'stripe': ['stripe'],
      };
      
      const keywords = filterKeywordMap[urlFilter.toLowerCase()];
      if (keywords) {
        // Use a slight delay to allow the page to render first
        setTimeout(() => {
          setKeywordFilter(keywords);
        }, 100);
      }
    }
  }, [urlFilter, initialFilterApplied]);

  // Handle clearing the category filter
  const handleClearCategoryFilter = useCallback(() => {
    setCategoryFilter([]);
  }, []);

  // Handle bar chart click - filter by category when groupBy is 'category'
  const handleBarChartClick = useCallback((category: string, groupBy: GroupByOption) => {
    if (groupBy === 'category') {
      // If "Uncategorized" is clicked, filter to transactions without a category
      if (category === 'Uncategorized') {
        setCategoryFilter(['Uncategorized']);
      } else {
        setCategoryFilter([category]);
      }
    }
    // For other groupBy options, we could add different filter behaviors in the future
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Page Header */}
      <div className="px-6 pt-6 pb-2">
        <div className="flex items-center justify-between">
          <h1 className="title-main">Transactions</h1>
{/* Match Receipts button hidden
          <div className="flex items-center gap-2">
            <button className="h-9 px-4 flex items-center gap-2 text-[13px] font-medium text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50 hover:border-gray-300 transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Match Receipts
            </button>
          </div>
          */}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="px-6 border-b border-gray-100">
        <TransactionsFilterBar 
          onSettingsClick={() => handleOpenSettings()} 
          categoryFilter={categoryFilter}
          onCategoryFilterChange={handleCategoryFilterChange}
          categories={availableCategories}
          dateFilter={dateFilter}
          onDateFilterChange={handleDateFilterChange}
          keywordFilter={keywordFilter}
          onKeywordFilterChange={handleKeywordFilterChange}
          amountFilter={amountFilter || undefined}
          onAmountFilterChange={handleAmountFilterChange}
        />
      </div>

      {/* Summary + Charts Section */}
      <div className={`border-b border-gray-100 ${!isChartsExpanded ? '' : 'px-6'}`}>
        {isChartsExpanded ? (
          /* Expanded layout */
          <div className="flex h-[212px]">
            {/* Summary on the left */}
            <div className="w-[320px] flex-shrink-0 border-r border-gray-100">
              <div className="pr-8 py-[16px] h-full">
                <TransactionsSummary collapsed={false} transactions={filteredTransactions} hoverData={lineChartHoverData} />
              </div>
            </div>
            
            {/* Charts on the right */}
            <div className="flex-1 flex items-center">
              <TransactionsCharts 
                transactions={filteredTransactions}
                onTransactionHover={handleScatterHover}
                onTransactionClick={handleScatterClick}
                onLineChartHover={handleLineChartHover}
                onBarChartClick={handleBarChartClick}
              />
            </div>
            
            {/* Collapse button */}
            <div className="flex-shrink-0 pl-4 flex items-center">
              <button
                onClick={() => setIsChartsExpanded(false)}
                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                aria-label="Collapse charts"
              >
                <svg 
                  className="w-5 h-5" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              </button>
            </div>
          </div>
        ) : (
          /* Collapsed layout - entire row is clickable */
          <button
            onClick={() => setIsChartsExpanded(true)}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer group"
          >
            <TransactionsSummary collapsed={true} transactions={filteredTransactions} hoverData={lineChartHoverData} />
            
            {/* Expand indicator */}
            <div className="flex items-center gap-2 text-gray-400 group-hover:text-gray-600">
              <span className="text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                Click to expand
              </span>
              <svg 
                className="w-5 h-5 rotate-180" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </div>
          </button>
        )}
      </div>

      {/* Transactions Table */}
      <div>
        <TransactionsTable 
          transactions={dateFilteredTransactions} 
          onTransactionsChange={handleTransactionsChange}
          columnVisibility={settings.columnVisibility}
          rules={rules}
          onRulesChange={handleRulesChange}
          onOpenSettings={handleOpenSettings}
          highlightedTransactionId={highlightedTransactionId}
          scrollToTransactionId={scrollToTransactionId}
          onScrollComplete={handleScrollComplete}
          onRowClick={handleRowClick}
          categoryFilter={categoryFilter}
          onClearCategoryFilter={handleClearCategoryFilter}
        />
      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSettingsChange={setSettings}
        rules={rules}
        onRulesChange={setRules}
        onDeleteRule={handleDeleteRule}
        highlightedRuleId={highlightedRuleId}
        onClearHighlightedRule={() => setHighlightedRuleId(null)}
        transactions={dateFilteredTransactions}
        onViewCategoryTransactions={handleViewCategoryTransactions}
      />

      {/* Transaction Detail Panel */}
      <TransactionsDetailPanel
        transaction={selectedTransaction}
        isOpen={isDetailPanelOpen}
        onClose={handleDetailPanelClose}
        onCategoryChange={handleDetailCategoryChange}
      />
    </div>
  );
};

export default TransactionsPage;

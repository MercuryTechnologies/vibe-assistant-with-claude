import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  TransactionsFilterBar,
  TransactionsSummary,
  TransactionsCharts,
  TransactionsTable,
  TransactionsDetailPanel,
  DataControlPanel,
  DataControlTrigger,
  SettingsModal,
  defaultPageSettings,
  generateTransactions,
  type Transaction,
  type PageSettings,
  type CategoryRule,
  type LineChartHoverData,
  type GroupByOption,
} from './transactions';

// Generate initial transactions once (50 by default)
const initialTransactions = generateTransactions({
  transactionCount: 50,
  minAmount: 1,
  maxAmount: 60000,
  includeNegative: true,
  negativeRatio: 40,
  merchantVariety: 10,
  accountVariety: 3,
  methodVariety: 6,
  includeCategories: true,
  categoryRatio: 30,
  autoAppliedRatio: 60,
  includeFailed: true,
  failedRatio: 5,
});

const TransactionsPage: React.FC = () => {
  // Page settings state
  const [settings, setSettings] = useState<PageSettings>(defaultPageSettings);
  const [isChartsExpanded, setIsChartsExpanded] = useState(settings.showChartsExpanded);
  
  // Modals state
  const [isControlPanelOpen, setIsControlPanelOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // Highlighted rule state (for navigating directly to a rule in settings)
  const [highlightedRuleId, setHighlightedRuleId] = useState<string | null>(null);
  
  // Transactions state (200 by default)
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  
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

  // Get unique categories from transactions for the filter dropdown
  const availableCategories = useMemo(() => {
    const categories = new Set<string>();
    transactions.forEach(t => {
      if (t.glCode) {
        categories.add(t.glCode);
      }
    });
    return Array.from(categories).sort();
  }, [transactions]);

  // Filter transactions by category (for charts and summary)
  const filteredTransactions = useMemo(() => {
    if (!categoryFilter || categoryFilter.length === 0) return transactions;
    
    return transactions.filter(t => {
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
  }, [transactions, categoryFilter]);

  // Sync charts expanded state with settings
  useEffect(() => {
    setIsChartsExpanded(settings.showChartsExpanded);
  }, [settings.showChartsExpanded]);

  const handleApplyData = (newTransactions: Transaction[]) => {
    setTransactions(newTransactions);
  };

  // Handle transaction updates from the table (e.g., category changes)
  const handleTransactionsChange = useCallback((updatedTransactions: Transaction[]) => {
    setTransactions(updatedTransactions);
  }, []);

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
    
    // Find the transaction and open the detail panel
    const transaction = transactions.find(t => t.id === transactionId);
    if (transaction) {
      setSelectedTransaction(transaction);
      setIsDetailPanelOpen(true);
    }
  }, [transactions]);

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
    setTransactions(prev => 
      prev.map(t => 
        t.id === transactionId 
          ? { ...t, glCode: category || undefined }
          : t
      )
    );
  }, []);

  // Handle viewing transactions for a specific category (from Settings modal)
  const handleViewCategoryTransactions = useCallback((category: string) => {
    setCategoryFilter([category]);
  }, []);

  // Handle category filter change (multi-select from dropdown)
  const handleCategoryFilterChange = useCallback((categories: string[]) => {
    setCategoryFilter(categories);
  }, []);

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
          <h1 className="text-[24px] font-semibold text-gray-900">Transactions</h1>
          <div className="flex items-center gap-2">
            <button className="h-9 px-4 flex items-center gap-2 text-[13px] font-medium text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50 hover:border-gray-300 transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Match Receipts
            </button>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="px-6 border-b border-gray-100">
        <TransactionsFilterBar 
          onSettingsClick={() => handleOpenSettings()} 
          categoryFilter={categoryFilter}
          onCategoryFilterChange={handleCategoryFilterChange}
          categories={availableCategories}
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
          transactions={transactions} 
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

      {/* Data Control Panel Trigger Button */}
      <DataControlTrigger onClick={() => setIsControlPanelOpen(true)} />

      {/* Data Control Panel */}
      <DataControlPanel
        isOpen={isControlPanelOpen}
        onClose={() => setIsControlPanelOpen(false)}
        onApply={handleApplyData}
        currentCount={transactions.length}
      />

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
        transactions={transactions}
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

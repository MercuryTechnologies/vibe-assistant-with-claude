import { useState, useMemo } from 'react';
import { useTransactions } from '@/hooks';
import { DSTable, type DSTableColumn, type DSTableDetailPanelRenderContext, type SortDirection } from '@/components/ui/ds-table';
import { DSTableToolbar, type DatePreset, type DateRange, type DisplaySettings, defaultDisplaySettings, type GroupByOption, type SortValue, type FilterValues, type AmountFilterValues } from '@/components/ui/ds-table-toolbar';
import { DSCombobox } from '@/components/ui/ds-combobox';
import { MonthlySummary } from '@/components/ui/monthly-summary';
import { GroupedTable, groupTransactions, type GroupedData } from '@/components/ui/grouped-table';
import { DSTableDetailPanel, type DetailPanelField } from '@/components/ui/ds-table-detail-panel';
import { BulkActionBar } from '@/components/ui/bulk-action-bar';
import { useToast } from '@/components/ui/toast';
import { cn } from '@/lib/utils';
import type { Transaction } from '@/types';

// Import from features module
import {
  MoneyAmount,
  TransactionAvatar,
  AttachmentButton,
  formatDate,
  getAccountType,
  getMethod,
  hasAttachment,
  categoryOptions,
  quickFilters,
} from '@/features/transactions';

export function Transactions() {
  const { transactions, isLoading } = useTransactions();
  const { showToast } = useToast();
  // Sort state - derived from sortValue for the table
  const [sortValue, setSortValue] = useState<SortValue>({ field: 'date', direction: 'desc' });
  
  // Convert toolbar sortValue to table sortState format
  const sortState = useMemo(() => ({
    columnId: sortValue.field,
    direction: sortValue.direction as SortDirection
  }), [sortValue]);
  
  // Track category values per transaction (in a real app this would be in the data/API)
  const [categoryValues, setCategoryValues] = useState<Record<string, string>>({});
  
  // Date filter state
  const [datePreset, setDatePreset] = useState<DatePreset>('all_time');
  const [dateRange, setDateRange] = useState<DateRange>({});
  
  // Keyword filter state
  const [keywordSearch, setKeywordSearch] = useState('');
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  
  // Amount filter state
  const [amountFilterValues, setAmountFilterValues] = useState<AmountFilterValues>({});
  
  // Row selection state
  const [selectedRowKeys, setSelectedRowKeys] = useState<Set<string>>(new Set());
  
  // Display settings state
  const [displaySettings, setDisplaySettings] = useState<DisplaySettings>(defaultDisplaySettings);
  
  // Filter menu values state
  const [filterValues, setFilterValues] = useState<FilterValues>({});
  
  // Monthly summary expanded state
  const [summaryExpanded, setSummaryExpanded] = useState(false);
  
  // Expanded groups state for grouped view
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  
  // Calculate monthly summary values from transactions
  const monthlySummary = useMemo(() => {
    const moneyIn = transactions
      .filter(t => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);
    const moneyOut = transactions
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const netChange = moneyIn - moneyOut;
    
    return { netChange, moneyIn, moneyOut };
  }, [transactions]);
  
  const handleCategoryChange = (transactionId: string, newValue: string) => {
    setCategoryValues(prev => ({
      ...prev,
      [transactionId]: newValue
    }));
    
    // Show toast notification when category is applied
    if (newValue) {
      const categoryLabel = categoryOptions.find(opt => opt.value === newValue)?.label || newValue;
      showToast({
        message: "Similar transactions will now use [Category]. Want to update past ones?",
        interpolateValue: categoryLabel,
        action: {
          label: "Review and Update",
          onClick: () => {
            console.log("Review and update past transactions with category:", categoryLabel);
          },
        },
        duration: 6000,
      });
    }
  };

  // Define columns for the transactions table matching Figma
  const transactionColumns: DSTableColumn<Transaction>[] = [
    {
      id: 'date',
      header: 'Date',
      accessor: 'date',
      sortable: true,
      width: '80px',
      cell: (value) => (
        <span className="text-body">
          {formatDate(value as string)}
        </span>
      ),
    },
    {
      id: 'merchant',
      header: 'To/From',
      accessor: (row) => row,
      sortable: true,
      cell: (_, row) => (
        <div className="flex items-center gap-3">
          <TransactionAvatar merchant={row.merchant} />
          <span className="text-body">{row.merchant}</span>
        </div>
      ),
    },
    {
      id: 'amount',
      header: 'Amount',
      accessor: 'amount',
      align: 'right',
      sortable: true,
      width: '120px',
      cell: (value) => <MoneyAmount amount={value as number} />,
    },
    {
      id: 'account',
      header: 'Account',
      accessor: (row) => getAccountType(row.accountId),
      sortable: true,
      cell: (value) => (
        <span className="text-body">{value as string}</span>
      ),
    },
    {
      id: 'method',
      header: 'Method',
      accessor: (row) => getMethod(row),
      sortable: true,
      cell: (value) => (
        <span className="text-body">{value as string}</span>
      ),
    },
    {
      id: 'category',
      header: 'Category',
      accessor: 'category',
      sortable: true,
      cell: (value, row) => (
        <div onClick={(e) => e.stopPropagation()}>
          <DSCombobox
            variant="inline"
            value={categoryValues[row.id] || (value as string)}
            options={categoryOptions}
            onChange={(newValue) => handleCategoryChange(row.id, newValue)}
            placeholder="Select category"
            triggerClassName="w-full"
          />
        </div>
      ),
    },
    {
      id: 'attachments',
      header: 'Attachments',
      accessor: (row) => hasAttachment(row.id),
      width: '100px',
      align: 'center',
      cell: (_, row) => (
        <AttachmentButton hasAttachment={hasAttachment(row.id)} />
      ),
    },
  ];

  const filteredTransactions = useMemo(() => {
    const normalizedSelectedCategories =
      filterValues.categories?.map((c) => c.toLowerCase().trim()).filter(Boolean) ?? []

    const categoryFilterMode = filterValues.categoryFilterMode ?? "all"

    // Filter transactions based on keyword search (searches To/From column) + category filters
    return transactions.filter((transaction) => {
      // Category filtering
      const effectiveCategory = (categoryValues[transaction.id] ?? transaction.category ?? "").trim()
      const isCategorized =
        effectiveCategory.length > 0 && effectiveCategory.toLowerCase() !== "uncategorized"

      if (categoryFilterMode === "categorized" && !isCategorized) return false
      if (categoryFilterMode === "uncategorized" && isCategorized) return false

      if (normalizedSelectedCategories.length > 0) {
        const effectiveLower = effectiveCategory.toLowerCase()
        const matchesCategory = normalizedSelectedCategories.includes(effectiveLower)
        if (!matchesCategory) return false
      }

      // Keyword filtering
      if (!keywordSearch && selectedKeywords.length === 0) {
        return true
      }

      const merchantLower = transaction.merchant.toLowerCase()
      const descriptionLower = transaction.description.toLowerCase()

      // Check if keyword search matches merchant (To/From) or description
      if (keywordSearch) {
        const searchLower = keywordSearch.toLowerCase()
        if (merchantLower.includes(searchLower) || descriptionLower.includes(searchLower)) {
          return true
        }
      }

      // Check if any selected keyword matches merchant (To/From) or description
      if (selectedKeywords.length > 0) {
        const matchesSelectedKeyword = selectedKeywords.some((keyword) => {
          const k = keyword.toLowerCase()
          return merchantLower.includes(k) || descriptionLower.includes(k)
        })
        if (matchesSelectedKeyword) {
          return true
        }
      }

      // If we have search criteria but no matches, exclude
      return false
    })
  }, [transactions, keywordSearch, selectedKeywords, filterValues.categoryFilterMode, filterValues.categories, categoryValues])

  // Sort filtered transactions based on current sort state
  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    if (!sortState || !sortState.direction) return 0;
    
    const { columnId, direction } = sortState;
    let comparison = 0;
    
    switch (columnId) {
      case 'date':
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
        break;
      case 'amount':
        comparison = a.amount - b.amount;
        break;
      case 'merchant':
      case 'description':
        // Sort by merchant name (the To/From column)
        comparison = a.merchant.localeCompare(b.merchant);
        break;
      case 'category':
        // Use custom category value if set, otherwise use transaction category
        {
          const catA = categoryValues[a.id] || a.category;
          const catB = categoryValues[b.id] || b.category;
          comparison = catA.localeCompare(catB);
        }
        break;
      case 'account':
        comparison = getAccountType(a.accountId).localeCompare(getAccountType(b.accountId));
        break;
      case 'method':
        comparison = getMethod(a).localeCompare(getMethod(b));
        break;
      default:
        comparison = 0;
    }
    
    return direction === 'asc' ? comparison : -comparison;
  });
  
  // Group transactions when groupBy is not "none"
  const groupedTransactions = useMemo((): GroupedData<Transaction>[] => {
    if (displaySettings.groupBy === "none") return [];
    
    const groupBy = displaySettings.groupBy;
    
    const getGroupKey = (transaction: Transaction): string => {
      switch (groupBy) {
        case "account":
          return getAccountType(transaction.accountId);
        case "category":
          return categoryValues[transaction.id] || transaction.category;
        case "method":
          return getMethod(transaction);
        case "date":
          // Group by month
          {
            const date = new Date(transaction.date);
            return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          }
        default:
          return "Other";
      }
    };
    
    const getGroupLabel = (transaction: Transaction): string => {
      switch (groupBy) {
        case "account":
          return getAccountType(transaction.accountId);
        case "category":
          return categoryValues[transaction.id] || transaction.category;
        case "method":
          return getMethod(transaction);
        case "date":
          {
            const date = new Date(transaction.date);
            return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
          }
        default:
          return "Other";
      }
    };
    
    return groupTransactions(
      sortedTransactions,
      groupBy as "account" | "category" | "method" | "date",
      getGroupKey,
      getGroupLabel
    );
  }, [sortedTransactions, displaySettings.groupBy, categoryValues]);
  
  // Handler for toggling group expansion
  const handleToggleGroup = (groupKey: string) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupKey)) {
        newSet.delete(groupKey);
      } else {
        newSet.add(groupKey);
      }
      return newSet;
    });
  };
  
  // Handler for "Expand group" link click
  const handleExpandGroup = (groupKey: string) => {
    setExpandedGroups(prev => new Set(prev).add(groupKey));
  };
  
  // Helper to format date/time for timeline
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    const month = date.toLocaleDateString('en-US', { month: 'short' })
    const day = date.getDate()
    const time = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).toLowerCase()
    return `${month} ${day} at ${time}`
  }

  // Money amount headline component
  const MoneyAmountHeadline = ({ amount }: { amount: number }) => {
    const isPositive = amount >= 0
    const absAmount = Math.abs(amount)
    const totalCents = Math.round(absAmount * 100)
    const dollars = Math.floor(totalCents / 100)
    const cents = String(totalCents % 100).padStart(2, "0")
    const formattedDollars = dollars.toLocaleString("en-US")
    const prefix = isPositive ? "" : "−"

    return (
      <span
        className={cn(
          "text-title-main font-display tabular-nums whitespace-nowrap"
        )}
        style={{ 
          color: isPositive ? "var(--color-success)" : "var(--ds-text-title)",
        }}
      >
        <span>{prefix}$</span>
        <span>{formattedDollars}</span>
        <span 
          className="text-body-sm-demi align-top" 
          style={{ 
            position: 'relative', 
            top: '2px',
          }}
        >
          .{cents}
        </span>
      </span>
    )
  }

  const renderTransactionDetailPanel = ({ row, isOpen, close }: DSTableDetailPanelRenderContext<Transaction>) => {
    if (!row) return null

    const isIncoming = row.amount >= 0

    // Configure fields for the detail panel
    const fields: DetailPanelField<Transaction>[] = [
      {
        id: 'recipient-memo',
        label: 'Recipient memo',
        type: 'text',
        getValue: () => 'From Mercury Technologies, Inc.',
      },
      {
        id: 'category',
        label: 'Custom',
        type: 'combobox',
        value: categoryValues[row.id] || row.category,
        options: categoryOptions,
        onChange: (newValue) => handleCategoryChange(row.id, newValue),
        placeholder: 'Select category',
      },
      {
        id: 'notes',
        label: 'Notes',
        type: 'textarea',
        placeholder: 'Add a note',
        rows: 2,
      },
      {
        id: 'attachments',
        label: 'Attachments',
        type: 'file',
        filename: hasAttachment(row.id) ? 'Filename.pdf' : undefined,
        uploaded: hasAttachment(row.id),
      },
      {
        id: 'bank-description',
        label: 'Bank description',
        type: 'text',
        getValue: (t) => t.description || 'Send Money transition initiated on Mercury',
      },
    ]

    return (
      <DSTableDetailPanel
        row={row}
        isOpen={isOpen}
        onClose={close}
        title={row.merchant}
        hero={(t) => (
          <div className="w-full">
            <MoneyAmountHeadline amount={t.amount} />
          </div>
        )}
        timeline={[
          {
            type: 'first',
            title: isIncoming ? row.merchant : 'Pending',
            datetime: formatDateTime(row.date),
            attribution: 'First L.',
          },
          {
            type: 'last',
            title: isIncoming ? getAccountType(row.accountId) : `${row.merchant} ••1111`,
            datetime: formatDateTime(row.date),
            attribution: 'First L.',
          },
        ]}
        fields={fields}
        showCopyLink={true}
      />
    )
  };

  return (
    <div className="relative h-full overflow-x-hidden">
      {/* Main Content */}
      <div className="h-full flex flex-col">
        <div className="px-4 mb-3">
          <h1 className="text-title-main m-0">Transactions</h1>
        </div>
        
        {/* Table Toolbar */}
        <div className="px-4 mb-4 border-b border-border">
          <DSTableToolbar
            className="h-auto py-3"
            viewMenuLabel="Data Views"
            quickFilters={quickFilters}
            filterValues={filterValues}
            onFilterValuesChange={setFilterValues}
            filterViewName="All Transactions"
            dateFilterPreset={datePreset}
            dateFilterRange={dateRange}
            onDatePresetChange={setDatePreset}
            onDateRangeChange={setDateRange}
            keywordSearchQuery={keywordSearch}
            keywordSelectedKeywords={selectedKeywords}
            onKeywordSearchChange={setKeywordSearch}
            onKeywordSelectionChange={setSelectedKeywords}
            amountFilterValues={amountFilterValues}
            onAmountFilterChange={setAmountFilterValues}
            showGroupButton={true}
            groupByValue={displaySettings.groupBy}
            onGroupByChange={(value: GroupByOption) => setDisplaySettings({ ...displaySettings, groupBy: value })}
            showSortButton={true}
            sortValue={sortValue}
            onSortValueChange={setSortValue}
            showDisplayButton={true}
            displayButtonType="icon"
            displaySettings={displaySettings}
            onDisplaySettingsChange={setDisplaySettings}
            showExportButton={true}
          />
        </div>
        
        {/* Monthly Summary */}
        <MonthlySummary
          netChange={monthlySummary.netChange}
          moneyIn={monthlySummary.moneyIn}
          moneyOut={monthlySummary.moneyOut}
          expanded={summaryExpanded}
          onToggle={() => setSummaryExpanded(!summaryExpanded)}
        />
        
        <div className="flex-1 overflow-auto">
          {displaySettings.groupBy !== "none" ? (
            <GroupedTable
              groups={groupedTransactions}
              expandedGroups={expandedGroups}
              onToggleGroup={handleToggleGroup}
              onExpandGroup={handleExpandGroup}
              loading={isLoading}
              getItemKey={(item) => item.id}
              renderItems={(items) => (
                <DSTable
                  columns={transactionColumns}
                  data={items}
                  getRowKey={(row) => row.id}
                  sortState={sortState}
                  onSort={(columnId, direction) => {
                    // Map table column ID to SortField type and update sortValue
                    const field = columnId as SortValue['field'];
                    setSortValue(direction 
                      ? { field, direction } 
                      : { field: 'date', direction: 'desc' }
                    );
                  }}
                  renderDetailPanel={renderTransactionDetailPanel}
                  variant="fullWidth"
                  selectable
                  selectedRowKeys={selectedRowKeys}
                  onSelectionChange={setSelectedRowKeys}
                />
              )}
            />
          ) : (
            <DSTable
              columns={transactionColumns}
              data={sortedTransactions}
              getRowKey={(row) => row.id}
              loading={isLoading}
              loadingRowCount={10}
              emptyMessage={keywordSearch || selectedKeywords.length > 0 
                ? `No transactions found matching "${keywordSearch || selectedKeywords.join(', ')}"`
                : "No transactions found."
              }
              sortState={sortState}
              onSort={(columnId, direction) => {
                // Map table column ID to SortField type and update sortValue
                const field = columnId as SortValue['field'];
                setSortValue(direction 
                  ? { field, direction } 
                  : { field: 'date', direction: 'desc' }
                );
              }}
              renderDetailPanel={renderTransactionDetailPanel}
              variant="fullWidth"
              selectable
              selectedRowKeys={selectedRowKeys}
              onSelectionChange={setSelectedRowKeys}
            />
          )}
        </div>
        
        {/* Pagination footer */}
        {!isLoading && transactions.length > 0 && (
          <div
            className="flex items-center justify-between px-4 py-3 border-t"
            style={{ borderColor: "var(--color-border-default)" }}
          >
            <span className="text-label" style={{ color: "var(--ds-text-tertiary)" }}>
              {displaySettings.groupBy !== "none" ? (
                // Grouped view: show group count and total transactions
                <>
                  {groupedTransactions.length > 0 ? `1-${groupedTransactions.length}` : '0'} of {groupedTransactions.length} Groups
                  <span className="mx-2">·</span>
                  {sortedTransactions.length.toLocaleString()} Transactions
                </>
              ) : (
                // Normal view: show transaction count
                <>
                  {sortedTransactions.length > 0 ? `1-${sortedTransactions.length}` : '0'} of {transactions.length}
                  {(keywordSearch || selectedKeywords.length > 0) && sortedTransactions.length !== transactions.length && (
                    <span className="text-ds-400"> (filtered)</span>
                  )}
                </>
              )}
            </span>
            <div className="flex items-center gap-2">
              <button 
                className="ds-pagination-btn w-8 h-8 flex items-center justify-center rounded-md text-ds-400"
                disabled
              >
                <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <button 
                className="ds-pagination-btn w-8 h-8 flex items-center justify-center rounded-md text-ds-400"
                disabled
              >
                <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Bulk Action Bar - shows when transactions are selected */}
      <BulkActionBar
        selectedCount={selectedRowKeys.size}
        isVisible={selectedRowKeys.size > 0}
        onDismiss={() => setSelectedRowKeys(new Set())}
        categoryOptions={categoryOptions}
        categoryValue=""
        onCategoryChange={(value) => {
          // Apply the selected category to all selected transactions
          const newCategoryValues = { ...categoryValues };
          selectedRowKeys.forEach((key) => {
            newCategoryValues[key] = value;
          });
          setCategoryValues(newCategoryValues);
          
          // Show toast notification for bulk category change
          if (value) {
            const categoryLabel = categoryOptions.find(opt => opt.value === value)?.label || value;
            showToast({
              message: "Similar transactions will now use [Category]. Want to update past ones?",
              interpolateValue: categoryLabel,
              action: {
                label: "Review and Update",
                onClick: () => {
                  console.log("Review and update past transactions with category:", categoryLabel);
                },
              },
              duration: 6000,
            });
          }
        }}
        overflowActions={[
          {
            label: "Export selected",
            onClick: () => console.log("Export selected", Array.from(selectedRowKeys)),
          },
          {
            label: "Delete selected",
            onClick: () => console.log("Delete selected", Array.from(selectedRowKeys)),
          },
        ]}
      />
    </div>
  );
}

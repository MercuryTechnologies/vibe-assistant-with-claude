import { useState } from 'react';
import { DSTableToolbar, type QuickFilter, type DatePreset, type DateRange } from '@/components/ui/ds-table-toolbar';
import { type FilterValues } from '@/components/ui/filter-menu';
import { type GroupByOption } from '@/components/ui/group-by-button';
import { type SortValue } from '@/components/ui/sort-button';
import { GroupByButton } from '@/components/ui/group-by-button';
import { SortButton } from '@/components/ui/sort-button';
import { MonthlySummary } from '@/components/ui/monthly-summary';

// DSTableToolbar Demo Components
const transactionsQuickFilters: QuickFilter[] = [
  { id: 'date', label: 'Date' },
  { id: 'keyword', label: 'Keyword' },
  { id: 'amount', label: 'Amount' },
];

export function DSTableToolbarTransactionsDemo() {
  const [filterValues, setFilterValues] = useState<FilterValues>({});
  const [datePreset, setDatePreset] = useState<DatePreset>('all_time');
  const [dateRange, setDateRange] = useState<DateRange>({});
  const [keywordSearch, setKeywordSearch] = useState('');
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [groupByValue, setGroupByValue] = useState<GroupByOption>('none');
  const [sortValue, setSortValue] = useState<SortValue>({ field: 'date', direction: 'desc' });
  
  return (
    <div
      className="border rounded-md p-4 bg-white"
      style={{ borderColor: "var(--color-border-default)", minHeight: 400 }}
    >
      <DSTableToolbar
        viewMenuLabel="Data Views"
        quickFilters={transactionsQuickFilters}
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
        showGroupButton={true}
        groupByValue={groupByValue}
        onGroupByChange={setGroupByValue}
        showSortButton={true}
        sortValue={sortValue}
        onSortValueChange={setSortValue}
        showDisplayButton={true}
        displayButtonType="icon"
        showExportButton={true}
      />
    </div>
  );
}

export function DSTableToolbarMinimalDemo() {
  const [filterValues, setFilterValues] = useState<FilterValues>({});
  const [sortValue, setSortValue] = useState<SortValue>({ field: 'date', direction: 'desc' });
  
  return (
    <div
      className="border rounded-md p-4 bg-white"
      style={{ borderColor: "var(--color-border-default)", minHeight: 400 }}
    >
      <DSTableToolbar
        viewMenuLabel="All Items"
        showFilters={true}
        filterValues={filterValues}
        onFilterValuesChange={setFilterValues}
        filterViewName="Monthly In"
        quickFilters={[]}
        showGroupButton={false}
        showSortButton={true}
        sortValue={sortValue}
        onSortValueChange={setSortValue}
        showDisplayButton={true}
        displayButtonType="button"
        showExportButton={false}
      />
    </div>
  );
}

export function DSTableToolbarWithActiveFiltersDemo() {
  const [filterValues, setFilterValues] = useState<FilterValues>({
    datePreset: 'this_month',
    categories: ['Software & Subscriptions'],
  });
  const [datePreset, setDatePreset] = useState<DatePreset>('this_month');
  const [dateRange, setDateRange] = useState<DateRange>({});
  const [groupByValue, setGroupByValue] = useState<GroupByOption>('category');
  const [sortValue, setSortValue] = useState<SortValue>({ field: 'date', direction: 'desc' });
  
  const activeFilters: QuickFilter[] = [
    { id: 'date', label: 'Date' },
    { id: 'status', label: 'Status' },
  ];
  
  return (
    <div
      className="border rounded-md p-4 bg-white"
      style={{ borderColor: "var(--color-border-default)", minHeight: 400 }}
    >
      <DSTableToolbar
        viewMenuLabel="Filtered View"
        filterValues={filterValues}
        onFilterValuesChange={setFilterValues}
        filterViewName="Filtered Transactions"
        quickFilters={activeFilters}
        dateFilterPreset={datePreset}
        dateFilterRange={dateRange}
        onDatePresetChange={setDatePreset}
        onDateRangeChange={setDateRange}
        groupByValue={groupByValue}
        onGroupByChange={setGroupByValue}
        showGroupButton={true}
        showSortButton={true}
        sortValue={sortValue}
        onSortValueChange={setSortValue}
        showDisplayButton={true}
        showExportButton={true}
      />
    </div>
  );
}

export const dsTableToolbarVariantComponents: Record<string, React.ComponentType> = {
  'Transactions Page': DSTableToolbarTransactionsDemo,
  'Minimal': DSTableToolbarMinimalDemo,
  'With Active Filters': DSTableToolbarWithActiveFiltersDemo,
};

// GroupByButton Demo Components
export function GroupByButtonDefaultDemo() {
  const [value, setValue] = useState<GroupByOption>("none");
  return (
    <div
      className="flex items-center gap-4 p-4 bg-white rounded-md border"
      style={{ borderColor: "var(--color-border-default)", minHeight: 200 }}
    >
      <GroupByButton
        value={value}
        onChange={setValue}
      />
      <span className="text-body-sm">
        Current: {value === "none" ? "No grouping" : value}
      </span>
    </div>
  );
}

export function GroupByButtonWithGroupingDemo() {
  const [value, setValue] = useState<GroupByOption>("date");
  return (
    <div
      className="flex items-center gap-4 p-4 bg-white rounded-md border"
      style={{ borderColor: "var(--color-border-default)", minHeight: 200 }}
    >
      <GroupByButton
        value={value}
        onChange={setValue}
      />
      <span className="text-body-sm">
        Grouped by: {value} (notice the indicator dot)
      </span>
    </div>
  );
}

export const groupByButtonVariantComponents: Record<string, React.ComponentType> = {
  'Default (No Grouping)': GroupByButtonDefaultDemo,
  'With Active Grouping': GroupByButtonWithGroupingDemo,
};

// SortButton Demo Components
export function SortButtonDefaultDemo() {
  const [value, setValue] = useState<SortValue>({ field: "date", direction: "desc" });
  return (
    <div
      className="flex items-center gap-4 p-4 bg-white rounded-md border"
      style={{ borderColor: "var(--color-border-default)", minHeight: 280 }}
    >
      <SortButton
        value={value}
        onChange={setValue}
      />
      <span className="text-body-sm">
        Sort by: {value.field} ({value.direction === "desc" ? "New to Old" : "Old to New"})
      </span>
    </div>
  );
}

export function SortButtonAmountDemo() {
  const [value, setValue] = useState<SortValue>({ field: "amount", direction: "desc" });
  return (
    <div
      className="flex items-center gap-4 p-4 bg-white rounded-md border"
      style={{ borderColor: "var(--color-border-default)", minHeight: 280 }}
    >
      <SortButton
        value={value}
        onChange={setValue}
      />
      <span className="text-body-sm">
        Sort by: {value.field} ({value.direction === "desc" ? "High to Low" : "Low to High"})
      </span>
    </div>
  );
}

export const sortButtonVariantComponents: Record<string, React.ComponentType> = {
  'Default (Date Sort)': SortButtonDefaultDemo,
  'Amount Sort': SortButtonAmountDemo,
};

// MonthlySummary Demo Components
export function MonthlySummaryDefaultDemo() {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="border rounded-md overflow-hidden" style={{ borderColor: "var(--color-border-default)" }}>
      <MonthlySummary
        netChange={3332640.71}
        moneyIn={4047076.47}
        moneyOut={714435.76}
        expanded={expanded}
        onToggle={() => setExpanded(!expanded)}
      />
    </div>
  );
}

export function MonthlySummaryNegativeDemo() {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="border rounded-md overflow-hidden" style={{ borderColor: "var(--color-border-default)" }}>
      <MonthlySummary
        netChange={-250000.50}
        moneyIn={500000.00}
        moneyOut={750000.50}
        expanded={expanded}
        onToggle={() => setExpanded(!expanded)}
      />
    </div>
  );
}

export function MonthlySummaryCustomPeriodDemo() {
  return (
    <div className="border rounded-md overflow-hidden" style={{ borderColor: "var(--color-border-default)" }}>
      <MonthlySummary
        netChange={125000.00}
        moneyIn={200000.00}
        moneyOut={75000.00}
        periodLabel="Net change this quarter"
      />
    </div>
  );
}

export const monthlySummaryVariantComponents: Record<string, React.ComponentType> = {
  'Default (Positive)': MonthlySummaryDefaultDemo,
  'Negative Net Change': MonthlySummaryNegativeDemo,
  'Custom Period Label': MonthlySummaryCustomPeriodDemo,
};

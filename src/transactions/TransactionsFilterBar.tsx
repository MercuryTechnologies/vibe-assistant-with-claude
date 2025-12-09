import React, { useState, useRef, useEffect } from 'react';

interface FilterButtonProps {
  icon?: React.ReactNode;
  label: string;
  hasDropdown?: boolean;
  variant?: 'default' | 'icon-only';
  onClick?: () => void;
  isActive?: boolean;
}

const FilterButton: React.FC<FilterButtonProps> = ({ 
  icon, 
  label, 
  hasDropdown = true,
  variant = 'default',
  onClick,
  isActive = false,
}) => {
  if (variant === 'icon-only') {
    return (
      <button 
        onClick={onClick}
        className={`h-8 w-8 flex items-center justify-center rounded-lg transition-colors
          ${isActive 
            ? 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100' 
            : 'text-[#70707d] hover:text-[#363644] hover:bg-gray-100'
          }`}
      >
        {icon}
      </button>
    );
  }

  return (
    <button 
      onClick={onClick}
      className={`h-8 pr-1 flex items-center bg-[#fbfcfd] border border-[rgba(112,115,147,0.16)] rounded-lg hover:bg-gray-50 hover:border-[rgba(112,115,147,0.25)] transition-colors ${icon ? 'pl-1.5' : 'pl-3'} ${isActive ? 'border-indigo-300 bg-indigo-50' : ''}`}
    >
      {icon && (
        <span className="w-6 h-6 flex items-center justify-center text-[#70707d]">
          {icon}
        </span>
      )}
      <span className={`text-[15px] leading-6 whitespace-nowrap ${isActive ? 'text-indigo-700' : 'text-[#535461]'}`}>{label}</span>
      {hasDropdown && (
        <span className="w-8 h-full flex items-center justify-center">
          <svg className={`w-3 h-3 ${isActive ? 'text-indigo-600' : 'text-[#363644]'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      )}
    </button>
  );
};

// Category Filter Dropdown Component
interface CategoryFilterDropdownProps {
  categories: string[];
  selectedCategories: string[];
  onSelectionChange: (categories: string[]) => void;
  onClose: () => void;
}

const CategoryFilterDropdown: React.FC<CategoryFilterDropdownProps> = ({
  categories,
  selectedCategories,
  onSelectionChange,
  onClose,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // Filter categories by search
  const filteredCategories = categories.filter(cat =>
    cat.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggleCategory = (category: string) => {
    if (selectedCategories.includes(category)) {
      onSelectionChange(selectedCategories.filter(c => c !== category));
    } else {
      onSelectionChange([...selectedCategories, category]);
    }
  };

  const handleSelectAll = () => {
    if (selectedCategories.length === categories.length + 1) {
      // All selected (including Uncategorized), deselect all
      onSelectionChange([]);
    } else {
      // Select all categories + Uncategorized
      onSelectionChange(['Uncategorized', ...categories]);
    }
  };

  const isAllSelected = selectedCategories.length === categories.length + 1;
  const isUncategorizedSelected = selectedCategories.includes('Uncategorized');

  return (
    <div
      ref={dropdownRef}
      className="absolute top-full left-0 mt-1 w-[320px] bg-white rounded-xl overflow-hidden z-50"
      style={{
        boxShadow: '0px 14px 20px 0px rgba(4, 4, 52, 0.02), 0px 8px 12px 0px rgba(14, 14, 45, 0.08), 0px 0px 1px 0px rgba(175, 178, 206, 0.9), 0px 1px 4px 0px rgba(183, 187, 219, 0.14)',
      }}
    >
      {/* Search Input */}
      <div className="p-6 pb-4">
        <div className="relative">
          <svg 
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for category"
            className="w-full h-10 pl-10 pr-4 text-[15px] text-gray-900 placeholder:text-gray-400 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Uncategorized Option */}
      <div className="px-6 pb-4">
        <label className="flex items-center gap-3 cursor-pointer group">
          <div className="relative">
            <input
              type="checkbox"
              checked={isUncategorizedSelected}
              onChange={() => handleToggleCategory('Uncategorized')}
              className="sr-only peer"
            />
            <div className="w-5 h-5 rounded border-2 border-gray-300 peer-checked:border-indigo-600 peer-checked:bg-indigo-600 transition-colors flex items-center justify-center">
              {isUncategorizedSelected && (
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
          </div>
          <span className="text-[15px] text-gray-900 leading-6">Uncategorized</span>
        </label>
      </div>

      {/* Category Section Header */}
      <div className="px-6 pb-2 flex items-center justify-between">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Category</span>
        <button
          onClick={handleSelectAll}
          className="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
        >
          {isAllSelected ? 'Deselect All' : 'Select All'}
        </button>
      </div>

      {/* Category List */}
      <div className="px-6 pb-6 max-h-[320px] overflow-y-auto">
        <div className="space-y-1">
          {filteredCategories.map((category) => {
            const isSelected = selectedCategories.includes(category);
            return (
              <label key={category} className="flex items-center gap-3 py-2 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleToggleCategory(category)}
                    className="sr-only peer"
                  />
                  <div className="w-5 h-5 rounded border-2 border-gray-300 peer-checked:border-indigo-600 peer-checked:bg-indigo-600 transition-colors flex items-center justify-center">
                    {isSelected && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="text-[15px] text-gray-900 leading-6">{category}</span>
              </label>
            );
          })}

          {filteredCategories.length === 0 && searchQuery && (
            <div className="py-4 text-center text-sm text-gray-400">
              No categories found
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface TransactionsFilterBarProps {
  onSettingsClick?: () => void;
  categoryFilter?: string[];
  onCategoryFilterChange?: (categories: string[]) => void;
  categories?: string[];
}

const TransactionsFilterBar: React.FC<TransactionsFilterBarProps> = ({ 
  onSettingsClick,
  categoryFilter = [],
  onCategoryFilterChange,
  categories = [],
}) => {
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const categoryButtonRef = useRef<HTMLDivElement>(null);

  const handleCategoryClick = () => {
    setIsCategoryDropdownOpen(!isCategoryDropdownOpen);
  };

  const handleCategorySelectionChange = (newSelection: string[]) => {
    onCategoryFilterChange?.(newSelection);
  };

  const handleClearCategoryFilter = () => {
    onCategoryFilterChange?.([]);
  };

  const hasActiveFilter = categoryFilter.length > 0;
  const filterLabel = hasActiveFilter
    ? categoryFilter.length === 1
      ? categoryFilter[0]
      : `${categoryFilter.length} categories`
    : 'Category';

  return (
    <div className="flex items-center justify-between py-3">
      {/* Left side filters */}
      <div className="flex items-center gap-2">
        {/* Data Views */}
        <FilterButton
          icon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
            </svg>
          }
          label="Data Views"
        />

        {/* Filters */}
        <FilterButton
          icon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
          }
          label="Filters"
        />

        {/* Date */}
        <FilterButton
          label="Date"
        />

        {/* Keywords */}
        <FilterButton
          label="Keywords"
        />

        {/* Amount */}
        <FilterButton
          label="Amount"
        />

        {/* Category */}
        <div ref={categoryButtonRef} className="relative">
          {hasActiveFilter ? (
            <div className="flex items-center">
              <button 
                onClick={handleCategoryClick}
                className="h-8 pl-3 pr-1 flex items-center gap-1 bg-indigo-50 border border-indigo-200 rounded-l-lg hover:bg-indigo-100 transition-colors"
              >
                <span className="text-[15px] text-indigo-700 leading-6 whitespace-nowrap font-medium">{filterLabel}</span>
                <span className="w-6 h-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </button>
              <button
                onClick={handleClearCategoryFilter}
                className="h-8 px-2 flex items-center bg-indigo-50 border border-l-0 border-indigo-200 rounded-r-lg hover:bg-indigo-100 transition-colors"
              >
                <svg className="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ) : (
            <FilterButton
              label="Category"
              onClick={handleCategoryClick}
              isActive={isCategoryDropdownOpen}
            />
          )}

          {/* Category Dropdown */}
          {isCategoryDropdownOpen && (
            <CategoryFilterDropdown
              categories={categories}
              selectedCategories={categoryFilter}
              onSelectionChange={handleCategorySelectionChange}
              onClose={() => setIsCategoryDropdownOpen(false)}
            />
          )}
        </div>
      </div>

      {/* Right side controls */}
      <div className="flex items-center gap-1">
        {/* View toggle - Grid */}
        <FilterButton
          variant="icon-only"
          label=""
          icon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          }
        />

        {/* View toggle - Sort */}
        <FilterButton
          variant="icon-only"
          label=""
          icon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
            </svg>
          }
        />

        {/* Settings - Slider icon */}
        <FilterButton
          variant="icon-only"
          label=""
          onClick={onSettingsClick}
          icon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
          }
        />

        {/* Export All */}
        <button className="h-8 px-3 flex items-center gap-2 text-[13px] text-gray-700 hover:bg-gray-100 rounded-md transition-colors ml-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          <span className="font-medium">Export All</span>
        </button>
      </div>
    </div>
  );
};

export default TransactionsFilterBar;

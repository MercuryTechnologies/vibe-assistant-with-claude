import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { transactions as initialTransactions, glCodeOptions as initialGlCodeOptions, type Transaction } from './mockData';
import { avatarColors } from './tokens';
import type { CategoryRule } from './SettingsModal';
import { formatDateForDisplay } from './DataControlPanel';

// Category option type
interface CategoryOption {
  value: string;
  label: string;
}

// Rule condition type (used locally for CreateRuleModal)
interface RuleCondition {
  field: 'toFrom' | 'account' | 'method' | 'amount';
  operator: 'contains' | 'equals' | 'startsWith' | 'greaterThan' | 'lessThan';
  value: string;
}

// Re-export CategoryRule for convenience
export type { CategoryRule };

// Toast Component
interface ToastProps {
  message: string;
  merchantName: string;
  onCreateRule: () => void;
  onDismiss: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, merchantName, onCreateRule, onDismiss }) => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    // Trigger animation on mount
    requestAnimationFrame(() => setIsVisible(true));
    
    const timer = setTimeout(() => {
      onDismiss();
    }, 8000); // Auto-dismiss after 8 seconds
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div 
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ease-out
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
    >
      <div className="flex items-center gap-3 bg-[#1F2937] text-white pl-4 pr-2 py-3 rounded-xl shadow-2xl">
        {/* Sparkle icon */}
        <svg 
          className="w-5 h-5 text-white flex-shrink-0" 
          viewBox="0 0 24 24" 
          fill="currentColor"
        >
          <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
        </svg>
        
        <span className="text-[15px] font-medium">
          {message} — Create a rule for {merchantName}?
        </span>
        
        <button
          onClick={onCreateRule}
          className="ml-2 px-4 py-1.5 text-[14px] font-semibold text-[#C5D1E8] hover:text-white transition-colors"
        >
          Create
        </button>
        
        <button
          onClick={onDismiss}
          className="p-1 text-gray-400 hover:text-white transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

// Success Toast Component (for showing rule application results)
interface SuccessToastProps {
  message: string;
  onDismiss: () => void;
}

const SuccessToast: React.FC<SuccessToastProps> = ({ message, onDismiss }) => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    requestAnimationFrame(() => setIsVisible(true));
    
    const timer = setTimeout(() => {
      onDismiss();
    }, 5000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div 
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ease-out
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
    >
      <div className="flex items-center gap-3 bg-[#1F2937] text-white pl-4 pr-3 py-3 rounded-xl shadow-2xl">
        {/* Checkmark icon */}
        <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <span className="text-[15px] font-medium">
          {message}
        </span>
        
        <button
          onClick={onDismiss}
          className="ml-2 p-1 text-gray-400 hover:text-white transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

// Rule Created Toast Component (with link to Settings)
interface RuleCreatedToastProps {
  ruleName: string;
  onDismiss: () => void;
  onViewSettings: () => void;
}

const RuleCreatedToast: React.FC<RuleCreatedToastProps> = ({ ruleName, onDismiss, onViewSettings }) => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    requestAnimationFrame(() => setIsVisible(true));
    
    const timer = setTimeout(() => {
      onDismiss();
    }, 6000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div 
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ease-out
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
    >
      <div className="flex items-center gap-3 bg-[#1F2937] text-white pl-4 pr-2 py-3 rounded-xl shadow-2xl">
        {/* Sparkle icon */}
        <svg 
          className="w-5 h-5 text-indigo-400 flex-shrink-0" 
          viewBox="0 0 24 24" 
          fill="currentColor"
        >
          <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
        </svg>
        
        <span className="text-[15px]">
          Rule created: <span className="font-medium">{ruleName}</span>
        </span>
        
        <button
          onClick={() => {
            onViewSettings();
            onDismiss();
          }}
          className="ml-2 px-3 py-1.5 text-[13px] font-medium text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1"
        >
          View in Settings
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
        
        <button
          onClick={onDismiss}
          className="p-1 text-gray-400 hover:text-white transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

// Create Rule Modal Component
interface CreateRuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  merchantName: string;
  categoryLabel: string;
  categoryOptions: CategoryOption[];
  onSaveRule: (rule: CategoryRule) => void;
}

const CreateRuleModal: React.FC<CreateRuleModalProps> = ({ 
  isOpen, 
  onClose, 
  merchantName, 
  categoryLabel,
  categoryOptions,
  onSaveRule 
}) => {
  const [ruleName, setRuleName] = useState(`${merchantName} → ${categoryLabel}`);
  const [conditions, setConditions] = useState<RuleCondition[]>([
    { field: 'toFrom', operator: 'contains', value: merchantName }
  ]);
  const [selectedCategory, setSelectedCategory] = useState(categoryLabel);

  // Reset form when modal opens with new data
  useEffect(() => {
    if (isOpen) {
      setRuleName(`${merchantName} → ${categoryLabel}`);
      setConditions([{ field: 'toFrom', operator: 'contains', value: merchantName }]);
      setSelectedCategory(categoryLabel);
    }
  }, [isOpen, merchantName, categoryLabel]);

  const handleAddCondition = () => {
    setConditions([...conditions, { field: 'toFrom', operator: 'contains', value: '' }]);
  };

  const handleRemoveCondition = (index: number) => {
    setConditions(conditions.filter((_, i) => i !== index));
  };

  const handleConditionChange = (index: number, field: keyof RuleCondition, value: string) => {
    const newConditions = [...conditions];
    newConditions[index] = { ...newConditions[index], [field]: value };
    setConditions(newConditions);
  };

  const handleSave = () => {
    const rule: CategoryRule = {
      id: Date.now().toString(),
      name: ruleName,
      conditions,
      categoryLabel: selectedCategory,
    };
    onSaveRule(rule);
    onClose();
  };

  if (!isOpen) return null;

  const fieldOptions = [
    { value: 'toFrom', label: 'To/From' },
    { value: 'account', label: 'Account' },
    { value: 'method', label: 'Method' },
    { value: 'amount', label: 'Amount' },
  ];

  const operatorOptions = [
    { value: 'contains', label: 'contains' },
    { value: 'equals', label: 'equals' },
    { value: 'startsWith', label: 'starts with' },
    { value: 'greaterThan', label: 'greater than' },
    { value: 'lessThan', label: 'less than' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                <svg 
                  className="w-5 h-5 text-indigo-600" 
                  viewBox="0 0 24 24" 
                  fill="currentColor"
                >
                  <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 tracking-[-0.01em]">Create Category Rule</h2>
                <p className="text-sm text-gray-500">Automatically categorize matching transactions</p>
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
        
        {/* Body */}
        <div className="px-6 py-5 space-y-5">
          {/* Rule Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rule Name
            </label>
            <input
              type="text"
              value={ruleName}
              onChange={(e) => setRuleName(e.target.value)}
              className="w-full h-10 px-4 text-sm rounded-lg border border-gray-200 
                       focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* Conditions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              When transaction matches
            </label>
            <div className="space-y-3">
              {conditions.map((condition, index) => (
                <div key={index} className="flex items-center gap-2">
                  {index > 0 && (
                    <span className="text-xs font-medium text-gray-400 w-8">AND</span>
                  )}
                  <select
                    value={condition.field}
                    onChange={(e) => handleConditionChange(index, 'field', e.target.value)}
                    className={`${index === 0 ? 'flex-1' : 'flex-1'} h-9 px-3 text-sm rounded-lg border border-gray-200 
                             focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white`}
                  >
                    {fieldOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  <select
                    value={condition.operator}
                    onChange={(e) => handleConditionChange(index, 'operator', e.target.value)}
                    className="w-32 h-9 px-3 text-sm rounded-lg border border-gray-200 
                             focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                  >
                    {operatorOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={condition.value}
                    onChange={(e) => handleConditionChange(index, 'value', e.target.value)}
                    placeholder="Value"
                    className="flex-1 h-9 px-3 text-sm rounded-lg border border-gray-200 
                             focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  {conditions.length > 1 && (
                    <button
                      onClick={() => handleRemoveCondition(index)}
                      className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-500 
                               hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              onClick={handleAddCondition}
              className="mt-3 text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add condition
            </button>
          </div>

          {/* Category Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Set category to
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full h-10 px-4 text-sm rounded-lg border border-gray-200 
                       focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
            >
              {categoryOptions.filter(opt => opt.value).map(opt => (
                <option key={opt.value} value={opt.label}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Preview */}
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Preview</p>
            <p className="text-sm text-gray-700">
              When <span className="font-medium text-gray-900">{conditions[0]?.field === 'toFrom' ? 'To/From' : conditions[0]?.field}</span>
              {' '}<span className="text-gray-500">{conditions[0]?.operator}</span>{' '}
              "<span className="font-medium text-gray-900">{conditions[0]?.value}</span>",
              set category to <span className="font-medium text-indigo-600">{selectedCategory}</span>
            </p>
          </div>
        </div>
        
        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 
                     hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!ruleName.trim() || conditions.some(c => !c.value.trim())}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 
                     hover:bg-indigo-700 rounded-lg transition-colors
                     disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Create Rule
          </button>
        </div>
      </div>
    </div>
  );
};

// Column configuration
interface ColumnConfig {
  id: string;
  label: string;
  minWidth: number;
  defaultWidth: number;
  align?: 'left' | 'center' | 'right';
  fixed?: boolean;
}

const columns: ColumnConfig[] = [
  { id: 'checkbox', label: '', minWidth: 48, defaultWidth: 48, align: 'center', fixed: true },
  { id: 'date', label: 'Date', minWidth: 60, defaultWidth: 80, align: 'left' },
  { id: 'toFrom', label: 'To/From', minWidth: 150, defaultWidth: 280, align: 'left' },
  { id: 'amount', label: 'Amount', minWidth: 80, defaultWidth: 120, align: 'right' },
  { id: 'account', label: 'Account', minWidth: 80, defaultWidth: 120, align: 'left' },
  { id: 'method', label: 'Method', minWidth: 120, defaultWidth: 200, align: 'left' },
  { id: 'category', label: 'Category', minWidth: 100, defaultWidth: 180, align: 'left' },
  { id: 'attachment', label: 'Attachment', minWidth: 50, defaultWidth: 80, align: 'center' },
];

// Format currency with proper formatting
const formatAmount = (amount: number): { text: string; isNegative: boolean } => {
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  
  // Split into dollars and cents
  const [dollars, cents] = absAmount.toFixed(2).split('.');
  const formattedDollars = Number(dollars).toLocaleString();
  
  return {
    text: `${isNegative ? '–' : ''}$${formattedDollars}.${cents}`,
    isNegative,
  };
};

// Avatar component for To/From column (based on Figma DSAvatar component)
interface AvatarProps {
  initials: string;
  icon?: string;
  size?: 'small' | 'medium' | 'large';
}

const Avatar: React.FC<AvatarProps> = ({ initials, icon, size = 'large' }) => {
  // Size mappings
  const sizeClasses = {
    small: 'w-6 h-6 text-[10px]',
    medium: 'w-7 h-7 text-[11px]',
    large: 'w-8 h-8 text-[12px]',
  };
  
  // Get color based on initials - using a consistent sage/mint palette
  const getAvatarColor = (init: string): { bg: string; text: string } => {
    // Use custom colors if defined, otherwise use default sage color
    if (avatarColors[init]) {
      return avatarColors[init];
    }
    // Default: light sage/mint background with dark text (matching Figma design)
    return { bg: '#DBE5E0', text: '#374151' };
  };
  
  const colors = getAvatarColor(initials);
  
  if (icon === 'mercury') {
    return (
      <div className={`${sizeClasses[size]} rounded-full bg-[#DBE5E0] flex items-center justify-center overflow-hidden flex-shrink-0`}>
        <svg className="w-4 h-4 text-gray-600" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.5" />
          <path d="M12 8v8M8 12h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
    );
  }
  
  return (
    <div 
      className={`${sizeClasses[size]} rounded-full flex items-center justify-center font-medium flex-shrink-0 tracking-[0.2px]`}
      style={{ backgroundColor: colors.bg, color: colors.text }}
    >
      {initials}
    </div>
  );
};

// Status badge component
interface StatusBadgeProps {
  status: 'completed' | 'failed' | 'pending';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  if (status === 'failed') {
    return (
      <span className="ml-2 px-2 py-0.5 text-[11px] font-medium bg-red-50 text-red-600 rounded flex-shrink-0">
        Failed
      </span>
    );
  }
  return null;
};

// Method cell component
interface MethodCellProps {
  method: Transaction['method'];
}

const MethodCell: React.FC<MethodCellProps> = ({ method }) => {
  const getIcon = () => {
    switch (method.type) {
      case 'loan':
        return (
          <span className="text-gray-400 mr-1.5">←</span>
        );
      case 'invoice':
        return (
          <span className="text-gray-400 mr-1.5">{method.direction === 'in' ? '→' : '←'}</span>
        );
      case 'transfer':
        return (
          <span className="text-gray-400 mr-1.5">{method.direction === 'in' ? '→' : '←'}</span>
        );
      case 'card':
        return (
          <svg className="w-4 h-4 text-gray-400 mr-1.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getLabel = () => {
    switch (method.type) {
      case 'loan':
        return 'Working Capital Loan Payment';
      case 'invoice':
        return 'Request or Invoice Payment';
      case 'transfer':
        return 'Transfer';
      case 'card':
        return `${method.cardHolder} ••${method.cardLast4}`;
      default:
        return '';
    }
  };

  return (
    <div className="flex items-center body-default truncate">
      {getIcon()}
      <span className="truncate">{getLabel()}</span>
    </div>
  );
};

// Add New Category Modal
interface AddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (category: CategoryOption) => void;
}

const AddCategoryModal: React.FC<AddCategoryModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [categoryName, setCategoryName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (categoryName.trim()) {
      const value = categoryName.trim().toLowerCase().replace(/\s+/g, '-');
      onAdd({ value, label: categoryName.trim() });
      setCategoryName('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 tracking-[-0.01em]">Add New Category</h2>
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
        
        {/* Body */}
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category Name
            </label>
            <input
              ref={inputRef}
              type="text"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder="e.g., Equipment, Insurance, Utilities"
              className="w-full h-10 px-4 text-sm rounded-lg border border-gray-200 
                       focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                       placeholder:text-gray-400"
            />
            <p className="mt-2 text-xs text-gray-500">
              This category will be available for all transactions.
            </p>
          </div>
          
          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 
                       hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!categoryName.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 
                       hover:bg-indigo-700 rounded-lg transition-colors
                       disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add Category
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Category dropdown component with combobox search
interface CategoryDropdownProps {
  value?: string;
  isAutoApplied?: boolean;
  merchantName?: string;
  options: CategoryOption[];
  onChange?: (value: string) => void;
  onAddNew?: () => void;
  onCreateRule?: () => void;
}

const CategoryDropdown: React.FC<CategoryDropdownProps> = ({ 
  value, 
  isAutoApplied, 
  merchantName,
  options, 
  onChange, 
  onAddNew,
  onCreateRule,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const selectedOption = options.find(opt => opt.label === value);
  
  // Show create rule option if auto-applied and has a value
  const showCreateRuleOption = isAutoApplied && value && !searchQuery;

  // Filter options based on search query
  const filteredOptions = options.filter(opt => 
    opt.value && opt.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus input when dropdown opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      setHighlightedIndex(0);
    }
  }, [isOpen]);

  // Reset highlighted index when search changes
  useEffect(() => {
    setHighlightedIndex(0);
  }, [searchQuery]);

  const handleSelect = (option: CategoryOption) => {
    onChange?.(option.label);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Total items: "No category" + filtered options + "Add new category"
    const totalItems = filteredOptions.length + 2;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => (prev + 1) % totalItems);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => (prev - 1 + totalItems) % totalItems);
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex === 0) {
          // "No category" option
          handleSelect({ value: '', label: '' });
        } else if (highlightedIndex <= filteredOptions.length) {
          // Regular category option
          handleSelect(filteredOptions[highlightedIndex - 1]);
        } else {
          // "Add new category" option
          setIsOpen(false);
          setSearchQuery('');
          onAddNew?.();
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setSearchQuery('');
        break;
    }
  };

  // Highlight matching text in option label
  const highlightMatch = (text: string) => {
    if (!searchQuery) return text;
    const regex = new RegExp(`(${searchQuery})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) => 
      regex.test(part) ? (
        <span key={i} className="bg-yellow-100 text-yellow-800 font-medium">{part}</span>
      ) : part
    );
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full h-8 px-3 text-[13px] rounded-md border text-left cursor-pointer
          ${isAutoApplied && value ? 'pr-14' : 'pr-8'}
          ${value 
            ? 'border-gray-200 bg-white text-gray-700' 
            : 'border-gray-200 bg-white text-gray-400'
          }
          hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
        `}
      >
        <span className="truncate block">{value || 'Select category'}</span>
      </button>
      <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none flex items-center gap-1.5">
        {/* Auto-applied sparkle icon */}
        {isAutoApplied && value && (
          <svg 
            className="w-4 h-4 text-indigo-600" 
            viewBox="0 0 24 24" 
            fill="currentColor"
            aria-label="Automatically categorized"
          >
            <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
          </svg>
        )}
        <svg 
          className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full min-w-[220px] bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
          {/* Create Rule option - shown first for auto-applied categories */}
          {showCreateRuleOption && (
            <>
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onCreateRule?.();
                }}
                className="w-full px-3 py-2.5 text-left text-[13px] text-indigo-600 hover:bg-indigo-50 flex items-center gap-2 border-b border-gray-100"
              >
                <svg 
                  className="w-4 h-4 flex-shrink-0" 
                  viewBox="0 0 24 24" 
                  fill="currentColor"
                >
                  <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                </svg>
                <span className="font-medium">Create rule for "{value}"</span>
              </button>
            </>
          )}
          
          {/* Search input */}
          <div className="p-2 border-b border-gray-100">
            <div className="relative">
              <svg 
                className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" 
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
                onKeyDown={handleKeyDown}
                placeholder="Search categories..."
                className="w-full h-8 pl-8 pr-3 text-[13px] rounded-md border border-gray-200 
                         focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                         placeholder:text-gray-400"
              />
            </div>
          </div>
          
          {/* Options list */}
          <div ref={listRef} className="max-h-48 overflow-auto py-1">
            {/* Empty option */}
            <button
              type="button"
              onClick={() => handleSelect({ value: '', label: '' })}
              className={`
                w-full px-3 py-2 text-left text-[13px] text-gray-400
                ${highlightedIndex === 0 ? 'bg-gray-100' : 'hover:bg-gray-50'}
              `}
            >
              No category
            </button>
            
            {/* Divider */}
            {filteredOptions.length > 0 && <div className="border-t border-gray-100 my-1" />}
            
            {/* Category options */}
            {filteredOptions.map((option, index) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option)}
                className={`
                  w-full px-3 py-2 text-left text-[13px] flex items-center justify-between
                  ${highlightedIndex === index + 1 ? 'bg-gray-100' : 'hover:bg-gray-50'}
                  ${selectedOption?.value === option.value ? 'text-indigo-700' : 'text-gray-700'}
                `}
              >
                <span>{highlightMatch(option.label)}</span>
                {selectedOption?.value === option.value && (
                  <svg className="w-4 h-4 text-indigo-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            ))}
            
            {/* No results message */}
            {filteredOptions.length === 0 && searchQuery && (
              <div className="px-3 py-2 text-[13px] text-gray-400 text-center">
                No categories found
              </div>
            )}
            
            {/* Divider */}
            <div className="border-t border-gray-100 my-1" />
            
            {/* Add new category option */}
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                setSearchQuery('');
                onAddNew?.();
              }}
              className={`
                w-full px-3 py-2 text-left text-[13px] text-indigo-600 flex items-center gap-2
                ${highlightedIndex === filteredOptions.length + 1 ? 'bg-indigo-50' : 'hover:bg-indigo-50'}
              `}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add new category
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Attachment cell component
interface AttachmentCellProps {
  hasAttachment?: boolean;
}

const AttachmentCell: React.FC<AttachmentCellProps> = ({ hasAttachment }) => {
  if (hasAttachment) {
    return (
      <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </button>
    );
  }
  
  return (
    <button className="w-8 h-8 flex items-center justify-center text-gray-300 hover:text-gray-500 hover:bg-gray-100 rounded transition-colors">
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
    </button>
  );
};

// Resize handle component
interface ResizeHandleProps {
  onMouseDown: (e: React.MouseEvent) => void;
}

const ResizeHandle: React.FC<ResizeHandleProps> = ({ onMouseDown }) => (
  <div
    className="absolute right-0 top-0 h-full w-[6px] cursor-col-resize group flex items-center justify-center"
    onMouseDown={onMouseDown}
  >
    <div className="w-[2px] h-4 bg-transparent group-hover:bg-gray-300 transition-colors rounded-full" />
  </div>
);

// Column visibility type
interface ColumnVisibility {
  checkbox: boolean;
  date: boolean;
  toFrom: boolean;
  amount: boolean;
  account: boolean;
  method: boolean;
  category: boolean;
  attachment: boolean;
}

// Main table component props
interface TransactionsTableProps {
  transactions?: Transaction[];
  onTransactionsChange?: (transactions: Transaction[]) => void;
  columnVisibility?: ColumnVisibility;
  rules?: CategoryRule[];
  onRulesChange?: (rules: CategoryRule[]) => void;
  onOpenSettings?: (ruleId?: string) => void;
  /** ID of transaction to highlight (from scatter plot hover) */
  highlightedTransactionId?: string | null;
  /** ID of transaction to scroll to (from scatter plot click) */
  scrollToTransactionId?: string | null;
  /** Callback when scroll is complete */
  onScrollComplete?: () => void;
  /** Callback when a row is clicked */
  onRowClick?: (transaction: Transaction) => void;
  /** Category filter - only show transactions with these categories */
  categoryFilter?: string[];
  /** Callback to clear category filter */
  onClearCategoryFilter?: () => void;
}

// Default column visibility
const defaultColumnVisibility: ColumnVisibility = {
  checkbox: true,
  date: true,
  toFrom: true,
  amount: true,
  account: true,
  method: true,
  category: true,
  attachment: true,
};

// Main table component
const TransactionsTable: React.FC<TransactionsTableProps> = ({ 
  transactions: propTransactions, 
  onTransactionsChange,
  columnVisibility = defaultColumnVisibility,
  rules: propRules,
  onRulesChange,
  onOpenSettings,
  highlightedTransactionId,
  scrollToTransactionId,
  onScrollComplete,
  onRowClick,
  categoryFilter,
  onClearCategoryFilter,
}) => {
  // Refs for scrolling to transactions
  const rowRefs = useRef<Record<string, HTMLTableRowElement | null>>({});
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [sortField, setSortField] = useState<'date' | 'amount'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  // Track if highlighted row is outside viewport
  const [highlightPosition, setHighlightPosition] = useState<'above' | 'below' | 'visible' | null>(null);
  
  // Transaction data state (so we can update categories)
  const [transactionsData, setTransactionsData] = useState<Transaction[]>(propTransactions || initialTransactions);
  
  // Track if we're syncing from props to avoid infinite loops
  const [isSyncingFromProps, setIsSyncingFromProps] = useState(false);
  
  // Sync with prop changes
  useEffect(() => {
    if (propTransactions) {
      setIsSyncingFromProps(true);
      setTransactionsData(propTransactions);
      setSelectedRows(new Set()); // Clear selection when data changes
    }
  }, [propTransactions]);
  
  // Notify parent when transactions change (but not when syncing from props)
  useEffect(() => {
    if (isSyncingFromProps) {
      setIsSyncingFromProps(false);
      return;
    }
    onTransactionsChange?.(transactionsData);
  }, [transactionsData, onTransactionsChange, isSyncingFromProps]);

  // Scroll to transaction when scrollToTransactionId changes
  useEffect(() => {
    if (scrollToTransactionId && rowRefs.current[scrollToTransactionId]) {
      const row = rowRefs.current[scrollToTransactionId];
      row?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Notify parent that scroll is complete
      setTimeout(() => {
        onScrollComplete?.();
      }, 500);
    }
  }, [scrollToTransactionId, onScrollComplete]);

  // Check if highlighted row is outside viewport
  useEffect(() => {
    if (!highlightedTransactionId) {
      setHighlightPosition(null);
      return;
    }

    const checkPosition = () => {
      const row = rowRefs.current[highlightedTransactionId];
      if (!row) {
        setHighlightPosition(null);
        return;
      }

      const rect = row.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      if (rect.bottom < 0) {
        setHighlightPosition('above');
      } else if (rect.top > viewportHeight) {
        setHighlightPosition('below');
      } else {
        setHighlightPosition('visible');
      }
    };

    checkPosition();
    
    // Also check on scroll
    window.addEventListener('scroll', checkPosition, { passive: true });
    return () => window.removeEventListener('scroll', checkPosition);
  }, [highlightedTransactionId]);
  
  // Category options state (so we can add new ones)
  const [categoryOptions, setCategoryOptions] = useState<CategoryOption[]>(initialGlCodeOptions);
  
  // Modal state
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [pendingCategoryTransactionId, setPendingCategoryTransactionId] = useState<string | null>(null);
  
  // Toast state for "Create Rule" prompt
  const [toastData, setToastData] = useState<{
    visible: boolean;
    merchantName: string;
    categoryLabel: string;
    transactionId: string;
  } | null>(null);
  
  // Create Rule Modal state
  const [isCreateRuleModalOpen, setIsCreateRuleModalOpen] = useState(false);
  const [ruleModalData, setRuleModalData] = useState<{
    merchantName: string;
    categoryLabel: string;
  }>({ merchantName: '', categoryLabel: '' });
  
  // Use rules from props or local state
  const savedRules = propRules || [];
  const setSavedRules = (newRules: CategoryRule[] | ((prev: CategoryRule[]) => CategoryRule[])) => {
    if (onRulesChange) {
      if (typeof newRules === 'function') {
        onRulesChange(newRules(savedRules));
      } else {
        onRulesChange(newRules);
      }
    }
  };
  
  // Filter visible columns
  const visibleColumns = columns.filter(col => columnVisibility[col.id as keyof ColumnVisibility]);
  
  // Filter transactions by category (multi-select)
  const filteredTransactions = useMemo(() => {
    if (!categoryFilter || categoryFilter.length === 0) return transactionsData;
    
    return transactionsData.filter(t => {
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
  }, [transactionsData, categoryFilter]);
  
  // Column widths state
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(() => {
    const widths: Record<string, number> = {};
    columns.forEach(col => {
      widths[col.id] = col.defaultWidth;
    });
    return widths;
  });
  
  // Handle category change for a transaction (clears auto-applied flag since it's now manual)
  const handleCategoryChange = (transactionId: string, categoryLabel: string) => {
    // Find the transaction to get the merchant name
    const transaction = transactionsData.find(t => t.id === transactionId);
    
    setTransactionsData(prev => 
      prev.map(t => 
        t.id === transactionId 
          ? { ...t, glCode: categoryLabel || undefined, glCodeAutoApplied: false }
          : t
      )
    );
    
    // Show toast to prompt creating a rule (only if a category was selected)
    if (categoryLabel && transaction) {
      setToastData({
        visible: true,
        merchantName: transaction.toFrom.name,
        categoryLabel,
        transactionId,
      });
    }
  };
  
  // Handle opening create rule modal from toast
  const handleOpenCreateRuleModal = () => {
    if (toastData) {
      setRuleModalData({
        merchantName: toastData.merchantName,
        categoryLabel: toastData.categoryLabel,
      });
      setToastData(null);
      setIsCreateRuleModalOpen(true);
    }
  };
  
  // Success toast state for rule application
  const [successToast, setSuccessToast] = useState<{
    visible: boolean;
    message: string;
  } | null>(null);
  
  // Rule created toast state (with Settings link)
  const [ruleCreatedToast, setRuleCreatedToast] = useState<{
    visible: boolean;
    ruleName: string;
    ruleId: string;
  } | null>(null);
  
  // Check if a transaction matches a rule's conditions
  const transactionMatchesRule = (transaction: Transaction, rule: CategoryRule): boolean => {
    return rule.conditions.every(condition => {
      let fieldValue: string = '';
      
      switch (condition.field) {
        case 'toFrom':
          fieldValue = transaction.toFrom.name.toLowerCase();
          break;
        case 'account':
          fieldValue = transaction.account.toLowerCase();
          break;
        case 'method':
          if (transaction.method.type === 'card') {
            fieldValue = `card ${transaction.method.cardLast4 || ''} ${transaction.method.cardHolder || ''}`.toLowerCase();
          } else {
            fieldValue = transaction.method.type.toLowerCase();
          }
          break;
        case 'amount':
          fieldValue = Math.abs(transaction.amount).toString();
          break;
        default:
          return false;
      }
      
      const conditionValue = condition.value.toLowerCase();
      
      switch (condition.operator) {
        case 'contains':
          return fieldValue.includes(conditionValue);
        case 'equals':
          return fieldValue === conditionValue;
        case 'startsWith':
          return fieldValue.startsWith(conditionValue);
        case 'greaterThan':
          return parseFloat(fieldValue) > parseFloat(conditionValue);
        case 'lessThan':
          return parseFloat(fieldValue) < parseFloat(conditionValue);
        default:
          return false;
      }
    });
  };
  
  // Handle saving a new rule and apply it to matching transactions
  const handleSaveRule = (rule: CategoryRule) => {
    setSavedRules(prev => [...prev, rule]);
    
    // Find all transactions that match the rule and don't already have this category
    const matchingTransactions = transactionsData.filter(t => 
      transactionMatchesRule(t, rule) && t.glCode !== rule.categoryLabel
    );
    
    if (matchingTransactions.length > 0) {
      // Apply the category to all matching transactions
      setTransactionsData(prev => 
        prev.map(t => 
          transactionMatchesRule(t, rule)
            ? { ...t, glCode: rule.categoryLabel, glCodeAutoApplied: true }
            : t
        )
      );
      
      // Show success toast with count
      const count = matchingTransactions.length;
      setSuccessToast({
        visible: true,
        message: `${count} transaction${count !== 1 ? 's' : ''} categorized as "${rule.categoryLabel}"`,
      });
    }
  };
  
  // Handle quick rule creation from dropdown (for auto-applied categories)
  const handleQuickCreateRule = (transactionId: string) => {
    const transaction = transactionsData.find(t => t.id === transactionId);
    if (!transaction || !transaction.glCode) return;
    
    const ruleName = `${transaction.toFrom.name} → ${transaction.glCode}`;
    const rule: CategoryRule = {
      id: Date.now().toString(),
      name: ruleName,
      conditions: [
        { field: 'toFrom', operator: 'contains', value: transaction.toFrom.name }
      ],
      categoryLabel: transaction.glCode,
    };
    
    // Save the rule
    setSavedRules(prev => [...prev, rule]);
    
    // Show the rule created toast
    setRuleCreatedToast({
      visible: true,
      ruleName,
      ruleId: rule.id,
    });
  };
  
  // Handle viewing Settings - opens the settings modal and navigates to the rule
  const handleViewSettings = () => {
    onOpenSettings?.(ruleCreatedToast?.ruleId);
  };
  
  // Handle adding a new category
  const handleAddCategory = (newCategory: CategoryOption) => {
    setCategoryOptions(prev => [...prev, newCategory]);
    
    // If there was a pending transaction, also set its category
    if (pendingCategoryTransactionId) {
      handleCategoryChange(pendingCategoryTransactionId, newCategory.label);
      setPendingCategoryTransactionId(null);
    }
  };
  
  // Handle opening the add category modal
  const handleOpenAddCategoryModal = (transactionId: string) => {
    setPendingCategoryTransactionId(transactionId);
    setIsAddCategoryModalOpen(true);
  };

  // Resize state
  const resizingRef = useRef<{
    columnId: string;
    startX: number;
    startWidth: number;
  } | null>(null);

  const handleMouseDown = useCallback((columnId: string, e: React.MouseEvent) => {
    e.preventDefault();
    const column = columns.find(c => c.id === columnId);
    if (!column || column.fixed) return;

    resizingRef.current = {
      columnId,
      startX: e.clientX,
      startWidth: columnWidths[columnId],
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!resizingRef.current) return;
      
      const { columnId, startX, startWidth } = resizingRef.current;
      const column = columns.find(c => c.id === columnId);
      if (!column) return;

      const diff = e.clientX - startX;
      const newWidth = Math.max(column.minWidth, startWidth + diff);
      
      setColumnWidths(prev => ({
        ...prev,
        [columnId]: newWidth,
      }));
    };

    const handleMouseUp = () => {
      resizingRef.current = null;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, [columnWidths]);

  const toggleRow = (id: string) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedRows(newSelected);
  };

  const toggleAll = () => {
    if (selectedRows.size === filteredTransactions.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(filteredTransactions.map(t => t.id)));
    }
  };

  const handleSort = (field: 'date' | 'amount') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getAlignmentClass = (align?: 'left' | 'center' | 'right') => {
    switch (align) {
      case 'center': return 'text-center';
      case 'right': return 'text-right';
      default: return 'text-left';
    }
  };

  const hasActiveFilter = categoryFilter && categoryFilter.length > 0;
  const filterDisplayText = hasActiveFilter
    ? categoryFilter.length === 1
      ? categoryFilter[0]
      : `${categoryFilter.length} categories`
    : '';

  return (
    <>
    <div className="overflow-x-auto">
      <table className="w-full" style={{ tableLayout: 'fixed' }}>
        <thead>
          <tr className="border-b border-gray-200">
            {visibleColumns.map((column, index) => (
              <th 
                key={column.id}
                className="py-1 relative select-none align-middle"
                style={{ width: columnWidths[column.id] }}
              >
                {column.id === 'checkbox' ? (
                  <div className="pl-[16px] pr-[8px] text-left">
                    <input
                      type="checkbox"
                      checked={selectedRows.size === filteredTransactions.length && filteredTransactions.length > 0}
                      onChange={toggleAll}
                      className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                  </div>
                ) : column.id === 'date' ? (
                  <button 
                    onClick={() => handleSort('date')}
                    className="flex items-center gap-1 text-label-demi text-[color:var(--ds-text-secondary)] hover:text-[color:var(--ds-text-default)]"
                  >
                    {column.label}
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                ) : (
                  <div className={`text-label-demi text-[color:var(--ds-text-secondary)] ${column.align === 'right' ? 'text-right pr-6' : column.align === 'center' ? 'text-center' : 'text-left'}`}>
                    {column.label}
                  </div>
                )}
                
                {/* Resize handle - don't show for last column or fixed columns */}
                {index < visibleColumns.length - 1 && !column.fixed && (
                  <ResizeHandle onMouseDown={(e) => handleMouseDown(column.id, e)} />
                )}
              </th>
            ))}
          </tr>
        </thead>
        
        <tbody>
          {filteredTransactions.map((transaction) => {
            const amount = formatAmount(transaction.amount);
            const isSelected = selectedRows.has(transaction.id);
            const isFailed = transaction.status === 'failed';
            const isHighlighted = highlightedTransactionId === transaction.id;
            
            return (
              <tr 
                key={transaction.id}
                ref={(el) => { rowRefs.current[transaction.id] = el; }}
                onClick={() => onRowClick?.(transaction)}
                className={`
                  border-b border-gray-100 hover:bg-gray-50 transition-all duration-150 cursor-pointer
                  ${(isSelected || isHighlighted) ? 'bg-indigo-50 hover:bg-indigo-50' : ''}
                `}
              >
                {/* Checkbox */}
                {columnVisibility.checkbox && (
                  <td className="py-3" style={{ width: columnWidths['checkbox'] }} onClick={(e) => e.stopPropagation()}>
                    <div className="pl-[16px] pr-[8px]">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleRow(transaction.id)}
                        className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      />
                    </div>
                  </td>
                )}
                
                {/* Date */}
                {columnVisibility.date && (
                  <td className="py-3" style={{ width: columnWidths['date'] }}>
                    <span className="body-default truncate block">{formatDateForDisplay(transaction.date)}</span>
                  </td>
                )}
                
                {/* To/From */}
                {columnVisibility.toFrom && (
                  <td className="py-3" style={{ width: columnWidths['toFrom'] }}>
                    <div className="flex items-center gap-3 overflow-hidden">
                      <Avatar 
                        initials={transaction.toFrom.initials} 
                        icon={transaction.toFrom.icon}
                      />
                      <span className="body-default-demi text-[color:var(--ds-text-title)] truncate">
                        {transaction.toFrom.name}
                      </span>
                      <StatusBadge status={transaction.status || 'completed'} />
                    </div>
                  </td>
                )}
                
                {/* Amount */}
                {columnVisibility.amount && (
                  <td className="py-3 text-right pr-6" style={{ width: columnWidths['amount'] }}>
                    <span 
                      className={`
                        body-default-demi
                        ${isFailed 
                          ? 'text-emerald-600 line-through' 
                          : amount.isNegative 
                            ? 'text-[color:var(--ds-text-title)]' 
                            : 'text-emerald-600'
                        }
                      `}
                    >
                      {isFailed ? formatAmount(Math.abs(transaction.amount)).text : amount.text}
                    </span>
                  </td>
                )}
                
                {/* Account */}
                {columnVisibility.account && (
                  <td className="py-3" style={{ width: columnWidths['account'] }}>
                    <span className="body-default truncate block">{transaction.account}</span>
                  </td>
                )}
                
                {/* Method */}
                {columnVisibility.method && (
                  <td className="py-3" style={{ width: columnWidths['method'] }}>
                    <MethodCell method={transaction.method} />
                  </td>
                )}
                
                {/* Category */}
                {columnVisibility.category && (
                  <td className="py-3" style={{ width: columnWidths['category'] }} onClick={(e) => e.stopPropagation()}>
                    <CategoryDropdown 
                      value={transaction.glCode} 
                      isAutoApplied={transaction.glCodeAutoApplied}
                      merchantName={transaction.toFrom.name}
                      options={categoryOptions}
                      onChange={(value) => handleCategoryChange(transaction.id, value)}
                      onAddNew={() => handleOpenAddCategoryModal(transaction.id)}
                      onCreateRule={() => handleQuickCreateRule(transaction.id)}
                    />
                  </td>
                )}
                
                {/* Attachment */}
                {columnVisibility.attachment && (
                  <td className="py-3" style={{ width: columnWidths['attachment'] }} onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-center">
                      <AttachmentCell hasAttachment={transaction.hasAttachment} />
                    </div>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
    
    {/* Add Category Modal */}
    <AddCategoryModal
      isOpen={isAddCategoryModalOpen}
      onClose={() => {
        setIsAddCategoryModalOpen(false);
        setPendingCategoryTransactionId(null);
      }}
      onAdd={handleAddCategory}
    />
    
    {/* Toast for "Create Rule" prompt */}
    {toastData?.visible && (
      <Toast
        message="Category updated"
        merchantName={toastData.merchantName}
        onCreateRule={handleOpenCreateRuleModal}
        onDismiss={() => setToastData(null)}
      />
    )}
    
    {/* Create Rule Modal */}
    <CreateRuleModal
      isOpen={isCreateRuleModalOpen}
      onClose={() => setIsCreateRuleModalOpen(false)}
      merchantName={ruleModalData.merchantName}
      categoryLabel={ruleModalData.categoryLabel}
      categoryOptions={categoryOptions}
      onSaveRule={handleSaveRule}
    />
    
    {/* Success Toast for rule application results */}
    {successToast?.visible && (
      <SuccessToast
        message={successToast.message}
        onDismiss={() => setSuccessToast(null)}
      />
    )}
    
    {/* Rule Created Toast with Settings link */}
    {ruleCreatedToast?.visible && (
      <RuleCreatedToast
        ruleName={ruleCreatedToast.ruleName}
        onDismiss={() => setRuleCreatedToast(null)}
        onViewSettings={handleViewSettings}
      />
    )}
    
    {/* Indicator when highlighted row is below viewport */}
    {highlightPosition === 'below' && (
      <div 
        className="fixed bottom-0 left-0 right-0 h-1 bg-indigo-500 z-40 pointer-events-none"
        style={{ 
          boxShadow: '0 0 8px 2px rgba(99, 102, 241, 0.5)',
        }}
      />
    )}
    </>
  );
};

export default TransactionsTable;

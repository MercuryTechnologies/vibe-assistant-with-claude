import React, { useState, useMemo, useEffect, useRef } from 'react';
import { type Transaction, glCodeOptions } from './mockData';

// Rule types (matching TransactionsTable)
interface RuleCondition {
  field: 'toFrom' | 'account' | 'method' | 'amount';
  operator: 'contains' | 'equals' | 'startsWith' | 'greaterThan' | 'lessThan';
  value: string;
}

export interface CategoryRule {
  id: string;
  name: string;
  conditions: RuleCondition[];
  categoryLabel: string;
  enabled?: boolean;
}

// Category stats type
interface CategoryStats {
  name: string;
  transactionCount: number;
  totalAmount: number;
}

// Column visibility configuration
export interface ColumnVisibility {
  checkbox: boolean;
  date: boolean;
  toFrom: boolean;
  amount: boolean;
  account: boolean;
  method: boolean;
  category: boolean;
  attachment: boolean;
}

// Page settings
export interface PageSettings {
  showChartsExpanded: boolean;
  columnVisibility: ColumnVisibility;
}

export const defaultColumnVisibility: ColumnVisibility = {
  checkbox: true,
  date: true,
  toFrom: true,
  amount: true,
  account: true,
  method: true,
  category: true,
  attachment: true,
};

export const defaultPageSettings: PageSettings = {
  showChartsExpanded: true,
  columnVisibility: defaultColumnVisibility,
};

// Column labels for display
const columnLabels: Record<keyof ColumnVisibility, string> = {
  checkbox: 'Checkbox',
  date: 'Date',
  toFrom: 'To/From',
  amount: 'Amount',
  account: 'Account',
  method: 'Method',
  category: 'Category',
  attachment: 'Attachment',
};

// Field and operator options for rule editing
const fieldOptions: { value: RuleCondition['field']; label: string }[] = [
  { value: 'toFrom', label: 'To/From' },
  { value: 'account', label: 'Account' },
  { value: 'method', label: 'Method' },
  { value: 'amount', label: 'Amount' },
];

const operatorOptions: { value: RuleCondition['operator']; label: string }[] = [
  { value: 'contains', label: 'contains' },
  { value: 'equals', label: 'equals' },
  { value: 'startsWith', label: 'starts with' },
  { value: 'greaterThan', label: 'greater than' },
  { value: 'lessThan', label: 'less than' },
];

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: PageSettings;
  onSettingsChange: (settings: PageSettings) => void;
  rules: CategoryRule[];
  onRulesChange: (rules: CategoryRule[]) => void;
  onDeleteRule: (ruleId: string) => void;
  transactions?: Transaction[];
  categoryOptions?: { value: string; label: string }[];
  onViewCategoryTransactions?: (category: string) => void;
  highlightedRuleId?: string | null;
  onClearHighlightedRule?: () => void;
}

// Tab type
type SettingsTab = 'general' | 'columns' | 'rules' | 'categories';

// Edit Rule Modal Component
interface EditRuleModalProps {
  rule: CategoryRule;
  onSave: (rule: CategoryRule) => void;
  onCancel: () => void;
  categoryOptions: { value: string; label: string }[];
}

const EditRuleModal: React.FC<EditRuleModalProps> = ({ rule, onSave, onCancel, categoryOptions }) => {
  const [editedRule, setEditedRule] = useState<CategoryRule>({ ...rule });

  const handleConditionChange = (index: number, field: keyof RuleCondition, value: string) => {
    const newConditions = [...editedRule.conditions];
    newConditions[index] = { ...newConditions[index], [field]: value };
    setEditedRule({ ...editedRule, conditions: newConditions });
  };

  const handleAddCondition = () => {
    setEditedRule({
      ...editedRule,
      conditions: [...editedRule.conditions, { field: 'toFrom', operator: 'contains', value: '' }],
    });
  };

  const handleRemoveCondition = (index: number) => {
    if (editedRule.conditions.length > 1) {
      const newConditions = editedRule.conditions.filter((_, i) => i !== index);
      setEditedRule({ ...editedRule, conditions: newConditions });
    }
  };

  // Filter out empty category option
  const availableCategories = categoryOptions.filter(opt => opt.value);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onCancel} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="text-base font-semibold text-gray-900">Edit Rule</h3>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Rule Name */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Rule Name</label>
            <input
              type="text"
              value={editedRule.name}
              onChange={(e) => setEditedRule({ ...editedRule, name: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* Category Dropdown */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Category</label>
            <select
              value={editedRule.categoryLabel}
              onChange={(e) => setEditedRule({ ...editedRule, categoryLabel: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
            >
              {availableCategories.map((opt) => (
                <option key={opt.value} value={opt.label}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Conditions */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-medium text-gray-700">Conditions</label>
              <button
                onClick={handleAddCondition}
                className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
              >
                + Add condition
              </button>
            </div>
            <div className="space-y-2">
              {editedRule.conditions.map((condition, index) => (
                <div key={index} className="flex items-center gap-2">
                  <select
                    value={condition.field}
                    onChange={(e) => handleConditionChange(index, 'field', e.target.value)}
                    className="flex-1 px-2 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {fieldOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  <select
                    value={condition.operator}
                    onChange={(e) => handleConditionChange(index, 'operator', e.target.value)}
                    className="flex-1 px-2 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {operatorOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={condition.value}
                    onChange={(e) => handleConditionChange(index, 'value', e.target.value)}
                    placeholder="Value"
                    className="flex-1 px-2 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  {editedRule.conditions.length > 1 && (
                    <button
                      onClick={() => handleRemoveCondition(index)}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(editedRule)}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSettingsChange,
  rules,
  onRulesChange,
  onDeleteRule,
  transactions = [],
  categoryOptions: propCategoryOptions,
  onViewCategoryTransactions,
  highlightedRuleId,
  onClearHighlightedRule,
}) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [editingRule, setEditingRule] = useState<CategoryRule | null>(null);
  const highlightedRuleRef = useRef<HTMLDivElement>(null);

  // Use provided category options or default ones
  const categoryOptions = propCategoryOptions || glCodeOptions;

  // When highlightedRuleId is set, switch to rules tab and scroll to the rule
  useEffect(() => {
    if (highlightedRuleId && isOpen) {
      setActiveTab('rules');
      // Scroll to the highlighted rule after a brief delay to allow DOM to update
      setTimeout(() => {
        highlightedRuleRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }, [highlightedRuleId, isOpen]);

  // Clear highlighted rule when modal closes
  useEffect(() => {
    if (!isOpen && highlightedRuleId) {
      onClearHighlightedRule?.();
    }
  }, [isOpen, highlightedRuleId, onClearHighlightedRule]);

  // Calculate category statistics from transactions
  const categoryStats = useMemo((): CategoryStats[] => {
    const stats: Record<string, { count: number; total: number }> = {};
    
    transactions.forEach(t => {
      if (t.status === 'failed') return;
      const category = t.glCode || 'Uncategorized';
      if (!stats[category]) {
        stats[category] = { count: 0, total: 0 };
      }
      stats[category].count += 1;
      stats[category].total += Math.abs(t.amount);
    });

    return Object.entries(stats)
      .map(([name, { count, total }]) => ({
        name,
        transactionCount: count,
        totalAmount: total,
      }))
      .sort((a, b) => b.totalAmount - a.totalAmount);
  }, [transactions]);

  if (!isOpen) return null;

  const handleToggleColumn = (columnId: keyof ColumnVisibility) => {
    onSettingsChange({
      ...settings,
      columnVisibility: {
        ...settings.columnVisibility,
        [columnId]: !settings.columnVisibility[columnId],
      },
    });
  };

  const handleToggleCharts = () => {
    onSettingsChange({
      ...settings,
      showChartsExpanded: !settings.showChartsExpanded,
    });
  };

  const handleToggleRule = (ruleId: string) => {
    onRulesChange(
      rules.map(rule =>
        rule.id === ruleId ? { ...rule, enabled: rule.enabled === false ? true : false } : rule
      )
    );
  };

  const handleSaveRule = (updatedRule: CategoryRule) => {
    onRulesChange(
      rules.map(rule => rule.id === updatedRule.id ? updatedRule : rule)
    );
    setEditingRule(null);
  };

  const visibleColumnsCount = Object.values(settings.columnVisibility).filter(Boolean).length;

  const tabs: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
    {
      id: 'general',
      label: 'General',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      id: 'columns',
      label: 'Columns',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
        </svg>
      ),
    },
    {
      id: 'rules',
      label: 'Rules',
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
        </svg>
      ),
    },
    {
      id: 'categories',
      label: 'Categories',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal - Fixed height of 480px */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden h-[480px] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 tracking-[-0.01em]">Settings</h2>
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

        {/* Tabs */}
        <div className="px-6 border-b border-gray-100 flex-shrink-0">
          <div className="flex gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors
                  ${activeTab === tab.id
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                {tab.icon}
                {tab.label}
                {tab.id === 'rules' && rules.length > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">
                    {rules.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* General Settings Tab */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-4">Display Preferences</h3>
                <div className="space-y-4">
                  {/* Charts expanded by default */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Show charts by default</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Display the charts section expanded when loading the page
                      </p>
                    </div>
                    <button
                      onClick={handleToggleCharts}
                      className={`w-11 h-6 rounded-full transition-colors ${
                        settings.showChartsExpanded ? 'bg-indigo-600' : 'bg-gray-200'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform ${
                          settings.showChartsExpanded ? 'translate-x-[22px]' : 'translate-x-0.5'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Columns Tab */}
          {activeTab === 'columns' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-900">Visible Columns</h3>
                <span className="text-xs text-gray-500">
                  {visibleColumnsCount} of {Object.keys(settings.columnVisibility).length} columns visible
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {(Object.keys(settings.columnVisibility) as Array<keyof ColumnVisibility>).map((columnId) => (
                  <button
                    key={columnId}
                    onClick={() => handleToggleColumn(columnId)}
                    className={`
                      flex items-center justify-between p-3 rounded-lg border transition-all
                      ${settings.columnVisibility[columnId]
                        ? 'border-indigo-200 bg-indigo-50'
                        : 'border-gray-200 bg-white hover:bg-gray-50'
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${
                          settings.columnVisibility[columnId]
                            ? 'bg-indigo-600'
                            : 'bg-gray-200'
                        }`}
                      >
                        {settings.columnVisibility[columnId] && (
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <span className={`text-sm ${settings.columnVisibility[columnId] ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>
                        {columnLabels[columnId]}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-4">
                Toggle columns to show or hide them in the transactions table.
              </p>
            </div>
          )}

          {/* Rules Tab */}
          {activeTab === 'rules' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-900">Categorization Rules</h3>
                <span className="text-xs text-gray-500">
                  {rules.filter(r => r.enabled !== false).length} active rules
                </span>
              </div>

              {rules.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-gray-900 mb-1">No rules yet</p>
                  <p className="text-xs text-gray-500">
                    Create rules by categorizing transactions in the table.
                    <br />
                    You'll be prompted to create a rule for similar transactions.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {rules.map((rule) => {
                    const isHighlighted = rule.id === highlightedRuleId;
                    return (
                    <div
                      key={rule.id}
                      ref={isHighlighted ? highlightedRuleRef : undefined}
                      className={`p-4 rounded-lg border transition-all ${
                        isHighlighted
                          ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-500 ring-opacity-50'
                          : rule.enabled !== false
                            ? 'border-gray-200 bg-white'
                            : 'border-gray-100 bg-gray-50 opacity-60'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-gray-900 truncate">
                              {rule.name}
                            </span>
                            <span className="px-2 py-0.5 text-xs font-medium bg-indigo-100 text-indigo-700 rounded">
                              {rule.categoryLabel}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500">
                            When {rule.conditions.map((c, i) => (
                              <span key={i}>
                                {i > 0 && ' and '}
                                <span className="font-medium">{c.field}</span> {c.operator} "<span className="font-medium">{c.value}</span>"
                              </span>
                            ))}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {/* Edit */}
                          <button
                            onClick={() => setEditingRule(rule)}
                            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Edit rule"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          {/* Toggle */}
                          <button
                            onClick={() => handleToggleRule(rule.id)}
                            className={`w-9 h-5 rounded-full transition-colors ${
                              rule.enabled !== false ? 'bg-indigo-600' : 'bg-gray-200'
                            }`}
                            title={rule.enabled !== false ? 'Disable rule' : 'Enable rule'}
                          >
                            <div
                              className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform ${
                                rule.enabled !== false ? 'translate-x-[18px]' : 'translate-x-0.5'
                              }`}
                            />
                          </button>
                          {/* Delete */}
                          <button
                            onClick={() => onDeleteRule(rule.id)}
                            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete rule"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Categories Tab */}
          {activeTab === 'categories' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-900">Category Breakdown</h3>
                <span className="text-xs text-gray-500">
                  {categoryStats.length} categories
                </span>
              </div>
              
              {categoryStats.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  <p className="text-sm font-medium text-gray-900 mb-1">No categories yet</p>
                  <p className="text-xs text-gray-500">
                    Categorize transactions to see the breakdown here.
                  </p>
                </div>
              ) : (
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Transactions
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total Amount
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {categoryStats.map((stat, index) => (
                        <tr 
                          key={stat.name} 
                          onClick={() => {
                            onViewCategoryTransactions?.(stat.name);
                            onClose();
                          }}
                          className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-indigo-50 transition-colors cursor-pointer group`}
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              {stat.name === 'Uncategorized' ? (
                                <span className="text-sm text-gray-400 italic group-hover:text-indigo-600">{stat.name}</span>
                              ) : (
                                <span className="text-sm font-medium text-gray-900 group-hover:text-indigo-600">{stat.name}</span>
                              )}
                              <svg className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className="text-sm text-gray-600">{stat.transactionCount}</span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className="text-sm font-medium text-gray-900">
                              ${stat.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-gray-100 border-t border-gray-200">
                        <td className="px-4 py-3">
                          <span className="text-sm font-semibold text-gray-900">Total</span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="text-sm font-semibold text-gray-900">
                            {categoryStats.reduce((sum, stat) => sum + stat.transactionCount, 0)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="text-sm font-semibold text-gray-900">
                            ${categoryStats.reduce((sum, stat) => sum + stat.totalAmount, 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex-shrink-0">
          <div className="flex items-center justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>

      {/* Edit Rule Modal */}
      {editingRule && (
        <EditRuleModal
          rule={editingRule}
          onSave={handleSaveRule}
          onCancel={() => setEditingRule(null)}
          categoryOptions={categoryOptions}
        />
      )}
    </div>
  );
};

export default SettingsModal;

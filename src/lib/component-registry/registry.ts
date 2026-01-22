import type React from 'react';
import type { ComponentInfo } from './types';
import { Badge } from '@/components/ui/badge';
import { TopNav } from '@/components/core';

// Demo component imports
import {
  DSTableDefaultDemo,
  DSTableDetailPanelBasicDemo,
} from './demos/table-demos';

import {
  DSButtonSmallDemo,
} from './demos/button-demos';

import {
  DSTableToolbarTransactionsDemo,
  GroupByButtonDefaultDemo,
  SortButtonDefaultDemo,
  MonthlySummaryDefaultDemo,
} from './demos/toolbar-demos';

import {
  InlineComboboxDefaultDemo,
  FilterMenuDefaultDemo,
} from './demos/filter-demos';

import {
  DSTextInputDefaultDemo,
  DSComboboxDefaultDemo,
  DSCheckboxDefaultDemo,
  DSRadioGroupDefaultDemo,
} from './demos/form-demos';

import {
  GroupedTableDefaultDemo,
} from './demos/grouped-table-demos';

import {
  ChipDefaultDemo,
} from './demos/chip-demos';

import {
  IconDefaultDemo,
} from './demos/icon-demos';

import { DSLinkAllStatesDemo } from './demos/link-demos';

export const componentRegistry: ComponentInfo[] = [
  {
    name: 'DSLink',
    category: 'ui',
    description:
      'Standalone link component with variants, sizes, icon positions, and full interactive states (hover, focus, disabled).',
    usedIn: ['Cards.tsx'],
    variants: [
      {
        name: 'All States',
        description: 'All variants/sizes/states for design review (primary/secondary, icon left/right, hover/focus/disabled).',
        props: {},
      },
    ],
    component: DSLinkAllStatesDemo,
  },
  {
    name: 'Chip',
    category: 'ui',
    description: 'Chip component for filters, tags, and dropdowns with variants, icons, and actions.',
    usedIn: ['ds-table-toolbar.tsx', 'ds-toolbar.tsx'],
    variants: [
      {
        name: 'Default',
        description: 'Default chip variants with dropdown triggers, icons, and open states',
        props: { variant: 'default' },
      },
      {
        name: 'Selected',
        description: 'Selected chip variants with light purple background, with and without circular icon',
        props: { variant: 'selected' },
      },
      {
        name: 'Clear',
        description: 'Chips with clear buttons for active filters',
        props: { variant: 'clear' },
      },
      {
        name: 'Interactive',
        description: 'Interactive demo showing chip state transitions',
        props: { variant: 'interactive' },
      },
      {
        name: 'All States',
        description: 'Overview of all chip variants and states for design review',
        props: { variant: 'all-states' },
      },
    ],
    component: ChipDefaultDemo,
  },
  {
    name: 'Icon',
    category: 'ui',
    description: 'Standardized Font Awesome icon wrapper with consistent sizing (default and small).',
    usedIn: [],
    variants: [
      {
        name: 'Default',
        description: 'Default size icons (24x24px container, 13px icon) - most icons should use this variant',
        props: { size: 'default' },
      },
      {
        name: 'Small',
        description: 'Small size icons (20x20px container, 11px icon) for compact contexts',
        props: { size: 'small' },
      },
    ],
    component: IconDefaultDemo,
  },
  {
    name: 'DSTableToolbar',
    category: 'ui',
    description: 'Table toolbar with filters, sorting, grouping, and export actions.',
    usedIn: ['Transactions.tsx'],
    variants: [
      {
        name: 'Transactions Page',
        description: 'Full toolbar with view menu, filters, quick filters (Date, Keyword, Amount), and all table actions',
        props: { variant: 'transactions' },
      },
      {
        name: 'Minimal',
        description: 'Simplified toolbar with just view menu, filters, and display button',
        props: { variant: 'minimal' },
      },
      {
        name: 'With Active Filters',
        description: 'Toolbar showing active filter count and grouping indicator',
        props: { variant: 'activeFilters' },
      },
    ],
    component: DSTableToolbarTransactionsDemo,
  },
  {
    name: 'InlineCombobox',
    category: 'ui',
    description: 'Inline dropdown for selecting values in table cells.',
    usedIn: ['Transactions.tsx', 'ComponentGallery.tsx'],
    variants: [
      {
        name: 'Default',
        description: 'Combobox with a selected value',
        props: {},
      },
      {
        name: 'Placeholder',
        description: 'Combobox with no value selected, showing placeholder',
        props: { variant: 'placeholder' },
      },
      {
        name: 'Error State',
        description: 'Combobox in error state with red styling',
        props: { variant: 'error' },
      },
      {
        name: 'Disabled',
        description: 'Combobox in disabled state, not interactive',
        props: { variant: 'disabled' },
      },
    ],
    component: InlineComboboxDefaultDemo,
  },
  {
    name: 'DSTable',
    category: 'ui',
    description: 'Data table with sorting, selection, loading states, and detail panels.',
    usedIn: ['Transactions.tsx', 'ComponentGallery.tsx'],
    variants: [
      {
        name: 'Default with Sorting',
        description: 'Basic table with sortable columns - click headers to sort',
        props: {},
      },
      {
        name: 'Interactive Rows',
        description: 'Clickable rows with selection highlighting',
        props: { variant: 'interactive' },
      },
      {
        name: 'Small Size',
        description: 'Compact table with smaller text and padding',
        props: { variant: 'small' },
      },
      {
        name: 'Large Size',
        description: 'Spacious table with larger text and padding',
        props: { variant: 'large' },
      },
      {
        name: 'Striped Rows',
        description: 'Alternating row backgrounds for better readability',
        props: { variant: 'striped' },
      },
      {
        name: 'Bordered',
        description: 'Table with border and rounded corners',
        props: { variant: 'bordered' },
      },
      {
        name: 'Loading State',
        description: 'Skeleton loading animation',
        props: { variant: 'loading' },
      },
      {
        name: 'Empty State',
        description: 'Message shown when no data is available',
        props: { variant: 'empty' },
      },
      {
        name: 'Full Width',
        description: 'Table spans the full width of its container (default behavior)',
        props: { variant: 'fullWidth' },
      },
      {
        name: 'Centered',
        description: 'Table centered with max-width of 968px',
        props: { variant: 'centered' },
      },
      {
        name: 'Full Width with Detail Panel',
        description: 'Full width table with transaction detail panel - click any row to see details',
        props: { variant: 'fullWidthWithPanel' },
      },
      {
        name: 'Centered with Detail Panel',
        description: 'Centered table with transaction detail panel - click any row to see details',
        props: { variant: 'centeredWithPanel' },
      },
    ],
    component: DSTableDefaultDemo,
  },
  {
    name: 'DSTableDetailPanel',
    category: 'ui',
    description: 'Configurable detail panel component for DSTable rows. Supports text fields, comboboxes, textareas, file attachments, and custom content. Used as a subcomponent of DSTable via the renderDetailPanel prop.',
    usedIn: ['Transactions.tsx', 'ds-table.tsx'],
    variants: [
      {
        name: 'Basic',
        description: 'Detail panel with hero section (money amount), timeline, and various field types (text, combobox, textarea)',
        props: { variant: 'basic' },
      },
      {
        name: 'With File Attachment',
        description: 'Detail panel showing file attachment component with upload status',
        props: { variant: 'withFile' },
      },
      {
        name: 'Minimal',
        description: 'Simple detail panel with only text fields, no hero or timeline',
        props: { variant: 'minimal' },
      },
    ],
    component: DSTableDetailPanelBasicDemo,
  },
  {
    name: 'Badge',
    category: 'ui',
    description: 'Status badges with multiple type variants.',
    usedIn: ['ComponentGallery.tsx'],
    variants: [
      { name: 'Neutral', description: 'Default gray text on dark background', props: { type: 'neutral', children: 'Label' } },
      { name: 'Pearl', description: 'Subtle purple-tinted background with gray text', props: { type: 'pearl', children: 'Label' } },
      { name: 'Highlight', description: 'Blue accent color for emphasis', props: { type: 'highlight', children: 'Label' } },
      { name: 'Success', description: 'Green color for positive states', props: { type: 'success', children: 'Label' } },
      { name: 'Warning', description: 'Orange color for warnings', props: { type: 'warning', children: 'Label' } },
      { name: 'Error', description: 'Red/pink color for errors', props: { type: 'error', children: 'Label' } },
      { name: 'With Icon (Neutral)', description: 'Neutral badge with circle icon', props: { type: 'neutral', hasIcon: true, children: 'Label' } },
      { name: 'With Icon (Highlight)', description: 'Highlight badge with circle icon', props: { type: 'highlight', hasIcon: true, children: 'Label' } },
      { name: 'With Icon (Success)', description: 'Success badge with circle icon', props: { type: 'success', hasIcon: true, children: 'Label' } },
      { name: 'With Icon (Warning)', description: 'Warning badge with circle icon', props: { type: 'warning', hasIcon: true, children: 'Label' } },
      { name: 'With Icon (Error)', description: 'Error badge with circle icon', props: { type: 'error', hasIcon: true, children: 'Label' } },
    ],
    component: Badge as React.ComponentType<unknown>,
  },
  {
    name: 'TopNav',
    category: 'core',
    description: 'Top navigation with search, actions, notifications, and user menu.',
    usedIn: ['Layout.tsx'],
    variants: [
      { name: 'Default', description: 'Standard top navigation with logged-in user', props: {} },
    ],
    component: TopNav,
  },
  {
    name: 'DSButton',
    category: 'ui',
    description: 'Button component with 5 variants, 2 sizes, icons, and loading states.',
    usedIn: [],
    variants: [
      { name: 'Small Variants', description: 'Small size buttons (height 32px) - Primary, Secondary, Tertiary, Destructive, and Floating variants with icon configurations and states', props: { variant: 'small' } },
      { name: 'Large Variants', description: 'Large size buttons (height 40px) - Primary, Secondary, Tertiary, Destructive, and Floating variants with icon configurations and states', props: { variant: 'large' } },
    ],
    component: DSButtonSmallDemo,
  },
  {
    name: 'MonthlySummary',
    category: 'ui',
    description: 'Financial summary showing net change, money in/out with expand/collapse.',
    usedIn: ['Transactions.tsx'],
    variants: [
      { name: 'Default (Positive)', description: 'Summary with positive net change shown in green', props: {} },
      { name: 'Negative Net Change', description: 'Summary with negative net change shown in default text color', props: { variant: 'negative' } },
      { name: 'Custom Period Label', description: 'Summary with a custom period label and no toggle button', props: { variant: 'customPeriod' } },
    ],
    component: MonthlySummaryDefaultDemo,
  },
  {
    name: 'GroupByButton',
    category: 'ui',
    description: 'Button with dropdown for grouping table data with active indicator.',
    usedIn: ['Transactions.tsx', 'ds-toolbar.tsx', 'ds-table-toolbar.tsx'],
    variants: [
      { name: 'Default (No Grouping)', description: 'Button in default state with no active grouping', props: {} },
      { name: 'With Active Grouping', description: 'Button showing indicator dot when grouping is enabled', props: { variant: 'active' } },
    ],
    component: GroupByButtonDefaultDemo,
  },
  {
    name: 'SortButton',
    category: 'ui',
    description: 'Button with dropdown for sorting by field and direction.',
    usedIn: ['Transactions.tsx', 'ds-toolbar.tsx', 'ds-table-toolbar.tsx'],
    variants: [
      { name: 'Default (Date Sort)', description: 'Button with date sorting showing New to Old / Old to New options', props: {} },
      { name: 'Amount Sort', description: 'Button with amount sorting showing High to Low / Low to High options', props: { variant: 'amount' } },
    ],
    component: SortButtonDefaultDemo,
  },
  {
    name: 'GroupedTable',
    category: 'ui',
    description: 'Grouped table view with expand/collapse and transaction summaries.',
    usedIn: ['Transactions.tsx'],
    variants: [
      { name: 'Default', description: 'Grouped table view with expandable groups, showing transaction counts and money totals', props: {} },
    ],
    component: GroupedTableDefaultDemo,
  },
  {
    name: 'FilterMenu',
    category: 'ui',
    description: 'Multi-category filter popover with date picker, search, and filter modes.',
    usedIn: ['Transactions.tsx', 'ds-toolbar.tsx', 'ds-table-toolbar.tsx'],
    variants: [
      { name: 'Default', description: 'Filter menu button with popover in default state (no filters active)', props: {} },
      { name: 'With Date Filter', description: 'Filter menu with date filter preset active', props: { variant: 'dateFilter' } },
      { name: 'With Multiple Filters', description: 'Filter menu with multiple filters active (date + amount)', props: { variant: 'multipleFilters' } },
      { name: 'With Categories Filter', description: 'Filter menu with categories filter active showing search, filter modes, and category checkboxes', props: { variant: 'categoriesFilter' } },
    ],
    component: FilterMenuDefaultDemo,
  },
  {
    name: 'DSTextInput',
    category: 'ui',
    description: 'Text input with label, states, prefix/suffix, and help text.',
    usedIn: [],
    variants: [
      { name: 'Default', description: 'Empty text input with label and placeholder', props: {} },
      { name: 'With Value', description: 'Text input with a value entered', props: { variant: 'withValue' } },
      { name: 'With Prefix', description: 'Text input with a currency prefix symbol', props: { variant: 'withPrefix' } },
      { name: 'With Suffix', description: 'Text input with a percentage suffix', props: { variant: 'withSuffix' } },
      { name: 'With Prefix & Suffix', description: 'Text input with both prefix and suffix', props: { variant: 'withPrefixSuffix' } },
      { name: 'Error State', description: 'Text input in error state with error message', props: { variant: 'error' } },
      { name: 'Disabled', description: 'Text input in disabled state', props: { variant: 'disabled' } },
      { name: 'With Help Text', description: 'Text input with helper text below', props: { variant: 'helpText' } },
    ],
    component: DSTextInputDefaultDemo,
  },
  {
    name: 'DSCombobox',
    category: 'ui',
    description: 'Combobox dropdown with label, states, and clearable option.',
    usedIn: [],
    variants: [
      { name: 'Default', description: 'Empty combobox with label and placeholder', props: {} },
      { name: 'With Value', description: 'Combobox with a selected value', props: { variant: 'withValue' } },
      { name: 'Clearable', description: 'Combobox with clear button when value is selected', props: { variant: 'clearable' } },
      { name: 'Error State', description: 'Combobox in error state with error message', props: { variant: 'error' } },
      { name: 'Disabled', description: 'Combobox in disabled state', props: { variant: 'disabled' } },
      { name: 'With Help Text', description: 'Combobox with helper text below', props: { variant: 'helpText' } },
    ],
    component: DSComboboxDefaultDemo,
  },
  {
    name: 'DSCheckbox',
    category: 'ui',
    description: 'Checkbox with multiple label styles and state variants.',
    usedIn: ['ds-table.tsx', 'filter-menu.tsx'],
    variants: [
      { name: 'Checkbox Only', description: 'Checkbox without any label', props: { variant: 'checkboxOnly' } },
      { name: 'Checkbox Only (Checked)', description: 'Checked checkbox without label', props: { variant: 'checkboxOnlyChecked' } },
      { name: 'With Simple Label', description: 'Checkbox with a simple text label', props: { variant: 'simpleLabel' } },
      { name: 'With Simple Label (Checked)', description: 'Checked checkbox with simple label', props: { variant: 'simpleLabelChecked' } },
      { name: 'With Sublabel', description: 'Checkbox with label and sublabel beneath', props: { variant: 'sublabel' } },
      { name: 'With Sublabel (Checked)', description: 'Checked checkbox with label and sublabel', props: { variant: 'sublabelChecked' } },
      { name: 'Indeterminate', description: 'Checkbox in indeterminate state (for partial selection)', props: { variant: 'indeterminate' } },
      { name: 'Disabled States', description: 'Disabled checkboxes in various states', props: { variant: 'disabled' } },
    ],
    component: DSCheckboxDefaultDemo,
  },
  {
    name: 'DSRadioGroup',
    category: 'ui',
    description: 'Radio group with simple and block variants, orientation options.',
    usedIn: ['filter-menu.tsx', 'amount-filter-dropdown.tsx'],
    variants: [
      { name: 'Simple (Default)', description: 'Basic radio buttons with labels, stacked vertically', props: { variant: 'simple' } },
      { name: 'Simple with Description', description: 'Radio buttons with labels and descriptions', props: { variant: 'simpleDescription' } },
      { name: 'Block', description: 'Radio buttons inside rounded card containers', props: { variant: 'block' } },
      { name: 'Block with Description', description: 'Block style with labels and descriptions', props: { variant: 'blockDescription' } },
      { name: 'Horizontal', description: 'Radio buttons arranged horizontally', props: { variant: 'horizontal' } },
      { name: 'Error State', description: 'Radio group in error state', props: { variant: 'error' } },
      { name: 'Disabled', description: 'Disabled radio group', props: { variant: 'disabled' } },
    ],
    component: DSRadioGroupDefaultDemo,
  },
];

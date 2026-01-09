import { useState } from 'react';
import { InlineCombobox } from '@/components/ui/inline-combobox';
import { FilterMenuButton, type FilterValues } from '@/components/ui/filter-menu';
import { categoryOptions } from '../sample-data';

// InlineCombobox Demo Components
export function InlineComboboxDefaultDemo() {
  const [value, setValue] = useState('other-travel');
  return (
    <div style={{ minHeight: 200 }}>
      <InlineCombobox
        value={value}
        options={categoryOptions}
        onChange={setValue}
      />
    </div>
  );
}

export function InlineComboboxPlaceholderDemo() {
  const [value, setValue] = useState<string | undefined>(undefined);
  return (
    <div style={{ minHeight: 200 }}>
      <InlineCombobox
        value={value}
        options={categoryOptions}
        onChange={setValue}
        placeholder="Select category"
      />
    </div>
  );
}

export function InlineComboboxErrorDemo() {
  const [value, setValue] = useState('software');
  return (
    <div style={{ minHeight: 200 }}>
      <InlineCombobox
        value={value}
        options={categoryOptions}
        onChange={setValue}
        error
      />
    </div>
  );
}

export function InlineComboboxDisabledDemo() {
  return (
    <div style={{ minHeight: 200 }}>
      <InlineCombobox
        value="marketing"
        options={categoryOptions}
        disabled
      />
    </div>
  );
}

export const inlineComboboxVariantComponents: Record<string, React.ComponentType> = {
  'Default': InlineComboboxDefaultDemo,
  'Placeholder': InlineComboboxPlaceholderDemo,
  'Error State': InlineComboboxErrorDemo,
  'Disabled': InlineComboboxDisabledDemo,
};

// FilterMenu Demo Components
export function FilterMenuDefaultDemo() {
  const [values, setValues] = useState<FilterValues>({});
  return (
    <div
      className="border rounded-md p-4 bg-white"
      style={{ borderColor: "var(--color-border-default)", minHeight: 400 }}
    >
      <FilterMenuButton
        values={values}
        onValuesChange={setValues}
        viewName="Monthly In"
      />
    </div>
  );
}

export function FilterMenuWithDateFilterDemo() {
  const [values, setValues] = useState<FilterValues>({
    datePreset: 'this_month',
  });
  return (
    <div
      className="border rounded-md p-4 bg-white"
      style={{ borderColor: "var(--color-border-default)", minHeight: 400 }}
    >
      <FilterMenuButton
        values={values}
        onValuesChange={setValues}
        viewName="Filtered View"
      />
      <p className="mt-4 text-body-sm">
        Date filter active: {values.datePreset}
      </p>
    </div>
  );
}

export function FilterMenuWithAmountFilterDemo() {
  const [values, setValues] = useState<FilterValues>({
    datePreset: 'last_month',
    amountMin: 100,
    amountMax: 5000,
  });
  return (
    <div
      className="border rounded-md p-4 bg-white"
      style={{ borderColor: "var(--color-border-default)", minHeight: 400 }}
    >
      <FilterMenuButton
        values={values}
        onValuesChange={setValues}
        viewName="High Value Transactions"
      />
      <p className="mt-4 text-body-sm">
        Active filters: {values.datePreset}, Amount: ${values.amountMin} - ${values.amountMax}
      </p>
    </div>
  );
}

export function FilterMenuWithCategoriesFilterDemo() {
  const [values, setValues] = useState<FilterValues>({
    categoryFilterMode: 'all',
    categories: ['Software & Subscriptions', 'Marketing & Advertising'],
  });
  return (
    <div
      className="border rounded-md p-4 bg-white"
      style={{ borderColor: "var(--color-border-default)", minHeight: 400 }}
    >
      <FilterMenuButton
        values={values}
        onValuesChange={setValues}
        viewName="Categorized Transactions"
      />
      <p className="mt-4 text-body-sm">
        Active categories: {values.categories?.join(', ') || 'None'}
      </p>
    </div>
  );
}

export const filterMenuVariantComponents: Record<string, React.ComponentType> = {
  'Default': FilterMenuDefaultDemo,
  'With Date Filter': FilterMenuWithDateFilterDemo,
  'With Multiple Filters': FilterMenuWithAmountFilterDemo,
  'With Categories Filter': FilterMenuWithCategoriesFilterDemo,
};

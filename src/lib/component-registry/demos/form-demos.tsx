import { useState } from 'react';
import { DSTextInput } from '@/components/ui/ds-text-input';
import { DSCombobox, type ComboboxOption } from '@/components/ui/ds-combobox';
import { DSCheckbox } from '@/components/ui/ds-checkbox';
import { DSRadioGroup, type RadioOption } from '@/components/ui/ds-radio-group';
import { comboboxDemoOptions, categoryDemoOptions, radioOptions, radioOptionsWithDescription } from '../sample-data';

// ============================================================================
// DSTextInput Demo Components
// ============================================================================

export function DSTextInputDefaultDemo() {
  const [value, setValue] = useState('');
  return (
    <div style={{ width: 256 }}>
      <DSTextInput
        label="Label"
        placeholder="Placeholder"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    </div>
  );
}

export function DSTextInputWithValueDemo() {
  const [value, setValue] = useState('Hello World');
  return (
    <div style={{ width: 256 }}>
      <DSTextInput
        label="Label"
        placeholder="Placeholder"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    </div>
  );
}

export function DSTextInputWithPrefixDemo() {
  const [value, setValue] = useState('100');
  return (
    <div style={{ width: 256 }}>
      <DSTextInput
        label="Amount"
        placeholder="0.00"
        prefix="$"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    </div>
  );
}

export function DSTextInputWithSuffixDemo() {
  const [value, setValue] = useState('50');
  return (
    <div style={{ width: 256 }}>
      <DSTextInput
        label="Percentage"
        placeholder="0"
        suffix="%"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    </div>
  );
}

export function DSTextInputWithPrefixSuffixDemo() {
  const [value, setValue] = useState('1000');
  return (
    <div style={{ width: 256 }}>
      <DSTextInput
        label="Price Range"
        placeholder="0.00"
        prefix="$"
        suffix="USD"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    </div>
  );
}

export function DSTextInputErrorDemo() {
  const [value, setValue] = useState('');
  return (
    <div style={{ width: 256 }}>
      <DSTextInput
        label="Label"
        placeholder="Placeholder"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        error
        errorMessage="Error message"
      />
    </div>
  );
}

export function DSTextInputDisabledDemo() {
  return (
    <div style={{ width: 256 }}>
      <DSTextInput
        label="Label"
        placeholder="Placeholder"
        value="Disabled value"
        disabled
      />
    </div>
  );
}

export function DSTextInputWithHelpTextDemo() {
  const [value, setValue] = useState('');
  return (
    <div style={{ width: 256 }}>
      <DSTextInput
        label="Email"
        placeholder="name@company.com"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        helpText="Enter your work email address"
      />
    </div>
  );
}

export const dsTextInputVariantComponents: Record<string, React.ComponentType> = {
  'Default': DSTextInputDefaultDemo,
  'With Value': DSTextInputWithValueDemo,
  'With Prefix': DSTextInputWithPrefixDemo,
  'With Suffix': DSTextInputWithSuffixDemo,
  'With Prefix & Suffix': DSTextInputWithPrefixSuffixDemo,
  'Error State': DSTextInputErrorDemo,
  'Disabled': DSTextInputDisabledDemo,
  'With Help Text': DSTextInputWithHelpTextDemo,
};

// ============================================================================
// DSCombobox Demo Components
// ============================================================================

export function DSComboboxDefaultDemo() {
  const [value, setValue] = useState<string>('');
  return (
    <div style={{ width: 256, minHeight: 280 }}>
      <DSCombobox
        label="Label"
        placeholder="Select an option"
        options={comboboxDemoOptions}
        value={value}
        onChange={setValue}
      />
    </div>
  );
}

export function DSComboboxWithValueDemo() {
  const [value, setValue] = useState<string>('software');
  return (
    <div style={{ width: 256, minHeight: 280 }}>
      <DSCombobox
        label="Category"
        placeholder="Select category"
        options={categoryDemoOptions}
        value={value}
        onChange={setValue}
      />
    </div>
  );
}

export function DSComboboxClearableDemo() {
  const [value, setValue] = useState<string>('marketing');
  return (
    <div style={{ width: 256, minHeight: 280 }}>
      <DSCombobox
        label="Category"
        placeholder="Select category"
        options={categoryDemoOptions}
        value={value}
        onChange={setValue}
        clearable
      />
    </div>
  );
}

export function DSComboboxErrorDemo() {
  const [value, setValue] = useState<string>('');
  return (
    <div style={{ width: 256, minHeight: 280 }}>
      <DSCombobox
        label="Label"
        placeholder="Placeholder"
        options={categoryDemoOptions}
        value={value}
        onChange={setValue}
        error
        errorMessage="Error message"
      />
    </div>
  );
}

export function DSComboboxDisabledDemo() {
  return (
    <div style={{ width: 256, minHeight: 280 }}>
      <DSCombobox
        label="Category"
        placeholder="Select category"
        options={categoryDemoOptions}
        value="payroll"
        disabled
      />
    </div>
  );
}

export function DSComboboxWithHelpTextDemo() {
  const [value, setValue] = useState<string>('');
  return (
    <div style={{ width: 256, minHeight: 280 }}>
      <DSCombobox
        label="Category"
        placeholder="Select category"
        options={categoryDemoOptions}
        value={value}
        onChange={setValue}
        helpText="Choose the expense category"
      />
    </div>
  );
}

export const dsComboboxVariantComponents: Record<string, React.ComponentType> = {
  'Default': DSComboboxDefaultDemo,
  'With Value': DSComboboxWithValueDemo,
  'Clearable': DSComboboxClearableDemo,
  'Error State': DSComboboxErrorDemo,
  'Disabled': DSComboboxDisabledDemo,
  'With Help Text': DSComboboxWithHelpTextDemo,
};

// ============================================================================
// DSCheckbox Demo Components
// ============================================================================

export function DSCheckboxDefaultDemo() {
  return (
    <div
      className="flex flex-col gap-6 p-6 rounded-md border"
      style={{ borderColor: "var(--color-border-emphasized)" }}
    >
      {/* Checkbox Only Row */}
      <div className="flex flex-col gap-3">
        <h3 className="text-label-demi" style={{ color: "var(--ds-text-default)" }}>
          Checkbox Only
        </h3>
        <div className="flex items-center gap-8">
          <DSCheckbox labelStyle="none" />
          <DSCheckbox labelStyle="none" checked />
        </div>
      </div>

      {/* Simple Label Row */}
      <div className="flex flex-col gap-3">
        <h3 className="text-label-demi" style={{ color: "var(--ds-text-default)" }}>
          With Simple Label
        </h3>
        <div className="flex items-center gap-8">
          <DSCheckbox labelStyle="simple" label="Label" />
          <DSCheckbox labelStyle="simple" label="Label" checked />
        </div>
      </div>

      {/* Sublabel Row */}
      <div className="flex flex-col gap-3">
        <h3 className="text-label-demi" style={{ color: "var(--ds-text-default)" }}>
          With Sublabel
        </h3>
        <div className="flex items-center gap-8">
          <DSCheckbox labelStyle="sublabel" label="Label" sublabel="Label" />
          <DSCheckbox labelStyle="sublabel" label="Label" sublabel="Label" checked />
        </div>
      </div>
    </div>
  );
}

export function DSCheckboxCheckboxOnlyDemo() {
  const [checked, setChecked] = useState(false);
  return (
    <div
      className="flex items-center gap-8 p-4 bg-white rounded-md border"
      style={{ borderColor: "var(--color-border-default)" }}
    >
      <DSCheckbox 
        labelStyle="none" 
        checked={checked} 
        onChange={(e) => setChecked(e.target.checked)} 
      />
      <span className="text-body-sm">
        Click the checkbox: {checked ? 'Checked' : 'Unchecked'}
      </span>
    </div>
  );
}

export function DSCheckboxCheckboxOnlyCheckedDemo() {
  return (
    <div
      className="flex items-center gap-8 p-4 bg-white rounded-md border"
      style={{ borderColor: "var(--color-border-default)" }}
    >
      <DSCheckbox labelStyle="none" checked />
      <span className="text-body-sm">Static checked state</span>
    </div>
  );
}

export function DSCheckboxSimpleLabelDemo() {
  const [checked, setChecked] = useState(false);
  return (
    <div
      className="p-4 bg-white rounded-md border"
      style={{ borderColor: "var(--color-border-default)" }}
    >
      <DSCheckbox 
        labelStyle="simple" 
        label="Remember my preferences"
        checked={checked}
        onChange={(e) => setChecked(e.target.checked)}
      />
    </div>
  );
}

export function DSCheckboxSimpleLabelCheckedDemo() {
  return (
    <div
      className="p-4 bg-white rounded-md border"
      style={{ borderColor: "var(--color-border-default)" }}
    >
      <DSCheckbox 
        labelStyle="simple" 
        label="Notifications enabled"
        checked
      />
    </div>
  );
}

export function DSCheckboxSublabelDemo() {
  const [checked, setChecked] = useState(false);
  return (
    <div
      className="p-4 bg-white rounded-md border"
      style={{ borderColor: "var(--color-border-default)" }}
    >
      <DSCheckbox 
        labelStyle="sublabel" 
        label="Email notifications"
        sublabel="Receive updates about your account activity"
        checked={checked}
        onChange={(e) => setChecked(e.target.checked)}
      />
    </div>
  );
}

export function DSCheckboxSublabelCheckedDemo() {
  return (
    <div
      className="p-4 bg-white rounded-md border"
      style={{ borderColor: "var(--color-border-default)" }}
    >
      <DSCheckbox 
        labelStyle="sublabel" 
        label="Marketing communications"
        sublabel="Get tips, product updates, and inspiration"
        checked
      />
    </div>
  );
}

export function DSCheckboxIndeterminateDemo() {
  return (
    <div
      className="flex flex-col gap-4 p-4 bg-white rounded-md border"
      style={{ borderColor: "var(--color-border-default)" }}
    >
      <div className="flex items-center gap-4">
        <DSCheckbox labelStyle="simple" label="Select all" indeterminate />
        <span className="text-body-sm">(Some items selected)</span>
      </div>
      <div className="ml-6 flex flex-col gap-2">
        <DSCheckbox labelStyle="simple" label="Item 1" checked />
        <DSCheckbox labelStyle="simple" label="Item 2" checked />
        <DSCheckbox labelStyle="simple" label="Item 3" />
      </div>
    </div>
  );
}

export function DSCheckboxDisabledDemo() {
  return (
    <div
      className="flex flex-col gap-4 p-4 bg-white rounded-md border"
      style={{ borderColor: "var(--color-border-default)" }}
    >
      <div className="flex items-center gap-8">
        <DSCheckbox labelStyle="none" disabled />
        <DSCheckbox labelStyle="none" checked disabled />
      </div>
      <div className="flex items-center gap-8">
        <DSCheckbox labelStyle="simple" label="Disabled unchecked" disabled />
        <DSCheckbox labelStyle="simple" label="Disabled checked" checked disabled />
      </div>
      <DSCheckbox 
        labelStyle="sublabel" 
        label="Disabled with sublabel" 
        sublabel="This option is not available"
        disabled 
      />
    </div>
  );
}

export const dsCheckboxVariantComponents: Record<string, React.ComponentType> = {
  'Checkbox Only': DSCheckboxCheckboxOnlyDemo,
  'Checkbox Only (Checked)': DSCheckboxCheckboxOnlyCheckedDemo,
  'With Simple Label': DSCheckboxSimpleLabelDemo,
  'With Simple Label (Checked)': DSCheckboxSimpleLabelCheckedDemo,
  'With Sublabel': DSCheckboxSublabelDemo,
  'With Sublabel (Checked)': DSCheckboxSublabelCheckedDemo,
  'Indeterminate': DSCheckboxIndeterminateDemo,
  'Disabled States': DSCheckboxDisabledDemo,
};

// ============================================================================
// DSRadioGroup Demo Components
// ============================================================================

export function DSRadioGroupDefaultDemo() {
  return (
    <div
      className="flex flex-col gap-6 p-6 rounded-md border"
      style={{ borderColor: "var(--color-border-emphasized)" }}
    >
      {/* Simple Row */}
      <div className="flex flex-col gap-3">
        <h3 className="text-label-demi" style={{ color: "var(--ds-text-default)" }}>
          Simple Variant
        </h3>
        <DSRadioGroupSimpleDemo />
      </div>

      {/* Block Row */}
      <div className="flex flex-col gap-3">
        <h3 className="text-label-demi" style={{ color: "var(--ds-text-default)" }}>
          Block Variant
        </h3>
        <DSRadioGroupBlockDemo />
      </div>
    </div>
  );
}

export function DSRadioGroupSimpleDemo() {
  const [value, setValue] = useState<string>('option1');
  return (
    <div
      className="p-4 bg-white rounded-md border"
      style={{ borderColor: "var(--color-border-default)" }}
    >
      <DSRadioGroup
        label="Label"
        options={radioOptions}
        value={value}
        onChange={setValue}
        variant="simple"
      />
    </div>
  );
}

export function DSRadioGroupSimpleDescriptionDemo() {
  const [value, setValue] = useState<string>('any');
  return (
    <div
      className="p-4 bg-white rounded-md border"
      style={{ borderColor: "var(--color-border-default)" }}
    >
      <DSRadioGroup
        label="Direction"
        options={radioOptionsWithDescription}
        value={value}
        onChange={setValue}
        variant="simple"
      />
    </div>
  );
}

export function DSRadioGroupBlockDemo() {
  const [value, setValue] = useState<string>('option1');
  return (
    <div
      className="p-4 bg-white rounded-md border"
      style={{ borderColor: "var(--color-border-default)" }}
    >
      <DSRadioGroup
        label="Label"
        options={radioOptions}
        value={value}
        onChange={setValue}
        variant="block"
      />
    </div>
  );
}

export function DSRadioGroupBlockDescriptionDemo() {
  const [value, setValue] = useState<string>('any');
  return (
    <div
      className="p-4 bg-white rounded-md border"
      style={{ borderColor: "var(--color-border-default)" }}
    >
      <DSRadioGroup
        label="Direction"
        options={radioOptionsWithDescription}
        value={value}
        onChange={setValue}
        variant="block"
      />
    </div>
  );
}

export function DSRadioGroupHorizontalDemo() {
  const [value, setValue] = useState<string>('option1');
  return (
    <div
      className="p-4 bg-white rounded-md border"
      style={{ borderColor: "var(--color-border-default)" }}
    >
      <DSRadioGroup
        label="Select one"
        options={radioOptions}
        value={value}
        onChange={setValue}
        variant="simple"
        orientation="horizontal"
      />
    </div>
  );
}

export function DSRadioGroupErrorDemo() {
  const [value, setValue] = useState<string>('');
  return (
    <div
      className="p-4 bg-white rounded-md border"
      style={{ borderColor: "var(--color-border-default)" }}
    >
      <DSRadioGroup
        label="Select one (required)"
        options={radioOptions}
        value={value}
        onChange={setValue}
        variant="simple"
        error
      />
    </div>
  );
}

export function DSRadioGroupDisabledDemo() {
  return (
    <div
      className="flex flex-col gap-4 p-4 bg-white rounded-md border"
      style={{ borderColor: "var(--color-border-default)" }}
    >
      <DSRadioGroup
        label="Disabled radio group"
        options={radioOptions}
        value="option1"
        variant="simple"
        disabled
      />
    </div>
  );
}

export const dsRadioGroupVariantComponents: Record<string, React.ComponentType> = {
  'Simple (Default)': DSRadioGroupSimpleDemo,
  'Simple with Description': DSRadioGroupSimpleDescriptionDemo,
  'Block': DSRadioGroupBlockDemo,
  'Block with Description': DSRadioGroupBlockDescriptionDemo,
  'Horizontal': DSRadioGroupHorizontalDemo,
  'Error State': DSRadioGroupErrorDemo,
  'Disabled': DSRadioGroupDisabledDemo,
};

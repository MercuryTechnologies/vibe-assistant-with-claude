import { useParams } from 'react-router-dom';

// Import individual demo components for direct access
import {
  DSButtonSmallDemo,
  DSButtonLargeDemo,
} from '@/lib/component-registry/demos/button-demos';

import {
  DSTextInputDefaultDemo,
  DSComboboxDefaultDemo,
  DSCheckboxDefaultDemo,
  DSRadioGroupDefaultDemo,
} from '@/lib/component-registry/demos/form-demos';

import {
  DSTableDefaultDemo,
  DSTableInteractiveDemo,
} from '@/lib/component-registry/demos/table-demos';

import {
  GroupedTableDefaultDemo,
} from '@/lib/component-registry/demos/grouped-table-demos';

import {
  FilterMenuDefaultDemo,
  InlineComboboxDefaultDemo,
} from '@/lib/component-registry/demos/filter-demos';

import {
  DSTableToolbarTransactionsDemo,
  GroupByButtonDefaultDemo,
  SortButtonDefaultDemo,
  MonthlySummaryDefaultDemo,
} from '@/lib/component-registry/demos/toolbar-demos';

import { Badge } from '@/components/ui/badge';

// Map of component IDs to their demo components for visual tests
const demoComponentMap: Record<string, Record<string, React.ComponentType>> = {
  'ds-button': {
    'small': DSButtonSmallDemo,
    'large': DSButtonLargeDemo,
    'all': () => (
      <div className="space-y-8">
        <DSButtonSmallDemo />
        <DSButtonLargeDemo />
      </div>
    ),
  },
  'ds-text-input': {
    'default': DSTextInputDefaultDemo,
    'all': DSTextInputDefaultDemo,
  },
  'ds-combobox': {
    'default': DSComboboxDefaultDemo,
    'all': DSComboboxDefaultDemo,
  },
  'ds-checkbox': {
    'default': DSCheckboxDefaultDemo,
    'all': DSCheckboxDefaultDemo,
  },
  'ds-radio-group': {
    'default': DSRadioGroupDefaultDemo,
    'all': DSRadioGroupDefaultDemo,
  },
  'ds-table': {
    'default': DSTableDefaultDemo,
    'interactive': DSTableInteractiveDemo,
    'all': () => (
      <div className="space-y-8">
        <DSTableDefaultDemo />
        <DSTableInteractiveDemo />
      </div>
    ),
  },
  'grouped-table': {
    'default': GroupedTableDefaultDemo,
    'all': GroupedTableDefaultDemo,
  },
  'filter-menu': {
    'default': FilterMenuDefaultDemo,
    'all': FilterMenuDefaultDemo,
  },
  'inline-combobox': {
    'default': InlineComboboxDefaultDemo,
    'all': InlineComboboxDefaultDemo,
  },
  'ds-table-toolbar': {
    'default': DSTableToolbarTransactionsDemo,
    'all': DSTableToolbarTransactionsDemo,
  },
  'group-by-button': {
    'default': GroupByButtonDefaultDemo,
    'all': GroupByButtonDefaultDemo,
  },
  'sort-button': {
    'default': SortButtonDefaultDemo,
    'all': SortButtonDefaultDemo,
  },
  'monthly-summary': {
    'default': MonthlySummaryDefaultDemo,
    'all': MonthlySummaryDefaultDemo,
  },
  'badge': {
    'all': () => (
      <div className="flex flex-wrap gap-2">
        <Badge type="neutral">Neutral</Badge>
        <Badge type="pearl">Pearl</Badge>
        <Badge type="highlight">Highlight</Badge>
        <Badge type="success">Success</Badge>
        <Badge type="warning">Warning</Badge>
        <Badge type="error">Error</Badge>
        <Badge type="neutral" hasIcon>With Icon</Badge>
        <Badge type="highlight" hasIcon>With Icon</Badge>
        <Badge type="success" hasIcon>With Icon</Badge>
        <Badge type="warning" hasIcon>With Icon</Badge>
        <Badge type="error" hasIcon>With Icon</Badge>
      </div>
    ),
  },
};

/**
 * Visual Test Page - Renders component demos in isolation for Playwright visual testing
 * 
 * Route: /test-components/:componentId/:variant?
 * 
 * Examples:
 * - /test-components/ds-button/all - All button variants
 * - /test-components/ds-button/small - Just small buttons
 * - /test-components/ds-checkbox/all - All checkbox states
 */
export function VisualTestPage() {
  const { componentId, variant = 'all' } = useParams<{ componentId: string; variant?: string }>();

  if (!componentId) {
    return (
      <div className="p-8">
        <h1 className="text-title-main mb-4">Visual Test Components</h1>
        <p className="text-body text-muted-foreground mb-4">
          Available components for visual testing:
        </p>
        <ul className="space-y-2">
          {Object.keys(demoComponentMap).map((id) => (
            <li key={id}>
              <a 
                href={`/test-components/${id}/all`}
                className="text-primary hover:underline"
              >
                {id}
              </a>
              <span className="text-muted-foreground ml-2">
                (variants: {Object.keys(demoComponentMap[id]).join(', ')})
              </span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  const componentDemos = demoComponentMap[componentId];
  
  if (!componentDemos) {
    return (
      <div className="p-8">
        <h1 className="text-title-main text-destructive">Component Not Found</h1>
        <p className="text-body text-muted-foreground">
          No visual test demo found for "{componentId}"
        </p>
      </div>
    );
  }

  const DemoComponent = componentDemos[variant] || componentDemos['all'];

  if (!DemoComponent) {
    return (
      <div className="p-8">
        <h1 className="text-title-main text-destructive">Variant Not Found</h1>
        <p className="text-body text-muted-foreground">
          No demo found for variant "{variant}" of "{componentId}"
        </p>
        <p className="text-body-sm text-muted-foreground mt-2">
          Available variants: {Object.keys(componentDemos).join(', ')}
        </p>
      </div>
    );
  }

  return (
    <div 
      className="p-8 bg-background min-h-screen" 
      data-testid="visual-test-container"
      data-component={componentId}
      data-variant={variant}
    >
      <DemoComponent />
    </div>
  );
}

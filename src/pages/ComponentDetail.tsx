import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  componentRegistry, 
  getComponentById,
  dsTableVariantComponents,
  dsTableDetailPanelVariantComponents,
  inlineComboboxVariantComponents,
  dsTableToolbarVariantComponents,
  dsButtonVariantComponents,
  monthlySummaryVariantComponents,
  dsTextInputVariantComponents,
  dsComboboxVariantComponents,
  dsCheckboxVariantComponents,
  dsRadioGroupVariantComponents,
  chipVariantComponents,
  iconVariantComponents,
  type ComponentInfo
} from '@/lib/component-registry';

export function ComponentDetail() {
  const { componentId } = useParams<{ componentId: string }>();
  
  if (!componentId) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-title-main">Component Not Found</h1>
          <p className="text-body text-muted-foreground mt-2">No component ID provided.</p>
          <Link to="/components" className="text-primary hover:underline mt-4 inline-block">
            ← Back to Components
          </Link>
        </div>
      </div>
    );
  }

  const component = getComponentById(componentRegistry, componentId);

  if (!component) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-title-main">Component Not Found</h1>
          <p className="text-body text-muted-foreground mt-2">
            Component "{componentId}" does not exist.
          </p>
          <Link to="/components" className="text-primary hover:underline mt-4 inline-block">
            ← Back to Components
          </Link>
        </div>
      </div>
    );
  }

  const renderComponentPreview = (info: ComponentInfo) => {
    const Component = info.component;

    return (
      <Card key={info.name} className="overflow-hidden">
        <CardHeader className="bg-muted/50 border-b">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <CardTitle className="text-title-secondary">{info.name}</CardTitle>
                <Badge type="pearl">
                  {info.category}
                </Badge>
              </div>
              <p className="text-body-sm text-muted-foreground">{info.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-3 text-tiny text-muted-foreground">
            <span className="text-tiny-demi">Used in:</span>
            {info.usedIn.map((file, idx) => (
              <Badge key={idx} type="neutral">
                {file}
              </Badge>
            ))}
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-8">
          {info.variants.map((variant, idx) => {
            // For components with stateful demos, use the variant-specific demo component
            let VariantComponent = Component;
            if (info.name === 'DSTable') {
              VariantComponent = dsTableVariantComponents[variant.name] || Component;
            } else if (info.name === 'DSTableDetailPanel') {
              VariantComponent = dsTableDetailPanelVariantComponents[variant.name] || Component;
            } else if (info.name === 'InlineCombobox') {
              VariantComponent = inlineComboboxVariantComponents[variant.name] || Component;
            } else if (info.name === 'DSTableToolbar') {
              VariantComponent = dsTableToolbarVariantComponents[variant.name] || Component;
            } else if (info.name === 'DSButton') {
              VariantComponent = dsButtonVariantComponents[variant.name] || Component;
            } else if (info.name === 'MonthlySummary') {
              VariantComponent = monthlySummaryVariantComponents[variant.name] || Component;
            } else if (info.name === 'DSTextInput') {
              VariantComponent = dsTextInputVariantComponents[variant.name] || Component;
            } else if (info.name === 'DSCombobox') {
              VariantComponent = dsComboboxVariantComponents[variant.name] || Component;
            } else if (info.name === 'DSCheckbox') {
              VariantComponent = dsCheckboxVariantComponents[variant.name] || Component;
            } else if (info.name === 'DSRadioGroup') {
              VariantComponent = dsRadioGroupVariantComponents[variant.name] || Component;
            } else if (info.name === 'Chip') {
              VariantComponent = chipVariantComponents[variant.name] || Component;
            } else if (info.name === 'Icon') {
              VariantComponent = iconVariantComponents[variant.name] || Component;
            }

            return (
              <div key={idx}>
                <div className="mb-3">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-label-demi">{variant.name}</h4>
                  </div>
                  <p className="text-tiny text-muted-foreground">{variant.description}</p>
                </div>

                {/* Component Preview */}
                <div className="rounded-lg border bg-background p-4 overflow-x-auto">
                  {info.name === 'TopNav' ? (
                    <div className="scale-75 origin-top-left w-[133.33%]">
                      <Component {...variant.props} />
                    </div>
                  ) : info.name === 'DSTable' || info.name === 'InlineCombobox' || info.name === 'DSTableToolbar' || info.name === 'DSButton' || info.name === 'MonthlySummary' || info.name === 'DSTextInput' || info.name === 'DSCombobox' || info.name === 'DSCheckbox' || info.name === 'DSRadioGroup' || info.name === 'Chip' || info.name === 'Icon' ? (
                    <VariantComponent />
                  ) : (
                    <Component {...variant.props} />
                  )}
                </div>

                {idx < info.variants.length - 1 && <Separator className="mt-6" />}
              </div>
            );
          })}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="border-b border-border pb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <Link to="/components" className="text-body-sm text-muted-foreground hover:text-foreground mb-2 inline-block">
              ← Back to Components
            </Link>
            <h1 className="text-title-main">{component.name}</h1>
          </div>
        </div>
      </div>

      {/* Component Preview */}
      {renderComponentPreview(component)}
    </div>
  );
}

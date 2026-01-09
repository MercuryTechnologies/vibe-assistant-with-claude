import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { componentRegistry } from '@/lib/component-registry';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSquare } from '@fortawesome/free-regular-svg-icons';
import { faLayerGroup, faPalette, faFont } from '@fortawesome/free-solid-svg-icons';

export function DesignSystemOverview() {
  const uiComponents = componentRegistry.filter(c => c.category === 'ui');
  const coreComponents = componentRegistry.filter(c => c.category === 'core');

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="border-b border-border pb-8">
        <h1 className="text-title-main mb-4">Design System</h1>
        <p className="text-body-lg text-muted-foreground max-w-2xl">
          A comprehensive collection of reusable components, colors, and typography styles 
          that ensure consistency across the Mercury Vibe application.
        </p>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link to="/components/list">
          <Card className="h-full hover:border-primary transition-colors cursor-pointer">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-[#f2f2f7] flex items-center justify-center">
                  <FontAwesomeIcon icon={faLayerGroup} className="w-5 h-5 text-[var(--purple-magic-600)]" />
                </div>
                <CardTitle className="text-title-secondary">Components</CardTitle>
              </div>
              <p className="text-body-sm text-muted-foreground">
                Browse all {componentRegistry.length} reusable components
              </p>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-tiny text-muted-foreground">
                <span>{uiComponents.length} UI</span>
                <span>•</span>
                <span>{coreComponents.length} Core</span>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/colors">
          <Card className="h-full hover:border-primary transition-colors cursor-pointer">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-[#f2f2f7] flex items-center justify-center">
                  <FontAwesomeIcon icon={faPalette} className="w-5 h-5 text-[var(--purple-magic-600)]" />
                </div>
                <CardTitle className="text-title-secondary">Colors</CardTitle>
              </div>
              <p className="text-body-sm text-muted-foreground">
                Explore the complete color palette and semantic tokens
              </p>
            </CardHeader>
          </Card>
        </Link>

        <Link to="/typography">
          <Card className="h-full hover:border-primary transition-colors cursor-pointer">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-[#f2f2f7] flex items-center justify-center">
                  <FontAwesomeIcon icon={faFont} className="w-5 h-5 text-[var(--purple-magic-600)]" />
                </div>
                <CardTitle className="text-title-secondary">Typography</CardTitle>
              </div>
              <p className="text-body-sm text-muted-foreground">
                View all text styles and font configurations
              </p>
            </CardHeader>
          </Card>
        </Link>

        <Link to="/border-radius">
          <Card className="h-full hover:border-primary transition-colors cursor-pointer">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-[#f2f2f7] flex items-center justify-center">
                  <FontAwesomeIcon icon={faSquare} className="w-5 h-5 text-[var(--purple-magic-600)]" />
                </div>
                <CardTitle className="text-title-secondary">Border Radius</CardTitle>
              </div>
              <p className="text-body-sm text-muted-foreground">
                4-tier border radius system for visual consistency
              </p>
            </CardHeader>
          </Card>
        </Link>
      </div>

      {/* Component Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* UI Components */}
        <Card>
          <CardHeader>
            <CardTitle className="text-label-demi">UI Components</CardTitle>
            <p className="text-body-sm text-muted-foreground mt-1">
              Base UI primitives and reusable interface elements
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {uiComponents.slice(0, 5).map((component) => (
                <div key={component.name} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <span className="text-body-sm">{component.name}</span>
                  <Badge type="pearl">{component.variants.length} variants</Badge>
                </div>
              ))}
              {uiComponents.length > 5 && (
                <Link to="/components/list" className="text-body-sm text-primary hover:underline inline-block mt-2">
                  View all {uiComponents.length} UI components →
                </Link>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Core Components */}
        <Card>
          <CardHeader>
            <CardTitle className="text-label-demi">Core Components</CardTitle>
            <p className="text-body-sm text-muted-foreground mt-1">
              Business-specific components for Mercury Vibe
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {coreComponents.slice(0, 5).map((component) => (
                <div key={component.name} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <span className="text-body-sm">{component.name}</span>
                  <Badge type="pearl">{component.variants.length} variants</Badge>
                </div>
              ))}
              {coreComponents.length > 5 && (
                <Link to="/components/list" className="text-body-sm text-primary hover:underline inline-block mt-2">
                  View all {coreComponents.length} core components →
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-label-demi">Design System Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-title-main">{componentRegistry.length}</div>
              <div className="text-tiny text-muted-foreground">Total Components</div>
            </div>
            <div>
              <div className="text-title-main">
                {componentRegistry.reduce((acc, c) => acc + c.variants.length, 0)}
              </div>
              <div className="text-tiny text-muted-foreground">Total Variants</div>
            </div>
            <div>
              <div className="text-title-main">{uiComponents.length}</div>
              <div className="text-tiny text-muted-foreground">UI Components</div>
            </div>
            <div>
              <div className="text-title-main">{coreComponents.length}</div>
              <div className="text-tiny text-muted-foreground">Core Components</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

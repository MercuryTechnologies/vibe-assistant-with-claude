import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { componentRegistry, getComponentId } from '@/lib/component-registry';

export function ComponentGallery() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredComponents = componentRegistry.filter(comp =>
    comp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    comp.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="border-b border-border pb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-title-main">Component Gallery</h1>
          </div>
          <div className="flex items-center gap-2">
            <Badge type="highlight">
              {filteredComponents.length} Components
            </Badge>
            <Badge type="highlight">
              {filteredComponents.reduce((acc, c) => acc + c.variants.length, 0)} Variants
            </Badge>
          </div>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search components..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 max-w-sm"
          />
          <Button variant="outline" onClick={() => setSearchTerm('')}>
            Clear
          </Button>
        </div>
      </div>

      {/* Component List */}
      {filteredComponents.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-body text-muted-foreground">No components found matching "{searchTerm}"</p>
        </Card>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {filteredComponents.map((component) => {
            const componentId = getComponentId(component.name);
            return (
              <Link key={component.name} to={`/components/${componentId}`}>
                <Card className="h-full hover:border-primary transition-colors cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <CardTitle className="text-title-secondary">{component.name}</CardTitle>
                          <Badge type="pearl">
                            {component.category}
                          </Badge>
                        </div>
                        <p className="text-body-sm text-muted-foreground line-clamp-2">
                          {component.description}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-tiny text-muted-foreground">
                      <span className="text-tiny-demi">{component.variants.length} variant{component.variants.length !== 1 ? 's' : ''}</span>
                      {component.usedIn.length > 0 && (
                        <>
                          <span>•</span>
                          <span>Used in {component.usedIn.length} file{component.usedIn.length !== 1 ? 's' : ''}</span>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}

      {/* Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-label-demi">Component Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
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
              <div className="text-title-main">
                {componentRegistry.filter(c => c.category === 'core').length}
              </div>
              <div className="text-tiny text-muted-foreground">Core Components</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

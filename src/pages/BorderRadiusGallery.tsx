import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface RadiusSampleProps {
  name: string;
  value: string;
  tailwindClass: string;
  cssVar: string;
  description: string;
}

function RadiusSample({ name, value, tailwindClass, cssVar, description }: RadiusSampleProps) {
  return (
    <div className="flex items-start gap-6 p-6 bg-[var(--color-bg-secondary)] rounded-lg">
      {/* Visual sample */}
      <div
        className="w-24 h-24 flex-shrink-0 bg-[var(--purple-magic-600)] flex items-center justify-center"
        style={{ borderRadius: value }}
      >
        <span className="text-white text-label-demi">{value}</span>
      </div>
      
      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-2">
          <h3 className="text-title-secondary">{name}</h3>
          <code className="text-tiny bg-[var(--color-bg-tertiary)] px-2 py-1 rounded font-mono">
            {tailwindClass}
          </code>
        </div>
        <p className="text-body text-[var(--neutral-base-600)] mb-3">{description}</p>
        <div className="flex flex-wrap gap-4 text-tiny">
          <div>
            <span className="text-[var(--neutral-base-500)]">CSS Variable:</span>{' '}
            <code className="font-mono text-[var(--neutral-base-700)]">{cssVar}</code>
          </div>
          <div>
            <span className="text-[var(--neutral-base-500)]">Value:</span>{' '}
            <code className="font-mono text-[var(--neutral-base-700)]">{value}</code>
          </div>
        </div>
      </div>
    </div>
  );
}

function ComponentExamples() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-title-secondary">Component Examples</CardTitle>
        <p className="text-body-sm text-[var(--neutral-base-600)] mt-1">
          See how each border radius is applied to common UI elements
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Small - Checkbox example */}
          <div className="space-y-4">
            <h4 className="text-label-demi text-[var(--neutral-base-700)]">Small (4px)</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-sm border-2 border-[var(--purple-magic-600)] bg-[var(--purple-magic-600)] flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-body-sm">Checkbox</span>
              </div>
              <div className="inline-block px-2 py-0.5 rounded-sm bg-[var(--purple-base-100)] text-[var(--purple-magic-600)] text-tiny">
                Small Badge
              </div>
            </div>
          </div>

          {/* Medium - Button example */}
          <div className="space-y-4">
            <h4 className="text-label-demi text-[var(--neutral-base-700)]">Medium (8px)</h4>
            <div className="space-y-3">
              <button className="px-4 py-2 rounded-md bg-[var(--purple-magic-600)] text-white text-label-demi">
                Button
              </button>
              <input 
                type="text" 
                placeholder="Input field" 
                className="w-full px-3 py-2 rounded-md border border-[var(--color-border)] bg-white text-body-sm"
              />
            </div>
          </div>

          {/* Large - Card example */}
          <div className="space-y-4">
            <h4 className="text-label-demi text-[var(--neutral-base-700)]">Large (12px)</h4>
            <div className="p-4 rounded-lg border border-[var(--color-border)] bg-white">
              <div className="text-label-demi">Card Title</div>
              <div className="text-body-sm text-[var(--neutral-base-600)]">Card content</div>
            </div>
          </div>

          {/* Round - Avatar example */}
          <div className="space-y-4">
            <h4 className="text-label-demi text-[var(--neutral-base-700)]">Round (9999px)</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[var(--purple-magic-600)] flex items-center justify-center text-white text-label-demi">
                  JD
                </div>
                <span className="text-body-sm">Avatar</span>
              </div>
              <div className="inline-block px-3 py-1 rounded-full bg-[var(--green-base-100)] text-[var(--green-magic-600)] text-tiny">
                Pill Badge
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TailwindMappingTable() {
  const mappings = [
    { tailwind: 'rounded-none', maps: '0px', description: 'No border radius' },
    { tailwind: 'rounded-xs', maps: '4px (Small)', description: 'Maps to Small' },
    { tailwind: 'rounded-sm', maps: '4px (Small)', description: 'Small: compact elements' },
    { tailwind: 'rounded-md', maps: '8px (Medium)', description: 'Medium: DEFAULT' },
    { tailwind: 'rounded-lg', maps: '12px (Large)', description: 'Large: large containers' },
    { tailwind: 'rounded-xl', maps: '12px (Large)', description: 'Maps to Large' },
    { tailwind: 'rounded-2xl', maps: '12px (Large)', description: 'Maps to Large' },
    { tailwind: 'rounded-3xl', maps: '12px (Large)', description: 'Maps to Large' },
    { tailwind: 'rounded-full', maps: '9999px (Round)', description: 'Circular elements' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-title-secondary">Tailwind Class Mapping</CardTitle>
        <p className="text-body-sm text-[var(--neutral-base-600)] mt-1">
          All Tailwind <code className="bg-[var(--color-bg-tertiary)] px-1 rounded">rounded-*</code> utilities are mapped to the 4-tier system
        </p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[var(--color-border)]">
                <th className="text-label-demi text-[var(--neutral-base-700)] py-3 pr-4">Tailwind Class</th>
                <th className="text-label-demi text-[var(--neutral-base-700)] py-3 pr-4">Maps To</th>
                <th className="text-label-demi text-[var(--neutral-base-700)] py-3">Description</th>
              </tr>
            </thead>
            <tbody>
              {mappings.map((mapping) => (
                <tr key={mapping.tailwind} className="border-b border-[var(--color-border)] last:border-0">
                  <td className="py-3 pr-4">
                    <code className="text-body-sm font-mono bg-[var(--color-bg-secondary)] px-2 py-1 rounded">
                      {mapping.tailwind}
                    </code>
                  </td>
                  <td className="py-3 pr-4 text-body-sm text-[var(--neutral-base-700)]">
                    {mapping.maps}
                  </td>
                  <td className="py-3 text-body-sm text-[var(--neutral-base-600)]">
                    {mapping.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

export function BorderRadiusGallery() {
  const radiusTokens: RadiusSampleProps[] = [
    {
      name: 'Small',
      value: '4px',
      tailwindClass: 'rounded-sm',
      cssVar: '--radius-sm',
      description: 'For compact elements like checkboxes, small badges, and inline tags',
    },
    {
      name: 'Medium',
      value: '8px',
      tailwindClass: 'rounded-md',
      cssVar: '--radius-md',
      description: 'DEFAULT — Most UI elements: buttons, inputs, cards, dropdowns, modals',
    },
    {
      name: 'Large',
      value: '12px',
      tailwindClass: 'rounded-lg',
      cssVar: '--radius-lg',
      description: 'Large containers only when specifically needed: large modal dialogs, feature cards',
    },
    {
      name: 'Round',
      value: '9999px',
      tailwindClass: 'rounded-full',
      cssVar: '--radius-full',
      description: 'Circular elements: avatars, round icon buttons, pills, status indicators',
    },
  ];

  return (
    <div className="space-y-12">
      {/* Header */}
      <div>
        <h1 className="text-title-hero mb-2">Border Radius</h1>
        <p className="text-body-lg text-[var(--neutral-base-600)]">
          A 4-tier border radius system for visual consistency. All border radius values should use one of these 4 defined values.
        </p>
      </div>

      {/* The 4 Radius Values */}
      <section>
        <h2 className="text-title-secondary mb-6">The 4 Border Radius Values</h2>
        <div className="space-y-4">
          {radiusTokens.map((token) => (
            <RadiusSample key={token.name} {...token} />
          ))}
        </div>
      </section>

      {/* Component Examples */}
      <section>
        <ComponentExamples />
      </section>

      {/* Tailwind Mapping */}
      <section>
        <TailwindMappingTable />
      </section>

      {/* Usage Guidelines */}
      <Card className="bg-[var(--color-bg-secondary)]">
        <CardHeader>
          <CardTitle className="text-title-secondary">Usage Guidelines</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Do's */}
            <div>
              <h3 className="text-label-demi text-[var(--green-magic-600)] mb-3 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Do
              </h3>
              <ul className="space-y-2 text-body text-[var(--neutral-base-600)]">
                <li>• Use <code className="bg-[var(--color-bg-tertiary)] px-1 rounded">rounded-md</code> as your default choice</li>
                <li>• Use <code className="bg-[var(--color-bg-tertiary)] px-1 rounded">rounded-full</code> for all circular elements</li>
                <li>• Use <code className="bg-[var(--color-bg-tertiary)] px-1 rounded">rounded-sm</code> for compact inline elements</li>
                <li>• Keep consistent radii on similar components</li>
              </ul>
            </div>

            {/* Don'ts */}
            <div>
              <h3 className="text-label-demi text-[var(--red-magic-600)] mb-3 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Don't
              </h3>
              <ul className="space-y-2 text-body text-[var(--neutral-base-600)]">
                <li>• Don't use arbitrary values like <code className="bg-[var(--color-bg-tertiary)] px-1 rounded">rounded-[10px]</code></li>
                <li>• Don't use <code className="bg-[var(--color-bg-tertiary)] px-1 rounded">rounded-xl</code> or <code className="bg-[var(--color-bg-tertiary)] px-1 rounded">rounded-2xl</code> — use <code className="bg-[var(--color-bg-tertiary)] px-1 rounded">rounded-lg</code> instead</li>
                <li>• Don't mix different radii on similar components</li>
              </ul>
            </div>
          </div>

          <div className="pt-4 border-t border-[var(--color-border)]">
            <h3 className="text-label-demi mb-2">CSS Variables</h3>
            <p className="text-body text-[var(--neutral-base-600)] mb-3">
              All border radius values are available as CSS variables in <code className="bg-[var(--color-bg-tertiary)] px-1 rounded">src/index.css</code>:
            </p>
            <pre className="bg-[var(--neutral-base-900)] text-[var(--neutral-base-200)] p-4 rounded-lg text-body-sm font-mono overflow-x-auto">
{`--radius-sm: 4px;     /* Small */
--radius-md: 8px;     /* Medium - DEFAULT */
--radius-lg: 12px;    /* Large */
--radius-full: 9999px; /* Round */

/* Alias for shadcn/ui compatibility */
--radius: 8px;`}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

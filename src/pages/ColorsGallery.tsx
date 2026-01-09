import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { colors } from '@/colors';
import { useEffect, useMemo, useState } from 'react';

type ColorFamily = keyof typeof colors;
type ColorSeries = 'base' | 'magic';

interface ColorSwatchProps {
  color: string;
  name: string;
  cssVar?: string;
}

function rgbToHex(color: string): string | null {
  const rgbMatch = color
    .replace(/\s+/g, '')
    .match(/^rgba?\((\d{1,3}),(\d{1,3}),(\d{1,3})(?:,([0-9.]+))?\)$/i);
  if (!rgbMatch) return null;

  const r = Number(rgbMatch[1]);
  const g = Number(rgbMatch[2]);
  const b = Number(rgbMatch[3]);
  if ([r, g, b].some((n) => Number.isNaN(n) || n < 0 || n > 255)) return null;

  const to2 = (n: number) => n.toString(16).padStart(2, '0');
  return `#${to2(r)}${to2(g)}${to2(b)}`.toLowerCase();
}

function useResolvedCssColor(cssVarName?: string) {
  const [hex, setHex] = useState<string | null>(null);

  const cssVar = useMemo(() => {
    if (!cssVarName) return null;
    return cssVarName.startsWith('--') ? cssVarName : `--${cssVarName}`;
  }, [cssVarName]);

  useEffect(() => {
    if (!cssVar) return;

    const resolve = () => {
      const el = document.createElement('span');
      el.style.color = `var(${cssVar})`;
      el.style.position = 'absolute';
      el.style.left = '-9999px';
      el.style.top = '-9999px';
      document.body.appendChild(el);

      const computed = getComputedStyle(el).color;
      document.body.removeChild(el);
      setHex(rgbToHex(computed));
    };

    resolve();

    // Re-resolve when theme toggles (e.g. .dark class changes)
    const root = document.documentElement;
    const observer = new MutationObserver(resolve);
    observer.observe(root, { attributes: true, attributeFilter: ['class', 'style'] });

    return () => observer.disconnect();
  }, [cssVar]);

  return hex;
}

function ColorSwatch({ color, name, cssVar }: ColorSwatchProps) {
  const getContrastColor = (hex: string) => {
    // Simple contrast check - if color is light, use dark text
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return { textColor: brightness > 128 ? '#000' : '#fff', brightness };
  };

  const contrast = getContrastColor(color);

  return (
    <div className="space-y-2">
      <div
        className="ds-color-swatch"
        style={{ backgroundColor: color }}
      >
        <span
          className="text-xs font-medium px-2 py-1 rounded-md"
          style={{
            color: contrast.textColor,
            backgroundColor: contrast.brightness > 128 ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.2)',
          }}
        >
          {color.toUpperCase()}
        </span>
      </div>
      <div>
        <div className="text-label-demi text-[var(--neutral-base-700)]">{name}</div>
        {cssVar && (
          <div className="text-tiny text-[var(--neutral-base-500)] font-mono mt-1">{cssVar}</div>
        )}
        <div className="text-tiny text-[var(--neutral-base-500)] font-mono">{color.toUpperCase()}</div>
      </div>
    </div>
  );
}

function SemanticColorSwatch({
  name,
  cssVar,
  value,
}: {
  name: string;
  cssVar: string;
  value: string;
}) {
  const hex = useResolvedCssColor(cssVar);

  return (
    <div className="space-y-2">
      <div
        className="w-full h-20 rounded-md border border-[var(--color-border)]"
        style={{ backgroundColor: value }}
      />
      <div>
        <div className="text-label-demi text-[var(--neutral-base-700)]">{name}</div>
        <div className="text-tiny text-[var(--neutral-base-500)] font-mono mt-1">{cssVar}</div>
        <div className="text-tiny text-[var(--neutral-base-500)] font-mono">
          {hex ? hex.toUpperCase() : '—'}
        </div>
      </div>
    </div>
  );
}

function ColorFamilySection({ family, series }: { family: ColorFamily; series: ColorSeries }) {
  const familyColors = colors[family][series] as Record<string, any>;
  const familyName = family.charAt(0).toUpperCase() + family.slice(1);
  const seriesName = series === 'magic' ? 'Magic' : 'Base';

  // Filter out alpha objects
  const colorEntries = Object.entries(familyColors).filter(
    ([_, value]) => typeof value === 'string'
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-title-secondary">
          {familyName} {seriesName}
        </CardTitle>
        <p className="text-body-sm text-[var(--neutral-base-600)] mt-1">
          {series === 'magic' 
            ? 'Curated variations for interactive elements and accents'
            : 'Comprehensive gradient from light to dark'}
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {colorEntries.map(([shade, color]) => (
            <ColorSwatch
              key={`${family}-${series}-${shade}`}
              color={color}
              name={`${shade}`}
              cssVar={`--${family}-${series}-${shade}`}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function SemanticColorsSection() {
  const semanticColors = [
    {
      category: 'Primary Colors',
      description: 'Purple Magic series for primary actions and brand elements',
      colors: [
        { name: 'Primary', cssVar: '--color-primary', value: 'var(--color-primary)' },
        { name: 'Primary Hover', cssVar: '--color-primary-hover', value: 'var(--color-primary-hover)' },
        { name: 'Primary Light', cssVar: '--color-primary-light', value: 'var(--color-primary-light)' },
        { name: 'Primary Dark', cssVar: '--color-primary-dark', value: 'var(--color-primary-dark)' },
      ],
    },
    {
      category: 'Status Colors',
      description: 'Semantic colors for status indicators',
      colors: [
        { name: 'Success', cssVar: '--color-success', value: 'var(--color-success)' },
        { name: 'Warning', cssVar: '--color-warning', value: 'var(--color-warning)' },
        { name: 'Error', cssVar: '--color-error', value: 'var(--color-error)' },
        { name: 'Info', cssVar: '--color-info', value: 'var(--color-info)' },
      ],
    },
    {
      category: 'Text Colors',
      description: 'Design System text tokens (from Figma)',
      colors: [
        { name: 'Text Title', cssVar: '--ds-text-title', value: 'var(--ds-text-title)' },
        { name: 'Text Emphasized', cssVar: '--ds-text-emphasized', value: 'var(--ds-text-emphasized)' },
        { name: 'Text Default', cssVar: '--ds-text-default', value: 'var(--ds-text-default)' },
        { name: 'Text Secondary', cssVar: '--ds-text-secondary', value: 'var(--ds-text-secondary)' },
        { name: 'Text Tertiary', cssVar: '--ds-text-tertiary', value: 'var(--ds-text-tertiary)' },
        { name: 'Text Disabled', cssVar: '--ds-text-disabled', value: 'var(--ds-text-disabled)' },
        { name: 'Text Placeholder', cssVar: '--ds-text-placeholder', value: 'var(--ds-text-placeholder)' },
      ],
    },
    {
      category: 'General Backgrounds',
      description: 'Design System background tokens from Figma',
      colors: [
        { name: 'Default', cssVar: '--ds-bg-default', value: 'var(--ds-bg-default)' },
        { name: 'Default Hovered', cssVar: '--ds-bg-default-hovered', value: 'var(--ds-bg-default-hovered)' },
        { name: 'Sidebar', cssVar: '--ds-bg-sidebar', value: 'var(--ds-bg-sidebar)' },
        { name: 'Secondary', cssVar: '--ds-bg-secondary', value: 'var(--ds-bg-secondary)' },
        { name: 'Secondary Hovered', cssVar: '--ds-bg-secondary-hovered', value: 'var(--ds-bg-secondary-hovered)' },
        { name: 'Secondary High Contrast', cssVar: '--ds-bg-secondary-high-contrast', value: 'var(--ds-bg-secondary-high-contrast)' },
        { name: 'Emphasized', cssVar: '--ds-bg-emphasized', value: 'var(--ds-bg-emphasized)' },
        { name: 'Emphasized Hovered', cssVar: '--ds-bg-emphasized-hovered', value: 'var(--ds-bg-emphasized-hovered)' },
        { name: 'Inverted', cssVar: '--ds-bg-inverted', value: 'var(--ds-bg-inverted)' },
      ],
    },
    {
      category: 'Action Backgrounds',
      description: 'Button and interactive element backgrounds',
      colors: [
        { name: 'Primary', cssVar: '--ds-bg-primary', value: 'var(--ds-bg-primary)' },
        { name: 'Primary Hovered', cssVar: '--ds-bg-primary-hovered', value: 'var(--ds-bg-primary-hovered)' },
        { name: 'Destructive', cssVar: '--ds-bg-destructive', value: 'var(--ds-bg-destructive)' },
        { name: 'Destructive Hovered', cssVar: '--ds-bg-destructive-hovered', value: 'var(--ds-bg-destructive-hovered)' },
      ],
    },
    {
      category: 'Status Backgrounds',
      description: 'Status indicator background tints',
      colors: [
        { name: 'Highlight', cssVar: '--ds-bg-highlight', value: 'var(--ds-bg-highlight)' },
        { name: 'Success', cssVar: '--ds-bg-success', value: 'var(--ds-bg-success)' },
        { name: 'Error', cssVar: '--ds-bg-error', value: 'var(--ds-bg-error)' },
        { name: 'Warning', cssVar: '--ds-bg-warning', value: 'var(--ds-bg-warning)' },
      ],
    },
    {
      category: 'Input Backgrounds',
      description: 'Form input state backgrounds',
      colors: [
        { name: 'Input Default', cssVar: '--ds-bg-input-default', value: 'var(--ds-bg-input-default)' },
        { name: 'Input Hovered', cssVar: '--ds-bg-input-hovered', value: 'var(--ds-bg-input-hovered)' },
        { name: 'Input Focused', cssVar: '--ds-bg-input-focused', value: 'var(--ds-bg-input-focused)' },
        { name: 'Input Disabled', cssVar: '--ds-bg-input-disabled', value: 'var(--ds-bg-input-disabled)' },
        { name: 'Input Checked', cssVar: '--ds-bg-input-checked', value: 'var(--ds-bg-input-checked)' },
      ],
    },
    {
      category: 'Role Backgrounds',
      description: 'User role badge backgrounds',
      colors: [
        { name: 'Admin', cssVar: '--ds-bg-role-admin', value: 'var(--ds-bg-role-admin)' },
        { name: 'Custom', cssVar: '--ds-bg-role-custom', value: 'var(--ds-bg-role-custom)' },
        { name: 'Bookkeeper', cssVar: '--ds-bg-role-bookkeeper', value: 'var(--ds-bg-role-bookkeeper)' },
        { name: 'Card Only', cssVar: '--ds-bg-role-card-only', value: 'var(--ds-bg-role-card-only)' },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {semanticColors.map((section) => (
        <Card key={section.category}>
          <CardHeader>
            <CardTitle className="text-title-secondary">{section.category}</CardTitle>
            <p className="text-body-sm text-[var(--neutral-base-600)] mt-1">
              {section.description}
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {section.colors.map((color) => (
                <SemanticColorSwatch
                  key={color.name}
                  name={color.name}
                  cssVar={color.cssVar}
                  value={color.value}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function ColorsGallery() {
  const colorFamilies: ColorFamily[] = ['neutral', 'purple', 'beige', 'blue', 'red', 'orange', 'green'];

  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-title-hero mb-2">Color System</h1>
        <p className="text-body-lg text-[var(--neutral-base-600)]">
          Complete color palette from the Figma Design System. Use foundational colors to create semantic colors for your application.
        </p>
      </div>

      {/* Semantic Colors */}
      <section>
        <h2 className="text-title-secondary mb-6">Semantic Colors</h2>
        <SemanticColorsSection />
      </section>

      {/* Foundational Colors */}
      <section>
        <h2 className="text-title-secondary mb-6">Foundational Colors</h2>
        <div className="space-y-8">
          {colorFamilies.map((family) => (
            <div key={family} className="space-y-6">
              <ColorFamilySection family={family} series="base" />
              <ColorFamilySection family={family} series="magic" />
            </div>
          ))}
        </div>
      </section>

      {/* Usage Guidelines */}
      <Card className="bg-[var(--color-bg-secondary)]">
        <CardHeader>
          <CardTitle className="text-title-secondary">Usage Guidelines</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-body">
          <div>
            <h3 className="text-label-demi mb-2">Base Series</h3>
            <p className="text-[var(--neutral-base-600)]">
              Use for backgrounds, surfaces, and neutral elements. Provides a comprehensive gradient from light to dark shades.
            </p>
          </div>
          <div>
            <h3 className="text-label-demi mb-2">Magic Series</h3>
            <p className="text-[var(--neutral-base-600)]">
              Use for interactive elements, accents, and brand colors. Curated variations optimized for UI components.
            </p>
          </div>
          <div>
            <h3 className="text-label-demi mb-2">CSS Variables</h3>
            <p className="text-[var(--neutral-base-600)]">
              All colors are available as CSS variables. Use semantic color variables (e.g., <code className="bg-[var(--color-bg-tertiary)] px-1 rounded-md">--color-primary</code>) for consistent theming.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

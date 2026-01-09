# Color System Documentation

This document describes the foundational color system extracted from Figma and how to use it to create semantic colors for your application.

## Foundational Colors

The color system is organized into **7 color families**, each with **2 series**:

### Color Families
1. **Neutral** - Grays and near-blacks
2. **Purple** - Purple tones
3. **Beige** - Warm, earthy tones
4. **Blue** - Blue tones
5. **Red** - Red tones
6. **Orange** - Orange tones
7. **Green** - Green tones

### Color Series

Each color family has two series:

#### Base Series
A comprehensive gradient from light to dark:
- `000` - Pure white (for most families)
- `50`, `100`, `150` - Very light tints
- `200`, `300`, `400` - Light to medium shades
- `500`, `600`, `700` - Medium to dark shades
- `800`, `900`, `950`, `1000` - Very dark shades

#### Magic Series
Curated "Light" and "Dark" variations:
- `200`, `300`, `400` - Light variations
- `600`, `700`, `800` - Dark variations

## Usage

### In TypeScript/JavaScript

Import the color system:

```typescript
import { colors, getColor } from '@/colors';

// Access specific colors
const primaryColor = colors.purple.magic[600]; // '#5266eb'
const neutralBg = colors.neutral.base[100]; // '#f4f5f9'

// Use the helper function
const textColor = getColor('neutral', 'base', 900); // '#1e1e2a'
```

### In CSS

All foundational colors are available as CSS variables:

```css
/* Neutral Base */
background-color: var(--neutral-base-100);
color: var(--neutral-base-900);

/* Purple Magic */
border-color: var(--purple-magic-600);

/* Blue Base */
background-color: var(--blue-base-50);
```

### Semantic Colors

Semantic colors are mapped from foundational colors and available as CSS variables:

#### Primary Colors (Purple Magic)
- `--color-primary` → `--purple-magic-600`
- `--color-primary-hover` → `--purple-magic-700`
- `--color-primary-light` → `--purple-magic-400`
- `--color-primary-dark` → `--purple-magic-800`

#### Background Colors (Design System - `--ds-bg-*`)

**General Backgrounds:**
- `--ds-bg-default` → `--neutral-base-0` (light) / `--neutral-base-950` (dark)
- `--ds-bg-default-hovered` → `--neutral-magic-600-alpha2` (light) / `--neutral-magic-400-alpha1` (dark)
- `--ds-bg-sidebar` → `--neutral-base-50` (light) / `--neutral-base-1000` (dark)
- `--ds-bg-secondary` → `--neutral-magic-600-alpha3` (light) / `--neutral-magic-400-alpha2` (dark)
- `--ds-bg-secondary-hovered` → `--neutral-magic-600-alpha4` (light) / `--neutral-magic-400-alpha3` (dark)
- `--ds-bg-secondary-high-contrast` → `--neutral-magic-600-alpha4` (light) / `--neutral-magic-400-alpha4` (dark)
- `--ds-bg-emphasized` → `--purple-magic-600-alpha3` (light) / `--purple-magic-400-alpha3` (dark)
- `--ds-bg-emphasized-hovered` → `--purple-magic-600-alpha4` (light) / `--purple-magic-400-alpha4` (dark)
- `--ds-bg-inverted` → `--neutral-base-900` (light) / `--neutral-base-700` (dark)

**Action/Button Backgrounds:**
- `--ds-bg-primary` → `--purple-magic-600` (both modes)
- `--ds-bg-primary-hovered` → `--purple-magic-700` (both modes)

**Status Backgrounds (alpha-based tints):**
- `--ds-bg-highlight` → `--blue-magic-600-alpha3` (light) / `--blue-magic-400-alpha3` (dark)
- `--ds-bg-success` → `--green-magic-600-alpha3` (light) / `--green-magic-400-alpha3` (dark)
- `--ds-bg-error` → `--red-magic-600-alpha3` (light) / `--red-magic-400-alpha3` (dark)
- `--ds-bg-warning` → `--orange-magic-600-alpha3` (light) / `--orange-magic-400-alpha3` (dark)
- `--ds-bg-destructive` → `--red-magic-600-alpha3` (light) / `--red-magic-400-alpha3` (dark)
- `--ds-bg-destructive-hovered` → `--red-magic-600-alpha4` (light) / `--red-magic-400-alpha4` (dark)

**Input Backgrounds:**
- `--ds-bg-input-default` → `--neutral-base-50` (light) / `--neutral-magic-400-alpha1` (dark)
- `--ds-bg-input-hovered` → `--neutral-base-0` (light) / `--neutral-magic-400-alpha2` (dark)
- `--ds-bg-input-focused` → `--neutral-base-0` (light) / `--neutral-magic-400-alpha2` (dark)
- `--ds-bg-input-disabled` → `--neutral-base-100` (light) / `--neutral-base-800` (dark)
- `--ds-bg-input-checked` → `--purple-magic-600` (both modes)

**Role Backgrounds:**
- `--ds-bg-role-admin` → `--blue-base-200` (light) / `--blue-base-700` (dark)
- `--ds-bg-role-custom` → `--purple-base-200` (light) / `--purple-base-700` (dark)
- `--ds-bg-role-bookkeeper` → `--neutral-base-200` (light) / `--neutral-base-700` (dark)
- `--ds-bg-role-card-only` → `--green-base-200` (light) / `--green-base-700` (dark)

#### Text Colors (Neutral Base)
- `--color-text-primary` → `--neutral-base-900` (light) / `--neutral-base-0` (dark)
- `--color-text-secondary` → `--neutral-base-600` (light) / `--neutral-base-400` (dark)
- `--color-text-muted` → `--neutral-base-500` (light) / `--neutral-base-500` (dark)

#### Status Colors
- `--color-success` → `--green-magic-600`
- `--color-warning` → `--orange-magic-600`
- `--color-error` → `--red-magic-600`
- `--color-info` → `--blue-magic-600`

#### Border Colors (Semantic)
All borders should use these semantic border colors:

**Default Borders:**
- `--color-border-default` → `--neutral-magic-600-alpha3` (light) / `--neutral-magic-400-alpha2` (dark)
- `--color-border-emphasized` → `--neutral-magic-600-alpha4` (light) / `--neutral-magic-400-alpha3` (dark)
- `--color-border-on-inverted` → `--neutral-base-700` (light) / `--neutral-magic-400-alpha3` (dark)

**Error Borders:**
- `--color-border-error` → `--red-magic-600-alpha5` (light) / `--red-magic-400-alpha5` (dark)

**Input Borders:**
- `--color-border-input` → `--neutral-magic-600-alpha4` (light) / `--neutral-magic-400-alpha3` (dark)
- `--color-border-input-emphasized` → `--neutral-magic-600-alpha5` (light) / `--neutral-magic-400-alpha5` (dark)
- `--color-border-input-focused` → `--neutral-magic-600-alpha3` (light) / `--neutral-magic-400-alpha4` (dark)
- `--color-border-input-focused-underline` → `--purple-magic-600` (light) / `--purple-magic-400` (dark)
- `--color-border-input-error` → `--red-magic-600-alpha5` (light) / `--red-magic-400-alpha5` (dark)
- `--color-border-input-error-underline` → `--red-magic-600` (light) / `--red-magic-400` (dark)

**Focus Ring:**
- `--color-border-focus-ring` → `--purple-magic-400` (both light and dark)

**Avatar Border:**
- `--color-border-avatar` → `--neutral-magic-600-alpha2` (both light and dark)

**Frosted Border:**
- `--color-border-frosted` → `hsla(0, 0%, 100%, 0.64)` (light) / `--neutral-magic-400-alpha2` (dark)

## Creating Semantic Colors

When creating new semantic colors, follow these guidelines:

1. **Use Base series** for backgrounds, surfaces, and neutral elements
2. **Use Magic series** for interactive elements, accents, and brand colors
3. **Maintain consistency** - use the same shade numbers across families for similar purposes
4. **Consider dark mode** - ensure sufficient contrast in both light and dark themes

### Example: Using Semantic Colors

```css
/* In your component CSS */
.my-component {
  /* Use semantic colors for borders */
  border: 1px solid var(--color-border-default);
  
  /* Use semantic colors for text */
  color: var(--color-text-primary);
  
  /* Use foundational color directly when needed */
  background-color: var(--purple-base-100);
}

/* Input component example */
.input {
  border: 1px solid var(--color-border-input);
}

.input:focus {
  border-color: var(--color-border-input-focused);
  border-bottom-color: var(--color-border-input-focused-underline);
}

.input.error {
  border-color: var(--color-border-input-error);
  border-bottom-color: var(--color-border-input-error-underline);
}
```

## Color Naming Convention

Colors follow this naming pattern:
```
[Family]-[Series]-[Shade]
```

Examples:
- `neutral-base-500` - Neutral family, Base series, shade 500
- `purple-magic-600` - Purple family, Magic series, shade 600
- `blue-base-100` - Blue family, Base series, shade 100

## Alpha Variants

Magic series colors (400 and 600) have alpha variants available:
- `alpha1` through `alpha5` - Increasing opacity levels

These are useful for overlays, hover states, subtle backgrounds, and **borders**.

All alpha variants are available as CSS variables:
- `--[family]-magic-400-alpha[1-5]` (e.g., `--neutral-magic-400-alpha3`)
- `--[family]-magic-600-alpha[1-5]` (e.g., `--purple-magic-600-alpha4`)

**Important:** Always use semantic border colors (`--color-border-*`) instead of directly referencing alpha variants for borders.

## Dark Mode

All semantic colors automatically adapt to dark mode. Foundational colors remain constant, but semantic mappings change:

- Light backgrounds become dark backgrounds
- Dark text becomes light text
- Borders adjust for visibility

## Best Practices

1. **Prefer semantic colors** for UI elements (buttons, text, backgrounds)
2. **Use foundational colors** when you need specific shades
3. **Maintain contrast** - ensure text is readable on backgrounds
4. **Test in both themes** - verify colors work in light and dark mode
5. **Document custom mappings** - if you create new semantic colors, document them

## Complete Color Reference

See `src/colors.ts` for the complete TypeScript color object with all available colors and their hex values.

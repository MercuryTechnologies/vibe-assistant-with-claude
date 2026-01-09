# Typography System

This document describes the complete typography system for Mercury Vibe, based on the Figma Design System.

## Overview

All typography uses the **Arcadia** font family:
- **Arcadia Text** (Variable) - For body text, labels, and most UI
- **Arcadia Display** (480 weight) - For large titles and hero text

## Text Style Reference

### Title Styles

#### `.text-title-hero`
Large hero titles for landing pages and major sections.
- **Font**: Arcadia Display
- **Size**: 34px
- **Weight**: 380
- **Line Height**: 44px
- **Use for**: H1 hero headlines, major page headers

```tsx
<h1 className="text-title-hero">Welcome to Mercury</h1>
```

#### `.text-title-main`
Primary page titles and main headings.
- **Font**: Arcadia Display
- **Size**: 28px
- **Weight**: 380
- **Line Height**: 36px
- **Use for**: H1 page titles, card headers

```tsx
<h1 className="text-title-main">Account Overview</h1>
```

#### `.text-title-secondary`
Section titles and secondary headings.
- **Font**: Arcadia Text
- **Size**: 19px
- **Weight**: 400
- **Line Height**: 28px
- **Use for**: H2 section headers

```tsx
<h2 className="text-title-secondary">Recent Transactions</h2>
```

#### `.text-title-minor`
Subsection titles and tertiary headings.
- **Font**: Arcadia Text
- **Size**: 17px
- **Weight**: 400
- **Line Height**: 28px
- **Use for**: H3 subsection headers, card titles

```tsx
<h3 className="text-title-minor">Payment Details</h3>
```

#### `.text-title-eyebrow`
Small overline titles and labels.
- **Font**: Arcadia Text
- **Size**: 12px
- **Weight**: 480
- **Line Height**: 24px
- **Letter Spacing**: 1px
- **Transform**: UPPERCASE
- **Use for**: Category labels, eyebrow text above titles

```tsx
<p className="text-title-eyebrow">New Feature</p>
```

---

### Body Text Styles

#### `.text-body-lg` / `.text-body-lg-demi`
Large body text for emphasis.
- **Font**: Arcadia Text
- **Size**: 17px
- **Weight**: 400 (regular) / 480 (demi)
- **Line Height**: 28px
- **Use for**: Introductory paragraphs, emphasized content

```tsx
<p className="text-body-lg">
  This is important introductory text that deserves emphasis.
</p>
<p className="text-body-lg-demi">
  This is bold introductory text.
</p>
```

#### `.text-body` / `.text-body-demi`
**Default body text** - most common style.
- **Font**: Arcadia Text
- **Size**: 15px
- **Weight**: 400 (regular) / 480 (demi)
- **Line Height**: 24px
- **Use for**: Standard paragraph text, descriptions

```tsx
<p className="text-body">
  This is the default text style for most content.
</p>
<p className="text-body-demi">
  This is bold body text.
</p>
```

#### `.text-body-sm` / `.text-body-sm-demi`
Small body text for secondary information.
- **Font**: Arcadia Text
- **Size**: 14px
- **Weight**: 400 (regular) / 480 (demi)
- **Line Height**: 20px
- **Use for**: Supporting text, captions, secondary descriptions

```tsx
<p className="text-body-sm">
  Additional details or supporting information.
</p>
```

---

### Label & Small Text Styles

#### `.text-label` / `.text-label-demi`
Form labels and metadata.
- **Font**: Arcadia Text
- **Size**: 13px
- **Weight**: 400 (regular) / 480 (demi)
- **Line Height**: 20px
- **Letter Spacing**: 0.1px (regular) / 0.2px (demi)
- **Use for**: Form labels, list metadata, timestamps

```tsx
<label className="text-label" htmlFor="email">
  Email Address
</label>
<span className="text-label-demi">Required</span>
```

#### `.text-tiny` / `.text-tiny-demi`
Very small text.
- **Font**: Arcadia Text
- **Size**: 12px
- **Weight**: 400 (regular) / 480 (demi)
- **Line Height**: 20px
- **Letter Spacing**: 0.2px
- **Use for**: Fine print, helper text, tooltips

```tsx
<span className="text-tiny">
  Last updated 2 minutes ago
</span>
```

#### `.text-micro` / `.text-micro-demi`
Smallest text (uppercase).
- **Font**: Arcadia Text
- **Size**: 10px
- **Weight**: 400 (regular) / 480 (demi)
- **Line Height**: 20px
- **Letter Spacing**: 0.2px
- **Transform**: UPPERCASE
- **Use for**: Badges, tags, legal text, micro-labels

```tsx
<span className="text-micro">Beta</span>
<span className="text-micro-demi">New</span>
```

---

## Underlined Variants

All body, label, tiny, and micro styles have underlined variants available:

- `.text-body-lg-underline` / `.text-body-lg-demi-underline`
- `.text-body-underline` / `.text-body-demi-underline`
- `.text-body-sm-underline` / `.text-body-sm-demi-underline`
- `.text-label-underline` / `.text-label-demi-underline`
- `.text-tiny-demi-underline`
- `.text-micro-demi-underline`

```tsx
<a href="#" className="text-body-underline">
  Link with body text styling
</a>
```

---

## Color System

Typography colors are defined with CSS variables that adapt to light/dark mode:

### Light Mode
- `--ds-text-title: #1e1e2a` - For title styles (darkest)
- `--ds-text-emphasized: #1e1e2a` - For emphasized text (same as title in light mode)
- `--ds-text-default: #363644` - For body text (medium)
- `--ds-text-secondary: #535461` - For labels, small text (lighter)
- `--ds-text-tertiary: #70707d` - For tertiary text (de-emphasized)
- `--ds-text-disabled: #9d9da8` - For disabled text
- `--ds-text-placeholder: #9d9da8` - For placeholder text

### Dark Mode
- `--ds-text-title: #ffffff` - White titles
- `--ds-text-emphasized: #ffffff` - Emphasized text (same as title in dark mode)
- `--ds-text-default: #e5e5ea` - Light body text
- `--ds-text-secondary: #a1a1aa` - Muted text
- `--ds-text-tertiary: #70707d` - For tertiary text (de-emphasized)
- `--ds-text-disabled: #535461` - For disabled text
- `--ds-text-placeholder: #535461` - For placeholder text

These colors are automatically applied by the typography classes.

---

## Usage Guidelines

### Hierarchy

Use this hierarchy for proper information architecture:

1. **Page Title**: `.text-title-hero` or `.text-title-main`
2. **Section Headers**: `.text-title-secondary`
3. **Subsection Headers**: `.text-title-minor`
4. **Body Content**: `.text-body-lg` or `.text-body`
5. **Supporting Text**: `.text-body-sm`
6. **Labels/Metadata**: `.text-label`
7. **Fine Print**: `.text-tiny` or `.text-micro`

### Emphasis

- Use **demi** variants (`-demi`) for emphasis within body text
- Use **underline** variants for links and interactive text
- Avoid using both bold AND underline together unless necessary

### Accessibility

- Maintain proper heading hierarchy (don't skip levels)
- Ensure sufficient color contrast (all provided colors meet WCAG AA)
- Don't rely solely on color to convey meaning
- Use semantic HTML elements (`<h1>`, `<h2>`, `<p>`, etc.)

### Responsive Considerations

Current styles are fixed-size. For responsive designs, consider:

```css
/* Mobile override example */
@media (max-width: 768px) {
  .text-title-hero {
    font-size: 28px;
    line-height: 36px;
  }
}
```

---

## Quick Reference Table

| Class | Font | Size | Weight | Line Height | Use Case |
|-------|------|------|--------|-------------|----------|
| `.text-title-hero` | Display | 34px | 380 | 44px | Hero headlines |
| `.text-title-main` | Display | 28px | 380 | 36px | Page titles |
| `.text-title-secondary` | Text | 19px | 400 | 28px | Section headers |
| `.text-title-minor` | Text | 17px | 400 | 28px | Subsection headers |
| `.text-title-eyebrow` | Text | 12px | 480 | 24px | Overline labels |
| `.text-body-lg` | Text | 17px | 400 | 28px | Emphasized body |
| `.text-body` | Text | 15px | 400 | 24px | **Default body** |
| `.text-body-sm` | Text | 14px | 400 | 20px | Secondary text |
| `.text-label` | Text | 13px | 400 | 20px | Form labels |
| `.text-tiny` | Text | 12px | 400 | 20px | Fine print |
| `.text-micro` | Text | 10px | 400 | 20px | Micro text |

**Note**: All styles except titles have `-demi` (weight 480) variants available.

---

## Examples

### Complete Card Example

```tsx
<div className="card">
  <p className="text-title-eyebrow">Premium Account</p>
  <h2 className="text-title-main">Mercury Checking</h2>
  <p className="text-body">
    Your primary business checking account with unlimited transactions.
  </p>
  <div className="flex gap-4">
    <div>
      <span className="text-label">Balance</span>
      <p className="text-body-lg-demi">$125,750.42</p>
    </div>
    <div>
      <span className="text-label">Account</span>
      <p className="text-body-sm">****1234</p>
    </div>
  </div>
  <span className="text-tiny">Last updated today at 2:34 PM</span>
</div>
```

### Form Example

```tsx
<form>
  <div>
    <label htmlFor="amount" className="text-label-demi">
      Transfer Amount
    </label>
    <input id="amount" type="text" />
    <span className="text-tiny">Enter amount in USD</span>
  </div>
  <button type="submit" className="text-body-demi">
    Transfer Funds
  </button>
</form>
```

---

## Migration Guide

If migrating from existing typography, use this mapping:

| Old Style | New Style |
|-----------|-----------|
| `text-4xl font-bold` | `.text-title-hero` |
| `text-3xl font-bold` | `.text-title-main` |
| `text-xl` | `.text-title-secondary` |
| `text-lg` | `.text-body-lg` |
| `text-base` | `.text-body` ← **Default** |
| `text-sm` | `.text-body-sm` |
| `text-xs` | `.text-label` or `.text-tiny` |

---

## Files

- **Font declarations**: `src/fonts.css`
- **Typography classes**: `src/typography.css`
- **Font files**: `public/fonts/Arcadia*.woff2`
- **Design tokens**: `src/index.css` (CSS variables)
